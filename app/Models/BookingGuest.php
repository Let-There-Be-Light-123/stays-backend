<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingGuest extends Model
{
    protected $table = 'booking_guests';

    protected $fillable = [
        'booking_reference',
        'user_id',
        // Add other fillable columns as needed
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_reference','booking_reference');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'social_security');
    }
}
