<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\SubscriptionTypeController;
use App\Http\Controllers\Api\DeliveryAddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Seller\RestaurantController as SellerRestaurantController;
use App\Http\Controllers\Api\Seller\MealController as SellerMealController;

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Restaurant routes
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/filters', [RestaurantController::class, 'getFilters']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{restaurantId}/meals', [RestaurantController::class, 'meals']);

// Subscription type routes
Route::get('/subscription-types', [SubscriptionTypeController::class, 'index']);
Route::get('/subscription-types/{id}', [SubscriptionTypeController::class, 'show']);
Route::get('/subscription-types/type/{type}', [SubscriptionTypeController::class, 'getByType']);
Route::get('/restaurants/{restaurantId}/subscription-types', [SubscriptionTypeController::class, 'getByRestaurant']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Restaurant owner subscription type management
    Route::middleware('role:restaurant_owner')->group(function () {
        Route::post('/subscription-types', [SubscriptionTypeController::class, 'store']);
        Route::put('/subscription-types/{id}', [SubscriptionTypeController::class, 'update']);
        Route::delete('/subscription-types/{id}', [SubscriptionTypeController::class, 'destroy']);
    });

    // Subscription routes
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
    Route::put('/subscriptions/{id}', [SubscriptionController::class, 'update']);
    Route::put('/subscriptions/{subscriptionId}/items/{itemId}/status', [SubscriptionController::class, 'updateItemStatus']);

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
    
    // Subscription type management
    Route::apiResource('subscription-types', \App\Http\Controllers\Api\Admin\SubscriptionTypeController::class);
});

// Seller routes
Route::middleware(['auth:sanctum', 'role:seller'])->prefix('seller')->group(function () {
    // Restaurant management
    Route::apiResource('restaurants', SellerRestaurantController::class);
    Route::put('restaurants/{id}/toggle-status', [SellerRestaurantController::class, 'toggleStatus']);
    Route::get('restaurants/{id}/stats', [SellerRestaurantController::class, 'stats']);
    
    // Meal management
    Route::get('restaurants/{restaurantId}/meals', [SellerMealController::class, 'index']);
    Route::get('restaurants/{restaurantId}/meals/{mealId}', [SellerMealController::class, 'show']);
    Route::post('restaurants/{restaurantId}/meals', [SellerMealController::class, 'store']);
    Route::put('restaurants/{restaurantId}/meals/{mealId}', [SellerMealController::class, 'update']);
    Route::delete('restaurants/{restaurantId}/meals/{mealId}', [SellerMealController::class, 'destroy']);
    Route::put('restaurants/{restaurantId}/meals/{mealId}/toggle-availability', [SellerMealController::class, 'toggleAvailability']);
    Route::get('restaurants/{restaurantId}/meals/stats', [SellerMealController::class, 'stats']);
    
    // Dashboard stats
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'مرحباً بك في لوحة تحكم البائع'
        ]);
    });
});

