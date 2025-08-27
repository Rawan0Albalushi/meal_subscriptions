import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, subscriptionTypesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

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

  const weekDays = [
    { key: 'sunday', label: language === 'ar' ? 'الأحد' : 'Sunday', icon: '🌅' },
    { key: 'monday', label: language === 'ar' ? 'الاثنين' : 'Monday', icon: '🌞' },
    { key: 'tuesday', label: language === 'ar' ? 'الثلاثاء' : 'Tuesday', icon: '☀️' },
    { key: 'wednesday', label: language === 'ar' ? 'الأربعاء' : 'Wednesday', icon: '🌤️' },
    { key: 'thursday', label: language === 'ar' ? 'الخميس' : 'Thursday', icon: '🌅' }
  ];

  useEffect(() => {
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

        // Fetch subscription types
        console.log('📋 Fetching subscription types');
        const subscriptionTypesResponse = await subscriptionTypesAPI.getAll();
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

  const handleSubscriptionTypeSelect = (type) => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    
    setSelectedSubscriptionType(type);
    setSelectedMeals({}); // Reset selected meals when changing subscription type
    setStartDate(''); // Reset start date when changing subscription type
  };

  // Reset selected meals when start date changes
  useEffect(() => {
    setSelectedMeals({});
  }, [startDate]);

  const handleMealSelection = (dayKey, meal) => {
    setSelectedMeals(prev => ({
      ...prev,
      [dayKey]: meal
    }));
  };

  const handleContinueToSubscription = () => {
    if (!startDate) {
      alert(t('selectStartDate'));
      return;
    }
    
    const selectedDays = Object.keys(selectedMeals);
    if (selectedDays.length === 0) {
      alert(t('selectAtLeastOneMeal'));
      return;
    }
    
    // Navigate to subscription form with selected meals, days, and start date
    const selectedMealsWithDays = Object.entries(selectedMeals).map(([dayKey, meal]) => ({
      dayKey,
      mealId: meal.id
    }));
    const mealsData = JSON.stringify(selectedMealsWithDays);
    const subscriptionUrl = `/subscribe/${id}/${selectedSubscriptionType}/${startDate}/${encodeURIComponent(mealsData)}`;
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
    while (nextDate.getDay() === 5 || nextDate.getDay() === 6) { // Friday = 5, Saturday = 6
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  // Generate meal days based on selected start date (only weekdays)
  const getWeekDaysFromStartDate = () => {
    if (!startDate) return [];
    
    const start = new Date(startDate);
    const days = [];
    const mealLabels = language === 'ar' 
      ? ['الوجبة الأولى', 'الوجبة الثانية', 'الوجبة الثالثة', 'الوجبة الرابعة', 'الوجبة الخامسة']
      : ['First Meal', 'Second Meal', 'Third Meal', 'Fourth Meal', 'Fifth Meal'];
    const mealIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    
    let currentDate = new Date(start);
    let mealIndex = 0;
    
    // Generate 5 meal days, skipping weekends (Friday = 5, Saturday = 6)
    while (mealIndex < 5) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 0 && dayOfWeek <= 4) { // Sunday = 0, Thursday = 4
        days.push({
          key: dayKeys[mealIndex],
          label: mealLabels[mealIndex],
          icon: mealIcons[mealIndex],
          date: currentDate.toISOString().split('T')[0],
          displayDate: currentDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
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
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday = 0, Thursday = 4
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
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>🍽️</div>
        <div style={{ 
          fontSize: '1.25rem', 
          color: 'rgb(79 70 229)', 
          fontWeight: '600' 
        }}>
          {t('loadingRestaurantData')}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: 'rgb(107 114 128)' 
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
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>❌</div>
        <div style={{ 
          fontSize: '1.25rem', 
          color: 'rgb(239 68 68)', 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {error}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: 'rgb(107 114 128)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {t('errorMessage')}
        </div>
        <button 
          onClick={() => window.location.reload()}
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
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
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
            gap: '1.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ 
              fontSize: 'clamp(2rem, 6vw, 2.5rem)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
              borderRadius: '50%',
              width: 'clamp(3rem, 8vw, 4rem)',
              height: 'clamp(3rem, 8vw, 4rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'white',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.25)'
            }}>
              {restaurant.logo || '🍽️'}
            </div>
            <div style={{ width: '100%' }}>
                              <h1 style={{ 
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem',
                  color: 'rgb(79 70 229)'
                }}>
                {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
              </h1>
                              <p style={{ 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)', 
                  marginBottom: '0.75rem',
                  lineHeight: '1.5'
                }}>
                {language === 'ar' ? restaurant.description_ar : restaurant.description_en}
              </p>
                              <div style={{ 
                  display: 'flex', 
                  flexDirection: 'row',
                  gap: '0.5rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', 
                    color: 'rgb(75 85 99)',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)'
                  }}>
                    📍 {language === 'ar' ? restaurant.address_ar : restaurant.address_en}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', 
                    color: 'rgb(75 85 99)',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)'
                  }}>
                    📞 {restaurant.phone}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', 
                    color: 'rgb(75 85 99)',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.3)'
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
          borderRadius: '1.5rem',
          padding: 'clamp(2rem, 4vw, 2.5rem)',
          marginBottom: '2rem',
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
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'rgb(79 70 229)',
            textAlign: 'center'
          }}>
            {t('selectSubscriptionType')}
          </h2>
          
          <p style={{ 
            fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
            color: 'rgb(75 85 99)', 
            textAlign: 'center',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            padding: '0 clamp(0.5rem, 4vw, 2rem)'
          }}>
            {t('selectSubscriptionTypeMessage', { restaurantName: language === 'ar' ? restaurant.name_ar : restaurant.name_en })}
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.25rem',
            padding: '0 0.5rem'
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
                features: language === 'ar' ? [
                  'توصيل من الأحد إلى الخميس',
                  'وجبة واحدة يومياً',
                  'مرونة في اختيار الوجبات'
                ] : [
                  'Delivery from Sunday to Thursday',
                  'One meal per day',
                  'Flexibility in meal selection'
                ],
                gradient: subscriptionType.type === 'weekly' 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                bgGradient: subscriptionType.type === 'weekly' 
                  ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' 
                  : 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                borderColor: subscriptionType.type === 'weekly' ? '#10b981' : '#6366f1'
              };
              
              return (
              <div 
                key={subscription.type}
                onClick={() => handleSubscriptionTypeSelect(subscription.type)}
                style={{
                  background: selectedSubscriptionType === subscription.type 
                    ? subscription.bgGradient
                    : 'transparent',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  boxShadow: selectedSubscriptionType === subscription.type 
                    ? `0 15px 30px ${subscription.borderColor}20` 
                    : '0 4px 15px rgba(0, 0, 0, 0.08)',
                  border: selectedSubscriptionType === subscription.type 
                    ? `2px solid ${subscription.borderColor}` 
                    : '1px solid rgba(229, 231, 235, 0.6)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '320px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                                 onMouseEnter={(e) => {
                   if (selectedSubscriptionType !== subscription.type) {
                     e.target.style.transform = 'translateY(-2px)';
                     e.target.style.boxShadow = `0 8px 25px ${subscription.borderColor}15`;
                   }
                 }}
                 onMouseLeave={(e) => {
                   if (selectedSubscriptionType !== subscription.type) {
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
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
                {selectedSubscriptionType === subscription.type && (
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: subscription.borderColor,
                    color: 'white',
                    borderRadius: '50%',
                    width: '1.5rem',
                    height: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    zIndex: 2
                  }}>
                    ✓
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
                   marginBottom: '1rem',
                   padding: '0.75rem',
                   background: 'transparent',
                   borderRadius: '0.75rem',
                   border: '1px solid rgba(229, 231, 235, 0.2)'
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
                     fontWeight: '400'
                   }}>
                     {subscription.period}
                   </div>
                 </div>
                
                {/* Features Section */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.375rem',
                  flex: 1
                }}>
                  {subscription.features.map((feature, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375rem',
                      fontSize: '0.7rem',
                      color: 'rgb(75 85 99)',
                      padding: '0.375rem 0.5rem',
                      background: 'transparent',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(229, 231, 235, 0.3)'
                    }}>
                      <div style={{
                        width: '1rem',
                        height: '1rem',
                        borderRadius: '50%',
                        background: subscription.borderColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.5rem',
                        color: 'white',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        ✓
                      </div>
                      <span style={{ lineHeight: '1.3' }}>{feature}</span>
                    </div>
                  ))}
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
            borderRadius: '1.5rem',
            padding: 'clamp(2rem, 4vw, 2.5rem)',
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
              {selectedSubscriptionType === 'weekly' 
                ? t('selectMealForEachDayWeekly') 
                : t('selectMealForEachDayMonthly')}
            </p>
            


            {/* Start Date Selection */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '1rem',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              maxWidth: '500px',
              margin: '0 auto 2rem auto'
            }}>
              <div style={{
                fontSize: '1.125rem',
                color: 'rgb(79 70 229)',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                📅 {t('startSubscriptionDate')}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgb(107 114 128)',
                marginBottom: '1.5rem'
              }}>
                {t('selectStartDateMessage')}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (!selectedDate) {
                      setStartDate('');
                      setSelectedMeals({});
                      return;
                    }
                    
                    if (isValidWeekday(selectedDate)) {
                      setStartDate(selectedDate);
                      setSelectedMeals({}); // Reset selected meals when changing start date
                    } else {
                      alert(t('selectWeekdayOnly'));
                      e.target.value = startDate; // Reset to previous value
                    }
                  }} 
                  min={getNextValidDate()} 
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1rem 1rem 3rem', 
                    borderRadius: '0.75rem', 
                    border: '2px solid rgba(79, 70, 229, 0.2)', 
                    fontSize: '1rem', 
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer'
                  }} 
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgb(79, 70, 229)';
                    e.target.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.15)';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                    e.target.style.transform = 'scale(1)';
                  }}
                  required 
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextValidDate = getNextValidDate();
                    setStartDate(nextValidDate);
                    setSelectedMeals({});
                  }}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(79, 70, 229, 0.1)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: 'rgb(79, 70, 229)',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(79, 70, 229, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                  }}
                  title={t('selectFirstAvailableDay')}
                >
                  🚀
                </button>
              </div>
                              {startDate && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    borderRadius: '0.75rem',
                    border: '1px solid #10b981',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#059669',
                      fontWeight: '600',
                      marginBottom: '0.25rem'
                    }}>
                      ✅ {t('dateSelected')}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#047857',
                      fontWeight: '700'
                    }}>
                      {new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgb(107 114 128)',
                  marginTop: '0.75rem',
                  lineHeight: '1.5'
                }}>
                  ⚠️ {t('selectWeekdayOnlyMessage')}
                </p>
            </div>
            
            {meals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '1rem' }}>🍽️</div>
                <p style={{ 
                  color: 'rgb(75 85 99)', 
                  fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  {t('noMealsAvailable')}
                </p>
                <p style={{ 
                  color: 'rgb(107 114 128)', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem'
                }}>
                  {t('pleaseTryAgainLater')}
                </p>
                <button 
                  onClick={() => window.location.reload()}
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
                  🔄 {t('reload')}
                </button>
              </div>
            ) : !startDate ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem 1rem',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '1rem',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '1rem' }}>📅</div>
                <p style={{ 
                  color: 'rgb(75 85 99)', 
                  fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  {t('selectStartDateFirst')}
                </p>
                <p style={{ 
                  color: 'rgb(107 114 128)', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                  lineHeight: '1.5'
                }}>
                  {t('daysWillBeDisplayedBasedOnSelectedDate')}
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '2rem'
              }}>
                {getWeekDaysFromStartDate().map((day) => (
                  <div key={day.key} style={{
                    background: 'rgba(249, 250, 251, 0.8)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(229, 231, 235, 0.5)'
                  }}>
                    {/* Day Header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      marginBottom: '1.5rem',
                      padding: '0.75rem',
                      background: 'transparent',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(229, 231, 235, 0.3)'
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                      gap: '1rem'
                    }}>
                      {meals.map((meal) => {
                        const isSelected = getSelectedMealForDay(day.key)?.id === meal.id;
                        return (
                                                    <div key={meal.id} style={{
                            background: isSelected 
                              ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' 
                              : 'transparent',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: isSelected 
                              ? '0 10px 25px rgba(16, 185, 129, 0.15)' 
                              : '0 4px 15px rgba(0, 0, 0, 0.08)',
                            border: isSelected 
                              ? '2px solid #10b981' 
                              : '1px solid rgba(229, 231, 235, 0.4)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                            onClick={() => handleMealSelection(day.key, meal)}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.transform = 'translateY(-4px)';
                                e.target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                              }
                            }}>
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                background: '#10b981',
                                color: 'white',
                                borderRadius: '50%',
                                width: '1.5rem',
                                height: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}>
                                ✓
                              </div>
                            )}
                            
                            <div style={{ 
                              fontSize: '3rem', 
                              marginBottom: '1rem',
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                              background: isSelected 
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))'
                                : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
                              borderRadius: '50%',
                              width: '5rem',
                              height: '5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 1rem auto',
                              border: isSelected 
                                ? '3px solid rgba(16, 185, 129, 0.3)'
                                : '2px solid rgba(79, 70, 229, 0.2)',
                              transition: 'all 0.3s ease'
                            }}>
                              🍽️
                            </div>
                                                          <h4 style={{ 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.5rem',
                                color: 'rgb(79 70 229)',
                                textAlign: 'center'
                              }}>
                                {language === 'ar' ? meal.name_ar : meal.name_en}
                              </h4>
                              <p style={{ 
                                fontSize: '0.75rem', 
                                color: 'rgb(75 85 99)', 
                                marginBottom: '1rem',
                                lineHeight: '1.4',
                                textAlign: 'center',
                                minHeight: '2.5rem'
                              }}>
                                {language === 'ar' ? meal.description_ar : meal.description_en || t('noDescriptionAvailable')}
                              </p>
                            
                            <button 
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                                  : 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.875rem',
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

            {/* Continue Button */}
            {startDate && Object.keys(selectedMeals).length > 0 && (
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
                  <span>{t('startDate')}: {new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
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
            )}
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
            borderRadius: '1.5rem',
            padding: 'clamp(2rem, 4vw, 2.5rem)',
            maxWidth: 'min(450px, 90vw)',
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
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setShowLoginPopup(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: 'rgb(75 85 99)',
                    border: '2px solid rgba(229, 231, 235, 0.5)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '120px'
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
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                    minWidth: '120px'
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

