<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Table;
use App\Models\GuestMember;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index(Event $event)
    {
        $this->authorize('update', $event);

        $event->load(['tables.members.table', 'guestGroups.members']);

        // Get all members that don't have a table assigned
        $unassignedMembers = GuestMember::whereHas('group', function ($query) use ($event) {
            $query->where('event_id', $event->id);
        })
            ->whereNull('table_id')
            ->get();

        return Inertia::render('Events/Tables', [
            'event' => $event,
            'unassignedMembers' => $unassignedMembers
        ]);
    }

    public function store(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        $event->tables()->create($validated);

        return back()->with('success', 'Mesa creada.');
    }

    public function assignMember(Request $request, Event $event, Table $table)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'member_id' => 'required|exists:guest_members,id',
        ]);

        $member = GuestMember::findOrFail($validated['member_id']);

        // Ensure the member belongs to this event
        if ($member->group->event_id !== $event->id) {
            abort(403);
        }

        $member->update(['table_id' => $table->id]);

        return back()->with('success', 'Invitado asignado a mesa.');
    }

    public function unassignMember(Request $request, Event $event, GuestMember $member)
    {
        $this->authorize('update', $event);

        if ($member->group->event_id !== $event->id) {
            abort(403);
        }

        $member->update(['table_id' => null]);

        return back()->with('success', 'Invitado removido de la mesa.');
    }

    public function destroy(Event $event, Table $table)
    {
        $this->authorize('update', $event);

        if ($table->event_id !== $event->id) {
            abort(403);
        }

        $table->delete();

        return back()->with('success', 'Mesa eliminada.');
    }
}
