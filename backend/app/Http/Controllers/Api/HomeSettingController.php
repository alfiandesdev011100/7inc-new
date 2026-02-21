<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeSettingController extends Controller
{
    public function show()
    {
        $setting = HomeSetting::first();
        if ($setting && $setting->join_image_path) {
            $setting->join_image_url = asset('storage/' . $setting->join_image_path);
        }
        return response()->json($setting);
    }

    public function update(Request $request)
    {
        $setting = HomeSetting::firstOrCreate(['id' => 1]);
        
        $validated = $request->validate([
            'join_title' => 'nullable|string',
            'join_subtitle' => 'nullable|string',
            'join_button_text' => 'nullable|string',
            'join_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('join_image')) {
            if ($setting->join_image_path) {
                Storage::disk('public')->delete($setting->join_image_path);
            }
            $path = $request->file('join_image')->store('home', 'public');
            $setting->join_image_path = $path;
        }

        $setting->update($request->only(['join_title', 'join_subtitle', 'join_button_text']));

        return response()->json([
            'message' => 'Home settings updated successfully',
            'data' => $setting
        ]);
    }
}
