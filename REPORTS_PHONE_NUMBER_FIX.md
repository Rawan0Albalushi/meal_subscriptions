# إصلاح مشكلة عدم ظهور رقم الهاتف في صفحة التقارير

## المشكلة
في صفحة التقارير للبائع، لم يكن يظهر رقم الهاتف في معلومات العميل في قسم "الطلبات الأخيرة".

## السبب
1. **الكود الخلفي**: لم يكن يتم إرجاع رقم الهاتف من API التقارير
2. **مصدر البيانات**: رقم الهاتف يتم تخزينه في جدول `delivery_addresses` وليس في جدول `users`
3. **الواجهة الأمامية**: لم يكن يتم عرض رقم الهاتف حتى لو كان متوفراً

## الحل المطبق

### 1. إصلاح الكود الخلفي (`ReportsController.php`)

#### قبل الإصلاح:
```php
private function getRecentOrders($restaurantIds)
{
    return Subscription::with(['user', 'restaurant'])
        ->whereIn('restaurant_id', $restaurantIds)
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function($subscription) {
            return [
                'id' => $subscription->id,
                'customer_name' => $subscription->user->name,
                'restaurant_name' => $subscription->restaurant->name,
                // ... باقي البيانات
            ];
        });
}
```

#### بعد الإصلاح:
```php
private function getRecentOrders($restaurantIds)
{
    return Subscription::with(['user', 'restaurant', 'deliveryAddress'])
        ->whereIn('restaurant_id', $restaurantIds)
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function($subscription) {
            return [
                'id' => $subscription->id,
                'customer_name' => $subscription->user->name,
                'customer_phone' => $subscription->deliveryAddress->phone ?? null,
                'customer_email' => $subscription->user->email,
                'restaurant_name' => $subscription->restaurant->name,
                // ... باقي البيانات
            ];
        });
}
```

### 2. إصلاح الواجهة الأمامية (`SellerReports.jsx`)

#### قبل الإصلاح:
```jsx
<div style={{ flex: 1 }}>
    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(17 24 39)', marginBottom: '0.25rem' }}>
        {subscription.customer_name}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)' }}>
        {subscription.restaurant_name} • {subscription.subscription_type} • {formatDate(subscription.created_at)}
    </div>
</div>
```

#### بعد الإصلاح:
```jsx
<div style={{ flex: 1 }}>
    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgb(17 24 39)', marginBottom: '0.25rem' }}>
        {subscription.customer_name}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)', marginBottom: '0.25rem' }}>
        📞 {subscription.customer_phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)' }}>
        {subscription.restaurant_name} • {subscription.subscription_type} • {formatDate(subscription.created_at)}
    </div>
</div>
```

## التغييرات المطبقة:

### الكود الخلفي:
1. إضافة `deliveryAddress` إلى العلاقات المحملة (`with`)
2. إضافة `customer_phone` من `deliveryAddress.phone`
3. إضافة `customer_email` من `user.email`

### الواجهة الأمامية:
1. إضافة عرض رقم الهاتف مع أيقونة 📞
2. إضافة معالجة للحالة عندما يكون رقم الهاتف غير متوفر
3. تحسين التخطيط لاستيعاب المعلومات الإضافية

## النتيجة:
الآن في صفحة التقارير للبائع، سيظهر رقم الهاتف لكل عميل في قسم "الطلبات الأخيرة" مع:
- أيقونة 📞 لتوضيح أن هذا رقم هاتف
- رسالة "غير متوفر" إذا لم يكن رقم الهاتف متوفراً
- تخطيط محسن يعرض المعلومات بشكل واضح

## الملفات المعدلة:
1. `app/Http/Controllers/Api/Seller/ReportsController.php`
2. `resources/js/pages/Seller/SellerReports.jsx`

## الاختبار:
- تم مسح ذاكرة التخزين المؤقت للمسارات
- الكود جاهز للاختبار في البيئة الحية
