# تطبيق نظام المناطق في قاعدة البيانات

## نظرة عامة
تم تطبيق نظام إدارة المناطق في قاعدة البيانات بدلاً من البيانات الثابتة، مما يتيح للمديرين إضافة وتعديل وحذف المناطق من خلال واجهة الإدارة.

## التغييرات المنجزة

### 1. قاعدة البيانات

#### Migration جديد: `create_areas_table`
```sql
CREATE TABLE areas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Migration لتحديث `restaurant_addresses`
- إضافة عمود `area_code` للربط بجدول المناطق
- إضافة Foreign Key constraint

#### Migration لتحديث البيانات الموجودة
- ربط البيانات الموجودة بالمناطق الجديدة

### 2. النماذج (Models)

#### نموذج `Area` جديد
```php
class Area extends Model
{
    protected $fillable = ['name_ar', 'name_en', 'code', 'is_active', 'sort_order'];
    
    // العلاقة مع عناوين المطاعم
    public function restaurantAddresses()
    
    // الحصول على المناطق النشطة
    public static function getActiveAreas()
    
    // الحصول على المناطق بصيغة API
    public static function getAreasForApi()
}
```

#### تحديث نموذج `RestaurantAddress`
- إضافة العلاقة مع نموذج `Area`
- تحديث دالة `getAvailableAreas()` لاستخدام البيانات من قاعدة البيانات

### 3. Controllers

#### `AreaController` جديد
```php
class AreaController extends Controller
{
    // CRUD operations
    public function index()      // جلب جميع المناطق
    public function show($id)    // جلب منطقة محددة
    public function store()      // إنشاء منطقة جديدة
    public function update()     // تحديث منطقة
    public function destroy()    // حذف منطقة
    
    // API endpoints
    public function getActiveAreas()    // المناطق النشطة فقط
    public function getAreasForApi()    // بصيغة API للتوافق
}
```

### 4. المسارات (Routes)

#### مسارات عامة
```php
Route::get('/areas', [AreaController::class, 'getActiveAreas']);
Route::get('/areas/api-format', [AreaController::class, 'getAreasForApi']);
```

#### مسارات الإدارة
```php
Route::apiResource('areas', AreaController::class);
```

### 5. البيانات الأساسية

#### `AreaSeeder`
```php
$areas = [
    ['name_ar' => 'بوشر', 'name_en' => 'Bosher', 'code' => 'bosher'],
    ['name_ar' => 'الخوض', 'name_en' => 'Al Khoudh', 'code' => 'khoudh'],
    ['name_ar' => 'المعبيلة', 'name_en' => 'Al Mabaila', 'code' => 'maabilah']
];
```

### 6. الواجهة الأمامية

#### صفحة إدارة المناطق `AdminAreas.jsx`
- عرض جميع المناطق في جدول
- إضافة منطقة جديدة
- تعديل منطقة موجودة
- حذف منطقة
- تفعيل/إلغاء تفعيل المنطقة

#### تحديث المكونات الموجودة
- `AddressDropdown.jsx`: استخدام API الجديد
- `RestaurantAddressManager.jsx`: استخدام API الجديد

#### إضافة رابط في لوحة الإدارة
- إضافة "المناطق" في قائمة الإدارة
- إضافة المسار `/admin/areas`

## API Endpoints

### مسارات عامة
- `GET /api/areas` - جلب المناطق النشطة
- `GET /api/areas/api-format` - جلب المناطق بصيغة API (للتوافق)

### مسارات الإدارة (تتطلب authentication)
- `GET /api/admin/areas` - جلب جميع المناطق
- `POST /api/admin/areas` - إنشاء منطقة جديدة
- `GET /api/admin/areas/{id}` - جلب منطقة محددة
- `PUT /api/admin/areas/{id}` - تحديث منطقة
- `DELETE /api/admin/areas/{id}` - حذف منطقة

## التوافق مع الكود القديم

تم الحفاظ على التوافق مع الكود القديم من خلال:
1. الاحتفاظ بـ API القديم `/api/restaurant-addresses/areas`
2. استخدام البيانات من قاعدة البيانات في `RestaurantAddress::getAvailableAreas()`
3. fallback للبيانات الثابتة في حالة عدم وجود البيانات في قاعدة البيانات

## كيفية الاستخدام

### 1. تشغيل المايجريشن
```bash
php artisan migrate
```

### 2. إضافة البيانات الأساسية
```bash
php artisan db:seed --class=AreaSeeder
```

### 3. الوصول لإدارة المناطق
- تسجيل الدخول كمدير
- الذهاب إلى `/admin/areas`
- إضافة/تعديل/حذف المناطق

## المميزات الجديدة

1. **إدارة ديناميكية**: إمكانية إضافة مناطق جديدة دون تعديل الكود
2. **ترتيب مخصص**: إمكانية ترتيب المناطق حسب الحاجة
3. **تفعيل/إلغاء تفعيل**: إمكانية إخفاء مناطق معينة
4. **دعم متعدد اللغات**: أسماء بالعربية والإنجليزية
5. **واجهة إدارة سهلة**: واجهة بديهية لإدارة المناطق
6. **API متكامل**: API كامل لجميع العمليات

## اختبار النظام

تم إنشاء ملف `test_areas_api.html` لاختبار جميع API endpoints والتأكد من عمل النظام بشكل صحيح.

## الخطوات التالية

1. اختبار النظام في بيئة التطوير
2. إضافة المزيد من المناطق حسب الحاجة
3. تحديث الوثائق للمستخدمين
4. تدريب المديرين على استخدام النظام الجديد
