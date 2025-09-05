<?php

namespace App\DTOs;

class PaymentLinkResponse
{
    public function __construct(
        public string $paymentLink,
        public string $sessionId,
        public array $gatewayData,
        public string $gatewayName
    ) {}

    public function toArray(): array
    {
        return [
            'payment_link' => $this->paymentLink,
            'session_id' => $this->sessionId,
            'gateway_data' => $this->gatewayData,
            'gateway_name' => $this->gatewayName
        ];
    }
}

