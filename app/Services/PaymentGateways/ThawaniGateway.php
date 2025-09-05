<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;
use Exception;
use Illuminate\Support\Facades\Log;

class ThawaniGateway implements PaymentGatewayInterface
{
    private array $config;
    private string $baseUrl;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->baseUrl = $config['mode'] === 'live' 
            ? 'https://checkout.thawani.om/api/v1' 
            : 'https://uatcheckout.thawani.om/api/v1';
    }

    /**
     * Format product name to ensure it doesn't exceed 39 characters
     * If it exceeds, add three dots as prefix
     */
    private function formatProductName(string $name): string
    {
        $maxLength = 39;
        
        if (mb_strlen($name) <= $maxLength) {
            return $name;
        }
        
        // If name exceeds 39 characters, add three dots as prefix
        return '...' . mb_substr($name, 0, $maxLength - 3);
    }

    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        try {
            $sessionData = [
                'client_reference_id' => uniqid('thawani_'),
                'mode' => 'payment',
                'products' => [[
                    'name' => $this->formatProductName($data['description'] ?? 'Subscription Payment'),
                    'quantity' => 1,
                    'unit_amount' => (int)($data['amount'] * 1000), // Convert to baisa
                ]],
                'success_url' => $data['success_url'],
                'cancel_url' => $data['cancel_url'],
                'metadata' => [
                    'model_type' => $data['model_type'],
                    'model_id' => $data['model_id'],
                    'user_id' => $data['user_id']
                ]
            ];

            // Log the data being sent to Thawani for debugging
            Log::info('Thawani API Request', [
                'endpoint' => '/checkout/session',
                'data' => $sessionData
            ]);
            
            $response = $this->makeRequest('POST', '/checkout/session', $sessionData);

            if (!$response || !isset($response['data']['session_id'])) {
                throw new Exception('Failed to create Thawani session');
            }

            $sessionId = $response['data']['session_id'];
            // Use the correct base URL for payment links (without /api/v1)
            $paymentBaseUrl = $this->config['mode'] === 'live' 
                ? 'https://checkout.thawani.om' 
                : 'https://uatcheckout.thawani.om';
            $paymentUrl = $paymentBaseUrl . '/pay/' . $sessionId . '?key=' . $this->config['public_key'];

            return new PaymentLinkResponse(
                paymentLink: $paymentUrl,
                sessionId: $sessionId,
                gatewayData: $response['data'],
                gatewayName: 'thawani'
            );
        } catch (Exception $e) {
            throw new Exception("Thawani payment link creation failed: " . $e->getMessage());
        }
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        try {
            $response = $this->makeRequest('GET', "/checkout/session/{$sessionId}");

            if (!$response || !isset($response['data'])) {
                return new PaymentValidationResponse(
                    isValid: false,
                    status: 'failed',
                    gatewayData: [],
                    errorMessage: 'Session not found'
                );
            }

            $sessionData = $response['data'];
            $status = match($sessionData['payment_status']) {
                'paid' => 'paid',
                'pending' => 'pending',
                'failed' => 'failed',
                default => 'failed'
            };

            return new PaymentValidationResponse(
                isValid: $status === 'paid',
                status: $status,
                gatewayData: $sessionData,
                errorMessage: $status !== 'paid' ? 'Payment not completed' : null
            );
        } catch (Exception $e) {
            return new PaymentValidationResponse(
                isValid: false,
                status: 'failed',
                gatewayData: [],
                errorMessage: $e->getMessage()
            );
        }
    }

    private function makeRequest(string $method, string $endpoint, ?array $data = null): ?array
    {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
            'thawani-api-key: ' . $this->config['secret_key']
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new Exception("Thawani API cURL error: {$curlError}");
        }

        if ($httpCode >= 400) {
            $errorResponse = $response ? json_decode($response, true) : null;
            $errorMessage = "Thawani API error: HTTP {$httpCode}";
            if ($errorResponse && isset($errorResponse['message'])) {
                $errorMessage .= " - " . $errorResponse['message'];
            } elseif ($response) {
                $errorMessage .= " - " . $response;
            }
            throw new Exception($errorMessage);
        }

        return $response ? json_decode($response, true) : null;
    }
}
