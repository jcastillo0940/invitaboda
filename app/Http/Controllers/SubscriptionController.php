<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

use App\Services\TilopayService;
use App\Models\Order;
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
        return Inertia::render('Agency/Pricing', [
            'user' => auth()->user()
        ]);
    }

    public function checkout(Request $request)
    {
        $plan        = $request->input('plan');
        $amount      = $plan === 'agency' ? 49.99 : 19.99;
        $orderNumber = 'INV-' . strtoupper(Str::random(10));

        Order::create([
            'user_id'      => auth()->id(),
            'order_number' => $orderNumber,
            'amount'       => $amount,
            'currency'     => 'USD',
            'status'       => 'pending',
            'type'         => $plan === 'agency' ? 'agency' : 'elite',
        ]);

        return Inertia::render('Agency/Checkout', [
            'plan'        => $plan,
            'amount'      => $amount,
            'orderNumber' => $orderNumber,
            'user'        => auth()->user(),
            'callbackUrl' => route('payment.callback'),
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

        // ─── PAGO EXITOSO ─────────────────────────────────────────────────────
        if ($responseCode == '1' && $isReallyPaid) {
            Log::info("✅ Pago exitoso para orden: {$orderNumber}");

            if ($order->status !== 'completed') {
                $order->update([
                    'status'          => 'completed',
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

        // ─── PAGO FALLIDO ─────────────────────────────────────────────────────
        Log::warning("❌ Pago fallido o no verificado", [
            'order'        => $orderNumber,
            'responseCode' => $responseCode,
            'isReallyPaid' => $isReallyPaid,
        ]);

        if ($order->status === 'pending') {
            $order->update([
                'status'          => 'failed',
                'payment_details' => $request->all(),
            ]);
        }

        return redirect()->route('subscriptions.pricing')
            ->with('error', 'El pago no pudo ser verificado o fue rechazado.');
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
                'created_at'      => $order->created_at->format('d/m/Y H:i'),
                'payment_details' => $order->payment_details,
            ],
            'user' => auth()->user(),
        ]);
    }
}