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
        Schema::table('internship_applications', function (Blueprint $table) {
            $table->decimal('ipk_score', 8, 2)->nullable()->change();
            $table->decimal('skill_score', 8, 2)->nullable()->change();
            $table->decimal('experience_score', 8, 2)->nullable()->change();
            $table->decimal('motivation_score', 8, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internship_applications', function (Blueprint $table) {
            $table->integer('ipk_score')->nullable()->change();
            $table->integer('skill_score')->nullable()->change();
            $table->integer('experience_score')->nullable()->change();
            $table->integer('motivation_score')->nullable()->change();
        });
    }
};
