<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Webhook extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'booking_id',
        'user_id',
        'payload',
        'is_handled',
    ];

    protected $casts = [
        'payload' => 'json',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
    
}