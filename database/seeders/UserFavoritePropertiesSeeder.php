<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserFavoriteProperty;


class UserFavoritePropertiesSeeder extends Seeder
{
 /**
     * Run the database seeds.
     *
     * @return void
     */

     public function run()
     {
         $userIds = [12457812, 201201748, 123456789, 111211111, 111111111];
         $propertyIds = ['P001', 'P056', 'P23', 'P003'];
     
         foreach ($userIds as $userId) {
             foreach ($propertyIds as $propertyId) {
                 UserFavoriteProperty::create([
                     'social_security' => $userId,
                     'property_id' => $propertyId,
                 ]);
             }
         }
     }
}
