<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryPriceController extends Controller
{
    /**
     * عرض سعر التوصيل الحالي لجميع المطاعم
     */
    public function index()
    {
        $restaurants = Restaurant::select('id', 'name_ar', 'name_en', 'delivery_price')
            ->orderBy('name_ar')
            ->get();

        $totalRestaurants = $restaurants->count();
        $restaurantsWithDelivery = $restaurants->where('delivery_price', '>', 0)->count();
        $averageDeliveryPrice = $restaurants->avg('delivery_price');

        return response()->json([
            'success' => true,
            'data' => [
                'restaurants' => $restaurants,
                'stats' => [
                    'total_restaurants' => $totalRestaurants,
                    'restaurants_with_delivery' => $restaurantsWithDelivery,
                    'average_delivery_price' => round($averageDeliveryPrice, 2),
                ]
            ]
        ]);
    }

    /**
     * توحيد سعر التوصيل لجميع المطاعم
     */
    public function setUnifiedPrice(Request $request)
    {
        $request->validate([
            'delivery_price' => 'required|numeric|min:0|max:999999.99',
        ], [
            'delivery_price.required' => 'سعر التوصيل مطلوب',
            'delivery_price.numeric' => 'سعر التوصيل يجب أن يكون رقم',
            'delivery_price.min' => 'سعر التوصيل يجب أن يكون أكبر من أو يساوي صفر',
            'delivery_price.max' => 'سعر التوصيل يجب أن يكون أقل من 999999.99',
        ]);

        try {
            DB::beginTransaction();

            // تحديث سعر التوصيل لجميع المطاعم
            $updatedCount = Restaurant::update([
                'delivery_price' => $request->delivery_price
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "تم توحيد سعر التوصيل بنجاح لـ {$updatedCount} مطعم",
                'data' => [
                    'unified_delivery_price' => $request->delivery_price,
                    'updated_restaurants_count' => $updatedCount
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'فشل في تحديث سعر التوصيل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث سعر التوصيل لمطعم محدد
     */
    public function updateRestaurantPrice(Request $request, $restaurantId)
    {
        $request->validate([
            'delivery_price' => 'required|numeric|min:0|max:999999.99',
        ], [
            'delivery_price.required' => 'سعر التوصيل مطلوب',
            'delivery_price.numeric' => 'سعر التوصيل يجب أن يكون رقم',
            'delivery_price.min' => 'سعر التوصيل يجب أن يكون أكبر من أو يساوي صفر',
            'delivery_price.max' => 'سعر التوصيل يجب أن يكون أقل من 999999.99',
        ]);

        $restaurant = Restaurant::findOrFail($restaurantId);
        
        $restaurant->update([
            'delivery_price' => $request->delivery_price
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث سعر التوصيل بنجاح',
            'data' => $restaurant->only(['id', 'name_ar', 'name_en', 'delivery_price'])
        ]);
    }

    /**
     * إحصائيات سعر التوصيل
     */
    public function stats()
    {
        $stats = [
            'total_restaurants' => Restaurant::count(),
            'restaurants_with_delivery' => Restaurant::where('delivery_price', '>', 0)->count(),
            'restaurants_without_delivery' => Restaurant::where('delivery_price', 0)->count(),
            'average_delivery_price' => round(Restaurant::avg('delivery_price'), 2),
            'min_delivery_price' => Restaurant::min('delivery_price'),
            'max_delivery_price' => Restaurant::max('delivery_price'),
            'price_ranges' => [
                'free' => Restaurant::where('delivery_price', 0)->count(),
                'low' => Restaurant::whereBetween('delivery_price', [0.01, 5.00])->count(),
                'medium' => Restaurant::whereBetween('delivery_price', [5.01, 15.00])->count(),
                'high' => Restaurant::where('delivery_price', '>', 15.00)->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
