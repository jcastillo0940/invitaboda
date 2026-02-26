<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            
            // Estados posibles: pending, active, paused, past_due, canceled
            $table->string('status')->default('pending');
            
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable(); // Si se cancela, aquí va la fecha fin
            $table->timestamp('next_billing_date')->nullable(); // Próximo cobro
            $table->timestamp('paused_at')->nullable(); // Para saber cuándo se pausó
            
            $table->string('gateway_subscription_id')->nullable(); // ID de Tilopay/PayPal si aplica
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};