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

        // 1. VALIDACIÓN ESTRICTA DE TIPOS DE ARCHIVO
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,heic,mp4,mov,avi,mp3,wav|max:20480', // 20MB max
            'type' => 'required|string|in:hero,gallery,video,music',
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        
        // Usamos ->extension() que es más seguro porque Laravel detecta el MIME real del archivo
        $extension = $file->extension(); 
        $filename = Str::slug($event->name) . '-' . $type . '-' . time() . '.' . $extension;

        if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'webp', 'heic'])) {
            // --- PROCESAMIENTO DE IMÁGENES ---
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file);

            // Optimización basada en el tipo
            if ($type === 'hero') {
                if ($image->width() > 1920) {
                    $image->scale(width: 1920);
                }
            } elseif ($type === 'gallery') {
                if ($image->width() > 1200) {
                    $image->scale(width: 1200);
                }
            }

            // Convertir a WebP (Moderno, ligero, rápido)
            $encoded = $image->toWebp(75);

            // Nueva ruta con extensión webp
            $path = "events/{$event->id}/{$type}/" . pathinfo($filename, PATHINFO_FILENAME) . ".webp";

            Storage::disk('public')->put($path, (string) $encoded);
            $finalPath = Storage::url($path);
            
        } else {
            // --- PROCESAMIENTO DE AUDIO / VIDEO ---
            // Como la validación de arriba ('mimes') ya filtró archivos maliciosos, 
            // aquí sabemos con certeza que solo entran mp4, mov, avi, mp3, wav.
            $path = "events/{$event->id}/{$type}";
            Storage::disk('public')->putFileAs($path, $file, $filename);
            $finalPath = Storage::url("{$path}/{$filename}");
        }

        return response()->json([
            'url' => $finalPath
        ]);
    }
}