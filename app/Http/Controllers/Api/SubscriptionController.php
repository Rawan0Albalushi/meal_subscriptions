<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\SubscriptionType;
use App\Models\Meal;
use App\Models\Restaurant;
use App\Models\DeliveryAddress;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }
    public function index(Request $request)
    {
        $subscriptions = Subscription::where('user_id', auth()->id())
            ->with(['restaurant', 'deliveryAddress', 'subscriptionItems.meal'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    public function show($id)
    {
        $subscription = Subscription::where('user_id', auth()->id())
            ->with(['restaurant', 'deliveryAddress', 'subscriptionItems.meal'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subscription
        ]);
    }

    public function initiatePayment(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'meal_ids' => 'required|array|min:1',
            'meal_ids.*' => 'exists:meals,id',
            'delivery_address_id' => 'required|exists:delivery_addresses,id',
            'subscription_type' => 'required|in:weekly,monthly',
            'delivery_days' => 'required|array|min:1',
            'delivery_days.*' => 'in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'start_date' => 'required|date|after_or_equal:tomorrow',
            'special_instructions' => 'nullable|string|max:500',
        ], [
            'restaurant_id.required' => 'معرف المطعم مطلوب',
            'meal_ids.required' => 'معرف الوجبة مطلوب',
            'meal_ids.min' => 'يجب اختيار وجبة واحدة على الأقل',
            'delivery_address_id.required' => 'معرف عنوان التوصيل مطلوب',
            'subscription_type.required' => 'نوع الاشتراك مطلوب',
            'delivery_days.required' => 'أيام التوصيل مطلوبة',
            'delivery_days.min' => 'يجب اختيار يوم واحد على الأقل',
            'start_date.required' => 'تاريخ البداية مطلوب',
            'start_date.after_or_equal' => 'تاريخ البداية يجب أن يكون غداً أو بعده',
        ]);

        try {
            DB::beginTransaction();

            // Get subscription type and calculate total amount
            $subscriptionType = SubscriptionType::where('type', $request->subscription_type)
                ->where('is_active', true)
                ->whereHas('restaurants', function($q) use ($request) {
                    $q->where('restaurants.id', $request->restaurant_id);
                })
                ->first();

            if (!$subscriptionType) {
                return response()->json([
                    'success' => false,
                    'message' => 'نوع الاشتراك غير موجود لهذا المطعم'
                ], 404);
            }

            // Validate meal count
            if (count($request->delivery_days) !== $subscriptionType->meals_count) {
                return response()->json([
                    'success' => false,
                    'message' => "يجب اختيار {$subscriptionType->meals_count} وجبة لاشتراك {$subscriptionType->name_ar}"
                ], 422);
            }

            // Create subscription with pending status
            $subscription = Subscription::create([
                'user_id' => auth()->id(),
                'restaurant_id' => $request->restaurant_id,
                'delivery_address_id' => $request->delivery_address_id,
                'subscription_type_id' => $subscriptionType->id,
                'subscription_type' => $request->subscription_type,
                'start_date' => $request->start_date,
                'end_date' => $this->calculateEndDate($request->start_date, $request->subscription_type),
                'total_amount' => $subscriptionType->price + $subscriptionType->delivery_price,
                'delivery_price' => $subscriptionType->delivery_price,
                'status' => 'pending',
                'payment_status' => 'pending',
                'special_instructions' => $request->special_instructions,
            ]);

            // Create payment link
            $subscriptionData = [
                'meal_ids' => $request->meal_ids,
                'delivery_days' => $request->delivery_days,
                'start_date' => $request->start_date
            ];
            
            Log::info('Creating payment link with subscription data', [
                'subscription_id' => $subscription->id,
                'subscription_data' => $subscriptionData
            ]);
            
            $paymentResponse = $this->paymentService->createPaymentLink([
                'user_id' => auth()->id(),
                'model_type' => Subscription::class,
                'model_id' => $subscription->id,
                'amount' => $subscription->total_amount,
                'currency' => 'OMR',
                'description' => "اشتراك {$subscriptionType->name_ar} - {$subscription->restaurant->name_ar}",
                'subscription_data' => $subscriptionData
            ]);

            DB::commit();

            Log::info('Payment initiation successful', [
                'subscription_id' => $subscription->id,
                'payment_link' => $paymentResponse->paymentLink,
                'session_id' => $paymentResponse->sessionId,
                'gateway' => $this->paymentService->getActiveGateway()
            ]);

            return response()->json([
                'success' => true,
                'payment_link' => $paymentResponse->paymentLink,
                'session_id' => $paymentResponse->sessionId,
                'subscription_id' => $subscription->id,
                'amount' => $subscription->total_amount,
                'currency' => 'OMR',
                'gateway' => $this->paymentService->getActiveGateway()
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Payment initiation failed: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'فشل في إنشاء رابط الدفع: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkoutFromCart(Request $request)
    {
        $request->validate([
            'delivery_address_id' => 'nullable|exists:delivery_addresses,id',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Get user's cart
            $cart = Cart::where('user_id', auth()->id())
                ->with([
                    'restaurant',
                    'subscriptionType',
                    'cartItems.meal',
                    'deliveryAddress'
                ])
                ->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            if ($cart->cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart has no items'
                ], 400);
            }

            // Update cart with any provided data
            if ($request->has('delivery_address_id')) {
                $cart->delivery_address_id = $request->delivery_address_id;
            }
            if ($request->has('special_instructions')) {
                $cart->special_instructions = $request->special_instructions;
            }

            // Validate delivery address
            if (!$cart->delivery_address_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Delivery address is required'
                ], 400);
            }

            // Calculate subscription dates based on subscription type
            $subscriptionType = $cart->subscriptionType;
            $startDate = $cart->start_date ?: Carbon::tomorrow();
            $endDate = $this->calculateEndDate($startDate, $subscriptionType->type);

            // Calculate delivery price (you can implement your own logic here)
            $deliveryPrice = $this->calculateDeliveryPrice($cart);
            $cart->delivery_price = $deliveryPrice;
            $cart->save();

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => auth()->id(),
                'restaurant_id' => $cart->restaurant_id,
                'delivery_address_id' => $cart->delivery_address_id,
                'subscription_type_id' => $cart->subscription_type_id,
                'subscription_type' => $subscriptionType->type,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_amount' => $cart->total_amount,
                'delivery_price' => $cart->delivery_price,
                'status' => 'pending',
                'payment_status' => 'pending',
                'special_instructions' => $cart->special_instructions,
            ]);

            // Create subscription items from cart items
            foreach ($cart->cartItems as $cartItem) {
                SubscriptionItem::create([
                    'subscription_id' => $subscription->id,
                    'meal_id' => $cartItem->meal_id,
                    'delivery_date' => $cartItem->delivery_date,
                    'meal_type' => $cartItem->meal_type,
                    'price' => $cartItem->price,
                    'status' => 'pending'
                ]);
            }

            // Create payment link
            $paymentResponse = $this->paymentService->createPaymentLink([
                'user_id' => auth()->id(),
                'model_type' => Subscription::class,
                'model_id' => $subscription->id,
                'amount' => $subscription->total_amount + $subscription->delivery_price,
                'currency' => 'OMR',
                'description' => "اشتراك {$subscriptionType->name_ar} - {$cart->restaurant->name_ar}",
                'subscription_data' => []
            ]);

            // Clear the cart after successful checkout initiation
            $cart->cartItems()->delete();
            $cart->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'payment_link' => $paymentResponse->paymentLink,
                'session_id' => $paymentResponse->sessionId,
                'subscription_id' => $subscription->id,
                'amount' => $subscription->total_amount + $subscription->delivery_price,
                'currency' => 'OMR',
                'gateway' => $this->paymentService->getActiveGateway()
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Cart checkout failed: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'فشل في إنشاء رابط الدفع: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateDeliveryPrice(Cart $cart)
    {
        // Implement your delivery price calculation logic here
        // This is a simple example - you can make it more sophisticated
        return $cart->subscriptionType->delivery_price ?? 2.00;
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'meal_ids' => 'required|array|min:1',
            'meal_ids.*' => 'exists:meals,id',
            'delivery_address_id' => 'required|exists:delivery_addresses,id',
            'subscription_type' => 'required|in:weekly,monthly',
            'delivery_days' => 'required|array|min:1',
            'delivery_days.*' => 'in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'start_date' => 'required|date|after_or_equal:tomorrow',
            'special_instructions' => 'nullable|string|max:500',

        ], [
            'restaurant_id.required' => 'معرف المطعم مطلوب',
            'meal_ids.required' => 'معرف الوجبة مطلوب',
            'meal_ids.min' => 'يجب اختيار وجبة واحدة على الأقل',
            'delivery_address_id.required' => 'معرف عنوان التوصيل مطلوب',
            'subscription_type.required' => 'نوع الاشتراك مطلوب',
            'delivery_days.required' => 'أيام التوصيل مطلوبة',
            'delivery_days.min' => 'يجب اختيار يوم واحد على الأقل',
            'start_date.required' => 'تاريخ البداية مطلوب',
            'start_date.after_or_equal' => 'تاريخ البداية يجب أن يكون غداً أو بعده',

        ]);

        try {
            DB::beginTransaction();

            // Get subscription type and calculate total amount
            $subscriptionType = SubscriptionType::where('type', $request->subscription_type)
                ->where('is_active', true)
                ->whereHas('restaurants', function($q) use ($request) {
                    $q->where('restaurants.id', $request->restaurant_id);
                })
                ->first();

            if (!$subscriptionType) {
                return response()->json([
                    'success' => false,
                    'message' => 'نوع الاشتراك غير موجود لهذا المطعم'
                ], 404);
            }

            // Validate that the number of delivery days matches the subscription type meals_count
            if (count($request->delivery_days) !== $subscriptionType->meals_count) {
                return response()->json([
                    'success' => false,
                    'message' => "يجب اختيار {$subscriptionType->meals_count} وجبة لاشتراك {$subscriptionType->name_ar}"
                ], 422);
            }

            // Use delivery price from subscription type (can be free or paid)
            $deliveryPrice = $subscriptionType->delivery_price;

            // Calculate total amount including delivery price
            $totalAmount = $subscriptionType->price + $deliveryPrice;

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => auth()->id(),
                'restaurant_id' => $request->restaurant_id,
                'delivery_address_id' => $request->delivery_address_id,
                'subscription_type_id' => $subscriptionType->id,
                'subscription_type' => $request->subscription_type,
                'start_date' => $request->start_date,
                'end_date' => $this->calculateEndDate($request->start_date, $request->subscription_type),
                'total_amount' => $totalAmount,
                'delivery_price' => $deliveryPrice,
                'status' => 'pending',
                'payment_status' => 'pending',
                'special_instructions' => $request->special_instructions,
            ]);

            // Create subscription items for each delivery day with selected meals
            $startDate = Carbon::parse($request->start_date);
            
            // Build items with computed delivery dates, then sort ascending by date
            $items = [];
            foreach ($request->delivery_days as $index => $dayOfWeek) {
                $deliveryDate = $this->calculateDeliveryDate($startDate, $dayOfWeek);
                $mealId = $request->meal_ids[$index] ?? null;
                if ($mealId) {
                    $items[] = [
                        'meal_id' => $mealId,
                        'day_of_week' => $dayOfWeek,
                        'delivery_date' => $deliveryDate,
                    ];
                }
            }

            usort($items, function ($a, $b) {
                return Carbon::parse($a['delivery_date'])->timestamp <=> Carbon::parse($b['delivery_date'])->timestamp;
            });

            foreach ($items as $item) {
                SubscriptionItem::create([
                    'subscription_id' => $subscription->id,
                    'meal_id' => $item['meal_id'],
                    'delivery_date' => $item['delivery_date'],
                    'day_of_week' => $item['day_of_week'],
                    'price' => 0,
                    'status' => 'pending',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الاشتراك بنجاح',
                'data' => $subscription->load(['restaurant', 'deliveryAddress', 'subscriptionItems.meal'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            // Log the error for debugging
            \Log::error('Subscription creation failed: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'فشل في إنشاء الاشتراك: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $subscription = Subscription::where('user_id', auth()->id())->findOrFail($id);

        if ($subscription->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update subscription that is not pending'
            ], 400);
        }

        $request->validate([
            'status' => 'required|in:cancelled'
        ]);

        $subscription->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription updated successfully',
            'data' => $subscription->load(['restaurant', 'deliveryAddress', 'subscriptionItems.meal'])
        ]);
    }

    public function updateItemStatus(Request $request, $subscriptionId, $itemId)
    {
        // Check if user is admin or seller
        if (!auth()->user()->hasRole(['admin', 'seller'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,preparing,delivered,cancelled'
        ]);

        $subscriptionItem = SubscriptionItem::whereHas('subscription', function($query) use ($subscriptionId) {
            $query->where('id', $subscriptionId);
        })->findOrFail($itemId);

        $subscriptionItem->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item status updated successfully',
            'data' => $subscriptionItem->load(['meal', 'subscription'])
        ]);
    }

    private function calculateEndDate($startDate, $subscriptionType)
    {
        $start = Carbon::parse($startDate);
        
        if ($subscriptionType === 'weekly') {
            return $start->copy()->addWeek()->subDay();
        } else {
            return $start->copy()->addMonth()->subDay();
        }
    }

    private function calculateDeliveryDate($startDate, $dayOfWeek)
    {
        $dayIndex = ['sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3, 'thursday' => 4, 'friday' => 5, 'saturday' => 6];
        $startDayIndex = $startDate->dayOfWeek;
        $targetDayIndex = $dayIndex[$dayOfWeek];
        
        $daysToAdd = $targetDayIndex - $startDayIndex;
        if ($daysToAdd < 0) {
            $daysToAdd += 7;
        }
        
        return $startDate->copy()->addDays($daysToAdd);
    }

    // Seller subscription management methods
    public function getSellerSubscriptions(Request $request, $restaurantId)
    {
        // Check if the restaurant belongs to the seller
        $restaurant = auth()->user()->restaurants()->findOrFail($restaurantId);
        
        $subscriptions = Subscription::where('restaurant_id', $restaurantId)
            ->with(['user', 'deliveryAddress', 'subscriptionItems.meal'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    public function getSellerSubscription(Request $request, $restaurantId, $subscriptionId)
    {
        // Check if the restaurant belongs to the seller
        $restaurant = auth()->user()->restaurants()->findOrFail($restaurantId);
        
        $subscription = Subscription::where('restaurant_id', $restaurantId)
            ->where('id', $subscriptionId)
            ->with(['user', 'deliveryAddress', 'subscriptionItems.meal'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $subscription
        ]);
    }

    public function updateSellerSubscriptionStatus(Request $request, $restaurantId, $subscriptionId)
    {
        // Check if the restaurant belongs to the seller
        $restaurant = auth()->user()->restaurants()->findOrFail($restaurantId);
        
        $request->validate([
            'status' => 'required|in:pending,active,completed,cancelled'
        ]);

        $subscription = Subscription::where('restaurant_id', $restaurantId)
            ->where('id', $subscriptionId)
            ->firstOrFail();

        $subscription->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الاشتراك بنجاح',
            'data' => $subscription->load(['user', 'deliveryAddress', 'subscriptionItems.meal'])
        ]);
    }

    public function updateSellerItemStatus(Request $request, $restaurantId, $subscriptionId, $itemId)
    {
        // Check if the restaurant belongs to the seller
        $restaurant = auth()->user()->restaurants()->findOrFail($restaurantId);
        
        $request->validate([
            'status' => 'required|in:pending,preparing,delivered,cancelled'
        ]);

        $subscriptionItem = SubscriptionItem::whereHas('subscription', function($query) use ($restaurantId, $subscriptionId) {
            $query->where('restaurant_id', $restaurantId)
                  ->where('id', $subscriptionId);
        })->findOrFail($itemId);

        $subscriptionItem->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الوجبة بنجاح',
            'data' => $subscriptionItem->load(['meal', 'subscription'])
        ]);
    }

    public function getTodayOrders(Request $request, $restaurantId)
    {
        try {
            Log::info('TodayOrders: بدء جلب طلبات اليوم', [
                'restaurant_id' => $restaurantId,
                'user_id' => auth()->id(),
                'user_role' => auth()->user()->role ?? 'غير محدد'
            ]);

            // Check if the restaurant belongs to the seller
            $restaurant = auth()->user()->restaurants()->findOrFail($restaurantId);
            
            Log::info('TodayOrders: تم العثور على المطعم', [
                'restaurant_id' => $restaurant->id,
                'restaurant_name' => $restaurant->name_ar
            ]);
            
            $today = Carbon::today();
            
            Log::info('TodayOrders: التاريخ المستخدم', [
                'today_date' => $today->format('Y-m-d'),
                'today_timestamp' => $today->timestamp,
                'timezone' => config('app.timezone'),
                'carbon_timezone' => $today->timezone->getName()
            ]);
            
            // Get all subscription items for today for this restaurant
            $todayOrders = SubscriptionItem::whereHas('subscription', function($query) use ($restaurantId) {
                $query->where('restaurant_id', $restaurantId);
            })
            ->whereDate('delivery_date', $today)
            ->whereNotNull('delivery_date')
            ->with(['meal', 'subscription.user', 'subscription.deliveryAddress'])
            ->orderBy('delivery_date', 'asc')
            ->get();

            Log::info('TodayOrders: تم جلب الطلبات', [
                'total_orders' => $todayOrders->count(),
                'orders_details' => $todayOrders->map(function($order) {
                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'delivery_date' => $order->delivery_date,
                        'meal_name' => $order->meal?->name_ar,
                        'user_name' => $order->subscription?->user?->name
                    ];
                })
            ]);

            // Group orders by status for better organization
            $groupedOrders = [
                'pending' => $todayOrders->where('status', 'pending'),
                'preparing' => $todayOrders->where('status', 'preparing'),
                'delivered' => $todayOrders->where('status', 'delivered'),
                'cancelled' => $todayOrders->where('status', 'cancelled'),
            ];

            // Calculate statistics
            $stats = [
                'total' => $todayOrders->count(),
                'pending' => $todayOrders->where('status', 'pending')->count(),
                'preparing' => $todayOrders->where('status', 'preparing')->count(),
                'delivered' => $todayOrders->where('status', 'delivered')->count(),
                'cancelled' => $todayOrders->where('status', 'cancelled')->count(),
            ];

            Log::info('TodayOrders: الإحصائيات', $stats);

            $response = [
                'success' => true,
                'data' => [
                    'orders' => $todayOrders,
                    'grouped_orders' => $groupedOrders,
                    'stats' => $stats,
                    'date' => $today->format('Y-m-d'),
                    'date_formatted' => $today->format('l, F j, Y') // e.g., "Monday, January 15, 2024"
                ]
            ];

            Log::info('TodayOrders: إرسال الاستجابة', [
                'response_success' => $response['success'],
                'orders_count' => count($response['data']['orders'])
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('TodayOrders: خطأ في جلب طلبات اليوم', [
                'restaurant_id' => $restaurantId,
                'error' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب طلبات اليوم',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
