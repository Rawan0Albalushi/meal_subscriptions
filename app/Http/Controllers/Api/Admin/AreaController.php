<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AreaController extends Controller
{
    /**
     * عرض جميع المناطق
     */
    public function index(): JsonResponse
    {
        $areas = Area::orderBy('sort_order')
            ->orderBy('name_ar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $areas,
            'message' => 'تم جلب المناطق بنجاح'
        ]);
    }

    /**
     * عرض منطقة محددة
     */
    public function show($id): JsonResponse
    {
        $area = Area::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $area,
            'message' => 'تم جلب المنطقة بنجاح'
        ]);
    }

    /**
     * إنشاء منطقة جديدة
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:areas,code',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $area = Area::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $area,
            'message' => 'تم إنشاء المنطقة بنجاح'
        ], 201);
    }

    /**
     * تحديث منطقة موجودة
     */
    public function update(Request $request, $id): JsonResponse
    {
        $area = Area::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:areas,code,' . $id,
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        $area->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $area,
            'message' => 'تم تحديث المنطقة بنجاح'
        ]);
    }

    /**
     * حذف منطقة
     */
    public function destroy($id): JsonResponse
    {
        $area = Area::findOrFail($id);

        // التحقق من وجود عناوين مرتبطة بهذه المنطقة
        if ($area->restaurantAddresses()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف هذه المنطقة لوجود عناوين مرتبطة بها'
            ], 400);
        }

        $area->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنطقة بنجاح'
        ]);
    }

    /**
     * الحصول على المناطق النشطة فقط
     */
    public function getActiveAreas(): JsonResponse
    {
        $areas = Area::getActiveAreas();

        return response()->json([
            'success' => true,
            'data' => $areas,
            'message' => 'تم جلب المناطق النشطة بنجاح'
        ]);
    }

    /**
     * الحصول على المناطق بصيغة API (للتوافق مع الكود القديم)
     */
    public function getAreasForApi(): JsonResponse
    {
        $areas = Area::getAreasForApi();

        return response()->json([
            'success' => true,
            'data' => $areas,
            'message' => 'تم جلب المناطق بنجاح'
        ]);
    }
}