<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Restaurant;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SellerRestaurantApiResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_restaurants_api_returns_correct_format()
    {
        // Create a seller
        $seller = User::factory()->create(['role' => 'seller']);

        // Create restaurants for the seller
        $restaurant1 = Restaurant::factory()->forSeller($seller)->create();
        $restaurant2 = Restaurant::factory()->forSeller($seller)->create();

        // Authenticate as the seller
        Sanctum::actingAs($seller);

        // Make request to get restaurants
        $response = $this->getJson('/api/seller/restaurants');

        // Assert response is successful
        $response->assertStatus(200);
        
        // Assert response structure
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'seller_id',
                    'name_ar',
                    'name_en',
                    'description_ar',
                    'description_en',
                    'phone',
                    'email',
                    'address_ar',
                    'address_en',
                    'locations',
                    'is_active',
                    'created_at',
                    'updated_at'
                ]
            ]
        ]);

        // Assert success is true
        $response->assertJson(['success' => true]);

        // Assert data contains the correct restaurants
        $data = $response->json('data');
        $this->assertCount(2, $data);
        
        $restaurantIds = collect($data)->pluck('id')->toArray();
        $this->assertContains($restaurant1->id, $restaurantIds);
        $this->assertContains($restaurant2->id, $restaurantIds);
    }

    public function test_seller_restaurants_api_includes_meals_and_subscription_types()
    {
        // Create a seller
        $seller = User::factory()->create(['role' => 'seller']);

        // Create a restaurant for the seller
        $restaurant = Restaurant::factory()->forSeller($seller)->create();

        // Authenticate as the seller
        Sanctum::actingAs($seller);

        // Make request to get restaurants
        $response = $this->getJson('/api/seller/restaurants');

        // Assert response is successful
        $response->assertStatus(200);
        
        // Assert response includes meals and subscription_types relationships
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'meals',
                    'subscription_types'
                ]
            ]
        ]);
    }
}
