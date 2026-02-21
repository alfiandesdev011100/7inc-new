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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->foreignId('job_work_id')->constrained('job_works')->onDelete('cascade');
            
            // New Fields based on Google Form
            $table->string('school')->nullable();
            $table->string('major')->nullable();
            $table->enum('gender', ['Laki-laki', 'Perempuan'])->nullable();
            $table->string('domicile')->nullable();
            $table->enum('internship_type', ['Mandiri', 'Reguler'])->nullable();
            $table->string('current_status')->nullable(); // Sekolah/Lulus/Bekerja
            $table->boolean('shift_availability')->default(false);
            $table->boolean('own_equipment')->default(false);
            $table->string('equipment_details')->nullable();
            $table->date('start_date')->nullable();
            $table->integer('duration')->nullable(); // in months
            $table->string('info_source')->nullable();
            $table->text('other_activities')->nullable();
            
            // Kriteria untuk SPK SAW (disesuaikan dengan kebutuhan analisis)
            $table->integer('education_score')->nullable(); // Nilai Pendidikan (0-100)
            $table->integer('experience_score')->nullable(); // Nilai Pengalaman (0-100)
            $table->integer('skill_score')->nullable(); // Nilai Skill (0-100)
            $table->integer('interview_score')->nullable(); // Nilai Interview (0-100)
            
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
        Schema::dropIfExists('job_applications');
    }
};
