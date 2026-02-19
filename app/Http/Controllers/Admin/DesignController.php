<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Design;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DesignController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Designs/Index', [
            'designs' => Design::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Designs/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_premium' => 'required|boolean',
            'is_active' => 'required|boolean',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('designs', 'public');
            $thumbnailPath = '/storage/' . $thumbnailPath;
        }

        Design::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'is_premium' => $validated['is_premium'],
            'is_active' => $validated['is_active'],
            'thumbnail' => $thumbnailPath,
            'default_config' => [],
        ]);

        return redirect()->route('admin.designs.index')
            ->with('success', 'Diseño creado correctamente.');
    }

    public function show(Design $design)
    {
        return Inertia::render('Admin/Designs/Show', [
            'design' => $design
        ]);
    }

    public function edit(Design $design)
    {
        return Inertia::render('Admin/Designs/Edit', [
            'design' => $design
        ]);
    }

    public function update(Request $request, Design $design)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_premium' => 'required|boolean',
            'is_active' => 'required|boolean',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $thumbnailPath = $design->thumbnail;

        if ($request->hasFile('thumbnail')) {
            // Borrar thumbnail anterior si existe en storage
            if ($design->thumbnail && str_starts_with($design->thumbnail, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $design->thumbnail);
                Storage::disk('public')->delete($oldPath);
            }
            $thumbnailPath = '/storage/' . $request->file('thumbnail')->store('designs', 'public');
        }

        $design->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'is_premium' => $validated['is_premium'],
            'is_active' => $validated['is_active'],
            'thumbnail' => $thumbnailPath,
        ]);

        return redirect()->route('admin.designs.index')
            ->with('success', 'Diseño actualizado correctamente.');
    }

    public function destroy(Design $design)
    {
        // Eliminar thumbnail del disco si existe
        if ($design->thumbnail && str_starts_with($design->thumbnail, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $design->thumbnail);
            Storage::disk('public')->delete($oldPath);
        }

        $design->delete();

        return redirect()->route('admin.designs.index')
            ->with('success', 'Diseño eliminado.');
    }
}
