<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentSession;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Restaurant;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Debug logging
            \Log::info('Admin Payments API called', [
                'request_params' => $request->all(),
                'user_id' => auth()->id()
            ]);

            $query = PaymentSession::with([
                'user:id,name,email'
            ]);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('gateway_name', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by payment method (gateway)
            if ($request->has('payment_method') && $request->payment_method !== 'all') {
                $query->where('gateway_name', $request->payment_method);
            }

            // Filter by user
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by restaurant (simplified - will be handled in frontend for now)
            // if ($request->has('restaurant_id') && $request->restaurant_id) {
            //     $query->whereHas('model', function ($modelQuery) use ($request) {
            //         if ($request->restaurant_id) {
            //             $modelQuery->where('restaurant_id', $request->restaurant_id);
            //         }
            //     });
            // }

            // Filter by amount range
            if ($request->has('amount_from') && $request->amount_from) {
                $query->where('amount', '>=', $request->amount_from);
            }

            if ($request->has('amount_to') && $request->amount_to) {
                $query->where('amount', '<=', $request->amount_to);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $payments = $query->orderBy('created_at', 'desc')->paginate(20);

            // Debug logging
            \Log::info('Payments query results', [
                'total_payments' => $payments->total(),
                'current_page' => $payments->currentPage(),
                'per_page' => $payments->perPage(),
                'last_page' => $payments->lastPage(),
                'items_count' => $payments->count()
            ]);


            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching payments', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_params' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب المدفوعات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $payment = PaymentSession::with(['user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'المدفوعة غير موجودة',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $payment = PaymentSession::findOrFail($id);

            $request->validate([
                'status' => 'required|in:pending,paid,failed,expired',
                'notes' => 'nullable|string|max:1000'
            ]);

            $payment->update([
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المدفوعة بنجاح',
                'data' => $payment->load(['user'])
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
                'message' => 'حدث خطأ في تحديث المدفوعة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function refund(Request $request, $id)
    {
        try {
            $payment = PaymentSession::findOrFail($id);

            if ($payment->status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن استرداد المدفوعات غير المكتملة'
                ], 400);
            }

            $request->validate([
                'refund_amount' => 'required|numeric|min:0.01|max:' . $payment->amount,
                'refund_reason' => 'required|string|max:500'
            ]);

            // Update payment status to refunded
            $payment->update([
                'status' => 'refunded'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم استرداد المدفوعة بنجاح',
                'data' => $payment
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
                'message' => 'حدث خطأ في استرداد المدفوعة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatistics()
    {
        try {
            \Log::info('Fetching payment statistics');

            $stats = [
                'totalPayments' => PaymentSession::count(),
                'completedPayments' => PaymentSession::where('status', 'paid')->count(),
                'pendingPayments' => PaymentSession::where('status', 'pending')->count(),
                'failedPayments' => PaymentSession::where('status', 'failed')->count(),
                'refundedPayments' => PaymentSession::where('status', 'refunded')->count(),
                'todayPayments' => PaymentSession::whereDate('created_at', Carbon::today())->count(),
                'monthlyPayments' => PaymentSession::whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)->count(),
                'totalAmount' => PaymentSession::where('status', 'paid')->sum('amount'),
                'monthlyAmount' => PaymentSession::where('status', 'paid')
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->sum('amount'),
                'totalRefunded' => PaymentSession::where('status', 'refunded')->sum('amount'),
                'averagePayment' => PaymentSession::where('status', 'paid')->avg('amount'),
            ];

            \Log::info('Payment statistics calculated', $stats);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching payment statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب إحصائيات المدفوعات',
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

    public function getPaymentMethods()
    {
        try {
            $paymentMethods = [
                ['value' => 'thawani', 'label_ar' => 'ثواني', 'label_en' => 'Thawani'],
                ['value' => 'bank_transfer', 'label_ar' => 'تحويل بنكي', 'label_en' => 'Bank Transfer'],
                ['value' => 'cash', 'label_ar' => 'نقدي', 'label_en' => 'Cash'],
            ];

            return response()->json([
                'success' => true,
                'data' => $paymentMethods
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب طرق الدفع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatusOptions()
    {
        try {
            $statusOptions = [
                ['value' => 'pending', 'label_ar' => 'في الانتظار', 'label_en' => 'Pending'],
                ['value' => 'completed', 'label_ar' => 'مكتمل', 'label_en' => 'Completed'],
                ['value' => 'failed', 'label_ar' => 'فاشل', 'label_en' => 'Failed'],
                ['value' => 'refunded', 'label_ar' => 'مسترد', 'label_en' => 'Refunded'],
            ];

            return response()->json([
                'success' => true,
                'data' => $statusOptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب خيارات الحالة',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
