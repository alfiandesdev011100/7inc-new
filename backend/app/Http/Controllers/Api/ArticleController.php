<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use App\Services\ArticleService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    use ApiResponse;

    protected $articleService;

    public function __construct(ArticleService $articleService)
    {
        $this->articleService = $articleService;
    }

    /**
     * Get articles owned by the authenticated user.
     */
    public function myArticles(Request $request)
    {
        $articles = Article::where('author_id', $request->user()->id)
            ->with(['author', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $articles
        ]);
    }

    /**
     * List articles with optional role-based filtering and status.
     */
    public function index(Request $request)
    {
        $query = Article::with(['author', 'reviewer']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Admin/Reviewer sees all, Writer only sees their own
        if ($request->user()->role === Admin::ROLE_WRITER) {
            $query->where('author_id', $request->user()->id);
        }

        $articles = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => true,
            'data' => $articles
        ]);
    }

    /**
     * Store a new article as a draft.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'target_page' => 'nullable|string',
            'display_type' => 'nullable|string',
        ]);

        $data = [
            'title' => $request->title,
            'content' => $request->content,
            'slug' => Str::slug($request->title) . '-' . time(),
            'target_page' => $request->target_page,
            'display_type' => $request->display_type,
            'author_id' => $request->user()->id,
            'status' => 'draft',
        ];

        DB::beginTransaction();
        try {
            // Handle image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('articles', 'public');
                $data['image'] = $path;
            }

            $article = Article::create($data);
            DB::commit();

            return $this->successResponse($article->load(['author', 'reviewer']), 'Artikel berhasil dibuat', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal membuat artikel', $e->getMessage());
        }
    }

    /**
     * Update an existing article if authorized.
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        // Enforce Policy
        if (!$request->user()->can('update', $article)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized or invalid status'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'target_page' => 'nullable|string',
            'display_type' => 'nullable|string',
        ]);

        $data = [
            'title' => $request->title,
            'content' => $request->content,
            'slug' => Str::slug($request->title) . '-' . time(),
            'target_page' => $request->target_page,
            'display_type' => $request->display_type,
        ];

        DB::beginTransaction();
        try {
            // Handle image upload
            if ($request->hasFile('image')) {
                if ($article->image && Storage::disk('public')->exists($article->image)) {
                    Storage::disk('public')->delete($article->image);
                }
                $path = $request->file('image')->store('articles', 'public');
                $data['image'] = $path;
            }

            $article->update($data);
            DB::commit();

            return $this->successResponse($article->load(['author', 'reviewer']), 'Artikel diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal memperbarui artikel', $e->getMessage());
        }
    }

    /**
     * Submit an article for review (set status to pending).
     */
    public function submit(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        if (!$request->user()->can('submit', $article)) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak memiliki akses untuk submit artikel ini'
            ], 403);
        }

        DB::beginTransaction();
        try {
            $this->articleService->transitionStatus($article, Article::STATUS_PENDING);
            DB::commit();

            return $this->successResponse($article->load(['author', 'reviewer']), 'Artikel berhasil disubmit untuk review');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal submit artikel', $e->getMessage(), 400);
        }
    }

    /**
     * Get article details.
     */
    public function show($id)
    {
        $article = Article::with(['author', 'reviewer'])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $article
        ]);
    }

    /**
     * Soft delete or permanently delete an article.
     */
    public function destroy(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        if (!$request->user()->can('delete', $article)) {
            return response()->json([
                'status' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus artikel ini'
            ], 403);
        }

        DB::beginTransaction();
        try {
            if ($article->image && Storage::disk('public')->exists($article->image)) {
                Storage::disk('public')->delete($article->image);
            }

            $article->delete();
            DB::commit();

            return $this->successResponse(null, 'Artikel berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal menghapus artikel', $e->getMessage(), 500);
        }
    }

    /**
     * Approve a pending article.
     */
    public function approve(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        if (!$request->user()->can('review', $article)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized for review'
            ], 403);
        }

        try {
            $this->articleService->transitionStatus($article, Article::STATUS_APPROVED);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Artikel disetujui',
            'data' => $article->load(['author', 'reviewer'])
        ]);
    }

    /**
     * Reject a pending article with a reason.
     */
    public function reject(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        if (!$request->user()->can('review', $article)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized for review'
            ], 403);
        }

        $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        try {
            $this->articleService->transitionStatus($article, Article::STATUS_REJECTED, [
                'rejection_reason' => $request->rejection_reason
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Artikel direject',
            'data' => $article->load(['author', 'reviewer'])
        ]);
    }

    /**
     * Publish an approved article.
     */
    public function publish(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        if (!$request->user()->can('publish', $article)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized for publish'
            ], 403);
        }

        try {
            $this->articleService->transitionStatus($article, Article::STATUS_PUBLISHED);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'Artikel dipublikasi',
            'data' => $article->load(['author', 'reviewer'])
        ]);
    }
}
