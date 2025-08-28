<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MealController extends Controller
{
    /**
     * عرض قائمة وجبات مطعم محدد
     */
    public function index(Request $request, $restaurantId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
        
        $meals = $restaurant->meals()->get();

        return response()->json([
            'success' => true,
            'data' => $meals
        ]);
    }

    /**
     * عرض وجبة محددة
     */
    public function show(Request $request, $restaurantId, $mealId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
        $meal = $restaurant->meals()->findOrFail($mealId);

        return response()->json([
            'success' => true,
            'data' => $meal
        ]);
    }

    /**
     * إنشاء وجبة جديدة
     */
    public function store(Request $request, $restaurantId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'meal_type' => 'required|in:breakfast,lunch,dinner',
            'delivery_time' => 'required|date_format:H:i',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // رفع الصورة إذا تم توفيرها
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('meals/images', 'public');
            $validated['image'] = $imagePath;
        }

        // إضافة restaurant_id تلقائياً
        $validated['restaurant_id'] = $restaurant->id;

        $meal = Meal::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الوجبة بنجاح',
            'data' => $meal
        ], 201);
    }

    /**
     * تحديث وجبة
     */
    public function update(Request $request, $restaurantId, $mealId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
        $meal = $restaurant->meals()->findOrFail($mealId);

        $validated = $request->validate([
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'meal_type' => 'sometimes|required|in:breakfast,lunch,dinner',
            'delivery_time' => 'sometimes|required|date_format:H:i',
            'is_available' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // رفع صورة جديدة إذا تم توفيرها
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة
            if ($meal->image && Storage::disk('public')->exists($meal->image)) {
                Storage::disk('public')->delete($meal->image);
            }
            
            $imagePath = $request->file('image')->store('meals/images', 'public');
            $validated['image'] = $imagePath;
        }

        $meal->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الوجبة بنجاح',
            'data' => $meal
        ]);
    }

    /**
     * حذف وجبة
     */
    public function destroy(Request $request, $restaurantId, $mealId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
        $meal = $restaurant->meals()->findOrFail($mealId);

        // حذف الصورة إذا كانت موجودة
        if ($meal->image && Storage::disk('public')->exists($meal->image)) {
            Storage::disk('public')->delete($meal->image);
        }

        $meal->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الوجبة بنجاح'
        ]);
    }

    /**
     * تفعيل/إلغاء تفعيل وجبة
     */
    public function toggleAvailability(Request $request, $restaurantId, $mealId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
        $meal = $restaurant->meals()->findOrFail($mealId);
        
        $meal->update([
            'is_available' => !$meal->is_available
        ]);

        return response()->json([
            'success' => true,
            'message' => $meal->is_available ? 'تم تفعيل الوجبة' : 'تم إلغاء تفعيل الوجبة',
            'data' => $meal
        ]);
    }

    /**
     * إحصائيات الوجبات لمطعم محدد
     */
    public function stats(Request $request, $restaurantId)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);

        $stats = [
            'total_meals' => $restaurant->meals()->count(),
            'active_meals' => $restaurant->meals()->where('is_available', true)->count(),
            'breakfast_meals' => $restaurant->meals()->where('meal_type', 'breakfast')->count(),
            'lunch_meals' => $restaurant->meals()->where('meal_type', 'lunch')->count(),
            'dinner_meals' => $restaurant->meals()->where('meal_type', 'dinner')->count(),
            'average_price' => $restaurant->meals()->avg('price'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
