<?php

require_once 'vendor/autoload.php';

use App\Services\PaymentService;
use App\Models\Subscription;

try {
    echo "Debugging Thawani API Call...\n";
    
    // Create a new Laravel application instance
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test the payment service
    $paymentService = app(PaymentService::class);
    
    echo "Active Gateway: " . $paymentService->getActiveGateway() . "\n";
    
    // Test payment link creation with the same data structure as the real request
    $testData = [
        'user_id' => 4,
        'model_type' => Subscription::class,
        'model_id' => 1,
        'amount' => 130.0,
        'currency' => 'OMR',
        'description' => 'اشتراك أسبوعي - مطعم تجريبي',
        'subscription_data' => [
            'meal_ids' => [7, 7, 7, 7],
            'delivery_days' => ['tuesday', 'wednesday', 'sunday', 'monday'],
            'start_date' => '2025-09-02'
        ]
    ];
    
    echo "Creating payment link with data:\n";
    echo json_encode($testData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    
    $response = $paymentService->createPaymentLink($testData);
    
    echo "Payment Link: " . $response->paymentLink . "\n";
    echo "Session ID: " . $response->sessionId . "\n";
    echo "Gateway: " . $response->gatewayName . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}







