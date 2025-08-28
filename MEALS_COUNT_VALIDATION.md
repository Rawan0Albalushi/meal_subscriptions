# نظام اختيار الوجبات حسب meals_count

## التحديثات المطبقة

### 1. Frontend Updates

#### RestaurantDetail.jsx
- **إضافة عداد الوجبات**: يعرض عدد الوجبات المختارة من إجمالي المطلوب
- **التحقق من عدد الوجبات**: يمنع المتابعة إذا لم يتم اختيار العدد المطلوب
- **عرض الأيام حسب meals_count**: يعرض فقط عدد الأيام المطلوبة حسب نوع الاشتراك
- **رسائل تحسينية**: رسائل واضحة للمستخدم حول عدد الوجبات المطلوبة

#### SubscriptionForm.jsx
- **التحقق من عدد الوجبات**: يتحقق من تطابق عدد الوجبات المختارة مع meals_count
- **رسائل خطأ محسنة**: رسائل واضحة عند عدم اختيار العدد المطلوب

### 2. Backend Updates

#### SubscriptionController.php
- **التحقق من عدد الوجبات**: يتحقق من تطابق عدد أيام التوصيل مع meals_count
- **إنشاء subscription items محسن**: ينشئ subscription items لكل يوم مع الوجبة المختارة له
- **رسائل خطأ واضحة**: رسائل خطأ باللغة العربية توضح العدد المطلوب

### 3. Language Updates

#### LanguageContext.jsx
- **إضافة ترجمات جديدة**:
  - `selectMealForEachDayWithCount`: "اختر {count} وجبة لاشتراكك {type}"
  - `mealsSelectionProgress`: "تقدم اختيار الوجبات"
  - `mealsSelected`: "وجبة مختارة"
  - `selectRequiredMealsCount`: "يرجى اختيار {count} وجبة"
  - `week`: "الأسبوع"
  - `month`: "الشهر"

## كيفية العمل

### 1. اختيار نوع الاشتراك
- المستخدم يختار نوع الاشتراك (أسبوعي/شهري)
- النظام يعرض عدد الوجبات المطلوبة حسب `meals_count`

### 2. اختيار تاريخ البداية
- المستخدم يختار تاريخ بداية الاشتراك
- يجب أن يكون يوم عمل (الأحد إلى الخميس)

### 3. اختيار الوجبات
- النظام يعرض عدد الأيام المطلوبة فقط
- لكل يوم، المستخدم يختار وجبة واحدة
- عداد يعرض التقدم: "X / Y وجبة مختارة"

### 4. التحقق والإنشاء
- النظام يتحقق من اختيار العدد الصحيح من الوجبات
- إذا كان العدد صحيح، يتم إنشاء الاشتراك
- إذا كان العدد غير صحيح، يتم عرض رسالة خطأ

## أمثلة

### اشتراك أسبوعي (meals_count = 4)
```
- يعرض 4 أيام فقط (الأحد، الاثنين، الثلاثاء، الأربعاء)
- المستخدم يختار وجبة لكل يوم
- العداد: "0 / 4 وجبة مختارة" → "4 / 4 وجبة مختارة"
```

### اشتراك شهري (meals_count = 16)
```
- يعرض 16 يوم (4 أسابيع × 4 أيام)
- المستخدم يختار وجبة لكل يوم
- العداد: "0 / 16 وجبة مختارة" → "16 / 16 وجبة مختارة"
```

## API Endpoints

### GET /api/subscription-types
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_ar": "اشتراك أسبوعي",
      "name_en": "Weekly Subscription",
      "type": "weekly",
      "price": "120.00",
      "meals_count": 4,
      "is_active": true
    },
    {
      "id": 2,
      "name_ar": "اشتراك شهري",
      "name_en": "Monthly Subscription",
      "type": "monthly",
      "price": "400.00",
      "meals_count": 16,
      "is_active": true
    }
  ]
}
```

### POST /api/subscriptions
```json
{
  "restaurant_id": 1,
  "meal_ids": [1, 2, 3, 4],
  "delivery_address_id": 1,
  "subscription_type": "weekly",
  "delivery_days": ["sunday", "monday", "tuesday", "wednesday"],
  "start_date": "2025-01-20",
  "special_instructions": "تعليمات خاصة"
}
```

## رسائل الخطأ

### عدد الوجبات غير صحيح
```json
{
  "success": false,
  "message": "يجب اختيار 4 وجبة لاشتراك اشتراك أسبوعي"
}
```

### رسائل Frontend
- "يرجى اختيار 4 وجبة" (عند عدم اختيار العدد المطلوب)
- "تقدم اختيار الوجبات: 2 / 4 وجبة مختارة" (عرض التقدم)

## الملفات المحدثة

### Frontend
- `resources/js/pages/Customer/RestaurantDetail.jsx`
- `resources/js/pages/Customer/SubscriptionForm.jsx`
- `resources/js/contexts/LanguageContext.jsx`

### Backend
- `app/Http/Controllers/Api/SubscriptionController.php`

## الاختبار

### اختبار Frontend
1. اختيار نوع اشتراك أسبوعي
2. اختيار تاريخ بداية
3. اختيار 4 وجبات مختلفة
4. التأكد من عمل العداد
5. التأكد من المتابعة للصفحة التالية

### اختبار Backend
1. إرسال طلب بوجبات أقل من المطلوب
2. التأكد من رسالة الخطأ
3. إرسال طلب بالعدد الصحيح
4. التأكد من إنشاء الاشتراك بنجاح
