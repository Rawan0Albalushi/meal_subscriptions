import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, subscriptionTypesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

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

  const weekDays = [
    { key: 'sunday', label: language === 'ar' ? 'الأحد' : 'Sunday', icon: '🌅' },
    { key: 'monday', label: language === 'ar' ? 'الاثنين' : 'Monday', icon: '🌞' },
    { key: 'tuesday', label: language === 'ar' ? 'الثلاثاء' : 'Tuesday', icon: '☀️' },
    { key: 'wednesday', label: language === 'ar' ? 'الأربعاء' : 'Wednesday', icon: '🌤️' },
    { key: 'thursday', label: language === 'ar' ? 'الخميس' : 'Thursday', icon: '🌅' }
  ];

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

        // Fetch restaurant meals
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

  // Reset selected meals when restaurant changes
  useEffect(() => {
    setSelectedMeals({});
  }, [id]);

  const handleSubscriptionTypeSelect = (subscriptionType) => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    
    setSelectedSubscriptionType(subscriptionType);
    setSelectedMeals({}); // Reset selected meals when changing subscription type
    setStartDate(''); // Reset start date when changing subscription type
    setMealTypeFilter(''); // Reset meal type filter when changing subscription type
  };

  // دوال فلتر أنواع الوجبات
  const handleMealTypeFilter = (mealType) => {
    console.log('Meal type selected:', mealType);
    console.log('Current mealTypeFilter:', mealTypeFilter);
    
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
  };

  const clearMealTypeFilter = () => {
    setMealTypeFilter('');
    setShowMealTypeDropdown(false);
    // إعادة تعيين الوجبات المختارة فقط عند إلغاء الفلتر
    setSelectedMeals({});
  };

  const getSelectedMealTypeText = () => {
    if (!mealTypeFilter) return language === 'ar' ? 'اختر نوع الوجبة' : 'Select Meal Type';
    return mealTypeNames[language][mealTypeFilter] || mealTypeFilter;
  };

  // فلترة الوجبات حسب النوع المختار - لا تسمح بعرض جميع الوجبات
  const filteredMeals = meals.filter(meal => {
    if (!mealTypeFilter) return false; // لا تعرض أي وجبات إذا لم يتم اختيار نوع
    return meal.meal_type === mealTypeFilter;
  });

  // الحصول على أنواع الوجبات المتاحة
  const availableMealTypes = [...new Set(meals.map(meal => meal.meal_type))];
  console.log('Available meal types:', availableMealTypes);
  console.log('Meals data:', meals);

  // الاختيار التلقائي إذا كان هناك نوع واحد فقط
  useEffect(() => {
    if (availableMealTypes.length === 1 && !mealTypeFilter) {
      setMealTypeFilter(availableMealTypes[0]);
    }
  }, [availableMealTypes, mealTypeFilter]);

  // Reset selected meals when start date changes
  useEffect(() => {
    setSelectedMeals({});
  }, [startDate]);

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



  // Focus on first meal when date changes
  useEffect(() => {
    if (startDate && meals.length > 0) {
      // Wait for the meals to be rendered
      setTimeout(() => {
        // Find the first meal element and scroll to it smoothly
        const firstMealElement = document.querySelector('[data-meal-day="sunday"]');
        if (firstMealElement) {
          firstMealElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 150);
    }
  }, [startDate, meals]);



  const handleMealSelection = (dayKey, meal) => {
    const currentSelectedCount = Object.keys(selectedMeals).length;
    const maxAllowed = selectedSubscriptionType?.meals_count || 0;
    
    // If this day is already selected, allow deselection
    if (selectedMeals[dayKey]) {
      setSelectedMeals(prev => {
        const newSelected = { ...prev };
        delete newSelected[dayKey];
        return newSelected;
      });
    } else {
      // Check if we can add more meals
      if (currentSelectedCount >= maxAllowed) {
        // Show error message
        setErrors(prev => ({ 
          ...prev, 
          meals: t('maxMealsReached', { count: maxAllowed }) 
        }));
        return;
      }
      
      setSelectedMeals(prev => ({
        ...prev,
        [dayKey]: meal
      }));
    }
    
    // Clear meals error when user selects a meal
    if (errors.meals) {
      setErrors(prev => ({ ...prev, meals: '' }));
    }
  };

  const handleContinueToSubscription = () => {
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
    
    // Navigate to subscription form with selected meals, days, and start date
    const selectedMealsWithDays = Object.entries(selectedMeals).map(([dayKey, meal]) => ({
      dayKey,
      mealId: meal.id,
      // Store the base day name for backend validation
      baseDayKey: dayKey.split('_')[0]
    }));
    const mealsData = JSON.stringify(selectedMealsWithDays);
    const subscriptionUrl = `/subscribe/${id}/${selectedSubscriptionType.type}/${startDate}/${encodeURIComponent(mealsData)}`;
    navigate(subscriptionUrl);
  };

  const getSelectedMealForDay = (dayKey) => {
    return selectedMeals[dayKey] || null;
  };

  // Get next valid weekday (Sunday to Thursday)
  const getNextValidDate = () => {
    const today = new Date();
    let nextDate = new Date(today);
    
    // Find the next valid weekday (Sunday to Thursday)
    // Friday = 5, Saturday = 6
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
    setStartDate(date);
    setSelectedMeals({});
    setErrors(prev => ({ ...prev, startDate: '' })); // Clear error message
  };

  // Generate meal days based on selected start date and subscription type
  const getWeekDaysFromStartDate = () => {
    if (!startDate || !selectedSubscriptionType) return [];
    
    const start = new Date(startDate);
    const days = [];
    const requiredMeals = selectedSubscriptionType.meals_count || 4;
    
    // Generate labels and icons based on required meals
    const mealLabelsArray = language === 'ar' 
      ? ['الوجبة الأولى', 'الوجبة الثانية', 'الوجبة الثالثة', 'الوجبة الرابعة', 'الوجبة الخامسة', 'الوجبة السادسة', 'الوجبة السابعة', 'الوجبة الثامنة', 'الوجبة التاسعة', 'الوجبة العاشرة', 'الوجبة الحادية عشر', 'الوجبة الثانية عشر', 'الوجبة الثالثة عشر', 'الوجبة الرابعة عشر', 'الوجبة الخامسة عشر', 'الوجبة السادسة عشر']
      : ['Meal 1', 'Meal 2', 'Meal 3', 'Meal 4', 'Meal 5', 'Meal 6', 'Meal 7', 'Meal 8', 'Meal 9', 'Meal 10', 'Meal 11', 'Meal 12', 'Meal 13', 'Meal 14', 'Meal 15', 'Meal 16'];
    
    const dayIcons = ['🌅', '🌞', '☀️', '🌤️', '🍽️', '🥘', '🍲', '🥗', '🍜', '🍛', '🍱', '🥪', '🍕', '🍔', '🌮', '🥙'];
    
    const mealLabels = [];
    const mealIcons = [];
    const dayKeys = [];
    
    for (let i = 0; i < requiredMeals; i++) {
      const weekIndex = Math.floor(i / 4); // 4 days per week
      const dayIndex = i % 4; // 0-3 for each week
      
      mealLabels.push(mealLabelsArray[i]);
      mealIcons.push(dayIcons[i]);
      
      // For monthly subscriptions, we need to repeat the same days
      // So we'll use the same day key but with a unique identifier
      const dayLabels = language === 'ar' 
        ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday'];
      
      // Always use English day names for backend compatibility
      const englishDayLabels = ['sunday', 'monday', 'tuesday', 'wednesday'];
      const baseDayKey = englishDayLabels[dayIndex];
      const uniqueDayKey = selectedSubscriptionType.type === 'monthly' 
        ? `${baseDayKey}_week${weekIndex + 1}` 
        : baseDayKey;
      dayKeys.push(uniqueDayKey);
    }
    
    let currentDate = new Date(start);
    let mealIndex = 0;
    
    // Generate meal days based on subscription type
    while (mealIndex < requiredMeals) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 0 && dayOfWeek <= 3) { // Sunday = 0, Wednesday = 3 (only 4 days per week)
        days.push({
          key: dayKeys[mealIndex],
          label: mealLabels[mealIndex],
          icon: mealIcons[mealIndex],
          date: currentDate.toISOString().split('T')[0],
          displayDate: currentDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          weekNumber: Math.floor(mealIndex / 4) + 1,
          dayOfWeek: dayOfWeek
        });
        mealIndex++;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if a date is a valid weekday (Sunday to Thursday)
  const isValidWeekday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    console.log('Checking date:', dateString, 'Day of week:', dayOfWeek);
    // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4
    // Friday = 5, Saturday = 6
    return dayOfWeek >= 0 && dayOfWeek <= 4;
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
        <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>🍽️</div>
        <div style={{ 
          fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
          color: 'rgb(79 70 229)', 
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
        <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>❌</div>
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
            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
            color: 'white',
            border: 'none',
            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
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
        <div style={{ fontSize: '3rem' }}>🔍</div>
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
            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
            color: 'white',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
          }}
        >
          🏪 {t('backToRestaurants')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      direction: dir,
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Simple Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
      </div>
      {/* Restaurant Info */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'clamp(0.5rem, 3vw, 1rem)', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'clamp(0.75rem, 3vw, 1.25rem)',
          padding: 'clamp(1rem, 4vw, 1.5rem)',
          marginBottom: 'clamp(1rem, 4vw, 1.5rem)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Simple Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(168, 85, 247, 0.08))',
            borderRadius: '50%',
            filter: 'blur(30px)'
          }}></div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'clamp(1rem, 4vw, 1.5rem)', 
            marginBottom: 'clamp(1rem, 4vw, 1.5rem)' 
          }}>
            <div style={{ 
              fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
              borderRadius: '50%',
              width: 'clamp(2.5rem, 8vw, 4rem)',
              height: 'clamp(2.5rem, 8vw, 4rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
              color: 'white',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.25)'
            }}>
              {restaurant.logo || '🍽️'}
            </div>
            <div style={{ width: '100%' }}>
                              <h1 style={{ 
                  fontSize: 'clamp(1rem, 4vw, 1.75rem)', 
                  fontWeight: 'bold', 
                  marginBottom: 'clamp(0.25rem, 2vw, 0.5rem)',
                  color: 'rgb(79 70 229)'
                }}>
                {restaurant.name || (language === 'ar' ? restaurant.name_ar : restaurant.name_en)}
              </h1>
                              <p style={{ 
                  fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)', 
                  marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
                  lineHeight: '1.5',
                  padding: '0 clamp(0.5rem, 2vw, 1rem)'
                }}>
                {restaurant.description || (language === 'ar' ? restaurant.description_ar : restaurant.description_en)}
              </p>
                              <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 'clamp(0.25rem, 2vw, 0.5rem)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: 'clamp(0.5rem, 2.5vw, 0.75rem)', 
                    color: 'rgb(75 85 99)',
                    padding: 'clamp(0.25rem, 2vw, 0.5rem)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)',
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}>
                    📍 {restaurant.address || (language === 'ar' ? restaurant.address_ar : restaurant.address_en)}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: 'clamp(0.5rem, 2.5vw, 0.75rem)', 
                    color: 'rgb(75 85 99)',
                    padding: 'clamp(0.25rem, 2vw, 0.5rem)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)',
                    textAlign: 'center',
                    direction: 'ltr'
                  }}>
                    📞 {restaurant.phone}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: 'clamp(0.5rem, 2.5vw, 0.75rem)', 
                    color: 'rgb(75 85 99)',
                    padding: 'clamp(0.25rem, 2vw, 0.5rem)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)',
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}>
                    ✉️ {restaurant.email}
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
          overflow: 'hidden'
        }}>
          {/* Decorative Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.02), rgba(99, 102, 241, 0.02))',
            opacity: 0.5
          }}></div>
          <h2 style={{ 
            fontSize: 'clamp(1.25rem, 4vw, 2rem)', 
            fontWeight: 'bold', 
            marginBottom: 'clamp(0.75rem, 3vw, 1rem)',
            color: 'rgb(79 70 229)',
            textAlign: 'center'
          }}>
            {t('selectSubscriptionType')}
          </h2>
          
          {/* Selection Instructions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
            border: '2px solid rgba(79, 70, 229, 0.2)',
            borderRadius: 'clamp(0.5rem, 2vw, 1rem)',
            padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>👆</span>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: 'rgb(79, 70, 229)'
              }}>
                {language === 'ar' ? 'اختر نوع الاشتراك المناسب لك' : 'Choose the subscription type that suits you'}
              </span>
            </div>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'rgb(107, 114, 128)',
              margin: 0
            }}>
              {language === 'ar' 
                ? 'اضغط على البطاقة المفضلة لديك للمتابعة' 
                : 'Click on your preferred card to continue'
              }
            </p>
          </div>
          
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
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 90vw, 280px), 1fr))', 
            gap: 'clamp(1rem, 3vw, 1.25rem)',
            padding: '0 clamp(0.25rem, 2vw, 0.5rem)'
          }}>
            {subscriptionTypes.map((subscriptionType) => {
              const subscription = {
                type: subscriptionType.type,
                title: language === 'ar' ? subscriptionType.name_ar : subscriptionType.name_en,
                subtitle: language === 'ar' 
                  ? `${subscriptionType.meals_count} وجبة في ${subscriptionType.type === 'weekly' ? 'الأسبوع' : 'الشهر'}`
                  : `${subscriptionType.meals_count} meals per ${subscriptionType.type === 'weekly' ? 'week' : 'month'}`,
                price: subscriptionType.price.toString(),
                currency: language === 'ar' ? 'ريال' : 'SAR',
                period: language === 'ar' 
                  ? (subscriptionType.type === 'weekly' ? 'أسبوعياً' : 'شهرياً')
                  : (subscriptionType.type === 'weekly' ? 'Weekly' : 'Monthly'),
                icon: subscriptionType.type === 'weekly' ? '📅' : '📆',

                gradient: subscriptionType.type === 'weekly' 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                bgGradient: subscriptionType.type === 'weekly' 
                  ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' 
                  : 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                borderColor: subscriptionType.type === 'weekly' ? '#10b981' : '#6366f1',
                deliveryPrice: subscriptionType.delivery_price || 0
              };
              
              return (
              <div 
                key={subscription.type}
                onClick={() => handleSubscriptionTypeSelect(subscriptionType)}
                style={{
                  background: selectedSubscriptionType?.type === subscription.type 
                    ? subscription.bgGradient
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                  borderRadius: 'clamp(0.75rem, 3vw, 1.5rem)',
                  padding: 'clamp(1.5rem, 4vw, 2rem)',
                  boxShadow: selectedSubscriptionType?.type === subscription.type 
                    ? `0 20px 40px ${subscription.borderColor}25` 
                    : '0 8px 25px rgba(0, 0, 0, 0.12)',
                  border: selectedSubscriptionType?.type === subscription.type 
                    ? `3px solid ${subscription.borderColor}` 
                    : '2px solid rgba(79, 70, 229, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 'clamp(280px, 60vh, 320px)',
                  display: 'flex',
                  flexDirection: 'column',
                  backdropFilter: 'blur(20px)'
                }}
                onMouseEnter={(e) => {
                  if (selectedSubscriptionType?.type !== subscription.type) {
                    e.target.style.transform = 'translateY(-8px) scale(1.02)';
                    e.target.style.boxShadow = `0 25px 50px ${subscription.borderColor}20`;
                    e.target.style.borderColor = subscription.borderColor;
                    e.target.style.background = subscription.bgGradient;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSubscriptionType?.type !== subscription.type) {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                    e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))';
                  }
                }}
              >
                                 {/* Popular Badge for Monthly */}
                 {subscription.type === 'monthly' && (
                   <div style={{
                     position: 'absolute',
                     top: '0.75rem',
                     left: '0.75rem',
                     background: subscription.gradient,
                     color: 'white',
                     padding: '0.25rem 0.5rem',
                     borderRadius: '0.75rem',
                     fontSize: '0.625rem',
                     fontWeight: '500',
                     zIndex: 2
                   }}>
                     {t('mostPopular')}
                   </div>
                 )}

                {/* Selection Indicator */}
                {selectedSubscriptionType?.type === subscription.type && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
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
                    zIndex: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    animation: 'pulse 2s infinite'
                  }}>
                    ✓
                  </div>
                )}

                {/* Click to Select Indicator */}
                {selectedSubscriptionType?.type !== subscription.type && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(79, 70, 229, 0.1)',
                    color: 'rgb(79, 70, 229)',
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    zIndex: 2,
                    border: '2px solid rgba(79, 70, 229, 0.3)',
                    animation: 'bounce 2s infinite'
                  }}>
                    👆
                  </div>
                )}

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s ease'
                  }}>
                    {subscription.icon}
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '1.375rem', 
                    fontWeight: '700', 
                    marginBottom: '0.375rem',
                    background: subscription.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {subscription.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgb(107 114 128)', 
                    marginBottom: '0',
                    lineHeight: '1.4'
                  }}>
                    {subscription.subtitle}
                  </p>
                </div>

                {/* Price Section */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.125rem'
                  }}>
                    <span style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: '700', 
                      color: subscription.borderColor
                    }}>
                      {subscription.price}
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500',
                      color: 'rgb(107 114 128)'
                    }}>
                      {subscription.currency}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.625rem', 
                    color: 'rgb(156 163 175)',
                    fontWeight: '400',
                    marginBottom: '0.25rem'
                  }}>
                    {subscription.period}
                  </div>
                  {/* Delivery Price Info */}
                  <div style={{ 
                    fontSize: '0.625rem', 
                    color: subscription.deliveryPrice > 0 ? 'rgb(245 158 11)' : 'rgb(34 197 94)',
                    fontWeight: '500'
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
                  paddingTop: '1rem'
                }}>
                  {selectedSubscriptionType?.type === subscription.type ? (
                    <div style={{
                      background: subscription.borderColor,
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '2rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: `0 4px 12px ${subscription.borderColor}40`
                    }}>
                      <span>✓</span>
                      {language === 'ar' ? 'تم الاختيار' : 'Selected'}
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(79, 70, 229, 0.1)',
                      color: 'rgb(79, 70, 229)',
                      padding: '0.5rem 1rem',
                      borderRadius: '2rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid rgba(79, 70, 229, 0.3)',
                      transition: 'all 0.3s ease'
                    }}>
                      <span>👆</span>
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
            overflow: 'hidden'
          }}>
            {/* Decorative Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02), rgba(5, 150, 105, 0.02))',
              opacity: 0.5
            }}></div>
            <h2 style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'rgb(79 70 229)',
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
                zIndex: 5
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
                    <span style={{ fontSize: '1.25rem', color: 'white' }}>📅</span>
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
                        setErrors(prev => ({ ...prev, startDate: t('selectWeekdayOnly') }));
                        // Don't reset the input value, let user see their selection
                      }
                    }} 
                    min={getNextValidDate()} 
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
                      WebkitOverflowScrolling: 'touch'
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
                      {new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
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
                        ? 'يرجى اختيار يوم من الأحد إلى الخميس فقط'
                        : 'Please select a day from Sunday to Thursday only'
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
                      ? 'يمكنك اختيار أيام العمل فقط (الأحد - الخميس)'
                      : 'You can only select working days (Sunday - Thursday)'
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
                zIndex: 5
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
                    background: '#10b981',
                    borderRadius: '50%',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.25rem', color: 'white' }}>🍽️</span>
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
                  zIndex: 10
                }}>
                  {availableMealTypes.length > 0 ? availableMealTypes.map(mealType => {
                    const isSelected = mealTypeFilter === mealType;
                    const mealTypeIcon = {
                      'breakfast': '🌅',
                      'lunch': '☀️',
                      'dinner': '🌙'
                    }[mealType] || '🍽️';
                    
                    return (
                      <button
                        key={mealType}
                        onClick={(e) => {
                          console.log('Button clicked:', mealType);
                          handleMealTypeFilter(mealType);
                        }}
                        className="meal-filter-button"
                        style={{
                          background: isSelected ? '#10b981' : 'white',
                          color: isSelected ? 'white' : '#374151',
                          border: isSelected ? '2px solid #10b981' : '2px solid #d1d5db',
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
                          msUserSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.target.style.borderColor = '#10b981';
                            e.target.style.background = '#f0fdf4';
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.background = 'white';
                            e.target.style.transform = 'translateY(0)';
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
                  <div style={{
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
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
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
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
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
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
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
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
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
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  border: '1px solid #10b981',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    color: '#059669',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    📊 {t('mealsSelectionProgress')}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#047857'
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
                      border: '1px solid rgba(229, 231, 235, 0.5)'
                    }}
                  >
                    {/* Day Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      marginBottom: '1.5rem',
                      padding: '0.75rem',
                      background: selectedSubscriptionType?.type === 'monthly' && day.weekNumber 
                        ? `linear-gradient(135deg, ${day.weekNumber === 1 ? 'rgba(16, 185, 129, 0.1)' : day.weekNumber === 2 ? 'rgba(59, 130, 246, 0.1)' : day.weekNumber === 3 ? 'rgba(168, 85, 247, 0.1)' : 'rgba(236, 72, 153, 0.1)'}, ${day.weekNumber === 1 ? 'rgba(5, 150, 105, 0.05)' : day.weekNumber === 2 ? 'rgba(37, 99, 235, 0.05)' : day.weekNumber === 3 ? 'rgba(147, 51, 234, 0.05)' : 'rgba(219, 39, 119, 0.05)'})`
                        : 'transparent',
                      borderRadius: '0.75rem',
                      border: selectedSubscriptionType?.type === 'monthly' && day.weekNumber
                        ? `1px solid ${day.weekNumber === 1 ? 'rgba(16, 185, 129, 0.3)' : day.weekNumber === 2 ? 'rgba(59, 130, 246, 0.3)' : day.weekNumber === 3 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`
                        : '1px solid rgba(229, 231, 235, 0.3)'
                    }}>
                      <div style={{ fontSize: '1.5rem' }}>{day.icon}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '600', 
                          color: 'rgb(79 70 229)',
                          margin: 0,
                          marginBottom: '0.25rem'
                        }}>
                          {day.label}
                        </h3>
                        <div style={{
                          fontSize: '0.875rem',
                          color: 'rgb(107 114 128)',
                          fontWeight: '500'
                        }}>
                          {day.displayDate}
                        </div>
                        {selectedSubscriptionType?.type === 'monthly' && day.weekNumber && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: day.weekNumber === 1 ? '#059669' : day.weekNumber === 2 ? '#2563eb' : day.weekNumber === 3 ? '#7c3aed' : '#db2777',
                            fontWeight: '600',
                            marginTop: '0.25rem'
                          }}>
                            {language === 'ar' ? `الأسبوع ${day.weekNumber}` : `Week ${day.weekNumber}`}
                          </div>
                        )}
                      </div>
                      {getSelectedMealForDay(day.key) && (
                        <div style={{
                          padding: '0.375rem 0.75rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {t('selected')}
                        </div>
                      )}
                    </div>

                    {/* Meals Grid */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 90vw, 280px), 1fr))', 
                      gap: 'clamp(0.75rem, 3vw, 1rem)'
                    }}>
                      {filteredMeals.map((meal) => {
                        const isSelected = getSelectedMealForDay(day.key)?.id === meal.id;
                        return (
                                                    <div key={meal.id} style={{
                            background: isSelected 
                              ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' 
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                            borderRadius: 'clamp(0.75rem, 3vw, 1.25rem)',
                            padding: 'clamp(1.25rem, 4vw, 1.75rem)',
                            boxShadow: isSelected 
                              ? '0 15px 35px rgba(16, 185, 129, 0.2)' 
                              : '0 8px 25px rgba(0, 0, 0, 0.12)',
                            border: isSelected 
                              ? '3px solid #10b981' 
                              : '2px solid rgba(79, 70, 229, 0.2)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)'
                          }}
                            onClick={() => handleMealSelection(day.key, meal)}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                                e.target.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)';
                                e.target.style.borderColor = '#10b981';
                                e.target.style.background = 'linear-gradient(135deg, #f0fdf4, #dcfce7)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                                e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                                e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))';
                              }
                            }}>
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: '#10b981',
                                color: 'white',
                                borderRadius: '50%',
                                width: '2rem',
                                height: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                animation: 'pulse 2s infinite'
                              }}>
                                ✓
                              </div>
                            )}

                            {!isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(79, 70, 229, 0.1)',
                                color: 'rgb(79, 70, 229)',
                                borderRadius: '50%',
                                width: '2rem',
                                height: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                border: '2px solid rgba(79, 70, 229, 0.3)',
                                animation: 'bounce 2s infinite'
                              }}>
                                👆
                              </div>
                            )}
                            
                            <div style={{ 
                              fontSize: 'clamp(2rem, 6vw, 3rem)', 
                              marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                              background: isSelected 
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))'
                                : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
                              borderRadius: '50%',
                              width: 'clamp(3.5rem, 10vw, 5rem)',
                              height: 'clamp(3.5rem, 10vw, 5rem)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto clamp(0.5rem, 2vw, 1rem) auto',
                              border: isSelected 
                                ? '3px solid rgba(16, 185, 129, 0.3)'
                                : '2px solid rgba(79, 70, 229, 0.2)',
                              transition: 'all 0.3s ease'
                            }}>
                              🍽️
                            </div>
                                                          <h4 style={{ 
                                fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
                                fontWeight: '600', 
                                marginBottom: 'clamp(0.25rem, 2vw, 0.5rem)',
                                color: 'rgb(79 70 229)',
                                textAlign: 'center'
                              }}>
                                {language === 'ar' ? meal.name_ar : meal.name_en}
                              </h4>
                              <p style={{ 
                                fontSize: 'clamp(0.625rem, 2.5vw, 0.75rem)', 
                                color: 'rgb(75 85 99)', 
                                marginBottom: 'clamp(0.75rem, 3vw, 1rem)',
                                lineHeight: '1.4',
                                textAlign: 'center',
                                minHeight: 'clamp(2rem, 6vw, 2.5rem)'
                              }}>
                                {language === 'ar' ? meal.description_ar : meal.description_en || t('noDescriptionAvailable')}
                              </p>
                            
                            <button 
                              style={{
                                width: '100%',
                                padding: 'clamp(0.5rem, 3vw, 0.75rem)',
                                borderRadius: 'clamp(0.25rem, 2vw, 0.5rem)',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                                  : 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                color: 'white',
                                border: 'none',
                                fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                              }}
                            >
                              {isSelected ? t('selected') : t('selectThisMeal')}
                            </button>
                          </div>
                        );
                      })}
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
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(220, 38, 38, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.12)';
                }}
              >
                {/* Decorative background elements */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '60px',
                  height: '60px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  borderRadius: '50%',
                  filter: 'blur(12px)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-12px',
                  left: '-12px',
                  width: '50px',
                  height: '50px',
                  background: 'rgba(239, 68, 68, 0.06)',
                  borderRadius: '50%',
                  filter: 'blur(10px)'
                }}></div>
                
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

            {/* Continue Button */}
            {startDate && Object.keys(selectedMeals).length > 0 && Object.keys(selectedMeals).length === (selectedSubscriptionType?.meals_count || 0) ? (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))',
                borderRadius: '1.5rem',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative Elements */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
                  borderRadius: '50%',
                  filter: 'blur(20px)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '-15px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08))',
                  borderRadius: '50%',
                  filter: 'blur(15px)'
                }}></div>
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
                                          <span>{t('startDate')}: {new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          calendar: 'gregory'
                        })}</span>
                </div>
                <button 
                  onClick={handleContinueToSubscription}
                  style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                    color: 'white',
                    border: 'none',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.3)';
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
                background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 0.95))',
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
                color: 'rgb(79 70 229)',
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
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(75, 85, 99, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'translateY(0)';
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
                    background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                    color: 'white',
                    border: 'none',
                    fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                    minWidth: 'clamp(100px, 25vw, 120px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.3)';
                  }}
                >
                  {t('login')}
                </button>
              </div>
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
      `}</style>
    </div>
  );
};

export default RestaurantDetail;

