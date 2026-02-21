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
        Schema::create('saw_analysis_results', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('session_id')->index(); // To group results of one analysis run
            $blueprint->string('candidate_name');
            $blueprint->json('criteria_scores'); // education, experience, skill, interview, etc.
            $blueprint->decimal('final_score', 8, 4);
            $blueprint->integer('ranking');
            $blueprint->unsignedBigInteger('admin_id');
            $blueprint->timestamps();

            $blueprint->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saw_analysis_results');
    }
};
