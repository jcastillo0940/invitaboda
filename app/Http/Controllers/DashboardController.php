<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        $events = Event::where('user_id', $user->id)
            ->withCount([
                'guestGroups as confirmed_groups_count' => function ($query) {
                    $query->where('status', 'confirmed');
                },
                'guestGroups as pending_groups_count' => function ($query) {
                    $query->where('status', 'pending');
                },
                'guestGroups as checked_in_groups_count' => function ($query) {
                    $query->where('is_checked_in', true);
                }
            ])
            ->withSum(['guestGroups as total_people' => function ($q) {
                $q; }], 'total_passes')
            ->withSum([
                'guestGroups as checked_in_people' => function ($q) {
                    $q->where('is_checked_in', true);
                }
            ], 'total_passes')
            ->withSum([
                'guestGroups as pending_arrival_people' => function ($q) {
                    $q->where('status', 'confirmed')->where('is_checked_in', false);
                }
            ], 'total_passes')
            ->latest()
            ->get();

        $stats = [
            'total_events' => $events->count(),
            'total_guests' => (int) GuestGroup::whereIn('event_id', $events->pluck('id'))->sum('total_passes'),
            'confirmed_guests' => (int) GuestGroup::whereIn('event_id', $events->pluck('id'))->where('status', 'confirmed')->sum('total_passes'),
            'currently_inside' => (int) GuestGroup::whereIn('event_id', $events->pluck('id'))->where('is_checked_in', true)->sum('total_passes'),
        ];

        return Inertia::render('Dashboard', [
            'events' => $events,
            'stats' => $stats,
            'role' => $user->role
        ]);
    }
}
