<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Meal;
use App\Models\Restaurant;
use App\Models\SubscriptionType;
use App\Models\DeliveryAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = Cart::where('user_id', auth()->id())
            ->with([
                'restaurant:id,name_ar,name_en,logo',
                'subscriptionType:id,name_ar,name_en,type',
                'deliveryAddress:id,name,phone,address,city',
                'cartItems.meal:id,name_ar,name_en,description_ar,description_en,image,meal_type'
            ])
            ->first();

        if (!$cart) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Cart is empty'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $cart
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_id' => 'required|exists:restaurants,id',
            'subscription_type_id' => 'required|exists:subscription_types,id',
            'delivery_address_id' => 'nullable|exists:delivery_addresses,id',
            'start_date' => 'nullable|date|after_or_equal:today',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = auth()->id();
        $restaurantId = $request->restaurant_id;
        $subscriptionTypeId = $request->subscription_type_id;

        // Check if cart already exists for this combination
        $cart = Cart::where([
            'user_id' => $userId,
            'restaurant_id' => $restaurantId,
            'subscription_type_id' => $subscriptionTypeId
        ])->first();

        if ($cart) {
            // Update existing cart
            $cart->update($request->only([
                'delivery_address_id',
                'start_date',
                'special_instructions'
            ]));
        } else {
            // Create new cart
            $cart = Cart::create([
                'user_id' => $userId,
                'restaurant_id' => $restaurantId,
                'subscription_type_id' => $subscriptionTypeId,
                'delivery_address_id' => $request->delivery_address_id,
                'start_date' => $request->start_date,
                'special_instructions' => $request->special_instructions,
                'total_amount' => 0,
                'delivery_price' => 0,
            ]);
        }

        $cart->load([
            'restaurant:id,name_ar,name_en,logo',
            'subscriptionType:id,name_ar,name_en,type',
            'deliveryAddress:id,name,phone,address,city',
        ]);

        return response()->json([
            'success' => true,
            'data' => $cart,
            'message' => 'Cart created/updated successfully'
        ]);
    }

    public function addItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_id' => 'required|exists:carts,id',
            'meal_id' => 'required|exists:meals,id',
            'delivery_date' => 'required|date|after_or_equal:today',
            'meal_type' => 'required|in:breakfast,lunch,dinner',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $cart = Cart::where('user_id', auth()->id())
            ->findOrFail($request->cart_id);

        $meal = Meal::findOrFail($request->meal_id);

        // Check if meal belongs to the same restaurant as cart
        if ($meal->restaurant_id !== $cart->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Meal does not belong to the selected restaurant'
            ], 400);
        }

        // Check if item already exists
        $existingItem = CartItem::where([
            'cart_id' => $cart->id,
            'meal_id' => $meal->id,
            'delivery_date' => $request->delivery_date,
            'meal_type' => $request->meal_type
        ])->first();

        if ($existingItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item already exists in cart for this date and meal type'
            ], 400);
        }

        // Create cart item
        $cartItem = CartItem::create([
            'cart_id' => $cart->id,
            'meal_id' => $meal->id,
            'delivery_date' => $request->delivery_date,
            'meal_type' => $request->meal_type,
            'price' => $meal->price,
        ]);

        // Store meal data snapshot
        $cartItem->storeMealData();

        // Update cart total
        $cart->calculateTotal();

        $cartItem->load('meal:id,name_ar,name_en,description_ar,description_en,image,meal_type');

        return response()->json([
            'success' => true,
            'data' => $cartItem,
            'message' => 'Item added to cart successfully'
        ]);
    }

    public function removeItem(Request $request, $itemId)
    {
        $cartItem = CartItem::whereHas('cart', function ($query) {
            $query->where('user_id', auth()->id());
        })->findOrFail($itemId);

        $cart = $cartItem->cart;
        $cartItem->delete();

        // Update cart total
        $cart->calculateTotal();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart successfully'
        ]);
    }

    public function clear()
    {
        $cart = Cart::where('user_id', auth()->id())->first();

        if ($cart) {
            $cart->cartItems()->delete();
            $cart->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully'
        ]);
    }

    public function updateDeliveryAddress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'delivery_address_id' => 'required|exists:delivery_addresses,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $cart = Cart::where('user_id', auth()->id())->firstOrFail();

        // Verify delivery address belongs to user
        $deliveryAddress = DeliveryAddress::where([
            'id' => $request->delivery_address_id,
            'user_id' => auth()->id()
        ])->firstOrFail();

        $cart->update([
            'delivery_address_id' => $deliveryAddress->id
        ]);

        $cart->load([
            'deliveryAddress:id,name,phone,address,city',
        ]);

        return response()->json([
            'success' => true,
            'data' => $cart,
            'message' => 'Delivery address updated successfully'
        ]);
    }

    public function updateSpecialInstructions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $cart = Cart::where('user_id', auth()->id())->firstOrFail();

        $cart->update([
            'special_instructions' => $request->special_instructions
        ]);

        return response()->json([
            'success' => true,
            'data' => $cart,
            'message' => 'Special instructions updated successfully'
        ]);
    }
}
