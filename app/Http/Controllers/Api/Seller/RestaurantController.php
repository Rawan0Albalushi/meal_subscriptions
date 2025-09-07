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
            ->with(['meals', 'subscriptionTypes', 'subscriptions'])
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
        // إضافة logs مفصلة
        \Log::info('🔍 بدء عملية إنشاء مطعم جديد', [
            'user_id' => $request->user() ? $request->user()->id : 'غير مسجل',
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        try {
            // التحقق من المصادقة
            if (!$request->user()) {
                \Log::error('❌ المستخدم غير مسجل دخول');
                return response()->json([
                    'success' => false,
                    'message' => 'يجب تسجيل الدخول أولاً'
                ], 401);
            }

            \Log::info('✅ المستخدم مسجل دخول', [
                'user_id' => $request->user()->id,
                'user_role' => $request->user()->role
            ]);

            // التحقق من الصلاحيات
            if ($request->user()->role !== 'seller') {
                \Log::error('❌ المستخدم ليس لديه صلاحيات البائع', [
                    'user_role' => $request->user()->role
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'ليس لديك صلاحيات لإضافة مطاعم'
                ], 403);
            }

            \Log::info('✅ المستخدم لديه صلاحيات البائع');

            // التحقق من البيانات
            \Log::info('🔍 بدء التحقق من البيانات المرسلة', [
                'name_ar' => $request->input('name_ar'),
                'name_en' => $request->input('name_en'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address_ar' => $request->input('address_ar'),
                'address_en' => $request->input('address_en'),
                'locations' => $request->input('locations'),
                'is_active' => $request->input('is_active'),
                'has_logo' => $request->hasFile('logo')
            ]);

            // معالجة حقل is_active قبل التحقق
            $requestData = $request->all();
            
            \Log::info('🔍 معالجة حقل is_active', [
                'original_is_active' => $requestData['is_active'] ?? 'غير محدد',
                'original_type' => gettype($requestData['is_active'] ?? null)
            ]);
            
            if (isset($requestData['is_active'])) {
                // تحويل "on" إلى true، والقيم الأخرى إلى false
                $requestData['is_active'] = $requestData['is_active'] === 'on' || 
                                          $requestData['is_active'] === true || 
                                          $requestData['is_active'] === '1' || 
                                          $requestData['is_active'] === 1 ||
                                          $requestData['is_active'] === 'true';
            } else {
                $requestData['is_active'] = false;
            }
            
            \Log::info('✅ تم معالجة حقل is_active', [
                'processed_is_active' => $requestData['is_active'],
                'processed_type' => gettype($requestData['is_active'])
            ]);
            
            // استبدال البيانات في الطلب
            $request->merge($requestData);

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
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'is_active' => 'boolean'
            ]);

            \Log::info('✅ تم التحقق من البيانات بنجاح', [
                'validated_data' => $validated
            ]);

            // رفع الصورة إذا تم توفيرها
            if ($request->hasFile('logo')) {
                \Log::info('📁 بدء رفع الشعار', [
                    'file_name' => $request->file('logo')->getClientOriginalName(),
                    'file_size' => $request->file('logo')->getSize(),
                    'file_type' => $request->file('logo')->getMimeType()
                ]);

                $logoPath = $request->file('logo')->store('restaurants/logos', 'public');
                $validated['logo'] = $logoPath;

                // مزامنة الملفات مع مجلد public
                exec('php ' . base_path('sync_storage.php'));

                \Log::info('✅ تم رفع الشعار بنجاح', [
                    'logo_path' => $logoPath
                ]);
            }

            // إضافة seller_id تلقائياً
            $validated['seller_id'] = $request->user()->id;

            \Log::info('🔍 محاولة إنشاء المطعم في قاعدة البيانات', [
                'final_data' => $validated
            ]);

            $restaurant = Restaurant::create($validated);

            \Log::info('✅ تم إنشاء المطعم بنجاح', [
                'restaurant_id' => $restaurant->id,
                'restaurant_data' => $restaurant->toArray()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المطعم بنجاح',
                'data' => $restaurant
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ خطأ في التحقق من البيانات', [
                'validation_errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('❌ خطأ غير متوقع في إنشاء المطعم', [
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حفظ المطعم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث مطعم
     */
    public function update(Request $request, $id)
    {
        $restaurant = $request->user()->restaurants()->findOrFail($id);

        // معالجة حقل is_active قبل التحقق
        $requestData = $request->all();
        if (isset($requestData['is_active'])) {
            // تحويل "on" إلى true، والقيم الأخرى إلى false
            $requestData['is_active'] = $requestData['is_active'] === 'on' || 
                                      $requestData['is_active'] === true || 
                                      $requestData['is_active'] === '1' || 
                                      $requestData['is_active'] === 1 ||
                                      $requestData['is_active'] === 'true';
        }
        
        // استبدال البيانات في الطلب
        $request->merge($requestData);

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
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
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

        $restaurant->delete(); // This will now use soft delete

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
