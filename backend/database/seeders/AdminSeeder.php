<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin
        Admin::updateOrCreate(
            ['email' => 'admin@seveninc.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
                'role' => Admin::ROLE_ADMIN,
            ]
        );

        // 2. Editor / Reviewer
        Admin::updateOrCreate(
            ['email' => 'reviewer@seveninc.com'],
            [
                'name' => 'Reviewer Editor',
                'password' => Hash::make('password123'),
                'role' => Admin::ROLE_REVIEWER,
            ]
        );

        // 3. Content Writer
        Admin::updateOrCreate(
            ['email' => 'writer@seveninc.com'],
            [
                'name' => 'Content Writer',
                'password' => Hash::make('password123'),
                'role' => Admin::ROLE_WRITER,
            ]
        );
    }
}
