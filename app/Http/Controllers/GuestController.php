<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    public function store(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'group_name' => 'required|string|max:255',
            'total_passes' => 'required|integer|min:1',
            'contact_phone' => 'nullable|string|max:20',
            'members' => 'nullable|array',
            'members.*.name' => 'required_with:members|string|max:255',
        ]);

        $group = GuestGroup::create([
            'event_id' => $event->id,
            'group_name' => $validated['group_name'],
            'slug' => Str::slug($validated['group_name']) . '-' . Str::random(5),
            'total_passes' => $validated['total_passes'],
            'contact_phone' => $validated['contact_phone'],
            'status' => 'pending',
        ]);

        if (!empty($validated['members'])) {
            foreach ($validated['members'] as $memberData) {
                if (!empty($memberData['name'])) {
                    $group->members()->create([
                        'name' => $memberData['name'],
                        'is_attending' => true,
                    ]);
                }
            }
        }

        return back()->with('success', 'Invitado registrado correctamente.');
    }

    public function destroy(Event $event, GuestGroup $guestGroup)
    {
        $this->authorize('update', $event);

        if ($guestGroup->event_id !== $event->id) {
            abort(403);
        }

        $guestGroup->delete();

        return back()->with('success', 'Invitado eliminado.');
    }

    // --- NUEVO MÉTODO PARA EXPORTACIÓN SEGURA DE DATOS (PUNTO 7) ---
    public function export(Event $event)
    {
        // 1. Auditoría de seguridad: Solo el dueño o admin puede exportar
        $this->authorize('view', $event);

        $fileName = 'invitados-' . $event->slug . '-' . date('Y-m-d') . '.csv';
        $groups = GuestGroup::with('members')->where('event_id', $event->id)->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Grupo Familiar', 'Pases Totales', 'Pases Confirmados', 'Teléfono', 'Estado', 'Nombres de Confirmados'];

        $callback = function() use($groups, $columns) {
            $file = fopen('php://output', 'w');
            
            // BOM para que Excel lea caracteres latinos (acentos/ñ) correctamente
            fputs($file, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF)));
            fputcsv($file, $columns);

            foreach ($groups as $group) {
                $confirmedCount = $group->members->where('is_attending', true)->count();
                $names = $group->members->where('is_attending', true)->pluck('name')->implode(', ');

                $row = [
                    $group->group_name,
                    $group->total_passes,
                    $group->status === 'confirmed' ? $confirmedCount : 0,
                    $group->contact_phone ?? 'N/A',
                    ucfirst($group->status),
                    $names
                ];

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}