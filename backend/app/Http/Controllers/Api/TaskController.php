<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Admin;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Admin: List semua task
    public function index(Request $request)
    {
        $query = Task::with(['writer', 'admin']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // If user is writer, only show tasks assigned to them
        if ($request->user()->role === 'writer') {
            $query->where('assigned_to', $request->user()->id);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $tasks
        ]);
    }

    // Admin: Membuat task untuk writer
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_page' => 'required|string',
            'display_type' => 'required|string',
            'assigned_to' => 'required|exists:admins,id',
            'due_date' => 'nullable|date',
        ]);

        // Check if assigned_to is a writer
        $writer = Admin::findOrFail($request->assigned_to);
        if ($writer->role !== 'writer') {
            return response()->json([
                'status' => false,
                'message' => 'Task hanya dapat di-assign ke writer'
            ], 400);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'target_page' => $request->target_page,
            'display_type' => $request->display_type,
            'assigned_to' => $request->assigned_to,
            'assigned_by' => $request->user()->id,
            'due_date' => $request->due_date,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Task berhasil dibuat',
            'data' => $task->load(['writer', 'admin'])
        ], 201);
    }

    // Admin/Writer: Melihat detail task
    public function show($id)
    {
        $task = Task::with(['writer', 'admin'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $task
        ]);
    }

    // Admin: Update task
    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'target_page' => 'sometimes|required|string',
            'display_type' => 'sometimes|required|string',
            'assigned_to' => 'sometimes|required|exists:admins,id',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
        ]);

        $task->update($request->only([
            'title',
            'description',
            'target_page',
            'display_type',
            'assigned_to',
            'due_date',
            'status',
        ]));

        return response()->json([
            'status' => true,
            'message' => 'Task berhasil diperbarui',
            'data' => $task->load(['writer', 'admin'])
        ]);
    }

    // Writer: Update status task
    public function updateStatus(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        // Check if user is the assigned writer
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah status task ini'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:in_progress,completed',
        ]);

        $task->update(['status' => $request->status]);

        return response()->json([
            'status' => true,
            'message' => 'Status task berhasil diperbarui',
            'data' => $task->load(['writer', 'admin'])
        ]);
    }

    // Admin: Menghapus task
    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'status' => true,
            'message' => 'Task berhasil dihapus'
        ]);
    }

    // Get all writers for task assignment
    public function getWriters()
    {
        $writers = Admin::where('role', 'writer')->get(['id', 'name', 'email']);

        return response()->json([
            'status' => true,
            'data' => $writers
        ]);
    }
}
