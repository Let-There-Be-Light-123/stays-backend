<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Display a listing of the rooms.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $rooms = Room::all();
            return response()->json($rooms, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created room in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'room_id' => 'required|string',
                'property_id' => 'required|string',
                'room_name' => 'required|string',
                'is_active' => 'required|boolean',
                'room_description' => 'nullable|string',
            ]);

            $room = Room::create($request->all());
            return response()->json($room, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified room.
     *
     * @param  \App\Models\Room  $room
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Room $room)
    {
        try {
            return response()->json($room, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified room in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Room  $room
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Room $room)
    {
        try {
            $request->validate([
                'property_id' => 'required|string',
                'room_name' => 'required|string',
                'is_active' => 'required|boolean',
                'room_description' => 'nullable|string',
            ]);

            $room->update($request->all());
            return response()->json($room, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified room from storage.
     *
     * @param  \App\Models\Room  $room
     * @return \Illuminate\Http\JsonResponse
     */

     public function destroy(Request $request)
     {
         try {
             $request->validate([
                 'room_ids' => 'required|array',
             ]);
             $roomIds = $request->input('room_ids');
             Room::whereIn('room_id', $roomIds)->delete();
     
             return response()->json(null, 204);
         } catch (\Exception $e) {
             return response()->json(['error' => $e->getMessage()], 500);
         }
     }

    /**
     * Get property data associated with the specified room.
     *
     * @param  \App\Models\Room  $room
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProperty(Room $room)
    {
        try {
            $property = $room->property;
            return response()->json($property, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getRoomsByPropertyId($propertyId)
    {
        try {
            $rooms = Room::with('bookings') 
                ->where('property_id', $propertyId)
                ->get();
    
            return response()->json($rooms, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
