<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionType;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class SubscriptionTypeController extends Controller
{
    public function index()
    {
        $subscriptionTypes = SubscriptionType::where('is_active', true)
            ->with('restaurant')
            ->orderBy('price', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptionTypes
        ]);
    }

    public function show($id)
    {
        $subscriptionType = SubscriptionType::where('is_active', true)
            ->with('restaurant')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subscriptionType
        ]);
    }

    public function getByType($type)
    {
        $subscriptionType = SubscriptionType::where('is_active', true)
            ->where('type', $type)
            ->with('restaurant')
            ->first();

        if (!$subscriptionType) {
            return response()->json([
                'success' => false,
                'message' => 'نوع الاشتراك غير موجود'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subscriptionType
        ]);
    }

    // Get subscription types for a specific restaurant
    public function getByRestaurant($restaurantId)
    {
        $subscriptionTypes = SubscriptionType::where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->orderBy('price', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptionTypes
        ]);
    }

    // Restaurant owner methods
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
            'meals_count' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        // Check if user owns the restaurant
        $user = auth()->user();
        if ($user->role !== 'restaurant_owner' || $user->restaurant_id != $request->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإنشاء أنواع اشتراكات لهذا المطعم'
            ], 403);
        }

        $subscriptionType = SubscriptionType::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء نوع الاشتراك بنجاح',
            'data' => $subscriptionType
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $subscriptionType = SubscriptionType::findOrFail($id);
        
        // Check if user owns the restaurant
        $user = auth()->user();
        if ($user->role !== 'restaurant_owner' || $user->restaurant_id != $subscriptionType->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل هذا النوع من الاشتراك'
            ], 403);
        }

        $request->validate([
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'type' => 'sometimes|required|in:weekly,monthly',
            'price' => 'sometimes|required|numeric|min:0',
            'meals_count' => 'sometimes|required|integer|min:1',
            'is_active' => 'boolean',
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
        
        // Check if user owns the restaurant
        $user = auth()->user();
        if ($user->role !== 'restaurant_owner' || $user->restaurant_id != $subscriptionType->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بحذف هذا النوع من الاشتراك'
            ], 403);
        }

        $subscriptionType->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف نوع الاشتراك بنجاح'
        ]);
    }
}
