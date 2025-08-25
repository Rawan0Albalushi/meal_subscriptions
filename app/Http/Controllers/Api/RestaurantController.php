<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\Meal;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        $restaurants = Restaurant::where('is_active', true)
            ->with(['meals' => function ($query) {
                $query->where('is_available', true);
            }])
            ->get();

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
}
