<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'meal_id',
        'delivery_date',
        'day_of_week',
        'price',
        'status',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function meal()
    {
        return $this->belongsTo(Meal::class);
    }

    public function getDayOfWeekTextAttribute()
    {
        $days = [
            'sunday' => ['ar' => 'الأحد', 'en' => 'Sunday'],
            'monday' => ['ar' => 'الاثنين', 'en' => 'Monday'],
            'tuesday' => ['ar' => 'الثلاثاء', 'en' => 'Tuesday'],
            'wednesday' => ['ar' => 'الأربعاء', 'en' => 'Wednesday'],
            'thursday' => ['ar' => 'الخميس', 'en' => 'Thursday'],
            'friday' => ['ar' => 'الجمعة', 'en' => 'Friday'],
            'saturday' => ['ar' => 'السبت', 'en' => 'Saturday'],
        ];

        return $days[$this->day_of_week][app()->getLocale()] ?? $this->day_of_week;
    }

    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => ['ar' => 'قيد الانتظار', 'en' => 'Pending'],
            'preparing' => ['ar' => 'قيد التحضير', 'en' => 'Preparing'],
            'delivered' => ['ar' => 'تم التوصيل', 'en' => 'Delivered'],
            'cancelled' => ['ar' => 'ملغي', 'en' => 'Cancelled'],
        ];

        return $statuses[$this->status][app()->getLocale()] ?? $this->status;
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            'pending' => 'from-yellow-500 to-orange-500',
            'preparing' => 'from-blue-500 to-indigo-500',
            'delivered' => 'from-green-500 to-emerald-500',
            'cancelled' => 'from-red-500 to-pink-500',
        ];

        return $colors[$this->status] ?? 'from-gray-500 to-gray-600';
    }

    public function getStatusIconAttribute()
    {
        $icons = [
            'pending' => '⏳',
            'preparing' => '👨‍🍳',
            'delivered' => '✅',
            'cancelled' => '❌',
        ];

        return $icons[$this->status] ?? '📋';
    }
}
