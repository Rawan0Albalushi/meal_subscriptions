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
        Schema::table('subscription_types', function (Blueprint $table) {
            $table->decimal('delivery_price', 8, 2)->default(0.00)->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_types', function (Blueprint $table) {
            $table->dropColumn('delivery_price');
        });
    }
};
