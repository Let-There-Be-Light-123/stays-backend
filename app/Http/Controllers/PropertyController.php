<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\File;
use App\Models\Room;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PropertyController extends Controller
{
    public function index()
    {
        try {
            $properties = Property::all();
            // Log a success message
            Log::info('Properties fetched successfully.');

            return response()->json(['status' => 'success', 'data' => $properties]);
        } catch (\Exception $e) {
            // Log an error message
            Log::error('Error fetching properties: ' . $e->getMessage());

            return $this->errorResponse($e);
        }
    }

    public function getFeaturedProperties()
    {
        try {
            // Log::info('Fetched Featured Properties: ');

            $featuredProperties = Property::where('is_active', 1)
                ->where('is_featured', 1)
                ->with('files')
                ->get();
            // Log::info('Fetched Featured Properties: ' . json_encode($featuredProperties));
            return response()->json(['status' => 'success', 'data' => $featuredProperties]);
        } catch (\Exception $e) {
            Log::info('Error fetching featured properties: ' . $e->getMessage());
            return $this->errorResponse($e);
        }
    }
    public function getMostLikedProperties()
    {
        try {
            $mostLikedProperties = Property::orderBy('likes', 'desc')
                ->take(10)
                ->with('files')
                ->get();
            // Log::info('Fetched Most Liked Properties: ' . json_encode($mostLikedProperties));
            return response()->json(['status' => 'success', 'data' => $mostLikedProperties]);
        } catch (\Exception $e) {
            Log::info('Error fetching featured properties: ' . $e->getMessage());
            return $this->errorResponse($e);
        }
    }


    public function store(Request $request)
    {
        try {
            $request->validate([
                // Add validation rules for your property fields here
            ]);

            $property = Property::create($request->all());

            return response()->json(['status' => 'success', 'data' => $property], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->errorResponse($e);
        }
    }

    public function show($propertyId)
    {
        try {
            Log::info('Fetching property details for ID: ' . $propertyId);
            $propertyWithDetails = Property::with(['rooms', 'files'])->find($propertyId);
            if ($propertyWithDetails) {
                return response()->json(['status' => 'success', 'data' => $propertyWithDetails]);
            } else {
                Log::warning('Property not found with ID: ' . $propertyId);
                return response()->json(['status' => 'error', 'message' => 'Property not found'], Response::HTTP_NOT_FOUND);
            }
        } catch (\Exception $e) {
            Log::error('Error fetching property details: ' . $e->getMessage());
            return $this->errorResponse($e);
        }
    }
    public function update(Request $request, Property $property)
    {
        try {
            $request->validate([
                'property_id' => 'exists:properties,id',
            ]);
            $property->update($request->all());
            if ($request->has('files')) {
                $newFiles = $request->input('files', []);
                $property->files()->sync($newFiles);
            }
            if ($request->has('rooms')) {
                $newRooms = $request->input('rooms', []);
                $property->rooms()->sync($newRooms);
            }
            Log::info("Property updated successfully. Property ID: {$property->id}");
            return response()->json(['status' => 'success', 'data' => $property], Response::HTTP_OK);
        } catch (\Exception $e) {
            Log::error("Error updating property. Property ID: {$property->id}, Error: {$e->getMessage()}");
            return $this->errorResponse($e);
        }
    }

    public function destroy(Property $property)
    {
        try {
            $property->delete();

            return response()->json(['status' => 'success', 'message' => 'Property deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return $this->errorResponse($e);
        }
    }
    public function destroyMultiple(Request $request)
    {
        try {
            $request->validate([
                'property_ids' => 'required|array',
                'property_ids.*' => 'exists:properties,property_id',
            ]);
            $propertyIds = $request->input('property_ids');
            $filesToDelete = File::whereIn('property_id', $propertyIds)->get();
            $roomsToDelete = Room::whereIn('property_id', $propertyIds)->get();
            foreach ($filesToDelete as $file) {
                if (!empty($file->filepath)) {
                    Storage::delete($file->filepath);
                    $file->delete();
                }
            }
            foreach ($roomsToDelete as $room) {
                $room->delete();
            }
            Property::whereIn('property_id', $propertyIds)->delete();
            Log::info('Properties, associated files, and rooms deleted successfully. Property IDs: ' . implode(', ', $propertyIds));
            return response()->json(['status' => 'success', 'message' => 'Properties, associated files, and rooms deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            Log::error('Error deleting properties, associated files, and rooms: ' . $e->getMessage());
            Log::error('Request data: ' . json_encode($request->all()));
            return $this->errorResponse($e, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    private function errorResponse(\Exception $e, $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR)
    {
        Log::error('Error response: ' . $e->getMessage());
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], $statusCode);
    }

    public function searchProperty(Request $request)
    {
        try {
            $request->validate([
                'location' => 'required|string',
            ]);

            $location = $request->input('location');

            // Perform a search based on the location
            $searchedProperties = Property::where('address', 'LIKE', '%' . $location . '%')
                ->with('files')
                ->get();

            return response()->json(['status' => 'success', 'data' => $searchedProperties]);
        } catch (\Exception $e) {
            return $this->errorResponse($e);
        }
    }
    public function getPropertyDetailsByIds(Request $request)
    {
        try {
            Log::info('Received request for getPropertyDetailsByIds: ' . json_encode($request->all()));
    
            $request->validate([
                'property_ids' => 'required|array',
                'property_ids.*' => 'exists:properties,property_id',
            ]);
    
            $propertyIds = $request->input('property_ids');
            Log::info('Received property IDs: ' . json_encode($propertyIds));
    
            $propertiesDetails = Property::whereIn('property_id', $propertyIds)
                ->with(['files', 'rooms'])
                ->get();
            Log::info('Fetched property details: ' . json_encode($propertiesDetails));
            return response()->json(['status' => 'success', 'data' => $propertiesDetails]);
        } catch (\Exception $e) {
            Log::error('Exception in getPropertyDetailsByIds: ' . $e->getMessage());
    
            return $this->errorResponse($e);
        }
    }
    public function searchPropertiesInCity(Request $request)
    {
        try {
            $request->validate([
                'city' => 'required|string',
            ]);
            $city = $request->input('city');
            Log::info("Searching properties in city: $city");
            $propertiesInCity = Property::where('address', 'LIKE', '%' . $city . '%')
                ->with('files')
                ->get();
            Log::info("Found " . $propertiesInCity->count() . " properties in city: $city");
            return response()->json(['status' => 'success', 'data' => $propertiesInCity]);
        } catch (\Exception $e) {
            Log::error("Error in searchPropertiesInCity: " . $e->getMessage());
            return $this->errorResponse($e);
        }
    }

}
