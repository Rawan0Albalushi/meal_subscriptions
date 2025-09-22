import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, subscriptionTypesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../hooks/useCart';

// Simple CSS styles
const styles = `
  .meal-filter-buttons {
    pointer-events: auto !important;
  }
  
  .meal-filter-button {
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  
  input[type="date"] {
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  
  /* Ensure date picker is clickable */
  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer !important;
    pointer-events: auto !important;
  }
  
  input[type="date"]::-webkit-inner-spin-button {
    cursor: pointer !important;
    pointer-events: auto !important;
  }
  
  input[type="date"]::-webkit-clear-button {
    cursor: pointer !important;
    pointer-events: auto !important;
  }
  
  @media (max-width: 768px) {
    .meal-filter-buttons {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    
    .meal-filter-button {
      flex: none !important;
      width: 100% !important;
      min-width: auto !important;
    }
    
    /* تحسين عرض بطاقات الوجبات على الهاتف */
    .meals-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
    
    /* تحسين حجم الأزرار على الهاتف */
    .meal-card {
      padding: 1rem !important;
      margin-bottom: 1rem !important;
    }
    
    /* تحسين عرض أيقونات الوجبات */
    .meal-icon {
      width: 3rem !important;
      height: 3rem !important;
      font-size: 1.5rem !important;
    }
    
    /* تحسين النصوص على الهاتف */
    .meal-title {
      font-size: 1rem !important;
      line-height: 1.3 !important;
    }
    
    .meal-description {
      font-size: 0.75rem !important;
      line-height: 1.4 !important;
    }
    
    /* تحسين أزرار اختيار نوع الوجبة */
    .meal-type-button {
      padding: 0.75rem 1rem !important;
      font-size: 0.875rem !important;
      min-width: 100px !important;
    }
    
    /* تحسين عرض التاريخ */
    .date-input {
      font-size: 1rem !important;
      padding: 0.875rem !important;
    }
    
    /* تحسين عرض رسائل الحالة */
    .status-message {
      padding: 1rem !important;
      font-size: 0.875rem !important;
    }
  }
  
  /* تحسينات إضافية للشاشات الصغيرة جداً */
  @media (max-width: 480px) {
    .meal-filter-buttons {
      gap: 0.5rem !important;
    }
    
    .meal-card {
      padding: 0.75rem !important;
    }
    
    .meal-icon {
      width: 2.5rem !important;
      height: 2.5rem !important;
      font-size: 1.25rem !important;
    }
    
    .meal-title {
      font-size: 0.875rem !important;
    }
    
    .meal-description {
      font-size: 0.7rem !important;
    }
    
    .meal-type-button {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.8rem !important;
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* تحسينات للهاتف - تحسين اللمس */
  @media (max-width: 768px) {
    button, input, select {
      min-height: 44px !important;
      touch-action: manipulation !important;
    }
    
    .meal-card {
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      -khtml-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
    
    .meal-card:active {
      transform: scale(0.98) !important;
      transition: transform 0.1s ease !important;
    }
    
    /* تحسين المسافات على الهاتف */
    .restaurant-detail-container {
      padding: 1rem !important;
    }
    
    /* تحسين حجم الأزرار لللمس */
    .meal-filter-button {
      min-height: 48px !important;
      padding: 0.75rem 1rem !important;
    }
    
    /* تحسين عرض البطاقات */
    .subscription-card {
      margin-bottom: 1rem !important;
    }
    
    /* تحسين عرض الرسائل */
    .status-message {
      margin-bottom: 1rem !important;
    }
    
    /* تحسين تخطيط الأزرار على الهاتف */
    .day-buttons-container {
      flex-direction: column !important;
      gap: 0.75rem !important;
      align-items: stretch !important;
    }
    
    .day-buttons-container > div {
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0.5rem !important;
    }
    
    .day-buttons-container button,
    .day-buttons-container .selected-badge {
      width: 100% !important;
      min-height: 48px !important;
      padding: 0.75rem 1rem !important;
      font-size: 0.9rem !important;
      justify-content: center !important;
    }
  }
  
  /* تحسينات للشاشات الصغيرة جداً */
  @media (max-width: 480px) {
    .restaurant-detail-container {
      padding: 0.5rem !important;
    }
    
    .meal-card {
      margin-bottom: 0.75rem !important;
    }
    
    .subscription-card {
      margin-bottom: 0.75rem !important;
    }
    
    /* تحسين النصوص للقراءة */
    h1, h2, h3 {
      line-height: 1.2 !important;
    }
    
    p {
      line-height: 1.4 !important;
    }
    
    /* تحسين الأزرار للشاشات الصغيرة جداً */
    .day-buttons-container {
      gap: 0.5rem !important;
    }
    
    .day-buttons-container button,
    .day-buttons-container .selected-badge {
      min-height: 44px !important;
      padding: 0.625rem 0.875rem !important;
      font-size: 0.85rem !important;
    }
  }
  
  /* تحسينات خاصة لبطاقات الاشتراك على الهاتف */
  @media (max-width: 768px) {
    .subscription-card {
      min-height: 250px !important;
      padding: 1.25rem !important;
      margin-bottom: 1rem !important;
    }
    
    .subscription-card .subscription-icon {
      font-size: 2rem !important;
      margin-bottom: 0.75rem !important;
    }
    
    .subscription-card .subscription-title {
      font-size: 1.125rem !important;
      line-height: 1.3 !important;
      margin-bottom: 0.25rem !important;
    }
    
    .subscription-card .subscription-subtitle {
      font-size: 0.75rem !important;
      line-height: 1.4 !important;
    }
    
    .subscription-card .subscription-price {
      font-size: 1.5rem !important;
    }
    
    .subscription-card .subscription-currency {
      font-size: 0.75rem !important;
    }
    
    .subscription-card .subscription-period {
      font-size: 0.5rem !important;
    }
    
    .subscription-card .delivery-info {
      font-size: 0.5rem !important;
    }
    
    .subscription-card .selection-button {
      padding: 0.375rem 0.75rem !important;
      font-size: 0.75rem !important;
    }
    
    /* تحسين عرض البطاقات في الشبكة */
    .subscription-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      padding: 0 0.5rem !important;
    }
    
    /* تحسين الشارات */
    .popular-badge {
      font-size: 0.5rem !important;
      padding: 0.125rem 0.375rem !important;
      top: 0.5rem !important;
      left: 0.5rem !important;
    }
    
    .selection-indicator {
      width: 1.5rem !important;
      height: 1.5rem !important;
      font-size: 0.75rem !important;
      top: 0.5rem !important;
      right: 0.5rem !important;
    }
  }
  
  /* تحسينات إضافية للشاشات الصغيرة جداً */
  @media (max-width: 480px) {
    .subscription-card {
      min-height: 220px !important;
      padding: 1rem !important;
    }
    
    .subscription-card .subscription-icon {
      font-size: 1.75rem !important;
      margin-bottom: 0.5rem !important;
    }
    
    .subscription-card .subscription-title {
      font-size: 1rem !important;
    }
    
    .subscription-card .subscription-subtitle {
      font-size: 0.7rem !important;
    }
    
    .subscription-card .subscription-price {
      font-size: 1.25rem !important;
    }
    
    .subscription-card .subscription-currency {
      font-size: 0.7rem !important;
    }
    
    .subscription-card .subscription-period {
      font-size: 0.45rem !important;
    }
    
    .subscription-card .delivery-info {
      font-size: 0.45rem !important;
    }
    
    .subscription-card .selection-button {
      padding: 0.25rem 0.5rem !important;
      font-size: 0.7rem !important;
    }
    
    .subscription-grid {
      gap: 0.75rem !important;
      padding: 0 0.25rem !important;
    }
    
    .popular-badge {
      font-size: 0.45rem !important;
      padding: 0.1rem 0.25rem !important;
    }
    
    .selection-indicator {
      width: 1.25rem !important;
      height: 1.25rem !important;
      font-size: 0.6rem !important;
    }
  }
  
  /* تحسينات للتفاعل على الهاتف */
  @media (max-width: 768px) {
    .subscription-card {
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    
    .subscription-card:active {
      transform: scale(0.98) !important;
      transition: transform 0.1s ease !important;
    }
    
    .selection-button {
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    
    .selection-button:active {
      transform: scale(0.95) !important;
      transition: transform 0.1s ease !important;
    }
    
    /* تحسين المسافات لللمس */
    .subscription-card {
      margin-bottom: 1.5rem !important;
    }
    
    /* تحسين عرض النصوص */
    .subscription-title {
      word-break: break-word !important;
      hyphens: auto !important;
    }
    
    .subscription-subtitle {
      word-break: break-word !important;
    }
    
    /* تحسين الألوان للقراءة */
    .subscription-card {
      background: rgba(255, 255, 255, 0.98) !important;
    }
    
    .subscription-card:hover {
      background: rgba(255, 255, 255, 1) !important;
    }
  }

  /* Mobile horizontal scroll styles */
  @media (max-width: 768px) {
    .meals-grid {
      display: flex !important;
      flex-direction: row !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      gap: 1rem !important;
      padding: 0 0.5rem !important;
      scroll-snap-type: x mandatory !important;
      scrollbar-width: thin;
      scrollbar-color: rgba(47, 110, 115, 0.3) transparent;
      -webkit-overflow-scrolling: touch;
    }
    
    .meals-grid::-webkit-scrollbar {
      height: 4px;
    }
    
    .meals-grid::-webkit-scrollbar-track {
      background: rgba(47, 110, 115, 0.1);
      border-radius: 2px;
    }
    
    .meals-grid::-webkit-scrollbar-thumb {
      background: rgba(47, 110, 115, 0.4);
      border-radius: 2px;
    }
    
    .meals-grid::-webkit-scrollbar-thumb:hover {
      background: rgba(47, 110, 115, 0.6);
    }
    
    .meal-card {
      scroll-snap-align: start !important;
      min-width: 260px !important;
      max-width: 280px !important;
      flex-shrink: 0 !important;
      height: 280px !important;
      border-radius: 1rem !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, language, dir } = useLanguage();
  const { createOrUpdateCart, addItem, clearCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [startDate, setStartDate] = useState('');
  const [errors, setErrors] = useState({});
  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [customMealDates, setCustomMealDates] = useState({});
  const [editingMealDate, setEditingMealDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError] = useState('');

  const weekDays = [
    { key: 'sunday', label: language === 'ar' ? 'الأحد' : 'Sunday' },
    { key: 'monday', label: language === 'ar' ? 'الاثنين' : 'Monday' },
    { key: 'tuesday', label: language === 'ar' ? 'الثلاثاء' : 'Tuesday' },
    { key: 'wednesday', label: language === 'ar' ? 'الأربعاء' : 'Wednesday' },
    { key: 'thursday', label: language === 'ar' ? 'الخميس' : 'Thursday' }
  ];

  // Intercept clicks on "إفراغ السلة" inside inline error and confirm clearing
  useEffect(() => {
    const handleClick = async (e) => {
      const target = e.target.closest('a[data-clear-cart="1"]');
      if (!target) return;

      e.preventDefault();

      const confirmed = await new Promise((resolve) => {
        const confirmBox = document.createElement('div');
        confirmBox.style.position = 'fixed';
        confirmBox.style.inset = '0';
        confirmBox.style.background = 'rgba(0,0,0,0.5)';
        confirmBox.style.display = 'flex';
        confirmBox.style.alignItems = 'center';
        confirmBox.style.justifyContent = 'center';
        confirmBox.style.zIndex = '10000';

        const modal = document.createElement('div');
        modal.style.background = '#fff';
        modal.style.padding = '20px';
        modal.style.borderRadius = '12px';
        modal.style.width = 'min(420px, 92vw)';
        modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        modal.style.direction = dir;

        modal.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#f59e0b,#ef4444); display:flex; align-items:center; justify-content:center; color:white; font-weight:700;">!</div>
            <div style="font-size:1.1rem; font-weight:700; color:#111827;">${t('confirm')}</div>
          </div>
          <div style="color:#4b5563; font-size:0.95rem; margin-bottom:16px;">${t('confirmClearCart')}</div>
          <div style="display:flex; gap:8px; justify-content:${dir==='rtl'?'flex-start':'flex-end'};">
            <button id="confirmCancelBtn" style="padding:10px 14px; border:1px solid #e5e7eb; background:#fff; color:#374151; border-radius:8px; font-weight:600; cursor:pointer;">${t('cancel')}</button>
            <button id="confirmOkBtn" style="padding:10px 14px; border:none; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border-radius:8px; font-weight:700; cursor:pointer;">${t('clearCart')}</button>
          </div>
        `;

        confirmBox.appendChild(modal);
        document.body.appendChild(confirmBox);

        const cleanup = () => document.body.removeChild(confirmBox);
        modal.querySelector('#confirmOkBtn').onclick = () => { cleanup(); resolve(true); };
        modal.querySelector('#confirmCancelBtn').onclick = () => { cleanup(); resolve(false); };
      });

      if (!confirmed) return;

      try {
        await clearCart();
        setErrors((prev) => ({ ...prev, general: '' }));
      } catch (err) {
        // Keep the user on the same page; optionally surface an inline error
        setErrors((prev) => ({ ...prev, general: t('failedToClearCart') }));
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [dir, t, clearCart]);

  // أسماء أنواع الوجبات حسب اللغة
  const mealTypeNames = {
    ar: {
      'breakfast': 'فطور',
      'lunch': 'غداء',
      'dinner': 'عشاء'
    },
    en: {
      'breakfast': 'Breakfast',
      'lunch': 'Lunch',
      'dinner': 'Dinner'
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Clear any existing errors when component mounts
    setErrors({});
    
    const fetchRestaurantData = async () => {
              try {
          console.log('🔄 Starting to fetch restaurant data...');
          setLoading(true);
        
        // Fetch restaurant details
        console.log('🏪 Fetching restaurant details for ID:', id);
        const restaurantResponse = await restaurantsAPI.getById(id);
        if (restaurantResponse.data.success) {
          console.log('🏪 Fetched restaurant:', restaurantResponse.data.data);
          setRestaurant(restaurantResponse.data.data);
          console.log('✅ Successfully set restaurant in state');
        } else {
          console.error('❌ Failed to fetch restaurant:', restaurantResponse);
          setError(t('restaurantLoadError'));
        }

        // Fetch restaurant meals (initially without subscription type filter)
        console.log('🍽️ Fetching meals for restaurant ID:', id);
        const mealsResponse = await restaurantsAPI.getMeals(id);
        if (mealsResponse.data.success) {
          console.log('🍽️ Fetched meals from backend:', mealsResponse.data.data);
          console.log('📊 Total meals count:', mealsResponse.data.data.length);
          console.log('📈 Meals by type:', {
            breakfast: mealsResponse.data.data.filter(m => m.meal_type === 'breakfast').length,
            lunch: mealsResponse.data.data.filter(m => m.meal_type === 'lunch').length,
            dinner: mealsResponse.data.data.filter(m => m.meal_type === 'dinner').length
          });
          setMeals(mealsResponse.data.data);
          console.log('✅ Successfully set meals in state');
        } else {
          console.error('❌ Failed to fetch meals:', mealsResponse);
          setError(t('mealsLoadError'));
        }

        // Fetch subscription types for this restaurant
        console.log('📋 Fetching subscription types for restaurant:', id);
        const subscriptionTypesResponse = await subscriptionTypesAPI.getByRestaurant(id);
        if (subscriptionTypesResponse.data.success) {
          console.log('📋 Fetched subscription types:', subscriptionTypesResponse.data.data);
          setSubscriptionTypes(subscriptionTypesResponse.data.data);
          console.log('✅ Successfully set subscription types in state');
        } else {
          console.error('❌ Failed to fetch subscription types:', subscriptionTypesResponse);
          setError(t('subscriptionTypesLoadError'));
        }
                      } catch (error) {
          console.error('❌ Error fetching restaurant data:', error);
          console.error('🔍 Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
          });
          setError(t('generalLoadError'));
        } finally {
          console.log('✅ Finished fetching data');
          console.log('📊 Final state:', {
            restaurant: restaurant ? 'Loaded' : 'Not loaded',
            mealsCount: meals.length,
            loading: false
          });
          setLoading(false);
        }
    };

            if (id) {
          console.log('🔄 Starting to fetch data for restaurant ID:', id);
              fetchRestaurantData();
  }
    }, [id, t, language]);

  // Reset selected meals when restaurant changes (disabled auto-scroll)
  // useEffect(() => {
  //   setSelectedMeals({});
  // }, [id]);

  const handleSubscriptionTypeSelect = async (subscriptionType) => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    setSelectedSubscriptionType(subscriptionType);
    setSelectedMeals({}); // Reset selected meals when changing subscription type
    setStartDate(''); // Reset start date when changing subscription type
    setMealTypeFilter(''); // Reset meal type filter when changing subscription type
    
    // Fetch meals filtered by subscription type
    try {
      console.log('🍽️ Fetching meals filtered by subscription type:', subscriptionType.id);
      const mealsResponse = await restaurantsAPI.getMeals(id, { subscription_type_id: subscriptionType.id });
      if (mealsResponse.data.success) {
        console.log('🍽️ Fetched filtered meals:', mealsResponse.data.data);
        setMeals(mealsResponse.data.data);
        console.log('✅ Successfully updated meals with subscription type filter');
      }
    } catch (error) {
      console.error('❌ Error fetching filtered meals:', error);
      // Keep existing meals if filtering fails
    }
    
    // Note: Auto-scroll has been disabled to prevent automatic scrolling when selecting subscription type
  };

  // دوال فلتر أنواع الوجبات
  const handleMealTypeFilter = (mealType) => {
    console.log('Meal type selected:', mealType);
    console.log('Current mealTypeFilter:', mealTypeFilter);
    
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    // إذا كان نفس النوع مختار، قم بإلغاء الاختيار
    if (mealTypeFilter === mealType) {
      console.log('Deselecting meal type');
      setMealTypeFilter('');
    } else {
      console.log('Selecting meal type');
      setMealTypeFilter(mealType);
    }
    
    setShowMealTypeDropdown(false);
    // إعادة تعيين الوجبات المختارة فقط عند تغيير نوع الوجبة
    setSelectedMeals({});
    
    // Note: Auto-scroll has been disabled to prevent automatic scrolling when selecting meal type
  };

  const clearMealTypeFilter = () => {
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    setMealTypeFilter('');
    setShowMealTypeDropdown(false);
    // إعادة تعيين الوجبات المختارة فقط عند إلغاء الفلتر
    setSelectedMeals({});
    
    // Note: Auto-scroll has been disabled to prevent automatic scrolling when clearing meal type filter
  };

  const getSelectedMealTypeText = () => {
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    if (!mealTypeFilter) return language === 'ar' ? 'اختر نوع الوجبة' : 'Select Meal Type';
    return mealTypeNames[language][mealTypeFilter] || mealTypeFilter;
  };

  // فلترة الوجبات حسب النوع المختار ونوع الاشتراك - لا تسمح بعرض جميع الوجبات
  const filteredMeals = React.useMemo(() => {
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    return meals.filter(meal => {
      if (!mealTypeFilter) return false; // لا تعرض أي وجبات إذا لم يتم اختيار نوع
      
      // فلترة حسب نوع الوجبة
      const matchesMealType = meal.meal_type === mealTypeFilter;
      
      // فلترة حسب نوع الاشتراك المختار
      const matchesSubscriptionType = !selectedSubscriptionType || 
        (meal.subscription_type_ids && meal.subscription_type_ids.includes(selectedSubscriptionType.id));
      
      return matchesMealType && matchesSubscriptionType;
    });
  }, [meals, mealTypeFilter, selectedSubscriptionType]);

  // الحصول على أنواع الوجبات المتاحة
  const availableMealTypes = React.useMemo(() => {
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    return [...new Set(meals.map(meal => meal.meal_type))];
  }, [meals]);
  console.log('Available meal types:', availableMealTypes);
  console.log('Meals data:', meals);

  // الاختيار التلقائي إذا كان هناك نوع واحد فقط (disabled to prevent auto-scroll)
  // useEffect(() => {
  //   if (availableMealTypes.length === 1 && !mealTypeFilter) {
  //     setMealTypeFilter(availableMealTypes[0]);
  //   }
  // }, [availableMealTypes, mealTypeFilter]);

  // Reset selected meals when start date changes (disabled auto-scroll)
  // useEffect(() => {
  //   setSelectedMeals({});
  // }, [startDate]);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mealTypeDropdown = document.querySelector('.meal-type-dropdown');
      const mealTypeButton = document.querySelector('.meal-type-button');
      
      if (showMealTypeDropdown && 
          mealTypeDropdown && 
          !mealTypeDropdown.contains(event.target) &&
          mealTypeButton &&
          !mealTypeButton.contains(event.target)) {
        setShowMealTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMealTypeDropdown]);



  // Focus on first meal when date changes (disabled auto-scroll)
  // useEffect(() => {
  //   if (startDate && meals.length > 0) {
  //     // Wait for the meals to be rendered
  //     setTimeout(() => {
  //       // Find the first meal element and scroll to it smoothly
  //       const firstMealElement = document.querySelector('[data-meal-day="sunday"]');
  //       if (firstMealElement) {
  //         firstMealElement.scrollIntoView({ 
  //           behavior: 'smooth', 
  //           block: 'start',
  //           inline: 'nearest'
  //         });
  //       }
  //     }, 150);
  //   }
  // }, [startDate, meals]);



  const handleMealSelection = (dayKey, meal, event) => {
    // Prevent auto-scroll by preventing default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const currentSelectedCount = Object.keys(selectedMeals).length;
    const maxAllowed = selectedSubscriptionType?.meals_count || 0;
    
    // Check if this specific meal is already selected
    const isCurrentMealSelected = selectedMeals[dayKey] && selectedMeals[dayKey].id === meal.id;
    
    // If this specific meal is already selected, allow deselection
    if (isCurrentMealSelected) {
      setSelectedMeals(prev => {
        const newSelected = { ...prev };
        delete newSelected[dayKey];
        return newSelected;
      });
    } else {
      // If this day already has a different meal selected, replace it
      // or if no meal is selected for this day, add it
      setSelectedMeals(prev => ({
        ...prev,
        [dayKey]: meal
      }));
    }
    
    // Clear meals error when user selects a meal
    if (errors.meals) {
      setErrors(prev => ({ ...prev, meals: '' }));
    }
    
    // Note: Auto-scroll has been disabled to prevent automatic scrolling when selecting meals
  };

  const handleContinueToSubscription = async () => {
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();

    const newErrors = {};

    if (!startDate) {
      newErrors.startDate = t('selectStartDate');
    }

    const selectedDays = Object.keys(selectedMeals);
    const requiredMealsCount = selectedSubscriptionType?.meals_count || 0;

    if (selectedDays.length === 0) {
      newErrors.meals = t('selectAtLeastOneMeal');
    } else if (selectedDays.length < requiredMealsCount) {
      newErrors.meals = t('selectRequiredMealsCount', { count: requiredMealsCount });
    } else if (selectedDays.length > requiredMealsCount) {
      newErrors.meals = t('selectRequiredMealsCount', { count: requiredMealsCount });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      // Create or update cart with restaurant and subscription type info
      const cartData = {
        restaurant_id: parseInt(id),
        subscription_type_id: selectedSubscriptionType.id,
        start_date: startDate
      };

      const cart = await createOrUpdateCart(cartData);

      // Build a map from dayKey to exact delivery date (YYYY-MM-DD) based on the start date
      const dayKeyToDateMap = getWeekDaysFromStartDate().reduce((acc, d) => {
        acc[d.key] = d.date;
        return acc;
      }, {});

      // Add each selected meal to the cart
      const addPromises = Object.entries(selectedMeals).map(async ([dayKey, meal]) => {
        const deliveryDate = dayKeyToDateMap[dayKey];
        const mealType = meal.meal_type || 'lunch'; // Default to lunch if not specified

        const itemData = {
          cart_id: cart.id,
          meal_id: meal.id,
          delivery_date: deliveryDate,
          meal_type: mealType
        };

        return await addItem(itemData);
      });

      await Promise.all(addPromises);

      // Navigate to cart page
      navigate('/cart');

    } catch (error) {
      console.error('Error adding items to cart:', error);
      setErrors({
        general: error.message || t('failedToAddToCart')
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMealForDay = (dayKey) => {
    return selectedMeals[dayKey] || null;
  };

  // دالة لتحديث تاريخ وجبة معينة
  const updateMealDate = (mealKey, newDate) => {
    if (!newDate) {
      setDateError('');
      return;
    }
    
    // استخدام نفس validation المستخدم في تاريخ البداية
    if (isValidWeekday(newDate)) {
      // حفظ التاريخ المخصص
      setCustomMealDates(prev => {
        const updatedDates = {
          ...prev,
          [mealKey]: newDate
        };
        console.log('📅 تم حفظ التاريخ المخصص:', { mealKey, newDate, allCustomDates: updatedDates });
        return updatedDates;
      });
      setDateError('');
      setEditingMealDate(null);
      setShowDatePicker(false);
    } else {
      // عرض رسالة خطأ كـ state
      const date = new Date(newDate);
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const isToday = newDate === todayString;
      const isWeekend = date.getDay() === 5 || date.getDay() === 6;
      
      if (isToday) {
        setDateError(language === 'ar' ? 'لا يمكن اختيار تاريخ اليوم - يجب اختيار تاريخ من الغد فما بعد' : 'Cannot select today\'s date - Please select a date from tomorrow onwards');
      } else if (isWeekend) {
        setDateError(language === 'ar' ? 'لا يمكن اختيار الخميس أو الجمعة أو السبت - يجب اختيار يوم من الأحد إلى الأربعاء' : 'Cannot select Thursday, Friday, or Saturday - Please select a day from Sunday to Wednesday');
      } else {
        setDateError(language === 'ar' ? 'لا يمكن اختيار الخميس أو الجمعة أو السبت - يجب اختيار يوم من الأحد إلى الأربعاء' : 'Cannot select Thursday, Friday, or Saturday - Please select a day from Sunday to Wednesday');
      }
    }
  };

  // دالة لفتح محرر التاريخ
  const openDateEditor = (mealKey) => {
    setEditingMealDate(mealKey);
    setShowDatePicker(true);
  };

  // دالة لإغلاق محرر التاريخ
  const closeDateEditor = () => {
    setEditingMealDate(null);
    setShowDatePicker(false);
    setDateError('');
  };

  // Get next valid weekday (Sunday to Wednesday) - starting from tomorrow
  const getNextValidDate = () => {
    const today = new Date();
    let nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 1); // Start from tomorrow
    
    // Find the next valid weekday (Sunday to Wednesday)
    // Thursday = 4, Friday = 5, Saturday = 6
    while (nextDate.getDay() === 5 || nextDate.getDay() === 6) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    // Format date as YYYY-MM-DD
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Function to set a valid date and clear errors
  const setValidDate = (date) => {
    // Prevent auto-scroll by preventing default behavior
    event?.preventDefault();
    event?.stopPropagation();
    
    setStartDate(date);
    setSelectedMeals({});
    setErrors(prev => ({ ...prev, startDate: '' })); // Clear error message
  };

  // Generate meal days based on selected start date and subscription type
  const getWeekDaysFromStartDate = () => {
    if (!startDate || !selectedSubscriptionType) return [];
    
    console.log('📅 بدء إنشاء أيام الوجبات مع التواريخ المخصصة:', customMealDates);
    
    const start = new Date(startDate);
    const days = [];
    const requiredMeals = selectedSubscriptionType.meals_count || 4;
    
    // Generate labels and icons based on required meals
    const mealLabelsArray = language === 'ar' 
      ? ['الوجبة الأولى', 'الوجبة الثانية', 'الوجبة الثالثة', 'الوجبة الرابعة', 'الوجبة الخامسة', 'الوجبة السادسة', 'الوجبة السابعة', 'الوجبة الثامنة', 'الوجبة التاسعة', 'الوجبة العاشرة', 'الوجبة الحادية عشر', 'الوجبة الثانية عشر', 'الوجبة الثالثة عشر', 'الوجبة الرابعة عشر', 'الوجبة الخامسة عشر', 'الوجبة السادسة عشر']
      : ['Meal 1', 'Meal 2', 'Meal 3', 'Meal 4', 'Meal 5', 'Meal 6', 'Meal 7', 'Meal 8', 'Meal 9', 'Meal 10', 'Meal 11', 'Meal 12', 'Meal 13', 'Meal 14', 'Meal 15', 'Meal 16'];
    
    // Define meal icons for each meal (removed emoji icons)
    const mealIconsArray = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    
    const mealLabels = [];
    const mealIcons = [];
    const dayKeys = [];
    
    for (let i = 0; i < requiredMeals; i++) {
      const weekIndex = Math.floor(i / 4); // 4 days per week
      const dayIndex = i % 4; // 0-3 for each week
      
      mealLabels.push(mealLabelsArray[i]);
      mealIcons.push(mealIconsArray[i] || ''); // No default icon
      
      // For monthly subscriptions, we need to repeat the same days
      // So we'll use the same day key but with a unique identifier
      const dayLabels = language === 'ar' 
        ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday'];
      
      // Always use English day names for backend compatibility
      const englishDayLabels = ['sunday', 'monday', 'tuesday', 'wednesday'];
      const baseDayKey = englishDayLabels[dayIndex];
      
      // Create unique day key for each meal to avoid conflicts
      // For weekly subscriptions, use meal index to ensure uniqueness
      // For monthly subscriptions, use week and day combination
      const uniqueDayKey = selectedSubscriptionType.type === 'monthly' 
        ? `${baseDayKey}_week${weekIndex + 1}` 
        : `meal_${i + 1}_${baseDayKey}`;
      dayKeys.push(uniqueDayKey);
    }
    
    let currentDate = new Date(start);
    let mealIndex = 0;
    
    // Generate meal days based on subscription type
    while (mealIndex < requiredMeals) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 0 && dayOfWeek <= 3) { // Sunday = 0, Wednesday = 3 (only 4 days per week)
        const mealKey = dayKeys[mealIndex];
        const customDate = customMealDates[mealKey];
        const finalDate = customDate ? new Date(customDate) : currentDate;
        
        // تسجيل استخدام التاريخ المخصص
        if (customDate) {
          console.log('📅 استخدام التاريخ المخصص:', { 
            mealKey, 
            customDate, 
            originalDate: currentDate.toISOString().split('T')[0],
            finalDate: finalDate.toISOString().split('T')[0]
          });
        }
        
        days.push({
          key: dayKeys[mealIndex],
          label: mealLabels[mealIndex],
          icon: mealIcons[mealIndex],
          date: finalDate.toISOString().split('T')[0],
          displayDate: finalDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
          }),
          weekNumber: Math.floor(mealIndex / 4) + 1,
          dayOfWeek: dayOfWeek,
          hasCustomDate: !!customDate
        });
        mealIndex++;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('📅 النتيجة النهائية لأيام الوجبات:', days.map(day => ({
      label: day.label,
      date: day.date,
      displayDate: day.displayDate,
      hasCustomDate: day.hasCustomDate
    })));
    
    return days;
  };

  // Check if a date is a valid weekday (Sunday to Wednesday) and not today
  const isValidWeekday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const dayOfWeek = date.getDay();
    
    // Check if it's today (compare dates without time)
    const todayString = today.toISOString().split('T')[0];
    const dateStringOnly = dateString;
    const isToday = dateStringOnly === todayString;
    
    console.log('Checking date:', dateString, 'Today:', todayString, 'Day of week:', dayOfWeek, 'Is today:', isToday);
    
    // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3
    // Thursday = 4, Friday = 5, Saturday = 6
    const isValidDay = dayOfWeek >= 0 && dayOfWeek <= 3;
    
    return isValidDay && !isToday;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 'clamp(0.5rem, 3vw, 1rem)',
        padding: '1rem'
      }}>
        <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}></div>
        <div style={{ 
          fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
          color: '#2f6e73', 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {t('loadingRestaurantData')}
        </div>
        <div style={{ 
          fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', 
          color: 'rgb(107 114 128)',
          textAlign: 'center'
        }}>
          {t('pleaseWait')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 'clamp(0.5rem, 3vw, 1rem)',
        padding: '1rem'
      }}>
        <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}></div>
        <div style={{ 
          fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
          color: 'rgb(239 68 68)', 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {error}
        </div>
        <div style={{ 
          fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', 
          color: 'rgb(107 114 128)',
          textAlign: 'center',
          maxWidth: '400px',
          padding: '0 1rem'
        }}>
          {t('errorMessage')}
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: 'clamp(0.5rem, 3vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
            color: 'white',
            border: 'none',
            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(47, 110, 115, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(47, 110, 115, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(47, 110, 115, 0.3)';
          }}
        >
          🔄 {t('retry')}
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}></div>
        <div style={{ 
          fontSize: '1.25rem', 
          color: 'rgb(75 85 99)', 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {t('restaurantNotFound')}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: 'rgb(107 114 128)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {t('restaurantNotFoundMessage')}
        </div>
        <button 
          onClick={() => navigate('/restaurants')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
            color: 'white',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(47, 110, 115, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(47, 110, 115, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(47, 110, 115, 0.3)';
          }}
        >
          🏪 {t('backToRestaurants')}
        </button>
      </div>
    );
  }

  return (
    <div className="restaurant-detail-container" style={{ 
      minHeight: '100vh', 
      direction: dir,
      overflowX: 'hidden',
      position: 'relative',
      background: 'transparent'
    }}>
      {/* Restaurant Info */}
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: 'clamp(0.5rem, 3vw, 1rem)', 
        position: 'relative', 
        zIndex: 1,
        '@media (max-width: 768px)': {
          padding: '0.5rem'
        }
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'clamp(0.75rem, 3vw, 1.25rem)',
          padding: 'clamp(0.75rem, 2vw, 1rem)',
          marginBottom: 'clamp(0.75rem, 3vw, 1rem)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          '@media (max-width: 768px)': {
            padding: '0.75rem',
            marginBottom: '0.75rem',
            borderRadius: '0.75rem'
          }
        }}>

          {/* Enhanced Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)
            `,
            zIndex: 0
          }}></div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'clamp(0.75rem, 2vw, 1rem)', 
            marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)',
            position: 'relative',
            zIndex: 1
          }}>
            
            {/* Enhanced Restaurant Logo Section */}
            <div style={{
              width: '100%',
              maxWidth: 'clamp(8rem, 20vw, 12rem)',
              height: 'clamp(4rem, 10vw, 6rem)',
              borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.15)',
              border: '2px solid rgba(79, 70, 229, 0.08)',
              transition: 'all 0.3s ease',
              position: 'relative',
              background: 'transparent'
            }}
                          onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.01)';
                e.target.style.boxShadow = '0 12px 25px rgba(79, 70, 229, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.15)';
              }}>
              {restaurant.logo ? (
                <>
                  <img 
                    src={`/storage/${restaurant.logo}`}
                    alt={language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease',
                      backgroundColor: 'transparent',
                      padding: '0.5rem'
                    }}
                    onLoad={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--gradient-primary)',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                    color: 'white'
                  }}>
                  </div>
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  color: 'white'
                }}>
                </div>
              )}
            </div>

            {/* Enhanced Restaurant Info Section */}
            <div style={{ 
              width: '100%',
              maxWidth: 'clamp(12rem, 25vw, 16rem)'
            }}>
              <h1 style={{ 
                fontSize: 'clamp(0.875rem, 3vw, 1.25rem)', 
                fontWeight: 'bold', 
                marginBottom: 'clamp(0.25rem, 1vw, 0.375rem)',
                color: 'var(--color-primary)',
                textShadow: '0 1px 2px rgba(74, 117, 124, 0.1)'
              }}>
                {restaurant.name || (language === 'ar' ? restaurant.name_ar : restaurant.name_en)}
              </h1>
              
              <p style={{ 
                fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', 
                color: 'rgb(75 85 99)', 
                marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                lineHeight: '1.4',
                padding: '0 clamp(0.25rem, 1.5vw, 0.5rem)'
              }}>
                {restaurant.description || (language === 'ar' ? restaurant.description_ar : restaurant.description_en)}
              </p>
              
              {/* Enhanced Contact Info - Phone Only */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 'clamp(0.5rem, 1.5vw, 0.75rem)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 1rem)', 
                  color: 'rgb(75 85 99)',
                  padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  textAlign: 'center',
                  direction: 'ltr',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}>
                  📞 {restaurant.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Type Selection */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'clamp(0.75rem, 3vw, 1.5rem)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          '@media (max-width: 768px)': {
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '1rem'
          }
        }}>
          <h2 style={{ 
            fontSize: 'clamp(1.25rem, 4vw, 2rem)', 
            fontWeight: 'bold', 
            marginBottom: 'clamp(0.75rem, 3vw, 1rem)',
            color: 'var(--color-primary)',
            textAlign: 'center'
          }}>
            {t('selectSubscriptionType')}
          </h2>
          
          
          <p style={{ 
            fontSize: 'clamp(0.75rem, 3vw, 1rem)', 
            color: 'rgb(75 85 99)', 
            textAlign: 'center',
            marginBottom: 'clamp(2rem, 5vw, 2.5rem)',
            lineHeight: '1.6',
            padding: '0 clamp(0.5rem, 4vw, 2rem)'
          }}>
            {t('selectSubscriptionTypeMessage', { restaurantName: restaurant.name || (language === 'ar' ? restaurant.name_ar : restaurant.name_en) })}
          </p>
          
          <div className="subscription-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 90vw, 280px), 1fr))', 
            gap: 'clamp(1rem, 3vw, 1.25rem)',
            padding: '0 clamp(0.25rem, 2vw, 0.5rem)',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '1rem',
              padding: '0'
            }
          }}>
            {subscriptionTypes.map((subscriptionType) => {
              const subscription = {
                type: subscriptionType.type,
                title: language === 'ar' ? subscriptionType.name_ar : subscriptionType.name_en,
                subtitle: language === 'ar' 
                  ? `${subscriptionType.meals_count} وجبة في ${subscriptionType.type === 'weekly' ? 'الأسبوع' : 'الشهر'}`
                  : `${subscriptionType.meals_count} meals per ${subscriptionType.type === 'weekly' ? 'week' : 'month'}`,
                price: subscriptionType.price.toString(),
                currency: language === 'ar' ? 'ريال' : 'OMR',
                period: language === 'ar' 
                  ? (subscriptionType.type === 'weekly' ? 'أسبوعياً' : 'شهرياً')
                  : (subscriptionType.type === 'weekly' ? 'Weekly' : 'Monthly'),
                icon: '',

                gradient: subscriptionType.type === 'weekly' 
                  ? 'var(--gradient-primary)' 
                  : 'var(--gradient-accent)',
                bgGradient: subscriptionType.type === 'weekly' 
                  ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' 
                  : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                borderColor: subscriptionType.type === 'weekly' ? 'var(--color-primary)' : 'var(--color-accent)',
                deliveryPrice: subscriptionType.delivery_price || 0
              };
              
              return (
              <div 
                key={subscriptionType.id}
                className="subscription-card"
                onClick={() => handleSubscriptionTypeSelect(subscriptionType)}
                style={{
                  background: 'transparent',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: selectedSubscriptionType?.id === subscriptionType.id 
                    ? `0 8px 20px ${subscription.borderColor}20` 
                    : '0 2px 8px rgba(0, 0, 0, 0.06)',
                  border: selectedSubscriptionType?.id === subscriptionType.id 
                    ? `2px solid ${subscription.borderColor}` 
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  '@media (max-width: 768px)': {
                    minHeight: '240px',
                    padding: '1rem'
                  }
                }}
              >
                                 {/* Popular Badge for Monthly */}
                 {subscription.type === 'monthly' && (
                   <div className="popular-badge" style={{
                     position: 'absolute',
                     top: '-1px',
                     left: '-1px',
                     background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                     color: 'white',
                     padding: '0.5rem 1rem',
                     borderRadius: '1.5rem 0 1.5rem 0',
                     fontSize: '0.75rem',
                     fontWeight: '700',
                     zIndex: 2,
                     boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                   }}>
                     {t('mostPopular')}
                   </div>
                 )}

                {/* Selection Indicator */}
                {selectedSubscriptionType?.id === subscriptionType.id && (
                  <div className="selection-indicator" style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: subscription.borderColor,
                    color: 'white',
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}>
                    ✓
                  </div>
                )}

                {/* Click to Select Indicator */}
                {selectedSubscriptionType?.id !== subscriptionType.id && (
                  <div className="selection-indicator" style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'transparent',
                    color: subscription.borderColor,
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    zIndex: 2,
                    border: `1px solid ${subscription.borderColor}`
                  }}>
                  </div>
                )}

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div className="subscription-icon" style={{ 
                    fontSize: '2rem', 
                    marginBottom: '1rem'
                  }}>
                    {subscription.icon}
                  </div>
                  
                  <h3 className="subscription-title" style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    marginBottom: '0.25rem',
                    color: '#1f2937'
                  }}>
                    {subscription.title}
                  </h3>
                  
                  <p className="subscription-subtitle" style={{ 
                    fontSize: '0.9rem', 
                    color: '#6b7280', 
                    marginBottom: '0',
                    lineHeight: '1.4',
                    fontWeight: '500'
                  }}>
                    {subscription.subtitle}
                  </p>
                </div>

                {/* Price Section */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span className="subscription-price" style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: '700', 
                      color: subscription.borderColor
                    }}>
                      {subscription.price}
                    </span>
                    <span className="subscription-currency" style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: '#64748b'
                    }}>
                      {subscription.currency}
                    </span>
                  </div>
                  <div className="subscription-period" style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    {subscription.period}
                  </div>
                  {/* Delivery Price Info */}
                  <div className="delivery-info" style={{ 
                    fontSize: '0.8rem', 
                    color: subscription.deliveryPrice > 0 ? '#f59e0b' : '#10b981',
                    fontWeight: '600'
                  }}>
                    {subscription.deliveryPrice > 0 
                      ? `${language === 'ar' ? 'توصيل' : 'Delivery'}: ${subscription.deliveryPrice} ${subscription.currency}`
                      : `${language === 'ar' ? 'توصيل مجاني' : 'Free Delivery'}`
                    }
                  </div>
                </div>

                {/* Selection Action Text */}
                <div style={{
                  textAlign: 'center',
                  marginTop: 'auto',
                  paddingTop: '0.5rem'
                }}>
                  {selectedSubscriptionType?.id === subscriptionType.id ? (
                    <div className="selection-button" style={{
                      background: subscription.borderColor,
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '2rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: 'none'
                    }}>
                      <span>✓</span>
                      {language === 'ar' ? 'تم الاختيار' : 'Selected'}
                    </div>
                  ) : (
                    <div className="selection-button" style={{
                      background: 'transparent',
                      color: subscription.borderColor,
                      padding: '0.75rem 1.5rem',
                      borderRadius: '2rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: `1px solid ${subscription.borderColor}`
                    }}>
                      <span></span>
                      {language === 'ar' ? 'اضغط للاختيار' : 'Click to Select'}
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>

        

        {/* Meals Section - Only show if subscription type is selected */}
        {selectedSubscriptionType && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'clamp(0.75rem, 3vw, 1.5rem)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            animation: 'slideIn 0.5s ease-out',
            position: 'relative',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
              padding: '1rem',
              borderRadius: '1rem'
            }
          }}>

            <h2 style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#2f6e73',
              textAlign: 'center'
            }}>
              {t('selectMealForEachDay')}
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
              color: 'rgb(75 85 99)', 
              textAlign: 'center',
              marginBottom: '1rem',
              lineHeight: '1.6',
              padding: '0 clamp(0.5rem, 4vw, 2rem)'
            }}>
              {selectedSubscriptionType?.type === 'weekly' 
                ? t('selectMealForEachDayWithCount', { 
                    count: selectedSubscriptionType?.meals_count || 0,
                    type: t('week')
                  })
                : t('selectMealForEachDayWithCount', { 
                    count: selectedSubscriptionType?.meals_count || 0,
                    type: t('month')
                  }) + ` (${Math.ceil((selectedSubscriptionType?.meals_count || 0) / 4)} ${t('weeks')})`
              }
            </p>
            


            {/* Start Date Selection - Only show if subscription type is selected */}
            {selectedSubscriptionType && (
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                maxWidth: '500px',
                margin: '0 auto 2rem auto',
                position: 'relative',
                zIndex: 5,
                '@media (max-width: 768px)': {
                  padding: '1rem',
                  marginBottom: '1rem'
                }
              }}>
                {/* Header */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3rem',
                    height: '3rem',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.25rem', color: 'white' }}></span>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    {t('startSubscriptionDate')}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    lineHeight: '1.5'
                  }}>
                    {t('selectStartDateMessage')}
                  </p>
                </div>

                {/* Date Input */}
                <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      console.log('Date selected:', selectedDate);
                      
                      if (!selectedDate) {
                        setStartDate('');
                        setSelectedMeals({});
                        setErrors(prev => ({ ...prev, startDate: '' }));
                        return;
                      }
                      
                      if (isValidWeekday(selectedDate)) {
                        setStartDate(selectedDate);
                        setSelectedMeals({});
                        setErrors(prev => ({ ...prev, startDate: '' }));
                      } else {
                        // Check if it's today or weekend
                        const date = new Date(selectedDate);
                        const today = new Date();
                        const todayString = today.toISOString().split('T')[0];
                        const isToday = selectedDate === todayString;
                        const isWeekend = date.getDay() === 5 || date.getDay() === 6;
                        
                        console.log('Validation - Selected:', selectedDate, 'Today:', todayString, 'Is today:', isToday, 'Is weekend:', isWeekend);
                        
                        if (isToday) {
                          setErrors(prev => ({ ...prev, startDate: language === 'ar' ? 'لا يمكن اختيار تاريخ اليوم - يجب اختيار تاريخ من الغد فما بعد' : 'Cannot select today\'s date - Please select a date from tomorrow onwards' }));
                        } else if (isWeekend) {
                          setErrors(prev => ({ ...prev, startDate: t('selectWeekdayOnly') }));
                        } else {
                          setErrors(prev => ({ ...prev, startDate: t('selectWeekdayOnly') }));
                        }
                        // Don't reset the input value, let user see their selection
                      }
                    }} 
                    min={getNextValidDate()} 
                    className="date-input"
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      fontSize: '1rem',
                      background: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 10,
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      color: '#374151',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      display: 'block',
                      opacity: 1,
                      visibility: 'visible',
                      pointerEvents: 'auto',
                      touchAction: 'manipulation',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitTouchCallout: 'none',
                      WebkitOverflowScrolling: 'touch',
                      '@media (max-width: 768px)': {
                        padding: '1rem',
                        fontSize: '1rem',
                        minHeight: '48px'
                      }
                    }} 
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    onClick={(e) => {
                      console.log('Date input clicked');
                    }}

                    required 
                  />
                </div>

                {/* Success Message */}
                {startDate && isValidWeekday(startDate) && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0',
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#166534',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>✓</span>
                      {t('dateSelected')}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#15803d',
                      fontWeight: '600',
                      marginTop: '0.25rem'
                    }}>
                      {new Date(startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errors.startDate && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      <span>⚠️</span>
                      {errors.startDate}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      marginTop: '0.25rem',
                      marginBottom: 0
                    }}>
                      {language === 'ar' 
                        ? 'يرجى اختيار يوم من الأحد إلى الأربعاء فقط'
                        : 'Please select a day from Sunday to Wednesday only'
                      }
                    </p>
                  </div>
                )}

                {/* Info Message */}
                <div style={{
                  padding: '0.75rem',
                  background: '#eff6ff',
                  borderRadius: '0.5rem',
                  border: '1px solid #bfdbfe',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#1d4ed8',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    ⚠️ {language === 'ar' 
                      ? 'يمكنك اختيار أيام العمل فقط (الأحد - الأربعاء)'
                      : 'You can only select working days (Sunday - Wednesday)'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Meal Type Filter - Only show if subscription type is selected */}
            {selectedSubscriptionType && meals.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                position: 'relative',
                zIndex: 5,
                '@media (max-width: 768px)': {
                  padding: '1rem',
                  marginBottom: '1rem'
                }
              }}>
                {/* Header */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3rem',
                    height: '3rem',
                    background: '#2f6e73',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.25rem', color: 'white' }}></span>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    {t('mealTypeFilter')}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    lineHeight: '1.5'
                  }}>
                    {language === 'ar' 
                      ? 'اختر نوع الوجبة لعرض الوجبات المتاحة' 
                      : 'Choose meal type to show available meals'
                    }
                  </p>
                </div>

                {/* Meal Type Buttons */}
                <div className="meal-filter-buttons" style={{ 
                  display: 'flex', 
                  flexDirection: 'row',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  position: 'relative',
                  zIndex: 10,
                  '@media (max-width: 768px)': {
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }
                }}>
                  {availableMealTypes.length > 0 ? availableMealTypes.map(mealType => {
                    const isSelected = mealTypeFilter === mealType;
                    const mealTypeIcon = {
                      'breakfast': '',
                      'lunch': '',
                      'dinner': ''
                    }[mealType] || '';
                    
                    return (
                      <button
                        key={mealType}
                        onClick={(e) => {
                          console.log('Button clicked:', mealType);
                          handleMealTypeFilter(mealType);
                        }}
                        className="meal-filter-button meal-type-button"
                        style={{
                          background: isSelected ? '#2f6e73' : 'white',
                          color: isSelected ? 'white' : '#374151',
                          border: isSelected ? '2px solid #2f6e73' : '2px solid #d1d5db',
                          borderRadius: '0.75rem',
                          padding: '1rem 1.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          justifyContent: 'center',
                          flex: '1',
                          minWidth: '120px',
                          position: 'relative',
                          zIndex: 10,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none',
                          '@media (max-width: 768px)': {
                            minWidth: 'auto',
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            minHeight: '48px'
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{mealTypeIcon}</span>
                        <span>{mealTypeNames[language][mealType] || mealType}</span>
                        {isSelected && <span style={{ fontSize: '0.875rem' }}>✓</span>}
                      </button>
                    );
                  }) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '1rem',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {language === 'ar' 
                        ? 'لا توجد أنواع وجبات متاحة' 
                        : 'No meal types available'
                      }
                    </div>
                  )}
                </div>

                {/* Selection Status */}
                {mealTypeFilter && (
                  <div className="status-message" style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#166534',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>✓</span>
                      {language === 'ar' 
                        ? `تم اختيار ${mealTypeNames[language][mealTypeFilter]}`
                        : `${mealTypeNames[language][mealTypeFilter]} selected`
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Meals Available Message */}
            {selectedSubscriptionType && meals.length === 0 && (
              <div className="status-message" style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem'
                }}>
                  {language === 'ar' 
                    ? 'لا توجد وجبات متاحة في هذا المطعم' 
                    : 'No meals available in this restaurant'
                  }
                </p>
              </div>
            )}
            
            {/* Status Messages */}
            {selectedSubscriptionType && meals.length > 0 && !mealTypeFilter && (
              <div className="status-message" style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem'
                }}>
                  {language === 'ar' 
                    ? 'يرجى اختيار نوع الوجبة لعرض الوجبات المتاحة' 
                    : 'Please select a meal type to show available meals'
                  }
                </p>
              </div>
            )}

            {selectedSubscriptionType && meals.length > 0 && mealTypeFilter && !startDate && (
              <div className="status-message" style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem'
                }}>
                  {language === 'ar' 
                    ? 'يرجى اختيار تاريخ بدء الاشتراك أولاً' 
                    : 'Please select a subscription start date first'
                  }
                </p>
              </div>
            )}

            {selectedSubscriptionType && meals.length > 0 && mealTypeFilter && startDate && filteredMeals.length === 0 && (
              <div className="status-message" style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '0.5rem'
                }}>
                  {language === 'ar' 
                    ? `لا توجد وجبات ${mealTypeNames[language][mealTypeFilter]} متاحة` 
                    : `No ${mealTypeNames[language][mealTypeFilter]} meals available`
                  }
                </p>
              </div>
            )}

            {/* Meals Selection Section */}
            {selectedSubscriptionType && meals.length > 0 && mealTypeFilter && startDate && filteredMeals.length > 0 && (
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '2rem'
                }}
              >
                {/* Meals Selection Counter */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  border: '1px solid #2f6e73',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    color: '#2f6e73',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    📊 {t('mealsSelectionProgress')}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#1f5a5f'
                  }}>
                    {Object.keys(selectedMeals).length} / {selectedSubscriptionType?.meals_count || 0} {t('mealsSelected')}
                  </div>
                </div>
                {getWeekDaysFromStartDate().map((day, dayIndex) => (
                  <div 
                    key={day.key} 
                    data-meal-day={day.key}
                    style={{
                      background: 'rgba(249, 250, 251, 0.8)',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      border: '1px solid rgba(229, 231, 235, 0.5)',
                      '@media (max-width: 768px)': {
                        padding: '1rem',
                        borderRadius: '0.75rem'
                      }
                    }}
                  >
                    {/* Day Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      padding: '0.5rem',
                      background: selectedSubscriptionType?.type === 'monthly' && day.weekNumber 
                        ? `linear-gradient(135deg, ${day.weekNumber === 1 ? 'rgba(47, 110, 115, 0.1)' : day.weekNumber === 2 ? 'rgba(74, 138, 143, 0.1)' : day.weekNumber === 3 ? 'rgba(182, 84, 73, 0.1)' : 'rgba(200, 106, 90, 0.1)'}, ${day.weekNumber === 1 ? 'rgba(47, 110, 115, 0.05)' : day.weekNumber === 2 ? 'rgba(74, 138, 143, 0.05)' : day.weekNumber === 3 ? 'rgba(182, 84, 73, 0.05)' : 'rgba(200, 106, 90, 0.05)'})`
                        : 'transparent',
                      borderRadius: '0.75rem',
                      border: selectedSubscriptionType?.type === 'monthly' && day.weekNumber
                        ? `1px solid ${day.weekNumber === 1 ? 'rgba(47, 110, 115, 0.3)' : day.weekNumber === 2 ? 'rgba(74, 138, 143, 0.3)' : day.weekNumber === 3 ? 'rgba(182, 84, 73, 0.3)' : 'rgba(200, 106, 90, 0.3)'}`
                        : '1px solid rgba(229, 231, 235, 0.3)',
                      '@media (max-width: 768px)': {
                        flexDirection: 'column',
                        gap: '0.375rem',
                        marginBottom: '0.75rem',
                        padding: '0.75rem',
                        textAlign: 'center'
                      }
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600', 
                          color: '#2f6e73',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {day.label}
                        </h3>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'rgb(107 114 128)',
                          fontWeight: '500',
                          marginBottom: '0.5rem'
                        }}>
                          {day.displayDate}
                        </div>
                        {selectedSubscriptionType?.type === 'monthly' && day.weekNumber && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: day.weekNumber === 1 ? '#2f6e73' : day.weekNumber === 2 ? '#4a8a8f' : day.weekNumber === 3 ? '#b65449' : '#c86a5a',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                          }}>
                            {language === 'ar' ? `الأسبوع ${day.weekNumber}` : `Week ${day.weekNumber}`}
                          </div>
                        )}
                      </div>
                      
                      {/* الأزرار - تخطيط محسن للهاتف */}
                      <div className="day-buttons-container" style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        '@media (max-width: 768px)': {
                          flexDirection: 'column',
                          gap: '0.75rem',
                          alignItems: 'stretch'
                        }
                      }}>
                        <button
                          onClick={() => openDateEditor(day.key)}
                          className="edit-button-mobile"
                          style={{
                            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                            boxShadow: '0 3px 10px rgba(47, 110, 115, 0.3)',
                            minWidth: '80px',
                            height: '36px',
                            whiteSpace: 'nowrap',
                            '@media (max-width: 768px)': {
                              width: '100%',
                              minHeight: '48px',
                              padding: '0.75rem 1rem',
                              fontSize: '0.9rem'
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(47, 110, 115, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 3px 10px rgba(47, 110, 115, 0.3)';
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                          </svg>
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        
                        {getSelectedMealForDay(day.key) && (
                          <div className="selected-badge-mobile" style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                            color: 'white',
                            borderRadius: '0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '80px',
                            height: '36px',
                            boxShadow: '0 3px 10px rgba(47, 110, 115, 0.3)',
                            whiteSpace: 'nowrap',
                            '@media (max-width: 768px)': {
                              width: '100%',
                              minHeight: '48px',
                              padding: '0.75rem 1rem',
                              fontSize: '0.9rem'
                            }
                          }}>
                            {t('selected')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meals Grid */}
                    <div className="meals-container" style={{
                      position: 'relative'
                    }}>

                      <div className="meals-grid"
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 90vw, 280px), 1fr))', 
                        gap: 'clamp(0.75rem, 3vw, 1rem)'
                      }}>
                      {filteredMeals.map((meal) => {
                        const isSelected = getSelectedMealForDay(day.key)?.id === meal.id;
                        return (
                          <div key={meal.id} className="meal-card" style={{
                            background: isSelected 
                              ? 'rgba(240, 253, 244, 0.95)' 
                              : 'rgba(255, 255, 255, 0.95)',
                            borderRadius: 'clamp(0.75rem, 3vw, 1.25rem)',
                            padding: 0,
                            boxShadow: isSelected 
                              ? '0 15px 35px rgba(47, 110, 115, 0.2)' 
                              : '0 8px 25px rgba(0, 0, 0, 0.12)',
                            border: isSelected 
                              ? '3px solid #2f6e73' 
                              : '2px solid rgba(47, 110, 115, 0.2)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            height: 'clamp(280px, 40vw, 320px)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                            onClick={(e) => handleMealSelection(day.key, meal, e)}
                            onTouchStart={(e) => {
                              // Prevent default touch behavior
                              e.preventDefault();
                            }}
                            onTouchEnd={(e) => {
                              // Handle touch end
                              e.preventDefault();
                              handleMealSelection(day.key, meal, e);
                            }}
>
                            
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                background: '#2f6e73',
                                color: 'white',
                                borderRadius: '50%',
                                width: '2rem',
                                height: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(47, 110, 115, 0.3)',
                                animation: 'pulse 2s infinite',
                                zIndex: 10
                              }}>
                                ✓
                              </div>
                            )}

                            {!isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                background: 'rgba(47, 110, 115, 0.1)',
                                color: '#2f6e73',
                                borderRadius: '50%',
                                width: '2rem',
                                height: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                border: '2px solid rgba(47, 110, 115, 0.3)',
                                animation: 'bounce 2s infinite',
                                zIndex: 10
                              }}>
                              </div>
                            )}
                            
                            {/* Meal Image - Full Width */}
                            <div style={{
                              width: '100%',
                              height: '70%',
                              position: 'relative',
                              overflow: 'hidden',
                              borderRadius: 'clamp(0.75rem, 3vw, 1.25rem) clamp(0.75rem, 3vw, 1.25rem) 0 0'
                            }}>
                              {meal.image ? (
                                <>
                                  <img 
                                    src={`/storage/${meal.image}`}
                                    alt={language === 'ar' ? meal.name_ar : meal.name_en}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      transition: 'transform 0.4s ease'
                                    }}
                                    onLoad={(e) => {
                                      e.target.style.transform = 'scale(1)';
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'var(--gradient-primary-reverse)',
                                    display: 'none',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 'clamp(2rem, 6vw, 3rem)',
                                    color: 'white'
                                  }}>
                                  </div>
                                </>
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  background: 'var(--gradient-primary-reverse)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 'clamp(2rem, 6vw, 3rem)',
                                  color: 'white'
                                }}>
                                </div>
                              )}
                            </div>

                            {/* Meal Info Section */}
                            <div style={{
                              flex: 1,
                              padding: 'clamp(0.75rem, 2vw, 1rem)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '0 0 clamp(0.75rem, 3vw, 1.25rem) clamp(0.75rem, 3vw, 1.25rem)'
                            }}>
                              <div>
                                <h4 className="meal-title" style={{ 
                                  fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
                                  fontWeight: '600', 
                                  marginBottom: 'clamp(0.25rem, 1vw, 0.375rem)',
                                  color: 'var(--color-primary)',
                                  textAlign: 'center',
                                  lineHeight: '1.3'
                                }}>
                                  {language === 'ar' ? meal.name_ar : meal.name_en}
                                </h4>
                                
                                <p className="meal-description" style={{ 
                                  fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', 
                                  color: 'rgb(75 85 99)', 
                                  marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
                                  lineHeight: '1.4',
                                  textAlign: 'center',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {language === 'ar' ? meal.description_ar : meal.description_en || t('noDescriptionAvailable')}
                                </p>
                              </div>
                              
                              <button 
                                style={{
                                  width: '100%',
                                  padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                                  borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                                  background: isSelected 
                                    ? 'var(--gradient-primary)' 
                                    : 'var(--gradient-primary)',
                                  color: 'white',
                                  border: 'none',
                                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                  marginTop: 'auto'
                                }}
                              >
                                {isSelected ? t('selected') : t('selectThisMeal')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message for Meals */}
            {errors.meals && (
              <div 
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  border: '1px solid #fecaca',
                  borderRadius: '1rem',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'slideInUp 0.4s ease-out',
                  transform: 'translateY(0)',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: 'white',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    boxShadow: '0 3px 8px rgba(220, 38, 38, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}>
                    ⚠️
                  </div>
                  <span style={{ lineHeight: '1.5', textAlign: 'center' }}>{errors.meals}</span>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div 
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  border: '1px solid #fecaca',
                  borderRadius: '1rem',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'slideInUp 0.4s ease-out',
                  transform: 'translateY(0)',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: 'white',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    boxShadow: '0 3px 8px rgba(220, 38, 38, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}>
                    ⚠️
                  </div>
                  <span 
                    style={{ lineHeight: '1.5', textAlign: 'center' }}
                    dangerouslySetInnerHTML={{ __html: errors.general }}
                  />
                </div>
              </div>
            )}

            {/* Continue Button */}
            {startDate && Object.keys(selectedMeals).length > 0 && Object.keys(selectedMeals).length === (selectedSubscriptionType?.meals_count || 0) ? (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'rgb(75 85 99)'
                }}>
                  <span>✓</span>
                  <span>{t('selectedMealsCount', { count: Object.keys(selectedMeals).length })}</span>
                  <span>•</span>
                                          <span>{t('startDate')}: {new Date(startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                </div>
                <button 
                  onClick={handleContinueToSubscription}
                  style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                    color: 'white',
                    border: 'none',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 10px 25px rgba(47, 110, 115, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    🚀 {t('continueToSubscription')}
                  </span>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'left 0.5s ease',
                    zIndex: 1
                  }}></div>
                </button>
              </div>
            ) : startDate && Object.keys(selectedMeals).length > 0 && Object.keys(selectedMeals).length < (selectedSubscriptionType?.meals_count || 0) ? (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                padding: '2rem',
                background: 'rgba(254, 242, 242, 0.95)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(254, 202, 202, 0.5)',
                boxShadow: '0 10px 30px rgba(220, 38, 38, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: '#dc2626'
                }}>
                  ⚠️
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#dc2626',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {t('selectRequiredMealsCount', { count: selectedSubscriptionType?.meals_count || 0 })}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#991b1b'
                }}>
                  {t('selectedMealsCount', { count: Object.keys(selectedMeals).length })} / {selectedSubscriptionType?.meals_count || 0}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Login Required Popup */}
      {showLoginPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowLoginPopup(false);
          }
        }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'clamp(0.75rem, 3vw, 1.5rem)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            maxWidth: 'min(450px, 95vw)',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            animation: 'slideIn 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
              borderRadius: '50%',
              filter: 'blur(30px)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08))',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Icon */}
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                🔐
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2f6e73',
                marginBottom: '1rem'
              }}>
                {t('loginRequired')}
              </h3>

              {/* Message */}
              <p style={{
                fontSize: '1rem',
                color: 'rgb(75 85 99)',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}>
                {t('loginRequiredMessage')}
              </p>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                gap: 'clamp(0.5rem, 3vw, 1rem)',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setShowLoginPopup(false)}
                  style={{
                    padding: 'clamp(0.5rem, 3vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                    borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: 'rgb(75 85 99)',
                    border: '2px solid rgba(229, 231, 235, 0.5)',
                    fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: 'clamp(100px, 25vw, 120px)'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    setShowLoginPopup(false);
                    navigate('/login');
                  }}
                  style={{
                    padding: 'clamp(0.5rem, 3vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                    borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
                    background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                    color: 'white',
                    border: 'none',
                    fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(47, 110, 115, 0.3)',
                    minWidth: 'clamp(100px, 25vw, 120px)'
                  }}
                >
                  {t('login')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && editingMealDate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%',
            animation: 'slideInUp 0.3s ease-out'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#2f6e73',
              margin: '0 0 1rem 0',
              textAlign: 'center'
            }}>
              {language === 'ar' ? 'اختر تاريخ جديد للوجبة' : 'Choose New Date for Meal'}
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                {language === 'ar' ? 'التاريخ الجديد:' : 'New Date:'}
              </label>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '0.75rem',
                padding: '0.5rem',
                background: '#f3f4f6',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb'
              }}>
                {language === 'ar' 
                  ? '⚠️ يمكن اختيار أيام الأحد إلى الأربعاء فقط (لا يمكن اختيار الخميس، الجمعة، السبت أو تاريخ اليوم)'
                  : '⚠️ You can only select days from Sunday to Wednesday (Cannot select Thursday, Friday, Saturday or today\'s date)'
                }
              </div>
              <input
                type="date"
                value={customMealDates[editingMealDate] || ''}
                min={getNextValidDate()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: dateError ? '2px solid #dc2626' : '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  background: '#f9fafb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = dateError ? '#dc2626' : '#2f6e73';
                  e.target.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = dateError ? '#dc2626' : '#e5e7eb';
                  e.target.style.background = '#f9fafb';
                }}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (selectedDate) {
                    updateMealDate(editingMealDate, selectedDate);
                  }
                }}
              />
              
              {/* رسالة الخطأ */}
              {dateError && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.375rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {dateError}
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={closeDateEditor}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6';
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              
              {customMealDates[editingMealDate] && (
                <button
                  onClick={() => {
                    setCustomMealDates(prev => {
                      const newDates = { ...prev };
                      delete newDates[editingMealDate];
                      return newDates;
                    });
                    setEditingMealDate(null);
                    setShowDatePicker(false);
                  }}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#dc2626';
                  }}
                >
                  {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetail;

