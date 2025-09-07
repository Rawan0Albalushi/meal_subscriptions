<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Restaurant::with(['seller', 'meals']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $isActive = $request->status === 'active';
                $query->where('is_active', $isActive);
            }

            // Filter by seller
            if ($request->has('seller_id') && $request->seller_id) {
                $query->where('seller_id', $request->seller_id);
            }

            $restaurants = $query->orderBy('created_at', 'desc')->paginate(20);

            // Add meals count to each restaurant
            $restaurants->getCollection()->transform(function ($restaurant) {
                $restaurant->meals_count = $restaurant->meals->count();
                return $restaurant;
            });

            return response()->json([
                'success' => true,
                'data' => $restaurants->items(),
                'pagination' => [
                    'current_page' => $restaurants->currentPage(),
                    'last_page' => $restaurants->lastPage(),
                    'per_page' => $restaurants->perPage(),
                    'total' => $restaurants->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب المطاعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name_ar' => 'required|string|max:255',
                'name_en' => 'required|string|max:255',
                'description_ar' => 'nullable|string',
                'description_en' => 'nullable|string',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'address_ar' => 'nullable|string',
                'address_en' => 'nullable|string',
                'seller_id' => 'nullable|exists:users,id',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_active' => 'nullable|in:true,false,1,0'
            ]);

            $data = $request->all();
            
            // Convert is_active string to boolean
            if (isset($data['is_active'])) {
                $data['is_active'] = in_array($data['is_active'], ['true', '1', 1, true]);
            }

            // Handle logo upload
            if ($request->hasFile('logo')) {
                $imagePath = $request->file('logo')->store('restaurants/logos', 'public');
                $data['logo'] = $imagePath;
            }

            $restaurant = Restaurant::create($data);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المطعم بنجاح',
                'data' => $restaurant
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
                'message' => 'حدث خطأ في إنشاء المطعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $restaurant = Restaurant::with(['seller', 'meals'])->findOrFail($id);
            $restaurant->meals_count = $restaurant->meals->count();

            return response()->json([
                'success' => true,
                'data' => $restaurant
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'المطعم غير موجود',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            $request->validate([
                'name_ar' => 'required|string|max:255',
                'name_en' => 'required|string|max:255',
                'description_ar' => 'nullable|string',
                'description_en' => 'nullable|string',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'address_ar' => 'nullable|string',
                'address_en' => 'nullable|string',
                'seller_id' => 'nullable|exists:users,id',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'is_active' => 'nullable|in:true,false,1,0'
            ]);

            $data = $request->all();
            
            // Convert is_active string to boolean
            if (isset($data['is_active'])) {
                $data['is_active'] = in_array($data['is_active'], ['true', '1', 1, true]);
            }

            // Handle logo upload
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($restaurant->logo) {
                    $oldImagePath = str_replace('/storage/', '', $restaurant->logo);
                    Storage::disk('public')->delete($oldImagePath);
                }

                $imagePath = $request->file('logo')->store('restaurants/logos', 'public');
                $data['logo'] = $imagePath;
            }

            $restaurant->update($data);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المطعم بنجاح',
                'data' => $restaurant
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
                'message' => 'حدث خطأ في تحديث المطعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            // Delete logo if exists
            if ($restaurant->logo) {
                $imagePath = str_replace('/storage/', '', $restaurant->logo);
                Storage::disk('public')->delete($imagePath);
            }

            $restaurant->delete(); // This will now use soft delete

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المطعم بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف المطعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            $restaurant->update(['is_active' => !$restaurant->is_active]);

            return response()->json([
                'success' => true,
                'message' => $restaurant->is_active ? 'تم تفعيل المطعم' : 'تم إلغاء تفعيل المطعم',
                'data' => $restaurant
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تغيير حالة المطعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSellers()
    {
        try {
            $sellers = User::where('role', 'seller')->select('id', 'name', 'email')->get();

            return response()->json([
                'success' => true,
                'data' => $sellers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب البائعين',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
