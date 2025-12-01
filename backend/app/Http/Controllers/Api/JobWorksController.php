<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobWork; // Model tetap Singular (JobWork) sesuai standar Laravel
use Illuminate\Http\Request;

// PERBAIKAN: Nama Class harus SAMA PERSIS dengan nama file (Pakai 's')
class JobWorksController extends Controller
{
    // GET: Ambil semua data
    public function index()
    {
        $jobs = JobWork::latest()->paginate(10);
        return response()->json($jobs);
    }

    // POST: Simpan data baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'company'    => 'required|string|max:255',
            'location'   => 'required|string|max:255',
            'close_date' => 'required|date',
        ]);

        $job = JobWork::create($validated);

        return response()->json([
            'message' => 'Posisi berhasil ditambahkan',
            'data'    => $job
        ], 201);
    }

    // GET: Ambil detail 1 data
    public function show($id)
    {
        $job = JobWork::find($id);
        if (!$job) return response()->json(['message' => 'Not found'], 404);
        return response()->json(['data' => $job]);
    }

    // PUT: Update data
    public function update(Request $request, $id)
    {
        $job = JobWork::find($id);
        if (!$job) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'company'    => 'required|string|max:255',
            'location'   => 'required|string|max:255',
            'close_date' => 'required|date',
        ]);

        $job->update($validated);

        return response()->json([
            'message' => 'Posisi berhasil diperbarui',
            'data'    => $job
        ]);
    }

    // DELETE: Hapus data
    public function destroy($id)
    {
        $job = JobWork::find($id);
        if (!$job) return response()->json(['message' => 'Not found'], 404);

        $job->delete();

        return response()->json(['message' => 'Posisi berhasil dihapus']);
    }
}
