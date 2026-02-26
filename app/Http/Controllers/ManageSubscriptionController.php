<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;

class ManageSubscriptionController extends Controller
{
    /**
     * Pausar una suscripción.
     */
    public function pause(Subscription $subscription)
    {
        // Seguridad: Verificar permisos (Admin o Dueño)
        if (auth()->user()->role !== 'admin' && auth()->id() !== $subscription->user_id) {
            abort(403, 'No autorizado.');
        }

        if ($subscription->status !== 'active') {
            return back()->with('error', 'Solo se pueden pausar suscripciones activas.');
        }

        $subscription->update([
            'status' => 'paused',
            'paused_at' => now(),
        ]);

        return back()->with('success', 'Suscripción pausada correctamente.');
    }

    /**
     * Reanudar una suscripción pausada.
     */
    public function resume(Subscription $subscription)
    {
        if (auth()->user()->role !== 'admin' && auth()->id() !== $subscription->user_id) {
            abort(403, 'No autorizado.');
        }

        if ($subscription->status !== 'paused') {
            return back()->with('error', 'La suscripción no está pausada.');
        }

        // Calcular los días que estuvo pausada para extender la fecha de cobro (Opcional)
        $daysPaused = $subscription->paused_at->diffInDays(now());
        $newBillingDate = $subscription->next_billing_date ? $subscription->next_billing_date->addDays($daysPaused) : now()->addMonth();

        $subscription->update([
            'status' => 'active',
            'paused_at' => null,
            'next_billing_date' => $newBillingDate,
        ]);

        return back()->with('success', 'Suscripción reanudada.');
    }

    /**
     * Cancelar una suscripción.
     */
    public function cancel(Subscription $subscription)
    {
        if (auth()->user()->role !== 'admin' && auth()->id() !== $subscription->user_id) {
            abort(403, 'No autorizado.');
        }

        $subscription->update([
            'status' => 'canceled',
            // Opcional: permitir acceso hasta final de mes
            'ends_at' => $subscription->next_billing_date ?? now(), 
        ]);

        return back()->with('success', 'Suscripción cancelada.');
    }
}