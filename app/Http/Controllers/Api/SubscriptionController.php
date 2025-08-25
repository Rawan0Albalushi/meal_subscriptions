<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\Meal;
use App\Models\Restaurant;
use App\Models\DeliveryAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
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

    public function store(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'meal_id' => 'required|exists:meals,id',
            'delivery_address_id' => 'required|exists:delivery_addresses,id',
            'subscription_type' => 'required|in:weekly,monthly',
            'delivery_days' => 'required|array|min:1',
            'delivery_days.*' => 'in:sunday,monday,tuesday,wednesday,thursday,friday,saturday',
            'start_date' => 'required|date|after:today',
            'special_instructions' => 'nullable|string|max:500',
            'payment_method' => 'required|in:credit_card,cash,bank_transfer',
            'total_amount' => 'required|numeric|min:0',
        ], [
            'restaurant_id.required' => 'معرف المطعم مطلوب',
            'meal_id.required' => 'معرف الوجبة مطلوب',
            'delivery_address_id.required' => 'معرف عنوان التوصيل مطلوب',
            'subscription_type.required' => 'نوع الاشتراك مطلوب',
            'delivery_days.required' => 'أيام التوصيل مطلوبة',
            'delivery_days.min' => 'يجب اختيار يوم واحد على الأقل',
            'start_date.required' => 'تاريخ البداية مطلوب',
            'start_date.after' => 'تاريخ البداية يجب أن يكون بعد اليوم',
            'payment_method.required' => 'طريقة الدفع مطلوبة',
            'total_amount.required' => 'المبلغ الإجمالي مطلوب',
        ]);

        try {
            DB::beginTransaction();

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => auth()->id(),
                'restaurant_id' => $request->restaurant_id,
                'delivery_address_id' => $request->delivery_address_id,
                'subscription_type' => $request->subscription_type,
                'start_date' => $request->start_date,
                'end_date' => $this->calculateEndDate($request->start_date, $request->subscription_type),
                'total_amount' => $request->total_amount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'special_instructions' => $request->special_instructions,
            ]);

            // Create subscription items for each delivery day
            $meal = Meal::find($request->meal_id);
            $startDate = Carbon::parse($request->start_date);
            
            foreach ($request->delivery_days as $dayOfWeek) {
                // Calculate delivery date for this day
                $deliveryDate = $this->calculateDeliveryDate($startDate, $dayOfWeek);
                
                SubscriptionItem::create([
                    'subscription_id' => $subscription->id,
                    'meal_id' => $request->meal_id,
                    'delivery_date' => $deliveryDate,
                    'day_of_week' => $dayOfWeek,
                    'price' => $meal->price,
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
            return response()->json([
                'success' => false,
                'message' => 'فشل في إنشاء الاشتراك',
                'error' => $e->getMessage()
            ], 500);
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
}
