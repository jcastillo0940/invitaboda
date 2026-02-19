<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AgencyController extends Controller
{
    public function settings()
    {
        return Inertia::render('Agency/Settings', [
            'user' => auth()->user()
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'agency_name' => 'required|string|max:255',
            'agency_settings' => 'required|array',
            'agency_settings.logo_url' => 'nullable|url',
            'agency_settings.brand_color' => 'nullable|string|regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
        ]);

        $user = auth()->user();
        $user->update([
            'agency_name' => $validated['agency_name'],
            'agency_settings' => $validated['agency_settings'],
        ]);

        return back()->with('success', 'Configuración de agencia actualizada.');
    }
}
