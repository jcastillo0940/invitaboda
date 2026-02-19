<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
        $plan = $request->input('plan');
        $amount = $plan === 'agency' ? 49.99 : 19.99;
        $orderNumber = 'INV-' . strtoupper(Str::random(10));

        // Create initial pending order
        Order::create([
            'user_id' => auth()->id(),
            'order_number' => $orderNumber,
            'amount' => $amount,
            'currency' => 'USD',
            'status' => 'pending',
            'type' => $plan === 'agency' ? 'agency' : 'elite',
        ]);

        return Inertia::render('Agency/Checkout', [
            'plan' => $plan,
            'amount' => $amount,
            'orderNumber' => $orderNumber,
            'tilopayConfig' => [
                'apiKey' => config('services.tilopay.key'),
                'environment' => config('services.tilopay.environment'),
            ],
            'user' => auth()->user(),
        ]);
    }

    /**
     * Get SDK Token for Tilopay Frontend
     */
    public function getTilopayToken(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'currency' => 'required|string|size:3',
            'orderNumber' => 'required|string',
        ]);

        $token = $this->tilopay->getSdkToken(
            $request->amount,
            $request->currency,
            $request->orderNumber
        );

        if (!$token) {
            return response()->json(['error' => 'Could not generate payment token'], 500);
        }

        return response()->json(['token' => $token]);
    }

    /**
     * Handle payment redirection
     */
    public function paymentCallback(Request $request)
    {
        // Tilopay redirects back with parameters
        // Example: ?order_id=...&response=...&...
        $orderNumber = $request->input('order_number') ?: $request->input('orderNumber');
        $responseCode = $request->input('response'); // Usually '1' for success in many gateways or specific tilopay codes

        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if ($responseCode == '1') {
            $order->update([
                'status' => 'completed',
                'payment_details' => $request->all()
            ]);

            $user = $order->user;
            $user->update([
                'plan' => $order->type,
                'plan_expires_at' => now()->addMonth() // Subscription logic
            ]);

            return redirect()->route('dashboard')->with('success', '¡Pago procesado con éxito!');
        }

        $order->update([
            'status' => 'failed',
            'payment_details' => $request->all()
        ]);

        return redirect()->route('subscriptions.pricing')->with('error', 'El pago ha fallado o fue cancelado.');
    }
}
