<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'delivery_address_id',
        'subscription_type',
        'start_date',
        'end_date',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'transaction_id',
        'special_instructions',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

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
}
