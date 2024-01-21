<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{
    use HasFactory;
    protected $fillable = [
        'booking_id',
        'user_id',
        'signature',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the booking that owns the signature.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
