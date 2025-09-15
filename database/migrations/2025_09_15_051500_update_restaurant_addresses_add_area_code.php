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
        Schema::table('restaurant_addresses', function (Blueprint $table) {
            // إضافة عمود area_code للربط بجدول المناطق
            $table->string('area_code')->nullable()->after('area');
            
            // إضافة foreign key constraint
            $table->foreign('area_code')->references('code')->on('areas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurant_addresses', function (Blueprint $table) {
            $table->dropForeign(['area_code']);
            $table->dropColumn('area_code');
        });
    }
};
