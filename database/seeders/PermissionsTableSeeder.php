<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Define the permissions data
        $permissions = [
            [
                'permission_id' => 'superadmin_full_access',
                'permission_name' => 'Superadmin Full Access',
                'permission_description' => 'Has all permissions for complete access.',
            ],
            [
                'permission_id' => 'admin_manage_users',
                'permission_name' => 'Admin Manage Users',
                'permission_description' => 'Can manage users, roles, and permissions.',
            ],
            [
                'permission_id' => 'admin_manage_bookings',
                'permission_name' => 'Admin Manage Bookings',
                'permission_description' => 'Can manage booking-related operations.',
            ],
            [
                'permission_id' => 'staff_manage_bookings',
                'permission_name' => 'Staff Manage Bookings',
                'permission_description' => 'Can handle bookings and related tasks.',
            ],
            [
                'permission_id' => 'appuser_basic_access',
                'permission_name' => 'App User Basic Access',
                'permission_description' => 'Basic access for app users.',
            ],
            [
                'permission_id' => 'guest_basic_access',
                'permission_name' => 'Guest Basic Access',
                'permission_description' => 'Basic access for guests.',
            ],
        ];
        DB::table('permissions')->insert($permissions);
    }
}
