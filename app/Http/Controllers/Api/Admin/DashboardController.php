<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Meal;
use App\Models\Subscription;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Calculate statistics
            $stats = [
                'totalUsers' => User::count(),
                'totalSellers' => User::where('role', 'seller')->count(),
                'totalRestaurants' => Restaurant::count(),
                'totalMeals' => Meal::count(),
                'totalSubscriptions' => Subscription::count(),
                'totalRevenue' => Subscription::where('status', '!=', 'cancelled')->sum('total_amount'),
            ];

            // Get recent activity (latest users, restaurants, subscriptions)
            $recentActivity = collect();
            
            // Recent users
            $recentUsers = User::latest()->take(5)->get()->map(function ($user) {
                return [
                    'type' => 'user_registration',
                    'description' => "مستخدم جديد: {$user->name}",
                    'created_at' => $user->created_at,
                    'icon' => '👤'
                ];
            });
            
            // Recent restaurants
            $recentRestaurants = Restaurant::latest()->take(5)->get()->map(function ($restaurant) {
                return [
                    'type' => 'restaurant_created',
                    'description' => "مطعم جديد: {$restaurant->name}",
                    'created_at' => $restaurant->created_at,
                    'icon' => '🍽️'
                ];
            });
            
            // Recent subscriptions
            $recentSubscriptions = Subscription::with(['user', 'restaurant'])->latest()->take(5)->get()->map(function ($subscription) {
                return [
                    'type' => 'subscription_created',
                    'description' => "اشتراك جديد من {$subscription->user->name} في {$subscription->restaurant->name}",
                    'created_at' => $subscription->created_at,
                    'icon' => '📋'
                ];
            });

            // Combine and sort by date
            $recentActivity = $recentUsers
                ->concat($recentRestaurants)
                ->concat($recentSubscriptions)
                ->sortByDesc('created_at')
                ->take(10)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    // Main statistics for dashboard cards
                    'totalUsers' => $stats['totalUsers'],
                    'totalSellers' => $stats['totalSellers'],
                    'totalRestaurants' => $stats['totalRestaurants'],
                    'totalMeals' => $stats['totalMeals'],
                    'totalSubscriptions' => $stats['totalSubscriptions'],
                    'totalRevenue' => $stats['totalRevenue'],
                    
                    // Detailed statistics
                    'userStats' => [
                        'totalUsers' => $stats['totalUsers'],
                        'totalSellers' => $stats['totalSellers'],
                        'totalCustomers' => User::where('role', 'customer')->count(),
                        'activeUsers' => $stats['totalUsers'], // All users are considered active
                    ],
                    'restaurantStats' => [
                        'totalRestaurants' => $stats['totalRestaurants'],
                        'activeRestaurants' => Restaurant::where('is_active', true)->count(),
                        'totalMeals' => $stats['totalMeals'],
                        'activeMeals' => Meal::where('is_available', true)->count(),
                    ],
                    'subscriptionStats' => [
                        'totalSubscriptions' => $stats['totalSubscriptions'],
                        'activeSubscriptions' => Subscription::where('status', 'active')->count(),
                        'pendingSubscriptions' => Subscription::where('status', 'pending')->count(),
                        'completedSubscriptions' => Subscription::where('status', 'completed')->count(),
                    ],
                    'revenueStats' => [
                        'totalRevenue' => $stats['totalRevenue'],
                        'monthlyRevenue' => Subscription::where('status', '!=', 'cancelled')
                            ->whereMonth('created_at', Carbon::now()->month)
                            ->sum('total_amount'),
                        'dailyRevenue' => Subscription::where('status', '!=', 'cancelled')
                            ->whereDate('created_at', Carbon::today())
                            ->sum('total_amount'),
                    ],
                    'recentActivity' => $recentActivity
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب البيانات',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
