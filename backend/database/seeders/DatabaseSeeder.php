<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil AdminSeeder untuk membuat akun Super Admin & Admin Konten
        $this->call([
            AdminSeeder::class,
            CategorySeeder::class,
            JobSeeder::class,
        ]);

        // Opsional: Jika nanti butuh data dummy untuk Customer (User biasa)
        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
