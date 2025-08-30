# نظام الـ Logging لإدارة الوجبات - Meal Management Logging System

## 📋 **الملخص**
تم إضافة نظام logging شامل لتتبع جميع العمليات في إدارة الوجبات، مما يسهل تشخيص وحل المشاكل التي قد تحدث أثناء إضافة أو تعديل أو حذف الوجبات.

## 🔍 **ما يتم تتبعه (Frontend)**

### **1. عملية حفظ الوجبة**
```javascript
// بدء العملية
console.log('🔍 [Frontend] بدء عملية حفظ الوجبة:', {
    isEditing: !!editingMeal,
    restaurantId: selectedRestaurant,
    mealId: editingMeal?.id,
    formData: formData,
    hasImage: !!selectedImage,
    imageName: selectedImage?.name,
    imageSize: selectedImage?.size
});

// إضافة الصورة
console.log('📸 [Frontend] تم إضافة الصورة للطلب:', {
    name: selectedImage.name,
    size: selectedImage.size,
    type: selectedImage.type
});

// إرسال الطلب
console.log('🌐 [Frontend] إرسال الطلب:', {
    url: url,
    method: method,
    hasAuthToken: !!localStorage.getItem('auth_token')
});

// استلام الرد
console.log('📡 [Frontend] استلام الرد:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
});
```

### **2. معالجة الصور**
```javascript
// اختيار الصورة
console.log('📸 [Frontend] تم اختيار صورة جديدة:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
});

// التحقق من الحجم
console.warn('⚠️ [Frontend] حجم الصورة كبير جداً:', {
    size: file.size,
    maxSize: 2 * 1024 * 1024
});

// التحقق من النوع
console.warn('⚠️ [Frontend] نوع الملف غير مدعوم:', {
    type: file.type,
    allowedTypes: allowedTypes
});
```

## 🔍 **ما يتم تتبعه (Backend)**

### **1. إنشاء وجبة جديدة (store)**
```php
// بدء العملية
Log::info('MealController@store: بدء إنشاء وجبة جديدة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'request_data' => $request->except(['image']),
    'has_image' => $request->hasFile('image'),
    'image_size' => $request->hasFile('image') ? $request->file('image')->getSize() : null
]);

// العثور على المطعم
Log::info('MealController@store: تم العثور على المطعم', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'restaurant_name' => $restaurant->name_ar
]);

// التحقق من البيانات
Log::info('MealController@store: تم التحقق من البيانات بنجاح', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'validated_data' => $validated
]);

// رفع الصورة
Log::info('MealController@store: بدء رفع الصورة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'original_name' => $request->file('image')->getClientOriginalName(),
    'mime_type' => $request->file('image')->getMimeType(),
    'size' => $request->file('image')->getSize()
]);

// إنشاء الوجبة
Log::info('MealController@store: تم إنشاء الوجبة بنجاح', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'meal_id' => $meal->id,
    'meal_name' => $meal->name_ar
]);
```

### **2. تحديث وجبة (update)**
```php
// بدء التحديث
Log::info('MealController@update: بدء تحديث الوجبة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'meal_id' => $mealId,
    'request_data' => $request->except(['image']),
    'has_image' => $request->hasFile('image')
]);

// معالجة الصورة الجديدة
Log::info('MealController@update: بدء معالجة الصورة الجديدة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'meal_id' => $mealId,
    'old_image' => $meal->image,
    'new_image_original_name' => $request->file('image')->getClientOriginalName()
]);

// حذف الصورة القديمة
Log::info('MealController@update: تم حذف الصورة القديمة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'meal_id' => $mealId,
    'deleted_image' => $meal->image
]);
```

### **3. حذف وجبة (destroy)**
```php
// بدء الحذف
Log::info('MealController@destroy: بدء حذف الوجبة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'meal_id' => $mealId
]);

// حذف الصورة
Log::info('MealController@destroy: تم حذف صورة الوجبة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'meal_id' => $mealId,
    'deleted_image' => $meal->image
]);
```

## ⚠️ **تتبع الأخطاء**

### **Frontend Errors**
```javascript
// خطأ في حفظ الوجبة
console.error('❌ [Frontend] خطأ في حفظ الوجبة:', errorData);

// خطأ غير متوقع
console.error('💥 [Frontend] خطأ غير متوقع في حفظ الوجبة:', error);

// خطأ في قراءة الصورة
console.error('❌ [Frontend] خطأ في قراءة الصورة:', error);
```

### **Backend Errors**
```php
// خطأ في التحقق من البيانات
Log::warning('MealController@store: خطأ في التحقق من البيانات', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'validation_errors' => $e->errors(),
    'request_data' => $request->except(['image'])
]);

// خطأ في رفع الصورة
Log::error('MealController@store: خطأ في رفع الصورة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'error' => $e->getMessage(),
    'trace' => $e->getTraceAsString()
]);

// خطأ عام
Log::error('MealController@store: خطأ في إنشاء الوجبة', [
    'user_id' => $request->user()->id,
    'restaurant_id' => $restaurantId,
    'error' => $e->getMessage(),
    'trace' => $e->getTraceAsString(),
    'request_data' => $request->except(['image'])
]);
```

## 📁 **مواقع الـ Logs**

### **Backend Logs**
```
storage/logs/laravel.log
```

### **Frontend Logs**
```
Browser Console (F12 → Console)
```

## 🔧 **كيفية مراجعة الـ Logs**

### **1. Backend Logs**
```bash
# عرض آخر 100 سطر من الـ logs
tail -n 100 storage/logs/laravel.log

# البحث عن logs خاصة بالوجبات
grep "MealController" storage/logs/laravel.log

# البحث عن أخطاء
grep "ERROR" storage/logs/laravel.log

# مراقبة الـ logs في الوقت الفعلي
tail -f storage/logs/laravel.log
```

### **2. Frontend Logs**
1. افتح Developer Tools (F12)
2. انتقل إلى تبويب Console
3. ابحث عن الرسائل التي تبدأ بـ:
   - `🔍 [Frontend]` - معلومات عامة
   - `📸 [Frontend]` - معالجة الصور
   - `🌐 [Frontend]` - طلبات الشبكة
   - `✅ [Frontend]` - نجاح العمليات
   - `❌ [Frontend]` - أخطاء
   - `💥 [Frontend]` - أخطاء غير متوقعة

## 🚨 **أنواع الأخطاء المتوقعة**

### **1. أخطاء التحقق من البيانات**
- بيانات مطلوبة مفقودة
- نوع بيانات غير صحيح
- حجم صورة كبير جداً
- نوع ملف غير مدعوم

### **2. أخطاء رفع الصور**
- مشاكل في صلاحيات المجلد
- مساحة تخزين غير كافية
- مشاكل في الشبكة

### **3. أخطاء قاعدة البيانات**
- مشاكل في الاتصال
- قيود على المفاتيح الأجنبية
- مشاكل في الصلاحيات

### **4. أخطاء المصادقة**
- توكن منتهي الصلاحية
- صلاحيات غير كافية
- مشاكل في الـ middleware

## 🛠️ **استكشاف الأخطاء**

### **عند حدوث مشكلة:**

1. **تحقق من Frontend Console:**
   - ابحث عن رسائل الخطأ
   - تحقق من حالة الطلب
   - تأكد من صحة البيانات المرسلة

2. **تحقق من Backend Logs:**
   - ابحث عن رسائل الخطأ
   - تحقق من البيانات المستلمة
   - تأكد من صحة العملية

3. **تحقق من قاعدة البيانات:**
   - تأكد من وجود المطعم
   - تحقق من صحة العلاقات
   - تأكد من صلاحيات المستخدم

4. **تحقق من نظام الملفات:**
   - تأكد من وجود مجلد التخزين
   - تحقق من صلاحيات الكتابة
   - تأكد من مساحة التخزين

## 📊 **معلومات إضافية مسجلة**

### **معلومات المستخدم**
- `user_id` - معرف المستخدم
- `restaurant_id` - معرف المطعم
- `meal_id` - معرف الوجبة

### **معلومات الصورة**
- `original_name` - الاسم الأصلي للملف
- `mime_type` - نوع الملف
- `size` - حجم الملف
- `image_path` - مسار الصورة المحفوظة

### **معلومات الطلب**
- `request_data` - بيانات الطلب (بدون الصورة)
- `validated_data` - البيانات بعد التحقق
- `has_image` - هل يوجد صورة

### **معلومات الاستجابة**
- `status` - رمز الحالة
- `message` - رسالة الاستجابة
- `data` - البيانات المرجعة
