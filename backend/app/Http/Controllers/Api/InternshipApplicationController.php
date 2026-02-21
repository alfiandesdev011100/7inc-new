<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InternshipApplication;
use Illuminate\Http\Request;

class InternshipApplicationController extends Controller
{
    // Admin: List semua pelamar internship
    public function index(Request $request)
    {
        $query = InternshipApplication::query();

        // Filter by internship_type if provided
        if ($request->has('internship_type')) {
            $query->where('internship_type', $request->internship_type);
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
            'internship_type' => 'required|string',
            'ipk_score' => 'nullable|numeric|min:0|max:100',
            'skill_score' => 'nullable|numeric|min:0|max:100',
            'experience_score' => 'nullable|numeric|min:0|max:100',
            'motivation_score' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $application = InternshipApplication::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Data pelamar internship berhasil ditambahkan',
            'data' => $application
        ], 201);
    }

    // Admin: Melihat detail pelamar
    public function show($id)
    {
        $application = InternshipApplication::findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $application
        ]);
    }

    // Admin: Update data pelamar
    public function update(Request $request, $id)
    {
        $application = InternshipApplication::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'internship_type' => 'sometimes|required|string',
            'ipk_score' => 'nullable|numeric|min:0|max:100',
            'skill_score' => 'nullable|numeric|min:0|max:100',
            'experience_score' => 'nullable|numeric|min:0|max:100',
            'motivation_score' => 'nullable|numeric|min:0|max:100',
            'status' => 'sometimes|required|in:pending,reviewed,accepted,rejected',
            'notes' => 'nullable|string',
        ]);

        $application->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Data pelamar berhasil diperbarui',
            'data' => $application
        ]);
    }

    // Admin: Hapus data pelamar
    public function destroy($id)
    {
        $application = InternshipApplication::findOrFail($id);
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
            'internship_type' => 'nullable|string',
            'weights' => 'required|array',
            'weights.ipk' => 'required|numeric|min:0|max:1',
            'weights.skill' => 'required|numeric|min:0|max:1',
            'weights.experience' => 'required|numeric|min:0|max:1',
            'weights.motivation' => 'required|numeric|min:0|max:1',
        ]);

        // Validate weights sum to 1
        $totalWeight = $request->weights['ipk'] + $request->weights['skill'] + 
                       $request->weights['experience'] + $request->weights['motivation'];
        
        if (abs($totalWeight - 1) > 0.001) {
            return response()->json([
                'status' => false,
                'message' => 'Total bobot harus sama dengan 1 (100%)'
            ], 400);
        }

        // Get applications
        $query = InternshipApplication::query();
        if ($request->has('internship_type')) {
            $query->where('internship_type', $request->internship_type);
        }
        $applications = $query->get();

        if ($applications->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Tidak ada data pelamar untuk dianalisis'
            ], 400);
        }

        // Find max values for normalization (benefit criteria)
        $maxIPK = (float)$applications->max('ipk_score') ?: 1;
        $maxSkill = (float)$applications->max('skill_score') ?: 1;
        $maxExperience = (float)$applications->max('experience_score') ?: 1;
        $maxMotivation = (float)$applications->max('motivation_score') ?: 1;

        // Calculate SAW score for each application
        foreach ($applications as $application) {
            $normalizedIPK = $application->ipk_score / $maxIPK;
            $normalizedSkill = $application->skill_score / $maxSkill;
            $normalizedExperience = $application->experience_score / $maxExperience;
            $normalizedMotivation = $application->motivation_score / $maxMotivation;

            $sawScore = ($normalizedIPK * $request->weights['ipk']) +
                        ($normalizedSkill * $request->weights['skill']) +
                        ($normalizedExperience * $request->weights['experience']) +
                        ($normalizedMotivation * $request->weights['motivation']);

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
            'model' => InternshipApplication::class,
            'after' => [
                'internship_type' => $request->internship_type,
                'candidate_count' => $applications->count(),
                'weights' => $request->weights
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Analisis SAW berhasil dilakukan',
            'data' => $applications
        ]);
    }

    // Admin: Import CSV and Run SAW Analysis
    public function importCSV(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:4096',
            'internship_type' => 'required|string',
            'weights' => 'required|array',
            'weights.ipk' => 'required|numeric|min:0|max:1',
            'weights.skill' => 'required|numeric|min:0|max:1',
            'weights.experience' => 'required|numeric|min:0|max:1',
            'weights.motivation' => 'required|numeric|min:0|max:1',
        ]);

        $user = $request->user();
        $file = $request->file('csv_file');

        // 1. Log: Upload
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'saw_csv_upload',
            'model' => InternshipApplication::class,
            'after' => ['filename' => $file->getClientOriginalName()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 2. Preprocessing: Parse CSV
        $path = $file->getRealPath();
        $fileContentRaw = file_get_contents($path);
        
        $encoding = mb_detect_encoding($fileContentRaw, ['UTF-8', 'ISO-8859-1', 'WINDOWS-1252', 'ASCII'], true);
        if ($encoding && $encoding !== 'UTF-8') {
            $fileContent = mb_convert_encoding($fileContentRaw, 'UTF-8', $encoding);
        } else {
            $fileContent = @iconv($encoding ?: 'UTF-8', 'UTF-8//IGNORE', $fileContentRaw);
        }
        $fileContent = str_replace("\xEF\xBB\xBF", "", $fileContent);

        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", $fileContent));
        $data = [];
        foreach ($lines as $line) {
            if (trim($line) === '') continue;
            $data[] = str_getcsv($line, ',');
        }
        
        if (count($data) < 2) {
            return response()->json(['status' => false, 'message' => "CSV minimal harus berisi header dan 1 baris data."], 400);
        }

        $header = array_shift($data);

        // Map Indonesian headers (from User's Screenshot/Prompt)
        $headerMap = [
            'Email' => 'email',
            'Nama Lengkap' => 'name',
            'No. HP / Whatsapp' => 'phone',
            'Asal sekolah/ kampus' => 'university',
            'Program Studi/ Jurusan' => 'major',
            'Jenis Kelamin' => 'gender',
            'Domisili' => 'domicile',
            'Berapa lama Anda akan Magang' => 'duration',
            'alat kerja sendiri' => 'tools_available',
            'Status anda saat ini' => 'status_grade', // map to ipk_score grade
            'Alat apa yang Anda miliki' => 'tools_grade',   // map to skill_score grade
            'Berapa lama Anda akan Magang' => 'duration_grade', // map to experience_score grade
            'Apakah anda bersedia?' => 'shifting_grade', // map to motivation_score grade
        ];

        $mappedHeaders = [];
        foreach ($header as $h) {
            $hClean = trim($h, " \t\n\r\0\x0B\xEF\xBB\xBF");
            $foundTarget = $hClean;
            foreach ($headerMap as $key => $target) {
                if (stripos($hClean, $key) !== false) {
                    $foundTarget = $target;
                    break;
                }
            }
            $mappedHeaders[] = $foundTarget;
        }

        $importedCount = 0;
        $applications = [];

        foreach ($data as $row) {
            if (count($row) < min(3, count($mappedHeaders))) continue;
            
            $rawRow = [];
            foreach ($mappedHeaders as $idx => $mHeader) {
                if (isset($row[$idx])) $rawRow[$mHeader] = $row[$idx];
            }

            // AUTO-GRADING LOGIC
            // 1. IPK Score (from Status)
            $ipkScore = 0;
            $statusRaw = $rawRow['status_grade'] ?? '';
            if (stripos($statusRaw, 'sedang sekolah') !== false) $ipkScore = 70;
            elseif (stripos($statusRaw, 'sudah lulus') !== false) $ipkScore = 100;
            
            // 2. Skill Score (from Tools)
            $skillScore = 0;
            $toolsRaw = $rawRow['tools_grade'] ?? '';
            if (stripos($toolsRaw, 'edit') !== false) $skillScore = 100;
            elseif (stripos($toolsRaw, 'Laptop') !== false) $skillScore = 80;
            elseif (!empty($toolsRaw)) $skillScore = 50;

            // 3. Experience Score (from Duration)
            $expScore = 0;
            $durRaw = $rawRow['duration_grade'] ?? '';
            if (stripos($durRaw, '6 bulan') !== false) $expScore = 100;
            elseif (stripos($durRaw, '5 bulan') !== false) $expScore = 80;
            elseif (stripos($durRaw, '4 bulan') !== false) $expScore = 60;
            elseif (stripos($durRaw, '3 bulan') !== false) $expScore = 40;

            // 4. Motivation Score (from Shifting)
            $motvScore = 0;
            $shiftRaw = $rawRow['shifting_grade'] ?? '';
            if (stripos($shiftRaw, 'Ya') !== false) $motvScore = 100;
            else $motvScore = 50;

            $app = InternshipApplication::create([
                'name' => $rawRow['name'] ?? 'Peserta',
                'email' => $rawRow['email'] ?? 'temp@mail.com',
                'phone' => $rawRow['phone'] ?? '-',
                'university' => $rawRow['university'] ?? '-',
                'major' => $rawRow['major'] ?? '-',
                'gender' => $rawRow['gender'] ?? '-',
                'domicile' => $rawRow['domicile'] ?? '-',
                'duration' => $rawRow['duration'] ?? '-',
                'tools_available' => $rawRow['tools_available'] ?? '-',
                'internship_type' => $request->internship_type,
                'ipk_score' => $ipkScore,
                'skill_score' => $skillScore,
                'experience_score' => $expScore,
                'motivation_score' => $motvScore,
                'status' => 'pending'
            ]);
            
            $applications[] = $app;
            $importedCount++;
        }

        $this->calculateSAWInternal($applications, $request->weights);

        return response()->json([
            'status' => true,
            'message' => 'CSV berhasil diimport dan dianalisis otomatis',
            'imported_count' => $importedCount
        ]);
    }

    protected function calculateSAWInternal($applications, $weights)
    {
        if (empty($applications)) return;

        // Fetch all apps for this type to get accurate max values for normalization
        $type = $applications[0]->internship_type;
        $allApps = InternshipApplication::where('internship_type', $type)->get();

        $maxIPK = (float)$allApps->max('ipk_score') ?: 1;
        $maxSkill = (float)$allApps->max('skill_score') ?: 1;
        $maxExperience = (float)$allApps->max('experience_score') ?: 1;
        $maxMotivation = (float)$allApps->max('motivation_score') ?: 1;

        foreach ($allApps as $app) {
            $normalizedIPK = $app->ipk_score / $maxIPK;
            $normalizedSkill = $app->skill_score / $maxSkill;
            $normalizedExperience = $app->experience_score / $maxExperience;
            $normalizedMotivation = $app->motivation_score / $maxMotivation;

            $sawScore = ($normalizedIPK * $weights['ipk']) +
                        ($normalizedSkill * $weights['skill']) +
                        ($normalizedExperience * $weights['experience']) +
                        ($normalizedMotivation * $weights['motivation']);

            $app->saw_score = round($sawScore, 4);
            $app->save();
        }

        // Re-ranking based on updated scores
        $rankedApps = InternshipApplication::where('internship_type', $type)
            ->orderByDesc('saw_score')
            ->get();
            
        foreach ($rankedApps as $index => $app) {
            $app->ranking = $index + 1;
            $app->save();
        }
    }
}
