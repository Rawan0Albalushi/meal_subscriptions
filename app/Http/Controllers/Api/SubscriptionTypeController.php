<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionType;
use Illuminate\Http\Request;

class SubscriptionTypeController extends Controller
{
    public function index()
    {
        $subscriptionTypes = SubscriptionType::where('is_active', true)
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
}
