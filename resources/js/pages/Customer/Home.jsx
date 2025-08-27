import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { restaurantsAPI } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  // Redirect users based on their role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/seller');
      }
    }
  }, [isAuthenticated, user, navigate]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured restaurants from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantsAPI.getAll();
        if (response.data.success) {
          // Take first 3 restaurants as featured
          const restaurants = response.data.data.slice(0, 3).map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            rating: (4.5 + Math.random() * 0.5).toFixed(1), // Random rating between 4.5-5.0, fixed to 1 decimal
            deliveryTime: language === 'ar' ? "30-45 دقيقة" : "30-45 min",
            image: restaurant.logo || "🍽️",
            description: restaurant.description
          }));
          setFeaturedRestaurants(restaurants);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Fallback to static data if API fails
        setFeaturedRestaurants([
          {
            id: 1,
            name: language === 'ar' ? "مطعم الشرق الأوسط" : "Middle East Restaurant",
            rating: "4.8",
            deliveryTime: language === 'ar' ? "30-45 دقيقة" : "30-45 min",
            image: "🍽️",
            description: language === 'ar' ? "أفضل المأكولات الشرقية التقليدية" : "Best traditional Eastern cuisine"
          },
          {
            id: 2,
            name: language === 'ar' ? "بيتزا إيطاليا" : "Pizza Italia",
            rating: "4.6",
            deliveryTime: language === 'ar' ? "25-40 دقيقة" : "25-40 min",
            image: "🍕",
            description: language === 'ar' ? "بيتزا إيطالية أصيلة بأفضل المكونات" : "Authentic Italian pizza with the best ingredients"
          },
          {
            id: 3,
            name: language === 'ar' ? "سوشي اليابان" : "Sushi Japan",
            rating: "4.9",
            deliveryTime: language === 'ar' ? "35-50 دقيقة" : "35-50 min",
            image: "🍣",
            description: language === 'ar' ? "سوشي طازج ومأكولات يابانية أصيلة" : "Fresh sushi and authentic Japanese cuisine"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [language]);

    return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="section-enhanced" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 0 3rem 0'
      }}>
        {/* Floating decorative elements */}
        <div className="floating-elements">
          <div className="floating-element" style={{
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div className="floating-element" style={{
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div className="floating-element" style={{
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
                    </div>
                    
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center', gap: '3rem', position: 'relative', zIndex: 1 }}>
            <div className="hero-text" style={{ textAlign: 'center' }}>
              <div className="hero-badge" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '9999px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                color: 'rgb(67 56 202)',
                marginBottom: '1.5rem'
              }}>
                🎉 {t('discountBadge')}
                                    </div>
              <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '1.5rem' }}>
                {t('heroTitle')}
                <span className="gradient-text" style={{ display: 'block' }}>{t('heroSubtitle')}</span>
              </h1>
              <p style={{ marginTop: '1rem', color: 'rgb(75 85 99)', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: '1.7' }}>
                {t('heroDescription')}
              </p>
              <div className="hero-buttons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="/restaurants" className="hero-btn hero-btn-primary">
                  🚀 {t('getStarted')}
                </a>
                <a href="#features" className="hero-btn hero-btn-outline">
                  ✨ {t('learnMore')}
                </a>
                                </div>
                            </div>
            <div className="float-animation">
              <div className="gradient-border">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'rgb(156 163 175)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  minHeight: '300px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'rgb(79 70 229)' }}>{t('designPreview')}</div>
                    <div style={{ fontSize: '1rem', color: 'rgb(107 114 128)', marginTop: '0.5rem' }}>{t('designDescription')}</div>
                  </div>
                    </div>
                </div>
            </div>
          </div>
                </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-enhanced" style={{ padding: '3rem 0' }}>
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1rem' }}>
              {t('whySubscribe')}
                        </h2>
            <p style={{ fontSize: '1.125rem', color: 'rgb(75 85 99)', maxWidth: '600px', margin: '0 auto' }}>
              {t('featuresDescription')}
                        </p>
                    </div>
          <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="card card-hover" style={{ height: '100%', textAlign: 'center' }}>
              <div className="feature-icon" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'rgb(79 70 229)' }}>{t('diverseMeals')}</h3>
              <p style={{ fontSize: '1rem', color: 'rgb(75 85 99)', lineHeight: '1.7' }}>{t('diverseMealsDesc')}</p>
                            </div>
            <div className="card card-hover" style={{ height: '100%', textAlign: 'center' }}>
              <div className="feature-icon" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏰</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'rgb(79 70 229)' }}>{t('fixedDelivery')}</h3>
              <p style={{ fontSize: '1rem', color: 'rgb(75 85 99)', lineHeight: '1.7' }}>{t('fixedDeliveryDesc')}</p>
                            </div>
            <div className="card card-hover" style={{ height: '100%', textAlign: 'center' }}>
              <div className="feature-icon" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💳</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'rgb(79 70 229)' }}>{t('securePayment')}</h3>
              <p style={{ fontSize: '1rem', color: 'rgb(75 85 99)', lineHeight: '1.7' }}>{t('securePaymentDesc')}</p>
                            </div>
                            </div>
                        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section id="restaurants" className="section-enhanced" style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '3rem 0'
      }}>
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1rem' }}>
              {t('featuredRestaurants')}
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'rgb(75 85 99)', maxWidth: '600px', margin: '0 auto' }}>
              {t('restaurantsDescription')}
            </p>
                                    </div>
                                    
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(229, 231, 235, 0.3)',
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Animated loading icon */}
                  <div style={{ 
                    fontSize: '3.5rem', 
                    marginBottom: '1.5rem',
                    animation: 'pulse 2s infinite'
                  }}>
                    🍽️
                  </div>
                  
                  {/* Loading text */}
                  <div style={{ 
                    color: 'rgb(79 70 229)', 
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                  
                  {/* Loading dots */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.25rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgb(79 70 229)',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '0s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgb(79 70 229)',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '0.16s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgb(79 70 229)',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: '0.32s'
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
              featuredRestaurants.map((restaurant) => (
              <div key={restaurant.id} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(229, 231, 235, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '400px' // Fixed height for consistency
              }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)';
              }}
              >
                {/* Header Section - Icon and Name */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  flex: '0 0 auto'
                }}>
                  {/* Restaurant Icon */}
                  <div style={{ 
                    fontSize: '3.5rem', 
                    marginBottom: '1.25rem',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '4rem'
                  }}>
                    {restaurant.image}
                  </div>
                  
                  {/* Restaurant Name */}
                  <h3 style={{ 
                    fontSize: '1.375rem', 
                    fontWeight: '700', 
                    color: 'rgb(79 70 229)', 
                    marginBottom: '0.75rem',
                    lineHeight: '1.3',
                    minHeight: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {restaurant.name}
                  </h3>
                </div>
                
                {/* Content Section - Description */}
                <div style={{ 
                  flex: '1 1 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  {/* Restaurant Description */}
                  <p style={{ 
                    fontSize: '0.95rem', 
                    color: 'rgb(75 85 99)', 
                    lineHeight: '1.6',
                    marginBottom: '0',
                    textAlign: 'center',
                    minHeight: '3.2em',
                    maxHeight: '3.2em',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {restaurant.description}
                  </p>
                </div>
                
                {/* Footer Section - Rating, Delivery Time, and Button */}
                <div style={{ 
                  flex: '0 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {/* Rating and Delivery Time */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.75rem 1rem',
                    background: 'rgba(79, 70, 229, 0.05)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(79, 70, 229, 0.1)',
                    minHeight: '3rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      flex: '1'
                    }}>
                      <span style={{ color: 'rgb(34 197 94)', fontSize: '1.1rem' }}>⭐</span>
                      <span style={{ fontWeight: '600', color: 'rgb(79 70 229)' }}>
                        {restaurant.rating}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: 'rgb(75 85 99)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flex: '1',
                      justifyContent: 'flex-end'
                    }}>
                      <span style={{ fontSize: '1rem' }}>⏰</span>
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                  
                  {/* Subscribe Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurants/${restaurant.id}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '0.75rem',
                      background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                      color: 'white',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '3rem'
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
                    {t('subscribe')}
                  </button>
                </div>
              </div>
                            ))
            )}
                        </div>

          <div style={{ textAlign: 'center' }}>
            <a href="/restaurants" className="feature-btn feature-btn-primary">
              🍕 {t('viewAllRestaurants')}
            </a>
                    </div>
                </div>
      </section>

      {/* How it works Section */}
      <section id="how" className="section-enhanced" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        padding: '3rem 0'
      }}>
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1rem' }}>
              {t('howItWorks')}
                        </h2>
            <p style={{ fontSize: '1.125rem', color: 'rgb(75 85 99)', maxWidth: '600px', margin: '0 auto' }}>
              {t('howItWorksDesc')}
                        </p>
                    </div>
          <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              t('step1'),
              t('step2'),
              t('step3'),
              t('step4'),
            ].map((step, i) => (
              <li key={i} className="card card-hover">
                <div className="step-number">{i+1}</div>
                <p style={{ fontSize: '1rem', color: 'rgb(75 85 99)', lineHeight: '1.7' }}>{step}</p>
              </li>
            ))}
          </ol>
                    </div>
      </section>

      {/* Footer */}
      <footer className="section footer-enhanced" style={{ padding: '2rem 0' }}>
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', fontSize: '1rem', color: 'rgb(107 114 128)' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>© {new Date().getFullYear()} {t('copyright')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <a 
                href="https://maksab.om/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-link" 
                style={{ 
                  color: '#3b82f6', 
                  textDecoration: 'underline',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#3b82f6';
                }}
              >
                {t('poweredBy')} ↗
              </a>
            </div>
            </div>
        </div>
      </footer>
        </div>


    );
};

export default Home;
