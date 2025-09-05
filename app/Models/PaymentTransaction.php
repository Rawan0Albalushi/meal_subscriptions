<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_session_id',
        'model_type',
        'model_id',
        'amount',
        'currency',
        'gateway_name',
        'gateway_transaction_id',
        'status',
        'gateway_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
    ];

    /**
     * Get the payment session that owns the transaction
     */
    public function paymentSession(): BelongsTo
    {
        return $this->belongsTo(PaymentSession::class, 'payment_session_id', 'id');
    }

    /**
     * Get the model that owns the transaction
     */
    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the status text in Arabic
     */
    public function getStatusTextAttribute(): string
    {
        $statuses = [
            'pending' => 'في الانتظار',
            'completed' => 'مكتمل',
            'failed' => 'فشل',
            'refunded' => 'مسترد',
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Check if the transaction is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the transaction is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}

