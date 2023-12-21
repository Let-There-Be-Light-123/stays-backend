<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;
use App\Models\Room;
use App\Models\Property;
use App\Models\RoomBooking;
use App\Models\BookingGuest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Log\Logger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Spatie\WebhookClient\Models\WebhookCall;
use App\Events\BookingStatusUpdated;



class BookingController extends Controller
{
    protected $logger;

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }
    public function index()
    {
        try {
            $bookings = Booking::with(['bookingRooms', 'files'])->get();
            $transformedBookings = $bookings->map(function ($booking) {
                $guestDetails = $booking->getGuestDetails();
                $bookingData = [
                    'booking_reference' => $booking->booking_reference,
                    'rooms' => $booking->rooms,
                    'guests' => $guestDetails,
                    'check_in_date' => $booking->check_in_date,
                    'check_out_date' => $booking->check_out_date,
                    'status' => $booking->status,
                    'booked_by' => $booking->bookedBy,
                    'files' => $booking->files,
                ];
                return $bookingData;
            });

            return response()->json(['bookings' => $transformedBookings]);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }


    public function show($bookingReference)
    {
        try {
            // Retrieve a specific booking by reference
            $booking = Booking::where('booking_reference', $bookingReference)->firstOrFail();

            // Return a JSON response with the booking details
            return response()->json(['booking' => $booking]);
        } catch (ModelNotFoundException $e) {
            // Handle the case where the booking is not found
            return response()->json(['error' => 'Booking not found'], 404);
        } catch (\Exception $e) {
            // Handle other exceptions
            Log::error('Error in show method: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            // Validate the request data (add validation rules based on your requirements)
            $validatedData = $request->validate([
                'rooms' => 'required|array',
                'guest_ids' => 'required|array',
                'check_in_date' => 'required|date',
                'check_out_date' => 'required|date',
                'status' => 'required|string',
                'booked_by' => 'required|exists:users,social_security',
            ]);

            // Create a new booking
            $booking = Booking::create($validatedData);

            // Return a JSON response with the created booking
            return response()->json(['booking' => $booking], 201);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';

            // Log the detailed error message
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());

            // You can customize the error message based on the exception type if needed
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }
    public function getBookingDetails(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'booking_reference' => 'required|string|exists:bookings,booking_reference',
            ]);

            Log::info('Validation successful for booking reference: ' . $validatedData['booking_reference']);

            // Eager load the relationships
            $booking = Booking::with(['bookedBy', 'guests', 'properties', 'rooms'])
                ->where('booking_reference', $validatedData['booking_reference'])
                ->first();

            if ($booking) {
                Log::info('Booking details retrieved successfully for reference: ' . $validatedData['booking_reference']);
                Log::info('Booking data:', ['booking' => $booking]);

                // Return the details
                return response()->json(['booking' => $booking->toArray()]);
            } else {
                Log::error('Booking not found for reference: ' . $validatedData['booking_reference']);
                return response()->json(['error' => 'Booking not found'], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error in getBookingDetails method: ' . $e->getMessage());
            return response()->json(['error' => 'Booking not found'], 404);
        }
    }
    public function update(Request $request, $bookingReference)
    {
        try {
            // Retrieve the booking by reference
            $booking = Booking::findOrFail($bookingReference);

            // Validate the request data (add validation rules based on your requirements)
            $validatedData = $request->validate([
                'rooms' => 'array',
                'guest_ids' => 'array',
                'check_in_date' => 'date',
                'check_out_date' => 'date',
                'status' => 'string',
                'booked_by' => 'exists:users,social_security',
            ]);

            // Update the booking
            $booking->update($validatedData);

            // Return a JSON response with the updated booking
            return response()->json(['booking' => $booking]);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';

            // Log the detailed error message
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());

            // You can customize the error message based on the exception type if needed
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }
    public function destroy($bookingReference)
    {
        try {
            // Retrieve the booking by reference and delete it
            $booking = Booking::findOrFail($bookingReference);
            $booking->delete();

            // Return a JSON response indicating success
            return response()->json(['message' => 'Booking deleted successfully']);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';

            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());

            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }
    public function getAvailableRooms(Request $request)
    {
        try {

            $validatedData = $request->validate([
                'property_id' => 'required|string|exists:properties,property_id',
                'check_in_date' => 'required|date',
                'check_out_date' => 'required|date|after:check_in_date',
            ]);
            $bookedRoomIds = DB::table('room_bookings')
                ->join('bookings', 'room_bookings.booking_reference', '=', 'bookings.booking_reference')
                ->where('bookings.check_out_date', '>', $validatedData['check_in_date'])
                ->where('bookings.check_in_date', '<', $validatedData['check_out_date'])
                ->pluck('room_id')
                ->toArray();
            $allRoomIds = Room::where('property_id', $validatedData['property_id'])
                ->pluck('room_id')
                ->toArray();
            $availableRoomIds = array_diff($allRoomIds, $bookedRoomIds);
            $availableRooms = Room::whereIn('room_id', $availableRoomIds)->get();
            return response()->json(['available_rooms' => $availableRooms]);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }

    public function getAvailableRoomsAndProperties()
    {
        try {
            $properties = Property::with('rooms')->get();

            Log::info('Available rooms and properties retrieved successfully.');
            return response()->json(['properties' => $properties], 200);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            Log::error('Error in getAvailableRoomsAndProperties: ' . $errorMessage);
            return response()->json(['error' => $errorMessage], 500);
        }
    }
    public function bookRoom(Request $request)
    {
        try {
            Log::info('Entering bookRoom method.');
            $validatedData = $request->validate([
                'property_id' => 'required|string|exists:properties,property_id',
                'check_in_date' => 'required|date',
                'check_out_date' => 'required|date|after:check_in_date',
                'booked_by' => 'required|exists:users,social_security',
                'guests' => 'sometimes|array',
                'room_id' => 'required|string|exists:rooms,room_id',
            ]);

            // Check if the user already has a booking overlapping with the specified dates
            $existingBooking = Booking::where('booked_by', $validatedData['booked_by'])
                ->where(function ($query) use ($validatedData) {
                    $query->where(function ($q) use ($validatedData) {
                        $q->where('check_in_date', '<', $validatedData['check_out_date'])
                            ->where('check_out_date', '>', $validatedData['check_in_date']);
                    });
                })
                ->first();

            if ($existingBooking) {
                Log::info('User already has a booking overlapping with the specified dates.');
                return response()->json(['error' => 'User already has a booking overlapping with the specified dates'], 400);
            }


            Log::info('Request data validated. the data is ', $validatedData);
            $guestIds = [];
            if (isset($validatedData['guests']) && is_array($validatedData['guests'])) {
                Log::info('this is guests data ', $validatedData['guests']);
                foreach ($validatedData['guests'] as $guestData) {
                    $guestId = $guestData['social_security'];
                    Log::info('Processing guest with social_security: ' . $guestId);
                    $guest = User::firstOrNew(['social_security' => $guestId]);
                    if ($guest->exists) {
                        Log::info('Guest with social_security ' . $guestId . ' already exists.');
                    } else {
                        Log::info('Creating a new guest with social_security: ' . $guestId);
                        $guest->fill([
                            'name' => $guestData['name'] ?? 'Guest',
                            'email' => $guestData['email'] ?? 'guest@example.com',
                            'phone' => $guestData['phone'] ?? '',
                            'social_security' => $guestData['social_security'] ?? '',
                        ])->save();
                    }
                    $guestIds[] = $guest->social_security;
                }
            }

            if (!$this->isRoomAvailable($validatedData['room_id'], $validatedData['check_in_date'], $validatedData['check_out_date'])) {
                Log::info('Room not available for the specified dates in bookRoom method.');
                return response()->json(['error' => 'Room not available for the specified dates'], 400);
            }
            Log::info('Room available for the specified dates.');
            Log::info('Before creating booking. Validated data:', ['validatedData' => $validatedData, 'guestIds' => $guestIds]);

            $bookingReference = $this->createBooking($validatedData, 'pending verification', $guestIds);
            Log::info('Booking created successfully with "pending verification" status.');

            // Return a JSON response with the booking reference
            return response()->json(['booking_reference' => $bookingReference], 201);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }
    public function adminBookRooms(Request $request)
    {
        try {
            Log::info('Entering adminBookRooms method.');
            $validatedData = $request->validate([
                'property_id' => 'required|string|exists:properties,property_id',
                'check_in_date' => 'required|date',
                'check_out_date' => 'required|date|after:check_in_date',
                'booked_by' => 'required|exists:users,social_security',
                'guests' => 'sometimes|array',
                'room_ids' => 'required|array',
            ]);
            Log::info('Request data validated for admin booking.');
    
            foreach ($validatedData['room_ids'] as $roomId) {
                if (!$this->isRoomAvailable($roomId, $validatedData['check_in_date'], $validatedData['check_out_date'])) {
                    Log::info("Room with ID {$roomId} not available for the specified dates.");
                    return response()->json(['error' => "Room with ID {$roomId} not available for the specified dates"], 400);
                }
            }
    
            $guestIds = [];
            if (isset($validatedData['guests']) && is_array($validatedData['guests'])) {
                Log::info('This is guests data: ' . json_encode($validatedData['guests']));
                foreach ($validatedData['guests'] as $guestData) {
                    $guestId = $guestData['social_security'];
                    Log::info('Processing guest with social_security: ' . $guestId);
                    $guest = User::firstOrNew(['social_security' => $guestId]);
                    if ($guest->exists) {
                        Log::info('Guest with social_security ' . $guestId . ' already exists.');
                    } else {
                        Log::info('Creating a new guest with social_security: ' . $guestId);
                        $guest->fill([
                            'name' => $guestData['name'] ?? 'Guest',
                            'email' => $guestData['email'] ?? 'guest@example.com',
                            'phone' => $guestData['phone'] ?? '',
                            'social_security' => $guestData['social_security'] ?? '',
                        ])->save();
                    }
                    $guestIds[] = $guest->social_security;
                }
            }
            Log::info('Before creating booking. Validated data:', ['validatedData' => $validatedData, 'guestIds' => $guestIds]);
            $bookingReferences = [];
            foreach ($validatedData['room_ids'] as $roomId) {
                $status = 'booked';
                $bookingReference = $this->createBooking([
                    'property_id' => $validatedData['property_id'],
                    'check_in_date' => $validatedData['check_in_date'],
                    'check_out_date' => $validatedData['check_out_date'],
                    'booked_by' => $validatedData['booked_by'],
                    'guest_ids' => $guestIds,
                    'room_id' => $roomId,
                ], $status, $guestIds);
                $bookingReferences[] = $bookingReference;
            }
    
            Log::info('Room available for the specified dates.');
            
            Log::info('Bookings created successfully.');
    
            return response()->json(['booking_references' => $bookingReferences], 201);
        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';
    
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());
    
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }
    
            return response()->json(['error' => $errorMessage], 500);
        }
    }
    private function isRoomAvailable($roomId, $checkInDate, $checkOutDate)
    {
        try {
            Log::info('Entering isRoomAvailable method.');
            $bookedRooms = DB::table('room_bookings')
                ->join('bookings', 'room_bookings.booking_reference', '=', 'bookings.booking_reference')
                ->where('room_bookings.room_id', $roomId)
                ->where('bookings.check_out_date', '>', $checkInDate)
                ->where('bookings.check_in_date', '<', $checkOutDate)
                ->count();
            Log::info('Room availability checked.');

            return $bookedRooms === 0;
        } catch (\Exception $e) {
            Log::error('Error in isRoomAvailable method: ' . $e->getMessage());
            return false;
        }
    }
    private function createBooking($data, $status, $guestIds)
    {
        Log::info('Entering is create booking method.', $guestIds);

        try {
            if (count($guestIds) > 0 && is_object($guestIds[0])) {
                Log::info('Entering is array  method.');

                $socialSecurityValues = array_map(function ($guest) {
                    return $guest['social_security'];
                }, $guestIds);
                $guestIds = array_map('intval', $socialSecurityValues);
            }
            Log::info('Entering createBooking method.', $guestIds);
            $data['booking_reference'] = 'BR' . Str::uuid();
            Log::info('Creating booking with the following data:', ['data' => $data]);
            $booking = new Booking([
                'rooms' => [$data['room_id']],
                'guest_ids' =>  array_map(function ($guest) {
                    return $guest['social_security'];
                }, $data['guests']),
                'check_in_date' => $data['check_in_date'],
                'check_out_date' => $data['check_out_date'],
                'status' => $status,
                'booked_by' => $data['booked_by'],
            ]);
            $booking->booking_reference = $data['booking_reference'];
            $booking->save();
            foreach (array_map(function ($guest) {
                    return $guest['social_security'];
                }, $data['guests']) as $guest) {
                try {
                    Log::info('Creating BookingGuest for booking_reference: ' . $data['booking_reference'] . ', user_id: ' . $guest);
                    BookingGuest::create([
                        'booking_reference' => $data['booking_reference'],
                        'user_id' => $guest,
                    ]);
                    Log::info('BookingGuest created successfully.');
                } catch (\Exception $e) {
                    Log::error('Error creating BookingGuest: ' . $e->getMessage());
                }
            }
            $room = Room::find($data['room_id']);
            if (!$room) {
                Log::error('Invalid room ID: ' . $data['room_id']);
                return null;
            }
            RoomBooking::create([
                'room_id' => $room->room_id,
                'booking_reference' => $data['booking_reference'],
            ]);
    
            Log::info('Booking created successfully with status: ' . $status, ['booking' => $booking]);
            Log::info('Room booking and guest booking recorded.');
    
            return $data['booking_reference'];
        } catch (\Exception $e) {
            Log::error('Error in createBooking method: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Update the status of a booking.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'booking_reference' => 'required|string|exists:bookings,booking_reference',
                'status' => 'required|string',
            ]);

            $booking = Booking::where('booking_reference', $validatedData['booking_reference'])->firstOrFail();
            $validStatuses = ['booked', 'checked-in', 'checked-out', 'pending verification'];

            if (!in_array($validatedData['status'], $validStatuses)) {
                Log::error('Invalid status provided: ' . $validatedData['status']);
                return response()->json(['error' => 'Invalid status provided'], 400);
            }

            Log::info('Updating status for booking ' . $booking->booking_reference . ' to ' . $validatedData['status']);
            $booking->where('booking_reference', $validatedData['booking_reference'])->update(['status' => $validatedData['status']]);
            Log::info('Booking status updated successfully: ' . $booking->booking_reference . ' to ' . $validatedData['status']);

            event(new BookingStatusUpdated($booking));

            return response()->json(['booking' => $booking]);


        } catch (\Exception $e) {
            $errorMessage = 'Internal Server Error';
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());

            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Resource not found';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed';
            }

            return response()->json(['error' => $errorMessage], 500);
        }
    }


    public function showGuests($bookingReference)
    {
        try {
            // Retrieve a specific booking by reference with guests details
            $booking = Booking::with('guests')->findOrFail($bookingReference);

            // Return a JSON response with the guests details
            return response()->json(['guests' => $booking->guests]);
        } catch (\Exception $e) {
            Log::error('Error in showGuests method: ' . $e->getMessage());
            return response()->json(['error' => 'Booking not found'], 404);
        }
    }

    public function showRooms($bookingReference)
    {
        try {
            // Retrieve a specific booking by reference with rooms details
            $booking = Booking::with('rooms')->findOrFail($bookingReference);

            // Return a JSON response with the rooms details
            return response()->json(['rooms' => $booking->rooms]);
        } catch (\Exception $e) {
            Log::error('Error in showRooms method: ' . $e->getMessage());
            return response()->json(['error' => 'Booking not found'], 404);
        }
    }

    public function getUserBookings()
    {
        Log::info('Entering getUserBookings method.');
    
        try {
            $user = Auth::user();
            if (!$user) {
                Log::error('User not authenticated');
                return response()->json(['error' => 'User is not authenticated'], 401);
            }
            Log::info('User authenticated', ['user' => $user]);
    
            // Eager load rooms with their associated properties and files
            $bookings = Booking::with(['rooms.property.files'])->where('booked_by', $user->social_security)->get();
    
            $transformedBookings = $bookings->map(function ($booking) {
                $guestDetails = $booking->getGuestDetails();
    
                $rooms = is_string($booking->rooms) ? json_decode($booking->rooms, true) : $booking->rooms;
    
                $roomDetails = collect($rooms)->map(function ($room) {
                    $roomId = $room ?? null;
                    $roomData = Room::with(['property.files'])->find($roomId);
                    Log::info('Room Data:', ['room_id' => $roomId, 'room_data' => $roomData]);
                    return [
                        'room_id' => $roomId,
                        'property_details' => $roomData && $roomData->property ? $roomData->property->toArray() : null,
                    ];
                });
    
                $bookingData = [
                    'booking_reference' => $booking->booking_reference,
                    'rooms' => $rooms, // Include rooms field
                    'room_details' => $roomDetails->toArray(), // Include room details with associated property details
                    'guests' => $guestDetails,
                    'check_in_date' => $booking->check_in_date,
                    'check_out_date' => $booking->check_out_date,
                    'status' => $booking->status,
                    'booked_by' => $booking->bookedBy,
                    'files' => $booking->files,
                ];
                return $bookingData;
            });
    
            // Log the transformed bookings
            Log::info('Bookings transformed successfully', ['bookings' => $transformedBookings]);
    
            // Return the response with transformed bookings
            return response()->json(['bookings' => $transformedBookings]);
        } catch (\Exception $e) {
            // Log the error details
            $errorMessage = 'Internal Server Error';
            Log::error('Error: ' . $e->getMessage() . PHP_EOL . 'Stack Trace: ' . $e->getTraceAsString());
    
            // Return an error response
            return response()->json(['error' => $errorMessage], 500);
        }
    }
}