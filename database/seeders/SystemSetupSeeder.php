<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use App\Models\PaymentMethod;

class SystemSetupSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. CREAR PLANES POR DEFECTO
        // ==========================================
        
        Plan::firstOrCreate(
            ['slug' => 'elite'],
            [
                'name' => 'Elite Planner',
                'description' => 'Ideal para planners en crecimiento.',
                'price' => 19.99,
                'billing_type' => 'subscription',
                'duration_months' => null,
                'max_events' => 5, // Límite de 5 eventos activos
                'max_guests' => null, // Ilimitado
                'days_accessible_before' => null,
                'max_admins' => 1,
                'storage_mb' => 1024, // 1GB
                'max_providers' => 20,
                'max_lists' => 5,
                // Features
                'feature_rsvp' => true,
                'feature_custom_site' => true,
                'feature_custom_domain' => false,
                'feature_advanced_reports' => false,
                'feature_export_data' => false,
                'feature_provider_integration' => false,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        Plan::firstOrCreate(
            ['slug' => 'agency'],
            [
                'name' => 'Master Agency',
                'description' => 'Eventos ilimitados y marca blanca para agencias.',
                'price' => 49.99,
                'billing_type' => 'subscription',
                'duration_months' => null,
                'max_events' => null, // Ilimitado
                'max_guests' => null, // Ilimitado
                'days_accessible_before' => null,
                'max_admins' => 5,
                'storage_mb' => 5120, // 5GB
                'max_providers' => null, // Ilimitado
                'max_lists' => null, // Ilimitado
                // Features
                'feature_rsvp' => true,
                'feature_custom_site' => true,
                'feature_custom_domain' => true,
                'feature_advanced_reports' => true,
                'feature_export_data' => true,
                'feature_provider_integration' => true,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // ==========================================
        // 2. CREAR MÉTODOS DE PAGO POR DEFECTO
        // ==========================================

        PaymentMethod::firstOrCreate(
            ['identifier' => 'tilopay'],
            [
                'name' => 'Pago en línea (Tilopay)',
                'is_active' => true,
                'currency' => 'USD',
                'commission_type' => 'none',
                'commission_value' => 0,
                'allowed_plans' => null, // Disponible para todos
                'sort_order' => 1,
            ]
        );

        PaymentMethod::firstOrCreate(
            ['identifier' => 'paypal'],
            [
                'name' => 'PayPal / Tarjeta (Internacional)',
                'is_active' => true,
                'currency' => 'USD',
                'commission_type' => 'none',
                'commission_value' => 0,
                'allowed_plans' => null,
                'sort_order' => 2,
            ]
        );

        PaymentMethod::firstOrCreate(
            ['identifier' => 'yappy'],
            [
                'name' => 'Yappy (Solo Panamá)',
                'is_active' => true,
                'currency' => 'USD',
                'commission_type' => 'none',
                'commission_value' => 0,
                'allowed_plans' => null,
                'instructions' => 'Transfiere a @tu_usuario_yappy y envía el comprobante.',
                'sort_order' => 3,
            ]
        );

        PaymentMethod::firstOrCreate(
            ['identifier' => 'ach'],
            [
                'name' => 'Transferencia Bancaria (ACH)',
                'is_active' => true,
                'currency' => 'USD',
                'commission_type' => 'none',
                'commission_value' => 0,
                'allowed_plans' => ['agency'], // Ejemplo de restricción: Solo para el plan Agency
                'instructions' => 'Transfiere a la cuenta de Banco General: 03-XX-XXXX-X. Envía el comprobante por correo.',
                'sort_order' => 4,
            ]
        );
    }
}