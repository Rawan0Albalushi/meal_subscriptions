<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Restaurant;
use App\Models\Meal;

class FixImagePaths extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:image-paths';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix image paths in database to use relative paths instead of full URLs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== إصلاح مسارات الصور في قاعدة البيانات ===');

        // إصلاح مسارات صور المطاعم
        $this->info('إصلاح مسارات شعارات المطاعم...');
        $restaurants = Restaurant::whereNotNull('logo')->get();
        $restaurantCount = 0;
        
        foreach ($restaurants as $restaurant) {
            $oldLogo = $restaurant->logo;
            
            // إذا كان المسار يحتوي على /storage/ في البداية، نزيله
            if (strpos($oldLogo, '/storage/') === 0) {
                $newLogo = str_replace('/storage/', '', $oldLogo);
                $restaurant->update(['logo' => $newLogo]);
                $this->line("تم إصلاح شعار المطعم ID {$restaurant->id}: {$oldLogo} -> {$newLogo}");
                $restaurantCount++;
            } else {
                $this->line("شعار المطعم ID {$restaurant->id} صحيح: {$oldLogo}");
            }
        }

        $this->info("تم إصلاح {$restaurantCount} شعار مطعم");

        // إصلاح مسارات صور الوجبات
        $this->info('إصلاح مسارات صور الوجبات...');
        $meals = Meal::whereNotNull('image')->get();
        $mealCount = 0;
        
        foreach ($meals as $meal) {
            $oldImage = $meal->image;
            
            // إذا كان المسار يحتوي على /storage/ في البداية، نزيله
            if (strpos($oldImage, '/storage/') === 0) {
                $newImage = str_replace('/storage/', '', $oldImage);
                $meal->update(['image' => $newImage]);
                $this->line("تم إصلاح صورة الوجبة ID {$meal->id}: {$oldImage} -> {$newImage}");
                $mealCount++;
            } else {
                $this->line("صورة الوجبة ID {$meal->id} صحيحة: {$oldImage}");
            }
        }

        $this->info("تم إصلاح {$mealCount} صورة وجبة");

        $this->info('=== تم الانتهاء من إصلاح المسارات ===');
        
        return 0;
    }
}