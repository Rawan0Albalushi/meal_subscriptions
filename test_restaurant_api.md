# اختبار API إضافة مطعم جديد

## 1. تسجيل الدخول كبائع

### الطلب:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "seller@test.com",
    "password": "password"
  }'
```

### الاستجابة المتوقعة:
```json
{
  "success": true,
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Test Seller",
    "email": "seller@test.com",
    "role": "seller"
  }
}
```

## 2. إضافة مطعم جديد

### الطلب:
```bash
curl -X POST http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name_ar=مطعم الاختبار" \
  -F "name_en=Test Restaurant" \
  -F "description_ar=مطعم رائع يقدم أشهى الأطباق" \
  -F "description_en=Amazing restaurant serving delicious dishes" \
  -F "phone=+968 1234 5678" \
  -F "email=restaurant@test.com" \
  -F "address_ar=شارع السلطان قابوس، بوشر" \
  -F "address_en=Sultan Qaboos Street, Bosher" \
  -F "locations[]=bosher" \
  -F "locations[]=khoudh" \
  -F "is_active=1"
```

### الاستجابة المتوقعة:
```json
{
  "success": true,
  "message": "تم إنشاء المطعم بنجاح",
  "data": {
    "id": 1,
    "seller_id": 1,
    "name_ar": "مطعم الاختبار",
    "name_en": "Test Restaurant",
    "description_ar": "مطعم رائع يقدم أشهى الأطباق",
    "description_en": "Amazing restaurant serving delicious dishes",
    "phone": "+968 1234 5678",
    "email": "restaurant@test.com",
    "address_ar": "شارع السلطان قابوس، بوشر",
    "address_en": "Sultan Qaboos Street, Bosher",
    "locations": ["bosher", "khoudh"],
    "logo": null,
    "is_active": true,
    "created_at": "2025-08-30T11:30:00.000000Z",
    "updated_at": "2025-08-30T11:30:00.000000Z"
  }
}
```

## 3. إضافة مطعم مع شعار

### الطلب:
```bash
curl -X POST http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name_ar=مطعم مع شعار" \
  -F "name_en=Restaurant with Logo" \
  -F "description_ar=مطعم مع شعار جميل" \
  -F "description_en=Restaurant with beautiful logo" \
  -F "phone=+968 9876 5432" \
  -F "email=logo@restaurant.com" \
  -F "address_ar=شارع السلطان قابوس، الخوض" \
  -F "address_en=Sultan Qaboos Street, Khoudh" \
  -F "locations[]=khoudh" \
  -F "is_active=1" \
  -F "logo=@/path/to/logo.png"
```

## 4. اختبار الأخطاء

### أ. بدون تسجيل دخول:
```bash
curl -X POST http://localhost:8000/api/seller/restaurants \
  -F "name_ar=مطعم الاختبار" \
  -F "name_en=Test Restaurant"
```

### ب. بيانات غير صحيحة:
```bash
curl -X POST http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name_ar=" \
  -F "name_en=" \
  -F "email=invalid-email"
```

## 5. جلب قائمة المطاعم

### الطلب:
```bash
curl -X GET http://localhost:8000/api/seller/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### الاستجابة المتوقعة:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "seller_id": 1,
      "name_ar": "مطعم الاختبار",
      "name_en": "Test Restaurant",
      "description_ar": "مطعم رائع يقدم أشهى الأطباق",
      "description_en": "Amazing restaurant serving delicious dishes",
      "phone": "+968 1234 5678",
      "email": "restaurant@test.com",
      "address_ar": "شارع السلطان قابوس، بوشر",
      "address_en": "Sultan Qaboos Street, Bosher",
      "locations": ["bosher", "khoudh"],
      "logo": null,
      "is_active": true,
      "created_at": "2025-08-30T11:30:00.000000Z",
      "updated_at": "2025-08-30T11:30:00.000000Z",
      "meals": [],
      "subscription_types": []
    }
  ]
}
```

## 6. اختبار باستخدام JavaScript

```javascript
// تسجيل الدخول
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'seller@test.com',
    password: 'password'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// إضافة مطعم
const formData = new FormData();
formData.append('name_ar', 'مطعم الاختبار');
formData.append('name_en', 'Test Restaurant');
formData.append('description_ar', 'مطعم رائع يقدم أشهى الأطباق');
formData.append('description_en', 'Amazing restaurant serving delicious dishes');
formData.append('phone', '+968 1234 5678');
formData.append('email', 'restaurant@test.com');
formData.append('address_ar', 'شارع السلطان قابوس، بوشر');
formData.append('address_en', 'Sultan Qaboos Street, Bosher');
formData.append('locations[]', 'bosher');
formData.append('locations[]', 'khoudh');
formData.append('is_active', '1');

const restaurantResponse = await fetch('/api/seller/restaurants', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const restaurantData = await restaurantResponse.json();
console.log(restaurantData);
```

## 7. اختبار الأخطاء الشائعة

### أ. عدم وجود حقول مطلوبة:
```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": {
    "name_ar": ["حقل اسم المطعم (عربي) مطلوب"],
    "name_en": ["حقل اسم المطعم (إنجليزي) مطلوب"]
  }
}
```

### ب. صورة كبيرة جداً:
```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": {
    "logo": ["حجم الملف يجب أن يكون أقل من 5 ميجابايت"]
  }
}
```

### ج. نوع ملف غير مدعوم:
```json
{
  "success": false,
  "message": "بيانات غير صحيحة",
  "errors": {
    "logo": ["نوع الملف يجب أن يكون: jpeg, png, jpg, gif"]
  }
}
```

## 8. خطوات الاختبار

1. **تشغيل الخادم:**
   ```bash
   php artisan serve
   ```

2. **فتح ملف الاختبار:**
   - افتح `test_add_restaurant.html` في المتصفح
   - أو استخدم curl/Postman مع الأوامر أعلاه

3. **تسجيل الدخول:**
   - استخدم البريد الإلكتروني: `seller@test.com`
   - كلمة المرور: `password`

4. **إضافة مطعم:**
   - املأ النموذج بالبيانات المطلوبة
   - أرسل الطلب

5. **التحقق من النتيجة:**
   - تأكد من ظهور رسالة النجاح
   - تحقق من إضافة المطعم في قاعدة البيانات

## 9. التحقق من قاعدة البيانات

```bash
# التحقق من إضافة المطعم
php artisan tinker --execute="App\Models\Restaurant::all(['id', 'name_ar', 'name_en', 'seller_id', 'is_active'])"

# التحقق من ربط المطعم بالبائع
php artisan tinker --execute="App\Models\User::where('role', 'seller')->first()->restaurants"
```
