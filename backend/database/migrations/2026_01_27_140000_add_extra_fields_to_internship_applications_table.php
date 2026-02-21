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
            if (!Schema::hasColumn('internship_applications', 'university')) {
                $table->string('university')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('internship_applications', 'major')) {
                $table->string('major')->nullable()->after('university');
            }
            if (!Schema::hasColumn('internship_applications', 'gender')) {
                $table->string('gender')->nullable()->after('major');
            }
            if (!Schema::hasColumn('internship_applications', 'domicile')) {
                $table->string('domicile')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('internship_applications', 'duration')) {
                $table->string('duration')->nullable()->after('domicile');
            }
            if (!Schema::hasColumn('internship_applications', 'tools_available')) {
                $table->text('tools_available')->nullable()->after('duration');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internship_applications', function (Blueprint $table) {
            $table->dropColumn(['university', 'major', 'gender', 'domicile', 'duration', 'tools_available']);
        });
    }
};
