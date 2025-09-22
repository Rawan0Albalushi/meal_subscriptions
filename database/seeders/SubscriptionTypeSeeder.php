<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionType;
use App\Models\Restaurant;

class SubscriptionTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name_ar' => 'اشتراك أسبوعي',
                'name_en' => 'Weekly Plan',
                'description_ar' => '5 وجبات في الأسبوع',
                'description_en' => '5 meals per week',
                'type' => 'weekly',
                'price' => 45.00,
                'delivery_price' => 0.00,
                'admin_commission' => 10.00,
                'meals_count' => 5,
                'is_active' => true,
            ],
            [
                'name_ar' => 'اشتراك شهري',
                'name_en' => 'Monthly Plan',
                'description_ar' => '20 وجبة في الشهر',
                'description_en' => '20 meals per month',
                'type' => 'monthly',
                'price' => 160.00,
                'delivery_price' => 0.00,
                'admin_commission' => 10.00,
                'meals_count' => 20,
                'is_active' => true,
            ],
        ];

        $created = [];
        foreach ($types as $data) {
            $created[] = SubscriptionType::updateOrCreate(
                ['name_en' => $data['name_en']],
                $data
            );
        }

        // attach to restaurants via pivot
        $restaurants = Restaurant::all();
        foreach ($restaurants as $restaurant) {
            $restaurant->subscriptionTypes()->syncWithoutDetaching(collect($created)->pluck('id')->toArray());
        }
    }
}


