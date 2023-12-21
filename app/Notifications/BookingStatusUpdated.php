<?php
namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BookingStatusUpdated extends Notification
{
    public $booking;
    public $status;
    public function __construct($booking, $status)
    {
        $this->booking = $booking;
        $this->status = $status;
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_reference' => $this->booking->booking_reference,
            'status' => $this->status,
        ];
    }
}
