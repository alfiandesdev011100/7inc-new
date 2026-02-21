<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_settings', function (Blueprint $table) {
            $table->id();
            // Join Banner Section
            $table->string('join_title')->nullable();
            $table->text('join_subtitle')->nullable();
            $table->string('join_button_text')->default('Daftar Sekarang');
            $table->string('join_image_path')->nullable();
            $table->timestamps();
        });

        // Seed initial record
        \DB::table('home_settings')->insert([
            'join_title' => 'Kesempatan Berkembang Bersama Seven INC.',
            'join_subtitle' => 'Bergabunglah sekarang dan jadilah bagian dari perjalanan kami.',
            'join_button_text' => 'Daftar Sekarang',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_settings');
    }
};
