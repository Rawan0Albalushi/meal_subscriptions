<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Meal;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MealController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Meal::with(['restaurant']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name_ar', 'like', "%{$search}%")
                      ->orWhere('name_en', 'like', "%{$search}%")
                      ->orWhere('description_ar', 'like', "%{$search}%")
                      ->orWhere('description_en', 'like', "%{$search}%");
                });
            }

            // Filter by restaurant
            if ($request->has('restaurant_id') && $request->restaurant_id) {
                $query->where('restaurant_id', $request->restaurant_id);
            }

            // Filter by meal type
            if ($request->has('meal_type') && $request->meal_type !== 'all') {
                $query->where('meal_type', $request->meal_type);
            }

            // Filter by availability
            if ($request->has('is_available') && $request->is_available !== 'all') {
                $isAvailable = $request->is_available === 'available';
                $query->where('is_available', $isAvailable);
            }

            $meals = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $meals->items(),
                'pagination' => [
                    'current_page' => $meals->currentPage(),
                    'last_page' => $meals->lastPage(),
                    'per_page' => $meals->perPage(),
                    'total' => $meals->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الوجبات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->all();
            
            // Handle subscription_type_ids before validation
            if (isset($data['subscription_type_ids'])) {
                if (is_string($data['subscription_type_ids'])) {
                    $data['subscription_type_ids'] = json_decode($data['subscription_type_ids'], true);
                }
            }
            
            // Create a new request with processed data for validation
            $processedRequest = new \Illuminate\Http\Request();
            $processedRequest->merge($data);
            
            $processedRequest->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'name_ar' => 'required|string|max:255',
                'name_en' => 'required|string|max:255',
                'description_ar' => 'nullable|string',
                'description_en' => 'nullable|string',
                'price' => 'nullable|numeric|min:0',
                'meal_type' => 'required|in:breakfast,lunch,dinner',
                'delivery_time' => 'required|date_format:H:i',
                'is_available' => 'nullable|in:true,false,1,0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'subscription_type_ids' => 'nullable|array',
                'subscription_type_ids.*' => 'integer|exists:subscription_types,id'
            ]);
            
            // Convert is_available string to boolean
            if (isset($data['is_available'])) {
                $data['is_available'] = in_array($data['is_available'], ['true', '1', 1, true]);
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('meals/images', 'public');
                $data['image'] = $imagePath;
            }

            // Set price to 0 (system uses subscription pricing)
            $data['price'] = 0.00;

            $meal = Meal::create($data);

            // Sync subscription types if provided (temporarily disabled)
            // if ($request->has('subscription_type_ids')) {
            //     $meal->subscriptionTypes()->sync($request->subscription_type_ids);
            // }

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الوجبة بنجاح',
                'data' => $meal->load(['restaurant'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في إنشاء الوجبة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $meal = Meal::with(['restaurant'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $meal
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'الوجبة غير موجودة',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $meal = Meal::findOrFail($id);

            $data = $request->all();
            
            // Handle subscription_type_ids before validation
            if (isset($data['subscription_type_ids'])) {
                if (is_string($data['subscription_type_ids'])) {
                    $data['subscription_type_ids'] = json_decode($data['subscription_type_ids'], true);
                }
            }
            
            // Create a new request with processed data for validation
            $processedRequest = new \Illuminate\Http\Request();
            $processedRequest->merge($data);
            
            $processedRequest->validate([
                'restaurant_id' => 'required|exists:restaurants,id',
                'name_ar' => 'required|string|max:255',
                'name_en' => 'required|string|max:255',
                'description_ar' => 'nullable|string',
                'description_en' => 'nullable|string',
                'price' => 'nullable|numeric|min:0',
                'meal_type' => 'required|in:breakfast,lunch,dinner',
                'delivery_time' => 'required|date_format:H:i',
                'is_available' => 'nullable|in:true,false,1,0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'subscription_type_ids' => 'nullable|array',
                'subscription_type_ids.*' => 'integer|exists:subscription_types,id'
            ]);
            
            // Convert is_available string to boolean
            if (isset($data['is_available'])) {
                $data['is_available'] = in_array($data['is_available'], ['true', '1', 1, true]);
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($meal->image) {
                    $oldImagePath = str_replace('/storage/', '', $meal->image);
                    Storage::disk('public')->delete($oldImagePath);
                }

                $imagePath = $request->file('image')->store('meals/images', 'public');
                $data['image'] = $imagePath;
            }

            // Set price to 0 (system uses subscription pricing)
            $data['price'] = 0.00;

            $meal->update($data);

            // Sync subscription types if provided (temporarily disabled)
            // if ($request->has('subscription_type_ids')) {
            //     $meal->subscriptionTypes()->sync($request->subscription_type_ids);
            // }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الوجبة بنجاح',
                'data' => $meal->load(['restaurant'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث الوجبة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $meal = Meal::findOrFail($id);

            // Delete image if exists
            if ($meal->image) {
                $imagePath = str_replace('/storage/', '', $meal->image);
                Storage::disk('public')->delete($imagePath);
            }

            $meal->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الوجبة بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف الوجبة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleAvailability($id)
    {
        try {
            $meal = Meal::findOrFail($id);

            $meal->update(['is_available' => !$meal->is_available]);

            return response()->json([
                'success' => true,
                'message' => $meal->is_available ? 'تم تفعيل الوجبة' : 'تم إلغاء تفعيل الوجبة',
                'data' => $meal
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تغيير حالة الوجبة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRestaurants()
    {
        try {
            $restaurants = Restaurant::select('id', 'name_ar', 'name_en')->get();

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

    public function getMealTypes()
    {
        try {
            $mealTypes = [
                ['value' => 'breakfast', 'label_ar' => 'فطور', 'label_en' => 'Breakfast'],
                ['value' => 'lunch', 'label_ar' => 'غداء', 'label_en' => 'Lunch'],
                ['value' => 'dinner', 'label_ar' => 'عشاء', 'label_en' => 'Dinner'],
            ];

            return response()->json([
                'success' => true,
                'data' => $mealTypes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب أنواع الوجبات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSubscriptionTypes(Request $request)
    {
        try {
            $query = \App\Models\SubscriptionType::with('restaurant');
            
            // Filter by restaurant if provided
            if ($request->has('restaurant_id') && $request->restaurant_id) {
                $query->where('restaurant_id', $request->restaurant_id);
            }
            
            $subscriptionTypes = $query->select('id', 'restaurant_id', 'name_ar', 'name_en', 'type', 'price')->get();

            return response()->json([
                'success' => true,
                'data' => $subscriptionTypes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب أنواع الاشتراكات',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
