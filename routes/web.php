<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ManageSubscriptionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    // ── Profile ──────────────────────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    // ── Event Management ─────────────────────────────────────────────────────
    Route::resource('events', \App\Http\Controllers\EventController::class);
    Route::get('events/{event}/guests', [\App\Http\Controllers\EventController::class, 'guests'])->name('events.guests');


    // ── Guest Management ─────────────────────────────────────────────────────
    Route::post('events/{event}/guests', [\App\Http\Controllers\GuestController::class, 'store'])->name('guests.store');
    Route::delete('events/{event}/guests/{guestGroup}', [\App\Http\Controllers\GuestController::class, 'destroy'])->name('guests.destroy');
    
    // <-- RUTA PROTEGIDA POR EL NUEVO MIDDLEWARE DE PLANES -->
    Route::get('events/{event}/guests/export', [\App\Http\Controllers\GuestController::class, 'export'])
        ->middleware(\App\Http\Middleware\CheckPlanFeature::class . ':feature_export_data')
        ->name('guests.export');


    // ── Table Management ─────────────────────────────────────────────────────
    Route::get('events/{event}/tables', [\App\Http\Controllers\TableController::class, 'index'])->name('tables.index');
    Route::post('events/{event}/tables', [\App\Http\Controllers\TableController::class, 'store'])->name('tables.store');
    Route::delete('events/{event}/tables/{table}', [\App\Http\Controllers\TableController::class, 'destroy'])->name('tables.destroy');
    Route::post('events/{event}/tables/{table}/assign', [\App\Http\Controllers\TableController::class, 'assignMember'])->name('tables.assign');
    Route::post('events/{event}/unassign/{member}', [\App\Http\Controllers\TableController::class, 'unassignMember'])->name('tables.unassign');


    // ── Assets & Design ──────────────────────────────────────────────────────
    Route::post('events/{event}/upload', [\App\Http\Controllers\AssetController::class, 'upload'])->name('assets.upload');
    Route::post('events/{event}/update-design', [\App\Http\Controllers\EventController::class, 'updateDesign'])->name('events.update-design');


    // ── Check-In / Puerta Virtual ────────────────────────────────────────────
    Route::get('events/{event}/check-in', [\App\Http\Controllers\EventCheckInController::class, 'index'])->name('events.check-in');
    Route::post('events/{event}/check-in/validate', [\App\Http\Controllers\EventCheckInController::class, 'validateGuest'])->name('events.check-in.validate');
    Route::post('events/{event}/check-in/{guestGroup}/toggle', [\App\Http\Controllers\EventCheckInController::class, 'toggleCheckIn'])->name('events.check-in.toggle');


    // ── Agency B2B & Facturación (SOLO PLANNERS) ─────────────────────────────
    Route::middleware('planner')->group(function () {
        Route::get('/agency/settings', [\App\Http\Controllers\AgencyController::class, 'settings'])->name('agency.settings');
        Route::post('/agency/settings', [\App\Http\Controllers\AgencyController::class, 'updateSettings'])->name('agency.update-settings');
        Route::get('/agency/billing', [SubscriptionController::class, 'billing'])->name('agency.billing');
    });


    // ── Subscriptions & Payments (Autenticados) ──────────────────────────────
    Route::get('/pricing', [SubscriptionController::class, 'pricing'])->name('subscriptions.pricing');
    Route::get('/checkout', [SubscriptionController::class, 'checkout'])->name('subscriptions.checkout');
    Route::post('/tilopay/token', [SubscriptionController::class, 'getTilopayToken'])->name('tilopay.token');
    Route::get('/payment/callback', [SubscriptionController::class, 'paymentCallback'])->name('payment.callback');
    Route::get('/payment/success', [SubscriptionController::class, 'paymentSuccess'])->name('payment.success');
    Route::post('/paypal/success', [SubscriptionController::class, 'paypalSuccess'])->name('paypal.success');


    // ── Manejo de Suscripción Activa ─────────────────────────────────────────
    Route::post('/subscriptions/{subscription}/pause', [ManageSubscriptionController::class, 'pause'])->name('subscriptions.pause');
    Route::post('/subscriptions/{subscription}/resume', [ManageSubscriptionController::class, 'resume'])->name('subscriptions.resume');
    Route::post('/subscriptions/{subscription}/cancel', [ManageSubscriptionController::class, 'cancel'])->name('subscriptions.cancel');

});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

        Route::resource('/designs', \App\Http\Controllers\Admin\DesignController::class)->names('designs');

        // Configuración General y Métodos de Pago
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings');
        Route::put('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');
        Route::put('/settings/payment-methods/{paymentMethod}/toggle',
            [\App\Http\Controllers\Admin\SettingController::class, 'togglePaymentMethod']
        )->name('settings.payment-methods.toggle');

        // CRUD Planes
        Route::resource('/plans', \App\Http\Controllers\Admin\PlanController::class);

        // CRUD Usuarios
        Route::resource('/users', \App\Http\Controllers\Admin\UserController::class)
            ->except(['create', 'show', 'edit']);

        // Gestión Manual de Suscripciones
        Route::resource('/user-subscriptions',
            \App\Http\Controllers\Admin\UserSubscriptionController::class
        )->only(['index', 'store', 'update']);
});


/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';


/*
|--------------------------------------------------------------------------
| Public RSVP
|--------------------------------------------------------------------------
*/

Route::post('/rsvp/{guest_group}',
    [\App\Http\Controllers\RSVPController::class, 'submit']
)->name('rsvp.submit');


/*
|--------------------------------------------------------------------------
| Public Event Page (Catch-All - SIEMPRE AL FINAL)
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Public Event Page (Catch-All - SIEMPRE AL FINAL)
|--------------------------------------------------------------------------
*/

// NUEVA RUTA: Procesar el formulario de PIN
Route::post('/{event_slug}/verify-pin', 
    [\App\Http\Controllers\EventController::class, 'verifyPin']
)->name('event.public.verify-pin');

// RUTA EXISTENTE: Mostrar la invitación o pedir el PIN
Route::get('/{event_slug}',
    [\App\Http\Controllers\EventController::class, 'showPublic']
)->name('event.public');