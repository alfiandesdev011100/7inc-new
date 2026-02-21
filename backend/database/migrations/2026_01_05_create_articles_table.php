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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('image')->nullable();
            $table->string('slug')->unique();
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'published'])->default('draft');
            $table->string('target_page')->nullable(); // beranda, tentang-kami, bisnis-kami, dll
            $table->string('display_type')->nullable(); // hero, section, card, dll
            $table->foreignId('author_id')->constrained('admins')->onDelete('cascade');
            $table->foreignId('reviewer_id')->nullable()->constrained('admins')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
