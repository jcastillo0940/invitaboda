<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_type',
        'duration_months',
        // Límites operativos
        'max_events',
        'max_guests',
        'days_accessible_before',
        'max_admins',
        'storage_mb',
        'max_providers',
        'max_lists',
        // Funciones
        'feature_rsvp',
        'feature_custom_site',
        'feature_custom_domain',
        'feature_advanced_reports',
        'feature_export_data',
        'feature_provider_integration',
        // Estado
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'feature_rsvp' => 'boolean',
        'feature_custom_site' => 'boolean',
        'feature_custom_domain' => 'boolean',
        'feature_advanced_reports' => 'boolean',
        'feature_export_data' => 'boolean',
        'feature_provider_integration' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Helper: Método para verificar si el plan es ilimitado en algo
    public function hasUnlimited(string $attribute): bool
    {
        return is_null($this->{$attribute});
    }
}