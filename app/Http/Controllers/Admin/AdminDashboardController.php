<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Order;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_events' => Event::count(),
                'total_revenue' => Order::where('status', 'completed')->sum('amount'),
                'recent_orders' => Order::with('user')->latest()->take(5)->get(),
            ]
        ]);
    }
}
