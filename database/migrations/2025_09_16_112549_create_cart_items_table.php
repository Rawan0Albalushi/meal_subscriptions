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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('meal_id')->constrained()->onDelete('cascade');
            $table->date('delivery_date');
            $table->string('meal_type'); // breakfast, lunch, dinner
            $table->decimal('price', 8, 2);
            $table->json('meal_data')->nullable(); // Store meal snapshot for historical purposes
            $table->timestamps();

            $table->unique(['cart_id', 'meal_id', 'delivery_date', 'meal_type'], 'unique_cart_meal_date_type');
            $table->index(['cart_id', 'delivery_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
