# نظام عناوين المطاعم

## نظرة عامة

تم إضافة نظام متكامل لإدارة عناوين المطاعم في التطبيق، مما يتيح للبائعين إدارة عناوين متعددة لكل مطعم مع إمكانية تحديد عنوان رئيسي.

## الميزات الجديدة

### 1. جدول عناوين المطاعم
- **جدول `restaurant_addresses`**: يحتوي على جميع عناوين المطاعم
- **الحقول الرئيسية**:
  - `restaurant_id`: معرف المطعم
  - `name_ar` / `name_en`: اسم العنوان بالعربية والإنجليزية
  - `address_ar` / `address_en`: العنوان التفصيلي
  - `area`: المنطقة (بوشر، الخوض، المعبيلة)
  - `latitude` / `longitude`: إحداثيات الموقع
  - `is_primary`: العنوان الرئيسي
  - `is_active`: حالة النشاط

### 2. Model العلاقات
- **Restaurant Model**: تم إضافة علاقات جديدة:
  - `addresses()`: جميع عناوين المطعم
  - `primaryAddress()`: العنوان الرئيسي فقط

- **RestaurantAddress Model**: 
  - علاقة `restaurant()` مع المطعم
  - Accessors للترجمة التلقائية
  - دالة `getAvailableAreas()` للحصول على المناطق المتاحة

### 3. API Endpoints

#### للبائعين (Seller):
```
GET    /api/seller/restaurants/{restaurantId}/addresses
GET    /api/seller/restaurants/{restaurantId}/addresses/{addressId}
POST   /api/seller/restaurants/{restaurantId}/addresses
PUT    /api/seller/restaurants/{restaurantId}/addresses/{addressId}
DELETE /api/seller/restaurants/{restaurantId}/addresses/{addressId}
PUT    /api/seller/restaurants/{restaurantId}/addresses/{addressId}/set-primary
```

#### للجميع:
```
GET    /api/restaurant-addresses/areas
```

### 4. واجهة المستخدم

#### مكون إدارة العناوين (`RestaurantAddressManager`)
- عرض جميع عناوين المطعم
- إضافة عنوان جديد
- تعديل العنوان الموجود
- حذف العنوان
- تعيين عنوان كرئيسي
- عرض تفاصيل العنوان المحدد

#### مكون اختيار العناوين (`AddressDropdown`)
- قائمة منسدلة لاختيار العنوان
- إمكانية إضافة عنوان جديد مباشرة
- عرض تفاصيل العنوان المحدد

#### تحديث صفحة إدارة المطاعم
- إضافة تبويب "إدارة العناوين"
- زر إدارة العناوين في كل بطاقة مطعم
- واجهة متكاملة للتنقل بين التبويبات

## كيفية الاستخدام

### للبائعين:

1. **إضافة عنوان جديد**:
   - انتقل إلى صفحة إدارة المطاعم
   - اضغط على زر 🏠 في بطاقة المطعم
   - اضغط على "إضافة عنوان جديد"
   - املأ البيانات المطلوبة
   - حدد إذا كان العنوان رئيسي

2. **إدارة العناوين**:
   - تعديل العناوين الموجودة
   - حذف العناوين غير المرغوبة
   - تعيين عنوان كرئيسي
   - تفعيل/إلغاء تفعيل العناوين

### للمطورين:

1. **استخدام Model**:
```php
// الحصول على جميع عناوين المطعم
$restaurant = Restaurant::find(1);
$addresses = $restaurant->addresses;

// الحصول على العنوان الرئيسي
$primaryAddress = $restaurant->primaryAddress;

// إضافة عنوان جديد
$restaurant->addresses()->create([
    'name_ar' => 'الفرع الرئيسي',
    'name_en' => 'Main Branch',
    'address_ar' => 'شارع السلطان قابوس، بوشر',
    'address_en' => 'Sultan Qaboos Street, Bosher',
    'area' => 'bosher',
    'is_primary' => true
]);
```

2. **استخدام API**:
```javascript
// الحصول على عناوين المطعم
const response = await axios.get(`/api/seller/restaurants/${restaurantId}/addresses`);

// إضافة عنوان جديد
const newAddress = await axios.post(`/api/seller/restaurants/${restaurantId}/addresses`, {
    name_ar: 'الفرع الجديد',
    name_en: 'New Branch',
    address_ar: 'العنوان بالعربية',
    address_en: 'Address in English',
    area: 'bosher',
    is_primary: false
});
```

## قاعدة البيانات

### Migration:
```php
Schema::create('restaurant_addresses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
    $table->string('name_ar');
    $table->string('name_en');
    $table->text('address_ar');
    $table->text('address_en');
    $table->string('area');
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();
    $table->boolean('is_primary')->default(false);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### Seeder:
تم إنشاء `RestaurantAddressSeeder` لإضافة بيانات تجريبية لعناوين المطاعم.

## التحسينات المستقبلية

1. **خريطة تفاعلية**: إضافة خريطة لاختيار الإحداثيات
2. **تحقق من العنوان**: التحقق من صحة العناوين
3. **إحصائيات التوصيل**: ربط العناوين بإحصائيات التوصيل
4. **مناطق التوصيل**: تحديد مناطق التوصيل لكل عنوان
5. **أوقات العمل**: ربط أوقات العمل بكل عنوان

## ملاحظات مهمة

- لا يمكن حذف العنوان الرئيسي إذا كان هناك عناوين أخرى نشطة
- عند تعيين عنوان كرئيسي، يتم إلغاء العنوان الرئيسي السابق تلقائياً
- جميع العناوين تدعم اللغتين العربية والإنجليزية
- يتم التحقق من صحة البيانات قبل الحفظ
