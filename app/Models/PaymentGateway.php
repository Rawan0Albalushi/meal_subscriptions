<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'is_active',
        'config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config' => 'array',
    ];

    /**
     * Get active payment gateways
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the default payment gateway
     */
    public static function getDefault()
    {
        return static::active()->first();
    }

    /**
     * Get gateway configuration value
     */
    public function getConfigValue(string $key, $default = null)
    {
        return data_get($this->config, $key, $default);
    }
}

