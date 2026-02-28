<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Añadimos la validación estricta para el campo 'role'
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:couple,planner', // <-- SOLO permitimos estos dos roles desde el frontend público
        ]);

        // Iniciamos la transacción para garantizar integridad de datos
        DB::beginTransaction();

        try {
            // 2. Guardamos el usuario con el rol que eligió
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role, // <-- Asignamos el rol validado
            ]);

            // 3. Buscamos el plan gratuito por defecto
            $freePlan = Plan::where('price', 0)->where('is_active', true)->first();

            // Prevención de seguridad: Si no existe el plan FREE, abortamos el registro de forma limpia
            if (!$freePlan) {
                throw ValidationException::withMessages([
                    'email' => 'El sistema de planes no está configurado actualmente. Por favor, intenta más tarde.',
                ]);
            }

            // 4. Asignamos la suscripción base activa e ilimitada en tiempo (ends_at = null)
            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $freePlan->id,
                'status' => 'active',
                'starts_at' => now(),
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}