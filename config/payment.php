<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    |
    | This option controls the default payment gateway that will be used
    | when no specific gateway is requested. This should be one of the
    | gateways configured in the 'gateways' array below.
    |
    */

    'default_gateway' => env('DEFAULT_PAYMENT_GATEWAY', 'thawani'),

    /*
    |--------------------------------------------------------------------------
    | Payment Gateways Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the settings for each payment gateway.
    | Each gateway has its own configuration options.
    |
    */

    'gateways' => [
        'stripe' => [
            'public_key' => env('STRIPE_PUBLIC_KEY'),
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
            'mode' => env('STRIPE_MODE', 'test'), // 'test' or 'live'
        ],
        
        'paypal' => [
            'client_id' => env('PAYPAL_CLIENT_ID'),
            'client_secret' => env('PAYPAL_CLIENT_SECRET'),
            'mode' => env('PAYPAL_MODE', 'sandbox'), // 'sandbox' or 'live'
        ],
        
        'thawani' => [
            'public_key' => env('THAWANI_PUBLIC_KEY'),
            'secret_key' => env('THAWANI_SECRET_KEY'),
            'mode' => env('THAWANI_MODE', 'test'), // 'test' or 'live'
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Session Settings
    |--------------------------------------------------------------------------
    |
    | These options control the behavior of payment sessions.
    |
    */

    'session' => [
        'expiry_hours' => env('PAYMENT_SESSION_EXPIRY_HOURS', 24),
        'cleanup_after_days' => env('PAYMENT_CLEANUP_AFTER_DAYS', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency Settings
    |--------------------------------------------------------------------------
    |
    | Default currency and supported currencies for payments.
    |
    */

    'currency' => [
        'default' => env('PAYMENT_DEFAULT_CURRENCY', 'OMR'),
        'supported' => ['OMR', 'USD', 'EUR'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for payment gateway webhooks.
    |
    */

    'webhook' => [
        'verify_signature' => env('PAYMENT_WEBHOOK_VERIFY_SIGNATURE', true),
        'log_requests' => env('PAYMENT_WEBHOOK_LOG_REQUESTS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for payment notifications.
    |
    */

    'notifications' => [
        'email' => [
            'enabled' => env('PAYMENT_EMAIL_NOTIFICATIONS', true),
            'from_address' => env('PAYMENT_EMAIL_FROM', env('MAIL_FROM_ADDRESS')),
            'from_name' => env('PAYMENT_EMAIL_FROM_NAME', env('APP_NAME')),
        ],
        'sms' => [
            'enabled' => env('PAYMENT_SMS_NOTIFICATIONS', false),
        ],
    ],
];
