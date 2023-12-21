<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Permission;
use App\Models\UserPermission;

class UserPermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Example: Seed user_permissions table based on existing relationships

        // Get all users and permissions
        $users = User::all();
        $permissions = Permission::all();

        // Iterate through users
        foreach ($users as $user) {
            // Get random permissions for each user
            $permissionsToAssign = $permissions->random(2); // Change the number as needed

            // Iterate through permissions
            foreach ($permissionsToAssign as $permission) {
                // Check if the relationship already exists
                if (!$user->permissions->contains($permission)) {
                    // Attach the permission to the user
                    $user->permissions()->attach($permission);
                }
            }
        }
    }
}
