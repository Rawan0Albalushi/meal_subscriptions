# إصلاح مشكلة اختيار الوجبات - Meal Selection Fix

## 📋 وصف المشكلة

كانت هناك مشكلة في صفحة تفاصيل المطعم حيث عند اختيار وجبة ثانية، يتم أولاً إلغاء تحديد الوجبة الأولى، ثم يحتاج المستخدم للضغط مرة ثانية لاختيار الوجبة الجديدة.

## 🔍 سبب المشكلة

المشكلة كانت في دالة `handleMealSelection` في ملف `RestaurantDetail.jsx`:

```javascript
// الكود القديم (المشكل)
if (selectedMeals[dayKey]) {
  // إلغاء تحديد اليوم كله
  setSelectedMeals(prev => {
    const newSelected = { ...prev };
    delete newSelected[dayKey];
    return newSelected;
  });
}
```

المشكلة أن النظام كان يتحقق من أن اليوم محدد (`selectedMeals[dayKey]`) بدلاً من التحقق من الوجبة المحددة بالضبط.

## ✅ الحل المطبق

تم تعديل المنطق ليتحقق من الوجبة المحددة بالضبط:

```javascript
// الكود الجديد (المصحح)
// التحقق من أن هذه الوجبة محددة بالفعل
const isCurrentMealSelected = selectedMeals[dayKey] && selectedMeals[dayKey].id === meal.id;

// إذا كانت هذه الوجبة محددة بالفعل، ألغِ التحديد
if (isCurrentMealSelected) {
  setSelectedMeals(prev => {
    const newSelected = { ...prev };
    delete newSelected[dayKey];
    return newSelected;
  });
} else {
  // إذا كان هذا اليوم يحتوي على وجبة مختلفة، استبدلها
  // أو إذا لم تكن هناك وجبة محددة لهذا اليوم، أضفها
  setSelectedMeals(prev => ({
    ...prev,
    [dayKey]: meal
  }));
}
```

## 🎯 النتيجة

- **قبل الإصلاح**: اضغط على وجبة → إلغاء تحديد اليوم → اضغط مرة ثانية → تحديد الوجبة الجديدة
- **بعد الإصلاح**: اضغط على وجبة → تحديد الوجبة مباشرة (بدون الحاجة للضغط مرتين)

## 📁 الملفات المعدلة

1. **`resources/js/pages/Customer/RestaurantDetail.jsx`**
   - تعديل دالة `handleMealSelection` (السطور 747-764)

2. **`test_meal_selection_fix.html`**
   - ملف اختبار جديد لمحاكاة السلوك الجديد

## 🧪 كيفية الاختبار

1. افتح صفحة تفاصيل المطعم
2. اختر نوع اشتراك
3. اضغط على أي وجبة لاختيارها
4. اضغط على وجبة أخرى في نفس اليوم
5. يجب أن يتم تبديل الاختيار مباشرة دون الحاجة للضغط مرتين

## 🔧 التفاصيل التقنية

### التغييرات المحددة:

```javascript
// قبل الإصلاح
if (selectedMeals[dayKey]) { ... }

// بعد الإصلاح  
const isCurrentMealSelected = selectedMeals[dayKey] && selectedMeals[dayKey].id === meal.id;
if (isCurrentMealSelected) { ... }
```

### الفوائد:

1. **تجربة مستخدم أفضل**: لا حاجة للضغط مرتين
2. **سلوك أكثر منطقية**: تبديل مباشر بين الوجبات
3. **أداء محسن**: تقليل عدد النقرات المطلوبة
4. **وضوح أكبر**: المستخدم يفهم السلوك فوراً

## 📊 حالة التنفيذ

- ✅ **تم إصلاح المنطق الأساسي**
- ✅ **تم إنشاء ملف اختبار**
- ✅ **تم التحقق من عدم وجود أخطاء**
- ✅ **جاهز للاختبار في البيئة الحية**

---

**تاريخ الإصلاح**: ${new Date().toLocaleDateString('ar-SA')}  
**المطور**: AI Assistant  
**الحالة**: مكتمل ✅
