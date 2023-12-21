<?php

namespace App\Listeners;

use App\Events\BookingStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Webhook;



class SendWebhookNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(BookingStatusUpdated $event)
    {
        // Create a new webhook entry in the database
        Webhook::create([
            'name' => 'Booking Status Updated',
            'entity_type' => 'bookings',
            'entity_id' => $event->booking->id,
            'payload' => [
                'status' => $event->booking->status,
                'booking_reference' => $event->booking->booking_reference,
                'booked_by' => $event->booking->booked_by,
            ],
        ]);
    }
}