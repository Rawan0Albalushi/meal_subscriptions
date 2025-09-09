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
                'today_date' => $today->format('Y-m-d'),
                'timezone' => config('app.timezone'),
                'carbon_timezone' => $today->timezone->getName()
            ]);
            
            $query = SubscriptionItem::with([
                'subscription.user',
                'subscription.restaurant',
                'subscription.deliveryAddress',
                'meal'
            ])->whereDate('delivery_date', $today)
              ->whereNotNull('delivery_date');

            // Filter by restaurant
            if ($request->has('restaurant_id') && $request->restaurant_id && $request->restaurant_id !== 'all') {
                $query->whereHas('subscription', function ($q) use ($request) {
                    $q->where('restaurant_id', $request->restaurant_id);
                });
            }

            // Filter by date (default to today)
            if ($request->has('date') && $request->date) {
                $query->whereDate('delivery_date', $request->date);
            } else {
                // Ensure we only get today's orders
                $query->whereDate('delivery_date', $today);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            // Log if no orders for today (but don't show recent orders)
            if ($orders->isEmpty()) {
                \Log::info('No orders for today', [
                    'today_date' => $today->format('Y-m-d'),
                    'restaurant_id' => $request->restaurant_id
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

    public function export(Request $request)
    {
        try {
            $today = Carbon::today();
            
            $query = SubscriptionItem::with([
                'subscription.user',
                'subscription.restaurant',
                'subscription.deliveryAddress',
                'meal'
            ])->whereDate('delivery_date', $today)
              ->whereNotNull('delivery_date');

            // Filter by restaurant
            if ($request->has('restaurant_id') && $request->restaurant_id && $request->restaurant_id !== 'all') {
                $query->whereHas('subscription', function ($q) use ($request) {
                    $q->where('restaurant_id', $request->restaurant_id);
                });
            }

            // Filter by date (default to today)
            if ($request->has('date') && $request->date) {
                $query->whereDate('delivery_date', $request->date);
            } else {
                // Ensure we only get today's orders
                $query->whereDate('delivery_date', $today);
            }

            // Filter by status
            if ($request->has('status') && $request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            // Log if no orders for today (but don't show recent orders)
            if ($orders->isEmpty()) {
                \Log::info('No orders for today in export', [
                    'today_date' => $today->format('Y-m-d'),
                    'restaurant_id' => $request->restaurant_id,
                    'status' => $request->status
                ]);
            }

            // Prepare data for Excel export
            $excelData = [];
            $excelData[] = [
                'Order ID',
                'Customer Name',
                'Customer Phone',
                'Customer Email',
                'Restaurant (Arabic)',
                'Restaurant (English)',
                'Meal (Arabic)',
                'Meal (English)',
                'Meal Type (Arabic)',
                'Meal Type (English)',
                'Delivery Time',
                'Status',
                'Delivery Address',
                'Created At',
                'Updated At'
            ];

            foreach ($orders as $order) {
                $excelData[] = [
                    $order->id,
                    $order->subscription->user->full_name ?? $order->subscription->user->name ?? 'N/A',
                    $order->subscription->user->phone ?? 'N/A',
                    $order->subscription->user->email ?? 'N/A',
                    // Ensure Arabic text is properly encoded
                    mb_convert_encoding($order->subscription->restaurant->name_ar ?? 'N/A', 'UTF-8', 'auto'),
                    $order->subscription->restaurant->name_en ?? 'N/A',
                    mb_convert_encoding($order->meal->name_ar ?? 'N/A', 'UTF-8', 'auto'),
                    $order->meal->name_en ?? 'N/A',
                    mb_convert_encoding($order->meal->type_ar ?? 'N/A', 'UTF-8', 'auto'),
                    $order->meal->type_en ?? 'N/A',
                    $order->meal->delivery_time ?? 'N/A',
                    $order->status,
                    mb_convert_encoding($order->subscription->deliveryAddress->address ?? 'N/A', 'UTF-8', 'auto'),
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->updated_at->format('Y-m-d H:i:s')
                ];
            }

            // Create simple HTML table that Excel can open with proper Arabic support
            $html = '<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Today Orders Export</title>
    <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>طلبات اليوم - ' . $today->format('Y-m-d') . '</h1>
    <table>
        <thead>
            <tr>';

            // Add headers
            foreach ($excelData[0] as $header) {
                $html .= '<th>' . htmlspecialchars($header, ENT_QUOTES, 'UTF-8') . '</th>';
            }
            
            $html .= '</tr>
        </thead>
        <tbody>';

            // Add data rows
            for ($i = 1; $i < count($excelData); $i++) {
                $html .= '<tr>';
                foreach ($excelData[$i] as $cell) {
                    $html .= '<td>' . htmlspecialchars($cell, ENT_QUOTES, 'UTF-8') . '</td>';
                }
                $html .= '</tr>';
            }

            $html .= '</tbody>
    </table>
</body>
</html>';

            // Set headers for HTML download (Excel can open HTML files)
            $fileName = 'today_orders_' . $today->format('Y-m-d') . '.html';
            
            return response($html)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            \Log::error('Error exporting today orders', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error exporting orders: ' . $e->getMessage()
            ], 500);
        }
    }
}
