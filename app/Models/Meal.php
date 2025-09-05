<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meal extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'name_ar',
        'name_en',
        'description_ar',
        'description_en',
        'image',
        'price',
        'meal_type',
        'delivery_time',
        'is_available',
        'subscription_type_ids',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'delivery_time' => 'datetime',
        'is_available' => 'boolean',
        'subscription_type_ids' => 'array',
    ];

    protected $appends = ['name', 'description', 'meal_type_text', 'delivery_time_formatted', 'linked_subscription_types'];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function subscriptionItems()
    {
        return $this->hasMany(SubscriptionItem::class);
    }

    public function subscriptionTypes()
    {
        return $this->belongsToMany(SubscriptionType::class, 'meal_subscription_type', 'meal_id', 'subscription_type_id');
    }

    public function getNameAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    }

    public function getDescriptionAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->description_ar : $this->description_en;
    }

    public function getMealTypeTextAttribute()
    {
        $types = [
            'breakfast' => ['ar' => 'فطور', 'en' => 'Breakfast'],
            'lunch' => ['ar' => 'غداء', 'en' => 'Lunch'],
            'dinner' => ['ar' => 'عشاء', 'en' => 'Dinner'],
        ];

        return $types[$this->meal_type][app()->getLocale()] ?? $this->meal_type;
    }

    public function getDeliveryTimeFormattedAttribute()
    {
        if (!$this->delivery_time) {
            return null;
        }
        
        // إذا كان delivery_time كائن Carbon
        if (is_object($this->delivery_time) && method_exists($this->delivery_time, 'format')) {
            return $this->delivery_time->format('H:i');
        }
        
        // إذا كان string، نحاول تحويله
        if (is_string($this->delivery_time)) {
            try {
                $time = \Carbon\Carbon::parse($this->delivery_time);
                return $time->format('H:i');
            } catch (\Exception $e) {
                return null;
            }
        }
        
        return null;
    }

    public function getLinkedSubscriptionTypesAttribute()
    {
        if (!$this->subscription_type_ids || !is_array($this->subscription_type_ids)) {
            return collect();
        }

        return SubscriptionType::whereIn('id', $this->subscription_type_ids)
            ->where('restaurant_id', $this->restaurant_id)
            ->get();
    }
}
