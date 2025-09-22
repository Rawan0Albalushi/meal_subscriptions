<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Meal;
use App\Models\Subscription;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $period = $request->get('period', '30days');
            $restaurantId = $request->get('restaurant_id');
            $subscriptionType = $request->get('subscription_type');
            $subscriptionStatus = $request->get('subscription_status');
            $minPrice = $request->get('min_price');
            $maxPrice = $request->get('max_price');
            $customStartDate = $request->get('start_date');
            $customEndDate = $request->get('end_date');
            
            // Calculate date range based on period or custom dates
            if ($customStartDate && $customEndDate) {
                $startDate = Carbon::parse($customStartDate);
                $endDate = Carbon::parse($customEndDate);
            } else {
                $dateRange = $this->getDateRange($period);
                $startDate = $dateRange['start'];
                $endDate = $dateRange['end'];
            }

            // User statistics
            $userStats = [
                'totalUsers' => User::count(),
                'totalSellers' => User::where('role', 'seller')->count(),
                'totalCustomers' => User::where('role', 'customer')->count(),
                'totalAdmins' => User::where('role', 'admin')->count(),
                'activeUsers' => User::count(), // All users are considered active
                'newUsers' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                'newSellers' => User::where('role', 'seller')->whereBetween('created_at', [$startDate, $endDate])->count(),
                'newCustomers' => User::where('role', 'customer')->whereBetween('created_at', [$startDate, $endDate])->count(),
            ];

            // Restaurant statistics
            $restaurantStats = [
                'totalRestaurants' => Restaurant::count(),
                'activeRestaurants' => Restaurant::where('is_active', true)->count(),
                'totalMeals' => Meal::count(),
                'activeMeals' => Meal::where('is_available', true)->count(),
                'newRestaurants' => Restaurant::whereBetween('created_at', [$startDate, $endDate])->count(),
                'newMeals' => Meal::whereBetween('created_at', [$startDate, $endDate])->count(),
            ];

            // Subscription statistics
            $subscriptionStats = [
                'totalSubscriptions' => Subscription::count(),
                'activeSubscriptions' => Subscription::where('status', 'active')->count(),
                'pendingSubscriptions' => Subscription::where('status', 'pending')->count(),
                'completedSubscriptions' => Subscription::where('status', 'completed')->count(),
                'cancelledSubscriptions' => Subscription::where('status', 'cancelled')->count(),
                'newSubscriptions' => Subscription::whereBetween('created_at', [$startDate, $endDate])->count(),
            ];

            // Revenue statistics
            $revenueStats = [
                'totalRevenue' => Subscription::where('status', '!=', 'cancelled')->sum('total_amount'),
                'periodRevenue' => Subscription::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total_amount'),
                'monthlyRevenue' => Subscription::where('status', '!=', 'cancelled')
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->sum('total_amount'),
                'dailyRevenue' => Subscription::where('status', '!=', 'cancelled')
                    ->whereDate('created_at', Carbon::today())
                    ->sum('total_amount'),
            ];

            // Recent activity
            $recentActivity = $this->getRecentActivity($startDate, $endDate);

            // Recent subscriptions with detailed pricing
            $subscriptionsQuery = Subscription::with(['user', 'restaurant', 'subscriptionType'])
                ->whereBetween('created_at', [$startDate, $endDate]);
                
            // Apply filters
            if ($restaurantId) {
                $subscriptionsQuery->where('restaurant_id', $restaurantId);
            }
            
            if ($subscriptionType) {
                $subscriptionsQuery->whereHas('subscriptionType', function($query) use ($subscriptionType) {
                    $query->where('type', $subscriptionType);
                });
            }
            
            if ($subscriptionStatus) {
                $subscriptionsQuery->where('status', $subscriptionStatus);
            }
            
            if ($minPrice || $maxPrice) {
                $subscriptionsQuery->where(function($query) use ($minPrice, $maxPrice) {
                    if ($minPrice) {
                        $query->where('total_amount', '>=', $minPrice);
                    }
                    if ($maxPrice) {
                        $query->where('total_amount', '<=', $maxPrice);
                    }
                });
            }
            
            $recentSubscriptions = $subscriptionsQuery
                ->latest()
                ->take(100) // Increased limit for better filtering results
                ->get()
                ->map(function ($subscription) {
                    $subscriptionType = $subscription->subscriptionType;
                    $totalAmount = $subscription->total_amount ?? 0;
                    $deliveryPrice = $subscription->delivery_price ?? 0;
                    $subscriptionPrice = $totalAmount - $deliveryPrice;
                    $adminCommissionPercentage = $subscriptionType ? $subscriptionType->admin_commission : 0;
                    // النسبة تحسب من سعر الاشتراك بدون التوصيل
                    $adminCommissionAmount = $adminCommissionPercentage ? ($subscriptionPrice * $adminCommissionPercentage / 100) : 0;
                    $merchantAmount = $subscriptionPrice - $adminCommissionAmount;
                    
                    return [
                        'id' => $subscription->id,
                        'user' => $subscription->user,
                        'restaurant' => $subscription->restaurant,
                        'subscriptionType' => $subscriptionType,
                        'total_amount' => $totalAmount,
                        'subscription_price' => $subscriptionPrice,
                        'delivery_price' => $deliveryPrice,
                        'admin_commission_percentage' => $adminCommissionPercentage,
                        'admin_commission_amount' => $adminCommissionAmount,
                        'merchant_amount' => $merchantAmount,
                        'status' => $subscription->status,
                        'created_at' => $subscription->created_at
                    ];
                });

            // Top performing restaurants
            $topRestaurants = Restaurant::withCount(['subscriptions' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withSum(['subscriptions' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }], 'total_amount')
            ->orderBy('subscriptions_sum_total_amount', 'desc')
            ->take(10)
            ->get();
            
            // Get filter options
            $filterOptions = [
                'restaurants' => Restaurant::select('id', 'name_ar', 'name_en')->get(),
                'subscriptionTypes' => [
                    ['value' => 'weekly', 'label_ar' => 'أسبوعي', 'label_en' => 'Weekly'],
                    ['value' => 'monthly', 'label_ar' => 'شهري', 'label_en' => 'Monthly']
                ],
                'subscriptionStatuses' => [
                    ['value' => 'pending', 'label_ar' => 'في الانتظار', 'label_en' => 'Pending'],
                    ['value' => 'active', 'label_ar' => 'نشط', 'label_en' => 'Active'],
                    ['value' => 'completed', 'label_ar' => 'مكتمل', 'label_en' => 'Completed'],
                    ['value' => 'cancelled', 'label_ar' => 'ملغي', 'label_en' => 'Cancelled']
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'dateRange' => [
                        'start' => $startDate->format('Y-m-d'),
                        'end' => $endDate->format('Y-m-d')
                    ],
                    'userStats' => $userStats,
                    'restaurantStats' => $restaurantStats,
                    'subscriptionStats' => $subscriptionStats,
                    'revenueStats' => $revenueStats,
                    'recentActivity' => $recentActivity,
                    'recentSubscriptions' => $recentSubscriptions,
                    'topRestaurants' => $topRestaurants,
                    'filterOptions' => $filterOptions,
                    'appliedFilters' => [
                        'restaurant_id' => $restaurantId,
                        'subscription_type' => $subscriptionType,
                        'subscription_status' => $subscriptionStatus,
                        'min_price' => $minPrice,
                        'max_price' => $maxPrice,
                        'start_date' => $customStartDate,
                        'end_date' => $customEndDate
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب التقارير',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getDateRange($period)
    {
        $endDate = Carbon::now();
        
        switch ($period) {
            case '7days':
                $startDate = $endDate->copy()->subDays(7);
                break;
            case '30days':
                $startDate = $endDate->copy()->subDays(30);
                break;
            case '90days':
                $startDate = $endDate->copy()->subDays(90);
                break;
            case '1year':
                $startDate = $endDate->copy()->subYear();
                break;
            default:
                $startDate = $endDate->copy()->subDays(30);
        }

        return [
            'start' => $startDate,
            'end' => $endDate
        ];
    }

    private function getRecentActivity($startDate, $endDate)
    {
        $activities = collect();

        // Recent users
        $recentUsers = User::whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'type' => 'user_registration',
                    'description' => "مستخدم جديد: {$user->name}",
                    'created_at' => $user->created_at,
                    'icon' => '👤'
                ];
            });

        // Recent restaurants
        $recentRestaurants = Restaurant::whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($restaurant) {
                return [
                    'type' => 'restaurant_created',
                    'description' => "مطعم جديد: {$restaurant->name}",
                    'created_at' => $restaurant->created_at,
                    'icon' => '🍽️'
                ];
            });

        // Recent subscriptions
        $recentSubscriptions = Subscription::with(['user', 'restaurant'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($subscription) {
                return [
                    'type' => 'subscription_created',
                    'description' => "اشتراك جديد من {$subscription->user->name} في {$subscription->restaurant->name}",
                    'created_at' => $subscription->created_at,
                    'icon' => '📋'
                ];
            });

        // Combine and sort by date
        return $activities
            ->concat($recentUsers)
            ->concat($recentRestaurants)
            ->concat($recentSubscriptions)
            ->sortByDesc('created_at')
            ->take(20)
            ->values();
    }

    public function export(Request $request)
    {
        try {
            $period = $request->get('period', '30days');
            $type = $request->get('type', 'all'); // all, users, restaurants, subscriptions, revenue

            $dateRange = $this->getDateRange($period);
            $startDate = $dateRange['start'];
            $endDate = $dateRange['end'];

            $data = [];

            switch ($type) {
                case 'users':
                    $data = User::whereBetween('created_at', [$startDate, $endDate])
                        ->select('name', 'email', 'role', 'is_active', 'created_at')
                        ->get();
                    break;
                
                case 'restaurants':
                    $data = Restaurant::with('seller')
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->select('name', 'email', 'phone', 'is_active', 'created_at')
                        ->get();
                    break;
                
                case 'subscriptions':
                    $data = Subscription::with(['user', 'restaurant', 'subscriptionType'])
                        ->whereBetween('created_at', [$startDate, $endDate])
                        ->get()
                        ->map(function ($subscription) {
                            $subscriptionType = $subscription->subscriptionType;
                            $totalAmount = $subscription->total_amount ?? 0;
                            $deliveryPrice = $subscription->delivery_price ?? 0;
                            $subscriptionPrice = $totalAmount - $deliveryPrice;
                            $adminCommissionPercentage = $subscriptionType ? $subscriptionType->admin_commission : 0;
                            // النسبة تحسب من سعر الاشتراك بدون التوصيل
                            $adminCommissionAmount = $adminCommissionPercentage ? ($subscriptionPrice * $adminCommissionPercentage / 100) : 0;
                            $merchantAmount = $subscriptionPrice - $adminCommissionAmount;
                            
                            return [
                                'id' => $subscription->id,
                                'user_name' => $subscription->user->name ?? 'غير محدد',
                                'restaurant_name' => $subscription->restaurant->name_ar ?? 'غير محدد',
                                'subscription_type' => $subscriptionType ? $subscriptionType->name_ar : 'غير محدد',
                                'total_amount' => $totalAmount,
                                'subscription_price' => $subscriptionPrice,
                                'delivery_price' => $deliveryPrice,
                                'admin_commission_percentage' => $adminCommissionPercentage,
                                'admin_commission_amount' => $adminCommissionAmount,
                                'merchant_amount' => $merchantAmount,
                                'status' => $subscription->status,
                                'created_at' => $subscription->created_at->format('Y-m-d H:i:s')
                            ];
                        });
                    break;
                
                default:
                    // Return summary data
                    $data = [
                        'period' => $period,
                        'dateRange' => [
                            'start' => $startDate->format('Y-m-d'),
                            'end' => $endDate->format('Y-m-d')
                        ],
                        'summary' => [
                            'users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                            'restaurants' => Restaurant::whereBetween('created_at', [$startDate, $endDate])->count(),
                            'subscriptions' => Subscription::whereBetween('created_at', [$startDate, $endDate])->count(),
                            'revenue' => Subscription::where('status', '!=', 'cancelled')
                                ->whereBetween('created_at', [$startDate, $endDate])
                                ->sum('total_amount'),
                        ]
                    ];
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'exported_at' => Carbon::now()->format('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تصدير البيانات',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
