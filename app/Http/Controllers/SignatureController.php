<?php

namespace App\Http\Controllers;

use App\Models\Signature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\File;

class SignatureController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $signatures = Signature::all();

        return response()->json($signatures);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'booking_id' => 'required',
                'signature' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
    
            if (Auth::guard('sanctum')->check()) {
                $user = Auth::guard('sanctum')->user();
                $bookingId = $request->input('booking_id');
    
                $signatureDirectory = "public/uploads/signatures/{$bookingId}";
    
                if (!Storage::exists($signatureDirectory)) {
                    Storage::makeDirectory($signatureDirectory);
                    Storage::setVisibility($signatureDirectory, 'public');
                }
                $signature = new Signature();
                $signature->booking_id = $bookingId;
                $signature->user_id = $user->social_security;
    
                $image = $request->file('signature');
                $imageName = 'signature_' . time() . '.' . $image->getClientOriginalExtension();
    
                // Storage::disk("public/uploads/signatures/{$bookingId}")->putFileAs('signatures', $image, $imageName);
                $image->storeAs($signatureDirectory, $imageName);

                $signature->signature = $imageName;
                $signature->save();
    
    
                return response()->json($signature, 201);
            } else {
                return response()->json(['error' => 'User not authenticated.'], 401);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error storing signature. Please try again.'], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $signature = Signature::findOrFail($id);

        return response()->json($signature);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $signature = Signature::findOrFail($id);


        return response()->json($signature);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $signature = Signature::findOrFail($id);
        Storage::disk('public')->delete('signatures/' . $signature->signature);
        $signature->delete();

        return response()->json(['message' => 'Signature deleted successfully']);
    }
    public function getSignaturesByBookingId(Request $request)
    {
        try {
            $bookingId = $request->route('booking_id'); 
            $signatures = Signature::where('booking_id', $bookingId)->get();
    
            return response()->json($signatures);
        } catch (\Exception $e) {
            Log::error("Error getting signatures by booking_id: " . $e->getMessage());
    
            return response()->json(['error' => 'Error getting signatures. Please try again.'], 500);
        }
    }
}