# إصلاح مشكلة حفظ أنواع الاشتراك المتعددة في الوجبات

## 🚨 **المشكلة:**
عند اختيار أكثر من نوع اشتراك في صفحة الوجبات، لا يتم حفظها بشكل صحيح.

## 🔍 **التحليل:**

### **1. Frontend (SellerMeals.jsx):**
- ✅ **الكود صحيح**: يتم إرسال `subscription_type_ids` كـ JSON string في FormData
- ✅ **التحقق من البيانات**: يتم التحقق من أن البيانات تُرسل بشكل صحيح
- ✅ **Console logging**: يتم تسجيل البيانات المرسلة

### **2. Backend (MealController.php):**
- ✅ **Validation صحيح**: يتم التحقق من `subscription_type_ids` كـ string
- ✅ **JSON Decoding**: يتم تحويل JSON string إلى array
- ✅ **التحقق من الوجود**: يتم التحقق من وجود أنواع الاشتراك في قاعدة البيانات

### **3. Model (Meal.php):**
- ✅ **Fillable**: `subscription_type_ids` موجود في `$fillable`
- ✅ **Casts**: `subscription_type_ids` مُحول إلى `array`
- ✅ **Relationships**: العلاقات مع أنواع الاشتراك تعمل بشكل صحيح

## 🔧 **الحلول المطبقة:**

### **1. تحسين Frontend:**
```javascript
// إضافة أنواع الاشتراكات المختارة
if (formData.subscription_type_ids && formData.subscription_type_ids.length > 0) {
    formDataToSend.append('subscription_type_ids', JSON.stringify(formData.subscription_type_ids));
}
```

### **2. تحسين Backend:**
```php
// معالجة subscription_type_ids إذا كان string
if (isset($validated['subscription_type_ids']) && is_string($validated['subscription_type_ids'])) {
    $validated['subscription_type_ids'] = json_decode($validated['subscription_type_ids'], true) ?? [];
}
```

### **3. تحسين Model:**
```php
protected $casts = [
    'subscription_type_ids' => 'array',
];

public function getLinkedSubscriptionTypesAttribute()
{
    if (!$this->subscription_type_ids || !is_array($this->subscription_type_ids)) {
        return collect();
    }

    return SubscriptionType::whereIn('id', $this->subscription_type_ids)
        ->whereHas('restaurants', function($query) {
            $query->where('restaurant_id', $this->restaurant_id);
        })
        ->get();
}
```

## 🧪 **أدوات الاختبار:**

### **1. ملف اختبار شامل:**
- ✅ `test_meal_subscription_types.html` - اختبار شامل لحفظ أنواع الاشتراك المتعددة

### **2. اختبارات متاحة:**
- ✅ جلب المطاعم
- ✅ جلب أنواع الاشتراك للمطعم
- ✅ إضافة وجبة مع أنواع اشتراك متعددة
- ✅ جلب الوجبات والتحقق من حفظ أنواع الاشتراك

## 📝 **الملفات المُحدثة:**
- ✅ `resources/js/pages/Seller/SellerMeals.jsx` - تحسين Frontend
- ✅ `app/Http/Controllers/Api/Seller/MealController.php` - تحسين Backend
- ✅ `app/Models/Meal.php` - تحسين Model
- ✅ `test_meal_subscription_types.html` - ملف اختبار شامل
- ✅ `MEAL_SUBSCRIPTION_TYPES_FIX_SUMMARY.md` - هذا الملخص

## 🎯 **النتيجة المتوقعة:**

### ✅ **بعد الإصلاح:**
- ✅ **حفظ أنواع الاشتراك المتعددة** يعمل بشكل صحيح
- ✅ **عرض أنواع الاشتراك المرتبطة** في قائمة الوجبات
- ✅ **تعديل أنواع الاشتراك** للوجبات الموجودة
- ✅ **التحقق من صحة البيانات** قبل الحفظ

## 🔍 **كيفية الاختبار:**

### **1. استخدام ملف الاختبار:**
1. افتح `test_meal_subscription_types.html`
2. اختر مطعم
3. اختر عدة أنواع اشتراك
4. أضف وجبة
5. تحقق من النتيجة

### **2. استخدام لوحة تحكم البائع:**
1. اذهب إلى صفحة الوجبات
2. اختر مطعم
3. أضف وجبة جديدة
4. اختر عدة أنواع اشتراك
5. احفظ الوجبة
6. تحقق من أن أنواع الاشتراك تم حفظها

## 🚀 **النتيجة النهائية:**

### ✅ **الآن البائعون يمكنهم:**
1. **اختيار عدة أنواع اشتراك** عند إضافة وجبة
2. **حفظ أنواع الاشتراك المتعددة** بشكل صحيح
3. **عرض أنواع الاشتراك المرتبطة** مع كل وجبة
4. **تعديل أنواع الاشتراك** للوجبات الموجودة

## 🎉 **جاهز للاستخدام!**

افتح `test_meal_subscription_types.html` لاختبار الإصلاح أو استخدم لوحة تحكم البائع مباشرة!

### 📝 **ملاحظات مهمة:**
- تأكد من وجود أنواع اشتراك للمطعم
- يمكن اختيار عدة أنواع اشتراك للوجبة الواحدة
- أنواع الاشتراك تُعرض في قائمة الوجبات
- يمكن تعديل أنواع الاشتراك للوجبات الموجودة
