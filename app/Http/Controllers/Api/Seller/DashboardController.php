<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\Meal;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $seller = $request->user();
            
            // Get seller's restaurants
            $restaurants = Restaurant::where('seller_id', $seller->id)->get();
            $restaurantIds = $restaurants->pluck('id')->toArray();

            if (empty($restaurantIds)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'totalRestaurants' => 0,
                        'activeRestaurants' => 0,
                        'totalMeals' => 0,
                        'activeMeals' => 0,
                        'totalSubscriptions' => 0,
                        'totalRevenue' => 0,
                        'recentActivity' => []
                    ]
                ]);
            }

            // Calculate statistics
            $stats = [
                'totalRestaurants' => $restaurants->count(),
                'activeRestaurants' => $restaurants->where('is_active', true)->count(),
                'totalMeals' => Meal::whereIn('restaurant_id', $restaurantIds)->count(),
                'activeMeals' => Meal::whereIn('restaurant_id', $restaurantIds)->where('is_available', true)->count(),
                'totalSubscriptions' => Subscription::whereIn('restaurant_id', $restaurantIds)->count(),
                'totalRevenue' => Subscription::whereIn('restaurant_id', $restaurantIds)->where('status', '!=', 'cancelled')->sum('total_amount'),
            ];

            // Get recent activity (latest subscriptions)
            $recentActivity = Subscription::with(['restaurant', 'user'])
                ->whereIn('restaurant_id', $restaurantIds)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($subscription) {
                    return [
                        'id' => $subscription->id,
                        'type' => 'subscription',
                        'title' => $subscription->restaurant->name . ' - ' . $subscription->subscription_type,
                        'customer' => $subscription->user->name,
                        'amount' => $subscription->total_amount,
                        'status' => $subscription->status,
                        'date' => $subscription->created_at->format('Y-m-d H:i:s'),
                        'formatted_date' => $subscription->created_at->diffForHumans()
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => array_merge($stats, ['recentActivity' => $recentActivity])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }
}
