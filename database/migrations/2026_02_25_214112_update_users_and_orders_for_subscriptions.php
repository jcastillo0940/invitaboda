<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Limpiar tabla users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plan', 'plan_expires_at']);
        });

        // 2. Modificar tabla orders
        Schema::table('orders', function (Blueprint $table) {
            // Relación a suscripción (si es un pago recurrente)
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            
            // Relación a evento (si es compra de 1 sola invitación)
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['subscription_id']);
            $table->dropForeign(['event_id']);
            $table->dropColumn(['subscription_id', 'event_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('plan')->default('free');
            $table->timestamp('plan_expires_at')->nullable();
        });
    }
};