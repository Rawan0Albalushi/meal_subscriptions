<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\Meal;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        $query = Restaurant::where('is_active', true);

        // فلتر العناوين
        if ($request->has('locations') && $request->locations) {
            $locations = is_array($request->locations) ? $request->locations : [$request->locations];
            $query->where(function($q) use ($locations) {
                foreach ($locations as $location) {
                    $q->orWhereJsonContains('locations', $location);
                }
            });
        }

        // فلتر أنواع الوجبات
        if ($request->has('meal_types') && $request->meal_types) {
            $mealTypes = is_array($request->meal_types) ? $request->meal_types : [$request->meal_types];
            $query->whereHas('meals', function($q) use ($mealTypes) {
                $q->where('is_available', true)
                  ->whereIn('meal_type', $mealTypes);
            });
        }

        $restaurants = $query->with(['meals' => function ($query) {
            $query->where('is_available', true);
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $restaurants
        ]);
    }

    public function show($id)
    {
        $restaurant = Restaurant::where('is_active', true)
            ->with(['meals' => function ($query) {
                $query->where('is_available', true);
            }])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $restaurant
        ]);
    }

    public function meals($restaurantId)
    {
        $meals = Meal::where('restaurant_id', $restaurantId)
            ->where('is_available', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $meals
        ]);
    }

    public function getFilters()
    {
        // الحصول على العناوين المتاحة
        $locations = Restaurant::where('is_active', true)
            ->whereNotNull('locations')
            ->pluck('locations')
            ->flatten()
            ->unique()
            ->values();

        // الحصول على أنواع الوجبات المتاحة
        $mealTypes = Meal::where('is_available', true)
            ->pluck('meal_type')
            ->unique()
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'locations' => $locations,
                'meal_types' => $mealTypes
            ]
        ]);
    }
}
