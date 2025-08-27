<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionType;

class SubscriptionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subscriptionTypes = [
            [
                'name_ar' => 'اشتراك أسبوعي',
                'name_en' => 'Weekly Subscription',
                'description_ar' => '4 وجبات في الأسبوع - توصيل من الأحد إلى الخميس',
                'description_en' => '4 meals per week - delivery from Sunday to Thursday',
                'type' => 'weekly',
                'price' => 120.00,
                'meals_count' => 4,
                'is_active' => true,
            ],
            [
                'name_ar' => 'اشتراك شهري',
                'name_en' => 'Monthly Subscription',
                'description_ar' => '16 وجبة في الشهر - توصيل من الأحد إلى الخميس مع خصم 15%',
                'description_en' => '16 meals per month - delivery from Sunday to Thursday with 15% discount',
                'type' => 'monthly',
                'price' => 400.00,
                'meals_count' => 16,
                'is_active' => true,
            ],
        ];

        foreach ($subscriptionTypes as $subscriptionTypeData) {
            SubscriptionType::create($subscriptionTypeData);
        }
    }
}
