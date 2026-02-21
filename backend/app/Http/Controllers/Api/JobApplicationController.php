<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
    // Admin: List semua pelamar pekerjaan
    public function index(Request $request)
    {
        $query = JobApplication::with('jobWork');

        // Filter by job_work_id if provided
        if ($request->has('job_work_id')) {
            $query->where('job_work_id', $request->job_work_id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->orderBy('ranking', 'asc')
            ->orderBy('saw_score', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'status' => true,
            'data' => $applications
        ]);
    }

    // Admin: Input data pelamar dari Google Form (manual entry)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'job_work_id' => 'required|exists:job_works,id',
            'education_score' => 'nullable|integer|min:0|max:100',
            'experience_score' => 'nullable|integer|min:0|max:100',
            'skill_score' => 'nullable|integer|min:0|max:100',
            'interview_score' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $application = JobApplication::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Data pelamar pekerjaan berhasil ditambahkan',
            'data' => $application->load('jobWork')
        ], 201);
    }

    // Admin: Melihat detail pelamar
    public function show($id)
    {
        $application = JobApplication::with('jobWork')->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $application
        ]);
    }

    // Admin: Update data pelamar
    public function update(Request $request, $id)
    {
        $application = JobApplication::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'job_work_id' => 'sometimes|required|exists:job_works,id',
            'education_score' => 'nullable|integer|min:0|max:100',
            'experience_score' => 'nullable|integer|min:0|max:100',
            'skill_score' => 'nullable|integer|min:0|max:100',
            'interview_score' => 'nullable|integer|min:0|max:100',
            'status' => 'sometimes|required|in:pending,reviewed,accepted,rejected',
            'notes' => 'nullable|string',
        ]);

        $application->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Data pelamar berhasil diperbarui',
            'data' => $application->load('jobWork')
        ]);
    }

    // Admin: Hapus data pelamar
    public function destroy($id)
    {
        $application = JobApplication::findOrFail($id);
        $application->delete();

        return response()->json([
            'status' => true,
            'message' => 'Data pelamar berhasil dihapus'
        ]);
    }

    // Admin: Analisis SPK SAW
    public function analyzeSAW(Request $request)
    {
        $request->validate([
            'job_work_id' => 'nullable|exists:job_works,id',
            'weights' => 'required|array',
            'weights.education' => 'required|numeric|min:0|max:1',
            'weights.experience' => 'required|numeric|min:0|max:1',
            'weights.skill' => 'required|numeric|min:0|max:1',
            'weights.interview' => 'required|numeric|min:0|max:1',
        ]);

        // Validate weights sum to 1
        $totalWeight = $request->weights['education'] + $request->weights['experience'] + 
                       $request->weights['skill'] + $request->weights['interview'];
        
        if (abs($totalWeight - 1) > 0.001) {
            return response()->json([
                'status' => false,
                'message' => 'Total bobot harus sama dengan 1 (100%)'
            ], 400);
        }

        // Get applications
        $query = JobApplication::query();
        if ($request->has('job_work_id')) {
            $query->where('job_work_id', $request->job_work_id);
        }
        $applications = $query->get();

        if ($applications->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Tidak ada data pelamar untuk dianalisis'
            ], 400);
        }

        // Find max values for normalization (benefit criteria)
        $maxEducation = $applications->max('education_score') ?: 1;
        $maxExperience = $applications->max('experience_score') ?: 1;
        $maxSkill = $applications->max('skill_score') ?: 1;
        $maxInterview = $applications->max('interview_score') ?: 1;

        // Calculate SAW score for each application
        foreach ($applications as $application) {
            $normalizedEducation = $application->education_score / $maxEducation;
            $normalizedExperience = $application->experience_score / $maxExperience;
            $normalizedSkill = $application->skill_score / $maxSkill;
            $normalizedInterview = $application->interview_score / $maxInterview;

            $sawScore = ($normalizedEducation * $request->weights['education']) +
                        ($normalizedExperience * $request->weights['experience']) +
                        ($normalizedSkill * $request->weights['skill']) +
                        ($normalizedInterview * $request->weights['interview']);

            $application->saw_score = $sawScore;
            $application->save();
        }

        // Sort by SAW score and assign ranking
        $applications = $applications->sortByDesc('saw_score')->values();
        foreach ($applications as $index => $application) {
            $application->ranking = $index + 1;
            $application->save();
        }

        // Log manual audit for SAW Analysis
        $user = $request->user();
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'process_saw_analysis',
            'model' => JobApplication::class,
            'after' => [
                'job_work_id' => $request->job_work_id,
                'candidate_count' => $applications->count(),
                'weights' => $request->weights
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Analisis SAW berhasil dilakukan',
            'data' => $applications->load('jobWork')
        ]);
    }

    // Admin: Import CSV and Run SAW Analysis
    public function importCSV(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|max:2048', // Biarkan filter di logic detail agar tidak kena error mime palsu
            'job_work_id' => 'required|exists:job_works,id',
            'weights' => 'required|array',
            'weights.education' => 'required|numeric|min:0|max:1',
            'weights.experience' => 'required|numeric|min:0|max:1',
            'weights.skill' => 'required|numeric|min:0|max:1',
            'weights.interview' => 'required|numeric|min:0|max:1',
        ]);

        $user = $request->user();
        $file = $request->file('csv_file');

        // 1. Log: Upload
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_csv_upload',
            'model' => JobApplication::class,
            'after' => ['filename' => $file->getClientOriginalName()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Preprocessing: Parse CSV
        $path = $file->getRealPath();
        $fileContentRaw = file_get_contents($path);
        
        // --- Fix Encoding (Malformed UTF-8) ---
        // Detect encoding
        $encoding = mb_detect_encoding($fileContentRaw, ['UTF-8', 'ISO-8859-1', 'WINDOWS-1252', 'ASCII'], true);
        
        if ($encoding && $encoding !== 'UTF-8') {
            $fileContent = mb_convert_encoding($fileContentRaw, 'UTF-8', $encoding);
        } else {
            // Fallback for cases where detection fails but content is malformed
            $fileContent = @iconv($encoding ?: 'UTF-8', 'UTF-8//IGNORE', $fileContentRaw);
        }

        // Remove UTF-8 BOM if present
        $fileContent = str_replace("\xEF\xBB\xBF", "", $fileContent);
        
        // Auto-detect delimiter
        $delimiters = [",", ";", "\t"];
        $delimiter = ",";
        $maxCount = 0;
        foreach ($delimiters as $d) {
            $count = substr_count(strtok($fileContent, "\n"), $d);
            if ($count > $maxCount) {
                $maxCount = $count;
                $delimiter = $d;
            }
        }

        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", $fileContent));
        $data = [];
        foreach ($lines as $line) {
            if (trim($line) === '') continue;
            $data[] = str_getcsv($line, $delimiter);
        }
        
        if (empty($data)) {
            return response()->json(['status' => false, 'message' => "File CSV kosong atau tidak terbaca."], 400);
        }

        $header = array_shift($data);

        // Map Indonesian headers to model fields
        $headerMap = [
            'email' => 'email',
            'mail' => 'email',
            'Nama Lengkap' => 'name',
            'name' => 'name',
            'No HP' => 'phone',
            'Telepon' => 'phone',
            'phone' => 'phone',
            'Asal Sekolah' => 'school',
            'Pendidikan Terakhir' => 'school',
            'school' => 'school',
            'Jurusan' => 'major',
            'major' => 'major',
            'Jenis Kelamin' => 'gender',
            'gender' => 'gender',
            'Lokasi Penempatan' => 'domicile',
            'Domisili' => 'domicile',
            'domicile' => 'domicile',
            'Pengalaman Kerja' => 'experience_score',
            'experience' => 'experience_score',
            'education' => 'education_score',
            'Pendidikan' => 'education_score',
            'Skill Utama' => 'skill_score',
            'skill' => 'skill_score',
            'interview' => 'interview_score',
            'Wawancara' => 'interview_score',
            'Kegiatan Anda' => 'other_activities',
            'other_activities' => 'other_activities',
        ];

        // Clean headers and find mapping
        $mappedHeaders = [];
        foreach ($header as $h) {
            $hClean = trim($h, " \t\n\r\0\x0B\xEF\xBB\xBF"); // Remove BOM and whitespace
            $found = false;
            foreach ($headerMap as $key => $target) {
                if (stripos($hClean, $key) !== false) {
                    $mappedHeaders[] = $target;
                    $found = true;
                    break;
                }
            }
            if (!$found) $mappedHeaders[] = $hClean;
        }

        // Required Check: name, email (basics)
        $basics = ['name', 'email'];
        foreach ($basics as $b) {
            if (!in_array($b, $mappedHeaders)) {
                return response()->json([
                    'status' => false, 
                    'message' => "Format CSV tidak sesuai. Pastikan ada kolom 'Nama Lengkap' dan 'Email'. Column found: " . implode(', ', $header)
                ], 400);
            }
        }

        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_csv_preprocessing',
            'model' => JobApplication::class,
            'after' => ['row_count' => count($data)],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 3. Calculation: Save & Run SAW
        $importedCount = 0;
        $applications = [];

        foreach ($data as $row) {
            if (count($row) < count($mappedHeaders)) continue; // Skip malformed rows
            
            $rowData = array_combine($mappedHeaders, $row);
            
            // Clean scores (must be numeric)
            $edu = is_numeric($rowData['education_score'] ?? null) ? $rowData['education_score'] : 0;
            $exp = is_numeric($rowData['experience_score'] ?? null) ? $rowData['experience_score'] : 0;
            $skil = is_numeric($rowData['skill_score'] ?? null) ? $rowData['skill_score'] : 0;
            $intv = is_numeric($rowData['interview_score'] ?? null) ? $rowData['interview_score'] : 0;

            $app = JobApplication::create([
                'name' => $rowData['name'] ?? 'No Name',
                'email' => $rowData['email'] ?? 'no-email@example.com',
                'phone' => $rowData['phone'] ?? '-',
                'job_work_id' => $request->job_work_id,
                'education_score' => $edu,
                'experience_score' => $exp,
                'skill_score' => $skil,
                'interview_score' => $intv,
                'school' => $rowData['school'] ?? null,
                'major' => $rowData['major'] ?? null,
                'gender' => $rowData['gender'] ?? null,
                'domicile' => $rowData['domicile'] ?? null,
                'other_activities' => $rowData['other_activities'] ?? null,
                'status' => 'pending'
            ]);
            
            $applications[] = $app;
            $importedCount++;
        }

        // Run SAW Calculation
        $this->calculateSAWInternal($applications, $request->weights);

        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_csv_calculation',
            'model' => JobApplication::class,
            'after' => [
                'processed_count' => $importedCount,
                'weights' => $request->weights
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'CSV berhasil diimport dan dianalisis',
            'imported_count' => $importedCount
        ]);
    }

    protected function calculateSAWInternal($applications, $weights)
    {
        if (empty($applications)) return;

        $maxEducation = collect($applications)->max('education_score') ?: 1;
        $maxExperience = collect($applications)->max('experience_score') ?: 1;
        $maxSkill = collect($applications)->max('skill_score') ?: 1;
        $maxInterview = collect($applications)->max('interview_score') ?: 1;

        foreach ($applications as $app) {
            $normalizedEducation = $app->education_score / $maxEducation;
            $normalizedExperience = $app->experience_score / $maxExperience;
            $normalizedSkill = $app->skill_score / $maxSkill;
            $normalizedInterview = $app->interview_score / $maxInterview;

            $sawScore = ($normalizedEducation * $weights['education']) +
                        ($normalizedExperience * $weights['experience']) +
                        ($normalizedSkill * $weights['skill']) +
                        ($normalizedInterview * $weights['interview']);

            $app->saw_score = $sawScore;
            $app->save();
        }

        // Re-ranking
        $allApps = JobApplication::where('job_work_id', $applications[0]->job_work_id)
            ->orderByDesc('saw_score')
            ->get();
            
        foreach ($allApps as $index => $app) {
            $app->ranking = $index + 1;
            $app->save();
        }
    }
}
