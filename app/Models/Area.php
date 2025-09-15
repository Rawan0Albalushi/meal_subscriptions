<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'name_en',
        'code',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    protected $appends = ['name'];

    /**
     * الحصول على الاسم حسب اللغة الحالية
     */
    public function getNameAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->name_ar : $this->name_en;
    }

    /**
     * العلاقة مع عناوين المطاعم
     */
    public function restaurantAddresses()
    {
        return $this->hasMany(RestaurantAddress::class, 'area_code', 'code');
    }

    /**
     * الحصول على المناطق النشطة مرتبة
     */
    public static function getActiveAreas()
    {
        return self::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name_ar')
            ->get();
    }

    /**
     * الحصول على المناطق بصيغة API
     */
    public static function getAreasForApi()
    {
        $areas = self::getActiveAreas();
        
        return $areas->mapWithKeys(function ($area) {
            return [
                $area->code => [
                    'ar' => $area->name_ar,
                    'en' => $area->name_en
                ]
            ];
        });
    }
}