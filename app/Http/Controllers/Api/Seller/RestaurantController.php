<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RestaurantController extends Controller
{
    /**
     * عرض قائمة مطاعم البائع
     */
    public function index(Request $request)
    {
        $restaurants = $request->user()->restaurants()
            ->with(['meals', 'subscriptionTypes'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $restaurants
        ]);
    }

    /**
     * عرض مطعم محدد
     */
    public function show(Request $request, $id)
    {
        $restaurant = $request->user()->restaurants()
            ->with(['meals', 'subscriptionTypes'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $restaurant
        ]);
    }

    /**
     * إنشاء مطعم جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_ar' => 'nullable|string',
            'address_en' => 'nullable|string',
            'locations' => 'nullable|array',
            'locations.*' => 'string|in:bosher,khoudh,maabilah',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean'
        ]);

        // رفع الصورة إذا تم توفيرها
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('restaurants/logos', 'public');
            $validated['logo'] = $logoPath;
        }

        // إضافة seller_id تلقائياً
        $validated['seller_id'] = $request->user()->id;

        $restaurant = Restaurant::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المطعم بنجاح',
            'data' => $restaurant
        ], 201);
    }

    /**
     * تحديث مطعم
     */
    public function update(Request $request, $id)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_ar' => 'nullable|string',
            'address_en' => 'nullable|string',
            'locations' => 'nullable|array',
            'locations.*' => 'string|in:bosher,khoudh,maabilah',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean'
        ]);

        // رفع صورة جديدة إذا تم توفيرها
        if ($request->hasFile('logo')) {
            // حذف الصورة القديمة
            if ($restaurant->logo && Storage::disk('public')->exists($restaurant->logo)) {
                Storage::disk('public')->delete($restaurant->logo);
            }
            
            $logoPath = $request->file('logo')->store('restaurants/logos', 'public');
            $validated['logo'] = $logoPath;
        }

        $restaurant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المطعم بنجاح',
            'data' => $restaurant
        ]);
    }

    /**
     * حذف مطعم
     */
    public function destroy(Request $request, $id)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($id);

        // حذف الصورة إذا كانت موجودة
        if ($restaurant->logo && Storage::disk('public')->exists($restaurant->logo)) {
            Storage::disk('public')->delete($restaurant->logo);
        }

        $restaurant->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المطعم بنجاح'
        ]);
    }

    /**
     * تفعيل/إلغاء تفعيل مطعم
     */
    public function toggleStatus(Request $request, $id)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($id);
        
        $restaurant->update([
            'is_active' => !$restaurant->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => $restaurant->is_active ? 'تم تفعيل المطعم' : 'تم إلغاء تفعيل المطعم',
            'data' => $restaurant
        ]);
    }

    /**
     * إحصائيات المطعم
     */
    public function stats(Request $request, $id)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($id);

        $stats = [
            'total_meals' => $restaurant->meals()->count(),
            'active_meals' => $restaurant->meals()->where('is_available', true)->count(),
            'total_subscriptions' => $restaurant->subscriptions()->count(),
            'active_subscriptions' => $restaurant->subscriptions()->where('status', 'active')->count(),
            'total_subscription_types' => $restaurant->subscriptionTypes()->count(),
            'active_subscription_types' => $restaurant->subscriptionTypes()->where('is_active', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
