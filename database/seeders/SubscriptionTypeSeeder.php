<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionType;
use App\Models\Restaurant;

class SubscriptionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all restaurants
        $restaurants = Restaurant::all();

        foreach ($restaurants as $restaurant) {
            // Create weekly subscription type for this restaurant
            SubscriptionType::create([
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'اشتراك أسبوعي',
                'name_en' => 'Weekly Subscription',
                'description_ar' => '4 وجبات في الأسبوع - توصيل من الأحد إلى الأربعاء',
                'description_en' => '4 meals per week - delivery from Sunday to Wednesday',
                'type' => 'weekly',
                'price' => 120.00,
                'delivery_price' => 10.00, // سعر التوصيل للأسبوعي
                'meals_count' => 4,
                'is_active' => true,
            ]);

            // Create monthly subscription type for this restaurant
            SubscriptionType::create([
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'اشتراك شهري',
                'name_en' => 'Monthly Subscription',
                'description_ar' => '16 وجبة في الشهر - توصيل من الأحد إلى الأربعاء مع خصم 15%',
                'description_en' => '16 meals per month - delivery from Sunday to Wednesday with 15% discount',
                'type' => 'monthly',
                'price' => 400.00,
                'delivery_price' => 0.00, // التوصيل مجاني للاشتراك الشهري
                'meals_count' => 16,
                'is_active' => true,
            ]);
        }
    }
}
