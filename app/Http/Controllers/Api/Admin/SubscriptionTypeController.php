<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionType;
use Illuminate\Http\Request;

class SubscriptionTypeController extends Controller
{
    public function index()
    {
        $subscriptionTypes = SubscriptionType::with('restaurant')->orderBy('price', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptionTypes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
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
            'restaurant_id.required' => 'المطعم مطلوب',
            'restaurant_id.exists' => 'المطعم المحدد غير موجود',
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

        $subscriptionType = SubscriptionType::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء نوع الاشتراك بنجاح',
            'data' => $subscriptionType
        ], 201);
    }

    public function show($id)
    {
        $subscriptionType = SubscriptionType::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subscriptionType
        ]);
    }

    public function update(Request $request, $id)
    {
        $subscriptionType = SubscriptionType::findOrFail($id);

        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
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
            'restaurant_id.required' => 'المطعم مطلوب',
            'restaurant_id.exists' => 'المطعم المحدد غير موجود',
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

        $subscriptionType->update($request->all());

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

        $subscriptionType->delete();

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
