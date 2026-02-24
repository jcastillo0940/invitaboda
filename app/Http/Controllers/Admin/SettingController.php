<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        // Traemos todas las configuraciones generales
        $settings = Setting::all()->keyBy('key');
        
        // Traemos todos los métodos de pago ordenados
        $paymentMethods = PaymentMethod::orderBy('sort_order')->get();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'contact_email' => 'required|email',
            'currency' => 'required|string|max:10',
            'payment_mode' => 'required|in:sandbox,production',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return back()->with('success', 'Configuración guardada correctamente.');
    }

    // Método para apagar/encender métodos de pago al instante
    public function togglePaymentMethod(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $paymentMethod->update([
            'is_active' => $validated['is_active'],
        ]);

        return back()->with('success', 'Estado del método de pago actualizado.');
    }
}