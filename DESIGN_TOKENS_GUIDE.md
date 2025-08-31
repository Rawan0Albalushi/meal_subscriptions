# دليل نظام الألوان الموحد (Design Tokens)

## نظرة عامة

تم إنشاء نظام ألوان موحد للمشروع باستخدام Design Tokens في ملفي `tailwind.config.js` و `tokens.css` لضمان اتساق الألوان في جميع أنحاء التطبيق.

## الألوان الأساسية

### 1. اللون الأساسي (Primary)
- **اللون الرئيسي**: `#4a757c`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: الأزرار الرئيسية، الروابط، العناوين

```css
/* CSS Variables */
--color-primary: #4a757c
--color-primary-50: #f0f4f5
--color-primary-100: #d9e2e5
--color-primary-200: #b3c5cc
--color-primary-300: #8da8b2
--color-primary-400: #678b99
--color-primary-500: #4a757c
--color-primary-600: #3e5e64
--color-primary-700: #2e464b
--color-primary-800: #1f2e32
--color-primary-900: #0f1719
```

```html
<!-- Tailwind Classes -->
<div class="bg-primary text-white">خلفية أساسية</div>
<div class="bg-primary-50 text-primary">خلفية فاتحة</div>
<div class="bg-primary-900 text-white">خلفية داكنة</div>
```

### 2. اللون الثانوي (Accent)
- **اللون الرئيسي**: `#ba6c5d`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: الأزرار الثانوية، التأكيد، العناصر التفاعلية

```css
/* CSS Variables */
--color-accent: #ba6c5d
--color-accent-50: #fdf4f3
--color-accent-100: #fbe8e5
--color-accent-200: #f7d1cc
--color-accent-300: #f3bab3
--color-accent-400: #efa39a
--color-accent-500: #ba6c5d
--color-accent-600: #a55a4b
--color-accent-700: #8f4839
--color-accent-800: #793627
--color-accent-900: #632415
```

```html
<!-- Tailwind Classes -->
<div class="bg-accent text-white">خلفية ثانوية</div>
<div class="bg-accent-50 text-accent">خلفية فاتحة</div>
<div class="bg-accent-900 text-white">خلفية داكنة</div>
```

### 3. الخلفية (Background)
- **اللون الرئيسي**: `#ffffff`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: خلفيات الصفحات، البطاقات، النماذج

```css
/* CSS Variables */
--color-bg: #ffffff
--color-bg-50: #ffffff
--color-bg-100: #fafafa
--color-bg-200: #f5f5f5
--color-bg-300: #e5e5e5
--color-bg-400: #d4d4d4
--color-bg-500: #a3a3a3
--color-bg-600: #737373
--color-bg-700: #525252
--color-bg-800: #404040
--color-bg-900: #262626
```

```html
<!-- Tailwind Classes -->
<div class="bg-bg">خلفية بيضاء</div>
<div class="bg-bg-100">خلفية رمادية فاتحة</div>
<div class="bg-bg-900 text-white">خلفية داكنة</div>
```

### 4. اللون البيج (Beige)
- **اللون الرئيسي**: `#fff4d7`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: الخلفيات الدافئة، البطاقات المميزة

```css
/* CSS Variables */
--color-beige: #fff4d7
--color-beige-50: #fffef9
--color-beige-100: #fffdf3
--color-beige-200: #fffbe7
--color-beige-300: #fff9db
--color-beige-400: #fff7cf
--color-beige-500: #fff4d7
--color-beige-600: #e6dcc1
--color-beige-700: #ccc4ab
--color-beige-800: #b3ac95
--color-beige-900: #99947f
```

```html
<!-- Tailwind Classes -->
<div class="bg-beige">خلفية بيج</div>
<div class="bg-beige-50">خلفية بيج فاتحة</div>
<div class="bg-beige-900 text-white">خلفية بيج داكنة</div>
```

### 5. اللون الأخضر (Success)
- **اللون الرئيسي**: `#4CAF50`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: رسائل النجاح، الحالات الإيجابية

```css
/* CSS Variables */
--color-success: #4CAF50
--color-success-50: #f0fdf4
--color-success-100: #dcfce7
--color-success-200: #bbf7d0
--color-success-300: #86efac
--color-success-400: #4ade80
--color-success-500: #4CAF50
--color-success-600: #16a34a
--color-success-700: #15803d
--color-success-800: #166534
--color-success-900: #14532d
```

```html
<!-- Tailwind Classes -->
<div class="bg-success text-white">رسالة نجاح</div>
<div class="bg-success-50 text-success">خلفية نجاح فاتحة</div>
<div class="bg-success-900 text-white">خلفية نجاح داكنة</div>
```

### 6. اللون الأحمر (Error)
- **اللون الرئيسي**: `#F44336`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: رسائل الخطأ، الحالات السلبية

```css
/* CSS Variables */
--color-error: #F44336
--color-error-50: #fef2f2
--color-error-100: #fee2e2
--color-error-200: #fecaca
--color-error-300: #fca5a5
--color-error-400: #f87171
--color-error-500: #F44336
--color-error-600: #dc2626
--color-error-700: #b91c1c
--color-error-800: #991b1b
--color-error-900: #7f1d1d
```

```html
<!-- Tailwind Classes -->
<div class="bg-error text-white">رسالة خطأ</div>
<div class="bg-error-50 text-error">خلفية خطأ فاتحة</div>
<div class="bg-error-900 text-white">خلفية خطأ داكنة</div>
```

### 7. اللون الأصفر (Warning)
- **اللون الرئيسي**: `#FFC107`
- **التدرجات**: من 50 إلى 900
- **الاستخدام**: رسائل التحذير، الحالات المحايدة

```css
/* CSS Variables */
--color-warning: #FFC107
--color-warning-50: #fffbeb
--color-warning-100: #fef3c7
--color-warning-200: #fde68a
--color-warning-300: #fcd34d
--color-warning-400: #fbbf24
--color-warning-500: #FFC107
--color-warning-600: #d97706
--color-warning-700: #b45309
--color-warning-800: #92400e
--color-warning-900: #78350f
```

```html
<!-- Tailwind Classes -->
<div class="bg-warning text-white">رسالة تحذير</div>
<div class="bg-warning-50 text-warning">خلفية تحذير فاتحة</div>
<div class="bg-warning-900 text-white">خلفية تحذير داكنة</div>
```

## التدرجات (Gradients)

### التدرج الرئيسي
```css
/* CSS Variables */
--gradient-primary: linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)
--gradient-primary-reverse: linear-gradient(135deg, #ba6c5d 0%, #4a757c 100%)
--gradient-primary-soft: linear-gradient(135deg, rgba(74, 117, 124, 0.1) 0%, rgba(186, 108, 93, 0.1) 100%)
```

```html
<!-- Tailwind Classes -->
<div class="bg-gradient-primary">تدرج رئيسي</div>
<div class="bg-gradient-primary-reverse">تدرج عكسي</div>
<div class="bg-gradient-primary-soft">تدرج ناعم</div>
```

### تدرجات أخرى
```css
--gradient-accent: linear-gradient(135deg, #ba6c5d 0%, #4a757c 100%)
--gradient-success: linear-gradient(135deg, #4CAF50 0%, #45a049 100%)
--gradient-error: linear-gradient(135deg, #F44336 0%, #d32f2f 100%)
--gradient-warning: linear-gradient(135deg, #FFC107 0%, #ffb300 100%)
```

```html
<!-- Tailwind Classes -->
<div class="bg-gradient-accent">تدرج ثانوي</div>
<div class="bg-gradient-success">تدرج نجاح</div>
<div class="bg-gradient-error">تدرج خطأ</div>
<div class="bg-gradient-warning">تدرج تحذير</div>
```

## الظلال (Shadows)

```css
/* CSS Variables */
--shadow-primary: 0 4px 14px 0 rgba(74, 117, 124, 0.25)
--shadow-accent: 0 4px 14px 0 rgba(186, 108, 93, 0.25)
--shadow-success: 0 4px 14px 0 rgba(76, 175, 80, 0.25)
--shadow-error: 0 4px 14px 0 rgba(244, 67, 54, 0.25)
--shadow-warning: 0 4px 14px 0 rgba(255, 193, 7, 0.25)
--shadow-beige: 0 4px 14px 0 rgba(255, 244, 215, 0.25)
```

```html
<!-- Tailwind Classes -->
<div class="shadow-primary">ظل أساسي</div>
<div class="shadow-accent">ظل ثانوي</div>
<div class="shadow-success">ظل نجاح</div>
<div class="shadow-error">ظل خطأ</div>
<div class="shadow-warning">ظل تحذير</div>
<div class="shadow-beige">ظل بيج</div>
```

## فئات CSS الجاهزة

### الأزرار
```html
<button class="btn-primary">زر أساسي</button>
<button class="btn-accent">زر ثانوي</button>
<button class="btn-success">زر نجاح</button>
<button class="btn-error">زر خطأ</button>
<button class="btn-warning">زر تحذير</button>
```

### التنبيهات
```html
<div class="alert-primary">تنبيه أساسي</div>
<div class="alert-success">تنبيه نجاح</div>
<div class="alert-error">تنبيه خطأ</div>
<div class="alert-warning">تنبيه تحذير</div>
```

### البطاقات
```html
<div class="card-primary">بطاقة أساسية</div>
<div class="card-accent">بطاقة ثانوية</div>
<div class="card-beige">بطاقة بيج</div>
```

### الخلفيات الناعمة
```html
<div class="bg-primary-soft">خلفية أساسية ناعمة</div>
<div class="bg-accent-soft">خلفية ثانوية ناعمة</div>
<div class="bg-beige-soft">خلفية بيج ناعمة</div>
<div class="bg-success-soft">خلفية نجاح ناعمة</div>
<div class="bg-error-soft">خلفية خطأ ناعمة</div>
<div class="bg-warning-soft">خلفية تحذير ناعمة</div>
```

## أمثلة عملية

### 1. زر رئيسي مع تدرج
```html
<button class="btn-primary bg-gradient-primary text-white px-6 py-3 rounded-lg shadow-primary hover:shadow-lg transition-all duration-300">
  تسجيل الدخول
</button>
```

### 2. بطاقة مع خلفية ناعمة
```html
<div class="card-primary bg-primary-soft p-6 rounded-xl shadow-primary">
  <h3 class="text-primary font-bold text-xl mb-4">عنوان البطاقة</h3>
  <p class="text-gray-700">محتوى البطاقة</p>
</div>
```

### 3. رسالة نجاح
```html
<div class="alert-success p-4 rounded-lg shadow-success">
  <div class="flex items-center">
    <svg class="w-5 h-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
    </svg>
    <span>تم حفظ البيانات بنجاح!</span>
  </div>
</div>
```

### 4. رسالة خطأ
```html
<div class="alert-error p-4 rounded-lg shadow-error">
  <div class="flex items-center">
    <svg class="w-5 h-5 text-error mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
    </svg>
    <span>حدث خطأ في حفظ البيانات</span>
  </div>
</div>
```

### 5. بطاقة مع تدرج
```html
<div class="card bg-gradient-primary text-white p-6 rounded-xl shadow-primary">
  <h3 class="text-xl font-bold mb-4">بطاقة مميزة</h3>
  <p>محتوى البطاقة مع تدرج جميل</p>
</div>
```

## أفضل الممارسات

### 1. استخدام الألوان المناسبة
- استخدم `primary` للعناصر الرئيسية والأزرار الأساسية
- استخدم `accent` للعناصر الثانوية والتأكيد
- استخدم `success` للحالات الإيجابية
- استخدم `error` للحالات السلبية
- استخدم `warning` للحالات المحايدة

### 2. التدرجات
- استخدم `gradient-primary` للعناصر المميزة
- استخدم `gradient-primary-soft` للخلفيات الناعمة
- استخدم التدرجات المناسبة لكل حالة

### 3. الظلال
- استخدم الظلال المناسبة لكل لون
- تجنب استخدام ظلال قوية جداً
- حافظ على التناسق في الظلال

### 4. النصوص
- استخدم `text-primary` للنصوص الأساسية
- استخدم `text-accent` للنصوص الثانوية
- استخدم الألوان المناسبة للحالات المختلفة

## التحديثات المستقبلية

يمكن إضافة المزيد من الألوان والتدرجات حسب احتياجات المشروع:

```css
/* مثال لإضافة ألوان جديدة */
--color-info: #2196F3
--color-purple: #9C27B0
--color-orange: #FF9800
```

## الدعم التقني

للاستفسارات التقنية أو إضافة ألوان جديدة، يرجى التواصل مع فريق التطوير.
