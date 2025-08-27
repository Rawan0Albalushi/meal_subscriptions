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
        // تحديد اللغة من header Accept-Language
        $language = $request->header('Accept-Language', 'ar');
        app()->setLocale($language);

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

        // إضافة الحقول المترجمة حسب اللغة
        $restaurants->each(function ($restaurant) use ($language) {
            $restaurant->name = $language === 'ar' ? $restaurant->name_ar : $restaurant->name_en;
            $restaurant->description = $language === 'ar' ? $restaurant->description_ar : $restaurant->description_en;
            $restaurant->address = $language === 'ar' ? $restaurant->address_ar : $restaurant->address_en;
        });

        return response()->json([
            'success' => true,
            'data' => $restaurants
        ]);
    }

    public function show($id)
    {
        // تحديد اللغة من header Accept-Language
        $language = request()->header('Accept-Language', 'ar');
        app()->setLocale($language);

        $restaurant = Restaurant::where('is_active', true)
            ->with(['meals' => function ($query) {
                $query->where('is_available', true);
            }])
            ->findOrFail($id);

        // إضافة الحقول المترجمة حسب اللغة
        $restaurant->name = $language === 'ar' ? $restaurant->name_ar : $restaurant->name_en;
        $restaurant->description = $language === 'ar' ? $restaurant->description_ar : $restaurant->description_en;
        $restaurant->address = $language === 'ar' ? $restaurant->address_ar : $restaurant->address_en;

        return response()->json([
            'success' => true,
            'data' => $restaurant
        ]);
    }

    public function meals($restaurantId)
    {
        // تحديد اللغة من header Accept-Language
        $language = request()->header('Accept-Language', 'ar');
        app()->setLocale($language);

        $meals = Meal::where('restaurant_id', $restaurantId)
            ->where('is_available', true)
            ->get();

        // إضافة الحقول المترجمة حسب اللغة
        $meals->each(function ($meal) use ($language) {
            $meal->name = $language === 'ar' ? $meal->name_ar : $meal->name_en;
            $meal->description = $language === 'ar' ? $meal->description_ar : $meal->description_en;
            
            // ترجمة نوع الوجبة
            $mealTypes = [
                'breakfast' => ['ar' => 'فطور', 'en' => 'Breakfast'],
                'lunch' => ['ar' => 'غداء', 'en' => 'Lunch'],
                'dinner' => ['ar' => 'عشاء', 'en' => 'Dinner'],
            ];
            $meal->meal_type_text = $mealTypes[$meal->meal_type][$language] ?? $meal->meal_type;
        });

        return response()->json([
            'success' => true,
            'data' => $meals
        ]);
    }

    public function getFilters()
    {
        // تحديد اللغة من header Accept-Language
        $language = request()->header('Accept-Language', 'ar');
        app()->setLocale($language);

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

        // ترجمة أسماء العناوين حسب اللغة
        $locationNames = [
            'ar' => [
                'bosher' => 'بوشر',
                'khoudh' => 'الخوض',
                'maabilah' => 'المعبيلة'
            ],
            'en' => [
                'bosher' => 'Bosher',
                'khoudh' => 'Al Khoudh',
                'maabilah' => 'Al Mabaila'
            ]
        ];

        // ترجمة أسماء أنواع الوجبات حسب اللغة
        $mealTypeNames = [
            'ar' => [
                'breakfast' => 'فطور',
                'lunch' => 'غداء',
                'dinner' => 'عشاء'
            ],
            'en' => [
                'breakfast' => 'Breakfast',
                'lunch' => 'Lunch',
                'dinner' => 'Dinner'
            ]
        ];

        // إضافة الترجمات للعناوين
        $translatedLocations = $locations->map(function ($location) use ($locationNames, $language) {
            return [
                'key' => $location,
                'name' => $locationNames[$language][$location] ?? $location
            ];
        });

        // إضافة الترجمات لأنواع الوجبات
        $translatedMealTypes = $mealTypes->map(function ($mealType) use ($mealTypeNames, $language) {
            return [
                'key' => $mealType,
                'name' => $mealTypeNames[$language][$mealType] ?? $mealType
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'locations' => $translatedLocations,
                'meal_types' => $translatedMealTypes,
                'raw_locations' => $locations,
                'raw_meal_types' => $mealTypes
            ]
        ]);
    }
}
