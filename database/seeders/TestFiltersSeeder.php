<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\Meal;

class TestFiltersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء مطاعم تجريبية مع عناوين مختلفة
        $restaurants = [
            [
                'name_ar' => 'مطعم بوشر الأول',
                'name_en' => 'Bosher Restaurant 1',
                'description_ar' => 'مطعم مميز في بوشر',
                'description_en' => 'Excellent restaurant in Bosher',
                'locations' => ['bosher'],
                'phone' => '123456789',
                'email' => 'bosher1@test.com',
                'is_active' => true
            ],
            [
                'name_ar' => 'مطعم الخوض الأول',
                'name_en' => 'Khoudh Restaurant 1',
                'description_ar' => 'مطعم مميز في الخوض',
                'description_en' => 'Excellent restaurant in Khoudh',
                'locations' => ['khoudh'],
                'phone' => '123456790',
                'email' => 'khoudh1@test.com',
                'is_active' => true
            ],
            [
                'name_ar' => 'مطعم المعبيلة الأول',
                'name_en' => 'Maabilah Restaurant 1',
                'description_ar' => 'مطعم مميز في المعبيلة',
                'description_en' => 'Excellent restaurant in Maabilah',
                'locations' => ['maabilah'],
                'phone' => '123456791',
                'email' => 'maabilah1@test.com',
                'is_active' => true
            ],
            [
                'name_ar' => 'مطعم متعدد المواقع',
                'name_en' => 'Multi Location Restaurant',
                'description_ar' => 'مطعم في عدة مواقع',
                'description_en' => 'Restaurant in multiple locations',
                'locations' => ['bosher', 'khoudh'],
                'phone' => '123456792',
                'email' => 'multi@test.com',
                'is_active' => true
            ]
        ];

        foreach ($restaurants as $restaurantData) {
            $restaurant = Restaurant::create($restaurantData);
            
            // إضافة وجبات مختلفة لكل مطعم
            $meals = [
                [
                    'name_ar' => 'وجبة فطور',
                    'name_en' => 'Breakfast Meal',
                    'description_ar' => 'وجبة فطور لذيذة',
                    'description_en' => 'Delicious breakfast meal',
                    'meal_type' => 'breakfast',
                    'price' => 15.00,
                    'delivery_time' => '08:00:00',
                    'is_available' => true
                ],
                [
                    'name_ar' => 'وجبة غداء',
                    'name_en' => 'Lunch Meal',
                    'description_ar' => 'وجبة غداء شهية',
                    'description_en' => 'Tasty lunch meal',
                    'meal_type' => 'lunch',
                    'price' => 25.00,
                    'delivery_time' => '13:00:00',
                    'is_available' => true
                ],
                [
                    'name_ar' => 'وجبة عشاء',
                    'name_en' => 'Dinner Meal',
                    'description_ar' => 'وجبة عشاء مميزة',
                    'description_en' => 'Special dinner meal',
                    'meal_type' => 'dinner',
                    'price' => 30.00,
                    'delivery_time' => '19:00:00',
                    'is_available' => true
                ]
            ];

            foreach ($meals as $mealData) {
                $mealData['restaurant_id'] = $restaurant->id;
                Meal::create($mealData);
            }
        }

        $this->command->info('تم إنشاء بيانات تجريبية للفلاتر بنجاح!');
        $this->command->info('تم إنشاء ' . count($restaurants) . ' مطاعم مع وجبات مختلفة');
    }
}
