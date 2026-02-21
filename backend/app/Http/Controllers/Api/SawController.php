<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SawAnalysisResult;
use App\Models\ActivityLog;
use App\Services\SawService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SawController extends Controller
{
    use ApiResponse;

    protected $sawService;

    public function __construct(SawService $sawService)
    {
        $this->sawService = $sawService;
    }

    /**
     * Admin: Upload CSV and validate structure
     */
    public function uploadCSV(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('csv_file');
        $user = Auth::user();

        // 1. Log: upload
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_upload',
            'model' => 'SawModule',
            'after' => ['filename' => $file->getClientOriginalName()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 2. Preprocessing: Read and Validate Structure
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));
        $header = array_shift($data);

        $requiredHeaders = ['name', 'education', 'experience', 'skill', 'interview'];
        if (!$this->sawService->validateHeader($header, $requiredHeaders)) {
            return $this->errorResponse('Struktur CSV tidak valid', ['required' => $requiredHeaders]);
        }

        // Log: preprocessing
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_preprocessing',
            'model' => 'SawModule',
            'after' => ['row_count' => count($data)],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Convert data to associative array for frontend to review or for direct analysis
        $candidates = [];
        foreach ($data as $row) {
            $candidates[] = array_combine($header, $row);
        }

        return $this->successResponse([
            'headers' => $header,
            'candidates' => $candidates
        ], 'CSV berhasil diunggah dan divalidasi');
    }

    /**
     * Admin: Run SAW Analysis (Async)
     */
    public function runAnalysis(Request $request)
    {
        $request->validate([
            'candidates' => 'required|array',
            'weights' => 'required|array',
            'weights.education' => 'required|numeric|min:0|max:1',
            'weights.experience' => 'required|numeric|min:0|max:1',
            'weights.skill' => 'required|numeric|min:0|max:1',
            'weights.interview' => 'required|numeric|min:0|max:1',
        ]);

        // Dynamic Threshold: Minimum 2 candidates for comparison
        if (count($request->candidates) < 2) {
            return $this->errorResponse('Minimal data kandidat untuk analisis adalah 2 orang.');
        }

        $totalWeight = array_sum($request->weights);
        if (abs($totalWeight - 1) > 0.001) {
            return $this->errorResponse('Total bobot harus sama dengan 1 (100%)');
        }

        $user = Auth::user();
        $sessionId = (string) Str::uuid();
        $criteria = ['education', 'experience', 'skill', 'interview'];

        // Dispatch Job for Async Processing
        \App\Jobs\ProcessSawAnalysis::dispatch(
            $request->candidates,
            $request->weights,
            $criteria,
            $sessionId,
            $user->id
        );

        // Log: Calculation initiated
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_calculation_queued',
            'model' => 'SawModule',
            'after' => [
                'session_id' => $sessionId,
                'candidate_count' => count($request->candidates),
                'weights' => $request->weights
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Analisis SAW sedang diproses di background',
            'session_id' => $sessionId
        ]);
    }

    /**
     * Admin: Get results by session
     */
    public function getResults(Request $request, $sessionId)
    {
        $results = SawAnalysisResult::where('session_id', $sessionId)
            ->orderBy('ranking', 'asc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $results
        ]);
    }

    /**
     * Admin: Delete analysis session
     */
    public function deleteResults($sessionId)
    {
        SawAnalysisResult::where('session_id', $sessionId)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Data analisis telah dihapus'
        ]);
    }
}
