<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            
            // Identificación
            $table->string('name'); // Ej. 'Tarjeta de Crédito', 'PayPal', 'Yappy'
            $table->string('identifier')->unique(); // ID interno: 'tilopay', 'paypal', 'yappy', 'ach'
            
            // Estado y Moneda
            $table->boolean('is_active')->default(true);
            $table->string('currency')->default('USD');
            
            // Comisiones (Fees)
            $table->enum('commission_type', ['none', 'fixed', 'percentage'])->default('none');
            $table->decimal('commission_value', 8, 2)->default(0);
            
            // Restricciones por Plan (Guardará un array JSON con los IDs o Slugs de los planes permitidos)
            // Si es null, aplica para todos los planes.
            $table->json('allowed_plans')->nullable(); 
            
            // Instrucciones o detalles (Útil para métodos offline como ACH o Yappy)
            $table->text('instructions')->nullable(); 
            
            // Orden visual
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};