<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckInLog extends Model
{
    protected $fillable = [
        'guest_group_id',
        'type',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
    ];

    public function guestGroup(): BelongsTo
    {
        return $this->belongsTo(GuestGroup::class);
    }
}
