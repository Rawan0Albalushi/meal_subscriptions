# إصلاح مشكلة صفحة المطاعم

## 🔍 المشكلة
عند فتح صفحة المطاعم في لوحة تحكم البائع، يظهر خطأ "حدث خطأ في تحميل المطاعم".

## ✅ الحل المطبق

### المشكلة الأساسية:
كان هناك تضارب في أسماء الـ tokens المستخدمة:
- الواجهة الأمامية تستخدم `auth_token` (في AuthContext)
- صفحة المطاعم كانت تستخدم `token`

### الإصلاح:
تم تغيير جميع المراجع في `resources/js/pages/Seller/SellerRestaurants.jsx` من:
```javascript
localStorage.getItem('token')
```
إلى:
```javascript
localStorage.getItem('auth_token')
```

## 🔧 التغييرات المطبقة

### 1. في دالة `fetchRestaurants`:
```javascript
// قبل الإصلاح
'Authorization': `Bearer ${localStorage.getItem('token')}`

// بعد الإصلاح
'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
```

### 2. في دالة `handleSubmit`:
```javascript
// قبل الإصلاح
'Authorization': `Bearer ${localStorage.getItem('token')}`

// بعد الإصلاح
'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
```

### 3. في دالة `handleDelete`:
```javascript
// قبل الإصلاح
'Authorization': `Bearer ${localStorage.getItem('token')}`

// بعد الإصلاح
'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
```

### 4. في دالة `handleToggleStatus`:
```javascript
// قبل الإصلاح
'Authorization': `Bearer ${localStorage.getItem('token')}`

// بعد الإصلاح
'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
```

## 🧪 اختبار الحل

### 1. تسجيل الدخول كبائع:
- البريد الإلكتروني: `newseller@test.com`
- كلمة المرور: `password123`

### 2. الوصول لصفحة المطاعم:
- انتقل إلى: `http://localhost:8000/seller/restaurants`

### 3. التحقق من النتيجة:
- يجب أن تظهر قائمة المطاعم بدون أخطاء
- يجب أن تظهر المطاعم المضافة مسبقاً

## 📋 خطوات التحقق

1. **تأكد من تسجيل الدخول:**
   ```javascript
   // في console المتصفح
   console.log(localStorage.getItem('auth_token'));
   console.log(localStorage.getItem('user'));
   ```

2. **تحقق من API:**
   ```bash
   # اختبار API مباشرة
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/seller/restaurants
   ```

3. **تحقق من Network Tab:**
   - افتح Developer Tools
   - انتقل إلى Network Tab
   - تحقق من طلب `/api/seller/restaurants`
   - تأكد من أن الـ Authorization header موجود وصحيح

## 🎯 النتيجة المتوقعة

بعد تطبيق الإصلاح:
- ✅ صفحة المطاعم تعمل بدون أخطاء
- ✅ قائمة المطاعم تظهر بشكل صحيح
- ✅ جميع وظائف إدارة المطاعم تعمل
- ✅ إضافة مطعم جديد تعمل
- ✅ تعديل وحذف المطاعم يعمل

## 📝 ملاحظات إضافية

1. **تأكد من تشغيل الخادم:**
   ```bash
   php artisan serve
   ```

2. **تأكد من وجود مستخدم بائع:**
   - البريد الإلكتروني: `newseller@test.com`
   - كلمة المرور: `password123`

3. **في حالة استمرار المشكلة:**
   - تحقق من console المتصفح للأخطاء
   - تحقق من Network Tab للطلبات الفاشلة
   - تأكد من أن الـ token صالح وغير منتهي الصلاحية

---

**تاريخ الإصلاح**: 30 أغسطس 2025  
**الحالة**: ✅ مكتمل
