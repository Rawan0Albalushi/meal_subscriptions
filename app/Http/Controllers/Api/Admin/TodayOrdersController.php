<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionItem;
use App\Models\Restaurant;
use Carbon\Carbon;

class TodayOrdersController extends Controller
{
    public function index(Request $request)
    {
        try {
            $today = Carbon::today();
            
            // First, let's check if there are any subscription items at all
            $totalItems = SubscriptionItem::count();
            $todayItems = SubscriptionItem::whereDate('delivery_date', $today)->count();
            
            \Log::info('Subscription Items Debug', [
                'total_items' => $totalItems,
                'today_items' => $todayItems,
                'today_date' => $today->format('Y-m-d')
            ]);
            
            $query = SubscriptionItem::with([
                'subscription.user',
                'subscription.restaurant',
                'subscription.deliveryAddress',
                'meal'
            ])->whereDate('delivery_date', $today);

            // Filter by restaurant
            if ($request->has('restaurant_id') && $request->restaurant_id && $request->restaurant_id !== 'all') {
                $query->whereHas('subscription', function ($q) use ($request) {
                    $q->where('restaurant_id', $request->restaurant_id);
                });
            }

            // Filter by date (default to today)
            if ($request->has('date') && $request->date) {
                $query->whereDate('delivery_date', $request->date);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            // If no orders for today, show recent orders (last 7 days)
            if ($orders->isEmpty()) {
                $recentQuery = SubscriptionItem::with([
                    'subscription.user',
                    'subscription.restaurant',
                    'subscription.deliveryAddress',
                    'meal'
                ])->whereDate('delivery_date', '>=', $today->subDays(7))
                  ->whereDate('delivery_date', '<=', $today);

                // Filter by restaurant for recent orders too
                if ($request->has('restaurant_id') && $request->restaurant_id && $request->restaurant_id !== 'all') {
                    $recentQuery->whereHas('subscription', function ($q) use ($request) {
                        $q->where('restaurant_id', $request->restaurant_id);
                    });
                }

                $orders = $recentQuery->orderBy('delivery_date', 'desc')->orderBy('created_at', 'desc')->get();
                
                \Log::info('No orders for today, showing recent orders', [
                    'recent_orders_count' => $orders->count()
                ]);
            }

            // Group orders by status
            $groupedOrders = $orders->groupBy('status');
            
            // Calculate statistics
            $stats = [
                'total' => $orders->count(),
                'pending' => $orders->where('status', 'pending')->count(),
                'preparing' => $orders->where('status', 'preparing')->count(),
                'delivered' => $orders->where('status', 'delivered')->count(),
                'cancelled' => $orders->where('status', 'cancelled')->count(),
            ];

            // Format date
            $dateFormatted = $today->format('Y-m-d');

            // Debug logging
            \Log::info('Today Orders API called', [
                'date' => $today->format('Y-m-d'),
                'restaurant_id' => $request->restaurant_id,
                'orders_count' => $orders->count(),
                'stats' => $stats
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'orders' => $orders,
                    'grouped_orders' => $groupedOrders,
                    'stats' => $stats,
                    'date_formatted' => $dateFormatted
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching today orders', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching today orders: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $order = SubscriptionItem::findOrFail($id);
            
            $request->validate([
                'status' => 'required|in:pending,preparing,delivered,cancelled'
            ]);

            $order->status = $request->status;
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating order status: ' . $e->getMessage()
            ], 500);
        }
    }
}
