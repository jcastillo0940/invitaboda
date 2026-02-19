<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TilopayService
{
    protected $apiKey;
    protected $apiUser;
    protected $apiPass;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.tilopay.key');
        $this->apiUser = config('services.tilopay.user');
        $this->apiPass = config('services.tilopay.password');
        $this->baseUrl = config('services.tilopay.environment') === 'production'
            ? 'https://app.tilopay.com/'
            : 'https://app.tilopay.com/'; // Tilopay often uses same base or specific sandbox subdomain
    }

    /**
     * Get bearer token for API calls
     */
    protected function getBearerToken()
    {
        // Tilopay V2 often requires api_key even for logic, or uses different field names
        $response = Http::post($this->baseUrl . 'api/v1/login', [
            'api_user' => $this->apiUser,
            'api_password' => $this->apiPass,
            'api_key' => $this->apiKey, // Some versions require this here too
        ]);

        if ($response->successful()) {
            return $response->json('access_token');
        }

        // Try alternative: some users report 'username' instead of 'api_user'
        $responseAlt = Http::post($this->baseUrl . 'api/v1/login', [
            'username' => $this->apiUser,
            'password' => $this->apiPass,
            'api_key' => $this->apiKey,
        ]);

        if ($responseAlt->successful()) {
            return $responseAlt->json('access_token');
        }

        Log::error('Tilopay Login Failed', [
            'status' => $response->status(),
            'response' => $response->json(),
            'baseUrl' => $this->baseUrl
        ]);
        return null;
    }

    /**
     * Get SDK Token for Frontend Init
     */
    public function getSdkToken($amount, $currency, $orderNumber)
    {
        $token = $this->getBearerToken();
        if (!$token)
            return null;

        $response = Http::withToken($token)
            ->post($this->baseUrl . 'api/v1/sdk/getToken', [
                'api_key' => $this->apiKey,
                'amount' => $amount,
                'currency' => $currency,
                'order_number' => $orderNumber,
            ]);

        if ($response->successful()) {
            return $response->json('sdk_token');
        }

        Log::error('Tilopay SDK Token Generation Failed', $response->json() ?? []);
        return null;
    }

    /**
     * Create Recurring Payments (Subscriptions)
     */
    public function createRecurringPayments($reason, $users = [], $groups = [])
    {
        $token = $this->getBearerToken();
        if (!$token)
            return null;

        $response = Http::withToken($token)
            ->post($this->baseUrl . 'api/v1/collect/set/payments', [
                'key' => $this->apiKey,
                'capture' => 1,
                'reason' => $reason,
                'users' => $users,
                'groups' => $groups,
            ]);

        return $response->json();
    }

    /**
     * Split Liquidation between Commerces
     */
    public function splitLiquidation($orderId, $commerces = [])
    {
        $token = $this->getBearerToken();
        if (!$token)
            return null;

        $response = Http::withToken($token)
            ->post($this->baseUrl . 'api/v1/orders/liquidation/split', [
                'order_id' => $orderId,
                'commerces' => $commerces,
            ]);

        return $response->json();
    }
}
