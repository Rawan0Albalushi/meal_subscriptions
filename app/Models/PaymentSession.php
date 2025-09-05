<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PaymentSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'user_id',
        'model_type',
        'model_id',
        'gateway_name',
        'amount',
        'currency',
        'status',
        'payment_link',
        'gateway_data',
        'expires_at',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_data' => 'array',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Get the user that owns the payment session
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the model that owns the payment session
     */
    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the payment transactions for this session
     */
    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class, 'payment_session_id', 'id');
    }

    /**
     * Check if the payment session is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the payment session is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Check if the payment session is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Get the status text in Arabic
     */
    public function getStatusTextAttribute(): string
    {
        $statuses = [
            'pending' => 'في الانتظار',
            'paid' => 'مدفوع',
            'failed' => 'فشل',
            'expired' => 'منتهي الصلاحية',
        ];

        return $statuses[$this->status] ?? $this->status;
    }
}

