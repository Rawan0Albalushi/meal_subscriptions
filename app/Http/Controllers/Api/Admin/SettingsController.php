<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            $settings = [
                'general' => [
                    'site_name_ar' => config('app.name_ar', 'نظام الاشتراكات'),
                    'site_name_en' => config('app.name_en', 'Subscription System'),
                    'site_description_ar' => config('app.description_ar', 'نظام إدارة الاشتراكات الغذائية'),
                    'site_description_en' => config('app.description_en', 'Food Subscription Management System'),
                    'default_language' => config('app.locale', 'ar'),
                    'timezone' => config('app.timezone', 'Asia/Muscat'),
                    'currency' => config('app.currency', 'OMR'),
                    'currency_symbol' => config('app.currency_symbol', 'ر.ع'),
                ],
                'delivery' => [
                    'default_delivery_price' => config('delivery.default_price', 2.00),
                    'free_delivery_threshold' => config('delivery.free_threshold', 10.00),
                    'delivery_time_min' => config('delivery.time_min', 30),
                    'delivery_time_max' => config('delivery.time_max', 60),
                    'delivery_areas' => config('delivery.areas', ['مسقط', 'نزوى', 'صلالة']),
                ],
                'payment' => [
                    'thawani_enabled' => config('payment.thawani.enabled', true),
                    'thawani_public_key' => config('payment.thawani.public_key', ''),
                    'thawani_private_key' => config('payment.thawani.private_key', ''),
                    'bank_transfer_enabled' => config('payment.bank_transfer.enabled', true),
                    'cash_on_delivery_enabled' => config('payment.cash_on_delivery.enabled', true),
                ],
                'notifications' => [
                    'email_notifications' => config('notifications.email.enabled', true),
                    'sms_notifications' => config('notifications.sms.enabled', false),
                    'push_notifications' => config('notifications.push.enabled', true),
                ],
                'security' => [
                    'session_timeout' => config('session.lifetime', 120),
                    'max_login_attempts' => config('auth.max_attempts', 5),
                    'password_min_length' => config('auth.password_min_length', 8),
                    'require_email_verification' => config('auth.require_verification', false),
                ],
                'backup' => [
                    'auto_backup_enabled' => config('backup.auto_enabled', false),
                    'backup_frequency' => config('backup.frequency', 'daily'),
                    'backup_retention_days' => config('backup.retention_days', 30),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الإعدادات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $request->validate([
                'section' => 'required|in:general,delivery,payment,notifications,security,backup',
                'settings' => 'required|array'
            ]);

            $section = $request->section;
            $settings = $request->settings;

            // Validate settings based on section
            $this->validateSectionSettings($section, $settings);

            // Update settings in config files or database
            $this->updateSectionSettings($section, $settings);

            // Clear cache
            Cache::flush();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الإعدادات بنجاح',
                'data' => $settings
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث الإعدادات',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function validateSectionSettings($section, $settings)
    {
        switch ($section) {
            case 'general':
                $rules = [
                    'site_name_ar' => 'required|string|max:255',
                    'site_name_en' => 'required|string|max:255',
                    'site_description_ar' => 'nullable|string|max:500',
                    'site_description_en' => 'nullable|string|max:500',
                    'default_language' => 'required|in:ar,en',
                    'timezone' => 'required|string',
                    'currency' => 'required|string|max:3',
                    'currency_symbol' => 'required|string|max:10',
                ];
                break;

            case 'delivery':
                $rules = [
                    'default_delivery_price' => 'required|numeric|min:0',
                    'free_delivery_threshold' => 'required|numeric|min:0',
                    'delivery_time_min' => 'required|integer|min:15',
                    'delivery_time_max' => 'required|integer|min:30',
                    'delivery_areas' => 'required|array',
                    'delivery_areas.*' => 'string|max:100',
                ];
                break;

            case 'payment':
                $rules = [
                    'thawani_enabled' => 'boolean',
                    'thawani_public_key' => 'nullable|string',
                    'thawani_private_key' => 'nullable|string',
                    'bank_transfer_enabled' => 'boolean',
                    'cash_on_delivery_enabled' => 'boolean',
                ];
                break;

            case 'notifications':
                $rules = [
                    'email_notifications' => 'boolean',
                    'sms_notifications' => 'boolean',
                    'push_notifications' => 'boolean',
                ];
                break;

            case 'security':
                $rules = [
                    'session_timeout' => 'required|integer|min:30|max:480',
                    'max_login_attempts' => 'required|integer|min:3|max:10',
                    'password_min_length' => 'required|integer|min:6|max:20',
                    'require_email_verification' => 'boolean',
                ];
                break;

            case 'backup':
                $rules = [
                    'auto_backup_enabled' => 'boolean',
                    'backup_frequency' => 'required|in:daily,weekly,monthly',
                    'backup_retention_days' => 'required|integer|min:7|max:365',
                ];
                break;

            default:
                throw new \InvalidArgumentException('Invalid section');
        }

        validator($settings, $rules)->validate();
    }

    private function updateSectionSettings($section, $settings)
    {
        // In a real application, you would update these in a database or config files
        // For now, we'll just return the settings as they would be stored
        
        // You could implement this by:
        // 1. Storing in a settings table in the database
        // 2. Updating config files
        // 3. Using a settings management package
        
        // Example implementation for database storage:
        /*
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => "{$section}.{$key}"],
                ['value' => $value]
            );
        }
        */
    }

    public function getSystemInfo()
    {
        try {
            $systemInfo = [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'database_driver' => config('database.default'),
                'cache_driver' => config('cache.default'),
                'queue_driver' => config('queue.default'),
                'storage_disk' => config('filesystems.default'),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
            ];

            return response()->json([
                'success' => true,
                'data' => $systemInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب معلومات النظام',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clearCache()
    {
        try {
            Cache::flush();
            
            // Clear other caches
            \Artisan::call('config:clear');
            \Artisan::call('route:clear');
            \Artisan::call('view:clear');

            return response()->json([
                'success' => true,
                'message' => 'تم مسح الذاكرة المؤقتة بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في مسح الذاكرة المؤقتة',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLogs()
    {
        try {
            $logFiles = [
                'laravel.log',
                'auth.log',
                'payment.log',
                'subscription.log'
            ];

            $logs = [];
            foreach ($logFiles as $logFile) {
                $logPath = storage_path("logs/{$logFile}");
                if (file_exists($logPath)) {
                    $logs[$logFile] = [
                        'size' => filesize($logPath),
                        'modified' => filemtime($logPath),
                        'lines' => count(file($logPath))
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب ملفات السجل',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadLog($filename)
    {
        try {
            $logPath = storage_path("logs/{$filename}");
            
            if (!file_exists($logPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'ملف السجل غير موجود'
                ], 404);
            }

            return response()->download($logPath);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحميل ملف السجل',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
