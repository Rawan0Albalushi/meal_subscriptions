# العلاقة بين البائع والمطعم - Seller Restaurant Relationship

## الميزات الجديدة ✅

### 1. ربط البائع بالمطعم
- **حقل `seller_id`**: تم إضافة حقل في جدول المطاعم لربط كل مطعم ببائع محدد
- **علاقة `belongsTo`**: كل مطعم ينتمي لبائع واحد
- **علاقة `hasMany`**: كل بائع يمكن أن يملك عدة مطاعم
- **حماية البيانات**: البائع يمكنه الوصول فقط لمطاعمه الخاصة

### 2. نظام صلاحيات البائع
- **Middleware مخصص**: `SellerMiddleware` للتحقق من صلاحيات البائع
- **تحقق تلقائي**: التأكد من أن المستخدم لديه دور `seller`
- **رسائل خطأ واضحة**: رسائل باللغة العربية عند رفض الوصول

### 3. واجهة إدارة المطاعم للبائعين
- **إدارة كاملة للمطاعم**: إنشاء، تعديل، حذف، تفعيل/إلغاء تفعيل
- **إدارة الوجبات**: إضافة، تعديل، حذف، تفعيل/إلغاء تفعيل الوجبات
- **رفع الصور**: دعم رفع صور للمطاعم والوجبات
- **إحصائيات**: عرض إحصائيات مفصلة لكل مطعم

## المسارات الجديدة 🔗

### مسارات إدارة المطاعم
```
GET    /api/seller/restaurants                    # قائمة مطاعم البائع
GET    /api/seller/restaurants/{id}               # عرض مطعم محدد
POST   /api/seller/restaurants                    # إنشاء مطعم جديد
PUT    /api/seller/restaurants/{id}               # تحديث مطعم
DELETE /api/seller/restaurants/{id}               # حذف مطعم
PUT    /api/seller/restaurants/{id}/toggle-status # تفعيل/إلغاء تفعيل
GET    /api/seller/restaurants/{id}/stats         # إحصائيات المطعم
```

### مسارات إدارة الوجبات
```
GET    /api/seller/restaurants/{restaurantId}/meals                    # قائمة وجبات المطعم
GET    /api/seller/restaurants/{restaurantId}/meals/{mealId}           # عرض وجبة محددة
POST   /api/seller/restaurants/{restaurantId}/meals                    # إضافة وجبة جديدة
PUT    /api/seller/restaurants/{restaurantId}/meals/{mealId}           # تحديث وجبة
DELETE /api/seller/restaurants/{restaurantId}/meals/{mealId}           # حذف وجبة
PUT    /api/seller/restaurants/{restaurantId}/meals/{mealId}/toggle-availability # تفعيل/إلغاء تفعيل
GET    /api/seller/restaurants/{restaurantId}/meals/stats              # إحصائيات الوجبات
```

### مسارات إضافية
```
GET    /api/seller/dashboard                      # لوحة تحكم البائع
```

## التغييرات التقنية 🔧

### 1. قاعدة البيانات
```sql
-- إضافة seller_id إلى جدول restaurants
ALTER TABLE restaurants ADD COLUMN seller_id BIGINT UNSIGNED NULL;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_seller_id_foreign 
FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 2. النماذج (Models)
```php
// Restaurant Model
class Restaurant extends Model
{
    protected $fillable = [
        'seller_id', // جديد
        'name_ar',
        'name_en',
        // ... باقي الحقول
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}

// User Model
class User extends Authenticatable
{
    public function restaurants()
    {
        return $this->hasMany(Restaurant::class, 'seller_id');
    }

    public function isSeller()
    {
        return $this->role === 'seller';
    }
}
```

### 3. Controllers الجديدة
- **`SellerRestaurantController`**: إدارة المطاعم للبائعين
- **`SellerMealController`**: إدارة الوجبات للبائعين
- **`SellerMiddleware`**: التحقق من صلاحيات البائع

### 4. الميزات الأمنية
- **تحقق من الملكية**: البائع يمكنه الوصول فقط لمطاعمه
- **تحقق من الصلاحيات**: التأكد من دور المستخدم
- **حماية البيانات**: عدم إمكانية الوصول لمطاعم الآخرين

## كيفية الاستخدام 📖

### 1. تسجيل الدخول كبائع
```bash
POST /api/auth/login
{
    "email": "ahmed@restaurant.com",
    "password": "password123"
}
```

### 2. إنشاء مطعم جديد
```bash
POST /api/seller/restaurants
{
    "name_ar": "مطعم جديد",
    "name_en": "New Restaurant",
    "description_ar": "وصف المطعم",
    "description_en": "Restaurant description",
    "phone": "+968 1234 5678",
    "email": "info@newrestaurant.com",
    "address_ar": "عنوان المطعم",
    "address_en": "Restaurant address",
    "locations": ["bosher", "khoudh"],
    "is_active": true
}
```

### 3. إضافة وجبة جديدة
```bash
POST /api/seller/restaurants/{restaurantId}/meals
{
    "name_ar": "وجبة جديدة",
    "name_en": "New Meal",
    "description_ar": "وصف الوجبة",
    "description_en": "Meal description",
    "price": 15.50,
    "meal_type": "lunch",
    "delivery_time": "12:30",
    "is_available": true
}
```

### 4. عرض إحصائيات المطعم
```bash
GET /api/seller/restaurants/{restaurantId}/stats
```

## بيانات البائعين التجريبية 👥

تم إنشاء 3 بائعين تجريبيين:

1. **أحمد محمد**
   - البريد: `ahmed@restaurant.com`
   - كلمة المرور: `password123`

2. **فاطمة علي**
   - البريد: `fatima@restaurant.com`
   - كلمة المرور: `password123`

3. **محمد حسن**
   - البريد: `mohammed@restaurant.com`
   - كلمة المرور: `password123`

## الميزات المستقبلية 🚀

- [ ] لوحة تحكم تفاعلية للبائعين
- [ ] نظام إشعارات للطلبات الجديدة
- [ ] تقارير مالية مفصلة
- [ ] إدارة الموظفين
- [ ] نظام تقييمات العملاء
- [ ] إدارة المخزون
- [ ] نظام الطلبات المباشرة

## ملاحظات مهمة ⚠️

1. **الأمان**: جميع المسارات محمية بـ middleware للتحقق من الصلاحيات
2. **البيانات**: البائع يمكنه الوصول فقط لمطاعمه الخاصة
3. **الصور**: يتم حفظ الصور في مجلد `storage/app/public/`
4. **الترجمة**: جميع الرسائل باللغة العربية
5. **التحقق**: يتم التحقق من صحة البيانات قبل الحفظ
