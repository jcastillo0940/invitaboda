<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // --- CAMPOS PERSONALIZADOS PARA EL SAAS ---
        'role',
        'agency_name',
        'stripe_customer_id',
        // 'plan' y 'plan_expires_at' han sido removidos
        'agency_settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'agency_settings' => 'array',
        ];
    }

    // -----------------------------------------------------
    // RELACIONES NUEVAS PARA EL SISTEMA DE PAGOS Y SAAS
    // -----------------------------------------------------

    /**
     * Relación con todas las suscripciones (Historial completo del usuario).
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Helper para obtener únicamente la suscripción activa.
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
                    ->where('status', 'active')
                    ->latestOfMany();
    }

    /**
     * Relación con todas las órdenes/facturas del usuario
     * (tanto individuales como pagos de suscripciones).
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}