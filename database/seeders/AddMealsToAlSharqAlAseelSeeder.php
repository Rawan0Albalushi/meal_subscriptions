<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\Meal;

class AddMealsToAlSharqAlAseelSeeder extends Seeder
{
    public function run(): void
    {
        $restaurant = Restaurant::where('name_en', 'Authentic Eastern Restaurant')->first();
        if (!$restaurant) {
            $restaurant = Restaurant::first();
        }
        if (!$restaurant) {
            return;
        }

        $meals = [
            [
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'وجبة الفطور العربية',
                'name_en' => 'Arabic Breakfast',
                'description_ar' => 'فطور تقليدي',
                'description_en' => 'Traditional breakfast',
                'price' => 28.00,
                'meal_type' => 'breakfast',
                'delivery_time' => '08:00:00',
                'is_available' => true,
            ],
            [
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'وجبة الغداء',
                'name_en' => 'Lunch Meal',
                'description_ar' => 'غداء متوازن',
                'description_en' => 'Balanced lunch',
                'price' => 40.00,
                'meal_type' => 'lunch',
                'delivery_time' => '13:00:00',
                'is_available' => true,
            ],
            [
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'وجبة العشاء',
                'name_en' => 'Dinner Meal',
                'description_ar' => 'عشاء شهي',
                'description_en' => 'Delicious dinner',
                'price' => 52.00,
                'meal_type' => 'dinner',
                'delivery_time' => '19:00:00',
                'is_available' => true,
            ],
        ];

        foreach ($meals as $data) {
            Meal::updateOrCreate(
                [
                    'restaurant_id' => $data['restaurant_id'],
                    'name_en' => $data['name_en']
                ],
                $data
            );
        }
    }
}


