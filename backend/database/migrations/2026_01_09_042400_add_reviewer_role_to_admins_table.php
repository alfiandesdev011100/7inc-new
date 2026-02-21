<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'reviewer' to the role enum in admins table
        DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('admin', 'writer', 'reviewer') NOT NULL DEFAULT 'writer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original roles
        DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('admin', 'writer') NOT NULL DEFAULT 'writer'");
    }
};
