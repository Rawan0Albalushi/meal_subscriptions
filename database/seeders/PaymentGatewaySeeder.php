<?php

namespace Database\Seeders;

use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class PaymentGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gateways = [
            [
                'name' => 'thawani',
                'display_name' => 'Thawani',
                'is_active' => true,
                'config' => [
                    'public_key' => env('THAWANI_PUBLIC_KEY'),
                    'secret_key' => env('THAWANI_SECRET_KEY'),
                    'mode' => env('THAWANI_MODE', 'test'),
                ]
            ],
            [
                'name' => 'stripe',
                'display_name' => 'Stripe',
                'is_active' => true,
                'config' => [
                    'public_key' => env('STRIPE_PUBLIC_KEY'),
                    'secret_key' => env('STRIPE_SECRET_KEY'),
                    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
                    'mode' => env('STRIPE_MODE', 'test'),
                ]
            ],
            [
                'name' => 'paypal',
                'display_name' => 'PayPal',
                'is_active' => true,
                'config' => [
                    'client_id' => env('PAYPAL_CLIENT_ID'),
                    'client_secret' => env('PAYPAL_CLIENT_SECRET'),
                    'mode' => env('PAYPAL_MODE', 'sandbox'),
                ]
            ],
        ];

        foreach ($gateways as $gateway) {
            PaymentGateway::updateOrCreate(
                ['name' => $gateway['name']],
                $gateway
            );
        }
    }
}