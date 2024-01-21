<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Auth;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;

class UserReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::all();
        return response()->json(['status' => 'success', 'data' => $reviews], 200);
    }

    public function show($id)
    {
        $review = Review::findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $review], 200);
    }
    public function store(Request $request)
    {
        try {
            // Ensure the user is authenticated
            if (!Auth::check()) {
                return redirect()->back()->with('error', 'You must be logged in to submit a review.');
            }
    
            $propertyId = $request->input('property_id');
    
            // Check if the user has already submitted a review for this property
            $existingReview = Review::where('property_id', $propertyId)
                ->where('social_security', optional(Auth::user())->social_security)
                ->first();
    
            if ($existingReview) {
                return redirect()->back()->with('error', 'You have already submitted a review for this property.');
            }
    
            $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string',
            ]);
    
            // Create a new review
            Review::create([
                'social_security' => optional(Auth::user())->social_security,
                'property_id' => $propertyId,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
    
            Log::info("Review submitted successfully for property_id: $propertyId by user_id: " . Auth::id());
    
            return redirect()->route('properties.show', $propertyId)->with('success', 'Review submitted successfully.');
        } catch (\Exception $e) {
            Log::error("Error submitting review: " . $e->getMessage());
            return redirect()->back()->with('error', 'Error submitting review. Please try again.');
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'numeric|between:1,5',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], 400);
        }

        $review = Review::findOrFail($id);
        $user = Auth::user();

        // Check if the user is the owner or an admin
        if ($user->id !== $review->user_id && !$user->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $review->update($request->only(['rating', 'comment']));

        return response()->json(['status' => 'success', 'data' => $review], 200);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $user = Auth::user();

        // Check if the user is the owner or an admin
        if ($user->id !== $review->user_id && !$user->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $review->delete();

        return response()->json(['status' => 'success', 'message' => 'Review deleted successfully'], 200);
    }
}