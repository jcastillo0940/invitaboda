<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserSubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = Subscription::with(['user', 'plan'])
            ->orderBy('created_at', 'desc')
            ->get();

        // CORRECCIÓN: Buscamos usuarios con rol 'planner' (así está en tu BD)
        $users = User::where('role', 'planner')->orderBy('name')->get();
        $plans = Plan::all();

        return Inertia::render('Admin/UserSubscriptions/Index', [
            'subscriptions' => $subscriptions,
            'users' => $users,
            'plans' => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'           => 'nullable|exists:users,id',
            'new_user_name'     => 'required_without:user_id|nullable|string|max:255',
            'new_user_email'    => 'required_without:user_id|nullable|email|unique:users,email',
            'new_user_password' => 'required_without:user_id|nullable|string|min:6',
            'plan_id'           => 'required|exists:plans,id',
            'status'            => 'required|string',
            'next_billing_date' => 'nullable|date',
            'ends_at'           => 'nullable|date',
        ]);

        if (empty($validated['user_id'])) {
            $user = User::create([
                'name'     => $validated['new_user_name'],
                'email'    => $validated['new_user_email'],
                'password' => Hash::make($validated['new_user_password']),
                // CORRECCIÓN: Guardamos el rol como 'planner'
                'role'     => 'planner',
            ]);
            $userId = $user->id;
        } else {
            $userId = $validated['user_id'];
        }

        Subscription::updateOrCreate(
            ['user_id' => $userId],
            [
                'plan_id'           => $validated['plan_id'],
                'status'            => $validated['status'],
                'next_billing_date' => $validated['next_billing_date'],
                'ends_at'           => $validated['ends_at'],
                'starts_at'         => now(),
            ]
        );

        return back()->with('success', 'Suscripción asignada correctamente.');
    }

    public function update(Request $request, Subscription $user_subscription)
    {
        $validated = $request->validate([
            'plan_id'           => 'required|exists:plans,id',
            'status'            => 'required|string',
            'next_billing_date' => 'nullable|date',
            'ends_at'           => 'nullable|date',
        ]);

        if ($validated['status'] === 'paused' && $user_subscription->status !== 'paused') {
            $validated['paused_at'] = now();
        } elseif ($validated['status'] !== 'paused') {
            $validated['paused_at'] = null;
        }

        $user_subscription->update($validated);

        return back()->with('success', 'Suscripción actualizada correctamente.');
    }
}