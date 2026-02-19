<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Event Management
    Route::resource('events', \App\Http\Controllers\EventController::class);
    Route::get('events/{event}/guests', [\App\Http\Controllers\EventController::class, 'guests'])->name('events.guests');
    // Guest Management
    Route::post('events/{event}/guests', [\App\Http\Controllers\GuestController::class, 'store'])->name('guests.store');
    Route::delete('events/{event}/guests/{guestGroup}', [\App\Http\Controllers\GuestController::class, 'destroy'])->name('guests.destroy');

    // Table Management
    Route::get('events/{event}/tables', [\App\Http\Controllers\TableController::class, 'index'])->name('tables.index');
    Route::post('events/{event}/tables', [\App\Http\Controllers\TableController::class, 'store'])->name('tables.store');
    Route::delete('events/{event}/tables/{table}', [\App\Http\Controllers\TableController::class, 'destroy'])->name('tables.destroy');
    Route::post('events/{event}/tables/{table}/assign', [\App\Http\Controllers\TableController::class, 'assignMember'])->name('tables.assign');
    Route::post('events/{event}/unassign/{member}', [\App\Http\Controllers\TableController::class, 'unassignMember'])->name('tables.unassign');

    Route::post('events/{event}/upload', [\App\Http\Controllers\AssetController::class, 'upload'])->name('assets.upload');
    Route::post('events/{event}/update-design', [\App\Http\Controllers\EventController::class, 'updateDesign'])->name('events.update-design');

    // Agency B2B Management
    Route::get('/agency/settings', [\App\Http\Controllers\AgencyController::class, 'settings'])->name('agency.settings');
    Route::post('/agency/settings', [\App\Http\Controllers\AgencyController::class, 'updateSettings'])->name('agency.update-settings');

    // Subscriptions & Payments
    Route::get('/pricing', [\App\Http\Controllers\SubscriptionController::class, 'pricing'])->name('subscriptions.pricing');
    Route::get('/checkout', [\App\Http\Controllers\SubscriptionController::class, 'checkout'])->name('subscriptions.checkout');
    Route::post('/tilopay/token', [\App\Http\Controllers\SubscriptionController::class, 'getTilopayToken'])->name('tilopay.token');
    Route::get('/payment/callback', [\App\Http\Controllers\SubscriptionController::class, 'paymentCallback'])->name('payment.callback');
});

require __DIR__ . '/auth.php';

// Public Invitation Catch-all Route
Route::get('/{event_slug}', [\App\Http\Controllers\EventController::class, 'showPublic'])->name('event.public');
Route::post('/rsvp/{guest_group}', [\App\Http\Controllers\RSVPController::class, 'submit'])->name('rsvp.submit');
