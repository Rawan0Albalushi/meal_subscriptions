# إعداد خرائط جوجل - Google Maps Setup

## المشكلة
الخريطة لا تعمل لأن مفتاح Google Maps API غير موجود أو غير صحيح.

## الحل

### 1. الحصول على مفتاح Google Maps API

1. **اذهب إلى Google Cloud Console**
   - افتح [Google Cloud Console](https://console.cloud.google.com/)

2. **أنشئ مشروع جديد أو اختر مشروع موجود**
   - انقر على "Select a project" في أعلى الصفحة
   - انقر على "New Project" لإنشاء مشروع جديد

3. **فعّل Google Maps JavaScript API**
   - اذهب إلى "APIs & Services" > "Library"
   - ابحث عن "Maps JavaScript API"
   - انقر على "Enable"

4. **أنشئ مفتاح API**
   - اذهب إلى "APIs & Services" > "Credentials"
   - انقر على "Create Credentials" > "API Key"
   - انسخ المفتاح الذي تم إنشاؤه

5. **قيّد المفتاح (اختياري ولكن مُوصى به)**
   - انقر على المفتاح لتحريره
   - في "Application restrictions"، اختر "HTTP referrers"
   - أضف نطاقات موقعك (مثل: `localhost/*`, `yourdomain.com/*`)
   - في "API restrictions"، اختر "Restrict key" واختر "Maps JavaScript API"

### 2. إضافة المفتاح إلى المشروع

1. **افتح ملف `.env` في مجلد المشروع**
   ```bash
   # إذا لم يكن موجود، انسخ من .env.example
   cp .env.example .env
   ```

2. **أضف المفتاح**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   ```

3. **أعد تشغيل الخادم**
   ```bash
   npm run dev
   # أو
   php artisan serve
   ```

### 3. التحقق من الإعداد

- تأكد من أن المفتاح صحيح في ملف `.env`
- تأكد من أن Google Maps JavaScript API مفعل في Google Cloud Console
- تأكد من أن المفتاح غير مقيد أو مقيد بشكل صحيح

### 4. استكشاف الأخطاء

إذا كانت الخريطة لا تزال لا تعمل:

1. **تحقق من وحدة تحكم المتصفح (F12)**
   - ابحث عن رسائل خطأ متعلقة بـ Google Maps
   - تحقق من أن المفتاح يتم تحميله بشكل صحيح

2. **تحقق من Google Cloud Console**
   - تأكد من أن API مفعل
   - تحقق من حدود الاستخدام
   - تأكد من أن المفتاح غير منتهي الصلاحية

3. **تحقق من الاتصال بالإنترنت**
   - تأكد من أن الموقع يمكنه الوصول إلى Google Maps API

## ملاحظات مهمة

- **لا تشارك مفتاح API** في الكود العام أو GitHub
- **استخدم قيود API** لحماية مفتاحك
- **راقب الاستخدام** في Google Cloud Console لتجنب الرسوم غير المتوقعة
- **استخدم مفتاح منفصل** للبيئة الإنتاجية

## الدعم

إذا واجهت مشاكل، تحقق من:
- [Google Maps API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- رسائل الخطأ في وحدة تحكم المتصفح
