<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanFeature
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Acceso denegado.');
        }

        // Gracias a la transacción del Paso 1, esta relación siempre devolverá un objeto Subscription
        $subscription = $user->activeSubscription;

        // Validamos si la característica solicitada está en false en el plan
        if (!$subscription || !$subscription->plan->{$feature}) {
            // Respuestas compatibles con llamadas Axios/React y navegaciones estándar
            if ($request->wantsJson() || $request->isXmlHttpRequest()) {
                return response()->json(['message' => 'Tu plan actual no incluye esta función. ¡Mejora tu plan para acceder!'], 403);
            }
            
            return back()->withErrors(['error' => 'Tu plan actual no incluye esta función. ¡Mejora tu plan para acceder!']);
        }

        return $next($request);
    }
}