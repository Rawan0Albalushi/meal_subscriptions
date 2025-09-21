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
            navigation: 'التنقل',
            sellerDashboard: 'لوحة تحكم البائع',
            seller: 'البائع',
            loading: 'جاري التحميل',
            dashboard: 'لوحة التحكم',
            dashboardDescription: 'نظرة عامة على نشاطك',
            sellerRestaurantsDescription: 'إدارة مطاعمك',
            meals: 'الوجبات',
            mealsDescription: 'إدارة وجباتك',
            profile: 'الملف الشخصي',
            profileDescription: 'إعدادات حسابك',
            todayOrders: 'طلبات اليوم',
            todayOrdersDescription: 'عرض وإدارة طلبات اليوم',
            
            // Greetings
            hello: 'مرحبا',
            welcome: 'مرحباً بك',
            welcomeBack: 'مرحباً بعودتك',
            welcomeTo: 'مرحباً بك في',
            joinUs: 'انضم إلينا الآن',
            loginSuccess: 'تم تسجيل دخولك بنجاح',
            registrationSuccess: 'تم التسجيل بنجاح',
            dear: 'عزيزي',
            user: 'المستخدم',
            
            // Home page
            welcomeTitle: 'اشترك في وجباتك المفضلة',
            welcomeSubtitle: 'اختر من مجموعة متنوعة من المطاعم واحصل على وجباتك المفضلة في الوقت المحدد',
            getStarted: 'ابدأ الآن',
            viewRestaurants: 'عرض المطاعم',
            learnMore: 'تعرف أكثر',
            discountBadge: 'إشترك وخلي الباقي علينا',
            heroTitle: 'اشتـرك من مطاعمـك المفضلـة',
            heroSubtitle: 'وتوصلك وجبتك لين عندك',
            heroDescription: 'اختر مطعمك المفضّل، اشترك أسبوعيًا أو شهريًا، وحدِّد وجبتك لكل يوم (الأحد–الأربعاء) مع عنوان توصيل ثابت',
            designPreview: 'معاينة التصميم',
            designDescription: 'تصميم حديث وجذاب',
            
            // Features Section
            whySubscribe: 'لماذا الاشتراك معنا؟',
            featuresDescription: 'نقدم لك تجربة فريدة ومميزة في عالم اشتراكات الوجبات',
            diverseMeals: 'وجبات متنوعة',
            diverseMealsDesc: 'قائمة مختارة من المطاعم؛ اختر فطور أو غداء أو عشاء بما يناسب ذوقك.',
            fixedDelivery: 'وقت توصيل ثابت',
            fixedDeliveryDesc: 'نوصّل في نفس الموعد المخصّص لنوع الوجبة طوال مدة الاشتراك.',
            securePayment: 'دفع آمن',
            securePaymentDesc: 'ادفع بخطوة واحدة وبسعر نهائي واضح.',
            
            // Restaurants Section
            featuredRestaurants: 'مطاعمنا المميزة',
            restaurantsDescription: 'اكتشف مجموعة متنوعة من المطاعم المميزة وابدأ رحلتك معنا',
            viewAllRestaurants: 'عرض جميع المطاعم',
            
            // How it works
            howItWorks: 'كيف يعمل الاشتراك؟',
            howItWorksDesc: 'خطوات بسيطة لتبدأ رحلتك معنا',
            step1: 'سجّل بالبريد الإلكتروني',
            step2: 'اختر مطعمًا وخطتك (أسبوعي/شهري)',
            step3: 'حدّد وجبة كل يوم (أحد-أربعاء) وعنوانًا واحدًا',
            step4: 'ادفع واستلم في الموعد الثابت',
            step1Title: 'التسجيل',
            step2Title: 'اختيار المطعم',
            step3Title: 'تحديد الجدول',
            step4Title: 'الدفع والتوصيل',
            
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
            week: 'الأسبوع',
            month: 'الشهر',
            weeks: 'أسابيع',
            startDate: 'تاريخ البداية',
            selectMeals: 'اختر الوجبات',
            deliveryAddress: 'عنوان التوصيل',
            totalAmount: 'المبلغ الإجمالي',
            deliveryPrice: 'سعر التوصيل',
            free: 'مجاني',
            priceBreakdown: 'تفاصيل السعر',
            basePrice: '',
            freeDelivery: 'توصيل مجاني',
            paidDelivery: '',
            finalPrice: '',
            reviewAndCompleteOrder: 'راجع وأكمل طلبك',
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
            isDefault: 'العنوان الافتراضي',
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
            poweredBy: 'مدعوم بواسطة Maksab',
            mealSubscriptions: 'اشتراكات الوجبات',

            // Login/Register Page
            createAccount: 'إنشاء حساب',
            fullName: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            confirmPassword: 'تأكيد كلمة المرور',
            rememberMe: 'تذكرني',
            forgotPassword: 'نسيت كلمة المرور؟',
            backToHome: 'العودة للرئيسية',
            loginDescription: 'سجل دخولك للوصول إلى اشتراكاتك',
            registerDescription: 'أنشئ حساب جديد واستمتع بخدماتنا',
            loginPageDescription: 'سجل دخولك للوصول إلى اشتراكاتك المفضلة',
            redirectingToHome: 'جاري التوجيه للصفحة الرئيسية خلال لحظات...',
            redirecting: 'جاري التوجيه...',
            loggingIn: 'جاري تسجيل الدخول...',
            creatingAccount: 'جاري إنشاء الحساب...',
            
            // Form validation messages
            fullNameRequired: 'الاسم الكامل مطلوب',
            emailRequired: 'البريد الإلكتروني مطلوب',
            invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
            passwordRequired: 'كلمة المرور مطلوبة',
            passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
            confirmPasswordRequired: 'تأكيد كلمة المرور مطلوب',
            passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
            
            // Form placeholders
            enterFullName: 'أدخل اسمك الكامل',
            enterEmail: 'أدخل عنوان بريدك الإلكتروني',
            enterPassword: 'أدخل كلمة المرور',
            confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
            
            // Error messages
            loginError: 'حدث خطأ أثناء تسجيل الدخول',
            registrationError: 'حدث خطأ أثناء إنشاء الحساب',
            emailAlreadyExists: 'البريد الإلكتروني مستخدم بالفعل',
            invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            
            // Login popup
            loginRequired: 'تسجيل الدخول مطلوب',
            loginRequiredMessage: 'يرجى تسجيل الدخول أولاً للاشتراك في الوجبات',
            
            // Restaurants page
            availableRestaurants: 'المطاعم المتاحة',
            searchFilters: 'فلاتر البحث',
            clearFilters: 'مسح الفلاتر',
            locations: 'العناوين',
            mealTypes: 'أنواع الوجبات',
            selectLocation: 'اختر العنوان',
            selectMealType: 'اختر نوع الوجبة',
            clearSelection: 'إلغاء التحديد',
            loadingRestaurants: 'جاري تحميل المطاعم...',
            restaurantsLoadError: 'حدث خطأ في تحميل المطاعم',
            noRestaurantsAvailable: 'لا توجد مطاعم متاحة',
            tryChangingFilters: 'جرب تغيير الفلاتر المحددة',
            showAllRestaurants: 'عرض جميع المطاعم',
            viewMeals: 'عرض الوجبات',
            restaurantLoadError: 'فشل في جلب بيانات المطعم من الباكند',
            mealsLoadError: 'فشل في جلب الوجبات من الباكند',
            subscriptionTypesLoadError: 'فشل في جلب أنواع الاشتراك من الباكند',
            generalLoadError: 'حدث خطأ أثناء جلب بيانات المطعم أو الوجبات',
            mostPopular: 'الأكثر شعبية',
            
            // Restaurant Detail page
            loadingRestaurantData: 'جاري تحميل بيانات المطعم والوجبات...',
            pleaseWait: 'يرجى الانتظار قليلاً',
            errorMessage: 'حدث خطأ أثناء جلب بيانات المطعم أو الوجبات. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.',
            retry: 'إعادة المحاولة',
            restaurantNotFound: 'المطعم غير موجود',
            restaurantNotFoundMessage: 'يبدو أن المطعم الذي تبحث عنه غير موجود أو تم حذفه. يرجى العودة إلى قائمة المطاعم.',
            backToRestaurants: 'العودة للمطاعم',
            selectSubscriptionType: 'اختر نوع الاشتراك',
            selectSubscriptionTypeMessage: 'اختر نوع الاشتراك المناسب لك وابدأ رحلتك مع {restaurantName}',
            selectMealForEachDay: 'اختر وجبة لكل يوم',
            selectMealForEachDayWithCount: 'اختر {count} وجبة لاشتراكك {type}',
            selectMealForEachDayWeekly: 'اختر وجبة مختلفة لكل يوم من أيام العمل',
            selectMealForEachDayMonthly: 'اختر وجبة مختلفة لكل يوم من أيام العمل لمدة 4 أسابيع',
            startSubscriptionDate: 'تاريخ بدء الاشتراك',
            selectStartDateMessage: 'اختر تاريخ البدء من أيام العمل',
            selectWeekdayOnly: 'يرجى اختيار يوم من أيام العمل فقط (الأحد إلى الأربعاء)',
            selectFirstAvailableDay: 'اختر أول يوم متاح',
            dateSelected: 'تم اختيار التاريخ',
            selectWeekdayOnlyMessage: 'يمكن اختيار أيام العمل فقط (الأحد إلى الأربعاء)',
            noMealsAvailable: 'لا توجد وجبات متاحة حالياً',
            pleaseTryAgainLater: 'يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع المطعم',
            reload: 'إعادة تحميل',
            selectStartDateFirst: 'يرجى اختيار تاريخ بدء الاشتراك أولاً',
            daysWillBeDisplayedBasedOnSelectedDate: 'سيتم عرض الأيام المتاحة بناءً على التاريخ المختار',
            selected: 'تم الاختيار',
            noDescriptionAvailable: 'لا يوجد وصف متاح',
            selectThisMeal: 'اختيار هذه الوجبة',
            selectedMealsCount: 'تم اختيار {count} وجبة',
            mealsSelectionProgress: 'تقدم اختيار الوجبات',
            mealsSelected: 'وجبة مختارة',
            selectRequiredMealsCount: 'يرجى اختيار {count} وجبة',
            maxMealsReached: 'لا يمكن اختيار أكثر من {count} وجبة',
            continueToSubscription: 'متابعة إلى صفحة الاشتراك',
            selectStartDate: 'يرجى اختيار تاريخ بدء الاشتراك',
            selectAtLeastOneMeal: 'يرجى اختيار وجبة واحدة على الأقل',
            
            // Subscription Form Page
            createNewSubscription: 'إنشاء اشتراك جديد',
            completeSubscriptionDetails: 'أكمل تفاصيل اشتراكك وابدأ رحلتك مع',
            subscriptionSummary: 'ملخص الاشتراك',
            selectedMeals: 'الوجبات المختارة',
            subscriptionPrice: 'سعر الاشتراك',
            subscriptionStartDate: 'تاريخ بدء الاشتراك',
            dateNotSelected: 'لم يتم تحديد التاريخ',
            selectDeliveryAddress: 'اختر عنوان التوصيل',
            addNewAddress: '+ إضافة عنوان جديد',
            addressName: 'اسم العنوان',
            addressNamePlaceholder: 'مثل: المنزل، العمل',
            detailedAddress: 'العنوان التفصيلي',
            detailedAddressPlaceholder: 'الحي، الشارع، رقم المنزل، مسقط',
            cityPlaceholder: 'مسقط، صلالة، صحار',
            phonePlaceholder: '+96899999999',
            specialInstructions: '📝 تعليمات خاصة',
            specialInstructionsPlaceholder: 'أي تعليمات خاصة للتوصيل أو تفضيلات إضافية...',
            createSubscription: 'إنشاء الاشتراك',
            creatingSubscription: 'جاري إنشاء الاشتراك...',
            backToRestaurant: 'العودة للمطعم',
            loadingData: 'جاري تحميل البيانات...',
            errorLoadingData: 'حدث خطأ أثناء تحميل البيانات',
            selectLocationOnMapTitle: '🗺️ تحديد موقعك على الخريطة',
            selectedLocation: 'الموقع المحدد:',
            latitude: 'خط العرض:',
            longitude: 'خط الطول:',
            subscriptionTypeLabel: 'نوع الاشتراك',
            mealsCount: 'عدد الوجبات',
            omaniRiyal: 'ريال عماني',
            
            // Error Messages
            dateError: 'خطأ في التاريخ',
            startDateMustBeTomorrow: 'تاريخ البداية يجب أن يكون غداً أو بعده. لا يمكن إنشاء اشتراك ليوم اليوم.',
            startDateMustBeWeekday: 'تاريخ البداية يجب أن يكون يوم عمل (الأحد إلى الأربعاء)',
            addressError: 'خطأ في العنوان',
            selectDeliveryAddressOrAddNew: 'يرجى اختيار عنوان التوصيل أو إضافة عنوان جديد',
            enterCompleteAddressData: 'يرجى إدخال بيانات العنوان كاملة',
            addressSaveError: 'خطأ في حفظ العنوان',
            addressSaveFailed: 'تعذر حفظ العنوان',
            mealsSelectionError: 'خطأ في اختيار الوجبات',
            subscriptionCreatedSuccess: 'تم إنشاء الاشتراك بنجاح! 🎉',
            subscriptionCreatedMessage: 'تم إنشاء اشتراكك بنجاح. سيتم توجيهك إلى صفحة الاشتراكات لمتابعة طلبك.',
            subscriptionCreationFailed: 'فشل في إنشاء الاشتراك',
            subscriptionCreationError: 'حدث خطأ أثناء إنشاء الاشتراك',
            
            // Meal Type Filter
            mealTypeFilter: 'فلتر أنواع الوجبات',
            mealTypeFilterMessage: 'اختر نوع الوجبة لعرض الوجبات المتاحة فقط',
            showingMealsOnly: 'عرض وجبات {type} فقط',
            
            // Payment Success
            paymentSuccessful: 'تم الدفع بنجاح!',
            paymentSuccessMessage: 'تم تأكيد دفعتك بنجاح. يمكنك الآن الاستمتاع باشتراكك.',
            paymentDetails: 'تفاصيل الدفع',
            verifyingPayment: 'جاري التحقق من الدفع...',
            refresh: 'إعادة تحميل',
            goToSubscriptions: 'الذهاب للاشتراكات',
            viewMySubscriptions: 'عرض اشتراكاتي',
            amount: 'المبلغ',
            paymentMethod: 'طريقة الدفع',
            paidAt: 'تاريخ الدفع',
            subscriptionStatus: 'حالة الاشتراك',
            
            // Payment Error Messages
            subscriptionIdMissing: 'معرف الاشتراك مفقود',
            paymentStillProcessing: 'الدفع قيد المعالجة. يرجى الانتظار قليلاً وتحديث الصفحة.',
            paymentVerificationFailed: 'فشل في التحقق من الدفع',
            paymentSessionNotFound: 'لم يتم العثور على جلسة الدفع. يرجى الاتصال بالدعم إذا كنت تعتقد أن هذا خطأ.',
            failedToVerifyPayment: 'فشل في التحقق من حالة الدفع. يرجى المحاولة مرة أخرى.',
            
            // Payment Cancel
            paymentCancelled: 'تم إلغاء الدفع',
            paymentCancelledMessage: 'تم إلغاء دفعتك. يمكنك المحاولة مرة أخرى أو الاتصال بالدعم إذا كنت بحاجة إلى مساعدة.',
            goHome: 'العودة للرئيسية',
            
            // Contact Us
            additionalInformation: 'معلومات إضافية',
            contactUsDescription: 'نحن متواجدون لمساعدتك في أي وقت. لا تتردد في التواصل معنا للحصول على الدعم أو الاستفسارات حول خدماتنا.',
            
            // Subscription Detail
            subscriptionLoadError: 'فشل في جلب تفاصيل الاشتراك',
            
            // Meals and Subscriptions
            noMealsInSubscription: 'لا توجد وجبات في هذا الاشتراك',
            noMealsAvailableInRestaurant: 'لا توجد وجبات متاحة في هذا المطعم',
            noMealsYet: 'لا توجد وجبات لهذا المطعم بعد',
            noMealsTitle: 'لا توجد وجبات',
            selectMealTypeToShow: 'يرجى اختيار نوع الوجبة لعرض الوجبات المتاحة',
            noMealsOfTypeAvailable: 'لا توجد وجبات {type} متاحة',

            // Cart
            myCart: 'سلتي',
            cartEmpty: 'السلة فارغة',
            startAddingItems: 'ابدأ بإضافة العناصر إلى السلة',
            browseRestaurants: 'تصفح المطاعم',
            removeItem: 'إزالة العنصر',
            clearCart: 'إفراغ السلة',
            confirm: 'تأكيد',
            confirmClearCart: 'هل أنت متأكد من أنك تريد إفراغ السلة؟',
            orderSummary: 'ملخص الطلب',
            selectDeliveryAddressForOrder: 'اختر عنوان التوصيل',
            pleaseSelectDeliveryAddress: 'يرجى اختيار عنوان التوصيل',
            enterSpecialInstructions: 'أدخل التعليمات الخاصة',
            subtotal: 'المجموع الفرعي',
            deliveryFee: 'رسوم التوصيل',
            total: 'الإجمالي',
            proceedToPayment: 'الانتقال للدفع',
            processing: 'جاري المعالجة...',
            itemRemovedFromCart: 'تم إزالة العنصر من السلة',
            cartCleared: 'تم إفراغ السلة',
            deliveryAddressUpdated: 'تم تحديث عنوان التوصيل',
            specialInstructionsUpdated: 'تم تحديث التعليمات الخاصة',
            failedToRemoveItem: 'فشل في إزالة العنصر',
            failedToClearCart: 'فشل في إفراغ السلة',
            failedToUpdateAddress: 'فشل في تحديث العنوان',
            failedToUpdateInstructions: 'فشل في تحديث التعليمات',
            checkoutFailed: 'فشل في إتمام الطلب',
            addToCart: 'إضافة للسلة',
            itemAddedToCart: 'تم إضافة العنصر للسلة',
            failedToAddToCart: 'فشل في إضافة العناصر للسلة',
            reloadPage: 'إعادة تحميل',
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
            navigation: 'Navigation',
            sellerDashboard: 'Seller Dashboard',
            seller: 'Seller',
            loading: 'Loading',
            dashboard: 'Dashboard',
            dashboardDescription: 'Overview',
            sellerRestaurantsDescription: 'Restaurants',
            meals: 'Meals',
            mealsDescription: 'Meals',
            profile: 'Profile',
            profileDescription: 'Settings',
            
            // Greetings
            hello: 'Hello',
            welcome: 'Welcome',
            welcomeBack: 'Welcome Back',
            welcomeTo: 'Welcome to',
            joinUs: 'Join Us Now',
            loginSuccess: 'You have been successfully logged in',
            registrationSuccess: 'Registration successful',
            dear: 'dear',
            user: 'User',
            
            // Home page
            welcomeTitle: 'Subscribe to Your Favorite Meals',
            welcomeSubtitle: 'Choose from a variety of restaurants and get your favorite meals delivered on time',
            getStarted: 'Get Started',
            viewRestaurants: 'View Restaurants',
            learnMore: 'Learn More',
            discountBadge: 'Subscribe and leave the rest to us',
            heroTitle: 'Subscribe from your favorite restaurants',
            heroSubtitle: 'And get your meal delivered right to you',
            heroDescription: 'Choose your favorite restaurant, subscribe weekly or monthly, and set your meal for each day (Sunday–Wednesday) with a fixed delivery address',
            designPreview: 'Design Preview',
            designDescription: 'Modern and attractive design',
            
            // Features Section
            whySubscribe: 'Why Subscribe with Us?',
            featuresDescription: 'We offer you a unique and distinctive experience in the world of meal subscriptions',
            diverseMeals: 'Diverse Meals',
            diverseMealsDesc: 'A curated list of restaurants; choose breakfast, lunch, or dinner to suit your taste.',
            fixedDelivery: 'Fixed Delivery Time',
            fixedDeliveryDesc: 'We deliver at the same designated time for the meal type throughout the subscription period.',
            securePayment: 'Secure Payment',
            securePaymentDesc: 'Pay in one step with a clear final price.',
            
            // Restaurants Section
            featuredRestaurants: 'Our Featured Restaurants',
            restaurantsDescription: 'Discover a variety of distinguished restaurants and start your journey with us',
            viewAllRestaurants: 'View All Restaurants',
            
            // How it works
            howItWorks: 'How Does Subscription Work?',
            howItWorksDesc: 'Simple steps to start your journey with us',
            step1: 'Register with email',
            step2: 'Choose a restaurant and your plan (weekly/monthly)',
            step3: 'Select a meal every day (Sunday-Wednesday) with one address',
            step4: 'Pay and receive at the fixed time',
            step1Title: 'Registration',
            step2Title: 'Choose Restaurant',
            step3Title: 'Schedule',
            step4Title: 'Payment and Delivery',
            
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
            week: 'week',
            month: 'month',
            weeks: 'weeks',
            startDate: 'Start Date',
            selectMeals: 'Select Meals',
            deliveryAddress: 'Delivery Address',
            totalAmount: 'Total Amount',
            deliveryPrice: 'Delivery Price',
            free: 'Free',
            priceBreakdown: 'Price Breakdown',
            basePrice: 'Base Price',
            freeDelivery: 'Free Delivery',
            paidDelivery: 'Paid Delivery',
            finalPrice: 'Final Price',
            reviewAndCompleteOrder: 'Review and complete your order',
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
            mealSubscriptions: 'Meal Subscriptions',

            // Login/Register Page
            createAccount: 'Create Account',
            fullName: 'Full Name',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            rememberMe: 'Remember Me',
            forgotPassword: 'Forgot Password?',
            backToHome: 'Back to Home',
            loginDescription: 'Log in to access your subscriptions',
            registerDescription: 'Create a new account and enjoy our services',
            loginPageDescription: 'Log in to access your favorite subscriptions',
            redirectingToHome: 'Redirecting to home page in a few moments...',
            redirecting: 'Redirecting...',
            loggingIn: 'Logging in...',
            creatingAccount: 'Creating account...',
            
            // Form validation messages
            fullNameRequired: 'Full name is required',
            emailRequired: 'Email is required',
            invalidEmail: 'Please enter a valid email address',
            passwordRequired: 'Password is required',
            passwordMinLength: 'Password must be at least 6 characters',
            confirmPasswordRequired: 'Confirm password is required',
            passwordsDoNotMatch: 'Passwords do not match',
            
            // Form placeholders
            enterFullName: 'Enter your full name',
            enterEmail: 'Enter your email address',
            enterPassword: 'Enter your password',
            confirmPasswordPlaceholder: 'Re-enter your password',
            
            // Error messages
            loginError: 'An error occurred during login',
            registrationError: 'An error occurred during account creation',
            emailAlreadyExists: 'Email is already in use',
            invalidCredentials: 'Email or password is incorrect',
            
            // Login popup
            loginRequired: 'Login required',
            loginRequiredMessage: 'Please log in first to subscribe to meals',
            
            // Restaurants page
            availableRestaurants: 'Available Restaurants',
            searchFilters: 'Search Filters',
            clearFilters: 'Clear Filters',
            locations: 'Locations',
            mealTypes: 'Meal Types',
            selectLocation: 'Select Location',
            selectMealType: 'Select Meal Type',
            clearSelection: 'Clear Selection',
            loadingRestaurants: 'Loading restaurants...',
            restaurantsLoadError: 'An error occurred while loading restaurants',
            noRestaurantsAvailable: 'No restaurants available',
            tryChangingFilters: 'Try changing the selected filters',
            showAllRestaurants: 'Show All Restaurants',
            viewMeals: 'View Meals',
            restaurantLoadError: 'Failed to load restaurant data from backend',
            mealsLoadError: 'Failed to load meals from backend',
            subscriptionTypesLoadError: 'Failed to load subscription types from backend',
            generalLoadError: 'An error occurred while loading restaurant data or meals',
            mostPopular: 'Most Popular',
            
            // Restaurant Detail page
            loadingRestaurantData: 'Loading restaurant data...',
            pleaseWait: 'Please wait a moment',
            errorMessage: 'An error occurred while loading restaurant data. Please check your internet connection and try again.',
            retry: 'Retry',
            restaurantNotFound: 'Restaurant not found',
            restaurantNotFoundMessage: 'The restaurant you are looking for does not exist or has been deleted. Please return to the restaurants list.',
            backToRestaurants: 'Back to Restaurants',
            selectSubscriptionType: 'Select Subscription Type',
            selectSubscriptionTypeMessage: 'Choose the subscription type that suits you and start your journey with {restaurantName}',
            selectMealForEachDay: 'Select a meal for each day',
            selectMealForEachDayWithCount: 'Choose {count} meals for your {type} subscription',
            selectMealForEachDayWeekly: 'Choose a different meal for each working day',
            selectMealForEachDayMonthly: 'Choose a different meal for each working day for 4 weeks',
            startSubscriptionDate: 'Subscription start date',
            selectStartDateMessage: 'Choose the start date from working days',
            selectWeekdayOnly: 'Please select a working day only (Sunday to Wednesday)',
            selectFirstAvailableDay: 'Select first available day',
            dateSelected: 'Date selected',
            selectWeekdayOnlyMessage: 'Only working days can be selected (Sunday to Wednesday)',
            noMealsAvailable: 'No meals available at the moment',
            pleaseTryAgainLater: 'Please try again later or contact the restaurant',
            reload: 'Reload',
            selectStartDateFirst: 'Please select a subscription start date first',
            daysWillBeDisplayedBasedOnSelectedDate: 'Available days will be displayed based on the selected date',
            selected: 'Selected',
            noDescriptionAvailable: 'No description available',
            selectThisMeal: 'Select this meal',
            selectedMealsCount: '{count} meals selected',
            mealsSelectionProgress: 'Meals Selection Progress',
            mealsSelected: 'meals selected',
            selectRequiredMealsCount: 'Please select {count} meals',
            maxMealsReached: 'Cannot select more than {count} meals',
            continueToSubscription: 'Continue to subscription page',
            selectStartDate: 'Please select a subscription start date',
            selectAtLeastOneMeal: 'Please select at least one meal',
            
            // Subscription Form Page
            createNewSubscription: 'Create New Subscription',
            completeSubscriptionDetails: 'Complete your subscription details and start your journey with',
            subscriptionSummary: 'Subscription Summary',
            selectedMeals: 'Selected Meals',
            subscriptionPrice: 'Subscription Price',
            subscriptionStartDate: 'Subscription Start Date',
            dateNotSelected: 'Date not selected',
            selectDeliveryAddress: 'Select delivery address',
            addNewAddress: '+ Add New Address',
            addressName: 'Address Name',
            addressNamePlaceholder: 'e.g., Home, Work',
            detailedAddress: 'Detailed Address',
            detailedAddressPlaceholder: 'District, Street, House Number, Muscat',
            cityPlaceholder: 'Muscat, Salalah, Sohar',
            phonePlaceholder: '+96899999999',
            specialInstructions: '📝 Special Instructions',
            specialInstructionsPlaceholder: 'Any special delivery instructions or additional preferences...',
            createSubscription: 'Create Subscription',
            creatingSubscription: 'Creating subscription...',
            backToRestaurant: 'Back to Restaurant',
            loadingData: 'Loading data...',
            errorLoadingData: 'An error occurred while loading data',
            selectLocationOnMapTitle: '🗺️ Select your location on the map',
            selectedLocation: 'Selected Location:',
            latitude: 'Latitude:',
            longitude: 'Longitude:',
            subscriptionTypeLabel: 'Subscription Type',
            mealsCount: 'Meals Count',
            omaniRiyal: 'Omani Riyal',
            
            // Error Messages
            dateError: 'Date Error',
            startDateMustBeTomorrow: 'Start date must be tomorrow or later. Cannot create subscription for today.',
            startDateMustBeWeekday: 'Start date must be a working day (Sunday to Wednesday)',
            addressError: 'Address Error',
            selectDeliveryAddressOrAddNew: 'Please select a delivery address or add a new one',
            enterCompleteAddressData: 'Please enter complete address data',
            addressSaveError: 'Address Save Error',
            addressSaveFailed: 'Failed to save address',
            mealsSelectionError: 'Meals Selection Error',
            subscriptionCreatedSuccess: 'Subscription Created Successfully! 🎉',
            subscriptionCreatedMessage: 'Your subscription has been created successfully. You will be redirected to the subscriptions page to track your order.',
            subscriptionCreationFailed: 'Failed to create subscription',
            subscriptionCreationError: 'An error occurred while creating the subscription',
            
            // Meal Type Filter
            mealTypeFilter: 'Meal Type Filter',
            mealTypeFilterMessage: 'Choose meal type to show available meals only',
            showingMealsOnly: 'Showing {type} meals only',
            
            // Payment Success
            paymentSuccessful: 'Payment Successful!',
            paymentSuccessMessage: 'Your payment has been confirmed successfully. You can now enjoy your subscription.',
            paymentDetails: 'Payment Details',
            verifyingPayment: 'Verifying payment...',
            refresh: 'Refresh',
            goToSubscriptions: 'Go to Subscriptions',
            viewMySubscriptions: 'View My Subscriptions',
            amount: 'Amount',
            paymentMethod: 'Payment Method',
            paidAt: 'Paid At',
            subscriptionStatus: 'Subscription Status',
            
            // Payment Error Messages
            subscriptionIdMissing: 'Subscription ID is missing',
            paymentStillProcessing: 'Payment is still being processed. Please wait a moment and refresh the page.',
            paymentVerificationFailed: 'Payment verification failed',
            paymentSessionNotFound: 'Payment session not found. Please contact support if you believe this is an error.',
            failedToVerifyPayment: 'Failed to verify payment status. Please try again.',
            
            // Payment Cancel
            paymentCancelled: 'Payment Cancelled',
            paymentCancelledMessage: 'Your payment was cancelled. You can try again or contact support if you need assistance.',
            goHome: 'Go Home',
            
            // Contact Us
            additionalInformation: 'Additional Information',
            contactUsDescription: 'We are here to help you anytime. Don\'t hesitate to contact us for support or inquiries about our services.',
            
            // Subscription Detail
            subscriptionLoadError: 'Failed to load subscription details',
            
            // Meals and Subscriptions
            noMealsInSubscription: 'No meals in this subscription',
            noMealsAvailableInRestaurant: 'No meals available in this restaurant',
            noMealsYet: 'No meals available for this restaurant yet',
            selectMealTypeToShow: 'Please select a meal type to show available meals',
            noMealsOfTypeAvailable: 'No {type} meals available',

            // Cart
            myCart: 'My Cart',
            cartEmpty: 'Cart is empty',
            startAddingItems: 'Start adding items to your cart',
            browseRestaurants: 'Browse Restaurants',
            removeItem: 'Remove Item',
            clearCart: 'Clear Cart',
            confirm: 'Confirm',
            confirmClearCart: 'Are you sure you want to clear the cart?',
            orderSummary: 'Order Summary',
            selectDeliveryAddressForOrder: 'Select delivery address',
            pleaseSelectDeliveryAddress: 'Please select a delivery address',
            enterSpecialInstructions: 'Enter special instructions',
            subtotal: 'Subtotal',
            deliveryFee: 'Delivery Fee',
            total: 'Total',
            proceedToPayment: 'Proceed to Payment',
            processing: 'Processing...',
            itemRemovedFromCart: 'Item removed from cart',
            cartCleared: 'Cart cleared',
            deliveryAddressUpdated: 'Delivery address updated',
            specialInstructionsUpdated: 'Special instructions updated',
            failedToRemoveItem: 'Failed to remove item',
            failedToClearCart: 'Failed to clear cart',
            failedToUpdateAddress: 'Failed to update address',
            failedToUpdateInstructions: 'Failed to update instructions',
            checkoutFailed: 'Checkout failed',
            addToCart: 'Add to Cart',
            itemAddedToCart: 'Item added to cart',
            failedToAddToCart: 'Failed to add items to cart',
            reloadPage: 'Reload',
        }
    };

    const t = (key, params = {}) => {
        const dictionary = translations[language];
        let text = Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : key;
        
        // Replace parameters in the text
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });
        
        return text;
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
