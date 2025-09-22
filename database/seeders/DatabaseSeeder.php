<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ContactInformationSeeder::class,
            AreaSeeder::class,
            RoleTestUsersSeeder::class,
            RestaurantSeeder::class,
            RestaurantAddressSeeder::class,
            AddDefaultRestaurantImagesSeeder::class,
            AddMealsToAlSharqAlAseelSeeder::class,
            SubscriptionTypeSeeder::class,
            PaymentGatewaySeeder::class,
        ]);
    }
}


