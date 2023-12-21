<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'room_id',
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_reference', 'booking_reference');
    }
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }
}