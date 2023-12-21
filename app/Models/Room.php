<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Room extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    protected $primaryKey = 'room_id';


    public $incrementing = false;

    protected $fillable = [
        'room_id',
        'property_id',
        'room_name',
        'is_active',
        'room_description',
        'is_verified'
    ];

    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }
    public function bookings()
    {
        return $this->belongsToMany(Booking::class, 'room_bookings', 'room_id', 'booking_reference');
    }
    
}
