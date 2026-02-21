<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Admin;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Register a new public user.
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        // Create User with hardcoded 'public' role
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'public', // Hardcoded
        ]);

        // Log Register Activity
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => 'public',
            'action' => 'register',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Registrasi berhasil. Silakan login untuk melanjutkan.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'public',
                ]
            ]
        ], 201);
    }

    /**
     * Light register for public users (leads).
     */
    public function publicRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'public',
        ]);

        // Log Activity
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => 'public',
            'action' => 'public_register',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $token = $user->createToken('public_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Registrasi pelamar berhasil.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'whatsapp' => $user->whatsapp,
                    'role' => 'public',
                ]
            ]
        ], 201);
    }

    /**
     * Login for Admin and Writer roles.
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        // 1. Cek di tabel admins dahulu (untuk admin & writer)
        $user = Admin::where('email', $credentials['email'])->first();
        $is_admin_table = true;

        // 2. Jika tidak ada, cek di tabel users (untuk public atau role lain)
        if (!$user) {
            $user = \App\Models\User::where('email', $credentials['email'])->first();
            $is_admin_table = false;
        }

        // Cek apakah user ditemukan dan password cocok
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        // Buat activity log
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role ?? 'public', // Fallback ke public jika null
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Generate token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'public',
                    'avatar' => ($is_admin_table && $user->avatar) ? asset('storage/' . $user->avatar) : null,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 200);
    }

    /**
     * Logout.
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Log logout
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action' => 'logout',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $user->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }
}
