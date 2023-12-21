<?php

namespace App\Http\Controllers;

use App\Events\BookingStatusUpdated;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;


class WebhookController extends Controller
{

    public function handle(Request $request)
    {
        try {
            Log::info('Webhook Received:', ['data' => $request->json()->all()]);
            $data = $request->json()->all();
            $bookingReference = $data['booking_reference'];
            $status = $data['status'];
            Log::info('Webhook Processed:', ['booking_reference' => $bookingReference, 'status' => $status]);
            return response()->json(['message' => 'Webhook handled successfully']);
        } catch (\Exception $e) {
            Log::error('Webhook Processing Error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}