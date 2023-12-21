<?php
namespace App\Notifications;

use Illuminate\Notifications\Notification;

class BookingNotification extends Notification
{
    public $message;
    public $booking;

    public function __construct($message, $booking)
    {
        $this->message = $message;
        $this->booking = $booking;
    }

    public function toMail($notifiable)
    {
        // Customize the email representation of the notification
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->line($this->message)
            ->action('View Booking', url('/bookings/' . $this->booking->id))
            ->line('Thank you for using our application!');
    }

    // Additional methods for other notification channels (e.g., database, push, etc.)
}
