<?php

namespace App\Http\Controllers;
use App\Models\Review;
use Auth;

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
        $validator = Validator::make($request->all(), [
            'property_id' => 'required',
            'rating' => 'required|numeric|between:1,5',
            'comment' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()], 400);
        }

        $user = Auth::user();
        $data = $request->only(['property_id', 'rating', 'comment']);
        $data['user_id'] = $user->id;

        $review = Review::create($data);

        return response()->json(['status' => 'success', 'data' => $review], 201);
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