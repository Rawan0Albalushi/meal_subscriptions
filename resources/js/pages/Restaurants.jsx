import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI } from '../services/api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantsAPI.getAll();
        if (response.data.success) {
          setRestaurants(response.data.data);
        }
      } catch (error) {
        setError('حدث خطأ في تحميل المطاعم');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      overflowX: 'hidden'
    }}>
      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            المطاعم المتاحة
          </h1>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 3vw, 1.125rem)', 
            color: 'rgb(75 85 99)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            اختر من بين أفضل المطاعم وابدأ رحلتك مع اشتراكات الوجبات
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: 'rgb(75 85 99)' }}>جاري تحميل المطاعم...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            padding: '0 0.5rem'
          }}>
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
              }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: '1rem' }}>{restaurant.logo}</div>
                  <h3 style={{ 
                    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
                    fontWeight: 'bold', 
                    color: 'rgb(79 70 229)', 
                    marginBottom: '0.5rem' 
                  }}>
                    {restaurant.name_ar}
                  </h3>
                  <p style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                    color: 'rgb(107 114 128)',
                    lineHeight: '1.6'
                  }}>{restaurant.description_ar}</p>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                    color: 'rgb(75 85 99)',
                    textAlign: 'center'
                  }}>
                    📍 {restaurant.address_ar}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                    color: 'rgb(75 85 99)',
                    textAlign: 'center'
                  }}>
                    📞 {restaurant.phone}
                  </div>
                </div>
              
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/restaurants/${restaurant.id}`);
                  }}
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
                  عرض التفاصيل
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" style={{
            padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem)',
            borderRadius: '0.75rem',
            border: '1px solid rgb(79 70 229)',
            color: 'rgb(79 70 229)',
            textDecoration: 'none',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgb(79 70 229)';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'rgb(79 70 229)';
            e.target.style.transform = 'translateY(0)';
          }}
          onTouchStart={(e) => {
            e.target.style.transform = 'scale(0.98)';
          }}
          onTouchEnd={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
          >
            ← العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
};

export default Restaurants;
