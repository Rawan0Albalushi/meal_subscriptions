# دليل اختبار ميزات البائع - Seller Features Testing Guide

## اختبار تسجيل الدخول كبائع

### 1. تسجيل الدخول
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@restaurant.com",
    "password": "password123"
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "أحمد محمد",
      "email": "ahmed@restaurant.com",
      "role": "seller"
    },
    "token": "1|abc123..."
  }
}
```

### 2. حفظ التوكن للاستخدام اللاحق
```bash
export SELLER_TOKEN="1|abc123..."
```

## اختبار إدارة المطاعم

### 3. عرض مطاعم البائع
```bash
curl -X GET http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

### 4. إنشاء مطعم جديد
```bash
curl -X POST http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_ar": "مطعم الاختبار",
    "name_en": "Test Restaurant",
    "description_ar": "مطعم للاختبار فقط",
    "description_en": "Test restaurant only",
    "phone": "+968 9999 9999",
    "email": "test@restaurant.com",
    "address_ar": "عنوان الاختبار",
    "address_en": "Test Address",
    "locations": ["bosher"],
    "is_active": true
  }'
```

### 5. عرض مطعم محدد
```bash
curl -X GET http://localhost:8000/api/seller/restaurants/1 \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

### 6. عرض إحصائيات المطعم
```bash
curl -X GET http://localhost:8000/api/seller/restaurants/1/stats \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

## اختبار إدارة الوجبات

### 7. عرض وجبات المطعم
```bash
curl -X GET http://localhost:8000/api/seller/restaurants/1/meals \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

### 8. إضافة وجبة جديدة
```bash
curl -X POST http://localhost:8000/api/seller/restaurants/1/meals \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_ar": "وجبة الاختبار",
    "name_en": "Test Meal",
    "description_ar": "وجبة للاختبار فقط",
    "description_en": "Test meal only",
    "price": 25.50,
    "meal_type": "lunch",
    "delivery_time": "12:00",
    "is_available": true
  }'
```

### 9. عرض إحصائيات الوجبات
```bash
curl -X GET http://localhost:8000/api/seller/restaurants/1/meals/stats \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

## اختبار الأمان

### 10. محاولة الوصول بدون توكن
```bash
curl -X GET http://localhost:8000/api/seller/restaurants \
  -H "Accept: application/json"
```

**النتيجة المتوقعة:**
```json
{
  "message": "Unauthenticated."
}
```

### 11. محاولة الوصول بدور عميل
```bash
# تسجيل الدخول كعميل أولاً
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'

# ثم محاولة الوصول لمسارات البائع
curl -X GET http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Accept: application/json"
```

**النتيجة المتوقعة:**
```json
{
  "success": false,
  "message": "غير مصرح لك بالوصول. يجب أن تكون بائعاً."
}
```

## اختبار رفع الصور

### 12. إنشاء مطعم مع صورة
```bash
curl -X POST http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "name_ar=مطعم مع صورة" \
  -F "name_en=Restaurant with Image" \
  -F "description_ar=مطعم مع صورة شعار" \
  -F "description_en=Restaurant with logo image" \
  -F "phone=+968 8888 8888" \
  -F "email=image@restaurant.com" \
  -F "address_ar=عنوان مع صورة" \
  -F "address_en=Address with image" \
  -F "locations[]=bosher" \
  -F "is_active=true" \
  -F "logo=@/path/to/logo.jpg"
```

### 13. إضافة وجبة مع صورة
```bash
curl -X POST http://localhost:8000/api/seller/restaurants/1/meals \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F "name_ar=وجبة مع صورة" \
  -F "name_en=Meal with Image" \
  -F "description_ar=وجبة مع صورة" \
  -F "description_en=Meal with image" \
  -F "price=30.00" \
  -F "meal_type=dinner" \
  -F "delivery_time=19:00" \
  -F "is_available=true" \
  -F "image=@/path/to/meal.jpg"
```

## اختبار التحديث والحذف

### 14. تحديث مطعم
```bash
curl -X PUT http://localhost:8000/api/seller/restaurants/1 \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_ar": "مطعم محدث",
    "name_en": "Updated Restaurant",
    "description_ar": "تم تحديث الوصف",
    "description_en": "Description updated"
  }'
```

### 15. تفعيل/إلغاء تفعيل مطعم
```bash
curl -X PUT http://localhost:8000/api/seller/restaurants/1/toggle-status \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

### 16. تفعيل/إلغاء تفعيل وجبة
```bash
curl -X PUT http://localhost:8000/api/seller/restaurants/1/meals/1/toggle-availability \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Accept: application/json"
```

## النتائج المتوقعة ✅

### عند نجاح العمليات:
- **الاستجابة 200/201**: للعمليات الناجحة
- **رسائل بالعربية**: "تم إنشاء المطعم بنجاح"
- **بيانات صحيحة**: البيانات المطلوبة في الاستجابة

### عند حدوث أخطاء:
- **الاستجابة 403**: عند عدم وجود صلاحيات
- **الاستجابة 422**: عند أخطاء التحقق من البيانات
- **رسائل واضحة**: باللغة العربية

## ملاحظات مهمة ⚠️

1. **تأكد من تشغيل الخادم**: `php artisan serve`
2. **تأكد من قاعدة البيانات**: `php artisan migrate:status`
3. **تأكد من البائعين**: تم إنشاؤهم في seeder
4. **اختبار الصور**: تأكد من وجود مجلد `storage/app/public/`
5. **الصلاحيات**: تأكد من صلاحيات الملفات

## استكشاف الأخطاء 🔧

### إذا فشل تسجيل الدخول:
- تحقق من وجود البائع في قاعدة البيانات
- تحقق من كلمة المرور
- تحقق من دور المستخدم

### إذا فشل الوصول للمطاعم:
- تحقق من التوكن
- تحقق من دور المستخدم
- تحقق من ربط المطاعم بالبائع

### إذا فشل رفع الصور:
- تحقق من صلاحيات المجلد
- تحقق من حجم الصورة
- تحقق من نوع الملف
