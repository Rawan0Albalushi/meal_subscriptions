<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class CheckRestaurantAddressesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurants = Restaurant::all(['name_ar', 'address_ar', 'address_en', 'locations', 'phone', 'email']);
        
        $this->command->info('عناوين المطاعم:');
        $this->command->line('');
        
        foreach ($restaurants as $restaurant) {
            $this->command->line("🏪 {$restaurant->name_ar}:");
            $this->command->line("   📍 العنوان العربي: {$restaurant->address_ar}");
            $this->command->line("   📍 العنوان الإنجليزي: {$restaurant->address_en}");
            $this->command->line("   🗺️ المناطق: " . implode(', ', $restaurant->locations ?? []));
            $this->command->line("   📞 الهاتف: {$restaurant->phone}");
            $this->command->line("   📧 البريد الإلكتروني: {$restaurant->email}");
            $this->command->line('');
        }
        
        $this->command->info("إجمالي عدد المطاعم: " . $restaurants->count());
    }
}
