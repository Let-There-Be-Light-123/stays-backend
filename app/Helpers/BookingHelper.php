<?php 
// BookingHelper.php

namespace App\Helpers;

use App\Models\Booking;
use App\Models\File;

class BookingHelper
{
    /**
     * Retrieve files associated with a booking.
     *
     * @param string $bookingReference
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getBookingFiles($bookingReference)
    {
        $booking = Booking::with('files')->where('booking_reference', $bookingReference)->first();

        return $booking ? $booking->files : collect();
    }

    /**
     * Link files to a booking.
     *
     * @param string $bookingReference
     * @param array $fileIds
     * @return void
     */
    public static function linkFilesToBooking($bookingReference, $fileIds)
    {
        $booking = Booking::where('booking_reference', $bookingReference)->first();

        if ($booking) {
            $booking->files()->attach($fileIds);
        }
    }

    /**
     * Unlink files from a booking.
     *
     * @param string $bookingReference
     * @param array $fileIds
     * @return void
     */
    public static function unlinkFilesFromBooking($bookingReference, $fileIds)
    {
        $booking = Booking::where('booking_reference', $bookingReference)->first();

        if ($booking) {
            $booking->files()->detach($fileIds);
        }
    }
}
