<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentSession;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Services\PaymentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function success(Request $request)
    {
        $subscriptionId = $request->subscription_id;
        
        if (!$subscriptionId) {
            return redirect('/payment/cancel')->with('error', 'Subscription ID is required');
        }
        
        // Find the payment session for this subscription
        $paymentSession = PaymentSession::where('model_type', Subscription::class)
            ->where('model_id', $subscriptionId)
            ->where('status', '!=', 'failed')
            ->latest()
            ->first();
        
        if (!$paymentSession) {
            return redirect('/payment/cancel')
                ->with('error', 'Payment session not found for this subscription');
        }
        
        $sessionId = $paymentSession->id;
        
        // Validate payment
        $validationResponse = $this->paymentService->validatePayment($sessionId);
        
        if (!$validationResponse->isValid) {
            Log::warning('Payment validation failed', [
                'session_id' => $sessionId,
                'subscription_id' => $subscriptionId,
                'status' => $validationResponse->status,
                'error' => $validationResponse->errorMessage
            ]);
            
            return redirect('/payment/cancel?subscription_id=' . $subscriptionId)
                ->with('error', $validationResponse->errorMessage ?? 'Payment validation failed');
        }

        // Process successful payment
        try {
            $this->processSuccessfulPayment($paymentSession, $validationResponse);
            
            return redirect('/payment/success?subscription_id=' . $subscriptionId)
                ->with('success', 'Payment completed successfully');
            
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'session_id' => $sessionId,
                'subscription_id' => $subscriptionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect('/payment/cancel?subscription_id=' . $subscriptionId)
                ->with('error', 'Payment processing failed. Please contact support.');
        }
    }

    public function cancel(Request $request)
    {
        $subscriptionId = $request->subscription_id;
        
        if ($subscriptionId) {
            try {
                DB::beginTransaction();
                
                // Find and update payment session status
                $paymentSession = PaymentSession::where('model_type', Subscription::class)
                    ->where('model_id', $subscriptionId)
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
                
                if ($paymentSession) {
                    $paymentSession->update(['status' => 'failed']);
                    Log::info('Payment cancelled by user', [
                        'session_id' => $paymentSession->id,
                        'subscription_id' => $subscriptionId
                    ]);
                }
                
                // Cancel the subscription
                $subscription = Subscription::find($subscriptionId);
                if ($subscription && $subscription->status === 'pending') {
                    $subscription->update([
                        'status' => 'cancelled',
                        'payment_status' => 'failed'
                    ]);
                    
                    Log::info('Subscription cancelled due to payment cancellation', [
                        'subscription_id' => $subscriptionId
                    ]);
                }
                
                DB::commit();
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error cancelling subscription', [
                    'subscription_id' => $subscriptionId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return redirect('/payment/cancel?subscription_id=' . $subscriptionId)
            ->with('info', 'Payment was cancelled');
    }

    public function webhook(Request $request)
    {
        $sessionId = $request->session_id ?? $request->payment_intent_id ?? $request->order_id;
        
        if (!$sessionId) {
            Log::warning('Webhook received without session ID', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            return response()->json(['error' => 'Session ID required'], 400);
        }

        Log::info('Payment webhook received', [
            'session_id' => $sessionId,
            'gateway' => $request->header('User-Agent', 'unknown')
        ]);

        // Validate payment
        $validationResponse = $this->paymentService->validatePayment($sessionId);
        
        if ($validationResponse->isValid) {
            $paymentSession = PaymentSession::where('id', $sessionId)->first();
            
            if ($paymentSession) {
                try {
                    $this->processSuccessfulPayment($paymentSession, $validationResponse);
                    Log::info('Webhook payment processed successfully', ['session_id' => $sessionId]);
                } catch (\Exception $e) {
                    Log::error('Webhook payment processing failed', [
                        'session_id' => $sessionId,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        return response()->json(['success' => true]);
    }

    public function checkStatus(Request $request, $subscriptionId)
    {
        if (!$subscriptionId) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription ID is required'
            ], 400);
        }

        // First, check if the subscription exists
        $subscription = Subscription::find($subscriptionId);
        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }

        // Find the latest payment session for this subscription
        $paymentSession = PaymentSession::where('model_type', Subscription::class)
            ->where('model_id', $subscriptionId)
            ->latest()
            ->first();
        
        if (!$paymentSession) {
            return response()->json([
                'success' => false,
                'message' => 'No payment session found for this subscription'
            ], 404);
        }

        // If payment session exists but is still pending, validate with the payment gateway
        if ($paymentSession->status === 'pending') {
            try {
                $validationResponse = $this->paymentService->validatePayment($paymentSession->id);
                
                // Update payment session with latest status
                $paymentSession->update([
                    'status' => $validationResponse->status,
                    'gateway_data' => array_merge($paymentSession->gateway_data, $validationResponse->gatewayData),
                    'paid_at' => $validationResponse->status === 'paid' ? now() : null
                ]);
                
                // Refresh the payment session data
                $paymentSession->refresh();
            } catch (\Exception $e) {
                Log::error('Payment validation failed during status check', [
                    'subscription_id' => $subscriptionId,
                    'session_id' => $paymentSession->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $paymentSession->id,
                'subscription_id' => $subscriptionId,
                'status' => $paymentSession->status,
                'amount' => $paymentSession->amount,
                'currency' => $paymentSession->currency,
                'gateway' => $paymentSession->gateway_name,
                'expires_at' => $paymentSession->expires_at,
                'paid_at' => $paymentSession->paid_at,
                'subscription_status' => $subscription->status,
                'payment_status' => $subscription->payment_status
            ]
        ]);
    }

    private function processSuccessfulPayment(PaymentSession $paymentSession, $validationResponse): void
    {
        try {
            DB::beginTransaction();

            // Get the subscription
            $subscription = Subscription::find($paymentSession->model_id);
            
            if (!$subscription) {
                throw new \Exception('Subscription not found');
            }

            // Update subscription status
            $subscription->update([
                'status' => 'active',
                'payment_status' => 'paid',
                'payment_confirmed_at' => now()
            ]);

            // Create subscription items
            $subscriptionData = $paymentSession->gateway_data['subscription_data'] ?? [];
            
            Log::info('Processing successful payment - subscription data', [
                'subscription_id' => $subscription->id,
                'gateway_data' => $paymentSession->gateway_data,
                'subscription_data' => $subscriptionData
            ]);
            
            $this->createSubscriptionItems($subscription, $subscriptionData);

            // Create transaction record
            PaymentTransaction::create([
                'payment_session_id' => $paymentSession->id,
                'model_type' => $paymentSession->model_type,
                'model_id' => $paymentSession->model_id,
                'amount' => $paymentSession->amount,
                'currency' => $paymentSession->currency,
                'gateway_name' => $paymentSession->gateway_name,
                'gateway_transaction_id' => $validationResponse->gatewayData['id'] ?? $validationResponse->gatewayData['transaction_id'] ?? null,
                'status' => 'completed',
                'gateway_response' => $validationResponse->gatewayData
            ]);

            // Send notifications
            $this->sendPaymentSuccessNotification($subscription);

            DB::commit();

            Log::info('Payment processed successfully', [
                'subscription_id' => $subscription->id,
                'payment_session_id' => $paymentSession->id,
                'amount' => $paymentSession->amount
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Payment processing failed', [
                'payment_session_id' => $paymentSession->id,
                'subscription_id' => $paymentSession->model_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function createSubscriptionItems(Subscription $subscription, array $subscriptionData): void
    {
        Log::info('Creating subscription items', [
            'subscription_id' => $subscription->id,
            'subscription_data' => $subscriptionData
        ]);

        $mealIds = $subscriptionData['meal_ids'] ?? [];
        $deliveryDays = $subscriptionData['delivery_days'] ?? [];
        $startDate = $subscriptionData['start_date'] ?? $subscription->start_date;

        Log::info('Subscription items data', [
            'meal_ids' => $mealIds,
            'delivery_days' => $deliveryDays,
            'start_date' => $startDate
        ]);

        $startDate = Carbon::parse($startDate);
        
        // Build items then sort ascending by delivery_date to ensure deterministic order
        $items = [];
        foreach ($deliveryDays as $index => $dayOfWeek) {
            $deliveryDate = $this->calculateDeliveryDate($startDate, $dayOfWeek);
            $mealId = $mealIds[$index] ?? null;
            if ($mealId) {
                $items[] = [
                    'meal_id' => $mealId,
                    'day_of_week' => $dayOfWeek,
                    'delivery_date' => $deliveryDate,
                ];
            }
        }

        usort($items, function ($a, $b) {
            return Carbon::parse($a['delivery_date'])->timestamp <=> Carbon::parse($b['delivery_date'])->timestamp;
        });

        foreach ($items as $idx => $item) {
            Log::info('Creating subscription item', [
                'index' => $idx,
                'day_of_week' => $item['day_of_week'],
                'meal_id' => $item['meal_id'],
                'delivery_date' => $item['delivery_date']
            ]);

            $created = SubscriptionItem::create([
                'subscription_id' => $subscription->id,
                'meal_id' => $item['meal_id'],
                'delivery_date' => $item['delivery_date'],
                'day_of_week' => $item['day_of_week'],
                'price' => 0,
                'status' => 'pending',
            ]);

            Log::info('Subscription item created', [
                'item_id' => $created->id,
                'subscription_id' => $subscription->id,
                'meal_id' => $item['meal_id']
            ]);
        }
    }

    private function calculateDeliveryDate(Carbon $startDate, string $dayOfWeek): Carbon
    {
        $dayIndex = [
            'sunday' => 0,
            'monday' => 1,
            'tuesday' => 2,
            'wednesday' => 3,
            'thursday' => 4,
            'friday' => 5,
            'saturday' => 6
        ];

        $targetDayIndex = $dayIndex[$dayOfWeek] ?? 0;
        $startDayIndex = $startDate->dayOfWeek;
        
        $daysToAdd = $targetDayIndex - $startDayIndex;
        
        // If the target day is before the start day, add 7 days
        if ($daysToAdd < 0) {
            $daysToAdd += 7;
        }
        
        return $startDate->copy()->addDays($daysToAdd);
    }

    private function sendPaymentSuccessNotification(Subscription $subscription): void
    {
        // TODO: Implement notification sending
        // This could include:
        // - Email notification to customer
        // - SMS notification
        // - Push notification
        // - Admin notification
        
        Log::info('Payment success notification sent', [
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id
        ]);
    }
}
