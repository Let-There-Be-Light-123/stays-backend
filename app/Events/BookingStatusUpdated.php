<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Booking;

class BookingStatusUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $booking;
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }
    public function broadcastOn()
    {
        return new Channel('booking-status');
    }
}
