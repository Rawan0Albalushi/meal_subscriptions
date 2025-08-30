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
        Schema::create('restaurant_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('name_ar'); // اسم العنوان بالعربية
            $table->string('name_en'); // اسم العنوان بالإنجليزية
            $table->text('address_ar'); // العنوان التفصيلي بالعربية
            $table->text('address_en'); // العنوان التفصيلي بالإنجليزية
            $table->string('area'); // المنطقة (بوشر، الخوض، المعبيلة)
            $table->decimal('latitude', 10, 8)->nullable(); // خط العرض
            $table->decimal('longitude', 11, 8)->nullable(); // خط الطول
            $table->boolean('is_primary')->default(false); // العنوان الرئيسي
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_addresses');
    }
};
