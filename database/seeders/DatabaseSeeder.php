<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\Meal;
use App\Models\User;
use App\Models\DeliveryAddress;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users
        $users = [
            [
                'name' => 'أحمد محمد',
                'email' => 'ahmed@example.com',
                'password' => bcrypt('password'),
            ],
            [
                'name' => 'فاطمة علي',
                'email' => 'fatima@example.com',
                'password' => bcrypt('password'),
            ],
            [
                'name' => 'محمد عبدالله',
                'email' => 'mohammed@example.com',
                'password' => bcrypt('password'),
            ],
        ];

        $createdUsers = [];
        foreach ($users as $userData) {
            $createdUsers[] = User::create($userData);
        }

        // Create restaurants with more variety
        $restaurants = [
            [
                'name_ar' => 'مطعم الشرق الأصيل',
                'name_en' => 'Authentic Eastern Restaurant',
                'description_ar' => 'مطعم شرقي يقدم أشهى الأطباق التقليدية من المطبخ العربي والشرقي',
                'description_en' => 'Eastern restaurant serving the most delicious traditional dishes from Arabic and Eastern cuisine',
                'phone' => '+96891234567',
                'email' => 'info@eastern.com',
                'address_ar' => 'شارع السلطان قابوس، بوشر',
                'address_en' => 'Sultan Qaboos Street, Bausher',
                'is_active' => true,
            ],
            [
                'name_ar' => 'مطعم البحر المتوسط',
                'name_en' => 'Mediterranean Restaurant',
                'description_ar' => 'مطعم يقدم أطباق البحر المتوسط الطازجة والصحية',
                'description_en' => 'Restaurant serving fresh and healthy Mediterranean dishes',
                'phone' => '+96897654321',
                'email' => 'info@mediterranean.com',
                'address_ar' => 'شارع الخوض الرئيسي، الخوض',
                'address_en' => 'Al Khoudh Main Street, Al Khoudh',
                'is_active' => true,
            ],
            [
                'name_ar' => 'مطعم البيتزا الإيطالي',
                'name_en' => 'Italian Pizza Restaurant',
                'description_ar' => 'مطعم إيطالي أصيل يقدم أفضل البيتزا والمعكرونة والسلطات',
                'description_en' => 'Authentic Italian restaurant serving the best pizza, pasta and salads',
                'phone' => '+96898765432',
                'email' => 'info@italianpizza.com',
                'address_ar' => 'شارع المعبيلة التجاري، المعبيلة',
                'address_en' => 'Al Mabaila Commercial Street, Al Mabaila',
                'is_active' => true,
            ],
            [
                'name_ar' => 'مطعم الشواء التركي',
                'name_en' => 'Turkish Grill Restaurant',
                'description_ar' => 'مطعم تركي يقدم أشهى أطباق الشواء والكباب',
                'description_en' => 'Turkish restaurant serving the most delicious grilled dishes and kebabs',
                'phone' => '+96895555555',
                'email' => 'info@turkishgrill.com',
                'address_ar' => 'شارع بوشر السكني، بوشر',
                'address_en' => 'Bausher Residential Street, Bausher',
                'is_active' => true,
            ],
            [
                'name_ar' => 'مطعم المأكولات البحرية',
                'name_en' => 'Seafood Restaurant',
                'description_ar' => 'مطعم متخصص في المأكولات البحرية الطازجة',
                'description_en' => 'Restaurant specialized in fresh seafood dishes',
                'phone' => '+96896666666',
                'email' => 'info@seafood.com',
                'address_ar' => 'شارع الخوض البحري، الخوض',
                'address_en' => 'Al Khoudh Coastal Street, Al Khoudh',
                'is_active' => true,
            ],
        ];

        $createdRestaurants = [];
        foreach ($restaurants as $restaurantData) {
            $createdRestaurants[] = Restaurant::create($restaurantData);
        }

        // Create meals for each restaurant
        $mealsData = [
            // Eastern Restaurant Meals
            [
                'restaurant_index' => 0,
                'meals' => [
                    [
                        'name_ar' => 'وجبة الفطور العربية',
                        'name_en' => 'Arabic Breakfast',
                        'description_ar' => 'فول مدمس، بيض مسلوق، جبنة بيضاء، زيتون، طماطم، خبز طازج',
                        'description_en' => 'Fava beans, boiled eggs, white cheese, olives, tomatoes, fresh bread',
                        'price' => 28.00,
                        'meal_type' => 'breakfast',
                        'delivery_time' => '08:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة الغداء التقليدية',
                        'name_en' => 'Traditional Lunch',
                        'description_ar' => 'أرز بسمتي، دجاج مشوي، سلطة خضراء، خبز عربي، شوربة عدس',
                        'description_en' => 'Basmati rice, grilled chicken, green salad, Arabic bread, lentil soup',
                        'price' => 42.00,
                        'meal_type' => 'lunch',
                        'delivery_time' => '13:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة العشاء المميزة',
                        'name_en' => 'Premium Dinner',
                        'description_ar' => 'لحم ضأن مشوي، أرز بالزعفران، خضروات مشوية، سلطة تبولة',
                        'description_en' => 'Grilled lamb, saffron rice, roasted vegetables, tabbouleh salad',
                        'price' => 55.00,
                        'meal_type' => 'dinner',
                        'delivery_time' => '19:00:00',
                        'is_available' => true,
                    ],
                ]
            ],
            // Mediterranean Restaurant Meals
            [
                'restaurant_index' => 1,
                'meals' => [
                    [
                        'name_ar' => 'وجبة الفطور المتوسطية',
                        'name_en' => 'Mediterranean Breakfast',
                        'description_ar' => 'بيض عيون، أفوكادو، طماطم مشوية، جبنة فيتا، زيت زيتون، خبز محمص',
                        'description_en' => 'Sunny side up eggs, avocado, roasted tomatoes, feta cheese, olive oil, toast',
                        'price' => 32.00,
                        'meal_type' => 'breakfast',
                        'delivery_time' => '08:30:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة الغداء الصحية',
                        'name_en' => 'Healthy Lunch',
                        'description_ar' => 'سلطة يونانية، سمك مشوي، أرز بري، خضروات طازجة',
                        'description_en' => 'Greek salad, grilled fish, wild rice, fresh vegetables',
                        'price' => 45.00,
                        'meal_type' => 'lunch',
                        'delivery_time' => '13:30:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة العشاء المتوسطية',
                        'name_en' => 'Mediterranean Dinner',
                        'description_ar' => 'دجاج مشوي بالليمون، أرز بالعصفر، سلطة خضراء، خبز بيتا',
                        'description_en' => 'Lemon grilled chicken, saffron rice, green salad, pita bread',
                        'price' => 48.00,
                        'meal_type' => 'dinner',
                        'delivery_time' => '19:30:00',
                        'is_available' => true,
                    ],
                ]
            ],
            // Italian Restaurant Meals
            [
                'restaurant_index' => 2,
                'meals' => [
                    [
                        'name_ar' => 'وجبة الفطور الإيطالية',
                        'name_en' => 'Italian Breakfast',
                        'description_ar' => 'كرواسون طازج، قهوة إيطالية، جبنة موزاريلا، طماطم، ريحان',
                        'description_en' => 'Fresh croissant, Italian coffee, mozzarella cheese, tomatoes, basil',
                        'price' => 25.00,
                        'meal_type' => 'breakfast',
                        'delivery_time' => '08:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة الغداء الإيطالية',
                        'name_en' => 'Italian Lunch',
                        'description_ar' => 'باستا كاربونارا، سلطة سيزر، خبز إيطالي، شوربة مينسترون',
                        'description_en' => 'Carbonara pasta, Caesar salad, Italian bread, minestrone soup',
                        'price' => 38.00,
                        'meal_type' => 'lunch',
                        'delivery_time' => '13:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة العشاء الإيطالية',
                        'name_en' => 'Italian Dinner',
                        'description_ar' => 'بيتزا مارجريتا، سلطة كابريزي، خبز فوكاشيا، جيلاتو',
                        'description_en' => 'Margherita pizza, Caprese salad, focaccia bread, gelato',
                        'price' => 52.00,
                        'meal_type' => 'dinner',
                        'delivery_time' => '19:00:00',
                        'is_available' => true,
                    ],
                ]
            ],
            // Turkish Restaurant Meals
            [
                'restaurant_index' => 3,
                'meals' => [
                    [
                        'name_ar' => 'وجبة الفطور التركية',
                        'name_en' => 'Turkish Breakfast',
                        'description_ar' => 'جبنة بيضاء، زيتون، طماطم، خيار، عسل، خبز تركي',
                        'description_en' => 'White cheese, olives, tomatoes, cucumber, honey, Turkish bread',
                        'price' => 30.00,
                        'meal_type' => 'breakfast',
                        'delivery_time' => '08:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة الغداء التركية',
                        'name_en' => 'Turkish Lunch',
                        'description_ar' => 'كباب لحم، أرز تركي، سلطة تركية، خبز بيتا، شوربة عدس',
                        'description_en' => 'Beef kebab, Turkish rice, Turkish salad, pita bread, lentil soup',
                        'price' => 40.00,
                        'meal_type' => 'lunch',
                        'delivery_time' => '13:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة العشاء التركية',
                        'name_en' => 'Turkish Dinner',
                        'description_ar' => 'دونر دجاج، أرز بالزعفران، سلطة خضراء، خبز تركي، باقلاء',
                        'description_en' => 'Chicken doner, saffron rice, green salad, Turkish bread, baklava',
                        'price' => 50.00,
                        'meal_type' => 'dinner',
                        'delivery_time' => '19:00:00',
                        'is_available' => true,
                    ],
                ]
            ],
            // Seafood Restaurant Meals
            [
                'restaurant_index' => 4,
                'meals' => [
                    [
                        'name_ar' => 'وجبة الفطور البحري',
                        'name_en' => 'Seafood Breakfast',
                        'description_ar' => 'سمك سلمون مدخن، بيض بنديكت، أفوكادو، خبز محمص، عصير برتقال',
                        'description_en' => 'Smoked salmon, eggs benedict, avocado, toast, orange juice',
                        'price' => 35.00,
                        'meal_type' => 'breakfast',
                        'delivery_time' => '08:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة الغداء البحرية',
                        'name_en' => 'Seafood Lunch',
                        'description_ar' => 'سمك مشوي، أرز بالليمون، سلطة خضراء، خبز محمص، شوربة سمك',
                        'description_en' => 'Grilled fish, lemon rice, green salad, toast, fish soup',
                        'price' => 55.00,
                        'meal_type' => 'lunch',
                        'delivery_time' => '13:00:00',
                        'is_available' => true,
                    ],
                    [
                        'name_ar' => 'وجبة العشاء البحرية',
                        'name_en' => 'Seafood Dinner',
                        'description_ar' => 'روبيان مشوي، أرز بالزعفران، خضروات مشوية، سلطة سيزر، خبز فرنسي',
                        'description_en' => 'Grilled shrimp, saffron rice, roasted vegetables, Caesar salad, French bread',
                        'price' => 65.00,
                        'meal_type' => 'dinner',
                        'delivery_time' => '19:00:00',
                        'is_available' => true,
                    ],
                ]
            ],
        ];

        $createdMeals = [];
        foreach ($mealsData as $restaurantMeals) {
            $restaurant = $createdRestaurants[$restaurantMeals['restaurant_index']];
            foreach ($restaurantMeals['meals'] as $mealData) {
                $mealData['restaurant_id'] = $restaurant->id;
                $createdMeals[] = Meal::create($mealData);
            }
        }

        // Create subscription types
        $this->call([
            SubscriptionTypeSeeder::class,
        ]);

        // Create delivery addresses for users
        $addressesData = [
            // Addresses for first user
            [
                'user_id' => $createdUsers[0]->id,
                'name' => 'المنزل',
                'phone' => '+96891234567',
                'address' => 'شارع السلطان قابوس، حي النزهة، بوشر',
                'city' => 'بوشر',
                'postal_code' => '12345',
                'additional_notes' => 'بجانب المسجد، الطابق الثاني',
                'is_default' => true,
            ],
            [
                'user_id' => $createdUsers[0]->id,
                'name' => 'العمل',
                'phone' => '+96891234567',
                'address' => 'شارع الخوض الرئيسي، حي الشاطئ، الخوض',
                'city' => 'الخوض',
                'postal_code' => '54321',
                'additional_notes' => 'الطابق الثالث، مكتب 305',
                'is_default' => false,
            ],
            // Addresses for second user
            [
                'user_id' => $createdUsers[1]->id,
                'name' => 'المنزل',
                'phone' => '+96897654321',
                'address' => 'شارع المعبيلة التجاري، حي السكني، المعبيلة',
                'city' => 'المعبيلة',
                'postal_code' => '23456',
                'additional_notes' => 'عمارة الأمانة، الطابق الأول',
                'is_default' => true,
            ],
            // Addresses for third user
            [
                'user_id' => $createdUsers[2]->id,
                'name' => 'المنزل',
                'phone' => '+96898765432',
                'address' => 'شارع بوشر السكني، حي الشاطئ، بوشر',
                'city' => 'بوشر',
                'postal_code' => '34567',
                'additional_notes' => 'فيلا الشاطئ، الطابق الأرضي',
                'is_default' => true,
            ],
        ];

        $createdAddresses = [];
        foreach ($addressesData as $addressData) {
            $createdAddresses[] = DeliveryAddress::create($addressData);
        }

        // Create subscriptions
        $subscriptionsData = [
            [
                'user_id' => $createdUsers[0]->id,
                'restaurant_id' => $createdRestaurants[0]->id, // Eastern Restaurant
                'delivery_address_id' => $createdAddresses[0]->id,
                'subscription_type' => 'weekly',
                'start_date' => Carbon::now()->addDays(1),
                'end_date' => Carbon::now()->addWeeks(4),
                'total_amount' => 420.00,
                'status' => 'active',
                'payment_status' => 'paid',
                'payment_method' => 'credit_card',
                'transaction_id' => 'TXN_' . uniqid(),
            ],
            [
                'user_id' => $createdUsers[1]->id,
                'restaurant_id' => $createdRestaurants[1]->id, // Mediterranean Restaurant
                'delivery_address_id' => $createdAddresses[2]->id,
                'subscription_type' => 'monthly',
                'start_date' => Carbon::now()->addDays(2),
                'end_date' => Carbon::now()->addMonths(1),
                'total_amount' => 540.00,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => 'bank_transfer',
                'transaction_id' => null,
            ],
            [
                'user_id' => $createdUsers[2]->id,
                'restaurant_id' => $createdRestaurants[2]->id, // Italian Restaurant
                'delivery_address_id' => $createdAddresses[3]->id,
                'subscription_type' => 'weekly',
                'start_date' => Carbon::now()->subDays(5),
                'end_date' => Carbon::now()->addWeeks(3),
                'total_amount' => 345.00,
                'status' => 'active',
                'payment_status' => 'paid',
                'payment_method' => 'cash',
                'transaction_id' => 'TXN_' . uniqid(),
            ],
        ];

        $createdSubscriptions = [];
        foreach ($subscriptionsData as $subscriptionData) {
            $createdSubscriptions[] = Subscription::create($subscriptionData);
        }

        // Create subscription items
        $subscriptionItemsData = [
            // Items for first subscription (Eastern Restaurant - Weekly)
            [
                'subscription_id' => $createdSubscriptions[0]->id,
                'meal_id' => $createdMeals[0]->id, // Arabic Breakfast
                'delivery_date' => Carbon::now()->addDays(1),
                'day_of_week' => 'monday',
                'price' => 28.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[0]->id,
                'meal_id' => $createdMeals[1]->id, // Traditional Lunch
                'delivery_date' => Carbon::now()->addDays(2),
                'day_of_week' => 'tuesday',
                'price' => 42.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[0]->id,
                'meal_id' => $createdMeals[2]->id, // Premium Dinner
                'delivery_date' => Carbon::now()->addDays(3),
                'day_of_week' => 'wednesday',
                'price' => 55.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[0]->id,
                'meal_id' => $createdMeals[0]->id, // Arabic Breakfast
                'delivery_date' => Carbon::now()->addDays(8),
                'day_of_week' => 'monday',
                'price' => 28.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[0]->id,
                'meal_id' => $createdMeals[1]->id, // Traditional Lunch
                'delivery_date' => Carbon::now()->addDays(9),
                'day_of_week' => 'tuesday',
                'price' => 42.00,
                'status' => 'pending',
            ],
            // Items for second subscription (Mediterranean Restaurant - Monthly)
            [
                'subscription_id' => $createdSubscriptions[1]->id,
                'meal_id' => $createdMeals[3]->id, // Mediterranean Breakfast
                'delivery_date' => Carbon::now()->addDays(2),
                'day_of_week' => 'tuesday',
                'price' => 32.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[1]->id,
                'meal_id' => $createdMeals[4]->id, // Healthy Lunch
                'delivery_date' => Carbon::now()->addDays(3),
                'day_of_week' => 'wednesday',
                'price' => 45.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[1]->id,
                'meal_id' => $createdMeals[5]->id, // Mediterranean Dinner
                'delivery_date' => Carbon::now()->addDays(4),
                'day_of_week' => 'thursday',
                'price' => 48.00,
                'status' => 'pending',
            ],
            // Items for third subscription (Italian Restaurant - Weekly)
            [
                'subscription_id' => $createdSubscriptions[2]->id,
                'meal_id' => $createdMeals[6]->id, // Italian Breakfast
                'delivery_date' => Carbon::now()->subDays(4),
                'day_of_week' => 'monday',
                'price' => 25.00,
                'status' => 'delivered',
            ],
            [
                'subscription_id' => $createdSubscriptions[2]->id,
                'meal_id' => $createdMeals[7]->id, // Italian Lunch
                'delivery_date' => Carbon::now()->subDays(3),
                'day_of_week' => 'tuesday',
                'price' => 38.00,
                'status' => 'delivered',
            ],
            [
                'subscription_id' => $createdSubscriptions[2]->id,
                'meal_id' => $createdMeals[8]->id, // Italian Dinner
                'delivery_date' => Carbon::now()->subDays(2),
                'day_of_week' => 'wednesday',
                'price' => 52.00,
                'status' => 'delivered',
            ],
            [
                'subscription_id' => $createdSubscriptions[2]->id,
                'meal_id' => $createdMeals[6]->id, // Italian Breakfast
                'delivery_date' => Carbon::now()->addDays(3),
                'day_of_week' => 'monday',
                'price' => 25.00,
                'status' => 'pending',
            ],
            [
                'subscription_id' => $createdSubscriptions[2]->id,
                'meal_id' => $createdMeals[7]->id, // Italian Lunch
                'delivery_date' => Carbon::now()->addDays(4),
                'day_of_week' => 'tuesday',
                'price' => 38.00,
                'status' => 'pending',
            ],
        ];

        foreach ($subscriptionItemsData as $itemData) {
            SubscriptionItem::create($itemData);
        }

        // Call RestaurantSeeder for additional restaurant data
        $this->call([
            RestaurantSeeder::class,
        ]);
    }
}
