<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\DeliveryAddressController;
use App\Http\Controllers\Api\AuthController;

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Restaurant routes
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{restaurantId}/meals', [RestaurantController::class, 'meals']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Subscription routes
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
    Route::put('/subscriptions/{id}', [SubscriptionController::class, 'update']);

    // Delivery address routes
    Route::get('/delivery-addresses', [DeliveryAddressController::class, 'index']);
    Route::post('/delivery-addresses', [DeliveryAddressController::class, 'store']);
    Route::get('/delivery-addresses/{id}', [DeliveryAddressController::class, 'show']);
    Route::put('/delivery-addresses/{id}', [DeliveryAddressController::class, 'update']);
    Route::delete('/delivery-addresses/{id}', [DeliveryAddressController::class, 'destroy']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/stats', function () {
        return response()->json(['ok' => true]);
    });
});

// Seller routes
Route::middleware(['auth:sanctum', 'role:seller'])->prefix('seller')->group(function () {
    Route::get('/orders', function () {
        return response()->json(['ok' => true]);
    });
});

