<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_page_settings', function (Blueprint $table) {
            $table->id();
            $table->string('banner_title')->nullable();
            $table->string('banner_subtitle')->nullable();
            $table->string('banner_image_path')->nullable();
            $table->timestamps();
        });

        // Seed initial record
        \DB::table('news_page_settings')->insert([
            'banner_title' => 'Beberapa berita terbaru kami',
            'banner_subtitle' => 'LIST BERITA',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('news_page_settings');
    }
};
