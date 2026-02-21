<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\NewsController; // For reference if needed
use App\Http\Controllers\Controller;
use App\Models\NewsPageSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsPageSettingController extends Controller
{
    public function show()
    {
        $setting = NewsPageSetting::first();
        if ($setting && $setting->banner_image_path) {
            $setting->banner_image_url = asset('storage/' . $setting->banner_image_path);
        }
        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $setting = NewsPageSetting::firstOrCreate(['id' => 1]);

        $validated = $request->validate([
            'banner_title' => 'nullable|string',
            'banner_subtitle' => 'nullable|string',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('banner_image')) {
            if ($setting->banner_image_path) {
                Storage::disk('public')->delete($setting->banner_image_path);
            }
            $path = $request->file('banner_image')->store('news', 'public');
            $setting->banner_image_path = $path;
        }

        $setting->update($request->only(['banner_title', 'banner_subtitle']));

        return response()->json([
            'message' => 'News page settings updated successfully',
            'data' => $setting
        ]);
    }
}
