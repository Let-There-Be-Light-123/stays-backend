<?php
// app\Helpers\FileHelper.php

namespace App\Helpers;

use App\Models\Property;
use App\Models\User;
use App\Models\Booking;

class FileHelper
{
    /**
     * Retrieve files associated with a property.
     *
     * @param int $propertyId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getPropertyFiles($propertyId)
    {
        $property = Property::find($propertyId);
        return $property ? $property->files : collect();
    }

    /**
     * Retrieve files associated with a user.
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getUserFiles($userId)
    {
        $user = User::find($userId);
        return $user ? $user->files : collect();
    }

    /**
     * Retrieve files associated with a booking.
     *
     * @param int $bookingId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getBookingFiles($bookingId)
    {
        $booking = Booking::find($bookingId);
        return $booking ? $booking->files : collect();
    }
}
