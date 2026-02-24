<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('sort_order')->get();
        
        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Plans/Create');
    }

    public function store(Request $request)
    {
        // Generar slug automáticamente si viene vacío
        if (!$request->filled('slug')) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_type' => 'required|in:subscription,one_time,free_trial',
            'duration_months' => 'nullable|integer|min:1',
            
            // Límites Operativos
            'max_events' => 'nullable|integer|min:1',
            'max_guests' => 'nullable|integer|min:1',
            'days_accessible_before' => 'nullable|integer|min:1',
            'max_admins' => 'required|integer|min:1',
            'storage_mb' => 'nullable|integer|min:1',
            'max_providers' => 'nullable|integer|min:1',
            'max_lists' => 'nullable|integer|min:1',
            
            // Features (Booleanos)
            'feature_rsvp' => 'boolean',
            'feature_custom_site' => 'boolean',
            'feature_custom_domain' => 'boolean',
            'feature_advanced_reports' => 'boolean',
            'feature_export_data' => 'boolean',
            'feature_provider_integration' => 'boolean',
            
            // Estado y Orden
            'is_active' => 'boolean',
            'sort_order' => 'required|integer',
        ]);

        Plan::create($validated);

        return redirect()->route('admin.plans.index')->with('success', 'Plan creado exitosamente.');
    }

    public function edit(Plan $plan)
    {
        return Inertia::render('Admin/Plans/Edit', [
            'plan' => $plan
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        if (!$request->filled('slug')) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug,' . $plan->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_type' => 'required|in:subscription,one_time,free_trial',
            'duration_months' => 'nullable|integer|min:1',
            
            // Límites Operativos
            'max_events' => 'nullable|integer|min:1',
            'max_guests' => 'nullable|integer|min:1',
            'days_accessible_before' => 'nullable|integer|min:1',
            'max_admins' => 'required|integer|min:1',
            'storage_mb' => 'nullable|integer|min:1',
            'max_providers' => 'nullable|integer|min:1',
            'max_lists' => 'nullable|integer|min:1',
            
            // Features (Booleanos)
            'feature_rsvp' => 'boolean',
            'feature_custom_site' => 'boolean',
            'feature_custom_domain' => 'boolean',
            'feature_advanced_reports' => 'boolean',
            'feature_export_data' => 'boolean',
            'feature_provider_integration' => 'boolean',
            
            // Estado y Orden
            'is_active' => 'boolean',
            'sort_order' => 'required|integer',
        ]);

        $plan->update($validated);

        return redirect()->route('admin.plans.index')->with('success', 'Plan actualizado exitosamente.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return redirect()->route('admin.plans.index')->with('success', 'Plan eliminado exitosamente.');
    }
}