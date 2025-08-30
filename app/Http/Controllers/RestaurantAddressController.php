<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\RestaurantAddress;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class RestaurantAddressController extends Controller
{
    /**
     * عرض جميع عناوين مطعم معين
     */
    public function index(Request $request, $restaurantId): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        
        $addresses = $restaurant->addresses()
            ->where('is_active', true)
            ->orderBy('is_primary', 'desc')
            ->orderBy('name_ar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $addresses,
            'message' => 'تم جلب عناوين المطعم بنجاح'
        ]);
    }

    /**
     * عرض عنوان محدد
     */
    public function show($restaurantId, $addressId): JsonResponse
    {
        $address = RestaurantAddress::where('restaurant_id', $restaurantId)
            ->where('id', $addressId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'تم جلب العنوان بنجاح'
        ]);
    }

    /**
     * إنشاء عنوان جديد
     */
    public function store(Request $request, $restaurantId): JsonResponse
    {
        $restaurant = Restaurant::findOrFail($restaurantId);

        $validator = Validator::make($request->all(), [
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'address_ar' => 'required|string',
            'address_en' => 'required|string',
            'area' => 'required|string|in:bosher,khoudh,maabilah',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        // إذا كان العنوان الجديد هو الرئيسي، إلغاء العنوان الرئيسي السابق
        if ($request->input('is_primary', false)) {
            $restaurant->addresses()->where('is_primary', true)->update(['is_primary' => false]);
        }

        $address = $restaurant->addresses()->create($request->all());

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'تم إنشاء العنوان بنجاح'
        ], 201);
    }

    /**
     * تحديث عنوان موجود
     */
    public function update(Request $request, $restaurantId, $addressId): JsonResponse
    {
        $address = RestaurantAddress::where('restaurant_id', $restaurantId)
            ->where('id', $addressId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'address_ar' => 'sometimes|required|string',
            'address_en' => 'sometimes|required|string',
            'area' => 'sometimes|required|string|in:bosher,khoudh,maabilah',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        // إذا كان العنوان سيصبح رئيسي، إلغاء العنوان الرئيسي السابق
        if ($request->input('is_primary', false) && !$address->is_primary) {
            $address->restaurant->addresses()->where('is_primary', true)->update(['is_primary' => false]);
        }

        $address->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'تم تحديث العنوان بنجاح'
        ]);
    }

    /**
     * حذف عنوان
     */
    public function destroy($restaurantId, $addressId): JsonResponse
    {
        $address = RestaurantAddress::where('restaurant_id', $restaurantId)
            ->where('id', $addressId)
            ->firstOrFail();

        // لا يمكن حذف العنوان الرئيسي إذا كان هناك عناوين أخرى
        if ($address->is_primary) {
            $otherAddresses = $address->restaurant->addresses()
                ->where('id', '!=', $addressId)
                ->where('is_active', true)
                ->count();

            if ($otherAddresses > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف العنوان الرئيسي. يرجى تعيين عنوان آخر كرئيسي أولاً'
                ], 400);
            }
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف العنوان بنجاح'
        ]);
    }

    /**
     * الحصول على المناطق المتاحة
     */
    public function getAvailableAreas(): JsonResponse
    {
        $areas = RestaurantAddress::getAvailableAreas();

        return response()->json([
            'success' => true,
            'data' => $areas,
            'message' => 'تم جلب المناطق المتاحة بنجاح'
        ]);
    }

    /**
     * تعيين عنوان كرئيسي
     */
    public function setPrimary($restaurantId, $addressId): JsonResponse
    {
        $address = RestaurantAddress::where('restaurant_id', $restaurantId)
            ->where('id', $addressId)
            ->where('is_active', true)
            ->firstOrFail();

        // إلغاء العنوان الرئيسي السابق
        $address->restaurant->addresses()->where('is_primary', true)->update(['is_primary' => false]);

        // تعيين العنوان الجديد كرئيسي
        $address->update(['is_primary' => true]);

        return response()->json([
            'success' => true,
            'data' => $address,
            'message' => 'تم تعيين العنوان كرئيسي بنجاح'
        ]);
    }
}
