<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class RoleTableSeeder extends Seeder
{
        /**
     * Run the seeder.
     *
     * @return void
     */
    public function run()
    {
        DB::table('roles')->insert([
            [
                'role_id' => 'superadmin',
                'role_name' => 'Superadmin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 'admin',
                'role_name' => 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 'staff',
                'role_name' => 'Staff',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => 'appuser',
                'role_name' => 'AppUser',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
