<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentGateway;

class PaymentGatewaySeeder extends Seeder
{
    public function run(): void
    {
        $gateways = [
            [
                'name' => 'thawani',
                'display_name' => 'Thawani',
                'is_active' => true,
                'config' => [
                    'api_key' => 'test_key',
                    'secret' => 'test_secret',
                    'mode' => 'test'
                ],
            ],
        ];

        foreach ($gateways as $data) {
            PaymentGateway::updateOrCreate(
                ['name' => $data['name']],
                [
                    'display_name' => $data['display_name'],
                    'is_active' => $data['is_active'],
                    // Store as array; Eloquent will JSON-encode for JSON column
                    'config' => $data['config'],
                ]
            );
        }
    }
}


