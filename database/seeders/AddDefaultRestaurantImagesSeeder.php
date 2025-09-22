<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class AddDefaultRestaurantImagesSeeder extends Seeder
{
    public function run(): void
    {
        Restaurant::whereNull('logo')->update(['logo' => 'default-restaurant.png']);
    }
}


