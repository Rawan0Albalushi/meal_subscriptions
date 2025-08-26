import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState({});

  const weekDays = [
    { key: 'sunday', label: 'الأحد', icon: '🌅' },
    { key: 'monday', label: 'الاثنين', icon: '🌞' },
    { key: 'tuesday', label: 'الثلاثاء', icon: '☀️' },
    { key: 'wednesday', label: 'الأربعاء', icon: '🌤️' },
    { key: 'thursday', label: 'الخميس', icon: '🌅' }
  ];

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantResponse = await restaurantsAPI.getById(id);
        if (restaurantResponse.data.success) {
          setRestaurant(restaurantResponse.data.data);
        }

        // Fetch restaurant meals
        const mealsResponse = await restaurantsAPI.getMeals(id);
        if (mealsResponse.data.success) {
          setMeals(mealsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        setError('حدث خطأ أثناء جلب بيانات المطعم');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  const handleSubscriptionTypeSelect = (type) => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    
    setSelectedSubscriptionType(type);
    setSelectedMeals({}); // Reset selected meals when changing subscription type
  };

  const handleMealSelection = (dayKey, meal) => {
    setSelectedMeals(prev => ({
      ...prev,
      [dayKey]: meal
    }));
  };

  const handleContinueToSubscription = () => {
    const selectedDays = Object.keys(selectedMeals);
    if (selectedDays.length === 0) {
      alert('يرجى اختيار وجبة واحدة على الأقل');
      return;
    }
    
    // Navigate to subscription form with selected meals and days
    const selectedMealsWithDays = Object.entries(selectedMeals).map(([dayKey, meal]) => ({
      dayKey,
      mealId: meal.id
    }));
    const mealsData = JSON.stringify(selectedMealsWithDays);
    const subscriptionUrl = `/subscribe/${id}/${selectedSubscriptionType}/${encodeURIComponent(mealsData)}`;
    navigate(subscriptionUrl);
  };

  const getSelectedMealForDay = (dayKey) => {
    return selectedMeals[dayKey] || null;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>جاري تحميل بيانات المطعم...</p>
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
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>{error}</p>
          <button 
            onClick={() => navigate('/restaurants')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            العودة للمطاعم
          </button>
        </div>
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
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>المطعم غير موجود</p>
          <button 
            onClick={() => navigate('/restaurants')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            العودة للمطاعم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      direction: 'rtl',
      overflowX: 'hidden'
    }}>
      {/* Restaurant Info */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ 
              fontSize: 'clamp(3rem, 8vw, 4rem)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}>{restaurant.logo}</div>
            <div style={{ width: '100%' }}>
              <h1 style={{ 
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
                fontWeight: 'bold', 
                marginBottom: '0.75rem',
                color: 'rgb(79 70 229)'
              }}>
                {restaurant.name_ar}
              </h1>
              <p style={{ 
                fontSize: 'clamp(0.875rem, 3vw, 1.125rem)', 
                color: 'rgb(75 85 99)', 
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                {restaurant.description_ar}
              </p>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(229, 231, 235, 0.3)'
                }}>
                  📍 {restaurant.address_ar}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(229, 231, 235, 0.3)'
                }}>
                  📞 {restaurant.phone}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '0.75rem',
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
          borderRadius: '1.25rem',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'rgb(79 70 229)',
            textAlign: 'center'
          }}>
            اختر نوع الاشتراك
          </h2>
          
          <p style={{ 
            fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
            color: 'rgb(75 85 99)', 
            textAlign: 'center',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            padding: '0 clamp(0.5rem, 4vw, 2rem)'
          }}>
            اختر نوع الاشتراك المناسب لك وابدأ رحلتك مع {restaurant.name_ar}
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.25rem',
            padding: '0 0.5rem'
          }}>
            {[
              {
                type: 'weekly',
                title: 'اشتراك أسبوعي',
                subtitle: '4 وجبات في الأسبوع',
                price: '120',
                currency: 'ريال',
                period: 'أسبوعياً',
                icon: '📅',
                features: ['توصيل من الأحد إلى الخميس', 'وجبة واحدة يومياً', 'مرونة في اختيار الوجبات'],
                gradient: 'linear-gradient(135deg, #10b981, #059669)',
                bgGradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                borderColor: '#10b981'
              },
              {
                type: 'monthly',
                title: 'اشتراك شهري',
                subtitle: '16 وجبة في الشهر',
                price: '400',
                currency: 'ريال',
                period: 'شهرياً',
                icon: '📆',
                features: ['توصيل من الأحد إلى الخميس', 'وجبة واحدة يومياً', 'خصم 15% على السعر الإجمالي'],
                gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                bgGradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                borderColor: '#6366f1'
              }
            ].map((subscription) => (
              <div 
                key={subscription.type}
                onClick={() => handleSubscriptionTypeSelect(subscription.type)}
                style={{
                  background: selectedSubscriptionType === subscription.type 
                    ? subscription.bgGradient
                    : 'white',
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
                    e.target.style.transform = 'translateY(-6px)';
                    e.target.style.boxShadow = `0 20px 40px ${subscription.borderColor}25`;
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
                    top: '1rem',
                    left: '1rem',
                    background: subscription.gradient,
                    color: 'white',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '1.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 2
                  }}>
                    الأكثر شعبية
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedSubscriptionType === subscription.type && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: subscription.gradient,
                    color: 'white',
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    animation: 'pulse 2s infinite',
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
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '0.875rem',
                  border: '1px solid rgba(229, 231, 235, 0.3)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ 
                      fontSize: '2rem', 
                      fontWeight: '800', 
                      background: subscription.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {subscription.price}
                    </span>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      color: 'rgb(107 114 128)'
                    }}>
                      {subscription.currency}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgb(156 163 175)',
                    fontWeight: '500'
                  }}>
                    {subscription.period}
                  </div>
                </div>
                
                {/* Features Section */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                  flex: 1
                }}>
                  {subscription.features.map((feature, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'rgb(75 85 99)',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(229, 231, 235, 0.4)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: subscription.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.625rem',
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
            ))}
          </div>
        </div>

        {/* Meals Section - Only show if subscription type is selected */}
        {selectedSubscriptionType && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'rgb(79 70 229)',
              textAlign: 'center'
            }}>
              اختر وجبة لكل يوم
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
              color: 'rgb(75 85 99)', 
              textAlign: 'center',
              marginBottom: '2rem',
              lineHeight: '1.6',
              padding: '0 clamp(0.5rem, 4vw, 2rem)'
            }}>
              {selectedSubscriptionType === 'weekly' 
                ? 'اختر وجبة مختلفة لكل يوم من الأحد إلى الخميس' 
                : 'اختر وجبة مختلفة لكل يوم من الأحد إلى الخميس لمدة 4 أسابيع'}
            </p>
            
            {meals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '1rem' }}>🍽️</div>
                <p style={{ 
                  color: 'rgb(75 85 99)', 
                  fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                  lineHeight: '1.6'
                }}>
                  لا توجد وجبات متاحة حالياً
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '2rem'
              }}>
                {weekDays.map((day) => (
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
                      background: 'white',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(229, 231, 235, 0.3)'
                    }}>
                      <div style={{ fontSize: '1.5rem' }}>{day.icon}</div>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '600', 
                        color: 'rgb(79 70 229)',
                        margin: 0
                      }}>
                        {day.label}
                      </h3>
                      {getSelectedMealForDay(day.key) && (
                        <div style={{
                          marginRight: 'auto',
                          padding: '0.375rem 0.75rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          تم الاختيار
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
                            background: isSelected ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : 'white',
                            borderRadius: '0.875rem',
                            padding: '1.25rem',
                            boxShadow: isSelected 
                              ? '0 8px 20px rgba(16, 185, 129, 0.2)' 
                              : '0 4px 12px rgba(0, 0, 0, 0.05)',
                            border: isSelected 
                              ? '2px solid #10b981' 
                              : '1px solid rgba(229, 231, 235, 0.5)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => handleMealSelection(day.key, meal)}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                            }
                          }}
                          >
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
                            
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                              <div style={{ 
                                fontSize: '2rem', 
                                marginBottom: '0.75rem',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                              }}>🍽️</div>
                              <h4 style={{ 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                marginBottom: '0.5rem',
                                color: 'rgb(79 70 229)'
                              }}>
                                {meal.name_ar}
                              </h4>
                              <p style={{ 
                                fontSize: '0.75rem', 
                                color: 'rgb(75 85 99)', 
                                marginBottom: '1rem',
                                lineHeight: '1.4'
                              }}>
                                {meal.description_ar}
                              </p>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: '0.5rem',
                              marginBottom: '1rem'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem', 
                                  fontSize: '0.75rem', 
                                  color: 'rgb(75 85 99)',
                                  fontWeight: '600',
                                  padding: '0.375rem 0.75rem',
                                  background: 'rgb(249 250 251)',
                                  borderRadius: '0.5rem',
                                  border: '1px solid rgb(229 231 235)'
                                }}>
                                  💰 {meal.price} ريال
                                </div>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem', 
                                  fontSize: '0.75rem', 
                                  color: 'rgb(75 85 99)',
                                  padding: '0.375rem 0.75rem',
                                  background: 'rgb(249 250 251)',
                                  borderRadius: '0.5rem',
                                  border: '1px solid rgb(229 231 235)'
                                }}>
                                  ⏰ {meal.delivery_time}
                                </div>
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center'
                              }}>
                                <div style={{ 
                                  padding: '0.25rem 0.75rem', 
                                  borderRadius: '0.75rem', 
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  background: meal.meal_type === 'breakfast' ? '#fef3c7' : 
                                             meal.meal_type === 'lunch' ? '#dbeafe' : '#f3e8ff',
                                  color: meal.meal_type === 'breakfast' ? '#92400e' : 
                                         meal.meal_type === 'lunch' ? '#1e40af' : '#7c3aed',
                                  border: '1px solid',
                                  borderColor: meal.meal_type === 'breakfast' ? '#f59e0b' : 
                                             meal.meal_type === 'lunch' ? '#3b82f6' : '#8b5cf6'
                                }}>
                                  {meal.meal_type === 'breakfast' ? 'فطور' : 
                                   meal.meal_type === 'lunch' ? 'غداء' : 'عشاء'}
                                </div>
                              </div>
                            </div>
                            
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
                              {isSelected ? 'تم الاختيار' : 'اختيار هذه الوجبة'}
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
            {Object.keys(selectedMeals).length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '1rem',
                border: '1px solid rgba(229, 231, 235, 0.3)'
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
                  <span>تم اختيار {Object.keys(selectedMeals).length} وجبة</span>
                </div>
                <button 
                  onClick={handleContinueToSubscription}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                    color: 'white',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 25px rgba(79, 70, 229, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.3)';
                  }}
                >
                  متابعة إلى صفحة الاشتراك
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(5px)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowLoginPopup(false);
          }
        }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            maxWidth: 'min(400px, 90vw)',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '1rem' }}>🔐</div>
            <h3 style={{ 
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'rgb(79 70 229)'
            }}>
              تسجيل الدخول مطلوب
            </h3>
            <p style={{ 
              fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
              color: 'rgb(75 85 99)', 
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              للاشتراك في الوجبات، يرجى تسجيل الدخول أولاً
            </p>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '0.75rem', 
              justifyContent: 'center'
            }}>
              <button 
                onClick={() => setShowLoginPopup(false)}
                style={{
                  padding: 'clamp(0.75rem, 3vw, 1rem) 1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgb(156 163 175)',
                  background: 'white',
                  color: 'rgb(75 85 99)',
                  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgb(249 250 251)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
                onTouchStart={(e) => {
                  e.target.style.transform = 'scale(0.98)';
                }}
                onTouchEnd={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  setShowLoginPopup(false);
                  navigate('/login');
                }}
                style={{
                  padding: 'clamp(0.75rem, 3vw, 1rem) 1.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                  color: 'white',
                  border: 'none',
                  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.2)';
                }}
                onTouchStart={(e) => {
                  e.target.style.transform = 'scale(0.98)';
                }}
                onTouchEnd={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
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
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default RestaurantDetail;

