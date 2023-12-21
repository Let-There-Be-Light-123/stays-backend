<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use Carbon\Carbon;

class CheckAvailabilityController extends Controller
{
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
        ]);

        $propertyId = $request->input('property_id');
        $checkInDate = Carbon::parse($request->input('check_in_date'));
        $checkOutDate = Carbon::parse($request->input('check_out_date'));

        $availableRooms = $this->getAvailableRooms($propertyId, $checkInDate, $checkOutDate);

        return response()->json([
            'property_id' => $propertyId,
            'check_in_date' => $checkInDate->toDateString(),
            'check_out_date' => $checkOutDate->toDateString(),
            'available_rooms' => $availableRooms,
        ]);
    }

    private function getAvailableRooms($propertyId, $checkInDate, $checkOutDate)
{
    // Get all rooms for the specified property
    $allRooms = Room::where('property_id', $propertyId)->get();

    // Get rooms that have bookings within the specified date range
    $bookedRooms = Room::whereHas('bookings', function ($query) use ($checkInDate, $checkOutDate) {
        $query->where(function ($q) use ($checkInDate, $checkOutDate) {
            $q->whereBetween('check_in_date', [$checkInDate, $checkOutDate])
                ->orWhereBetween('check_out_date', [$checkInDate, $checkOutDate]);
        });
    })->get();

    // Calculate available rooms by subtracting booked rooms from all rooms
    $availableRooms = $allRooms->diff($bookedRooms);

    return $availableRooms;
}
}