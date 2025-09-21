import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { restaurantsAPI } from '../../services/api';


const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  // Add mobile-specific styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .restaurants-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
          padding: 0 1rem !important;
          margin: 0 auto 2rem auto !important;
        }
        .restaurant-card-enhanced {
          height: 520px !important;
          margin: 0 !important;
          width: 100% !important;
        }
        .restaurant-image-section {
          height: 300px !important;
          border-radius: 0.75rem 0.75rem 0 0 !important;
          overflow: visible !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .restaurant-title {
          font-size: 1.25rem !important;
          margin-bottom: 0.1rem !important;
        }
        .restaurant-description {
          font-size: 0.85rem !important;
          padding: 0.25rem !important;
        }
        .restaurant-button {
          padding: 1rem !important;
          font-size: 1rem !important;
          min-height: 3.5rem !important;
          line-height: 1.2 !important;
        }
        .section-enhanced {
          padding: 2rem 0 !important;
        }
        .restaurants-grid {
          max-width: 100% !important;
        }
        .restaurant-image-section img {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          border-radius: 0.75rem 0.75rem 0 0 !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          padding: 10px !important;
        }
      }
      @media (max-width: 480px) {
        .restaurants-grid {
          padding: 0 0.5rem !important;
          gap: 0.75rem !important;
        }
        .restaurant-card-enhanced {
          height: 490px !important;
          margin: 0 !important;
        }
        .restaurant-image-section {
          height: 280px !important;
          border-radius: 0.75rem 0.75rem 0 0 !important;
          overflow: visible !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .restaurant-title {
          font-size: 1.125rem !important;
          margin-bottom: 0.1rem !important;
        }
        .restaurant-description {
          font-size: 0.8rem !important;
          min-height: 2.4em !important;
          max-height: 2.4em !important;
          padding: 0.25rem !important;
        }
        .restaurant-button {
          padding: 1rem !important;
          font-size: 0.95rem !important;
          min-height: 3.25rem !important;
          line-height: 1.2 !important;
        }
        .section-enhanced {
          padding: 1.5rem 0 !important;
        }
        .restaurants-grid {
          max-width: 100% !important;
        }
        .restaurant-image-section img {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          border-radius: 0.75rem 0.75rem 0 0 !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          padding: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          // Filter restaurants that have logos and take first 3
          const restaurantsWithLogos = response.data.data.filter(restaurant => restaurant.logo);
          const featuredRestaurants = restaurantsWithLogos.slice(0, 3).map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            rating: (4.5 + Math.random() * 0.5).toFixed(1), // Random rating between 4.5-5.0, fixed to 1 decimal
            deliveryTime: language === 'ar' ? "30-45 دقيقة" : "30-45 min",
            image: `/storage/${restaurant.logo}`,
            description: restaurant.description
          }));
          
          // If we don't have enough restaurants with logos, fill with restaurants without logos
          if (featuredRestaurants.length < 3) {
            const remainingRestaurants = response.data.data
              .filter(restaurant => !restaurant.logo)
              .slice(0, 3 - featuredRestaurants.length)
              .map(restaurant => ({
                id: restaurant.id,
                name: restaurant.name,
                rating: (4.5 + Math.random() * 0.5).toFixed(1),
                deliveryTime: language === 'ar' ? "30-45 دقيقة" : "30-45 min",
                image: "🍽️",
                description: restaurant.description
              }));
            featuredRestaurants.push(...remainingRestaurants);
          }
          
          setFeaturedRestaurants(featuredRestaurants);
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
    <div style={{ 
      minHeight: '100vh',
      position: 'relative',
      background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
    }}>
      {/* Hero Section */}
      <section className="hero-section-enhanced section-enhanced" style={{ 
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 0 3rem 0',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1
      }}>
        {/* Floating decorative elements */}
        <div className="floating-elements">
          <div className="floating-element" style={{
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(74, 117, 124, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.background = 'radial-gradient(circle, rgba(74, 117, 124, 0.2) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(74, 117, 124, 0.1) 0%, transparent 70%)';
          }}></div>
          <div className="floating-element" style={{
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(186, 108, 93, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.background = 'radial-gradient(circle, rgba(186, 108, 93, 0.15) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(186, 108, 93, 0.08) 0%, transparent 70%)';
          }}></div>
          <div className="floating-element" style={{
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(74, 117, 124, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.background = 'radial-gradient(circle, rgba(74, 117, 124, 0.12) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(74, 117, 124, 0.06) 0%, transparent 70%)';
          }}></div>
          
          {/* Additional Food-themed floating elements */}
          <div className="floating-element" style={{
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite 1s',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.3)';
            e.target.style.background = 'radial-gradient(circle, rgba(255, 107, 107, 0.2) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)';
          }}></div>
          <div className="floating-element" style={{
            width: '90px',
            height: '90px',
            background: 'radial-gradient(circle, rgba(255, 167, 38, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite 2s',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.3)';
            e.target.style.background = 'radial-gradient(circle, rgba(255, 167, 38, 0.15) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(255, 167, 38, 0.08) 0%, transparent 70%)';
          }}></div>
          <div className="floating-element" style={{
            width: '70px',
            height: '70px',
            background: 'radial-gradient(circle, rgba(102, 187, 106, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite 3s',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.3)';
            e.target.style.background = 'radial-gradient(circle, rgba(102, 187, 106, 0.2) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(102, 187, 106, 0.1) 0%, transparent 70%)';
          }}></div>
                    </div>
                    
        <div style={{ 
          width: '100%', 
          padding: '0 2rem',
          position: 'relative',
          zIndex: '1'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            alignItems: 'center', 
            gap: '3rem', 
            position: 'relative', 
            zIndex: 1,
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div className="hero-text" style={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: '2'
            }}>
              <div className="hero-badge" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '9999px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                color: 'white',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                border: '1px solid rgba(74, 117, 124, 0.3)',
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s ease-in-out infinite',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(74, 117, 124, 0.3)',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.background = 'linear-gradient(135deg, #5a8a8f 0%, #c87a6a 100%)';
                e.target.style.boxShadow = '0 6px 20px rgba(74, 117, 124, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.background = 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)';
                e.target.style.boxShadow = '0 4px 15px rgba(74, 117, 124, 0.3)';
              }}>
                🎉 {t('discountBadge')}
                                    </div>
              <h1 className="hero-title" style={{ 
                fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                fontWeight: 'bold', 
                lineHeight: '1.2', 
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                {t('heroTitle')}
                </span>
                <span className="gradient-text" style={{ 
                  display: 'block',
                  background: 'linear-gradient(135deg, #b65449 0%, #c86a5a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '0.8em',
                  opacity: '0.9'
                }}>
                  {t('heroSubtitle')}
                </span>
              </h1>
              <p style={{ 
                marginTop: '1rem', 
                color: 'rgb(75 85 99)', 
                marginBottom: '2rem', 
                fontSize: '1.125rem', 
                lineHeight: '1.7',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}>
                {t('heroDescription')}
              </p>
              <div className="hero-buttons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="/restaurants" className="hero-btn hero-btn-primary liquid-button" style={{
                  position: 'relative',
                  overflow: 'hidden',
                  border: 'none',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}>
                  <span style={{ position: 'relative', zIndex: '1' }}>🚀 {t('getStarted')}</span>
                </a>
                <a href="#features" className="hero-btn hero-btn-outline" style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid #2f6e73',
                  color: '#2f6e73',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(47, 110, 115, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}>
                  <span style={{ position: 'relative', zIndex: '1' }}>✨ {t('learnMore')}</span>
                </a>
                                </div>
                            </div>
            <div className="float-animation" style={{
              position: 'relative',
              zIndex: '2'
            }}>
              {/* Meal Image */}
              <div style={{
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}>
                <img 
                  src="/images/اشترك-وجبة-عمل (2).png" 
                  alt="وجبة عمل" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '0.75rem'
                  }}
                />
              </div>
            </div>
          </div>
                </div>
      </section>

              {/* Features Section */}
        <section id="features" className="section-enhanced" style={{ 
          padding: '3rem 0',
          position: 'relative',
          zIndex: 1
        }}>
        <div style={{ width: '100%', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="gradient-text neon-text" style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              textAlign: 'center',
              letterSpacing: '0.5px',
              textShadow: '0 0 20px rgba(47, 110, 115, 0.5)'
            }}>
              {t('whySubscribe')}
                        </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'rgb(75 85 99)', 
              maxWidth: '600px', 
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1rem',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {t('featuresDescription')}
                        </p>
                    </div>
                      <div className="grid-responsive" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <div className="card card-hover restaurant-card-enhanced" style={{ 
                height: '100%', 
                textAlign: 'center',
                padding: '2rem',
                cursor: 'pointer'
              }}>
                <div className="feature-icon" style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1) rotate(5deg)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                }}>🍽️</div>
                <h3 className="gradient-text" style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem'
                }}>{t('diverseMeals')}</h3>
              <p style={{ 
                fontSize: '1rem', 
                color: 'rgb(75 85 99)', 
                lineHeight: '1.7',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                e.target.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}>{t('diverseMealsDesc')}</p>
                            </div>
                          <div className="card card-hover restaurant-card-enhanced" style={{ 
                height: '100%', 
                textAlign: 'center',
                padding: '2rem',
                cursor: 'pointer'
              }}>
                <div className="feature-icon" style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #54a0ff, #2e86de)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(84, 160, 255, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite 0.5s',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1) rotate(5deg)';
                  e.target.style.boxShadow = '0 8px 25px rgba(84, 160, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.boxShadow = '0 4px 15px rgba(84, 160, 255, 0.3)';
                }}>⏰</div>
                <h3 className="gradient-text" style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem'
                }}>{t('fixedDelivery')}</h3>
                              <p style={{ 
                  fontSize: '1rem', 
                  color: 'rgb(75 85 99)', 
                  lineHeight: '1.7',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                  e.target.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}>{t('fixedDeliveryDesc')}</p>
                            </div>
                          <div className="card card-hover restaurant-card-enhanced" style={{ 
                height: '100%', 
                textAlign: 'center',
                padding: '2rem',
                cursor: 'pointer'
              }}>
                <div className="feature-icon" style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #66bb6a, #4caf50)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(102, 187, 106, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite 1s',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1) rotate(5deg)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 187, 106, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 187, 106, 0.3)';
                }}>💳</div>
                <h3 className="gradient-text" style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem'
                }}>{t('securePayment')}</h3>
                              <p style={{ 
                  fontSize: '1rem', 
                  color: 'rgb(75 85 99)', 
                  lineHeight: '1.7',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                  e.target.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}>{t('securePaymentDesc')}</p>
                            </div>
                            </div>
                        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section id="restaurants" className="section-enhanced" style={{ 
        padding: '3rem 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          width: '100%', 
          padding: '0 2rem',
          '@media (max-width: 768px)': {
            padding: '0 1rem'
          },
          '@media (max-width: 480px)': {
            padding: '0 0.5rem'
          }
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="gradient-text neon-text" style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              textAlign: 'center',
              letterSpacing: '0.5px',
              textShadow: '0 0 20px rgba(79, 70, 229, 0.5)'
            }}>
              {t('featuredRestaurants')}
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'rgb(75 85 99)', maxWidth: '600px', margin: '0 auto' }}>
              {t('restaurantsDescription')}
            </p>
                                    </div>
                                    
           <div className="restaurants-grid" style={{ 
             display: 'grid', 
             gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
             gap: '2rem',
             marginBottom: '3rem',
             maxWidth: '1200px',
             margin: '0 auto 3rem auto',
             width: '100%'
           }}>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="loading-state-enhanced" style={{
                  padding: '2rem',
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
                  <div className="loading-dots" style={{ 
                    marginTop: '0.5rem'
                  }}>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              ))
            ) : (
               featuredRestaurants.map((restaurant) => (
               <div key={restaurant.id} className="restaurant-card-enhanced" style={{
                 padding: '0',
                 cursor: 'pointer',
                 position: 'relative',
                 overflow: 'hidden',
                 display: 'flex',
                 flexDirection: 'column',
                 height: '420px', // Increased height for better image display
                 borderRadius: '1rem',
                 boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                 transition: 'all 0.3s ease',
                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255, 255, 255, 0.2)',
                 // Mobile responsive styles
                 '@media (max-width: 768px)': {
                   height: '380px',
                   margin: '0 0.5rem',
                   borderRadius: '0.75rem'
                 },
                 '@media (max-width: 480px)': {
                   height: '360px',
                   margin: '0 0.25rem'
                 }
               }}
               onClick={() => navigate(`/restaurants/${restaurant.id}`)}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-5px)';
                 e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
               }}
               >
                 {/* Restaurant Image Section - Much larger and more prominent */}
                 <div className="restaurant-image-section" style={{
                   position: 'relative',
                   height: '200px', // Much larger image area
                   overflow: 'visible',
                   background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   // Mobile responsive image height
                   '@media (max-width: 768px)': {
                     height: '180px'
                   },
                   '@media (max-width: 480px)': {
                     height: '160px'
                   }
                 }}>
                   {restaurant.image && restaurant.image.startsWith('/storage/') ? (
                     <img
                       src={restaurant.image}
                       alt={restaurant.name}
                       style={{
                         maxWidth: '100%',
                         maxHeight: '100%',
                         width: 'auto',
                         height: 'auto',
                         objectFit: 'contain',
                         transition: 'transform 0.3s ease',
                         borderRadius: '0.75rem 0.75rem 0 0',
                         backgroundColor: 'rgba(255, 255, 255, 0.1)',
                         padding: '10px'
                       }}
                       onMouseEnter={(e) => {
                         e.target.style.transform = 'scale(1.05)';
                       }}
                       onMouseLeave={(e) => {
                         e.target.style.transform = 'scale(1)';
                       }}
                       onLoad={(e) => {
                         e.target.style.display = 'block';
                         e.target.nextSibling.style.display = 'none';
                       }}
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }}
                     />
                   ) : null}
                   <div style={{
                     position: 'absolute',
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     display: restaurant.image && restaurant.image.startsWith('/storage/') ? 'none' : 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '7rem',
                     color: 'white',
                     background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
                   }}>
                     {restaurant.image || '🍽️'}
                   </div>

                   {/* Overlay gradient for better text readability */}
                   <div style={{
                     position: 'absolute',
                     bottom: 0,
                     left: 0,
                     right: 0,
                     height: '60px',
                     background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))'
                   }}></div>
                 </div>

                 {/* Content Section */}
                 <div style={{
                   padding: '1.5rem',
                   flex: 1,
                   display: 'flex',
                   flexDirection: 'column',
                   justifyContent: 'space-between'
                 }}>
                   {/* Restaurant Name */}
                   <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
                     <h3 className="gradient-text restaurant-title" style={{
                       fontSize: '1.5rem',
                       fontWeight: '700',
                       marginBottom: '0.1rem',
                       lineHeight: '1.3',
                       textAlign: 'center',
                       background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                       backgroundClip: 'text',
                       textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                       // Mobile responsive text
                       '@media (max-width: 768px)': {
                         fontSize: '1.25rem'
                       },
                       '@media (max-width: 480px)': {
                         fontSize: '1.125rem'
                       }
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
                     marginBottom: '0.25rem'
                   }}>
                     {/* Restaurant Description */}
                     <p className="restaurant-description" style={{
                       fontSize: '0.9rem',
                       color: 'rgb(75 85 99)',
                       lineHeight: '1.6',
                       marginBottom: '0',
                       textAlign: 'center',
                       minHeight: '2.8em',
                       maxHeight: '2.8em',
                       overflow: 'hidden',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       background: 'rgba(255, 255, 255, 0.1)',
                       padding: '0.5rem',
                       borderRadius: '0.5rem',
                       backdropFilter: 'blur(5px)',
                       border: '1px solid rgba(255, 255, 255, 0.2)',
                       transition: 'all 0.3s ease',
                       // Mobile responsive text
                       '@media (max-width: 768px)': {
                         fontSize: '0.85rem',
                         padding: '0.25rem'
                       },
                       '@media (max-width: 480px)': {
                         fontSize: '0.8rem',
                         minHeight: '2.4em',
                         maxHeight: '2.4em'
                       }
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                       e.target.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                       e.target.style.transform = 'scale(1.02)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                       e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                       e.target.style.transform = 'scale(1)';
                     }}>
                       {restaurant.description}
                     </p>
                   </div>

                   {/* Footer Section - Subscribe Button */}
                   <div style={{
                     flex: '0 0 auto',
                     display: 'flex',
                     flexDirection: 'column'
                   }}>
                     {/* Subscribe Button */}
                     <button
                       className="liquid-button restaurant-button"
                       onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/restaurants/${restaurant.id}`);
                       }}
                       style={{
                         width: '100%',
                         padding: '1.25rem',
                         borderRadius: '0.75rem',
                         color: 'white',
                         border: 'none',
                         fontSize: '1.1rem',
                         fontWeight: '600',
                         cursor: 'pointer',
                         position: 'relative',
                         overflow: 'hidden',
                         minHeight: '4rem',
                         background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                         boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                         transition: 'all 0.3s ease',
                         lineHeight: '1.2',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center'
                       }}
                       onMouseEnter={(e) => {
                         e.target.style.transform = 'translateY(-2px)';
                         e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                       }}
                       onMouseLeave={(e) => {
                         e.target.style.transform = 'translateY(0)';
                         e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                       }}
                     >
                       {t('subscribe')}
                     </button>
                   </div>
                 </div>
               </div>
                            ))
            )}
                        </div>

          <div style={{ textAlign: 'center' }}>
            <a href="/restaurants" className="feature-btn feature-btn-primary liquid-button">
              🍕 {t('viewAllRestaurants')}
            </a>
                    </div>
                </div>
      </section>

      {/* How it works Section */}
      <section id="how" className="section-enhanced" style={{ 
        padding: '4rem 0',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          opacity: '0.05',
          background: 'radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <div style={{ width: '100%', padding: '0 2rem', position: 'relative', zIndex: '1' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>

            <h2 className="gradient-text neon-text" style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              textAlign: 'center',
              letterSpacing: '0.5px',
              textShadow: '0 0 20px rgba(79, 70, 229, 0.5)'
            }}>
              {t('howItWorks')}
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgb(75 85 99)', 
              maxWidth: '700px', 
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              {t('howItWorksDesc')}
            </p>
          </div>

          {/* Enhanced Steps Grid - Smaller Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative'
          }}>
            {/* Connection lines between cards */}
            <div className="connection-line" style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.2), transparent)',
              transform: 'translateY(-50%)',
              zIndex: '0'
            }}></div>

            {[
                      { step: t('step1'), icon: '👤', color: 'from-teal-500 to-teal-600', delay: '0s', title: t('step1Title') },
        { step: t('step2'), icon: '🍽️', color: 'from-red-500 to-red-600', delay: '0.1s', title: t('step2Title') },
              { step: t('step3'), icon: '📅', color: 'from-green-500 to-emerald-600', delay: '0.2s', title: t('step3Title') },
              { step: t('step4'), icon: '💳', color: 'from-orange-500 to-red-600', delay: '0.3s', title: t('step4Title') },
            ].map((item, i) => (
              <div key={i} style={{
                position: 'relative',
                zIndex: '1',
                animation: `fadeInUp 0.6s ease-out ${item.delay} both`
              }}>
                <div className="card card-hover step-card subscription-card-enhanced" style={{
                  padding: '2rem 1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                  minHeight: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  
                  {/* Step number with enhanced design - Smaller */}
                  <div className="step-icon" style={{
                    position: 'relative',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color.split(' ')[0].replace('from-', '')} 0%, ${item.color.split(' ')[1].replace('to-', '')} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      margin: '0 auto',
                      boxShadow: `0 8px 25px rgba(79, 70, 229, 0.3)`,
                      position: 'relative',
                      zIndex: '2',
                      transition: 'all 0.3s ease'
                    }}>
                      {item.icon}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color.split(' ')[0].replace('from-', '')} 0%, ${item.color.split(' ')[1].replace('to-', '')} 100%)`,
                      opacity: '0.2',
                      zIndex: '1',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}></div>
                  </div>

                  {/* Step number badge - Smaller */}
                  <div className="step-number-badge" style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(47, 110, 115, 0.4)',
                    border: '2px solid white',
                    transition: 'all 0.3s ease'
                  }}>
                    {i + 1}
                  </div>

                  {/* Step content */}
                  <div style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <h3 className="gradient-text" style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      marginBottom: '0.75rem',
                      lineHeight: '1.3'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgb(75 85 99)',
                      lineHeight: '1.5',
                      fontWeight: '500',
                      maxWidth: '180px'
                    }}>
                      {item.step}
                    </p>
                  </div>

                  {/* Decorative elements */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '3px',
                    background: `linear-gradient(90deg, ${item.color.split(' ')[0].replace('from-', '')} 0%, ${item.color.split(' ')[1].replace('to-', '')} 100%)`,
                    borderRadius: '1.5rem 1.5rem 0 0'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '4rem',
            animation: 'fadeInUp 0.6s ease-out 0.4s both'
          }}>
            <a href="/restaurants" className="liquid-button" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.5rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              borderRadius: '1rem',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span>🚀</span>
              <span>{t('getStarted')}</span>
            </a>
          </div>
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
