<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'delivery_address_id',
        'subscription_type_id',
        'subscription_type',
        'start_date',
        'end_date',
        'total_amount',
        'delivery_price',
        'status',
        'payment_status',
        'transaction_id',
        'special_instructions',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
        'delivery_price' => 'decimal:2',
    ];

    protected $appends = ['subscription_type_text', 'status_text', 'total_with_delivery', 'items'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function deliveryAddress()
    {
        return $this->belongsTo(DeliveryAddress::class);
    }

    public function subscriptionItems()
    {
        return $this->hasMany(SubscriptionItem::class);
    }

    public function subscriptionType()
    {
        return $this->belongsTo(SubscriptionType::class);
    }

    public function getSubscriptionTypeTextAttribute()
    {
        $types = [
            'weekly' => ['ar' => 'أسبوعي', 'en' => 'Weekly'],
            'monthly' => ['ar' => 'شهري', 'en' => 'Monthly'],
        ];

        return $types[$this->subscription_type][app()->getLocale()] ?? $this->subscription_type;
    }

    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => ['ar' => 'في الانتظار', 'en' => 'Pending'],
            'active' => ['ar' => 'نشط', 'en' => 'Active'],
            'completed' => ['ar' => 'مكتمل', 'en' => 'Completed'],
            'cancelled' => ['ar' => 'ملغي', 'en' => 'Cancelled'],
        ];

        return $statuses[$this->status][app()->getLocale()] ?? $this->status;
    }

    public function getTotalWithDeliveryAttribute()
    {
        return $this->total_amount + $this->delivery_price;
    }

    public function getItemsAttribute()
    {
        return $this->subscriptionItems;
    }
}
