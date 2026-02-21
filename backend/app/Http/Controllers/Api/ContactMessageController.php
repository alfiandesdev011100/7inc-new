<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    // Public: Simpan pesan dari contact form (no auth required)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'subject' => 'required|in:kemitraan,layanan,karir,lainnya',
            'message' => 'required|string',
        ]);

        $contactMessage = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.',
            'data' => $contactMessage
        ], 201);
    }

    // Admin: Melihat semua pesan
    public function index(Request $request)
    {
        $query = ContactMessage::query();

        // Filter by is_read if provided
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }

        // Filter by subject if provided
        if ($request->has('subject')) {
            $query->where('subject', $request->subject);
        }

        $messages = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $messages
        ]);
    }

    // Admin: Melihat detail pesan
    public function show($id)
    {
        $message = ContactMessage::findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $message
        ]);
    }

    // Admin: Tandai pesan sudah dibaca
    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['is_read' => true]);

        return response()->json([
            'status' => true,
            'message' => 'Pesan ditandai sudah dibaca',
            'data' => $message
        ]);
    }

    // Admin: Hapus pesan
    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'status' => true,
            'message' => 'Pesan berhasil dihapus'
        ]);
    }

    // Admin: Get unread count
    public function unreadCount()
    {
        $count = ContactMessage::where('is_read', false)->count();

        return response()->json([
            'status' => true,
            'count' => $count
        ]);
    }
}
