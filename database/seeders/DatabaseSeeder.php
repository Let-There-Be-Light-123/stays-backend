<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        \App\Models\User::factory()->create([
            'uuid' => Str::uuid(),
            'name' => 'Test User2',
            'email' => 'admin2@email.com',
            'password' => bcrypt(12451245),
            'social_security' => 123457866,
            'phone' => 0,
            'role_uuid' => '',
            'is_verified' => false,
            'email_verified_at' => now(),
            'remember_token' => '',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
