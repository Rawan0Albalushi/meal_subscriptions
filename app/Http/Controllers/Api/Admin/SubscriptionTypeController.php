<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionType;
use Illuminate\Http\Request;

class SubscriptionTypeController extends Controller
{
    public function index()
    {
        $subscriptionTypes = SubscriptionType::with('restaurants')->orderBy('price', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptionTypes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'restaurant_ids' => 'required|array|min:1',
            'restaurant_ids.*' => 'exists:restaurants,id',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'type' => 'required|in:weekly,monthly',
            'price' => 'required|numeric|min:0',
            'delivery_price' => 'required|numeric|min:0',
            'meals_count' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ], [
            'restaurant_ids.required' => 'يجب اختيار مطعم واحد على الأقل',
            'restaurant_ids.array' => 'المطاعم يجب أن تكون قائمة',
            'restaurant_ids.min' => 'يجب اختيار مطعم واحد على الأقل',
            'restaurant_ids.*.exists' => 'أحد المطاعم المحددة غير موجود',
            'name_ar.required' => 'الاسم بالعربية مطلوب',
            'name_en.required' => 'الاسم بالإنجليزية مطلوب',
            'type.required' => 'نوع الاشتراك مطلوب',
            'type.in' => 'نوع الاشتراك يجب أن يكون أسبوعي أو شهري',
            'price.required' => 'السعر مطلوب',
            'price.numeric' => 'السعر يجب أن يكون رقم',
            'price.min' => 'السعر يجب أن يكون أكبر من صفر',
            'delivery_price.required' => 'سعر التوصيل مطلوب',
            'delivery_price.numeric' => 'سعر التوصيل يجب أن يكون رقم',
            'delivery_price.min' => 'سعر التوصيل يجب أن يكون أكبر من أو يساوي صفر',
            'meals_count.required' => 'عدد الوجبات مطلوب',
            'meals_count.integer' => 'عدد الوجبات يجب أن يكون رقم صحيح',
            'meals_count.min' => 'عدد الوجبات يجب أن يكون أكبر من صفر',
        ]);

        // Create subscription type
        $subscriptionType = SubscriptionType::create([
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'description_ar' => $request->description_ar,
            'description_en' => $request->description_en,
            'type' => $request->type,
            'price' => $request->price,
            'delivery_price' => $request->delivery_price,
            'meals_count' => $request->meals_count,
            'is_active' => $request->is_active ?? true,
        ]);

        // Attach restaurants
        $subscriptionType->restaurants()->attach($request->restaurant_ids);

        // Load restaurants for response
        $subscriptionType->load('restaurants');

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء نوع الاشتراك بنجاح',
            'data' => $subscriptionType
        ], 201);
    }

    public function show($id)
    {
        $subscriptionType = SubscriptionType::with('restaurants')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subscriptionType
        ]);
    }

    public function update(Request $request, $id)
    {
        $subscriptionType = SubscriptionType::findOrFail($id);

        $request->validate([
            'restaurant_ids' => 'required|array|min:1',
            'restaurant_ids.*' => 'exists:restaurants,id',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'type' => 'required|in:weekly,monthly',
            'price' => 'required|numeric|min:0',
            'delivery_price' => 'required|numeric|min:0',
            'meals_count' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ], [
            'restaurant_ids.required' => 'يجب اختيار مطعم واحد على الأقل',
            'restaurant_ids.array' => 'المطاعم يجب أن تكون قائمة',
            'restaurant_ids.min' => 'يجب اختيار مطعم واحد على الأقل',
            'restaurant_ids.*.exists' => 'أحد المطاعم المحددة غير موجود',
            'name_ar.required' => 'الاسم بالعربية مطلوب',
            'name_en.required' => 'الاسم بالإنجليزية مطلوب',
            'type.required' => 'نوع الاشتراك مطلوب',
            'type.in' => 'نوع الاشتراك يجب أن يكون أسبوعي أو شهري',
            'price.required' => 'السعر مطلوب',
            'price.numeric' => 'السعر يجب أن يكون رقم',
            'price.min' => 'السعر يجب أن يكون أكبر من صفر',
            'delivery_price.required' => 'سعر التوصيل مطلوب',
            'delivery_price.numeric' => 'سعر التوصيل يجب أن يكون رقم',
            'delivery_price.min' => 'سعر التوصيل يجب أن يكون أكبر من أو يساوي صفر',
            'meals_count.required' => 'عدد الوجبات مطلوب',
            'meals_count.integer' => 'عدد الوجبات يجب أن يكون رقم صحيح',
            'meals_count.min' => 'عدد الوجبات يجب أن يكون أكبر من صفر',
        ]);

        // Update subscription type
        $subscriptionType->update([
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'description_ar' => $request->description_ar,
            'description_en' => $request->description_en,
            'type' => $request->type,
            'price' => $request->price,
            'delivery_price' => $request->delivery_price,
            'meals_count' => $request->meals_count,
            'is_active' => $request->is_active ?? $subscriptionType->is_active,
        ]);

        // Sync restaurants (remove old ones and add new ones)
        $subscriptionType->restaurants()->sync($request->restaurant_ids);

        // Load restaurants for response
        $subscriptionType->load('restaurants');

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث نوع الاشتراك بنجاح',
            'data' => $subscriptionType
        ]);
    }

    public function destroy($id)
    {
        $subscriptionType = SubscriptionType::findOrFail($id);

        // Check if there are any active subscriptions using this type
        if ($subscriptionType->subscriptions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف نوع الاشتراك لوجود اشتراكات مرتبطة به'
            ], 400);
        }

        $subscriptionType->delete(); // This will now use soft delete

        return response()->json([
            'success' => true,
            'message' => 'تم حذف نوع الاشتراك بنجاح'
        ]);
    }

    public function getRestaurants()
    {
        try {
            $restaurants = \App\Models\Restaurant::select('id', 'name_ar', 'name_en')->get();

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
}
