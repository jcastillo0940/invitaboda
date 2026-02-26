<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;

class CheckExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check-expired';
    protected $description = 'Verifica suscripciones activas cuya fecha de próximo cobro haya expirado y no se haya pagado.';

    public function handle()
    {
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->whereNotNull('next_billing_date')
            ->where('next_billing_date', '<', now())
            ->get();

        $count = 0;

        foreach ($expiredSubscriptions as $subscription) {
            // Aquí la marcamos como "past_due" (vencida / falta de pago)
            $subscription->update(['status' => 'past_due']);
            
            // Aquí podrías despachar un Job para enviar un email al usuario
            // Mail::to($subscription->user->email)->send(new SubscriptionPastDueMail($subscription));

            $count++;
        }

        $this->info("Se marcaron {$count} suscripciones como vencidas (past_due).");
        Log::info("Cron CheckExpiredSubscriptions ejecutado: {$count} actualizadas.");
    }
}