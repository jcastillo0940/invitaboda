<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use App\Models\Design;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // Necesario para usar $this->authorize

class EventController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $user = auth()->user();
        $events = Event::where('user_id', $user->id)->latest()->get();
        
        return Inertia::render('Events/Index', [
            'events' => $events,
            // Enviamos el permiso al frontend para bloquear el botón proactivamente
            'canCreate' => $user->can('create', Event::class),
        ]);
    }

    public function create()
    {
        // Verifica la Policy y lanza una excepción 403 con el mensaje personalizado de la Policy
        $this->authorize('create', Event::class);

        return Inertia::render('Events/Create');
    }

    public function store(Request $request)
    {
        // Doble verificación de seguridad
        $this->authorize('create', Event::class);

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

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);
        
        $event->delete();

        return redirect()->route('events.index')->with('success', 'Evento eliminado correctamente.');
    }

    public function guests(Event $event)
    {
        $this->authorize('view', $event);

        $event->load(['guestGroups.members']);

        // Estadísticas básicas para la vista de invitados
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