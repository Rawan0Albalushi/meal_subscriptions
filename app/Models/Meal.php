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
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'delivery_time' => 'datetime',
        'is_available' => 'boolean',
    ];

    protected $appends = ['name', 'description', 'meal_type_text'];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function subscriptionItems()
    {
        return $this->hasMany(SubscriptionItem::class);
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
}
