<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\Meal;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $seller = $request->user();
            $period = $request->get('period', 'month');
            $restaurantId = $request->get('restaurant_id', 'all');

            // Get seller's restaurants
            $restaurantsQuery = Restaurant::where('seller_id', $seller->id);
            if ($restaurantId !== 'all') {
                $restaurantsQuery->where('id', $restaurantId);
            }
            $restaurants = $restaurantsQuery->get();

            $restaurantIds = $restaurants->pluck('id')->toArray();

            if (empty($restaurantIds)) {
                return response()->json([
                    'success' => true,
                    'reports' => $this->getEmptyReports(),
                    'recentOrders' => [],
                    'topMeals' => []
                ]);
            }

            // Calculate date ranges
            $dateRanges = $this->getDateRanges($period);

            // Get reports data
            $reports = $this->getReportsData($restaurantIds, $dateRanges);

            // Get recent orders
            $recentOrders = $this->getRecentOrders($restaurantIds);

            // Get top meals
            $topMeals = $this->getTopMeals($restaurantIds, $dateRanges);

            return response()->json([
                'success' => true,
                'reports' => $reports,
                'recentOrders' => $recentOrders,
                'topMeals' => $topMeals
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reports data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getDateRanges($period)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'today':
                return [
                    'start' => $now->startOfDay(),
                    'end' => $now->endOfDay()
                ];
            case 'week':
                return [
                    'start' => $now->startOfWeek(),
                    'end' => $now->endOfWeek()
                ];
            case 'month':
                return [
                    'start' => $now->startOfMonth(),
                    'end' => $now->endOfMonth()
                ];
            case 'year':
                return [
                    'start' => $now->startOfYear(),
                    'end' => $now->endOfYear()
                ];
            default:
                return [
                    'start' => $now->startOfMonth(),
                    'end' => $now->endOfMonth()
                ];
        }
    }

    private function getReportsData($restaurantIds, $dateRanges)
    {
        // Revenue data
        $revenue = $this->getRevenueData($restaurantIds, $dateRanges);
        
        // Orders data
        $orders = $this->getOrdersData($restaurantIds, $dateRanges);
        
        // Subscriptions data
        $subscriptions = $this->getSubscriptionsData($restaurantIds);
        
        // Restaurants data
        $restaurants = $this->getRestaurantsData($restaurantIds);
        
        // Meals data
        $meals = $this->getMealsData($restaurantIds);

        return [
            'revenue' => $revenue,
            'orders' => $orders,
            'subscriptions' => $subscriptions,
            'restaurants' => $restaurants,
            'meals' => $meals
        ];
    }

    private function getRevenueData($restaurantIds, $dateRanges)
    {
        // Total revenue
        $totalRevenue = Subscription::whereIn('restaurant_id', $restaurantIds)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        // Period revenue
        $periodRevenue = Subscription::whereIn('restaurant_id', $restaurantIds)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$dateRanges['start'], $dateRanges['end']])
            ->sum('total_amount');

        // Today revenue
        $todayRevenue = Subscription::whereIn('restaurant_id', $restaurantIds)
            ->where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        // This week revenue
        $thisWeekRevenue = Subscription::whereIn('restaurant_id', $restaurantIds)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('total_amount');

        // This month revenue
        $thisMonthRevenue = Subscription::whereIn('restaurant_id', $restaurantIds)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->sum('total_amount');

        return [
            'total' => $totalRevenue,
            'period' => $periodRevenue,
            'today' => $todayRevenue,
            'thisWeek' => $thisWeekRevenue,
            'thisMonth' => $thisMonthRevenue
        ];
    }

    private function getOrdersData($restaurantIds, $dateRanges)
    {
        // Total orders (subscriptions)
        $totalOrders = Subscription::whereIn('restaurant_id', $restaurantIds)->count();

        // Period orders
        $periodOrders = Subscription::whereIn('restaurant_id', $restaurantIds)
        ->whereBetween('created_at', [$dateRanges['start'], $dateRanges['end']])
        ->count();

        // Today orders
        $todayOrders = Subscription::whereIn('restaurant_id', $restaurantIds)
        ->whereDate('created_at', Carbon::today())
        ->count();

        // This week orders
        $thisWeekOrders = Subscription::whereIn('restaurant_id', $restaurantIds)
        ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
        ->count();

        // This month orders
        $thisMonthOrders = Subscription::whereIn('restaurant_id', $restaurantIds)
        ->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
        ->count();

        return [
            'total' => $totalOrders,
            'period' => $periodOrders,
            'today' => $todayOrders,
            'thisWeek' => $thisWeekOrders,
            'thisMonth' => $thisMonthOrders
        ];
    }

    private function getSubscriptionsData($restaurantIds)
    {
        $total = Subscription::whereIn('restaurant_id', $restaurantIds)->count();
        $active = Subscription::whereIn('restaurant_id', $restaurantIds)->where('status', 'active')->count();
        $completed = Subscription::whereIn('restaurant_id', $restaurantIds)->where('status', 'completed')->count();
        $cancelled = Subscription::whereIn('restaurant_id', $restaurantIds)->where('status', 'cancelled')->count();

        return [
            'total' => $total,
            'active' => $active,
            'completed' => $completed,
            'cancelled' => $cancelled
        ];
    }

    private function getRestaurantsData($restaurantIds)
    {
        $total = Restaurant::whereIn('id', $restaurantIds)->count();
        $active = Restaurant::whereIn('id', $restaurantIds)->where('is_active', true)->count();

        return [
            'total' => $total,
            'active' => $active
        ];
    }

    private function getMealsData($restaurantIds)
    {
        $total = Meal::whereIn('restaurant_id', $restaurantIds)->count();
        $available = Meal::whereIn('restaurant_id', $restaurantIds)->where('is_available', true)->count();

        return [
            'total' => $total,
            'available' => $available
        ];
    }

    private function getRecentOrders($restaurantIds)
    {
        return Subscription::with(['user', 'restaurant'])
            ->whereIn('restaurant_id', $restaurantIds)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($subscription) {
                return [
                    'id' => $subscription->id,
                    'customer_name' => $subscription->user->name,
                    'restaurant_name' => $subscription->restaurant->name,
                    'subscription_type' => $subscription->subscription_type,
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                    'total_amount' => $subscription->total_amount,
                    'status' => $subscription->status,
                    'created_at' => $subscription->created_at
                ];
            });
    }

    private function getTopMeals($restaurantIds, $dateRanges)
    {
        return Subscription::with(['restaurant'])
            ->whereIn('restaurant_id', $restaurantIds)
            ->whereBetween('created_at', [$dateRanges['start'], $dateRanges['end']])
            ->select('subscription_type', 'restaurant_id', DB::raw('COUNT(*) as subscription_count'), DB::raw('SUM(total_amount) as total_revenue'))
            ->groupBy('subscription_type', 'restaurant_id')
            ->orderBy('subscription_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function($subscription) {
                return [
                    'id' => $subscription->subscription_type,
                    'name' => $subscription->subscription_type,
                    'restaurant_name' => $subscription->restaurant->name,
                    'subscription_count' => $subscription->subscription_count,
                    'total_revenue' => $subscription->total_revenue
                ];
            });
    }

    private function getEmptyReports()
    {
        return [
            'revenue' => [
                'total' => 0,
                'period' => 0,
                'today' => 0,
                'thisWeek' => 0,
                'thisMonth' => 0
            ],
            'orders' => [
                'total' => 0,
                'period' => 0,
                'today' => 0,
                'thisWeek' => 0,
                'thisMonth' => 0
            ],
            'subscriptions' => [
                'total' => 0,
                'active' => 0,
                'completed' => 0,
                'cancelled' => 0
            ],
            'restaurants' => [
                'total' => 0,
                'active' => 0
            ],
            'meals' => [
                'total' => 0,
                'available' => 0
            ]
        ];
    }
}
