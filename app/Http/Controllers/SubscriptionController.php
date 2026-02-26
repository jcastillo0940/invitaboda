<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http; // <-- Añadido para verificar pagos con PayPal
use Inertia\Inertia;

use App\Services\TilopayService;
use App\Models\Order;
use App\Models\Plan;
use App\Models\PaymentMethod;
use App\Models\Subscription;
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
        $plans = Plan::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Agency/Pricing', [
            'user' => auth()->user(),
            'plans' => $plans
        ]);
    }

    public function checkout(Request $request)
    {
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
            'type'         => $plan->slug, // Guardamos el slug del plan
        ]);

        $activeMethods = PaymentMethod::where('is_active', true)->orderBy('sort_order')->get();
        $allowedMethods = $activeMethods->filter(function ($method) use ($plan) {
            return $method->isAvailableForPlan($plan->slug);
        })->values();

        return Inertia::render('Agency/Checkout', [
            'plan'           => $plan->slug,
            'planDetails'    => $plan,
            'amount'         => $amount,
            'orderNumber'    => $orderNumber,
            'user'           => auth()->user(),
            'callbackUrl'    => route('payment.callback'),
            'paypalClientId' => config('services.paypal.client_id'),
            'paymentMethods' => $allowedMethods,
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

    public function paymentCallback(Request $request)
    {
        Log::info('Tilopay Callback Raw Data:', [
            'all'          => $request->all(),
            'query_string' => $request->getQueryString(),
            'url'          => $request->fullUrl(),
        ]);

        $orderNumber = $request->input('order_number')
                    ?? $request->input('orderNumber')
                    ?? $request->input('order');

        $responseCode = $request->input('response');

        if (!$orderNumber) {
            Log::error('Tilopay Callback: No se encontró orderNumber en el request');
            return redirect()->route('subscriptions.pricing')
                ->with('error', 'No se recibió número de orden en el callback.');
        }

        $order = Order::with('user')->where('order_number', $orderNumber)->first();

        if (!$order) {
            Log::error("Tilopay Callback: Orden {$orderNumber} no encontrada en DB");
            return redirect()->route('subscriptions.pricing')
                ->with('error', 'Orden no encontrada.');
        }

        Log::info("Iniciando verifyPayment para orden: {$orderNumber}");
        $isReallyPaid = $this->tilopay->verifyPayment($orderNumber);

        // ─── PAGO EXITOSO (TILOPAY) ───
        if ($responseCode == '1' && $isReallyPaid) {
            Log::info("✅ Pago exitoso con Tilopay para orden: {$orderNumber}");

            if ($order->status !== 'completed') {
                $order->update([
                    'status'          => 'completed',
                    'payment_method'  => 'tilopay',
                    'payment_details' => $request->all(),
                ]);

                $this->activateUserSubscription($order);
            }

            return redirect()->route('payment.success', ['order' => $order->order_number]);
        }

        // ─── PAGO FALLIDO (TILOPAY) ───
        Log::warning("❌ Pago fallido o no verificado con Tilopay", ['order' => $orderNumber]);

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

    public function paypalSuccess(Request $request)
    {
        $request->validate([
            'paypal_order_id' => 'required|string',
            'internal_order'  => 'required|string',
        ]);

        $order = Order::with('user')
                      ->where('order_number', $request->internal_order)
                      ->where('user_id', auth()->id())
                      ->first();

        if (!$order) {
            Log::error("PayPal Callback: Orden interna {$request->internal_order} no encontrada.");
            return back()->with('error', 'Orden no encontrada.');
        }

        // --- 1. OBTENER TOKEN DE PAYPAL DESDE EL BACKEND ---
        $paypalMode = config('services.paypal.mode', 'sandbox'); // 'sandbox' o 'live'
        $paypalBaseUrl = $paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
        
        $tokenResponse = Http::withBasicAuth(
            config('services.paypal.client_id'),
            config('services.paypal.secret')
        )->asForm()->post("{$paypalBaseUrl}/v1/oauth2/token", [
            'grant_type' => 'client_credentials'
        ]);

        if (!$tokenResponse->successful()) {
            Log::error("PayPal Verificación: Falló la obtención del token.");
            return back()->with('error', 'Error al verificar el pago con PayPal.');
        }

        $accessToken = $tokenResponse->json('access_token');

        // --- 2. VERIFICAR EL ESTADO REAL DE LA ORDEN EN PAYPAL ---
        $verifyResponse = Http::withToken($accessToken)
            ->get("{$paypalBaseUrl}/v2/checkout/orders/{$request->paypal_order_id}");

        if ($verifyResponse->successful() && $verifyResponse->json('status') === 'COMPLETED') {
            
            // EL PAGO ES 100% REAL Y CONFIRMADO POR PAYPAL
            if ($order->status !== 'completed') {
                $order->update([
                    'status'          => 'completed',
                    'payment_method'  => 'paypal',
                    'payment_details' => [
                        'paypal_order_id' => $request->paypal_order_id,
                        'payer_id'        => $verifyResponse->json('payer.payer_id') ?? null,
                        'verified_by'     => 'backend_api'
                    ],
                ]);

                $this->activateUserSubscription($order); 
            }

            Log::info("✅ Pago exitoso y verificado con PayPal para orden: {$order->order_number}");

            return redirect()->route('payment.success', ['order' => $order->order_number]);
        }

        // --- SI LLEGAMOS AQUÍ, EL PAGO ES FALSO O NO ESTÁ COMPLETADO ---
        Log::warning("❌ Intento de fraude o pago incompleto detectado", [
            'paypal_order_id' => $request->paypal_order_id,
            'internal_order'  => $request->internal_order,
            'real_status'     => $verifyResponse->json('status')
        ]);

        return back()->with('error', 'El pago con PayPal no pudo ser verificado o fue rechazado.');
    }

    /**
     * NUEVO MÉTODO CENTRALIZADO PARA CREAR/ACTUALIZAR SUSCRIPCIONES
     */
    protected function activateUserSubscription(Order $order)
    {
        // Buscamos el ID del plan usando el type de la orden (que guardaba el slug)
        $plan = Plan::where('slug', $order->type)->first();

        if (!$plan) {
            Log::error("Error al activar suscripción: Plan con slug {$order->type} no encontrado.");
            return;
        }

        // Desactivamos cualquier suscripción activa anterior para evitar duplicidad
        Subscription::where('user_id', $order->user_id)
            ->where('status', 'active')
            ->update(['status' => 'canceled']);

        // Creamos la nueva suscripción
        $subscription = Subscription::create([
            'user_id' => $order->user_id,
            'plan_id' => $plan->id,
            'status'  => 'active',
            'starts_at' => now(),
            'ends_at' => null,
            'next_billing_date' => now()->addMonth(), 
        ]);

        // Vinculamos la orden a la nueva suscripción
        $order->update(['subscription_id' => $subscription->id]);
    }

    public function paymentSuccess(Request $request)
    {
        $orderNumber = $request->input('order');

        if (!$orderNumber) return redirect()->route('dashboard');

        $order = Order::with('user')
                      ->where('order_number', $orderNumber)
                      ->where('status', 'completed')
                      ->first();

        if (!$order || $order->user_id !== auth()->id()) {
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
    
    public function billing()
    {
        $user = auth()->user();
        
        $subscription = Subscription::with('plan')
                            ->where('user_id', $user->id)
                            ->latest()
                            ->first();

        $orders = Order::where('user_id', $user->id)
                            ->orderBy('created_at', 'desc')
                            ->get();

        return Inertia::render('Agency/Billing', [
            'auth'         => ['user' => $user],
            'subscription' => $subscription,
            'orders'       => $orders,
        ]);
    }
}