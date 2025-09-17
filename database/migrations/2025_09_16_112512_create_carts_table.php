<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('delivery_address_id')->nullable()->constrained()->onDelete('set null');
            $table->date('start_date')->nullable();
            $table->text('special_instructions')->nullable();
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('delivery_price', 8, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'restaurant_id', 'subscription_type_id'], 'unique_user_restaurant_subscription');
            $table->index(['user_id', 'updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
