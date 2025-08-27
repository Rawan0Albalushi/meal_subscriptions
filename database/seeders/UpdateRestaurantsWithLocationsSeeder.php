<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class UpdateRestaurantsWithLocationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // تحديث المطاعم الموجودة بإضافة العناوين
        $restaurants = Restaurant::all();
        
        foreach ($restaurants as $index => $restaurant) {
            // توزيع المطاعم على العناوين المختلفة
            $locations = [];
            
            if ($index % 3 === 0) {
                $locations = ['bosher'];
            } elseif ($index % 3 === 1) {
                $locations = ['khoudh'];
            } else {
                $locations = ['maabilah'];
            }
            
            // بعض المطاعم يمكن أن تكون في أكثر من موقع
            if ($index % 5 === 0) {
                $locations[] = 'bosher';
            }
            if ($index % 7 === 0) {
                $locations[] = 'khoudh';
            }
            
            // إزالة التكرار
            $locations = array_unique($locations);
            
            $restaurant->update(['locations' => $locations]);
        }
        
        $this->command->info('تم تحديث المطاعم بالعناوين بنجاح!');
    }
}
