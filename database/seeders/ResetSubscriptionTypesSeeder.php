<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Restaurant;
use App\Models\SubscriptionType;
use Illuminate\Support\Facades\DB;

class ResetSubscriptionTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // حذف جميع البيانات الموجودة في جدول subscription_types بطريقة آمنة
        SubscriptionType::query()->delete();
        
        // إعادة تعيين auto increment
        DB::statement('ALTER TABLE subscription_types AUTO_INCREMENT = 1');
        
        // الحصول على جميع المطاعم
        $restaurants = Restaurant::all();
        
        foreach ($restaurants as $restaurant) {
            // إنشاء اشتراك أسبوعي مع توصيل مجاني
            SubscriptionType::create([
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'اشتراك أسبوعي',
                'name_en' => 'Weekly Subscription',
                'description_ar' => 'اشتراك لمدة أسبوع واحد مع توصيل مجاني',
                'description_en' => 'One week subscription with free delivery',
                'type' => 'weekly',
                'price' => 100.00, // سعر الاشتراك الأساسي
                'delivery_price' => 0.00, // توصيل مجاني
                'meals_count' => 4, // عدد الوجبات في الأسبوع
                'is_active' => true,
            ]);
            
            // إنشاء اشتراك شهري مع توصيل بقيمة 20 ريال
            SubscriptionType::create([
                'restaurant_id' => $restaurant->id,
                'name_ar' => 'اشتراك شهري',
                'name_en' => 'Monthly Subscription',
                'description_ar' => 'اشتراك لمدة شهر واحد مع توصيل بقيمة 20 ريال',
                'description_en' => 'One month subscription with 20 SAR delivery fee',
                'type' => 'monthly',
                'price' => 350.00, // سعر الاشتراك الأساسي
                'delivery_price' => 20.00, // رسوم التوصيل
                'meals_count' => 14, // عدد الوجبات في الشهر
                'is_active' => true,
            ]);
        }
        
        $this->command->info('تم حذف وإعادة إنشاء جميع أنواع الاشتراكات بنجاح!');
        $this->command->info('عدد المطاعم المعالجة: ' . $restaurants->count());
        $this->command->info('عدد أنواع الاشتراكات المنشأة: ' . ($restaurants->count() * 2));
    }
}
