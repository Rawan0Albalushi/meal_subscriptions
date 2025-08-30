<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Restaurant;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SellerRestaurantFilteringTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_only_see_their_own_restaurants()
    {
        // Create two sellers
        $seller1 = User::factory()->create(['role' => 'seller']);
        $seller2 = User::factory()->create(['role' => 'seller']);

        // Create restaurants for each seller
        $restaurant1 = Restaurant::factory()->forSeller($seller1)->create();
        $restaurant2 = Restaurant::factory()->forSeller($seller2)->create();

        // Authenticate as seller1
        Sanctum::actingAs($seller1);

        // Make request to get restaurants
        $response = $this->getJson('/api/seller/restaurants');

        // Assert response is successful
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'name_ar',
                    'name_en',
                    'seller_id'
                ]
            ]
        ]);

        // Assert only seller1's restaurant is returned
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($restaurant1->id, $data[0]['id']);
        $this->assertEquals($seller1->id, $data[0]['seller_id']);

        // Assert seller2's restaurant is not included
        $this->assertNotContains($restaurant2->id, collect($data)->pluck('id'));
    }

    public function test_seller_cannot_access_other_sellers_restaurant()
    {
        // Create two sellers
        $seller1 = User::factory()->create(['role' => 'seller']);
        $seller2 = User::factory()->create(['role' => 'seller']);

        // Create a restaurant for seller2
        $restaurant2 = Restaurant::factory()->forSeller($seller2)->create();

        // Authenticate as seller1
        Sanctum::actingAs($seller1);

        // Try to access seller2's restaurant
        $response = $this->getJson("/api/seller/restaurants/{$restaurant2->id}");

        // Assert access is denied
        $response->assertStatus(404);
    }

    public function test_seller_can_access_their_own_restaurant()
    {
        // Create a seller
        $seller = User::factory()->create(['role' => 'seller']);

        // Create a restaurant for the seller
        $restaurant = Restaurant::factory()->forSeller($seller)->create();

        // Authenticate as the seller
        Sanctum::actingAs($seller);

        // Access their own restaurant
        $response = $this->getJson("/api/seller/restaurants/{$restaurant->id}");

        // Assert access is granted
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'id' => $restaurant->id,
                'seller_id' => $seller->id
            ]
        ]);
    }
}
