<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meal extends Model
{
    use HasFactory, SoftDeletes;

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
        'delivery_time' => 'string',
        'is_available' => 'boolean',
        'subscription_type_ids' => 'array',
    ];

    protected $appends = ['name', 'description', 'meal_type_text', 'delivery_time_formatted', 'linked_subscription_types', 'image_url'];

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
        if (!$this->subscription_type_ids || !is_array($this->subscription_type_ids)) {
            return collect();
        }
        
        return SubscriptionType::whereIn('id', $this->subscription_type_ids)->get();
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

        // إرجاع جميع أنواع الاشتراك المحددة في subscription_type_ids
        // بدون التحقق من ارتباطها بالمطعم (لأن الوجبة قد تحتوي على أنواع اشتراك من مطاعم أخرى)
        return SubscriptionType::whereIn('id', $this->subscription_type_ids)->get();
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        // إذا كان المسار يحتوي على http أو https، أرجعه كما هو
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // إذا كان المسار يبدأ بـ storage/، أضف URL التطبيق
        if (str_starts_with($this->image, 'storage/')) {
            return asset($this->image);
        }

        // إذا كان المسار يبدأ بـ meals/، أضف storage/ في البداية
        if (str_starts_with($this->image, 'meals/')) {
            return asset('storage/' . $this->image);
        }

        // إذا كان المسار يبدأ بـ public/، أزيل public/ وأضف URL التطبيق
        if (str_starts_with($this->image, 'public/')) {
            return asset(str_replace('public/', 'storage/', $this->image));
        }

        // في الحالات الأخرى، أضف storage/ في البداية
        return asset('storage/' . $this->image);
    }
}
