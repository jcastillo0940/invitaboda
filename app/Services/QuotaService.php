<?php

namespace App\Services;

use App\Models\User;
use App\Models\Event;
use App\Models\GuestGroup;

class QuotaService
{
    /**
     * Verifica si el usuario tiene permitido crear un evento más según su plan.
     */
    public static function canCreateEvent(User $user): bool
    {
        $subscription = $user->activeSubscription;

        if (!$subscription || !$subscription->plan) {
            return false;
        }

        $maxEvents = $subscription->plan->max_events;

        if (is_null($maxEvents)) {
            return true;
        }

        $currentCount = Event::where('user_id', $user->id)->count();

        return $currentCount < $maxEvents;
    }

    /**
     * Verifica si el evento puede recibir una cantidad específica de nuevos invitados.
     */
    public static function canAddGuests(User $user, Event $event, int $requestedPasses): bool
    {
        $subscription = $user->activeSubscription;

        // Si no tiene suscripción activa, bloqueamos
        if (!$subscription || !$subscription->plan) {
            return false;
        }

        $maxGuests = $subscription->plan->max_guests;

        // Si el límite de invitados en el plan es null, es ilimitado
        if (is_null($maxGuests)) {
            return true;
        }

        // Sumamos todos los pases (total_passes) que ya existen para ESTE evento
        $currentGuests = GuestGroup::where('event_id', $event->id)->sum('total_passes');

        // Verificamos si los que ya tiene + los que intenta añadir superan el límite
        return ($currentGuests + $requestedPasses) <= $maxGuests;
    }
}