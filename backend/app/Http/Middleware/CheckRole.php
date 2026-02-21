<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string[]  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        \Illuminate\Support\Facades\Log::info('CheckRole Debug:', [
            'has_user' => !is_null($user),
            'user_id' => $user ? $user->id : null,
            'user_role' => $user ? $user->role : null,
            'token' => $request->bearerToken() ? 'Present' : 'Missing',
            'roles_required' => $roles,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
        ]);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden: You do not have the required role.'
            ], 403);
        }

        return $next($request);
    }
}
