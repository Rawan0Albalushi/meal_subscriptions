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
            'pending' => ['ar' => 'في الانتظار', 'en' => 'Pending'],
            'delivered' => ['ar' => 'تم التوصيل', 'en' => 'Delivered'],
            'cancelled' => ['ar' => 'ملغي', 'en' => 'Cancelled'],
        ];

        return $statuses[$this->status][app()->getLocale()] ?? $this->status;
    }
}
