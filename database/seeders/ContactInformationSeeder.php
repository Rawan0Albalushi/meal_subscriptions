<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContactInformation;

class ContactInformationSeeder extends Seeder
{
    public function run(): void
    {
        ContactInformation::updateOrCreate(
            ['id' => 1],
            [
                'phone' => '+96890000000',
                'email' => 'support@example.com',
                'is_active' => true,
            ]
        );
    }
}


