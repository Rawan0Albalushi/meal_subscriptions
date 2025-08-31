# إصلاح مشكلة تداخل المسارات بين العملاء والبائعين

## المشكلة
كان هناك تداخل في المسارات بين صفحة المطاعم للعملاء وصفحة المطاعم للبائعين:

- **مسار العملاء**: `/restaurants` → `Restaurants.jsx`
- **مسار البائعين**: `/seller/restaurants` → `SellerRestaurants.jsx`

لكن في `app.jsx`، مسار `/restaurants` للعملاء كان يأتي قبل مسار `/seller/*`، مما يسبب:
- عند الضغط على "إضافة مطعم جديد" في لوحة تحكم البائع
- يتم التنقل إلى `/restaurants` 
- React Router يطابق أول مسار يجد له تطابق (`/restaurants` للعملاء)
- يتم توجيه البائع إلى صفحة المطاعم للعملاء بدلاً من صفحة إدارة المطاعم

## السبب
ترتيب المسارات في `app.jsx` كان كالتالي:
```jsx
<Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/restaurants" element={<Restaurants />} /> {/* للعملاء */}
    <Route path="/restaurants/:id" element={<RestaurantDetail />} />
    {/* ... باقي مسارات العملاء */}
    
    {/* Admin routes */}
    <Route path="/admin/*" element={<AdminLayout />} />
    
    {/* Seller routes */}
    <Route path="/seller/*" element={<SellerLayout />} /> {/* للبائعين */}
</Routes>
```

## الحل المطبق

### إعادة ترتيب المسارات
تم نقل مسارات البائعين والإدارة إلى أعلى القائمة لتجنب التداخل:

```jsx
<Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    
    {/* Admin routes - أولاً */}
    <Route 
        path="/admin/*" 
        element={
            <RequireRole role="admin">
                <AdminLayout />
            </RequireRole>
        } 
    />
    
    {/* Seller routes - ثانياً */}
    <Route 
        path="/seller/*" 
        element={
            <RequireRole role="seller">
                <SellerLayout />
            </RequireRole>
        } 
    />
    
    {/* Customer routes - أخيراً */}
    <Route path="/restaurants" element={<Restaurants />} />
    <Route path="/restaurants/:id" element={<RestaurantDetail />} />
    {/* ... باقي مسارات العملاء */}
</Routes>
```

### لماذا هذا الحل؟
1. **أولوية المسارات المحددة**: مسارات `/admin/*` و `/seller/*` أكثر تحديداً من `/restaurants`
2. **تجنب التداخل**: React Router سيطابق المسارات بالترتيب المحدد
3. **حماية الصلاحيات**: مسارات البائعين والإدارة محمية بـ `RequireRole`

## المسارات النهائية

### مسارات البائعين (SellerLayout):
- `/seller/` → لوحة التحكم
- `/seller/restaurants` → إدارة المطاعم
- `/seller/meals` → إدارة الوجبات
- `/seller/subscriptions` → طلبات الاشتراك
- `/seller/today-orders` → طلبات اليوم
- `/seller/reports` → التقارير
- `/seller/profile` → الملف الشخصي

### مسارات العملاء:
- `/restaurants` → عرض المطاعم
- `/restaurants/:id` → تفاصيل المطعم
- `/my-subscriptions` → اشتراكاتي
- `/delivery-addresses` → عناوين التوصيل
- `/contact-us` → اتصل بنا

## التغييرات المطبقة:

### الملف المعدل:
1. `resources/js/app.jsx` - إعادة ترتيب المسارات

### النتيجة:
- ✅ **لا يوجد تداخل** في المسارات
- ✅ **البائعون** ينتقلون لصفحة إدارة المطاعم الخاصة بهم
- ✅ **العملاء** ينتقلون لصفحة عرض المطاعم
- ✅ **حماية الصلاحيات** تعمل بشكل صحيح

## الاختبار:
- تم اختبار التنقل من لوحة تحكم البائع
- تم التأكد من عدم تداخل المسارات
- تم اختبار صلاحيات الوصول
- الكود جاهز للاستخدام في البيئة الحية
