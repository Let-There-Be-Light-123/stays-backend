<?php
// app\Helpers\PropertyHelper.php

namespace App\Helpers;

use App\Models\Property;
use App\Models\Room;
use App\Models\Image;

class PropertyHelper
{
    /**
     * Update or create rooms for a property.
     *
     * @param int $propertyId
     * @param array $roomsData
     * @return void
     */
    public static function updateOrCreateRooms($propertyId, array $roomsData)
    {
        $property = Property::with('rooms')->find($propertyId);

        if ($property) {
            $property->rooms()->delete(); // Delete existing rooms, if needed
            $property->rooms()->createMany($roomsData);
        }
    }

    /**
     * Update or create images for a property.
     *
     * @param int $propertyId
     * @param array $imagesData
     * @return void
     */
    public static function updateOrCreateImages($propertyId, array $imagesData)
    {
        $property = Property::with('images')->find($propertyId);

        if ($property) {
            $property->images()->delete(); // Delete existing images, if needed
            $property->images()->createMany($imagesData);
        }
    }
}
