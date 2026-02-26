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
        $role = $user->role ?? 'user'; // 'agency' para B2B, 'user' para B2C
        $dashboardData = [];

        if ($role === 'agency') {
            // ---------------------------------------------------------
            // DATOS B2B (WEDDING PLANNERS / AGENCIAS)
            // ---------------------------------------------------------
            $totalEvents = Event::where('user_id', $user->id)->count();
            
            // Total de ingresos (Órdenes completadas)
            $totalRevenue = Order::where('user_id', $user->id)
                                 ->where('status', 'completed')
                                 ->sum('amount');

            // Suscripción Activa
            $activeSubscription = $user->activeSubscription()->with('plan')->first();

            // Datos para el gráfico de ingresos (Últimos 6 meses - Simulado/Calculado)
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

        } else {
            // ---------------------------------------------------------
            // DATOS B2C (NOVIOS)
            // ---------------------------------------------------------
            // Buscamos su evento principal
            $event = Event::where('user_id', $user->id)->latest()->first();
            
            if ($event) {
                // Estadísticas de invitados usando la relación 'group' correcta
                $totalGuests = GuestMember::whereHas('group', function($q) use ($event) {
                    $q->where('event_id', $event->id);
                })->count();

                // Contamos solo los GuestMembers que marcaron is_attending = true
                $confirmedGuests = GuestMember::whereHas('group', function($q) use ($event) {
                    $q->where('event_id', $event->id);
                })->where('is_attending', true)->count();

                $pendingGuests = $totalGuests - $confirmedGuests;

                // Gráfico de asistencia
                $attendanceChart = [
                    ['name' => 'Confirmados', 'cantidad' => $confirmedGuests, 'fill' => '#C5A059'],
                    ['name' => 'Pendientes', 'cantidad' => $pendingGuests, 'fill' => '#E5E7EB'],
                ];

                // Días restantes
                $daysLeft = $event->date ? now()->diffInDays($event->date, false) : 0;

                $dashboardData = [
                    'event' => $event,
                    'totalGuests' => $totalGuests,
                    'confirmedGuests' => $confirmedGuests,
                    'attendanceChart' => $attendanceChart,
                    'daysLeft' => $daysLeft > 0 ? $daysLeft : 0,
                ];
            } else {
                $dashboardData = ['event' => null];
            }
        }

        return Inertia::render('Dashboard', [
            'role' => $role,
            'dashboardData' => $dashboardData,
        ]);
    }
}