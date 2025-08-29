<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class AddAddressesToRestaurantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurants = Restaurant::all();
        
        foreach ($restaurants as $restaurant) {
            // تحديد العنوان حسب اسم المطعم
            $addressData = $this->getAddressForRestaurant($restaurant->name_ar);
            
            $restaurant->update($addressData);
        }
        
        $this->command->info('تم إضافة العناوين لجميع المطاعم بنجاح');
    }
    
    private function getAddressForRestaurant($restaurantName)
    {
        $addresses = [
            'مطعم الشرق الأصيل' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 1234 5678',
                'email' => 'info@alsharqalaseel.com'
            ],
            'مطعم البحر الأحمر' => [
                'address_ar' => 'طريق السيب السريع، الخوض، مسقط',
                'address_en' => 'Seeb Highway, Al Khoudh, Muscat',
                'locations' => ['khoudh'],
                'phone' => '+968 2345 6789',
                'email' => 'info@redsea.com'
            ],
            'مطعم النخيل الذهبي' => [
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'locations' => ['maabilah'],
                'phone' => '+968 3456 7890',
                'email' => 'info@goldenpalm.com'
            ],
            'مطعم الأصالة' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 4567 8901',
                'email' => 'info@alasala.com'
            ],
            'مطعم الشرقية' => [
                'address_ar' => 'طريق السيب السريع، الخوض، مسقط',
                'address_en' => 'Seeb Highway, Al Khoudh, Muscat',
                'locations' => ['khoudh'],
                'phone' => '+968 5678 9012',
                'email' => 'info@alsharqiya.com'
            ],
            'مطعم السعادة' => [
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'locations' => ['maabilah'],
                'phone' => '+968 6789 0123',
                'email' => 'info@alsaada.com'
            ],
            'مطعم الأمانة' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 7890 1234',
                'email' => 'info@alamanah.com'
            ],
            'مطعم النور' => [
                'address_ar' => 'طريق السيب السريع، الخوض، مسقط',
                'address_en' => 'Seeb Highway, Al Khoudh, Muscat',
                'locations' => ['khoudh'],
                'phone' => '+968 8901 2345',
                'email' => 'info@alnoor.com'
            ],
            'مطعم الفردوس' => [
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'locations' => ['maabilah'],
                'phone' => '+968 9012 3456',
                'email' => 'info@alfirdaws.com'
            ],
            'مطعم الجنة' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 0123 4567',
                'email' => 'info@aljannah.com'
            ],
            // إضافة عناوين للمطاعم المتبقية
            'مطعم البحر المتوسط' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 1111 1111',
                'email' => 'info@mediterranean.com'
            ],
            'مطعم البيتزا الإيطالي' => [
                'address_ar' => 'طريق السيب السريع، الخوض، مسقط',
                'address_en' => 'Seeb Highway, Al Khoudh, Muscat',
                'locations' => ['khoudh'],
                'phone' => '+968 2222 2222',
                'email' => 'info@italianpizza.com'
            ],
            'مطعم الشواء التركي' => [
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'locations' => ['maabilah'],
                'phone' => '+968 3333 3333',
                'email' => 'info@turkishbbq.com'
            ],
            'مطعم المأكولات البحرية' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 4444 4444',
                'email' => 'info@seafood.com'
            ],
            'مطعم الشرق الأوسط' => [
                'address_ar' => 'طريق السيب السريع، الخوض، مسقط',
                'address_en' => 'Seeb Highway, Al Khoudh, Muscat',
                'locations' => ['khoudh'],
                'phone' => '+968 5555 5555',
                'email' => 'info@middleeast.com'
            ],
            'بيتزا إيطاليا' => [
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'locations' => ['maabilah'],
                'phone' => '+968 6666 6666',
                'email' => 'info@italypizza.com'
            ],
            'سوشي اليابان' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 7777 7777',
                'email' => 'info@japansushi.com'
            ],
            'برجر هاوس' => [
                'address_ar' => 'طريق السيب السريع، الخوض، مسقط',
                'address_en' => 'Seeb Highway, Al Khoudh, Muscat',
                'locations' => ['khoudh'],
                'phone' => '+968 8888 8888',
                'email' => 'info@burgerhouse.com'
            ],
            'مطعم الهندي' => [
                'address_ar' => 'شارع 18 نوفمبر، المعبيلة، مسقط',
                'address_en' => '18 November Street, Al Mabaila, Muscat',
                'locations' => ['maabilah'],
                'phone' => '+968 9999 9999',
                'email' => 'info@indianrestaurant.com'
            ],
            'كافيه الحلويات' => [
                'address_ar' => 'شارع السلطان قابوس، بوشر، مسقط',
                'address_en' => 'Sultan Qaboos Street, Bosher, Muscat',
                'locations' => ['bosher'],
                'phone' => '+968 0000 1111',
                'email' => 'info@dessertcafe.com'
            ]
        ];
        
        return $addresses[$restaurantName] ?? [
            'address_ar' => 'عنوان افتراضي، مسقط',
            'address_en' => 'Default Address, Muscat',
            'locations' => ['bosher'],
            'phone' => '+968 0000 0000',
            'email' => 'info@restaurant.com'
        ];
    }
}
