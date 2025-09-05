<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;

class MockGateway implements PaymentGatewayInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        // Generate a mock payment link for development
        $sessionId = 'mock_' . uniqid();
        $paymentUrl = route('payment.mock', ['session_id' => $sessionId]);

        return new PaymentLinkResponse(
            paymentLink: $paymentUrl,
            sessionId: $sessionId,
            gatewayData: [
                'mock' => true,
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'description' => $data['description']
            ],
            gatewayName: 'mock'
        );
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        // Mock validation - always return successful for development
        return new PaymentValidationResponse(
            isValid: true,
            status: 'paid',
            gatewayData: ['mock' => true, 'session_id' => $sessionId],
            errorMessage: null
        );
    }
}
