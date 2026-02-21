<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventCheckInController extends Controller
{
    /**
     * Show the Check-In scanner page.
     */
    public function index(Event $event)
    {
        $this->authorize('view', $event);

        return Inertia::render('Events/CheckIn', [
            'event' => $event
        ]);
    }

    /**
     * Validate a QR code (guest group slug).
     */
    public function validateGuest(Request $request, Event $event)
    {
        $this->authorize('view', $event);

        $validated = $request->validate([
            'slug' => 'required|string',
        ]);

        $group = GuestGroup::where('event_id', $event->id)
            ->where('slug', $validated['slug'])
            ->with([
                'members.table',
                'checkInLogs' => function ($q) {
                    $q->latest()->limit(5);
                }
            ])
            ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Código QR no válido para este evento.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'group' => [
                'id' => $group->id,
                'name' => $group->group_name,
                'status' => $group->status,
                'total_passes' => $group->total_passes,
                'is_checked_in' => (bool) $group->is_checked_in,
                'logs' => $group->checkInLogs,
                'members' => $group->members->map(function ($member) {
                    return [
                        'name' => $member->name,
                        'table' => $member->table ? $member->table->name : 'Sin mesa asignada',
                        'is_attending' => $member->is_attending
                    ];
                })
            ]
        ]);
    }

    /**
     * Toggle Entry/Exit for a guest group.
     */
    public function toggleCheckIn(Request $request, Event $event, GuestGroup $guestGroup)
    {
        $this->authorize('view', $event);

        if ($guestGroup->event_id !== $event->id) {
            abort(403);
        }

        $type = $guestGroup->is_checked_in ? 'exit' : 'entry';

        $guestGroup->checkInLogs()->create([
            'type' => $type,
            'logged_at' => now(),
        ]);

        $guestGroup->update([
            'is_checked_in' => !$guestGroup->is_checked_in
        ]);

        return response()->json([
            'success' => true,
            'is_checked_in' => $guestGroup->is_checked_in,
            'message' => $type === 'entry' ? 'Ingreso registrado.' : 'Salida registrada.'
        ]);
    }
}
