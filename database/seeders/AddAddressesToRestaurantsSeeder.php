<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\RestaurantAddress;

class AddAddressesToRestaurantsSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = Restaurant::all();
        foreach ($restaurants as $restaurant) {
            RestaurantAddress::firstOrCreate([
                'restaurant_id' => $restaurant->id,
                'name_en' => 'Auto Primary '
            ], [
                'name_ar' => 'الفرع الرئيسي',
                'name_en' => 'Auto Primary ',
                'address_ar' => $restaurant->address_ar ?? 'عنوان افتراضي',
                'address_en' => $restaurant->address_en ?? 'Default Address',
                'area' => 'bosher',
                'area_code' => 'bosher',
                'is_primary' => true,
                'is_active' => true,
            ]);
        }
    }
}


