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
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    
    // Navigate to subscription form
    navigate(`/subscription/${restaurantId}/${meal.id}`);
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
      direction: 'rtl'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                height: '2.5rem', 
                width: '2.5rem', 
                borderRadius: '1rem', 
                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.125rem'
              }}>
                م
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                اشتراكات الوجبات
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => navigate('/restaurants')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgb(79 70 229)',
                  background: 'white',
                  color: 'rgb(79 70 229)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ← العودة للمطاعم
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.25rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem' }}>{restaurant.logo}</div>
            <div>
              <h1 style={{ 
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                color: 'rgb(79 70 229)'
              }}>
                {restaurant.name_ar}
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: 'rgb(75 85 99)', 
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                {restaurant.description_ar}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                  📍 {restaurant.address_ar}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                  📞 {restaurant.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                  ✉️ {restaurant.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            color: 'rgb(79 70 229)',
            textAlign: 'center'
          }}>
            الوجبات المتاحة
          </h2>
          
          {meals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>لا توجد وجبات متاحة حالياً</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {meals.map((meal) => (
                <div key={meal.id} style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(229, 231, 235, 0.5)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: 'rgb(79 70 229)'
                    }}>
                      {meal.name_ar}
                    </h3>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: 'rgb(75 85 99)', 
                      marginBottom: '1rem',
                      lineHeight: '1.6'
                    }}>
                      {meal.description_ar}
                    </p>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                      💰 {meal.price} ريال
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                      ⏰ {meal.delivery_time}
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: meal.meal_type === 'breakfast' ? '#fef3c7' : 
                                 meal.meal_type === 'lunch' ? '#dbeafe' : '#f3e8ff',
                      color: meal.meal_type === 'breakfast' ? '#92400e' : 
                             meal.meal_type === 'lunch' ? '#1e40af' : '#7c3aed'
                    }}>
                      {meal.meal_type === 'breakfast' ? 'فطور' : 
                       meal.meal_type === 'lunch' ? 'غداء' : 'عشاء'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleSubscribe(meal)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                      color: 'white',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
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
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'rgb(79 70 229)'
            }}>
              تسجيل الدخول مطلوب
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: 'rgb(75 85 99)', 
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              للاشتراك في الوجبات، يرجى تسجيل الدخول أولاً
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLoginPopup(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgb(156 163 175)',
                  background: 'white',
                  color: 'rgb(75 85 99)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                  color: 'white',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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

