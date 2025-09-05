<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class StripeGateway implements PaymentGatewayInterface
{
    private StripeClient $stripe;
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->stripe = new StripeClient($config['secret_key']);
    }

    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        try {
            $session = $this->stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => strtolower($data['currency']),
                        'product_data' => [
                            'name' => $data['description'] ?? 'Subscription Payment',
                        ],
                        'unit_amount' => (int)($data['amount'] * 100), // Convert to cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $data['success_url'],
                'cancel_url' => $data['cancel_url'],
                'metadata' => [
                    'model_type' => $data['model_type'],
                    'model_id' => $data['model_id'],
                    'user_id' => $data['user_id']
                ]
            ]);

            return new PaymentLinkResponse(
                paymentLink: $session->url,
                sessionId: $session->id,
                gatewayData: $session->toArray(),
                gatewayName: 'stripe'
            );
        } catch (ApiErrorException $e) {
            throw new \Exception("Stripe payment link creation failed: " . $e->getMessage());
        }
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        try {
            $session = $this->stripe->checkout->sessions->retrieve($sessionId);
            
            $status = match($session->payment_status) {
                'paid' => 'paid',
                'unpaid' => 'pending',
                default => 'failed'
            };

            return new PaymentValidationResponse(
                isValid: $status === 'paid',
                status: $status,
                gatewayData: $session->toArray(),
                errorMessage: $status !== 'paid' ? 'Payment not completed' : null
            );
        } catch (ApiErrorException $e) {
            return new PaymentValidationResponse(
                isValid: false,
                status: 'failed',
                gatewayData: [],
                errorMessage: $e->getMessage()
            );
        }
    }
}

