<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_group_id',
        'name',
        'is_attending',
        'menu_choice',
        'drink_choice',
        'allergies',
        'table_id',
    ];

    protected $casts = [
        'is_attending' => 'boolean',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(GuestGroup::class, 'guest_group_id');
    }
}
