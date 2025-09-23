# التحقق من استدعاء Google Maps API

## ✅ الطريقة الصحيحة المستخدمة في الكود

### 1. بناء URL باستخدام URLSearchParams

```javascript
const params = new URLSearchParams({
  key: apiKey,
  libraries: GOOGLE_MAPS_LIBRARIES.join(','),
  v: 'weekly',
  callback: 'initGoogleMaps',
  language: 'ar',
  region: 'OM'
});
script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
```

### 2. النتيجة النهائية للـ URL

```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=maps&v=weekly&callback=initGoogleMaps&language=ar&region=OM
```

### 3. المعاملات المستخدمة

| المعامل | القيمة | الوصف |
|---------|--------|--------|
| `key` | مفتاح API | مفتاح Google Maps API |
| `libraries` | `maps` | مكتبات خرائط جوجل المطلوبة |
| `v` | `weekly` | إصدار API (أحدث إصدار أسبوعي) |
| `callback` | `initGoogleMaps` | دالة callback عند التحميل |
| `language` | `ar` | لغة واجهة الخريطة (عربي) |
| `region` | `OM` | المنطقة الجغرافية (عمان) |

## 🔍 التحقق من الاستدعاء

### 1. فحص المتغيرات البيئية

```javascript
const apiKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
  // خطأ: مفتاح API غير موجود
}
```

### 2. فحص تحميل السكريبت

```javascript
script.onload = () => {
  if (window.google && window.google.maps) {
    console.log('تم تحميل خرائط جوجل بنجاح');
    resolve(window.google);
  } else {
    reject(new Error('فشل في تحميل خرائط جوجل - API غير متاح'));
  }
};
```

### 3. معالجة الأخطاء

```javascript
script.onerror = (error) => {
  console.error('خطأ في تحميل خرائط جوجل:', error);
  reject(new Error('فشل في تحميل خرائط جوجل. تحقق من مفتاح API والاتصال بالإنترنت.'));
};
```

## 🧪 اختبار الاستدعاء

### 1. فتح ملف الاختبار

افتح `test_google_maps_api_call.html` في المتصفح

### 2. إدخال مفتاح API

أدخل مفتاح Google Maps API الخاص بك

### 3. مراقبة سجل الأحداث

راقب سجل الأحداث للتأكد من:
- ✅ تم إنشاء URL بشكل صحيح
- ✅ تم تحميل السكريبت بنجاح
- ✅ Google Maps API متاح
- ✅ تم إنشاء الخريطة بنجاح

## 🐛 استكشاف الأخطاء الشائعة

### 1. خطأ "This page can't load Google Maps correctly"

**السبب:** مفتاح API غير صحيح أو غير مفعل

**الحل:**
- تحقق من صحة مفتاح API في Google Cloud Console
- تأكد من تفعيل Maps JavaScript API
- تحقق من قيود API (إذا كانت موجودة)

### 2. خطأ "Missing VITE_GOOGLE_MAPS_API_KEY"

**السبب:** متغير البيئة غير موجود

**الحل:**
```bash
# أضف إلى ملف .env
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### 3. خطأ "API key not valid"

**السبب:** مفتاح API منتهي الصلاحية أو مقيد

**الحل:**
- تحقق من صحة المفتاح في Google Cloud Console
- تأكد من أن المفتاح غير مقيد أو مقيد بشكل صحيح
- تحقق من حدود الاستخدام

## 📋 قائمة التحقق

- [ ] مفتاح API موجود في ملف `.env`
- [ ] مفتاح API صحيح ومفعل
- [ ] Maps JavaScript API مفعل في Google Cloud Console
- [ ] لا توجد قيود على المفتاح أو القيود صحيحة
- [ ] الاتصال بالإنترنت يعمل
- [ ] المتصفح يدعم JavaScript

## 🔧 نصائح إضافية

1. **استخدم HTTPS** في الإنتاج
2. **قيّد المفتاح** حسب النطاق المطلوب
3. **راقب الاستخدام** لتجنب الرسوم غير المتوقعة
4. **اختبر في بيئة التطوير** قبل النشر
5. **احتفظ بنسخة احتياطية** من مفتاح API

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من وحدة تحكم المتصفح (F12)
2. راجع سجل الأحداث في ملف الاختبار
3. تأكد من إعدادات Google Cloud Console
4. تحقق من صحة مفتاح API
