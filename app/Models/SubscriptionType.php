<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'name_en',
        'description_ar',
        'description_en',
        'type',
        'price',
        'meals_count',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'meals_count' => 'integer',
        'is_active' => 'boolean',
    ];

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
}
