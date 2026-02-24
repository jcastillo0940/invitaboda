<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej. 'Pro', 'Premium'
            $table->string('slug')->unique(); // Ej. 'plan-pro'
            $table->text('description')->nullable();
            
            // --- CONFIGURACIÓN DE COBRO ---
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_type', ['subscription', 'one_time', 'free_trial'])->default('subscription');
            $table->integer('duration_months')->nullable(); // null = duración indefinida
            
            // --- LÍMITES OPERATIVOS ---
            $table->integer('max_events')->nullable(); // null = ilimitado
            $table->integer('max_guests')->nullable(); // null = ilimitado
            $table->integer('days_accessible_before')->nullable(); // Días de anticipación
            $table->integer('max_admins')->default(1);
            $table->integer('storage_mb')->nullable(); // Capacidad en Megabytes
            $table->integer('max_providers')->nullable();
            $table->integer('max_lists')->nullable();
            
            // --- FUNCIONALIDADES INCLUIDAS (Booleanos) ---
            $table->boolean('feature_rsvp')->default(false);
            $table->boolean('feature_custom_site')->default(false);
            $table->boolean('feature_custom_domain')->default(false);
            $table->boolean('feature_advanced_reports')->default(false);
            $table->boolean('feature_export_data')->default(false);
            $table->boolean('feature_provider_integration')->default(false);
            
            // --- ESTADO ---
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0); // Orden de aparición visual
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};