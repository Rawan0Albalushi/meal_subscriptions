<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;
use Exception;

class PayPalGateway implements PaymentGatewayInterface
{
    private array $config;
    private string $baseUrl;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->baseUrl = $config['mode'] === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
    }

    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        try {
            $accessToken = $this->getAccessToken();
            
            $orderData = [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => $data['currency'],
                        'value' => (string)$data['amount']
                    ],
                    'description' => $data['description'] ?? 'Subscription Payment',
                    'custom_id' => json_encode([
                        'model_type' => $data['model_type'],
                        'model_id' => $data['model_id'],
                        'user_id' => $data['user_id']
                    ])
                ]],
                'application_context' => [
                    'return_url' => $data['success_url'],
                    'cancel_url' => $data['cancel_url']
                ]
            ];

            $response = $this->makeRequest('POST', '/v2/checkout/orders', $orderData, $accessToken);
            
            if (!$response || !isset($response['id'])) {
                throw new Exception('Failed to create PayPal order');
            }

            // Find the approval URL
            $approvalUrl = null;
            foreach ($response['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    $approvalUrl = $link['href'];
                    break;
                }
            }

            if (!$approvalUrl) {
                throw new Exception('Approval URL not found in PayPal response');
            }

            return new PaymentLinkResponse(
                paymentLink: $approvalUrl,
                sessionId: $response['id'],
                gatewayData: $response,
                gatewayName: 'paypal'
            );
        } catch (Exception $e) {
            throw new Exception("PayPal payment link creation failed: " . $e->getMessage());
        }
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        try {
            $accessToken = $this->getAccessToken();
            $order = $this->makeRequest('GET', "/v2/checkout/orders/{$sessionId}", null, $accessToken);
            
            if (!$order) {
                return new PaymentValidationResponse(
                    isValid: false,
                    status: 'failed',
                    gatewayData: [],
                    errorMessage: 'Order not found'
                );
            }
            
            $status = match($order['status']) {
                'COMPLETED' => 'paid',
                'PENDING' => 'pending',
                'APPROVED' => 'pending',
                default => 'failed'
            };

            return new PaymentValidationResponse(
                isValid: $status === 'paid',
                status: $status,
                gatewayData: $order,
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

    private function getAccessToken(): string
    {
        $response = $this->makeRequest('POST', '/v1/oauth2/token', [
            'grant_type' => 'client_credentials'
        ], null, true);

        if (!$response || !isset($response['access_token'])) {
            throw new Exception('Failed to get PayPal access token');
        }

        return $response['access_token'];
    }

    private function makeRequest(string $method, string $endpoint, ?array $data = null, ?string $accessToken = null, bool $isAuth = false): ?array
    {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        if ($accessToken) {
            $headers[] = "Authorization: Bearer {$accessToken}";
        } elseif ($isAuth) {
            $auth = base64_encode($this->config['client_id'] . ':' . $this->config['client_secret']);
            $headers[] = "Authorization: Basic {$auth}";
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                if ($isAuth) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
                    $headers[0] = 'Content-Type: application/x-www-form-urlencoded';
                } else {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("PayPal API error: HTTP {$httpCode}");
        }

        return $response ? json_decode($response, true) : null;
    }
}

