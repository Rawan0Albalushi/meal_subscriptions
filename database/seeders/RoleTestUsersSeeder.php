<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleTestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin', 'email' => 'admin@example.com', 'password' => Hash::make('password'), 'role' => 'admin'],
            ['name' => 'Seller One', 'email' => 'seller1@example.com', 'password' => Hash::make('password'), 'role' => 'seller'],
            ['name' => 'Customer One', 'email' => 'customer1@example.com', 'password' => Hash::make('password'), 'role' => 'customer'],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}


