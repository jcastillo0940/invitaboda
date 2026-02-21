<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuestGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'group_name',
        'slug',
        'total_passes',
        'status',
        'contact_phone',
        'contact_email',
        'is_checked_in',
    ];

    public function checkInLogs(): HasMany
    {
        return $this->hasMany(CheckInLog::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(GuestMember::class);
    }
}
