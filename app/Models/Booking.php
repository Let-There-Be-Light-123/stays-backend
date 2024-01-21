<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;


class Booking extends Model
{
    use HasFactory;
    protected $table = 'bookings';
    protected $primaryKey = 'booking_reference';

    protected $fillable = [
        'booking_reference',
        'rooms',
        'guest_ids',
        'check_in_date',
        'check_out_date',
        'status',
        'booked_by',
    ];

    protected $casts = [
        'booking_reference' => 'string',
        'rooms' => 'json',
        'guest_ids' => 'json',
        'check_in_date' => 'date',
        'check_out_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'booked_by', 'social_security');
    }

    public function guests()
    {
        return $this->belongsToMany(User::class, 'booking_guests', 'booking_reference', 'user_id');
    }

    public function bookingGuests(){
        return $this->belongsToMany(BookingGuest::class,'guest_ids','user_id');
    }

    public function bookingRooms()
    {
        return $this->hasMany(RoomBooking::class, 'booking_reference', 'booking_reference');
    }

    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_bookings', 'booking_reference', 'room_id')
            ->withPivot('booking_reference', 'room_id');
    }
    public function files()
    {
        return $this->hasMany(File::class, 'booking_reference');
    }

    // Simplify attribute manipulation
    public function getRoomsAttribute($value)
    {
        return json_decode($value);
    }
    public function setRoomsAttribute($value)
    {
        $this->attributes['rooms'] = json_encode($value);
    }

    public function setGuestIdsAttribute($value)
    {
        $this->attributes['guest_ids'] = json_encode($value);
    }
    public function bookedBy()
    {
        return $this->belongsTo(User::class, 'booked_by', 'social_security');
    }
    public function getGuestDetails()
    {
        // Retrieve the guest IDs from the booking
        $guestIds = $this->guest_ids;

        // Use the User model to get the details of the guests
        $guestDetails = User::whereIn('social_security', $guestIds)->get();

        return $guestDetails;
    }
    public function signatures()
    {
        return $this->hasMany(Signature::class);
    }
}
