<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // List kategori dengan jumlah berita
    public function index()
    {
        $categories = Category::withCount('news')->orderBy('name')->get();

        return response()->json([
            'status' => true,
            'data' => $categories
        ]);
    }

    // Detail satu kategori
    public function show($id)
    {
        $category = Category::withCount('news')->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $category
        ]);
    }

    // Tambah kategori
    public function store(Request $req)
    {
        $this->authorizeRole($req->user());

        $req->validate([
            'name' => 'required|string|max:191|unique:categories,name',
            'description' => 'nullable|string|max:1000'
        ]);

        $slug = Str::slug($req->name);

        // Pastikan slug unik
        $original = $slug;
        $i = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $original . '-' . $i++;
        }

        $category = Category::create([
            'name' => $req->name,
            'slug' => $slug,
            'description' => $req->description
        ]);

        return response()->json([
            'status' => true,
            'data' => $category
        ], 201);
    }

    // Update kategori
    public function update(Request $req, $id)
    {
        $this->authorizeRole($req->user());

        $cat = Category::findOrFail($id);

        $req->validate([
            'name' => [
                'required',
                'string',
                'max:191',
                Rule::unique('categories', 'name')->ignore($cat->id)
            ],
            'description' => 'nullable'
        ]);

        $cat->name = $req->name;
        $cat->description = $req->description;

        // regenerate slug only when name changes
        if ($cat->isDirty('name')) {
            $cat->slug = Str::slug($req->name);
        }

        $cat->save();

        return response()->json([
            'status' => true,
            'data' => $cat
        ]);
    }

    // Hapus kategori (jika berita masih ada → tolak)
    public function destroy(Request $req, $id)
    {
        $this->authorizeRole($req->user());

        $cat = Category::findOrFail($id);

        if ($cat->news()->count() > 0) {
            return response()->json([
                'status' => false,
                'message' => 'Kategori masih mempunyai berita. Pindahkan atau hapus berita terlebih dahulu.'
            ], 400);
        }

        $cat->delete();

        return response()->json([
            'status' => true,
            'message' => 'Kategori telah dihapus.'
        ]);
    }

    // Hanya untuk super_admin & admin_konten
    private function authorizeRole($user)
    {
        if (!in_array($user->role, ['super_admin', 'admin_konten'])) {
            abort(403, 'Anda tidak memiliki akses.');
        }
    }
}
