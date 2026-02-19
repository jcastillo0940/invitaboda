<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Design extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'thumbnail',
        'default_config',
        'is_premium',
        'is_active',
    ];

    protected $casts = [
        'default_config' => 'array',
        'is_premium' => 'boolean',
        'is_active' => 'boolean',
    ];
}
