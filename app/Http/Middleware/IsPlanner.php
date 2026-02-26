<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsPlanner
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Permitimos el acceso si es 'planner' o si es 'admin'
        if (auth()->check() && in_array(auth()->user()->role, ['planner', 'admin'])) {
            return $next($request);
        }

        return redirect('/dashboard')->with('error', 'No tienes permisos de Agencia para acceder a esta área.');
    }
}