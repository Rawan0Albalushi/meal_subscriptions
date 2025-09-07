<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAddress;
use Illuminate\Http\Request;

class DeliveryAddressController extends Controller
{
    public function index()
    {
        $addresses = DeliveryAddress::where('user_id', auth()->id())
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'postal_code' => 'nullable|string|max:20',
            'additional_notes' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        // If this is the first address or marked as default, unset other defaults
        if ($request->is_default || DeliveryAddress::where('user_id', auth()->id())->count() === 0) {
            DeliveryAddress::where('user_id', auth()->id())->update(['is_default' => false]);
        }

        $address = DeliveryAddress::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'postal_code' => $request->postal_code,
            'additional_notes' => $request->additional_notes,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery address created successfully',
            'data' => $address
        ], 201);
    }

    public function show($id)
    {
        $address = DeliveryAddress::where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $address
        ]);
    }

    public function update(Request $request, $id)
    {
        $address = DeliveryAddress::where('user_id', auth()->id())
            ->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'postal_code' => 'nullable|string|max:20',
            'additional_notes' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        // If marked as default, unset other defaults
        if ($request->is_default) {
            DeliveryAddress::where('user_id', auth()->id())
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $address->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'postal_code' => $request->postal_code,
            'additional_notes' => $request->additional_notes,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery address updated successfully',
            'data' => $address
        ]);
    }

    public function destroy($id)
    {
        $address = DeliveryAddress::where('user_id', auth()->id())
            ->findOrFail($id);

        $address->delete(); // This will now use soft delete

        return response()->json([
            'success' => true,
            'message' => 'Delivery address deleted successfully'
        ]);
    }
}
