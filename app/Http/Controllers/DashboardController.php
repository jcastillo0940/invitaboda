<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Event;
use App\Models\GuestMember;
use App\Models\Order;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $role = $user->role; // Ahora los roles reales son: 'admin', 'planner', 'couple', 'guest'
        $dashboardData = [];

        // ─────────────────────────────────────────────────────────
        // DATOS B2B (WEDDING PLANNERS / ADMINS)
        // ─────────────────────────────────────────────────────────
        if (in_array($role, ['planner', 'admin'])) {
            
            $totalEvents = Event::where('user_id', $user->id)->count();
            
            $totalRevenue = Order::where('user_id', $user->id)
                                 ->where('status', 'completed')
                                 ->sum('amount');

            // Usamos el método de relación para traer la suscripción activa con su plan
            $activeSubscription = $user->activeSubscription()->with('plan')->first();

            $revenueChart = [
                ['name' => 'Oct', 'ingresos' => 120],
                ['name' => 'Nov', 'ingresos' => 300],
                ['name' => 'Dic', 'ingresos' => 450],
                ['name' => 'Ene', 'ingresos' => 200],
                ['name' => 'Feb', 'ingresos' => 600],
                ['name' => 'Mar', 'ingresos' => $totalRevenue > 0 ? $totalRevenue : 800],
            ];

            $dashboardData = [
                'totalEvents' => $totalEvents,
                'totalRevenue' => $totalRevenue,
                'subscription' => $activeSubscription,
                'revenueChart' => $revenueChart,
            ];

        } 
        // ─────────────────────────────────────────────────────────
        // DATOS B2C (NOVIOS / COUPLE)
        // ─────────────────────────────────────────────────────────
        else {
            
            $event = Event::where('user_id', $user->id)->latest()->first();
            
            if ($event) {
                $totalGuests = GuestMember::whereHas('group', function($q) use ($event) {
                    $q->where('event_id', $event->id);
                })->count();

                $confirmedGuests = GuestMember::whereHas('group', function($q) use ($event) {
                    $q->where('event_id', $event->id);
                })->where('is_attending', true)->count();

                $pendingGuests = $totalGuests - $confirmedGuests;

                $attendanceChart = [
                    ['name' => 'Confirmados', 'cantidad' => $confirmedGuests, 'fill' => '#C5A059'],
                    ['name' => 'Pendientes', 'cantidad' => $pendingGuests, 'fill' => '#E5E7EB'],
                ];

                $daysLeft = $event->date ? now()->diffInDays($event->date, false) : 0;

                $dashboardData = [
                    'event' => $event,
                    'totalGuests' => $totalGuests,
                    'confirmedGuests' => $confirmedGuests,
                    'attendanceChart' => $attendanceChart,
                    'daysLeft' => $daysLeft > 0 ? $daysLeft : 0,
                ];
            } else {
                $dashboardData = [
                    'event' => null,
                    'totalGuests' => 0,
                    'confirmedGuests' => 0,
                    'attendanceChart' => [],
                    'daysLeft' => 0,
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'role' => $role,
            'dashboardData' => $dashboardData,
        ]);
    }
}