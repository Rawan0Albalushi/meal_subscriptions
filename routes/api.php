<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\SubscriptionTypeController;
use App\Http\Controllers\Api\DeliveryAddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Seller\RestaurantController as SellerRestaurantController;
use App\Http\Controllers\Api\Seller\MealController as SellerMealController;
use App\Http\Controllers\Api\ContactInformationController;
use App\Http\Controllers\RestaurantAddressController;

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

// Contact information routes
Route::get('/contact-information', [ContactInformationController::class, 'index']);

// Restaurant addresses routes (public)
Route::get('/restaurant-addresses/areas', [RestaurantAddressController::class, 'getAvailableAreas']);

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
    Route::post('/subscriptions/initiate-payment', [SubscriptionController::class, 'initiatePayment']);
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

// Public payment routes (no authentication required for callbacks)
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->name('payment.webhook');
Route::get('/payments/success', [PaymentController::class, 'success'])->name('payment.success');
Route::get('/payments/cancel', [PaymentController::class, 'cancel'])->name('payment.cancel');
Route::get('/payments/status/{subscriptionId}', [PaymentController::class, 'checkStatus']);

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
    
    // User management
    Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class);
    Route::put('users/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\UserController::class, 'toggleStatus']);
    
    // Restaurant management
    Route::apiResource('restaurants', \App\Http\Controllers\Api\Admin\RestaurantController::class);
    Route::put('restaurants/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\RestaurantController::class, 'toggleStatus']);
    Route::get('restaurants/sellers/list', [\App\Http\Controllers\Api\Admin\RestaurantController::class, 'getSellers']);
    
    // Meal management
    Route::apiResource('meals', \App\Http\Controllers\Api\Admin\MealController::class);
    Route::put('meals/{id}/toggle-availability', [\App\Http\Controllers\Api\Admin\MealController::class, 'toggleAvailability']);
    Route::get('meals/restaurants/list', [\App\Http\Controllers\Api\Admin\MealController::class, 'getRestaurants']);
    Route::get('meals/types/list', [\App\Http\Controllers\Api\Admin\MealController::class, 'getMealTypes']);
    Route::get('meals/subscription-types/list', [\App\Http\Controllers\Api\Admin\MealController::class, 'getSubscriptionTypes']);
    
    // Subscription management
    Route::get('subscriptions/statistics', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'getStatistics']);
    Route::get('subscriptions/restaurants/list', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'getRestaurants']);
    Route::get('subscriptions/users/list', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'getUsers']);
    Route::get('subscriptions/status-options', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'getStatusOptions']);
    Route::apiResource('subscriptions', \App\Http\Controllers\Api\Admin\SubscriptionController::class);
    Route::put('subscriptions/{subscriptionId}/items/{itemId}/status', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'updateItemStatus']);
    
    // Today orders management
    Route::get('today-orders', [\App\Http\Controllers\Api\Admin\TodayOrdersController::class, 'index']);
    Route::get('today-orders/export', [\App\Http\Controllers\Api\Admin\TodayOrdersController::class, 'export']);
    Route::put('orders/{id}/status', [\App\Http\Controllers\Api\Admin\TodayOrdersController::class, 'updateStatus']);
    
    // Debug route to check subscription items
    Route::get('debug/subscription-items', function() {
        $total = \App\Models\SubscriptionItem::count();
        $today = \App\Models\SubscriptionItem::whereDate('delivery_date', \Carbon\Carbon::today())->count();
        $recent = \App\Models\SubscriptionItem::whereDate('delivery_date', '>=', \Carbon\Carbon::today()->subDays(7))->count();
        
        return response()->json([
            'total_subscription_items' => $total,
            'today_items' => $today,
            'recent_items_7_days' => $recent,
            'today_date' => \Carbon\Carbon::today()->format('Y-m-d')
        ]);
    });
    
    // Debug route to check payment sessions
    Route::get('debug/payment-sessions', function() {
        $total = \App\Models\PaymentSession::count();
        $today = \App\Models\PaymentSession::whereDate('created_at', \Carbon\Carbon::today())->count();
        $recent = \App\Models\PaymentSession::whereDate('created_at', '>=', \Carbon\Carbon::today()->subDays(7))->count();
        $byStatus = \App\Models\PaymentSession::selectRaw('status, count(*) as count')->groupBy('status')->get();
        
        return response()->json([
            'total_payment_sessions' => $total,
            'today_sessions' => $today,
            'recent_sessions_7_days' => $recent,
            'by_status' => $byStatus,
            'today_date' => \Carbon\Carbon::today()->format('Y-m-d')
        ]);
    });
    
    // Payment management
    Route::get('payments/statistics', [\App\Http\Controllers\Api\Admin\PaymentController::class, 'getStatistics']);
    Route::get('payments/restaurants/list', [\App\Http\Controllers\Api\Admin\PaymentController::class, 'getRestaurants']);
    Route::get('payments/users/list', [\App\Http\Controllers\Api\Admin\PaymentController::class, 'getUsers']);
    Route::get('payments/methods/list', [\App\Http\Controllers\Api\Admin\PaymentController::class, 'getPaymentMethods']);
    Route::get('payments/status-options', [\App\Http\Controllers\Api\Admin\PaymentController::class, 'getStatusOptions']);
    Route::apiResource('payments', \App\Http\Controllers\Api\Admin\PaymentController::class);
    Route::post('payments/{id}/refund', [\App\Http\Controllers\Api\Admin\PaymentController::class, 'refund']);
    
    // Address management
    Route::apiResource('addresses', \App\Http\Controllers\Api\Admin\AddressController::class);
    Route::put('addresses/{id}/set-primary', [\App\Http\Controllers\Api\Admin\AddressController::class, 'setPrimary']);
    Route::get('addresses/areas/list', [\App\Http\Controllers\Api\Admin\AddressController::class, 'getAreas']);
    Route::get('addresses/users/list', [\App\Http\Controllers\Api\Admin\AddressController::class, 'getUsers']);
    Route::get('addresses/statistics', [\App\Http\Controllers\Api\Admin\AddressController::class, 'getStatistics']);
    Route::get('addresses/restaurants', [\App\Http\Controllers\Api\Admin\AddressController::class, 'getRestaurantAddresses']);
    
    // Settings management
    Route::get('settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'index']);
    Route::put('settings', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'update']);
    Route::get('settings/system-info', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'getSystemInfo']);
    Route::post('settings/clear-cache', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'clearCache']);
    Route::get('settings/logs', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'getLogs']);
    Route::get('settings/logs/{filename}/download', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'downloadLog']);
    
    // Reports
    Route::get('/reports', [\App\Http\Controllers\Api\Admin\ReportsController::class, 'index']);
    Route::get('/reports/export', [\App\Http\Controllers\Api\Admin\ReportsController::class, 'export']);
    
    // Subscription type management
    Route::apiResource('subscription-types', \App\Http\Controllers\Api\Admin\SubscriptionTypeController::class);
    Route::get('subscription-types/restaurants/list', [\App\Http\Controllers\Api\Admin\SubscriptionTypeController::class, 'getRestaurants']);
    
    // Contact information management
    Route::put('/contact-information', [ContactInformationController::class, 'update']);
});

// Seller routes
Route::middleware(['auth:sanctum', 'role:seller', 'log.auth'])->prefix('seller')->group(function () {
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
    
    // Restaurant addresses management
    Route::get('restaurants/{restaurantId}/addresses', [RestaurantAddressController::class, 'index']);
    Route::get('restaurants/{restaurantId}/addresses/{addressId}', [RestaurantAddressController::class, 'show']);
    Route::post('restaurants/{restaurantId}/addresses', [RestaurantAddressController::class, 'store']);
    Route::put('restaurants/{restaurantId}/addresses/{addressId}', [RestaurantAddressController::class, 'update']);
    Route::delete('restaurants/{restaurantId}/addresses/{addressId}', [RestaurantAddressController::class, 'destroy']);
    Route::put('restaurants/{restaurantId}/addresses/{addressId}/set-primary', [RestaurantAddressController::class, 'setPrimary']);
    
    // Subscription types management for sellers
    Route::get('restaurants/{restaurantId}/subscription-types', [SubscriptionTypeController::class, 'getByRestaurant']);
    Route::post('subscription-types', [SubscriptionTypeController::class, 'store']);
    Route::put('subscription-types/{id}', [SubscriptionTypeController::class, 'update']);
    Route::delete('subscription-types/{id}', [SubscriptionTypeController::class, 'destroy']);
    
    // Subscription management for sellers
    Route::get('restaurants/{restaurantId}/subscriptions', [SubscriptionController::class, 'getSellerSubscriptions']);
    Route::get('restaurants/{restaurantId}/subscriptions/{subscriptionId}', [SubscriptionController::class, 'getSellerSubscription']);
    Route::put('restaurants/{restaurantId}/subscriptions/{subscriptionId}/status', [SubscriptionController::class, 'updateSellerSubscriptionStatus']);
    Route::put('restaurants/{restaurantId}/subscriptions/{subscriptionId}/items/{itemId}/status', [SubscriptionController::class, 'updateSellerItemStatus']);
    
    // Today's orders for sellers
    Route::get('restaurants/{restaurantId}/today-orders', [SubscriptionController::class, 'getTodayOrders']);
    
    // Reports for sellers
    Route::get('/reports', [\App\Http\Controllers\Api\Seller\ReportsController::class, 'index']);
    
    // Dashboard stats
    Route::get('/dashboard', [\App\Http\Controllers\Api\Seller\DashboardController::class, 'index']);
});

