<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Restaurant;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Subscription::with([
                'user:id,name,email', 
                'restaurant', 
                'subscriptionType', 
                'subscriptionItems.meal',
                'deliveryAddress'
            ]);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('restaurant', function ($restaurantQuery) use ($search) {
                          $restaurantQuery->where('name_ar', 'like', "%{$search}%")
                                         ->orWhere('name_en', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by restaurant
            if ($request->has('restaurant_id') && $request->restaurant_id) {
                $query->where('restaurant_id', $request->restaurant_id);
            }

            // Filter by user
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $subscriptions = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $subscriptions->items(),
                'pagination' => [
                    'current_page' => $subscriptions->currentPage(),
                    'last_page' => $subscriptions->lastPage(),
                    'per_page' => $subscriptions->perPage(),
                    'total' => $subscriptions->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الاشتراكات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $subscription = Subscription::with([
                'user:id,name,email', 
                'restaurant', 
                'subscriptionType', 
                'items.meal',
                'deliveryAddress'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $subscription
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'الاشتراك غير موجود',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $subscription = Subscription::findOrFail($id);

            $request->validate([
                'status' => 'required|in:pending,active,completed,cancelled',
                'notes' => 'nullable|string|max:1000'
            ]);

            $subscription->update([
                'status' => $request->status,
                'notes' => $request->notes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الاشتراك بنجاح',
                'data' => $subscription->load(['user:id,name,email', 'restaurant', 'subscriptionType', 'items.meal', 'deliveryAddress'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث الاشتراك',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $subscription = Subscription::findOrFail($id);

            // Only allow deletion of pending or cancelled subscriptions
            if (!in_array($subscription->status, ['pending', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف الاشتراكات النشطة أو المكتملة'
                ], 400);
            }

            $subscription->delete(); // This will now use soft delete

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الاشتراك بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف الاشتراك',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateItemStatus(Request $request, $subscriptionId, $itemId)
    {
        try {
            \Log::info('Admin updateItemStatus called', [
                'subscription_id' => $subscriptionId,
                'item_id' => $itemId,
                'request_data' => $request->all(),
                'user_id' => auth()->id()
            ]);

            $subscription = Subscription::findOrFail($subscriptionId);
            \Log::info('Subscription found', ['subscription' => $subscription->toArray()]);
            
            $item = $subscription->subscriptionItems()->findOrFail($itemId);
            \Log::info('Subscription item found', ['item' => $item->toArray()]);

            $request->validate([
                'status' => 'required|in:pending,preparing,delivered,cancelled'
            ]);

            $item->update(['status' => $request->status]);
            \Log::info('Item status updated successfully', ['new_status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الوجبة بنجاح',
                'data' => $item->fresh()
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in updateItemStatus', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in updateItemStatus', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'subscription_id' => $subscriptionId,
                'item_id' => $itemId,
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث حالة الوجبة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            $stats = [
                'totalSubscriptions' => Subscription::count(),
                'activeSubscriptions' => Subscription::where('status', 'active')->count(),
                'pendingSubscriptions' => Subscription::where('status', 'pending')->count(),
                'completedSubscriptions' => Subscription::where('status', 'completed')->count(),
                'cancelledSubscriptions' => Subscription::where('status', 'cancelled')->count(),
                'todaySubscriptions' => Subscription::whereDate('created_at', Carbon::today())->count(),
                'monthlySubscriptions' => Subscription::whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)->count(),
                'totalRevenue' => Subscription::where('status', '!=', 'cancelled')->sum('total_amount'),
                'monthlyRevenue' => Subscription::where('status', '!=', 'cancelled')
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->sum('total_amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الإحصائيات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRestaurants()
    {
        try {
            $restaurants = Restaurant::select('id', 'name_ar', 'name_en')->get();

            return response()->json([
                'success' => true,
                'data' => $restaurants
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب المطاعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsers()
    {
        try {
            $users = User::where('role', 'customer')->select('id', 'name', 'email')->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب العملاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatusOptions()
    {
        try {
            $statusOptions = [
                ['value' => 'pending', 'label_ar' => 'في الانتظار', 'label_en' => 'Pending'],
                ['value' => 'active', 'label_ar' => 'نشط', 'label_en' => 'Active'],
                ['value' => 'completed', 'label_ar' => 'مكتمل', 'label_en' => 'Completed'],
                ['value' => 'cancelled', 'label_ar' => 'ملغي', 'label_en' => 'Cancelled'],
            ];

            return response()->json([
                'success' => true,
                'data' => $statusOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب خيارات الحالة',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
