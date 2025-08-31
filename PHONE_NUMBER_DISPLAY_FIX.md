# إصلاح عرض رقم الهاتف في طلبات الاشتراك

## المشكلة
كان رقم الهاتف لا يظهر بشكل صحيح في تفاصيل العميل في طلبات الاشتراك لأن الكود كان يحاول الوصول إلى `user.phone` بينما رقم الهاتف موجود في جدول `delivery_addresses`.

## السبب
رقم الهاتف يتم تخزينه في جدول `delivery_addresses` وليس في جدول `users`، ولكن الكود كان يحاول الوصول إليه من `subscription.user?.phone`.

## الحل المطبق

### 1. صفحة اشتراكات البائع الرئيسية (`SellerSubscriptions.jsx`)

#### قبل الإصلاح:
```jsx
<strong>{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</strong> {subscription.user?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
```

#### بعد الإصلاح:
```jsx
<strong>{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</strong> {subscription.delivery_address?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
```

### 2. صفحة تفاصيل الاشتراك للبائع

#### قبل الإصلاح:
```jsx
{selectedSubscription.user?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
```

#### بعد الإصلاح:
```jsx
{selectedSubscription.delivery_address?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
```

### 3. صفحة طلبات اليوم (`TodayOrders.jsx`)

#### قبل الإصلاح:
```jsx
{order.subscription?.user?.phone}
```

#### بعد الإصلاح:
```jsx
{order.subscription?.delivery_address?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
```

## الكود الخلفي
الكود الخلفي كان يعمل بشكل صحيح بالفعل ويقوم بتحميل علاقة `deliveryAddress` في جميع الدوال:

- `getSellerSubscriptions()` - يحمل `deliveryAddress`
- `getSellerSubscription()` - يحمل `deliveryAddress`
- `getTodayOrders()` - يحمل `subscription.deliveryAddress`

## الصفحات المحدثة:
1. **صفحة اشتراكات البائع الرئيسية** - عرض رقم الهاتف في تفاصيل العميل
2. **صفحة تفاصيل الاشتراك للبائع** - عرض رقم الهاتف في معلومات العميل
3. **صفحة طلبات اليوم** - عرض رقم الهاتف في معلومات العميل

## الصفحات التي كانت تعمل بشكل صحيح:
- **صفحة إدارة الطلبات للإدارة** - كانت تستخدم `delivery_address.phone` بشكل صحيح
- **صفحة التقارير** - تم إصلاحها سابقاً

## النتيجة:
الآن سيظهر رقم الهاتف بشكل صحيح في جميع صفحات طلبات الاشتراك من جدول `delivery_addresses` مع:
- معالجة الحالة عندما يكون رقم الهاتف غير متوفر
- رسالة "غير متوفر" باللغة العربية أو الإنجليزية حسب اللغة المختارة

## الملفات المعدلة:
1. `resources/js/pages/Seller/SellerSubscriptions.jsx`
2. `resources/js/pages/Seller/TodayOrders.jsx`

## الاختبار:
- تم التأكد من أن الكود الخلفي يحمل علاقة `deliveryAddress` بشكل صحيح
- تم تطبيق التصحيحات على جميع الصفحات ذات الصلة
- الكود جاهز للاختبار في البيئة الحية
