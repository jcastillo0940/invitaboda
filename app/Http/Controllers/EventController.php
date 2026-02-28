<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use App\Models\Design;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EventController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $user = auth()->user();
        $events = Event::where('user_id', $user->id)->latest()->get();
        
        return Inertia::render('Events/Index', [
            'events' => $events,
            'canCreate' => $user->can('create', Event::class),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Event::class);

        return Inertia::render('Events/Create');
    }

    public function store(Request $request)
    {
        // Doble verificación de seguridad
        $this->authorize('create', Event::class);

        // --- INICIO DE PROTECCIÓN DE LÍMITES (CUOTAS) ---
        if (!\App\Services\QuotaService::canCreateEvent($request->user())) {
            return back()->withErrors(['error' => 'Has alcanzado el límite de eventos permitidos en tu plan. ¡Mejora tu suscripción para crear más!']);
        }
        // --- FIN DE PROTECCIÓN ---

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
        ]);

        $event = Event::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']) . '-' . rand(1000, 9999),
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

        // --- INICIO DE PROTECCIÓN PREMIUM ---
        // Verificamos si la plantilla solicitada existe y es premium
        $design = Design::where('slug', $validated['template_name'])->first();

        if ($design && $design->is_premium) {
            $subscription = $request->user()->activeSubscription;
            
            // Si no tiene plan activo, o su plan no incluye 'feature_custom_site' (diseños premium), bloqueamos
            if (!$subscription || !$subscription->plan->feature_custom_site) {
                return back()->withErrors(['error' => 'Este diseño es Premium. ¡Mejora tu plan para utilizarlo!']);
            }
        }
        // --- FIN DE PROTECCIÓN PREMIUM ---

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
        $guest_group_slug = request('g');

        // 1. Candado 1: Si no hay token en la URL, error 404 (anti-curiosos)
        if (!$guest_group_slug) {
            abort(404);
        }

        $event = Event::with('design')->where('slug', $event_slug)->firstOrFail();

        // 2. Candado 1.5: Validar que el token pertenezca estrictamente a este evento
        $guestGroup = GuestGroup::with('members')
            ->where('event_id', $event->id)
            ->where('slug', $guest_group_slug)
            ->first();

        if (!$guestGroup) {
            abort(404);
        }

        // 3. Candado 2: Lógica del PIN Opcional
        $settings = $event->settings ?? [];
        $requiresPin = $settings['require_pin'] ?? false;
        $eventPin = $settings['pin'] ?? null;

        if ($requiresPin && !empty($eventPin)) {
            // Verificamos si la sesión ya está autorizada
            if (!session('pin_verified_' . $event->id)) {
                // Bloqueo: Renderizamos la pantalla de PIN. 
                // NO enviamos datos sensibles de la boda aquí.
                return Inertia::render('Public/PinEntry', [
                    'event_slug' => $event->slug,
                    'event_name' => $event->name,
                    'g' => $guest_group_slug
                ]);
            }
        }

        // 4. Acceso Concedido: Renderizamos la invitación completa
        return Inertia::render('Public/Invitation', [
            'event' => $event,
            'guestGroup' => $guestGroup
        ]);
    }

    // MÉTODO NUEVO: Validar el PIN ingresado
    public function verifyPin(Request $request, $event_slug)
    {
        $request->validate([
            'pin' => 'required|string',
            'g' => 'required|string'
        ]);

        $event = Event::where('slug', $event_slug)->firstOrFail();
        $settings = $event->settings ?? [];
        $realPin = $settings['pin'] ?? null;

        if ($realPin && $request->pin === (string) $realPin) {
            // Guardamos el pase de acceso en la sesión del navegador
            session(['pin_verified_' . $event->id => true]);
            
            // Redirigimos a la boda, manteniendo el token en la URL
            return redirect()->route('event.public', [
                'event_slug' => $event->slug, 
                'g' => $request->g
            ]);
        }

        return back()->withErrors(['pin' => 'El PIN ingresado es incorrecto.']);
    }
}