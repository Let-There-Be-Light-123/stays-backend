<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\File;

use Auth;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

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
            if (!Auth::check()) {
                return redirect()->back()->with('error', 'You must be logged in to submit a review.');
            }
    
            $propertyId = $request->input('property_id');
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
    
            Review::create([
                'social_security' => optional(Auth::user())->social_security,
                'property_id' => $propertyId,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
    
    
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

        if ($user->id !== $review->user_id && !$user->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $review->update($request->only(['rating', 'comment']));

        return response()->json(['status' => 'success', 'data' => $review], 200);
    }

    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
    
            $files = $review->files;
    
            foreach ($files as $file) {
                Storage::delete($file->filepath . '/' . $file->filename);
                $file->delete();
            }
    
            $reviewDirectory = "public/uploads/reviews/{$review->id}";
            Storage::deleteDirectory($reviewDirectory);
            $review->delete();
    
            return response()->json(['status' => 'success', 'message' => 'Review and associated files deleted successfully'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Review not found'], 404);
        } catch (\Exception $e) {
            Log::error("Error deleting review: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Error deleting review. Please try again.'], 500);
        }
    }
    public function createReviews(Request $request)
    {
        try {
            $requestData = $request->all();
            $propertyId = $requestData['property_id'];
            $rating = $requestData['rating'];
            $comment = $requestData['comment'];
    
            $userRole = optional(Auth::user())->role_id;
    
            if ($userRole !== 'admin') {
                $existingReview = Review::where('property_id', $propertyId)
                    ->where('social_security', optional(Auth::user())->social_security)
                    ->first();
    
                if ($existingReview) {
                    return response()->json(['error' => 'You have already submitted a review for this property.'], 422);
                }
            }
    
            $request->validate([
                'rating' => 'required|integer|min:0|max:5',
                'comment' => 'required|string',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);
    
            $userId = Auth::user()->social_security;
            $review = Review::create([
                'social_security' => optional(Auth::user())->social_security,
                'property_id' => $propertyId,
                'rating' => $rating,
                'comment' => $comment,
            ]);
    
            $reviewDirectory = "public/uploads/reviews/{$review->id}";
    
    
            if ($request->hasFile('images')) {
                if (!Storage::exists($reviewDirectory)) {
                    Storage::makeDirectory($reviewDirectory);
                    Storage::setVisibility($reviewDirectory, 'public');
                }
            
                foreach ($request->file('images') as $image) {
                    $imageName = time() . '_' . $image->getClientOriginalName();
                    $image->storeAs($reviewDirectory, $imageName, 'public');
            
                    File::create([
                        'review_id' => $review->id,
                        'social_security' => optional(Auth::user())->social_security,
                        'filename' => $imageName,
                        'filepath' => $reviewDirectory,
                        'filetype' => pathinfo($imageName, PATHINFO_EXTENSION),
                    ]);
            
                }
            }
    
    
            return response()->json(['success' => 'Review submitted successfully', 'property_id' => $propertyId]);
        } catch (ValidationException $e) {
            Log::error("Validation error: " . $e->getMessage());
            return response()->json(['error' => 'Validation error', 'details' => $e->validator->errors()], 422);
        } catch (\Exception $e) {
            Log::error("Error submitting review: " . $e->getMessage());
            return response()->json(['error' => 'Error submitting review. Please try again.'], 500);
        }
    }

        /**
     * Show reviews for a specific property.
     *
     * @param  int  $propertyId
     * @r`eturn \Illuminate\Http\JsonResponse
     */
    public function showPropertyReviews(Request $request)
    {
        try {
            $limit = 5;
    
            $offset = $request->input('offset', 0);
            $propertyId = $request->property_id;
            $reviews = Review::where('property_id', $propertyId)
                ->offset($offset)
                ->limit($limit)
                ->get();
    
            if ($reviews->isEmpty()) {
                return response()->json(['status' => 'success', 'message' => 'No more reviews found for this property.'], 200);
            }
    
            $formattedReviews = $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => doubleval($review->rating),
                    'comment' => $review->comment,
                    'user' => [
                        'id' => $review->user->social_security,
                        'name' => $review->user->name,
                    ],
                    'files' => $review->files->map(function ($file) {
                        return [
                            'id' => $file->id,
                            'filename' => $file->filename,
                            'filepath' => $file->filepath,
                            'filetype' => $file->filetype,
                        ];
                    }),
                    'created_at' => $review->created_at,
                ];
            });
    
            $nextOffset = $offset + $limit;
    
            return response()->json([
                'status' => 'success',
                'data' => $formattedReviews,
                'next_offset' => $nextOffset,
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error retrieving property reviews: " . $e->getMessage());
            return response()->json(['error' => 'Error retrieving reviews. Please try again.'], 500);
        }
    }
}