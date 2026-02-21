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
        // 1. Perluas ENUM untuk mencakup nilai lama DAN baru
        DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('super_admin', 'admin_konten', 'admin', 'writer') NOT NULL DEFAULT 'writer'");

        // 2. Update existing role values
        DB::table('admins')
            ->where('role', 'super_admin')
            ->update(['role' => 'admin']);
        
        DB::table('admins')
            ->where('role', 'admin_konten')
            ->update(['role' => 'writer']);

        // 3. Perkecil ENUM hanya ke nilai baru
        DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('admin', 'writer') NOT NULL DEFAULT 'writer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert role values
        DB::table('admins')
            ->where('role', 'admin')
            ->update(['role' => 'super_admin']);
        
        DB::table('admins')
            ->where('role', 'writer')
            ->update(['role' => 'admin_konten']);

        // Revert the enum column to old values
        DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('super_admin', 'admin_konten') NOT NULL DEFAULT 'admin_konten'");
    }
};
