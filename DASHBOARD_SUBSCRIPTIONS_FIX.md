# إصلاح مشكلة عدم ظهور إجمالي الاشتراكات في لوحة التحكم

## المشكلة
في لوحة التحكم للبائع، لم يكن يظهر إجمالي الاشتراكات في الإحصائيات لأن الكود كان يحاول الوصول إلى `restaurant.subscriptions` ولكن هذه العلاقة لم تكن محملة من API.

## السبب
1. **API المطاعم**: لم يكن يحمل علاقة `subscriptions`
2. **طريقة الحساب**: كانت تعتمد على تحميل جميع البيانات في الواجهة الأمامية
3. **عدم وجود API مخصص**: لم يكن هناك API منفصل لإحصائيات لوحة التحكم

## الحل المطبق

### 1. إنشاء API مخصص للوحة التحكم (`DashboardController.php`)

تم إنشاء controller جديد يوفر إحصائيات مفصلة:

```php
class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user();
        $restaurants = Restaurant::where('seller_id', $seller->id)->get();
        $restaurantIds = $restaurants->pluck('id')->toArray();

        $stats = [
            'totalRestaurants' => $restaurants->count(),
            'activeRestaurants' => $restaurants->where('is_active', true)->count(),
            'totalMeals' => Meal::whereIn('restaurant_id', $restaurantIds)->count(),
            'activeMeals' => Meal::whereIn('restaurant_id', $restaurantIds)->where('is_available', true)->count(),
            'totalSubscriptions' => Subscription::whereIn('restaurant_id', $restaurantIds)->count(),
            'activeSubscriptions' => Subscription::whereIn('restaurant_id', $restaurantIds)->where('status', 'active')->count(),
            'totalRevenue' => Subscription::whereIn('restaurant_id', $restaurantIds)->where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
```

### 2. تحديث API المطاعم

تم إضافة علاقة `subscriptions` إلى API المطاعم كاحتياطي:

```php
public function index(Request $request)
{
    $restaurants = $request->user()->restaurants()
        ->with(['meals', 'subscriptionTypes', 'subscriptions'])
        ->get();
    // ...
}
```

### 3. تحديث الواجهة الأمامية (`SellerDashboard.jsx`)

#### قبل الإصلاح:
```jsx
const fetchDashboardData = async () => {
    const restaurantsResponse = await fetch('/api/seller/restaurants');
    const restaurants = restaurantsData.data || [];
    
    restaurants.forEach(restaurant => {
        totalSubscriptions += restaurant.subscriptions?.length || 0;
        activeSubscriptions += restaurant.subscriptions?.filter(s => s.status === 'active').length || 0;
    });
};
```

#### بعد الإصلاح:
```jsx
const fetchDashboardData = async () => {
    const dashboardResponse = await fetch('/api/seller/dashboard');
    const data = dashboardData.data || {};
    
    setStats({
        totalSubscriptions: data.totalSubscriptions || 0,
        activeSubscriptions: data.activeSubscriptions || 0,
        totalRevenue: data.totalRevenue || 0,
        // ... باقي الإحصائيات
    });
};
```

### 4. إضافة عرض الإيرادات

تم إضافة بطاقة إحصائيات جديدة لعرض إجمالي الإيرادات:

```jsx
{
    icon: '💰',
    titleAr: 'إجمالي الإيرادات',
    titleEn: 'Total Revenue',
    value: new Intl.NumberFormat('ar-OM', {
        style: 'currency',
        currency: 'OMR'
    }).format(stats.totalRevenue),
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
}
```

## التغييرات المطبقة:

### الكود الخلفي:
1. إنشاء `DashboardController` جديد
2. إضافة علاقة `subscriptions` إلى API المطاعم
3. تحديث مسار `/api/seller/dashboard`

### الواجهة الأمامية:
1. تحديث `fetchDashboardData` لاستخدام API الجديد
2. إضافة عرض إجمالي الإيرادات
3. تحسين أداء التطبيق بتقليل البيانات المحملة

## النتيجة:
الآن في لوحة التحكم للبائع، ستظهر جميع الإحصائيات بشكل صحيح:
- إجمالي المطاعم
- المطاعم النشطة
- إجمالي الوجبات
- الوجبات المتاحة
- **إجمالي الاشتراكات** ✅
- **إجمالي الإيرادات** ✅ (جديد)

## تحديث إضافي:
تم حذف "الاشتراكات النشطة" من لوحة التحكم بناءً على طلب المستخدم.

## الملفات المعدلة:
1. `app/Http/Controllers/Api/Seller/DashboardController.php` (جديد)
2. `app/Http/Controllers/Api/Seller/RestaurantController.php`
3. `resources/js/pages/Seller/SellerDashboard.jsx`
4. `routes/api.php`

## الاختبار:
- تم التأكد من أن جميع الإحصائيات تعمل بشكل صحيح
- تم اختبار الحالة عندما لا يكون لدى البائع مطاعم
- الكود جاهز للاختبار في البيئة الحية
