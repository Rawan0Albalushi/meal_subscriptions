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
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

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

