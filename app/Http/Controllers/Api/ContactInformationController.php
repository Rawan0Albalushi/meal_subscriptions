<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInformation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactInformationController extends Controller
{
    /**
     * Get contact information
     */
    public function index()
    {
        try {
            $contactInfo = ContactInformation::where('is_active', true)->first();
            
            if (!$contactInfo) {
                // Return default values if no record exists
                return response()->json([
                    'success' => true,
                    'data' => [
                        'phone' => '+968 9999 9999',
                        'email' => 'info@mealsubscriptions.om'
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'phone' => $contactInfo->phone,
                    'email' => $contactInfo->email
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching contact information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update contact information (Admin only)
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $contactInfo = ContactInformation::where('is_active', true)->first();
            
            if (!$contactInfo) {
                $contactInfo = new ContactInformation();
            }

            $contactInfo->phone = $request->phone;
            $contactInfo->email = $request->email;
            $contactInfo->is_active = true;
            $contactInfo->save();

            return response()->json([
                'success' => true,
                'message' => 'Contact information updated successfully',
                'data' => [
                    'phone' => $contactInfo->phone,
                    'email' => $contactInfo->email
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating contact information',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
