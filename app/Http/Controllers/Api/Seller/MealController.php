<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MealController extends Controller
{
    /**
     * عرض قائمة وجبات مطعم محدد
     */
    public function index(Request $request, $restaurantId)
    {
        try {
            Log::info('MealController@index: بدء جلب وجبات المطعم', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'request_data' => $request->all()
            ]);

            $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
            
            $meals = $restaurant->meals()->get();

            Log::info('MealController@index: تم جلب وجبات المطعم بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meals_count' => $meals->count()
            ]);

            // مراقبة بيانات وقت التوصيل وأنواع الاشتراك
            foreach ($meals as $meal) {
                Log::info('MealController@index: تفاصيل الوجبة', [
                    'meal_id' => $meal->id,
                    'meal_name' => $meal->name_ar,
                    'delivery_time' => $meal->delivery_time,
                    'delivery_time_formatted' => $meal->delivery_time_formatted,
                    'delivery_time_type' => gettype($meal->delivery_time),
                    'formatted_type' => gettype($meal->delivery_time_formatted),
                    'subscription_type_ids' => $meal->subscription_type_ids,
                    'linked_subscription_types_count' => $meal->linked_subscription_types->count()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $meals
            ]);
        } catch (\Exception $e) {
            Log::error('MealController@index: خطأ في جلب وجبات المطعم', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب وجبات المطعم'
            ], 500);
        }
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
        try {
            Log::info('MealController@store: بدء إنشاء وجبة جديدة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'request_data' => $request->except(['image']), // لا نطبع الصورة في الـ log
                'has_image' => $request->hasFile('image'),
                'image_size' => $request->hasFile('image') ? $request->file('image')->getSize() : null
            ]);

            $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);

            Log::info('MealController@store: تم العثور على المطعم', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'restaurant_name' => $restaurant->name_ar
            ]);

            Log::info('MealController@store: بدء التحقق من البيانات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'request_data' => $request->all()
            ]);
            
            // تسجيل مفصل للبيانات المرسلة
            Log::info('MealController@store: تفاصيل البيانات المرسلة', [
                'name_ar' => $request->input('name_ar'),
                'name_en' => $request->input('name_en'),
                'meal_type' => $request->input('meal_type'),
                'delivery_time' => $request->input('delivery_time'),
                'subscription_type_ids' => $request->input('subscription_type_ids'),
                'is_available' => $request->input('is_available')
            ]);
            
            // تسجيل مفصل للبيانات المرسلة
            Log::info('MealController@store: تفاصيل البيانات المرسلة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'name_ar' => $request->input('name_ar'),
                'name_en' => $request->input('name_en'),
                'description_ar' => $request->input('description_ar'),
                'description_en' => $request->input('description_en'),
                'price' => $request->input('price'),
                'meal_type' => $request->input('meal_type'),
                'delivery_time' => $request->input('delivery_time'),
                'subscription_type_ids' => $request->input('subscription_type_ids'),
                'subscription_type_ids_type' => gettype($request->input('subscription_type_ids')),
                'is_available' => $request->input('is_available'),
                'is_available_type' => gettype($request->input('is_available')),
                'has_image' => $request->hasFile('image'),
                'all_request_data' => $request->all()
            ]);
            
            try {
                // تسجيل البيانات قبل validation
                Log::info('MealController@store: بدء validation', [
                    'request_all' => $request->all(),
                    'request_input_subscription_type_ids' => $request->input('subscription_type_ids'),
                    'request_input_subscription_type_ids_type' => gettype($request->input('subscription_type_ids'))
                ]);
                
                $validated = $request->validate([
                    'name_ar' => 'required|string|max:255',
                    'name_en' => 'required|string|max:255',
                    'description_ar' => 'nullable|string',
                    'description_en' => 'nullable|string',
                    'price' => 'nullable|numeric|min:0',
                    'meal_type' => 'required|in:breakfast,lunch,dinner',
                    'delivery_time' => 'required|date_format:H:i',
                    'is_available' => 'nullable|in:true,false,1,0',
                    'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                    'subscription_type_ids' => 'nullable|string',
                ]);
                
                Log::info('MealController@store: تم التحقق من البيانات بنجاح', [
                    'validated_data' => $validated,
                    'validated_data_types' => array_map('gettype', $validated)
                ]);
                
                // معالجة subscription_type_ids إذا كان string
                if (isset($validated['subscription_type_ids']) && is_string($validated['subscription_type_ids'])) {
                    Log::info('MealController@store: معالجة subscription_type_ids', [
                        'original_value' => $validated['subscription_type_ids'],
                        'original_type' => gettype($validated['subscription_type_ids'])
                    ]);
                    $decodedIds = json_decode($validated['subscription_type_ids'], true) ?? [];
                    // تحويل إلى array للاعتماد على Laravel's automatic casting
                    $validated['subscription_type_ids'] = $decodedIds;
                    Log::info('MealController@store: بعد معالجة subscription_type_ids', [
                        'decoded_value' => $decodedIds,
                        'final_value' => $validated['subscription_type_ids'],
                        'final_type' => gettype($validated['subscription_type_ids']),
                        'is_array' => is_array($decodedIds)
                    ]);
                }
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('MealController@store: خطأ في التحقق من البيانات', [
                    'user_id' => $request->user()->id,
                    'restaurant_id' => $restaurantId,
                    'validation_errors' => $e->errors(),
                    'request_data' => $request->all()
                ]);
                throw $e;
            }

            // تحويل is_available إلى boolean
            if (isset($validated['is_available'])) {
                $validated['is_available'] = in_array($validated['is_available'], ['true', '1', 1, true]);
            } else {
                $validated['is_available'] = true; // القيمة الافتراضية
            }

            // تعيين السعر كصفر دائماً (النظام يعتمد على سعر الاشتراك)
            $validated['price'] = 0.00;

            // معالجة subscription_type_ids - تحويل إلى array للاعتماد على Laravel's automatic casting
            if (isset($validated['subscription_type_ids'])) {
                if (is_string($validated['subscription_type_ids'])) {
                    // إذا كان string، تحقق من أنه JSON صحيح
                    $decodedIds = json_decode($validated['subscription_type_ids'], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedIds)) {
                        $validated['subscription_type_ids'] = $decodedIds; // تحويل إلى array
                    } else {
                        $validated['subscription_type_ids'] = [];
                    }
                } elseif (is_array($validated['subscription_type_ids'])) {
                    $validated['subscription_type_ids'] = $validated['subscription_type_ids']; // احتفظ بالـ array
                }
            }

            // تحويل وقت التوصيل إلى تنسيق 24 ساعة إذا كان في تنسيق 12 ساعة
            if (isset($validated['delivery_time'])) {
                $time = $validated['delivery_time'];
                // إذا كان الوقت في تنسيق 12 ساعة (مثل "01:20 PM")
                if (preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $time, $matches)) {
                    $hour = (int)$matches[1];
                    $minute = $matches[2];
                    $period = strtoupper($matches[3]);
                    
                    if ($period === 'PM' && $hour !== 12) {
                        $hour += 12;
                    } elseif ($period === 'AM' && $hour === 12) {
                        $hour = 0;
                    }
                    
                    $validated['delivery_time'] = sprintf('%02d:%s', $hour, $minute);
                }
            }

            // التحقق من أن أنواع الاشتراكات تنتمي للمطعم نفسه
            if (isset($validated['subscription_type_ids']) && is_array($validated['subscription_type_ids']) && !empty($validated['subscription_type_ids'])) {
                // التحقق من وجود subscription types في قاعدة البيانات
                $existingSubscriptionTypes = \App\Models\SubscriptionType::whereIn('id', $validated['subscription_type_ids'])->pluck('id')->toArray();
                
                if (count($existingSubscriptionTypes) !== count($validated['subscription_type_ids'])) {
                    $missingTypes = array_diff($validated['subscription_type_ids'], $existingSubscriptionTypes);
                    return response()->json([
                        'message' => 'بعض أنواع الاشتراكات المختارة غير موجودة في قاعدة البيانات',
                        'errors' => ['subscription_type_ids' => ['أنواع الاشتراكات المختارة غير موجودة: ' . implode(', ', $missingTypes)]]
                    ], 422);
                }
                
                // التحقق من أن أنواع الاشتراكات تنتمي للمطعم نفسه (اختياري)
                $restaurantSubscriptionTypes = $restaurant->subscriptionTypes()->pluck('subscription_types.id')->toArray();
                
                // إذا لم يكن هناك subscription types مرتبطة بالمطعم، نسمح بجميع الـ IDs
                if (empty($restaurantSubscriptionTypes)) {
                    Log::info('MealController@store: لا توجد subscription types مرتبطة بالمطعم، السماح بجميع الـ IDs', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'subscription_type_ids' => $validated['subscription_type_ids']
                    ]);
                } else {
                    $invalidTypes = array_diff($validated['subscription_type_ids'], $restaurantSubscriptionTypes);
                    
                    if (!empty($invalidTypes)) {
                        Log::warning('MealController@store: بعض أنواع الاشتراكات لا تنتمي للمطعم، ولكن السماح بها', [
                            'user_id' => $request->user()->id,
                            'restaurant_id' => $restaurantId,
                            'subscription_type_ids' => $validated['subscription_type_ids'],
                            'restaurant_subscription_types' => $restaurantSubscriptionTypes,
                            'invalid_types' => $invalidTypes
                        ]);
                        // نسمح بجميع الـ IDs حتى لو لم تكن مرتبطة بالمطعم
                    }
                }
            }

            Log::info('MealController@store: تم التحقق من البيانات بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'validated_data' => $validated
            ]);

            // رفع الصورة إذا تم توفيرها
            if ($request->hasFile('image')) {
                try {
                    Log::info('MealController@store: بدء رفع الصورة', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'original_name' => $request->file('image')->getClientOriginalName(),
                        'mime_type' => $request->file('image')->getMimeType(),
                        'size' => $request->file('image')->getSize()
                    ]);

                    $imagePath = $request->file('image')->store('meals/images', 'public');
                    $validated['image'] = $imagePath;

                    // مزامنة الملفات مع مجلد public
                    exec('php ' . base_path('sync_storage.php'));

                    Log::info('MealController@store: تم رفع الصورة بنجاح', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'image_path' => $imagePath
                    ]);
                } catch (\Exception $e) {
                    Log::error('MealController@store: خطأ في رفع الصورة', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }

            // إضافة restaurant_id تلقائياً
            $validated['restaurant_id'] = $restaurant->id;

            Log::info('MealController@store: بدء إنشاء الوجبة في قاعدة البيانات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_data' => $validated,
                'meal_data_types' => array_map('gettype', $validated),
                'meal_data_keys' => array_keys($validated)
            ]);

            try {
                $meal = Meal::create($validated);
                Log::info('MealController@store: تم إنشاء الوجبة بنجاح - في try block', [
                    'meal_id' => $meal->id,
                    'meal_data' => $meal->toArray()
                ]);
            } catch (\Exception $e) {
                Log::error('MealController@store: خطأ في إنشاء الوجبة', [
                    'error_message' => $e->getMessage(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine(),
                    'error_trace' => $e->getTraceAsString(),
                    'data_attempted' => $validated,
                    'data_attempted_types' => array_map('gettype', $validated)
                ]);
                throw $e;
            }

            Log::info('MealController@store: تم إنشاء الوجبة بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $meal->id,
                'meal_name' => $meal->name_ar,
                'subscription_type_ids' => $meal->subscription_type_ids,
                'linked_subscription_types_count' => $meal->linked_subscription_types->count()
            ]);

            // إعادة تحميل الوجبة للتأكد من الحصول على أحدث البيانات
            $meal->refresh();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الوجبة بنجاح',
                'data' => $meal,
                'debug_info' => [
                    'meal_created' => true,
                    'meal_id' => $meal->id,
                    'final_data_types' => array_map('gettype', $validated),
                    'subscription_type_ids' => $meal->subscription_type_ids,
                    'linked_subscription_types_count' => $meal->linked_subscription_types->count(),
                    'linked_subscription_types' => $meal->linked_subscription_types->toArray()
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('MealController@store: خطأ في التحقق من البيانات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'validation_errors' => $e->errors(),
                'request_data' => $request->except(['image'])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors(),
                'debug_info' => [
                    'validation_failed' => true,
                    'request_data' => $request->all(),
                    'request_data_types' => array_map('gettype', $request->all()),
                    'validation_errors' => $e->errors()
                ]
            ], 422);

        } catch (\Exception $e) {
            Log::error('MealController@store: خطأ في إنشاء الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_code' => $e->getCode(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['image']),
                'request_all' => $request->all(),
                'request_method' => $request->method(),
                'request_headers' => $request->headers->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في إنشاء الوجبة',
                'debug_info' => [
                    'exception_occurred' => true,
                    'error_message' => $e->getMessage(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine(),
                    'request_data' => $request->all()
                ]
            ], 500);
        }
    }

    /**
     * تحديث وجبة
     */
    public function update(Request $request, $restaurantId, $mealId)
    {
        try {
            Log::info('MealController@update: بدء تحديث الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'request_data' => $request->except(['image']),
                'has_image' => $request->hasFile('image')
            ]);

            $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
            $meal = $restaurant->meals()->findOrFail($mealId);

            Log::info('MealController@update: تم العثور على الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'meal_name' => $meal->name_ar
            ]);

            $validated = $request->validate([
                'name_ar' => 'sometimes|required|string|max:255',
                'name_en' => 'sometimes|required|string|max:255',
                'description_ar' => 'nullable|string',
                'description_en' => 'nullable|string',
                'price' => 'nullable|numeric|min:0',
                'meal_type' => 'sometimes|required|in:breakfast,lunch,dinner',
                'delivery_time' => 'sometimes|required|date_format:H:i',
                'is_available' => 'nullable|boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'subscription_type_ids' => 'nullable|string'
            ]);

            // تحويل is_available إلى boolean
            if (isset($validated['is_available'])) {
                $validated['is_available'] = in_array($validated['is_available'], ['true', '1', 1, true]);
            } else {
                $validated['is_available'] = true; // القيمة الافتراضية
            }

            // تعيين السعر كصفر دائماً (النظام يعتمد على سعر الاشتراك)
            $validated['price'] = 0.00;

            // معالجة subscription_type_ids - تحويل إلى array للاعتماد على Laravel's automatic casting
            if (isset($validated['subscription_type_ids'])) {
                if (is_string($validated['subscription_type_ids'])) {
                    // إذا كان string، تحقق من أنه JSON صحيح
                    $decodedIds = json_decode($validated['subscription_type_ids'], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedIds)) {
                        $validated['subscription_type_ids'] = $decodedIds; // تحويل إلى array
                    } else {
                        $validated['subscription_type_ids'] = [];
                    }
                } elseif (is_array($validated['subscription_type_ids'])) {
                    $validated['subscription_type_ids'] = $validated['subscription_type_ids']; // احتفظ بالـ array
                }
            }

            // تحويل وقت التوصيل إلى تنسيق 24 ساعة إذا كان في تنسيق 12 ساعة
            if (isset($validated['delivery_time'])) {
                $time = $validated['delivery_time'];
                // إذا كان الوقت في تنسيق 12 ساعة (مثل "01:20 PM")
                if (preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $time, $matches)) {
                    $hour = (int)$matches[1];
                    $minute = $matches[2];
                    $period = strtoupper($matches[3]);
                    
                    if ($period === 'PM' && $hour !== 12) {
                        $hour += 12;
                    } elseif ($period === 'AM' && $hour === 12) {
                        $hour = 0;
                    }
                    
                    $validated['delivery_time'] = sprintf('%02d:%s', $hour, $minute);
                }
            }

            // التحقق من أن أنواع الاشتراكات تنتمي للمطعم نفسه
            if (isset($validated['subscription_type_ids']) && is_array($validated['subscription_type_ids']) && !empty($validated['subscription_type_ids'])) {
                // التحقق من وجود subscription types في قاعدة البيانات
                $existingSubscriptionTypes = \App\Models\SubscriptionType::whereIn('id', $validated['subscription_type_ids'])->pluck('id')->toArray();
                
                if (count($existingSubscriptionTypes) !== count($validated['subscription_type_ids'])) {
                    $missingTypes = array_diff($validated['subscription_type_ids'], $existingSubscriptionTypes);
                    return response()->json([
                        'message' => 'بعض أنواع الاشتراكات المختارة غير موجودة في قاعدة البيانات',
                        'errors' => ['subscription_type_ids' => ['أنواع الاشتراكات المختارة غير موجودة: ' . implode(', ', $missingTypes)]]
                    ], 422);
                }
                
                // التحقق من أن أنواع الاشتراكات تنتمي للمطعم نفسه (اختياري)
                $restaurantSubscriptionTypes = $restaurant->subscriptionTypes()->pluck('subscription_types.id')->toArray();
                
                // إذا لم يكن هناك subscription types مرتبطة بالمطعم، نسمح بجميع الـ IDs
                if (empty($restaurantSubscriptionTypes)) {
                    Log::info('MealController@store: لا توجد subscription types مرتبطة بالمطعم، السماح بجميع الـ IDs', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'subscription_type_ids' => $validated['subscription_type_ids']
                    ]);
                } else {
                    $invalidTypes = array_diff($validated['subscription_type_ids'], $restaurantSubscriptionTypes);
                    
                    if (!empty($invalidTypes)) {
                        Log::warning('MealController@store: بعض أنواع الاشتراكات لا تنتمي للمطعم، ولكن السماح بها', [
                            'user_id' => $request->user()->id,
                            'restaurant_id' => $restaurantId,
                            'subscription_type_ids' => $validated['subscription_type_ids'],
                            'restaurant_subscription_types' => $restaurantSubscriptionTypes,
                            'invalid_types' => $invalidTypes
                        ]);
                        // نسمح بجميع الـ IDs حتى لو لم تكن مرتبطة بالمطعم
                    }
                }
            }

            Log::info('MealController@update: تم التحقق من البيانات بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'validated_data' => $validated
            ]);

            // رفع صورة جديدة إذا تم توفيرها
            if ($request->hasFile('image')) {
                try {
                    Log::info('MealController@update: بدء معالجة الصورة الجديدة', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'meal_id' => $mealId,
                        'old_image' => $meal->image,
                        'new_image_original_name' => $request->file('image')->getClientOriginalName()
                    ]);

                    // حذف الصورة القديمة
                    if ($meal->image && Storage::disk('public')->exists($meal->image)) {
                        Storage::disk('public')->delete($meal->image);
                        Log::info('MealController@update: تم حذف الصورة القديمة', [
                            'user_id' => $request->user()->id,
                            'restaurant_id' => $restaurantId,
                            'meal_id' => $mealId,
                            'deleted_image' => $meal->image
                        ]);
                    }
                    
                    $imagePath = $request->file('image')->store('meals/images', 'public');
                    $validated['image'] = $imagePath;

                    // مزامنة الملفات مع مجلد public
                    exec('php ' . base_path('sync_storage.php'));

                    Log::info('MealController@update: تم رفع الصورة الجديدة بنجاح', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'meal_id' => $mealId,
                        'new_image_path' => $imagePath
                    ]);
                } catch (\Exception $e) {
                    Log::error('MealController@update: خطأ في معالجة الصورة', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'meal_id' => $mealId,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }

            Log::info('MealController@update: بدء تحديث الوجبة في قاعدة البيانات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'update_data' => $validated
            ]);

            $meal->update($validated);

            Log::info('MealController@update: تم تحديث الوجبة بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'meal_name' => $meal->name_ar,
                'subscription_type_ids' => $meal->subscription_type_ids,
                'linked_subscription_types_count' => $meal->linked_subscription_types->count()
            ]);

            // إعادة تحميل الوجبة للتأكد من الحصول على أحدث البيانات
            $meal->refresh();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الوجبة بنجاح',
                'data' => $meal,
                'debug_info' => [
                    'subscription_type_ids' => $meal->subscription_type_ids,
                    'linked_subscription_types_count' => $meal->linked_subscription_types->count(),
                    'linked_subscription_types' => $meal->linked_subscription_types->toArray()
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('MealController@update: خطأ في التحقق من البيانات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'validation_errors' => $e->errors(),
                'request_data' => $request->except(['image'])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('MealController@update: خطأ في تحديث الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['image'])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث الوجبة'
            ], 500);
        }
    }

    /**
     * حذف وجبة
     */
    public function destroy(Request $request, $restaurantId, $mealId)
    {
        try {
            Log::info('MealController@destroy: بدء حذف الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId
            ]);

            $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
            $meal = $restaurant->meals()->findOrFail($mealId);

            Log::info('MealController@destroy: تم العثور على الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'meal_name' => $meal->name_ar,
                'has_image' => !empty($meal->image)
            ]);

            // حذف الصورة إذا كانت موجودة
            if ($meal->image && Storage::disk('public')->exists($meal->image)) {
                try {
                    Storage::disk('public')->delete($meal->image);
                    Log::info('MealController@destroy: تم حذف صورة الوجبة', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'meal_id' => $mealId,
                        'deleted_image' => $meal->image
                    ]);
                } catch (\Exception $e) {
                    Log::warning('MealController@destroy: خطأ في حذف صورة الوجبة', [
                        'user_id' => $request->user()->id,
                        'restaurant_id' => $restaurantId,
                        'meal_id' => $mealId,
                        'image_path' => $meal->image,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('MealController@destroy: بدء حذف الوجبة من قاعدة البيانات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId
            ]);

            $meal->delete(); // This will now use soft delete

            Log::info('MealController@destroy: تم حذف الوجبة بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'meal_name' => $meal->name_ar
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الوجبة بنجاح'
            ]);

        } catch (\Exception $e) {
            Log::error('MealController@destroy: خطأ في حذف الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف الوجبة'
            ], 500);
        }
    }

    /**
     * تفعيل/إلغاء تفعيل وجبة
     */
    public function toggleAvailability(Request $request, $restaurantId, $mealId)
    {
        try {
            Log::info('MealController@toggleAvailability: بدء تغيير حالة الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId
            ]);

            $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);
            $meal = $restaurant->meals()->findOrFail($mealId);

            Log::info('MealController@toggleAvailability: تم العثور على الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'meal_name' => $meal->name_ar,
                'current_status' => $meal->is_available
            ]);
            
            $newStatus = !$meal->is_available;
            
            $meal->update([
                'is_available' => $newStatus
            ]);

            Log::info('MealController@toggleAvailability: تم تغيير حالة الوجبة بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'meal_name' => $meal->name_ar,
                'old_status' => !$newStatus,
                'new_status' => $newStatus
            ]);

            return response()->json([
                'success' => true,
                'message' => $meal->is_available ? 'تم تفعيل الوجبة' : 'تم إلغاء تفعيل الوجبة',
                'data' => $meal
            ]);

        } catch (\Exception $e) {
            Log::error('MealController@toggleAvailability: خطأ في تغيير حالة الوجبة', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'meal_id' => $mealId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تغيير حالة الوجبة'
            ], 500);
        }
    }

    /**
     * إحصائيات الوجبات لمطعم محدد
     */
    public function stats(Request $request, $restaurantId)
    {
        try {
            Log::info('MealController@stats: بدء جلب إحصائيات الوجبات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId
            ]);

            $restaurant = $request->user()->restaurants()->findOrFail($restaurantId);

            $stats = [
                'total_meals' => $restaurant->meals()->count(),
                'active_meals' => $restaurant->meals()->where('is_available', true)->count(),
                'breakfast_meals' => $restaurant->meals()->where('meal_type', 'breakfast')->count(),
                'lunch_meals' => $restaurant->meals()->where('meal_type', 'lunch')->count(),
                'dinner_meals' => $restaurant->meals()->where('meal_type', 'dinner')->count(),
                'average_price' => $restaurant->meals()->avg('price'),
            ];

            Log::info('MealController@stats: تم جلب الإحصائيات بنجاح', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'stats' => $stats
            ]);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('MealController@stats: خطأ في جلب إحصائيات الوجبات', [
                'user_id' => $request->user()->id,
                'restaurant_id' => $restaurantId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الإحصائيات'
            ], 500);
        }
    }
}
