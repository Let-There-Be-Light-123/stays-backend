<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\File;

class FilesTableSeeder extends Seeder
{
    /**
     * Run the seeder.
     *
     * @return void
     */
    public function run()
    {
        // Replace these values with your actual data
        $fileData = [
            ['property_id' => 'P001', 'filename' => 'image1.jpg', 'filepath' => 'public/storage/uploads/download.jpg', 'filetype' => 'image/jpeg'],
            ['property_id' => 'P001', 'filename' => 'image2.png', 'filepath' => 'public/storage/uploads/chandelier.png', 'filetype' => 'image/png'],
        ];


        foreach ($fileData as $data) {
            File::create($data);
        }
    }
}