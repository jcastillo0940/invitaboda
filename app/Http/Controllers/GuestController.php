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
            'members' => 'nullable|array',
            'members.*.name' => 'required_with:members|string|max:255',
        ]);

        $group = GuestGroup::create([
            'event_id' => $event->id,
            'group_name' => $validated['group_name'],
            'slug' => Str::slug($validated['group_name']) . '-' . Str::random(5),
            'total_passes' => $validated['total_passes'],
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
}
