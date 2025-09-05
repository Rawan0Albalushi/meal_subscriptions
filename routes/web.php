<?php

use Illuminate\Support\Facades\Route;

// Mock payment route for development
Route::get('/payment/mock/{session_id}', function ($sessionId) {
    return response()->json([
        'success' => true,
        'message' => 'Mock payment completed',
        'session_id' => $sessionId,
        'status' => 'paid'
    ]);
})->name('payment.mock');

// Catch-all route for SPA - but exclude API routes
Route::view('/{any}', 'app')->where('any', '^(?!api).*');
