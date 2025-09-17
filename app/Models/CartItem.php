<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'meal_id',
        'delivery_date',
        'meal_type',
        'price',
        'meal_data',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'price' => 'decimal:2',
        'meal_data' => 'array',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function meal()
    {
        return $this->belongsTo(Meal::class);
    }

    public function storeMealData()
    {
        if ($this->meal) {
            $this->meal_data = [
                'name_ar' => $this->meal->name_ar,
                'name_en' => $this->meal->name_en,
                'description_ar' => $this->meal->description_ar,
                'description_en' => $this->meal->description_en,
                'image' => $this->meal->image,
                'meal_type' => $this->meal->meal_type,
                'delivery_time' => $this->meal->delivery_time,
            ];
            $this->save();
        }
    }
}
