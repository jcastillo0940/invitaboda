<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EventPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        // 1. Los administradores siempre pueden crear eventos
        if ($user->role === 'admin') {
            return true;
        }

        // 2. Las agencias (planners) DEBEN tener una suscripción activa
        if ($user->role === 'planner') {
            // Usamos el helper activeSubscription() que ya tienes en tu modelo User
            return $user->activeSubscription()->exists();
        }

        // 3. Los novios (couple) solo pueden tener UN (1) evento activo/creado
        if ($user->role === 'couple') {
            $eventCount = Event::where('user_id', $user->id)->count();
            return $eventCount < 1; 
        }

        // Cualquier otro rol (como 'guest') no puede crear eventos
        return false;
    }

    public function update(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }

    public function delete(User $user, Event $event): bool
    {
        return $user->id === $event->user_id || $user->role === 'admin';
    }
}