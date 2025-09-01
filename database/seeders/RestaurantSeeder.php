<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\Meal;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create restaurants
        $restaurants = [
            [
                'name_ar' => 'مطعم الشرق الأوسط',
                'name_en' => 'Middle East Restaurant',
                'description_ar' => 'أفضل المأكولات الشرقية التقليدية',
                'description_en' => 'Best traditional Eastern cuisine',
                'logo' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                'is_active' => true,
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'phone' => '+968 1234 5678',
                'email' => 'info@middleeast.com',
                'locations' => ['bosher'],
            ],
            [
                'name_ar' => 'بيتزا إيطاليا',
                'name_en' => 'Pizza Italia',
                'description_ar' => 'بيتزا إيطالية أصيلة بأفضل المكونات',
                'description_en' => 'Authentic Italian pizza with the best ingredients',
                'logo' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                'is_active' => true,
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'phone' => '+968 2345 6789',
                'email' => 'info@pizzaitalia.com',
                'locations' => ['maabilah'],
            ],
            [
                'name_ar' => 'سوشي اليابان',
                'name_en' => 'Sushi Japan',
                'description_ar' => 'سوشي طازج ومأكولات يابانية أصيلة',
                'description_en' => 'Fresh sushi and authentic Japanese cuisine',
                'logo' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                'is_active' => true,
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'phone' => '+968 3456 7890',
                'email' => 'info@sushijapan.com',
                'locations' => ['bosher'],
            ],
            [
                'name_ar' => 'برجر هاوس',
                'name_en' => 'Burger House',
                'description_ar' => 'أفضل البرجر الأمريكي مع البطاطس المقرمشة',
                'description_en' => 'Best American burgers with crispy fries',
                'logo' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                'is_active' => true,
                'address_ar' => 'شارع القرم، مسقط',
                'address_en' => 'Al Qurum Street, Muscat',
                'phone' => '+968 4567 8901',
                'email' => 'info@burgerhouse.com',
            ],
            [
                'name_ar' => 'مطعم الهندي',
                'name_en' => 'Indian Restaurant',
                'description_ar' => 'أطباق هندية حارة ومميزة',
                'description_en' => 'Spicy and distinctive Indian dishes',
                'logo' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                'is_active' => true,
                'address_ar' => 'شارع الخوير، مسقط',
                'address_en' => 'Al Khoudh Street, Muscat',
                'phone' => '+968 5678 9012',
                'email' => 'info@indianrestaurant.com',
            ],
            [
                'name_ar' => 'كافيه الحلويات',
                'name_en' => 'Dessert Cafe',
                'description_ar' => 'أفضل الحلويات العربية والغربية',
                'description_en' => 'Best Arabic and Western desserts',
                'logo' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                'is_active' => true,
                'address_ar' => 'شارع العذيبة، مسقط',
                'address_en' => 'Al Adheeba Street, Muscat',
                'phone' => '+968 6789 0123',
                'email' => 'info@dessertcafe.com',
            ],
        ];

        foreach ($restaurants as $restaurantData) {
            $restaurant = Restaurant::create($restaurantData);

            // Create meals for each restaurant
            $meals = $this->getMealsForRestaurant($restaurant->name_ar);
            
            foreach ($meals as $mealData) {
                $restaurant->meals()->create($mealData);
            }
        }
    }

    private function getMealsForRestaurant($restaurantName)
    {
        $meals = [
            'مطعم الشرق الأوسط' => [
                [
                    'name_ar' => 'كباب لحم',
                    'name_en' => 'Beef Kebab',
                    'description_ar' => 'كباب لحم طازج مع الأرز والخضار',
                    'description_en' => 'Fresh beef kebab with rice and vegetables',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 8.500,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'شاورما دجاج',
                    'name_en' => 'Chicken Shawarma',
                    'description_ar' => 'شاورما دجاج مع البطاطس والمشروبات',
                    'description_en' => 'Chicken shawarma with fries and drinks',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 6.500,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'حمص وفول',
                    'name_en' => 'Hummus and Fava Beans',
                    'description_ar' => 'حمص وفول مع الخبز الطازج',
                    'description_en' => 'Hummus and fava beans with fresh bread',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 4.500,
                    'meal_type' => 'breakfast',
                    'delivery_time' => '08:00:00',
                    'is_available' => true,
                ],
            ],
            'بيتزا إيطاليا' => [
                [
                    'name_ar' => 'بيتزا مارجريتا',
                    'name_en' => 'Margherita Pizza',
                    'description_ar' => 'بيتزا كلاسيكية مع الجبن والطماطم',
                    'description_en' => 'Classic pizza with cheese and tomatoes',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 12.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'بيتزا بيبروني',
                    'name_en' => 'Pepperoni Pizza',
                    'description_ar' => 'بيتزا مع الببروني والجبن الموزاريلا',
                    'description_en' => 'Pizza with pepperoni and mozzarella cheese',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 15.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'باستا كاربونارا',
                    'name_en' => 'Carbonara Pasta',
                    'description_ar' => 'باستا مع الكريمة واللحم المقدد',
                    'description_en' => 'Pasta with cream and bacon',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 10.500,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
            ],
            'سوشي اليابان' => [
                [
                    'name_ar' => 'سوشي سالمون',
                    'name_en' => 'Salmon Sushi',
                    'description_ar' => 'سوشي سالمون طازج مع الأرز',
                    'description_en' => 'Fresh salmon sushi with rice',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 18.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'رامين',
                    'name_en' => 'Ramen',
                    'description_ar' => 'شوربة رامين مع اللحم والخضار',
                    'description_en' => 'Ramen soup with meat and vegetables',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 14.000,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'تيمبورا',
                    'name_en' => 'Tempura',
                    'description_ar' => 'خضار وروبيان مقلي مع الصوص',
                    'description_en' => 'Fried vegetables and shrimp with sauce',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 16.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
            ],
            'برجر هاوس' => [
                [
                    'name_ar' => 'برجر كلاسيك',
                    'name_en' => 'Classic Burger',
                    'description_ar' => 'برجر لحم مع الجبن والخضار',
                    'description_en' => 'Beef burger with cheese and vegetables',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 9.500,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'برجر دجاج',
                    'name_en' => 'Chicken Burger',
                    'description_ar' => 'برجر دجاج مشوي مع الصوص',
                    'description_en' => 'Grilled chicken burger with sauce',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 8.500,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'بطاطس مقرمشة',
                    'name_en' => 'Crispy Fries',
                    'description_ar' => 'بطاطس مقرمشة مع الصوص',
                    'description_en' => 'Crispy fries with sauce',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 3.500,
                    'meal_type' => 'lunch',
                    'delivery_time' => '13:00:00',
                    'is_available' => true,
                ],
            ],
            'مطعم الهندي' => [
                [
                    'name_ar' => 'دجاج تيكا ماسالا',
                    'name_en' => 'Chicken Tikka Masala',
                    'description_ar' => 'دجاج مع صلصة تيكا ماسالا والأرز',
                    'description_en' => 'Chicken with tikka masala sauce and rice',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 11.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'لحم كاري',
                    'name_en' => 'Beef Curry',
                    'description_ar' => 'لحم مع صلصة الكاري والخبز',
                    'description_en' => 'Beef with curry sauce and bread',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 12.500,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'نان خبز',
                    'name_en' => 'Naan Bread',
                    'description_ar' => 'خبز نان طازج',
                    'description_en' => 'Fresh naan bread',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 2.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '19:00:00',
                    'is_available' => true,
                ],
            ],
            'كافيه الحلويات' => [
                [
                    'name_ar' => 'كنافة',
                    'name_en' => 'Kunafa',
                    'description_ar' => 'كنافة تقليدية مع الجبن',
                    'description_en' => 'Traditional kunafa with cheese',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 6.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '20:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'باكلاوا',
                    'name_en' => 'Baklava',
                    'description_ar' => 'باكلاوا مع المكسرات والعسل',
                    'description_en' => 'Baklava with nuts and honey',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 7.500,
                    'meal_type' => 'dinner',
                    'delivery_time' => '20:00:00',
                    'is_available' => true,
                ],
                [
                    'name_ar' => 'تشيز كيك',
                    'name_en' => 'Cheesecake',
                    'description_ar' => 'تشيز كيك كلاسيكي',
                    'description_en' => 'Classic cheesecake',
                    'image' => null, // سيتم ملؤه لاحقاً بالصور الحقيقية
                    'price' => 8.000,
                    'meal_type' => 'dinner',
                    'delivery_time' => '20:00:00',
                    'is_available' => true,
                ],
            ],
        ];

        return $meals[$restaurantName] ?? [];
    }
}
