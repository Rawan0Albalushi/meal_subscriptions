import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const featuredRestaurants = [
    {
      id: 1,
      name: "مطعم الشرق الأوسط",
      cuisine: "مأكولات شرقية",
      rating: 4.8,
      deliveryTime: "30-45 دقيقة",
      image: "🍽️",
      description: "أفضل المأكولات الشرقية التقليدية"
    },
    {
      id: 2,
      name: "بيتزا إيطاليا",
      cuisine: "بيتزا إيطالية",
      rating: 4.6,
      deliveryTime: "25-40 دقيقة",
      image: "🍕",
      description: "بيتزا إيطالية أصيلة بأفضل المكونات"
    },
    {
      id: 3,
      name: "سوشي اليابان",
      cuisine: "مأكولات يابانية",
      rating: 4.9,
      deliveryTime: "35-50 دقيقة",
      image: "🍣",
      description: "سوشي طازج ومأكولات يابانية أصيلة"
    }
  ];

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
            {featuredRestaurants.map((restaurant) => (
              <div key={restaurant.id} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                border: '1px solid rgba(229, 231, 235, 0.5)'
              }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{restaurant.image}</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(79 70 229)', marginBottom: '0.5rem' }}>
                    {restaurant.name}
                                        </h3>
                  <p style={{ color: 'rgb(75 85 99)', marginBottom: '0.5rem' }}>{restaurant.cuisine}</p>
                  <p style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)' }}>{restaurant.description}</p>
                                        </div>
                                        
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'rgb(34 197 94)' }}>⭐</span>
                    <span style={{ fontWeight: '600' }}>{restaurant.rating}</span>
                                        </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                    ⏰ {restaurant.deliveryTime}
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
                  {t('subscribe')}
                </button>
                                </div>
                            ))}
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
