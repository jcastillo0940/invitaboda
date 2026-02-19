<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Str;

class AssetController extends Controller
{
    public function upload(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max
            'type' => 'required|string|in:hero,gallery,video,music',
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug($event->name) . '-' . $type . '-' . time() . '.' . $extension;

        $path = "events/{$event->id}/{$type}/{$filename}";

        if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'webp', 'heic'])) {
            // Process Image
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file);

            // Optimization based on type
            if ($type === 'hero') {
                if ($image->width() > 1920) {
                    $image->scale(width: 1920);
                }
            } elseif ($type === 'gallery') {
                if ($image->width() > 1200) {
                    $image->scale(width: 1200);
                }
            }

            // Save to WebP (Modern, light, fast)
            // quality 75 is the sweet spot for web
            $encoded = $image->toWebp(75);

            // New path with webp extension
            $path = "events/{$event->id}/{$type}/" . pathinfo($filename, PATHINFO_FILENAME) . ".webp";

            Storage::disk('public')->put($path, (string) $encoded);
            $finalPath = Storage::url($path);
        } else {
            // For video/music, just store as is
            Storage::disk('public')->putFileAs("events/{$event->id}/{$type}", $file, $filename);
            $finalPath = Storage::url("events/{$event->id}/{$type}/{$filename}");
        }

        return response()->json([
            'url' => $finalPath
        ]);
    }
}
