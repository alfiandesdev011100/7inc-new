<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_works', function (Blueprint $table) {
            $table->id();
            $table->string('title');        // Contoh: UI/UX Designer
            $table->string('company');      // Contoh: Seven Inc
            $table->string('location');     // Contoh: Yogyakarta
            $table->date('close_date');     // Tanggal penutupan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_works');
    }
};
