<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\User;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('role', 'seller')->first();

        $restaurants = [
            [
                'seller_id' => $seller?->id,
                'name_ar' => 'مطعم الشرق الأصيل',
                'name_en' => 'Authentic Eastern Restaurant',
                'description_ar' => 'أطباق عربية وشرقية متنوعة',
                'description_en' => 'Variety of Arabic and Eastern dishes',
                'phone' => '+96891234567',
                'email' => 'info@eastern.com',
                'address_ar' => 'بوشر - شارع السلطان قابوس',
                'address_en' => 'Bosher - Sultan Qaboos Street',
                'is_active' => true,
            ],
            [
                'seller_id' => $seller?->id,
                'name_ar' => 'مطعم البحر المتوسط',
                'name_en' => 'Mediterranean Restaurant',
                'description_ar' => 'مأكولات بحرية وصحية',
                'description_en' => 'Seafood and healthy meals',
                'phone' => '+96897654321',
                'email' => 'info@mediterranean.com',
                'address_ar' => 'الخوض - الشارع الرئيسي',
                'address_en' => 'Al Khoudh - Main Street',
                'is_active' => true,
            ],
        ];

        foreach ($restaurants as $data) {
            Restaurant::updateOrCreate(
                ['name_en' => $data['name_en']],
                $data
            );
        }
    }
}


