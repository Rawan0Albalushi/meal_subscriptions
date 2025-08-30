<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\RestaurantAddress;

class RestaurantAddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // الحصول على جميع المطاعم الموجودة
        $restaurants = Restaurant::all();

        foreach ($restaurants as $restaurant) {
            // إنشاء عناوين تجريبية لكل مطعم
            $addresses = [
                [
                    'name_ar' => 'الفرع الرئيسي',
                    'name_en' => 'Main Branch',
                    'address_ar' => 'شارع السلطان قابوس، بوشر',
                    'address_en' => 'Sultan Qaboos Street, Bosher',
                    'area' => 'bosher',
                    'latitude' => 23.5880,
                    'longitude' => 58.3829,
                    'is_primary' => true,
                    'is_active' => true,
                ],
                [
                    'name_ar' => 'فرع الخوض',
                    'name_en' => 'Al Khoudh Branch',
                    'address_ar' => 'شارع الخوض الرئيسي، الخوض',
                    'address_en' => 'Al Khoudh Main Street, Al Khoudh',
                    'area' => 'khoudh',
                    'latitude' => 23.5333,
                    'longitude' => 58.3833,
                    'is_primary' => false,
                    'is_active' => true,
                ],
                [
                    'name_ar' => 'فرع المعبيلة',
                    'name_en' => 'Al Mabaila Branch',
                    'address_ar' => 'شارع المعبيلة، المعبيلة',
                    'address_en' => 'Al Mabaila Street, Al Mabaila',
                    'area' => 'maabilah',
                    'latitude' => 23.6000,
                    'longitude' => 58.4000,
                    'is_primary' => false,
                    'is_active' => true,
                ],
            ];

            foreach ($addresses as $addressData) {
                RestaurantAddress::create(array_merge($addressData, [
                    'restaurant_id' => $restaurant->id
                ]));
            }
        }
    }
}
