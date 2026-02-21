<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();        // Nama kategori
            $table->string('slug')->unique();        // slug-url
            $table->text('description')->nullable(); // deskripsi opsional
            $table->timestamps();
        });

        // Tambahkan kolom category_id ke tabel berita jika belum
        if (Schema::hasTable('news')) {
            Schema::table('news', function (Blueprint $table) {
                if (!Schema::hasColumn('news', 'category_id')) {
                    $table->unsignedBigInteger('category_id')->nullable()->after('id');
                    $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            if (Schema::hasColumn('news', 'category_id')) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            }
        });

        Schema::dropIfExists('categories');
    }
};
