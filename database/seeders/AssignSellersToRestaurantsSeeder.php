<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Restaurant;

class AssignSellersToRestaurantsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء بائعين إذا لم يكونوا موجودين
        $sellers = [
            [
                'name' => 'أحمد محمد',
                'email' => 'ahmed@restaurant.com',
                'password' => bcrypt('password123'),
                'role' => 'seller'
            ],
            [
                'name' => 'فاطمة علي',
                'email' => 'fatima@restaurant.com',
                'password' => bcrypt('password123'),
                'role' => 'seller'
            ],
            [
                'name' => 'محمد حسن',
                'email' => 'mohammed@restaurant.com',
                'password' => bcrypt('password123'),
                'role' => 'seller'
            ]
        ];

        foreach ($sellers as $sellerData) {
            User::firstOrCreate(
                ['email' => $sellerData['email']],
                $sellerData
            );
        }

        // الحصول على جميع البائعين
        $sellers = User::where('role', 'seller')->get();
        
        // الحصول على جميع المطاعم التي ليس لها بائع
        $restaurants = Restaurant::whereNull('seller_id')->get();

        // تعيين بائع لكل مطعم
        foreach ($restaurants as $index => $restaurant) {
            $seller = $sellers[$index % $sellers->count()];
            $restaurant->update(['seller_id' => $seller->id]);
            
            $this->command->info("تم تعيين البائع {$seller->name} للمطعم {$restaurant->name_ar}");
        }
    }
}
