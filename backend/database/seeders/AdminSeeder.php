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
        // 1. Buat Super Admin (Bisa segalanya)
        Admin::create([
            'name' => 'Super Administrator',
            'email' => 'super@seveninc.com',
            'password' => Hash::make('password123'), // Ganti password yang kuat nanti
            'role' => 'super_admin',
            'avatar' => null,
        ]);

        // 2. Buat Admin Konten (Hanya bisa edit berita/loker)
        Admin::create([
            'name' => 'Content Writer',
            'email' => 'writer@seveninc.com',
            'password' => Hash::make('password123'),
            'role' => 'admin_konten',
            'avatar' => null,
        ]);
    }
}
