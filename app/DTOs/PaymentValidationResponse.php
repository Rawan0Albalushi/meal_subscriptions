<?php

namespace App\DTOs;

class PaymentValidationResponse
{
    public function __construct(
        public bool $isValid,
        public string $status, // 'paid', 'failed', 'pending', 'expired'
        public array $gatewayData,
        public ?string $errorMessage = null
    ) {}

    public function toArray(): array
    {
        return [
            'is_valid' => $this->isValid,
            'status' => $this->status,
            'gateway_data' => $this->gatewayData,
            'error_message' => $this->errorMessage
        ];
    }
}

