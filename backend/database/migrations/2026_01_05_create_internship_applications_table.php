<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('internship_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('internship_type'); // UI/UX, Frontend, Backend, dll
            
            // Kriteria untuk SPK SAW (disesuaikan dengan kebutuhan analisis)
            $table->integer('ipk_score')->nullable(); // Nilai IPK (0-100)
            $table->integer('skill_score')->nullable(); // Nilai Skill (0-100)
            $table->integer('experience_score')->nullable(); // Nilai Pengalaman (0-100)
            $table->integer('motivation_score')->nullable(); // Nilai Motivasi (0-100)
            
            $table->decimal('saw_score', 8, 4)->nullable(); // Hasil perhitungan SAW
            $table->integer('ranking')->nullable(); // Ranking berdasarkan SAW
            
            $table->enum('status', ['pending', 'reviewed', 'accepted', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internship_applications');
    }
};
