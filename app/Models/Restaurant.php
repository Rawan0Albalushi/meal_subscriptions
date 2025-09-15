<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Restaurant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'name_ar',
        'name_en',
        'description_ar',
        'description_en',
        'logo',
        'phone',
        'email',
        'address_ar',
        'address_en',
        'locations',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'locations' => 'array',
    ];

    protected $appends = ['name', 'description', 'address', 'locations_text'];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function meals()
    {
        return $this->hasMany(Meal::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscriptionTypes()
    {
        return $this->belongsToMany(SubscriptionType::class, 'restaurant_subscription_type');
    }

    public function addresses()
    {
        return $this->hasMany(RestaurantAddress::class);
    }

    public function primaryAddress()
    {
        return $this->hasOne(RestaurantAddress::class)->where('is_primary', true);
    }

    public function getNameAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    }

    public function getDescriptionAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->description_ar : $this->description_en;
    }

    public function getAddressAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->address_ar : $this->address_en;
    }

    public function getLocationsTextAttribute()
    {
        if (!$this->locations) {
            return '';
        }

        $locationNames = [
            'ar' => [
                'bosher' => 'بوشر',
                'khoudh' => 'الخوض',
                'maabilah' => 'المعبيلة'
            ],
            'en' => [
                'bosher' => 'Bosher',
                'khoudh' => 'Al Khoudh',
                'maabilah' => 'Al Mabaila'
            ]
        ];

        $currentLocale = app()->getLocale();
        $names = $locationNames[$currentLocale] ?? $locationNames['ar'];

        return collect($this->locations)->map(function($location) use ($names) {
            return $names[$location] ?? $location;
        })->implode($currentLocale === 'ar' ? '، ' : ', ');
    }
}
