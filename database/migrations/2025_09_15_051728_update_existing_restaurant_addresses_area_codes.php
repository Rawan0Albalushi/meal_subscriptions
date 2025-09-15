<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // تحديث البيانات الموجودة في جدول restaurant_addresses
        // ربط المناطق الموجودة بالكود المناسب
        DB::table('restaurant_addresses')
            ->where('area', 'bosher')
            ->update(['area_code' => 'bosher']);
            
        DB::table('restaurant_addresses')
            ->where('area', 'khoudh')
            ->update(['area_code' => 'khoudh']);
            
        DB::table('restaurant_addresses')
            ->where('area', 'maabilah')
            ->update(['area_code' => 'maabilah']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // إعادة تعيين area_code إلى null
        DB::table('restaurant_addresses')
            ->update(['area_code' => null]);
    }
};