<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Area;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $areas = [
            [
                'name_ar' => 'بوشر',
                'name_en' => 'Bosher',
                'code' => 'bosher',
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'name_ar' => 'الخوض',
                'name_en' => 'Al Khoudh',
                'code' => 'khoudh',
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'name_ar' => 'المعبيلة',
                'name_en' => 'Al Mabaila',
                'code' => 'maabilah',
                'is_active' => true,
                'sort_order' => 3
            ]
        ];

        foreach ($areas as $area) {
            Area::updateOrCreate(
                ['code' => $area['code']],
                $area
            );
        }
    }
}