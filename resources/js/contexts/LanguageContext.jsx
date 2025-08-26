import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ar');

    const translations = {
        ar: {
            // Navigation
            home: 'الرئيسية',
            restaurants: 'المطاعم',
            mySubscriptions: 'اشتراكاتي',
            deliveryAddresses: 'عناوين التوصيل',
            login: 'تسجيل الدخول',
            logout: 'تسجيل الخروج',
            language: 'اللغة',
            
            // Home page
            welcomeTitle: 'اشترك في وجباتك المفضلة',
            welcomeSubtitle: 'اختر من مجموعة متنوعة من المطاعم واحصل على وجباتك المفضلة في الوقت المحدد',
            getStarted: 'ابدأ الآن',
            viewRestaurants: 'عرض المطاعم',
            learnMore: 'تعرف أكثر',
            discountBadge: 'خصم 30% للاشتراكات الجديدة',
            heroTitle: 'اشترك من مطاعمك المفضلة',
            heroSubtitle: 'ووصل وجبتك في وقت ثابت',
            heroDescription: 'اختر مطعمًا واحدًا، خطّة أسبوعية أو شهرية، وحدّد وجبة كل يوم (الأحد–الأربعاء) مع عنوان توصيل واحد.',
            designPreview: 'معاينة التصميم',
            designDescription: 'تصميم حديث وجذاب',
            
            // Features Section
            whySubscribe: 'لماذا الاشتراك معنا؟',
            featuresDescription: 'نقدم لك تجربة فريدة ومميزة في عالم اشتراكات الوجبات',
            diverseMeals: 'وجبات متنوعة',
            diverseMealsDesc: 'قائمة مختارة من المطاعم؛ اختر فطور أو غداء أو عشاء بما يناسب ذوقك.',
            fixedDelivery: 'وقت توصيل ثابت',
            fixedDeliveryDesc: 'نوصّل في نفس الموعد المخصّص لنوع الوجبة طوال مدة الاشتراك.',
            securePayment: 'دفع آمن عبر ثواني',
            securePaymentDesc: 'ادفع عبر Thawani بخطوة واحدة وبسعر نهائي واضح.',
            
            // Restaurants Section
            featuredRestaurants: 'مطاعمنا المميزة',
            restaurantsDescription: 'اكتشف مجموعة متنوعة من المطاعم المميزة وابدأ رحلتك معنا',
            viewAllRestaurants: 'عرض جميع المطاعم',
            
            // How it works
            howItWorks: 'كيف يعمل الاشتراك؟',
            howItWorksDesc: 'خطوات بسيطة لتبدأ رحلتك معنا',
            step1: 'سجّل بالبريد أو Google أو Apple',
            step2: 'اختر مطعمًا وخطتك (أسبوعي/شهري)',
            step3: 'حدّد وجبة كل يوم (أحد-أربعاء) وعنوانًا واحدًا',
            step4: 'ادفع عبر ثواني واستلم في الموعد الثابت',
            
            // Restaurant
            viewMenu: 'عرض القائمة',
            subscribe: 'اشترك الآن',
            mealType: 'نوع الوجبة',
            price: 'السعر',
            deliveryTime: 'وقت التوصيل',
            
            // Subscription
            subscriptionType: 'نوع الاشتراك',
            weekly: 'أسبوعي',
            monthly: 'شهري',
            startDate: 'تاريخ البداية',
            selectMeals: 'اختر الوجبات',
            deliveryAddress: 'عنوان التوصيل',
            totalAmount: 'المبلغ الإجمالي',
            confirmSubscription: 'تأكيد الاشتراك',
            subscriptionDetails: 'تفاصيل الاشتراك',
            status: 'الحالة',
            pending: 'في الانتظار',
            active: 'نشط',
            completed: 'مكتمل',
            cancelled: 'ملغي',
            
            // Delivery Address
            addAddress: 'إضافة عنوان',
            editAddress: 'تعديل العنوان',
            deleteAddress: 'حذف العنوان',
            name: 'الاسم',
            phone: 'الهاتف',
            address: 'العنوان',
            city: 'المدينة',
            postalCode: 'الرمز البريدي',
            additionalNotes: 'ملاحظات إضافية',
            isDefault: 'عنوان افتراضي',
            save: 'حفظ',
            cancel: 'إلغاء',
            
            // Days
            sunday: 'الأحد',
            monday: 'الاثنين',
            tuesday: 'الثلاثاء',
            wednesday: 'الأربعاء',
            thursday: 'الخميس',
            friday: 'الجمعة',
            saturday: 'السبت',
            
            // Meal types
            breakfast: 'فطور',
            lunch: 'غداء',
            dinner: 'عشاء',
            
            // Footer
            copyright: 'اشتراكات الوجبات',
            poweredBy: 'منصة مكسب',
        },
        en: {
            // Navigation
            home: 'Home',
            restaurants: 'Restaurants',
            mySubscriptions: 'My Subscriptions',
            deliveryAddresses: 'Delivery Addresses',
            login: 'Login',
            logout: 'Logout',
            language: 'Language',
            
            // Home page
            welcomeTitle: 'Subscribe to Your Favorite Meals',
            welcomeSubtitle: 'Choose from a variety of restaurants and get your favorite meals delivered on time',
            getStarted: 'Get Started',
            viewRestaurants: 'View Restaurants',
            learnMore: 'Learn More',
            discountBadge: '30% discount for new subscriptions',
            heroTitle: 'Subscribe from your favorite restaurants',
            heroSubtitle: 'And get your meal delivered at a fixed time',
            heroDescription: 'Choose one restaurant, a weekly or monthly plan, and select a meal every day (Sunday-Wednesday) with one delivery address.',
            designPreview: 'Design Preview',
            designDescription: 'Modern and attractive design',
            
            // Features Section
            whySubscribe: 'Why Subscribe with Us?',
            featuresDescription: 'We offer you a unique and distinctive experience in the world of meal subscriptions',
            diverseMeals: 'Diverse Meals',
            diverseMealsDesc: 'A curated list of restaurants; choose breakfast, lunch, or dinner to suit your taste.',
            fixedDelivery: 'Fixed Delivery Time',
            fixedDeliveryDesc: 'We deliver at the same designated time for the meal type throughout the subscription period.',
            securePayment: 'Secure Payment in Seconds',
            securePaymentDesc: 'Pay through Thawani in one step with a clear final price.',
            
            // Restaurants Section
            featuredRestaurants: 'Our Featured Restaurants',
            restaurantsDescription: 'Discover a variety of distinguished restaurants and start your journey with us',
            viewAllRestaurants: 'View All Restaurants',
            
            // How it works
            howItWorks: 'How Does Subscription Work?',
            howItWorksDesc: 'Simple steps to start your journey with us',
            step1: 'Register with email, Google, or Apple',
            step2: 'Choose a restaurant and your plan (weekly/monthly)',
            step3: 'Select a meal every day (Sunday-Wednesday) with one address',
            step4: 'Pay in seconds and receive at the fixed time',
            
            // Restaurant
            viewMenu: 'View Menu',
            subscribe: 'Subscribe Now',
            mealType: 'Meal Type',
            price: 'Price',
            deliveryTime: 'Delivery Time',
            
            // Subscription
            subscriptionType: 'Subscription Type',
            weekly: 'Weekly',
            monthly: 'Monthly',
            startDate: 'Start Date',
            selectMeals: 'Select Meals',
            deliveryAddress: 'Delivery Address',
            totalAmount: 'Total Amount',
            confirmSubscription: 'Confirm Subscription',
            subscriptionDetails: 'Subscription Details',
            status: 'Status',
            pending: 'Pending',
            active: 'Active',
            completed: 'Completed',
            cancelled: 'Cancelled',
            
            // Delivery Address
            addAddress: 'Add Address',
            editAddress: 'Edit Address',
            deleteAddress: 'Delete Address',
            name: 'Name',
            phone: 'Phone',
            address: 'Address',
            city: 'City',
            postalCode: 'Postal Code',
            additionalNotes: 'Additional Notes',
            isDefault: 'Default Address',
            save: 'Save',
            cancel: 'Cancel',
            
            // Days
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            
            // Meal types
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            
            // Footer
            copyright: 'Meal Subscriptions',
            poweredBy: 'Powered by Maksab',
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        const newLanguage = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLanguage);
        
        // Update document direction
        document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLanguage;
        
        // Save to localStorage
        localStorage.setItem('language', newLanguage);
    };

    // Initialize language from localStorage
    React.useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
            setLanguage(savedLanguage);
            document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = savedLanguage;
        }
    }, []);

    const value = {
        language,
        setLanguage,
        t,
        toggleLanguage,
        dir: language === 'ar' ? 'rtl' : 'ltr'
    };

    return (
        <LanguageContext.Provider value={value}>
            <div dir={value.dir} className={language === 'ar' ? 'font-arabic' : 'font-english'}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
};


