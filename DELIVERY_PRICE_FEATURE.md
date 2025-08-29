# ميزة سعر التوصيل - Delivery Price Feature

## نظرة عامة

تم إضافة ميزة سعر التوصيل إلى نظام الاشتراكات لتوفير مرونة أكبر في تحديد أسعار التوصيل بناءً على نوع الاشتراك. يمكن الآن تحديد سعر توصيل مختلف لكل نوع اشتراك (أسبوعي/شهري) وقد يكون التوصيل مجانياً.

## الميزات المضافة ✅

### 1. حقل سعر التوصيل في أنواع الاشتراك
- **إضافة حقل `delivery_price`** إلى جدول `subscription_types`
- **قيمة افتراضية**: 0.00 (توصيل مجاني)
- **المرونة**: يمكن تحديد سعر مختلف لكل نوع اشتراك

### 2. تحديث صفحة تفاصيل الاشتراك
- **عرض تفصيلي للدفع**: سعر الاشتراك، سعر التوصيل، المبلغ الإجمالي
- **تصميم محسن**: بطاقات منفصلة لكل عنصر مع ألوان مميزة
- **عرض ذكي**: يظهر "مجاني" إذا كان سعر التوصيل صفر

### 3. تحديث صفحة تفاصيل المطعم
- **معلومات سعر التوصيل**: عرض سعر التوصيل لكل نوع اشتراك
- **تمييز بصري**: لون مختلف للتوصيل المجاني والمدفوع

### 4. تحديث منطق إنشاء الاشتراك
- **استخدام سعر التوصيل من نوع الاشتراك**: بدلاً من سعر المطعم العام
- **حفظ سعر التوصيل**: في جدول الاشتراكات للرجوع إليه لاحقاً

## التغييرات التقنية 🔧

### 1. قاعدة البيانات

#### جدول `subscription_types`
```sql
ALTER TABLE subscription_types ADD COLUMN delivery_price DECIMAL(8,2) DEFAULT 0.00 AFTER price;
```

#### جدول `subscriptions`
```sql
ALTER TABLE subscriptions ADD COLUMN delivery_price DECIMAL(8,2) DEFAULT 0.00 AFTER total_amount;
```

### 2. النماذج (Models)

#### SubscriptionType Model
```php
protected $fillable = [
    // ... existing fields
    'delivery_price',
];

protected $casts = [
    // ... existing casts
    'delivery_price' => 'decimal:2',
];

// New methods
public function getTotalWithDeliveryAttribute()
{
    return $this->price + $this->delivery_price;
}

public function getDeliveryPriceTextAttribute()
{
    if ($this->delivery_price > 0) {
        return $this->delivery_price . ' ' . (app()->getLocale() === 'ar' ? 'ريال' : 'SAR');
    }
    return app()->getLocale() === 'ar' ? 'مجاني' : 'Free';
}
```

#### Subscription Model
```php
protected $fillable = [
    // ... existing fields
    'delivery_price',
];

protected $casts = [
    // ... existing casts
    'delivery_price' => 'decimal:2',
];

public function getTotalWithDeliveryAttribute()
{
    return $this->total_amount + $this->delivery_price;
}
```

### 3. Controllers

#### SubscriptionController
```php
// Use delivery price from subscription type instead of restaurant
$deliveryPrice = $subscriptionType->delivery_price;

$subscription = Subscription::create([
    // ... existing fields
    'delivery_price' => $deliveryPrice,
]);
```

### 4. Frontend

#### صفحة تفاصيل الاشتراك (SubscriptionDetail.jsx)
- **قسم تفاصيل الدفع الجديد**: 4 بطاقات منفصلة
  - سعر الاشتراك (أخضر)
  - سعر التوصيل (برتقالي/أخضر للمجاني)
  - المبلغ الإجمالي (أزرق)
  - طريقة الدفع (أخضر)

#### صفحة تفاصيل المطعم (RestaurantDetail.jsx)
- **معلومات سعر التوصيل**: تحت كل نوع اشتراك
- **تمييز بصري**: لون مختلف للتوصيل المجاني والمدفوع

## البيانات الافتراضية

### أنواع الاشتراك الجديدة
```php
// اشتراك أسبوعي
[
    'delivery_price' => 10.00, // 10 ريال للتوصيل
]

// اشتراك شهري  
[
    'delivery_price' => 0.00, // توصيل مجاني
]
```

## كيفية الاستخدام

### 1. للمدير (Admin)
- يمكن تحديد سعر التوصيل لكل نوع اشتراك
- يمكن جعل التوصيل مجانياً (سعر = 0)
- يمكن تحديد أسعار مختلفة للاشتراك الأسبوعي والشهري

### 2. للعميل (Customer)
- يرى سعر التوصيل عند اختيار نوع الاشتراك
- يرى تفاصيل كاملة للدفع في صفحة تفاصيل الاشتراك
- يرى المبلغ الإجمالي مع التوصيل بوضوح

### 3. للبائع (Seller)
- يمكن تحديد أسعار توصيل مختلفة لأنواع الاشتراك
- يمكن تقديم عروض خاصة (مثل التوصيل المجاني للاشتراك الشهري)

## الملفات المحدثة

### Backend
- `database/migrations/2025_08_29_000002_add_delivery_price_to_subscription_types_table.php`
- `app/Models/SubscriptionType.php`
- `app/Models/Subscription.php`
- `app/Http/Controllers/Api/SubscriptionController.php`
- `database/seeders/SubscriptionTypeSeeder.php`

### Frontend
- `resources/js/pages/Customer/SubscriptionDetail.jsx`
- `resources/js/pages/Customer/RestaurantDetail.jsx`

## الفوائد

1. **مرونة أكبر**: كل نوع اشتراك له سعر توصيل خاص
2. **عروض تنافسية**: يمكن تقديم التوصيل المجاني للاشتراكات الطويلة
3. **وضوح للعميل**: يرى جميع التكاليف بوضوح
4. **سهولة الإدارة**: يمكن تعديل أسعار التوصيل بسهولة
5. **تجربة مستخدم محسنة**: تصميم واضح وجذاب لتفاصيل الدفع
