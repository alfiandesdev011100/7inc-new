<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class JobSeeder extends Seeder
{
    public function run()
    {
        // Create or Update Job
        DB::table('job_works')->updateOrInsert(
            ['title' => 'Staff Human Resources Development (HRD)'],
            [
                'company' => 'Seven INC',
                'location' => 'Bantul, Kabupaten Bantul, Daerah Istimewa Yogyakarta',
                'close_date' => '2025-06-30',
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );

        // Note: Requirements table structure doesn't support the 'type' column
        // that was originally in this seeder. If you need to seed requirements,
        // please update the requirements table migration first to add the 'type' column.
    }
}
