<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\RestaurantAddress;

class RestaurantAddressSeeder extends Seeder
{
    public function run(): void
    {
        $restaurant = Restaurant::first();
        if (!$restaurant) {
            return;
        }

        $addresses = [
            [
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'الفرع الرئيسي',
                'name_en' => 'Main Branch',
                'address_ar' => 'بوشر - الشارع الرئيسي',
                'address_en' => 'Bosher - Main Street',
                'area' => 'bosher',
                'area_code' => 'bosher',
                'latitude' => 23.58589,
                'longitude' => 58.40592,
                'is_primary' => true,
                'is_active' => true,
            ],
            [
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'فرع الخوض',
                'name_en' => 'Khoudh Branch',
                'address_ar' => 'الخوض - بالقرب من دوار الجامعة',
                'address_en' => 'Al Khoudh - Near University Roundabout',
                'area' => 'khoudh',
                'area_code' => 'khoudh',
                'latitude' => 23.60000,
                'longitude' => 58.17000,
                'is_primary' => false,
                'is_active' => true,
            ],
        ];

        foreach ($addresses as $data) {
            RestaurantAddress::updateOrCreate(
                [
                    'restaurant_id' => $data['restaurant_id'],
                    'name_en' => $data['name_en'],
                ],
                $data
            );
        }
    }
}


