<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\Meal;

class CheckMealsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurant = Restaurant::where('name_ar', 'مطعم الشرق الأصيل')->first();
        
        if (!$restaurant) {
            $this->command->error('مطعم الشرق الأصيل غير موجود');
            return;
        }

        $meals = Meal::where('restaurant_id', $restaurant->id)->get();
        
        $this->command->info('الوجبات في مطعم الشرق الأصيل:');
        foreach ($meals as $meal) {
            $this->command->line("- {$meal->name_ar} ({$meal->meal_type}) - {$meal->price} ريال عماني");
        }
        
        $this->command->info("إجمالي عدد الوجبات: " . $meals->count());
    }
}
