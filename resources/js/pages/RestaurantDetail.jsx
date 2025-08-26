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

  const handleSubscribe = (meal) => {
    console.log('Subscribe button clicked for meal:', meal);
    
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    
    // Navigate to subscription form with both restaurant and meal IDs
    const subscriptionUrl = `/subscribe/${id}/${meal.id}`;
    console.log('Navigating to:', subscriptionUrl);
    navigate(subscriptionUrl);
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
            <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)' }}>{restaurant.logo}</div>
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
                  justifyContent: 'center'
                }}>
                  📍 {restaurant.address_ar}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)'
                }}>
                  📞 {restaurant.phone}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  color: 'rgb(75 85 99)'
                }}>
                  ✉️ {restaurant.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            color: 'rgb(79 70 229)',
            textAlign: 'center'
          }}>
            الوجبات المتاحة
          </h2>
          
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
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1rem',
              padding: '0 0.5rem'
            }}>
              {meals.map((meal) => (
                <div key={meal.id} style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.75rem' }}>🍽️</div>
                    <h3 style={{ 
                      fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: 'rgb(79 70 229)'
                    }}>
                      {meal.name_ar}
                    </h3>
                    <p style={{ 
                      fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                      color: 'rgb(75 85 99)', 
                      marginBottom: '1rem',
                      lineHeight: '1.6'
                    }}>
                      {meal.description_ar}
                    </p>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '1.25rem'
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
                        fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                        color: 'rgb(75 85 99)',
                        fontWeight: '600'
                      }}>
                        💰 {meal.price} ريال
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                        color: 'rgb(75 85 99)'
                      }}>
                        ⏰ {meal.delivery_time}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        padding: '0.375rem 1rem', 
                        borderRadius: '1rem', 
                        fontSize: 'clamp(0.7rem, 2vw, 0.75rem)',
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
                    onClick={() => handleSubscribe(meal)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 3vw, 1rem)',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                      color: 'white',
                      border: 'none',
                      fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                      fontWeight: '600',
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
                    اشترك الآن
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default RestaurantDetail;

