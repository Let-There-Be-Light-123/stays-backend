<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rooms')->insert([
            [
                'room_id' => 'P001R001',
                'property_id' => 'P001', // Use the actual property ID
                'room_name' => 'Deluxe Room',
                'is_active' => true,
                'room_description' => 'The deluxe luxury room.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 'P001R002',
                'property_id' => 'P001', // Use the actual property ID
                'room_name' => 'Standard Room',
                'is_active' => true,
                'room_description' => 'The deluxe luxury room.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_id' => 'P001R003',
                'property_id' => 'P001', // Use the actual property ID
                'room_name' => 'Penthouse',
                'is_active' => true,
                'room_description' => 'The deluxe luxury room.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
