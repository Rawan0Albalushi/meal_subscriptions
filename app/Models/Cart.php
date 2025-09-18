<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'subscription_type_id',
        'delivery_address_id',
        'start_date',
        'special_instructions',
        'subscription_price',
        'delivery_price',
        'total_amount',
    ];

    protected $casts = [
        'start_date' => 'date',
        'subscription_price' => 'decimal:2',
        'delivery_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    protected $appends = ['total_with_delivery', 'items_count'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function subscriptionType()
    {
        return $this->belongsTo(SubscriptionType::class);
    }

    public function deliveryAddress()
    {
        return $this->belongsTo(DeliveryAddress::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function getTotalWithDeliveryAttribute()
    {
        return $this->subscription_price + $this->delivery_price;
    }

    public function getItemsCountAttribute()
    {
        return $this->cartItems()->count();
    }

    public function calculateTotal()
    {
        // Calculate total based on subscription price instead of individual meal prices
        $this->total_amount = $this->subscription_price + $this->delivery_price;
        $this->save();
        return $this->total_amount;
    }
}
