<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestaurantAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'name_ar',
        'name_en',
        'address_ar',
        'address_en',
        'area',
        'latitude',
        'longitude',
        'is_primary',
        'is_active',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    protected $appends = ['name', 'address'];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function getNameAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    }

    public function getAddressAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->address_ar : $this->address_en;
    }

    public function getAreaNameAttribute()
    {
        $areaNames = [
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
        $names = $areaNames[$currentLocale] ?? $areaNames['ar'];

        return $names[$this->area] ?? $this->area;
    }

    public static function getAvailableAreas()
    {
        return [
            'bosher' => [
                'ar' => 'بوشر',
                'en' => 'Bosher'
            ],
            'khoudh' => [
                'ar' => 'الخوض',
                'en' => 'Al Khoudh'
            ],
            'maabilah' => [
                'ar' => 'المعبيلة',
                'en' => 'Al Mabaila'
            ]
        ];
    }
}
