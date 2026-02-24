<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

use App\Services\TilopayService;
use App\Models\Order;
use App\Models\Plan;           // <-- Importamos Plan
use App\Models\PaymentMethod; // <-- Importamos PaymentMethod
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    protected $tilopay;

    public function __construct(TilopayService $tilopay)
    {
        $this->tilopay = $tilopay;
    }

    public function pricing()
    {
        // Extraemos los planes activos desde la base de datos
        $plans = Plan::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Agency/Pricing', [
            'user' => auth()->user(),
            'plans' => $plans // Mandamos los planes a React
        ]);
    }

    public function checkout(Request $request)
    {
        // Leemos el plan directamente desde la BD
        $planSlug    = $request->input('plan');
        $plan        = Plan::where('slug', $planSlug)->where('is_active', true)->firstOrFail();
        
        $amount      = $plan->price;
        $orderNumber = 'INV-' . strtoupper(Str::random(10));

        Order::create([
            'user_id'      => auth()->id(),
            'order_number' => $orderNumber,
            'amount'       => $amount,
            'currency'     => 'USD',
            'status'       => 'pending',
            'type'         => $plan->slug,
        ]);

        // Extraemos SOLO los métodos de pago que están activos Y que aplican para este plan
        $activeMethods = PaymentMethod::where('is_active', true)->orderBy('sort_order')->get();
        $allowedMethods = $activeMethods->filter(function ($method) use ($plan) {
            return $method->isAvailableForPlan($plan->slug);
        })->values();

        return Inertia::render('Agency/Checkout', [
            'plan'           => $plan->slug, // Pasamos el slug como antes para mantener compatibilidad temporal
            'planDetails'    => $plan,       // Pasamos los detalles completos del plan
            'amount'         => $amount,
            'orderNumber'    => $orderNumber,
            'user'           => auth()->user(),
            'callbackUrl'    => route('payment.callback'),
            'paypalClientId' => config('services.paypal.client_id'),
            'paymentMethods' => $allowedMethods, // <-- Pasamos los métodos de pago filtrados
        ]);
    }

    public function getTilopayToken(Request $request)
    {
        try {
            if (!$request->has('orderNumber')) {
                return response()->json(['error' => 'No se recibió orderNumber.'], 400);
            }

            $order = Order::where('order_number', $request->orderNumber)
                          ->where('user_id', auth()->id())
                          ->first();

            if (!$order) {
                return response()->json(['error' => 'La orden no existe o no pertenece al usuario actual.'], 404);
            }

            if ($order->status !== 'pending') {
                return response()->json([
                    'error'  => 'La orden no está en estado pending.',
                    'status' => $order->status,
                ], 400);
            }

            $token = $this->tilopay->getBearerToken();

            if (!$token) {
                return response()->json(['error' => 'No se pudo obtener el token de Tilopay.'], 500);
            }

            return response()->json(['token' => $token]);

        } catch (\Exception $e) {
            Log::error('getTilopayToken Exception', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'error'   => 'Error interno del servidor.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Callback que recibe Tilopay tras el pago.
     * Tilopay redirige al usuario aquí con query params.
     */
    public function paymentCallback(Request $request)
    {
        // ─── LOG: Ver exactamente qué manda Tilopay ───────────────────────────
        Log::info('Tilopay Callback Raw Data:', [
            'all'          => $request->all(),
            'query_string' => $request->getQueryString(),
            'url'          => $request->fullUrl(),
        ]);

        // Tilopay puede enviar el número de orden con distintos nombres
        $orderNumber = $request->input('order_number')
                    ?? $request->input('orderNumber')
                    ?? $request->input('order');

        $responseCode = $request->input('response');

        // ─── Sin orderNumber ───────────────────────────────────────────────────
        if (!$orderNumber) {
            Log::error('Tilopay Callback: No se encontró orderNumber en el request', [
                'params' => $request->all(),
            ]);

            return redirect()->route('subscriptions.pricing')
                ->with('error', 'No se recibió número de orden en el callback.');
        }

        // ─── Buscar la orden en DB ─────────────────────────────────────────────
        $order = Order::with('user')->where('order_number', $orderNumber)->first();

        if (!$order) {
            Log::error("Tilopay Callback: Orden {$orderNumber} no encontrada en DB");

            return redirect()->route('subscriptions.pricing')
                ->with('error', 'Orden no encontrada.');
        }

        // ─── Verificar con la API de Tilopay ──────────────────────────────────
        Log::info("Iniciando verifyPayment para orden: {$orderNumber}", [
            'responseCode' => $responseCode,
            'order_status' => $order->status,
        ]);

        $isReallyPaid = $this->tilopay->verifyPayment($orderNumber);

        // ─── PAGO EXITOSO (TILOPAY) ───────────────────────────────────────────
        if ($responseCode == '1' && $isReallyPaid) {
            Log::info("✅ Pago exitoso con Tilopay para orden: {$orderNumber}");

            if ($order->status !== 'completed') {
                $order->update([
                    'status'          => 'completed',
                    'payment_method'  => 'tilopay',
                    'payment_details' => $request->all(),
                ]);

                $order->user->update([
                    'plan'            => $order->type,
                    'plan_expires_at' => now()->addMonth(),
                ]);
            }

            // Redirigir a la pantalla de éxito con los detalles
            return redirect()->route('payment.success', [
                'order' => $order->order_number,
            ]);
        }

        // ─── PAGO FALLIDO (TILOPAY) ───────────────────────────────────────────
        Log::warning("❌ Pago fallido o no verificado con Tilopay", [
            'order'        => $orderNumber,
            'responseCode' => $responseCode,
            'isReallyPaid' => $isReallyPaid,
        ]);

        if ($order->status === 'pending') {
            $order->update([
                'status'          => 'failed',
                'payment_method'  => 'tilopay',
                'payment_details' => $request->all(),
            ]);
        }

        return redirect()->route('subscriptions.pricing')
            ->with('error', 'El pago no pudo ser verificado o fue rechazado.');
    }

    // ────────────────────────────────────────────────────────────────────────
    // NUEVO MÉTODO: Callback para cuando se procesa un pago exitoso con PAYPAL
    // ────────────────────────────────────────────────────────────────────────
    public function paypalSuccess(Request $request)
    {
        $request->validate([
            'paypal_order_id' => 'required|string',
            'internal_order'  => 'required|string', // El número de orden generado en checkout()
            'status'          => 'required|string',
        ]);

        if ($request->status === 'COMPLETED') {
            
            $order = Order::with('user')
                          ->where('order_number', $request->internal_order)
                          ->where('user_id', auth()->id())
                          ->first();

            if (!$order) {
                Log::error("PayPal Callback: Orden interna {$request->internal_order} no encontrada.");
                return back()->with('error', 'Orden no encontrada.');
            }

            if ($order->status !== 'completed') {
                $order->update([
                    'status'          => 'completed',
                    'payment_method'  => 'paypal',
                    'payment_details' => [
                        'paypal_order_id' => $request->paypal_order_id,
                        'payer_id'        => $request->payer_id ?? null,
                    ],
                ]);

                $order->user->update([
                    'plan'            => $order->type,
                    'plan_expires_at' => now()->addMonth(),
                ]);
            }

            Log::info("✅ Pago exitoso con PayPal para orden: {$order->order_number}");

            return redirect()->route('payment.success', [
                'order' => $order->order_number,
            ]);
        }

        Log::warning("❌ Intento de pago PayPal fallido o incompleto", [
            'paypal_order_id' => $request->paypal_order_id,
            'internal_order'  => $request->internal_order,
            'status'          => $request->status,
        ]);

        return back()->with('error', 'El pago con PayPal no pudo ser verificado.');
    }

    /**
     * Pantalla de éxito que muestra los detalles de la transacción.
     */
    public function paymentSuccess(Request $request)
    {
        $orderNumber = $request->input('order');

        if (!$orderNumber) {
            return redirect()->route('dashboard');
        }

        $order = Order::with('user')
                      ->where('order_number', $orderNumber)
                      ->where('status', 'completed')
                      ->first();

        if (!$order) {
            return redirect()->route('dashboard');
        }

        // Seguridad: solo el dueño de la orden puede verla
        if ($order->user_id !== auth()->id()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Agency/PaymentSuccess', [
            'order' => [
                'order_number'    => $order->order_number,
                'amount'          => $order->amount,
                'currency'        => $order->currency,
                'type'            => $order->type,
                'status'          => $order->status,
                'payment_method'  => $order->payment_method ?? 'No especificado',
                'created_at'      => $order->created_at->format('d/m/Y H:i'),
                'payment_details' => $order->payment_details,
            ],
            'user' => auth()->user(),
        ]);
    }
}