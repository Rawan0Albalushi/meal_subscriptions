<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name_ar',
        'name_en',
        'description_ar',
        'description_en',
        'type',
        'price',
        'delivery_price',
        'admin_commission',
        'meals_count',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'delivery_price' => 'decimal:2',
        'admin_commission' => 'decimal:2',
        'meals_count' => 'integer',
        'is_active' => 'boolean',
    ];

    public function restaurants()
    {
        return $this->belongsToMany(Restaurant::class, 'restaurant_subscription_type');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function getNameAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    }

    public function getDescriptionAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->description_ar : $this->description_en;
    }

    public function getTypeTextAttribute()
    {
        $types = [
            'weekly' => ['ar' => 'أسبوعي', 'en' => 'Weekly'],
            'monthly' => ['ar' => 'شهري', 'en' => 'Monthly'],
        ];

        return $types[$this->type][app()->getLocale()] ?? $this->type;
    }

    public function getTotalWithDeliveryAttribute()
    {
        return $this->price + $this->delivery_price;
    }

    public function getDeliveryPriceTextAttribute()
    {
        if ($this->delivery_price > 0) {
            return $this->delivery_price . ' ' . (app()->getLocale() === 'ar' ? 'ريال' : 'OMR');
        }
        return app()->getLocale() === 'ar' ? 'مجاني' : 'Free';
    }

    public function getCommissionAmountAttribute()
    {
        if (!$this->admin_commission) {
            return 0;
        }
        // النسبة تحسب من سعر الاشتراك بدون التوصيل
        $subscriptionPriceWithoutDelivery = $this->price - $this->delivery_price;
        return ($subscriptionPriceWithoutDelivery * $this->admin_commission) / 100;
    }

    public function getMerchantAmountAttribute()
    {
        $subscriptionPriceWithoutDelivery = $this->price - $this->delivery_price;
        return $subscriptionPriceWithoutDelivery - $this->commission_amount;
    }

    public function getCommissionPercentageTextAttribute()
    {
        if (!$this->admin_commission) {
            return app()->getLocale() === 'ar' ? 'غير محدد' : 'Not Set';
        }
        return $this->admin_commission . '%';
    }
}
