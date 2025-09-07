<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeliveryAddress;
use App\Models\User;
use App\Models\RestaurantAddress;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DeliveryAddress::with(['user']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('address', 'like', "%{$search}%")
                      ->orWhere('area', 'like', "%{$search}%")
                      ->orWhere('building_number', 'like', "%{$search}%")
                      ->orWhere('street', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by area
            if ($request->has('area') && $request->area) {
                $query->where('area', $request->area);
            }

            // Filter by user
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by is_primary
            if ($request->has('is_primary') && $request->is_primary !== 'all') {
                $isPrimary = $request->is_primary === 'primary';
                $query->where('is_primary', $isPrimary);
            }

            $addresses = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $addresses->items(),
                'pagination' => [
                    'current_page' => $addresses->currentPage(),
                    'last_page' => $addresses->lastPage(),
                    'per_page' => $addresses->perPage(),
                    'total' => $addresses->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب العناوين',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'address' => 'required|string|max:500',
                'area' => 'required|string|max:100',
                'building_number' => 'nullable|string|max:20',
                'street' => 'nullable|string|max:100',
                'floor' => 'nullable|string|max:20',
                'apartment' => 'nullable|string|max:20',
                'landmark' => 'nullable|string|max:200',
                'is_primary' => 'boolean'
            ]);

            // If this is set as primary, unset other primary addresses for this user
            if ($request->is_primary) {
                DeliveryAddress::where('user_id', $request->user_id)
                    ->where('is_primary', true)
                    ->update(['is_primary' => false]);
            }

            $address = DeliveryAddress::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء العنوان بنجاح',
                'data' => $address->load('user')
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
                'message' => 'حدث خطأ في إنشاء العنوان',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $address = DeliveryAddress::with(['user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $address
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'العنوان غير موجود',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $address = DeliveryAddress::findOrFail($id);

            $request->validate([
                'user_id' => 'required|exists:users,id',
                'address' => 'required|string|max:500',
                'area' => 'required|string|max:100',
                'building_number' => 'nullable|string|max:20',
                'street' => 'nullable|string|max:100',
                'floor' => 'nullable|string|max:20',
                'apartment' => 'nullable|string|max:20',
                'landmark' => 'nullable|string|max:200',
                'is_primary' => 'boolean'
            ]);

            // If this is set as primary, unset other primary addresses for this user
            if ($request->is_primary) {
                DeliveryAddress::where('user_id', $request->user_id)
                    ->where('id', '!=', $id)
                    ->where('is_primary', true)
                    ->update(['is_primary' => false]);
            }

            $address->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث العنوان بنجاح',
                'data' => $address->load('user')
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
                'message' => 'حدث خطأ في تحديث العنوان',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $address = DeliveryAddress::findOrFail($id);

            $address->delete(); // This will now use soft delete

            return response()->json([
                'success' => true,
                'message' => 'تم حذف العنوان بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف العنوان',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function setPrimary($id)
    {
        try {
            $address = DeliveryAddress::findOrFail($id);

            // Unset other primary addresses for this user
            DeliveryAddress::where('user_id', $address->user_id)
                ->where('id', '!=', $id)
                ->where('is_primary', true)
                ->update(['is_primary' => false]);

            // Set this address as primary
            $address->update(['is_primary' => true]);

            return response()->json([
                'success' => true,
                'message' => 'تم تعيين العنوان كعنوان رئيسي',
                'data' => $address
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تعيين العنوان الرئيسي',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAreas()
    {
        try {
            $areas = DeliveryAddress::distinct()->pluck('area')->filter()->sort()->values();

            return response()->json([
                'success' => true,
                'data' => $areas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب المناطق',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsers()
    {
        try {
            $users = User::where('role', 'customer')->select('id', 'name', 'email')->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب العملاء',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            $stats = [
                'totalAddresses' => DeliveryAddress::count(),
                'primaryAddresses' => DeliveryAddress::where('is_primary', true)->count(),
                'addressesByArea' => DeliveryAddress::selectRaw('area, COUNT(*) as count')
                    ->groupBy('area')
                    ->orderBy('count', 'desc')
                    ->get(),
                'usersWithAddresses' => DeliveryAddress::distinct('user_id')->count(),
                'averageAddressesPerUser' => DeliveryAddress::count() / max(DeliveryAddress::distinct('user_id')->count(), 1),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب إحصائيات العناوين',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRestaurantAddresses(Request $request)
    {
        try {
            $query = RestaurantAddress::with(['restaurant']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('area', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%")
                      ->orWhereHas('restaurant', function ($restaurantQuery) use ($search) {
                          $restaurantQuery->where('name_ar', 'like', "%{$search}%")
                                         ->orWhere('name_en', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by restaurant
            if ($request->has('restaurant_id') && $request->restaurant_id) {
                $query->where('restaurant_id', $request->restaurant_id);
            }

            // Filter by area
            if ($request->has('area') && $request->area) {
                $query->where('area', $request->area);
            }

            $addresses = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $addresses->items(),
                'pagination' => [
                    'current_page' => $addresses->currentPage(),
                    'last_page' => $addresses->lastPage(),
                    'per_page' => $addresses->perPage(),
                    'total' => $addresses->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب عناوين المطاعم',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
