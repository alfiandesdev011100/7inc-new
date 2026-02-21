<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\InternshipApplication;
use App\Models\ContactMessage;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getStats()
    {
        try {
            $stats = [
                'applicants' => JobApplication::count(),
                'interns' => InternshipApplication::count(),
                'messages' => ContactMessage::count(),
                'tasks' => Task::count(),
            ];

            return response()->json([
                'status' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil statistik dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
