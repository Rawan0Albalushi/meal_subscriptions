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
        'total_amount',
        'delivery_price',
    ];

    protected $casts = [
        'start_date' => 'date',
        'total_amount' => 'decimal:2',
        'delivery_price' => 'decimal:2',
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
        return $this->total_amount + $this->delivery_price;
    }

    public function getItemsCountAttribute()
    {
        return $this->cartItems()->count();
    }

    public function calculateTotal()
    {
        $this->total_amount = $this->cartItems()->sum('price');
        $this->save();
        return $this->total_amount;
    }
}
