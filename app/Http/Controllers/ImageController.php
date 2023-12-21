<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ImageController extends Controller
{
    /**
     * Display a listing of the Image associated with a property.
     */
    public function index($propertyId)
    {
        $Image = Image::getByPropertyId($propertyId);

        return response(['status' => 200, 'Image' => $Image], 200);
    }

    /**
     * Store a newly created image associated with a property in storage.
     */
    public function store(Request $request, $propertyId)
    {
        $request->validate([
            'image_url' => 'required|url',
            // Add other validation rules as needed
        ]);

        $imageUrl = $request->input('image_url');
        $image = Image::createForProperty($propertyId, $imageUrl);

        return response(['status' => 201, 'image' => $image], 201);
    }

    /**
     * Update the specified image associated with a property in storage.
     */
    public function update(Request $request, $propertyId, $imageId)
    {
        $request->validate([
            'image_url' => 'required|url',
            // Add other validation rules as needed
        ]);

        $imageUrl = $request->input('image_url');
        $image = Image::updateForProperty($imageId, $imageUrl);

        if ($image) {
            return response(['status' => 200, 'image' => $image], 200);
        }

        return response(['status' => 404, 'message' => 'Image not found'], 404);
    }

    /**
     * Remove the specified image associated with a property from storage.
     */
    public function destroy($propertyId, $imageId)
    {
        $image = Image::deleteForProperty($imageId);

        if ($image) {
            return response(['status' => 200, 'message' => 'Image deleted successfully'], 200);
        }

        return response(['status' => 404, 'message' => 'Image not found'], 404);
    }
}
