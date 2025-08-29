<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\Meal;

class AddMealsToAlSharqAlAseelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the restaurant
        $restaurant = Restaurant::where('name_ar', 'مطعم الشرق الأصيل')->first();
        
        if (!$restaurant) {
            $this->command->error('مطعم الشرق الأصيل غير موجود في قاعدة البيانات');
            return;
        }

        // Add 3 lunch meals
        $lunchMeals = [
            [
                'name_ar' => 'كبسة لحم',
                'name_en' => 'Lamb Kabsa',
                'description_ar' => 'كبسة لحم شهية مع الأرز البسمتي والخضروات الطازجة',
                'description_en' => 'Delicious lamb kabsa with basmati rice and fresh vegetables',
                'price' => 45.00,
                'meal_type' => 'lunch',
                'image' => null,
                'restaurant_id' => $restaurant->id,
                'delivery_time' => '12:00:00',
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_ar' => 'مندي دجاج',
                'name_en' => 'Chicken Mandi',
                'description_ar' => 'مندي دجاج طازج مطبوخ على الفحم مع الأرز والصلصة الخاصة',
                'description_en' => 'Fresh chicken mandi cooked on charcoal with rice and special sauce',
                'price' => 35.00,
                'meal_type' => 'lunch',
                'image' => null,
                'restaurant_id' => $restaurant->id,
                'delivery_time' => '12:00:00',
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_ar' => 'مظبي لحم',
                'name_en' => 'Lamb Mathbi',
                'description_ar' => 'مظبي لحم طازج مع الأرز والخضروات المشوية',
                'description_en' => 'Fresh lamb mathbi with rice and grilled vegetables',
                'price' => 50.00,
                'meal_type' => 'lunch',
                'image' => null,
                'restaurant_id' => $restaurant->id,
                'delivery_time' => '12:00:00',
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Add 2 breakfast meals
        $breakfastMeals = [
            [
                'name_ar' => 'فول مدمس',
                'name_en' => 'Fava Beans',
                'description_ar' => 'فول مدمس طازج مع الزيت والليمون والطماطم',
                'description_en' => 'Fresh fava beans with oil, lemon and tomatoes',
                'price' => 15.00,
                'meal_type' => 'breakfast',
                'image' => null,
                'restaurant_id' => $restaurant->id,
                'delivery_time' => '08:00:00',
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_ar' => 'شاورما دجاج',
                'name_en' => 'Chicken Shawarma',
                'description_ar' => 'شاورما دجاج طازجة مع الخضروات والصلصة',
                'description_en' => 'Fresh chicken shawarma with vegetables and sauce',
                'price' => 20.00,
                'meal_type' => 'breakfast',
                'image' => null,
                'restaurant_id' => $restaurant->id,
                'delivery_time' => '08:00:00',
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert all meals
        Meal::insert(array_merge($lunchMeals, $breakfastMeals));

        $this->command->info('تم إضافة 3 وجبات غداء و 2 وجبات فطور لمطعم الشرق الأصيل بنجاح');
    }
}
