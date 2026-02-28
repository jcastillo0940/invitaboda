<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                // --- INICIO DE INTEGRACIÓN SAAS (PASO 4) ---
                // Enviamos la suscripción activa y los límites del plan de forma segura
                'subscription' => $user ? $user->activeSubscription : null,
                'plan' => $user && $user->activeSubscription ? $user->activeSubscription->plan : null,
                // --- FIN DE INTEGRACIÓN SAAS ---
            ],
        ];
    }
}