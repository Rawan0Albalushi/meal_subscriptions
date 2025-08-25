import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI } from '../services/api';

const Restaurants = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantsAPI.getAll();
        if (response.data.success) {
          setRestaurants(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }}>
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
              <a href="/login" style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgb(79 70 229)',
                color: 'rgb(79 70 229)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}>
                تسجيل الدخول
              </a>
              <a href="/" style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}>
                الرئيسية
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            المطاعم المتاحة
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgb(75 85 99)', maxWidth: '600px', margin: '0 auto' }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {restaurants.map((restaurant) => (
              <div 
                key={restaurant.id} 
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{restaurant.logo}</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(79 70 229)', marginBottom: '0.5rem' }}>
                    {restaurant.name_ar}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)' }}>{restaurant.description_ar}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                    📍 {restaurant.address_ar}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
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
                  عرض التفاصيل
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a 
            href="/" 
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgb(79 70 229)',
              color: 'rgb(79 70 229)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s'
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
