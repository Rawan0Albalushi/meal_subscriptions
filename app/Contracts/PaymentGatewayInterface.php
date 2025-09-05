<?php

namespace App\Contracts;

use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;

interface PaymentGatewayInterface
{
    /**
     * Create a payment link for the given data
     *
     * @param array $data
     * @return PaymentLinkResponse
     */
    public function createPaymentLink(array $data): PaymentLinkResponse;

    /**
     * Validate a payment session
     *
     * @param string $sessionId
     * @return PaymentValidationResponse
     */
    public function validatePayment(string $sessionId): PaymentValidationResponse;
}
