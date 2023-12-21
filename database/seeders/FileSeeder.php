<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\File;
use App\Models\Property;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class FileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Log a message when the seeder starts
        Log::info('FileSeeder started');

        $property = Property::where('property_id', 'P001')->first();

        if ($property) {
            // Copy the file to the storage/uploads directory
            $sourceFilePath = storage_path('app/public/uploads/beautiful-outdoor.png');
            $destinationFilePath = 'public/uploads/beautiful-outdoor.png';

            Storage::put($destinationFilePath, file_get_contents($sourceFilePath));

            // Log a message when the file is copied
            Log::info('File copied to destination: ' . $destinationFilePath);

            // Create a record in the files table
            File::create([
                'property_id' => $property->property_id,
                'filename' => 'chandelier.jpeg',
                'filetype' => 'image/jpeg', // Adjust the file type accordingly
                'filepath' => $destinationFilePath,
            ]);

            // Log a message when the file record is created
            Log::info('File record created for property ' . $property->id);
        } else {
            // Log an error message if the property is not found
            Log::error('Property not found with ID P001');
        }

        // Log a message when the seeder completes
        Log::info('FileSeeder completed');
    }
}
