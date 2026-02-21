<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\LogoController;
use App\Http\Controllers\Api\AboutController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\BisnisKamiFullController;
use App\Http\Controllers\Api\WorksController;
use App\Http\Controllers\Api\JobWorksController; // Sudah diperbaiki menjadi Plural
use App\Http\Controllers\Api\SocialLinkController;
use App\Http\Controllers\Api\RequirementController;
use App\Http\Controllers\Api\InternshipHeroController;
use App\Http\Controllers\Api\InternshipCoreValueController;
use App\Http\Controllers\Api\InternshipTermsController;
use App\Http\Controllers\Api\InternshipFormationController;
use App\Http\Controllers\Api\InternshipFacilityController;
use App\Http\Controllers\Api\HeroSectionController;
use App\Http\Controllers\Api\SawController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\JobApplicationController;
use App\Http\Controllers\Api\InternshipApplicationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LogExportController;
use App\Http\Controllers\Api\HomeSettingController;
use App\Http\Controllers\Api\NewsPageSettingController;

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/logs/export', [LogExportController::class, 'exportCSV']);
});

// ========== AUTHENTICATION ==========
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/public-register', [AuthController::class, 'publicRegister']);
    Route::post('/admin/register', [AdminAuthController::class, 'register']);
});

// For backward compatibility with frontend (optional but safer during refactor)
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/admin/register', [AdminAuthController::class, 'register']);
Route::post('/admin/login',    [AuthController::class, 'login'])->middleware('throttle:5,1');

// ========== PUBLIC (Bisa diakses tanpa login) ==========
Route::get('/admin/logo', [LogoController::class, 'show']);
Route::get('/about', [AboutController::class, 'show']);

// Berita Public (Hanya yang published)
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{idOrSlug}', [NewsController::class, 'show']);

Route::get('/bisnis-kami-full', [BisnisKamiFullController::class, 'show']);
Route::get('/works/latest', [WorksController::class, 'latest']);
Route::get('/social-links', [SocialLinkController::class, 'publicIndex']);
Route::get('/internship/hero', [InternshipHeroController::class, 'show']);
Route::get('/internship/core-values', [InternshipCoreValueController::class, 'index']);
Route::get('/internship/terms', [InternshipTermsController::class, 'show']);
Route::get('/internship/formations', [InternshipFormationController::class, 'index']);
Route::get('/internship/facilities', [InternshipFacilityController::class, 'index']);
Route::get('/hero', [HeroSectionController::class, 'show']);
Route::get('/home-settings', [HomeSettingController::class, 'show']);
Route::get('/news-page-settings', [NewsPageSettingController::class, 'show']);

// JOB WORKS (PUBLIC: Hanya boleh LIHAT list dan detail)
Route::get('/job-works', [JobWorksController::class, 'index']);
Route::get('/job-works/{id}', [JobWorksController::class, 'show']);

// Requirements Public
Route::get('/requirements/by-job/{jobWorkId}', [RequirementController::class, 'showByJob']);
Route::get('/requirements/{id}', [RequirementController::class, 'showPublicById']); // opsional

// Contact Messages (Public - No Auth Required)
Route::post('/contact-messages', [ContactMessageController::class, 'store']);

// Published Articles (Public)
Route::get('/articles/published', [ArticleController::class, 'index']);
Route::get('/articles/published/{id}', [ArticleController::class, 'show']);

// ===================================================
// ========== ADMIN & WRITER (Must Login) ==========
// ===================================================
Route::middleware(['auth:sanctum'])->group(function () {

    // Common Profile/Auth for both Admin and Writer
    Route::middleware(['role:admin,writer'])->group(function () {
        Route::prefix('admin')->group(function () {
            Route::post('/update-avatar',  [AdminAuthController::class, 'updateAvatar']);
            Route::post('/update-profile', [AdminAuthController::class, 'updateProfile']);
            Route::post('/logout',         [AdminAuthController::class, 'logout']);
            
            // Tasks accessible by both Admin and Writer
            Route::get('/tasks', [TaskController::class, 'index']);
            Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus']);

            // Article routes accessible by both Admin and Writer
            Route::get('/articles', [ArticleController::class, 'index']);
            Route::get('/articles/my-articles', [ArticleController::class, 'myArticles']);
            Route::post('/articles', [ArticleController::class, 'store']);
            Route::get('/articles/{id}', [ArticleController::class, 'show']);
            Route::put('/articles/{id}', [ArticleController::class, 'update']);
            Route::post('/articles/{id}', [ArticleController::class, 'update']); // for multipart
            Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
            Route::post('/articles/{id}/submit', [ArticleController::class, 'submit']);
        });

        // RBAC Testing Endpoints
        Route::get('/operator/data', function () {
            return response()->json([
                'success' => true,
                'message' => 'Data operator berhasil diakses',
                'role' => auth()->user()->role,
                'timestamp' => now()
            ], 200);
        });

        Route::post('/operator/data', function (\Illuminate\Http\Request $request) {
            $validated = $request->validate([
                'title' => 'required|string',
                'content' => 'required|string',
            ]);

            $entity = \App\Models\DataEntity::create([
                'title' => $validated['title'],
                'content' => $validated['content'],
                'status' => 'draft'
            ]);

            \App\Models\ActivityLog::create([
                'user_id' => auth()->id(),
                'role' => auth()->user()->role,
                'action' => 'create data',
                'model' => 'DataEntity',
                'model_id' => $entity->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'id' => $entity->id,
                'status' => $entity->status,
                'message' => 'Data berhasil dibuat dengan status draft'
            ], 201);
        });

        Route::put('/operator/data/{id}/submit', function ($id, \Illuminate\Http\Request $request) {
            $entity = \App\Models\DataEntity::findOrFail($id);

            if ($entity->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya data dengan status draft yang bisa diajukan ke review.'
                ], 422);
            }

            $entity->update(['status' => 'review']);

            \App\Models\ActivityLog::create([
                'user_id' => auth()->id(),
                'role' => auth()->user()->role,
                'action' => 'submit review',
                'model' => 'DataEntity',
                'model_id' => $entity->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'id' => $entity->id,
                'status' => $entity->status,
                'message' => 'Data berhasil diajukan ke review'
            ], 200);
        });

        Route::put('/operator/data/{id}', function ($id, \Illuminate\Http\Request $request) {
            $entity = \App\Models\DataEntity::findOrFail($id);
            $oldStatus = $entity->status;

            $validated = $request->validate([
                'status' => 'required|string',
            ]);

            $entity->update(['status' => $validated['status']]);

            \App\Models\ActivityLog::create([
                'user_id' => auth()->id(),
                'role' => auth()->user()->role,
                'action' => 'update_status',
                'model' => 'DataEntity',
                'model_id' => $entity->id,
                'before' => json_encode(['status' => $oldStatus]),
                'after' => json_encode(['status' => $validated['status']]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status berhasil diperbarui',
                'data' => [
                    'id' => $entity->id,
                    'old_status' => $oldStatus,
                    'new_status' => $entity->status
                ]
            ], 200);
        });
    });

    // ================= ADMIN ONLY ROUTES =================
    Route::middleware(['role:admin'])->group(function () {
        
        // Category Management
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::prefix('admin')->group(function () {
            // Dashboard Stats
            Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);

            // General Settings
            Route::post('/logo',  [LogoController::class, 'store']);
            Route::post('/about', [AboutController::class, 'store']);
            Route::post('/about/paragraph', [AboutController::class, 'updateParagraph']);
            Route::post('/about/core-text', [AboutController::class, 'updateCoreText']);

            // News Management
            Route::get('/news', [NewsController::class, 'adminIndex']);
            Route::post('/news', [NewsController::class, 'store']);
            Route::patch('/news/{idOrSlug}', [NewsController::class, 'update']);
            Route::post('/news/{idOrSlug}', [NewsController::class, 'update']);
            Route::delete('/news/{idOrSlug}', [NewsController::class, 'destroy']);
            Route::post('/news/{idOrSlug}/publish', [NewsController::class, 'togglePublish']);

            // Bisnis Kami
            Route::put('/bisnis-kami-full/text', [BisnisKamiFullController::class, 'updateText']);
            Route::post('/bisnis-kami-full/image', [BisnisKamiFullController::class, 'updateImage']);
            Route::post('/works', [WorksController::class, 'store']);
            Route::patch('/works/{work}', [WorksController::class, 'update']);

            // Social Links
            Route::get('/social-links', [SocialLinkController::class, 'adminIndex']);
            Route::put('/social-links', [SocialLinkController::class, 'bulkUpsert']);

            // JOB WORKS
            Route::post('/job-works', [JobWorksController::class, 'store']);
            Route::put('/job-works/{id}', [JobWorksController::class, 'update']);
            Route::delete('/job-works/{id}', [JobWorksController::class, 'destroy']);

            // Requirements
            Route::post('/requirements', [RequirementController::class, 'store']);
            Route::get('/requirements/{id}', [RequirementController::class, 'showAdmin']);
            Route::patch('/requirements/{id}', [RequirementController::class, 'update']);
            Route::delete('/requirements/{id}', [RequirementController::class, 'destroy']);
            Route::post('/requirements/{id}/items', [RequirementController::class, 'storeItem']);
            Route::patch('/requirements/{id}/items/{itemId}', [RequirementController::class, 'updateItem']);
            Route::delete('/requirements/{id}/items/{itemId}', [RequirementController::class, 'destroyItem']);
            Route::put('/requirements/{id}/items/bulk', [RequirementController::class, 'bulkUpsertItems']);
            Route::put('/requirements/{id}/items/reorder', [RequirementController::class, 'reorderItems']);

            // Internship Content
            Route::put('/internship/hero', [InternshipHeroController::class, 'updateText']);
            Route::post('/internship/hero/image', [InternshipHeroController::class, 'updateImage']);
            Route::put('/internship/core-values/header', [InternshipCoreValueController::class, 'updateHeader']);
            Route::put('/internship/core-values/cards/{card}', [InternshipCoreValueController::class, 'updateCard']);
            Route::post('/internship/core-values/cards/{card}/image', [InternshipCoreValueController::class, 'updateCardImage']);
            Route::put('/internship/core-values/cards/reorder', [InternshipCoreValueController::class, 'reorder']);
            Route::put('/internship/terms/header', [InternshipTermsController::class, 'updateHeader']);
            Route::put('/internship/terms/items/{index}', [InternshipTermsController::class, 'updateItem']);
            Route::put('/internship/formations/header', [InternshipFormationController::class, 'updateHeader']);
            Route::put('/internship/formations/cards/{card}', [InternshipFormationController::class, 'updateCard']);
            Route::post('/internship/formations/cards/{card}/image', [InternshipFormationController::class, 'updateCardImage']);
            Route::put('/internship/facilities/header', [InternshipFacilityController::class, 'updateHeader']);
            Route::put('/internship/facilities/items/{index}', [InternshipFacilityController::class, 'updateItem']);

            // Hero Section
            Route::post('/hero', [HeroSectionController::class, 'store']);
            Route::get('/hero/{id}', [HeroSectionController::class, 'showAdmin']);
            Route::patch('/hero/{id}', [HeroSectionController::class, 'update']);
            Route::delete('/hero/{id}', [HeroSectionController::class, 'destroy']);

            // Home & News Settings
            Route::get('/home-settings', [HomeSettingController::class, 'show']);
            Route::post('/home-settings', [HomeSettingController::class, 'update']);
            Route::get('/news-page-settings', [NewsPageSettingController::class, 'show']);
            Route::post('/news-page-settings', [NewsPageSettingController::class, 'update']);

            // Article Review (Admin Only)
            // Route::get('/articles', [ArticleController::class, 'index']); // Already in shared group
            Route::post('/articles/{id}/approve', [ArticleController::class, 'approve']);
            Route::post('/articles/{id}/reject', [ArticleController::class, 'reject']);
            Route::post('/articles/{id}/publish', [ArticleController::class, 'publish']);
            // Route::delete('/articles/{id}', [ArticleController::class, 'destroy']); // Already in shared group

            // Tasks Management
            // Route::get('/tasks', [TaskController::class, 'index']); // Already moved to shared group above
            Route::post('/tasks', [TaskController::class, 'store']);
            Route::get('/tasks/{id}', [TaskController::class, 'show']);
            Route::put('/tasks/{id}', [TaskController::class, 'update']);
            Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
            Route::get('/writers', [TaskController::class, 'getWriters']);
            // Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus']); // Already moved

            // Contact Messages
            Route::get('/contact-messages', [ContactMessageController::class, 'index']);
            Route::get('/contact-messages/unread-count', [ContactMessageController::class, 'unreadCount']);
            Route::get('/contact-messages/{id}', [ContactMessageController::class, 'show']);
            Route::put('/contact-messages/{id}/read', [ContactMessageController::class, 'markAsRead']);
            Route::delete('/contact-messages/{id}', [ContactMessageController::class, 'destroy']);

            // Job Applications
            Route::get('/job-applications', [JobApplicationController::class, 'index']);
            Route::post('/job-applications', [JobApplicationController::class, 'store']);
            Route::get('/job-applications/{id}', [JobApplicationController::class, 'show']);
            Route::put('/job-applications/{id}', [JobApplicationController::class, 'update']);
            Route::delete('/job-applications/{id}', [JobApplicationController::class, 'destroy']);
            Route::post('/job-applications/analyze', [JobApplicationController::class, 'analyzeSAW']);
            Route::post('/job-applications/import-csv', [JobApplicationController::class, 'importCSV']);
            
            // Internship Applications
            Route::get('/internship-applications', [InternshipApplicationController::class, 'index']);
            Route::post('/internship-applications', [InternshipApplicationController::class, 'store']);
            Route::get('/internship-applications/{id}', [InternshipApplicationController::class, 'show']);
            Route::put('/internship-applications/{id}', [InternshipApplicationController::class, 'update']);
            Route::delete('/internship-applications/{id}', [InternshipApplicationController::class, 'destroy']);
            Route::post('/internship-applications/analyze', [InternshipApplicationController::class, 'analyzeSAW']);
            Route::post('/internship-applications/import-csv', [InternshipApplicationController::class, 'importCSV']);

            // SPK SAW Module
            Route::prefix('saw')->group(function () {
                Route::post('/upload', [SawController::class, 'uploadCSV']);
                Route::post('/analyze', [SawController::class, 'runAnalysis']);
                Route::get('/results/{sessionId}', [SawController::class, 'getResults']);
                Route::delete('/results/{sessionId}', [SawController::class, 'deleteResults']);
            });

            // Data Entities (Scenario 2)
            Route::put('/data/{id}/approve', function ($id, \Illuminate\Http\Request $request) {
                $entity = \App\Models\DataEntity::findOrFail($id);

                if ($entity->status !== 'review') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hanya data dengan status review yang bisa di-approve.'
                    ], 422);
                }

                $entity->update(['status' => 'approved']);

                \App\Models\ActivityLog::create([
                    'user_id' => auth()->id(),
                    'role' => auth()->user()->role,
                    'action' => 'approve data',
                    'model' => 'DataEntity',
                    'model_id' => $entity->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'id' => $entity->id,
                    'status' => $entity->status,
                    'message' => 'Data berhasil di-approve oleh admin'
                ], 200);
            });
            Route::get('/data/{id}', function ($id) {
                $entity = \App\Models\DataEntity::findOrFail($id);
                return response()->json([
                    'success' => true,
                    'data' => $entity
                ], 200);
            });

            Route::delete('/data/{id}', function ($id, \Illuminate\Http\Request $request) {
                $entity = \App\Models\DataEntity::findOrFail($id);

                $entity->delete(); // Soft Delete

                \App\Models\ActivityLog::create([
                    'user_id' => auth()->id(),
                    'role' => auth()->user()->role,
                    'action' => 'soft_delete',
                    'model' => 'DataEntity',
                    'model_id' => $id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Data berhasil dihapus (soft delete)',
                    'id' => $id
                ], 200);
            });

            // Activity Logs retrieval
            Route::get('/activity-logs', function () {
                $logs = \App\Models\ActivityLog::orderBy('created_at', 'desc')->get();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Riwayat audit berhasil dimuat',
                    'data' => $logs
                ], 200);
            });
        });
    });

    // ================= WRITER ONLY ROUTES =================
    Route::middleware(['role:writer'])->group(function () {
        // Any writer-specific routes that admins shouldn't see?
        // Usually admins can see everything, so writer routes are often a subset.
    });
});
