<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogExportController extends Controller
{
    /**
     * Export activity logs to CSV.
     */
    public function exportCSV(Request $request)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="activity_logs_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            
            // Add header row
            fputcsv($file, ['ID', 'User ID', 'Role', 'Action', 'Model', 'Changes', 'IP Address', 'Created At']);

            // Stream logs to avoid memory issues
            ActivityLog::with('user')->chunk(100, function ($logs) use ($file) {
                foreach ($logs as $log) {
                    fputcsv($file, [
                        $log->id,
                        $log->user_id,
                        $log->role,
                        $log->action,
                        $log->model,
                        json_encode($log->after),
                        $log->ip_address,
                        $log->created_at,
                    ]);
                }
            });

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
