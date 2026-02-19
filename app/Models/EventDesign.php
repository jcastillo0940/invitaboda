<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'template_name',
        'design_data',
    ];

    protected $casts = [
        'design_data' => 'json',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
