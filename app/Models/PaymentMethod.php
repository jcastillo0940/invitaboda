<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'identifier',
        'is_active',
        'currency',
        'commission_type',
        'commission_value',
        'allowed_plans',
        'instructions',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'commission_value' => 'decimal:2',
        'allowed_plans' => 'array', // Casteo mágico de JSON a Array
    ];

    // Helper: Verifica si el método está disponible para un plan en específico
    public function isAvailableForPlan($planSlug): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (empty($this->allowed_plans)) {
            return true; // Si está vacío, se asume que es para todos
        }

        return in_array($planSlug, $this->allowed_plans);
    }
}