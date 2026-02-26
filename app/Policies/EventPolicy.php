<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EventPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): Response
    {
        // 1. Los administradores siempre pueden crear eventos
        if ($user->role === 'admin') {
            return Response::allow();
        }

        // 2. Las agencias (planners) DEBEN tener una suscripción activa
        if ($user->role === 'planner') {
            $hasSubscription = $user->activeSubscription()->exists();
            
            return $hasSubscription 
                ? Response::allow()
                : Response::deny('Tu cuenta de Organizador requiere una suscripción activa para crear eventos.');
        }

        // 3. Los novios (couple) solo pueden tener UN (1) evento
        if ($user->role === 'couple') {
            $eventCount = Event::where('user_id', $user->id)->count();
            
            return $eventCount < 1
                ? Response::allow()
                : Response::deny('Las cuentas de tipo Novios solo pueden crear un (1) evento. Para gestionar múltiples eventos, cambia tu cuenta a Organizador.');
        }

        // Cualquier otro rol (como 'guest') no puede crear eventos
        return Response::deny('No tienes permisos suficientes para crear eventos.');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Event $event): bool
    {
        return $user->role === 'admin';
    }
}