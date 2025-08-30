<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Restaurant>
 */
class RestaurantFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Restaurant::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seller_id' => User::factory()->create(['role' => 'seller'])->id,
            'name_ar' => $this->faker->company() . ' (عربي)',
            'name_en' => $this->faker->company() . ' (English)',
            'description_ar' => $this->faker->paragraph(),
            'description_en' => $this->faker->paragraph(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->email(),
            'address_ar' => $this->faker->address(),
            'address_en' => $this->faker->address(),
            'locations' => json_encode(['bosher']),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the restaurant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Set the seller for the restaurant.
     */
    public function forSeller(User $seller): static
    {
        return $this->state(fn (array $attributes) => [
            'seller_id' => $seller->id,
        ]);
    }
}
