<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TilopayService
{
    protected $apiKey;
    protected $apiUser;
    protected $apiPass;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey  = config('services.tilopay.key');
        $this->apiUser = config('services.tilopay.user');
        $this->apiPass = config('services.tilopay.password');
        $this->baseUrl = 'https://app.tilopay.com/';
    }

    /**
     * Obtiene el Bearer Token via loginSdk.
     * Cachea el token hasta 55 minutos para evitar llamadas innecesarias.
     */
    public function getBearerToken(): ?string
    {
        // Usar token cacheado si existe (evita los 12+ tokens que veíamos en logs)
        $cacheKey = 'tilopay_bearer_token';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::asJson()->post($this->baseUrl . 'api/v1/loginSdk', [
                'apiuser'  => $this->apiUser,
                'password' => $this->apiPass,
                'key'      => $this->apiKey,
            ]);

            Log::info('Tilopay loginSdk Response', [
                'status'   => $response->status(),
                'response' => $response->json(),
            ]);

            if ($response->successful() && isset($response['access_token'])) {
                $token = $response['access_token'];

                // Cachear por 55 min (el token dura ~60 min según expires_in)
                Cache::put($cacheKey, $token, now()->addMinutes(55));

                return $token;
            }

            Log::error('Tilopay loginSdk Failed', [
                'status'   => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

        } catch (\Exception $e) {
            Log::error('Tilopay loginSdk Exception', ['message' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Verifica el estado de una orden contra la API de Tilopay.
     * Se usa en el callback para confirmar que el pago fue aprobado.
     */
    public function verifyPayment(string $orderNumber): bool
    {
        $bearer = $this->getBearerToken();
        if (!$bearer) {
            Log::error('Tilopay verifyPayment: No se pudo obtener bearer token');
            return false;
        }

        try {
            $response = Http::withToken($bearer)
                ->get($this->baseUrl . 'api/v1/order/' . $orderNumber);

            // LOG CRÍTICO: ver la estructura real que devuelve Tilopay
            Log::info("Tilopay verifyPayment response para [{$orderNumber}]", [
                'status_code' => $response->status(),
                'body'        => $response->json(),
            ]);

            if ($response->successful()) {
                $body   = $response->json();
                $status = $body['status'] ?? $body['response'] ?? $body['state'] ?? null;

                Log::info("Tilopay verifyPayment status extraído: [{$status}]");

                // Cubrir todos los valores posibles que usa Tilopay
                return in_array($status, [
                    'approved',
                    'paid',
                    'completed',
                    'success',
                    '1',
                    1,
                ], strict: false);
            }

            Log::error('Tilopay verifyPayment Failed', [
                'order'    => $orderNumber,
                'status'   => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

        } catch (\Exception $e) {
            Log::error('Tilopay verifyPayment Exception', [
                'order'   => $orderNumber,
                'message' => $e->getMessage(),
            ]);
        }

        return false;
    }

    /**
     * Cobros masivos o recurrentes.
     */
    public function createRecurringPayments(string $reason, array $users = []): ?array
    {
        $bearer = $this->getBearerToken();
        if (!$bearer) return null;

        $response = Http::withToken($bearer)
            ->asJson()
            ->post($this->baseUrl . 'api/v1/collect/set/payments', [
                'key'     => $this->apiKey,
                'capture' => 1,
                'reason'  => $reason,
                'users'   => $users,
            ]);

        return $response->json();
    }

    /**
     * Split Liquidation — divide la liquidación entre comercios.
     */
    public function splitLiquidation(string $orderId, array $commerces = []): ?array
    {
        $bearer = $this->getBearerToken();
        if (!$bearer) return null;

        $response = Http::withToken($bearer)
            ->asJson()
            ->post($this->baseUrl . 'api/v1/orders/liquidation/split', [
                'order_id'  => $orderId,
                'commerces' => $commerces,
                'lang'      => 'es',
            ]);

        return $response->json();
    }
}