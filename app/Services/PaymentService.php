<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;
use App\Models\PaymentGateway;
use App\Models\PaymentSession;
use App\Models\PaymentTransaction;
use App\Services\PaymentGateways\StripeGateway;
use App\Services\PaymentGateways\PayPalGateway;
use App\Services\PaymentGateways\ThawaniGateway;
use App\Services\PaymentGateways\MockGateway;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    private array $gateways = [];
    private string $activeGateway;
    private bool $gatewaysLoaded = false;

    public function __construct()
    {
        // Don't load gateways in constructor to avoid database dependency issues
        // Gateways will be loaded lazily when needed
    }

    private function loadGateways(): void
    {
        if ($this->gatewaysLoaded) {
            return;
        }

        try {
            $gatewayConfigs = PaymentGateway::active()->get();
            
            foreach ($gatewayConfigs as $gatewayConfig) {
                try {
                    $this->gateways[$gatewayConfig->name] = $this->createGatewayInstance(
                        $gatewayConfig->name, 
                        $gatewayConfig->config
                    );
                } catch (Exception $e) {
                    Log::warning("Failed to load payment gateway: {$gatewayConfig->name}", [
                        'error' => $e->getMessage(),
                        'reason' => 'Missing API keys or configuration error'
                    ]);
                    // Continue loading other gateways
                }
            }
            // If no gateways were loaded from DB, fallback to config
            if (empty($this->gateways)) {
                Log::info('No active gateways found in DB, falling back to config');
                $this->loadGatewaysFromConfig();
            }
        } catch (Exception $e) {
            Log::warning("Failed to load gateways from database, using config fallback", [
                'error' => $e->getMessage()
            ]);
            // Fallback to config-based gateways
            $this->loadGatewaysFromConfig();
        }

        $this->gatewaysLoaded = true;
    }

    private function loadGatewaysFromConfig(): void
    {
        $config = config('payment.gateways');
        
        foreach ($config as $gatewayName => $gatewayConfig) {
            try {
                $this->gateways[$gatewayName] = $this->createGatewayInstance($gatewayName, $gatewayConfig);
            } catch (Exception $e) {
                Log::warning("Failed to load payment gateway from config: {$gatewayName}", [
                    'error' => $e->getMessage(),
                    'reason' => 'Missing API keys or configuration error'
                ]);
            }
        }
    }

    private function createGatewayInstance(string $gatewayName, array $config): PaymentGatewayInterface
    {
        // Validate that required API keys are present
        $this->validateGatewayConfig($gatewayName, $config);
        
        return match($gatewayName) {
            'stripe' => $this->createStripeGateway($config),
            'paypal' => $this->createPayPalGateway($config),
            'thawani' => new ThawaniGateway($config),
            'mock' => new MockGateway($config),
            default => throw new Exception("Unsupported gateway: {$gatewayName}")
        };
    }

    private function createStripeGateway(array $config): PaymentGatewayInterface
    {
        if (!class_exists('Stripe\StripeClient')) {
            throw new Exception("Stripe package not installed. Please run: composer require stripe/stripe-php");
        }
        return new StripeGateway($config);
    }

    private function createPayPalGateway(array $config): PaymentGatewayInterface
    {
        // PayPal doesn't require external packages, so it should work
        return new PayPalGateway($config);
    }

    private function validateGatewayConfig(string $gatewayName, array $config): void
    {
        $requiredKeys = match($gatewayName) {
            'stripe' => ['public_key', 'secret_key'],
            'paypal' => ['client_id', 'client_secret'],
            'thawani' => ['public_key', 'secret_key'],
            'mock' => [], // Mock gateway doesn't need API keys
            default => []
        };

        foreach ($requiredKeys as $key) {
            if (empty($config[$key])) {
                throw new Exception("Missing required API key '{$key}' for {$gatewayName} gateway");
            }
        }
    }

    private function setActiveGateway(): void
    {
        // First try to use the configured default gateway if it's available
        $defaultGateway = config('payment.default_gateway');
        if ($defaultGateway && isset($this->gateways[$defaultGateway])) {
            $this->activeGateway = $defaultGateway;
            return;
        }
        
        // If default gateway is not available, use the first available gateway
        if (!empty($this->gateways)) {
            $first = array_key_first($this->gateways);
            if ($first !== null && isset($this->gateways[$first])) {
                $this->activeGateway = $first;
                return;
            }
        }
        throw new Exception('No active payment gateway configured');
    }

    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        $this->loadGateways();
        $this->setActiveGateway();
        
        $gateway = $this->gateways[$this->activeGateway];
        
        // Prepare common data
        // Thawani requires ABSOLUTE URLs; generate absolute routes
        $paymentData = array_merge($data, [
            'success_url' => route('payment.success', ['subscription_id' => $data['model_id']], true),
            'cancel_url' => route('payment.cancel', ['subscription_id' => $data['model_id']], true)
        ]);

        $response = $gateway->createPaymentLink($paymentData);

        // Prepare gateway data with subscription data
        $gatewayDataWithSubscription = array_merge($response->gatewayData, [
            'subscription_data' => $data['subscription_data'] ?? []
        ]);
        
        Log::info('Creating payment session with data', [
            'session_id' => $response->sessionId,
            'subscription_data' => $data['subscription_data'] ?? null,
            'gateway_data_with_subscription' => $gatewayDataWithSubscription
        ]);
        
        // Create payment session record
        PaymentSession::create([
            'id' => $response->sessionId,
            'user_id' => $data['user_id'],
            'model_type' => $data['model_type'],
            'model_id' => $data['model_id'],
            'gateway_name' => $this->activeGateway,
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'payment_link' => $response->paymentLink,
            'gateway_data' => $gatewayDataWithSubscription,
            'expires_at' => now()->addHours(24), // 24 hour expiry
            'status' => 'pending'
        ]);

        Log::info('Payment link created', [
            'session_id' => $response->sessionId,
            'gateway' => $this->activeGateway,
            'amount' => $data['amount'],
            'user_id' => $data['user_id'],
            'subscription_data' => $data['subscription_data'] ?? null
        ]);

        return $response;
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        $this->loadGateways();
        
        $paymentSession = PaymentSession::where('id', $sessionId)->first();
        
        if (!$paymentSession) {
            Log::warning('Payment session not found', ['session_id' => $sessionId]);
            return new PaymentValidationResponse(
                isValid: false,
                status: 'failed',
                gatewayData: [],
                errorMessage: 'Payment session not found'
            );
        }

        if ($paymentSession->isExpired()) {
            $paymentSession->update(['status' => 'expired']);
            return new PaymentValidationResponse(
                isValid: false,
                status: 'expired',
                gatewayData: [],
                errorMessage: 'Payment session expired'
            );
        }

        $gateway = $this->gateways[$paymentSession->gateway_name];
        $response = $gateway->validatePayment($sessionId);

        // Update payment session - preserve existing gateway_data including subscription_data
        $existingGatewayData = $paymentSession->gateway_data ?? [];
        $updatedGatewayData = array_merge($existingGatewayData, $response->gatewayData);
        
        $paymentSession->update([
            'status' => $response->status,
            'gateway_data' => $updatedGatewayData,
            'paid_at' => $response->status === 'paid' ? now() : null
        ]);

        Log::info('Payment validation completed', [
            'session_id' => $sessionId,
            'status' => $response->status,
            'is_valid' => $response->isValid,
            'existing_gateway_data' => $existingGatewayData,
            'updated_gateway_data' => $updatedGatewayData
        ]);

        return $response;
    }

    public function getActiveGateway(): string
    {
        $this->loadGateways();
        $this->setActiveGateway();
        return $this->activeGateway;
    }

    public function getAvailableGateways(): array
    {
        $this->loadGateways();
        return array_keys($this->gateways);
    }

    public function switchGateway(string $gatewayName): void
    {
        $this->loadGateways();
        if (!isset($this->gateways[$gatewayName])) {
            throw new Exception("Gateway {$gatewayName} is not available");
        }
        
        $this->activeGateway = $gatewayName;
    }
}
