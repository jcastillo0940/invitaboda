<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use App\Models\Design;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('user_id', auth()->id())->latest()->get();
        return Inertia::render('Events/Index', [
            'events' => $events
        ]);
    }

    public function edit(Event $event)
    {
        $this->authorize('update', $event);

        $event->load('design');

        return Inertia::render('Events/Editor', [
            'event' => $event,
            'designs' => Design::where('is_active', true)->get(['id', 'name', 'slug', 'thumbnail', 'is_premium']),
        ]);
    }

    public function updateDesign(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'template_name' => 'required|string',
            'design_data' => 'required|array',
        ]);

        $event->design()->updateOrCreate(
            ['event_id' => $event->id],
            [
                'template_name' => $validated['template_name'],
                'design_data' => $validated['design_data'],
            ]
        );

        return back()->with('success', 'Diseño guardado correctamente.');
    }

    public function guests(Event $event)
    {
        $this->authorize('view', $event);

        $event->load(['guestGroups.members']);

        // Basic Stats
        $stats = [
            'total_groups' => $event->guestGroups->count(),
            'total_guests' => $event->guestGroups->sum('total_passes'),
            'confirmed_guests' => $event->guestGroups->where('status', 'confirmed')->sum('total_passes'),
            'pending_guests' => $event->guestGroups->where('status', 'pending')->sum('total_passes'),
        ];

        return Inertia::render('Events/Guests', [
            'event' => $event,
            'stats' => $stats
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
        ]);

        $event = Event::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . rand(1000, 9999),
            'date' => $validated['date'],
            'is_premium' => false,
            'settings' => [],
        ]);

        return redirect()->route('events.index')->with('success', 'Evento creado con éxito.');
    }

    public function update(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $event->update([
            'settings' => array_merge($event->settings ?? [], $validated['settings'])
        ]);

        return back()->with('success', 'Configuración actualizada.');
    }

    public function showPublic($event_slug)
    {
        $event = Event::with('design')->where('slug', $event_slug)->firstOrFail();

        $guest_group_slug = request('g');
        $guestGroup = null;

        if ($guest_group_slug) {
            $guestGroup = GuestGroup::with('members')
                ->where('event_id', $event->id)
                ->where('slug', $guest_group_slug)
                ->first();
        }

        return Inertia::render('Public/Invitation', [
            'event' => $event,
            'guestGroup' => $guestGroup
        ]);
    }
}
