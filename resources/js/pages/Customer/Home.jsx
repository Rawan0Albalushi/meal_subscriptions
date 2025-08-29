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
    <div style={{ 
      minHeight: '100vh',
      position: 'relative',
      background: 'transparent'
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
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.background = 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)';
          }}></div>
          <div className="floating-element" style={{
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.background = 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)';
          }}></div>
          <div className="floating-element" style={{
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
            e.target.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)';
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
                color: 'rgb(67 56 202)',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s ease-in-out infinite',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)';
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
                  background: 'linear-gradient(135deg, rgb(79 70 229) 0%, rgb(99 102 241) 100%)',
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
                  background: 'linear-gradient(135deg, rgb(139 92 246) 0%, rgb(168 85 247) 100%)',
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
                  border: '2px solid rgb(79 70 229)',
                  color: 'rgb(79 70 229)',
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
                  e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.2)';
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
              <div className="gradient-border" style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(168, 85, 247, 0.15) 100%)',
                borderRadius: '2.5rem',
                padding: '4px',
                boxShadow: '0 15px 50px rgba(79, 70, 229, 0.25), 0 8px 25px rgba(139, 92, 246, 0.15)',
                animation: 'pulse 4s ease-in-out infinite'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'rgb(156 163 175)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  minHeight: '400px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Food Images Grid */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: '1rem',
                    padding: '2rem',
                    opacity: '0.15',
                    zIndex: '1'
                  }}>
                                         {/* Food Image 1 - Pasta */}
                     <div style={{
                       background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                       animation: 'float 3s ease-in-out infinite',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                     }}>
                       🍝
                  </div>
                    
                                         {/* Food Image 2 - Pizza */}
                     <div style={{
                       background: 'linear-gradient(135deg, #ff9ff3, #f368e0)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(255, 159, 243, 0.3)',
                       animation: 'float 3s ease-in-out infinite 0.5s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(255, 159, 243, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(255, 159, 243, 0.3)';
                     }}>
                       🍕
                    </div>
                    
                                         {/* Food Image 3 - Sushi */}
                     <div style={{
                       background: 'linear-gradient(135deg, #54a0ff, #2e86de)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(84, 160, 255, 0.3)',
                       animation: 'float 3s ease-in-out infinite 1s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(84, 160, 255, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(84, 160, 255, 0.3)';
                     }}>
                       🍣
                </div>
                    
                                         {/* Food Image 4 - Burger */}
                     <div style={{
                       background: 'linear-gradient(135deg, #ffa726, #ff9800)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(255, 167, 38, 0.3)',
                       animation: 'float 3s ease-in-out infinite 1.5s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(255, 167, 38, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(255, 167, 38, 0.3)';
                     }}>
                       🍔
            </div>
                     
                     {/* Food Image 5 - Salad */}
                     <div style={{
                       background: 'linear-gradient(135deg, #66bb6a, #4caf50)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(102, 187, 106, 0.3)',
                       animation: 'float 3s ease-in-out infinite 2s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(102, 187, 106, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(102, 187, 106, 0.3)';
                     }}>
                       🥗
                     </div>
                     
                     {/* Food Image 6 - Dessert */}
                     <div style={{
                       background: 'linear-gradient(135deg, #ab47bc, #8e24aa)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(171, 71, 188, 0.3)',
                       animation: 'float 3s ease-in-out infinite 2.5s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(171, 71, 188, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(171, 71, 188, 0.3)';
                     }}>
                       🍰
                     </div>
                     
                     {/* Food Image 7 - Coffee */}
                     <div style={{
                       background: 'linear-gradient(135deg, #8d6e63, #6d4c41)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(141, 110, 99, 0.3)',
                       animation: 'float 3s ease-in-out infinite 3s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(141, 110, 99, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(141, 110, 99, 0.3)';
                     }}>
                       ☕
                     </div>
                     
                     {/* Food Image 8 - Rice */}
                     <div style={{
                       background: 'linear-gradient(135deg, #ffd54f, #ffc107)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(255, 213, 79, 0.3)',
                       animation: 'float 3s ease-in-out infinite 3.5s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(255, 213, 79, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(255, 213, 79, 0.3)';
                     }}>
                       🍚
                     </div>
                     
                     {/* Food Image 9 - Fish */}
                     <div style={{
                       background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '2rem',
                       boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
                       animation: 'float 3s ease-in-out infinite 4s',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.2) translateY(-5px)';
                       e.target.style.boxShadow = '0 8px 25px rgba(79, 195, 247, 0.5)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) translateY(0px)';
                       e.target.style.boxShadow = '0 4px 15px rgba(79, 195, 247, 0.3)';
                     }}>
                       🐟
                     </div>
                  </div>
                  
                  {/* Main Content */}
                  <div style={{ 
                    textAlign: 'center', 
                    position: 'relative', 
                    zIndex: '2',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                    borderRadius: '2.5rem',
                    padding: '2.5rem',
                    backdropFilter: 'blur(25px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(79, 70, 229, 0.1)',
                    overflow: 'hidden'
                  }}>
                    {/* Subtle Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      background: 'radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
                      zIndex: '0'
                    }}></div>
                                         {/* Enhanced Food Image */}
                     <div style={{
                       width: '150px',
                       height: '150px',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       margin: '0 auto 1.5rem',
                       boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                       animation: 'pulse 3s ease-in-out infinite',
                       cursor: 'pointer',
                       transition: 'all 0.4s ease',
                       position: 'relative',
                       overflow: 'hidden',
                       border: '4px solid rgba(255, 255, 255, 0.4)',
                       background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 20%, #ffa726 40%, #ffd54f 60%, #66bb6a 80%, #4fc3f7 100%)'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'scale(1.15) rotate(8deg)';
                       e.target.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.6)';
                       e.target.style.border = '4px solid rgba(255, 255, 255, 0.6)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'scale(1) rotate(0deg)';
                       e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
                       e.target.style.border = '4px solid rgba(255, 255, 255, 0.4)';
                     }}>
                       {/* Enhanced Shimmer Effect */}
                       <div style={{
                         position: 'absolute',
                         top: '0',
                         left: '0',
                         right: '0',
                         bottom: '0',
                         background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
                         animation: 'shimmer 3s infinite'
                       }}></div>
                       
                       {/* Radial Gradient Overlay */}
                       <div style={{
                         position: 'absolute',
                         top: '0',
                         left: '0',
                         right: '0',
                         bottom: '0',
                         background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                         zIndex: '1'
                       }}></div>
                       
                       {/* Food Items - Enhanced Layout */}
                       <div style={{
                         position: 'absolute',
                         width: '100%',
                         height: '100%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: '2.5rem',
                         filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                         zIndex: '2'
                       }}>
                         {/* Central Plate - Enhanced */}
                         <div style={{
                           position: 'absolute',
                           top: '50%',
                           left: '50%',
                           transform: 'translate(-50%, -50%)',
                           fontSize: '3.5rem',
                           filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                           zIndex: '5',
                           animation: 'pulse 2s ease-in-out infinite'
                         }}>
                           🍽️
                         </div>
                         
                         {/* Pizza Slice - Enhanced */}
                         <div style={{
                           position: 'absolute',
                           top: '5%',
                           left: '10%',
                           fontSize: '2.8rem',
                           transform: 'rotate(-25deg)',
                           filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                           zIndex: '4',
                           animation: 'float 3s ease-in-out infinite 0.5s'
                         }}>
                           🍕
                         </div>
                         
                         {/* Burger - Enhanced */}
                         <div style={{
                           position: 'absolute',
                           top: '12%',
                           right: '5%',
                           fontSize: '2.5rem',
                           transform: 'rotate(20deg)',
                           filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                           zIndex: '4',
                           animation: 'float 3s ease-in-out infinite 1s'
                         }}>
                           🍔
                         </div>
                         
                         {/* Sushi - Enhanced */}
                         <div style={{
                           position: 'absolute',
                           bottom: '8%',
                           left: '12%',
                           fontSize: '2.2rem',
                           transform: 'rotate(-15deg)',
                           filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                           zIndex: '4',
                           animation: 'float 3s ease-in-out infinite 1.5s'
                         }}>
                           🍣
                         </div>
                         
                         {/* Pasta - Enhanced */}
                         <div style={{
                           position: 'absolute',
                           bottom: '5%',
                           right: '8%',
                           fontSize: '2.6rem',
                           transform: 'rotate(25deg)',
                           filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                           zIndex: '4',
                           animation: 'float 3s ease-in-out infinite 2s'
                         }}>
                           🍝
                         </div>
                         
                         {/* Additional Food Items - Enhanced */}
                         <div style={{
                           position: 'absolute',
                           top: '30%',
                           left: '3%',
                           fontSize: '1.8rem',
                           transform: 'rotate(-8deg)',
                           filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                           zIndex: '3',
                           animation: 'float 4s ease-in-out infinite 0.8s'
                         }}>
                           🥗
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           top: '35%',
                           right: '3%',
                           fontSize: '1.7rem',
                           transform: 'rotate(12deg)',
                           filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                           zIndex: '3',
                           animation: 'float 4s ease-in-out infinite 1.3s'
                         }}>
                           🍰
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           bottom: '30%',
                           left: '5%',
                           fontSize: '1.6rem',
                           transform: 'rotate(-18deg)',
                           filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                           zIndex: '3',
                           animation: 'float 4s ease-in-out infinite 1.8s'
                         }}>
                           ☕
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           bottom: '25%',
                           right: '5%',
                           fontSize: '2rem',
                           transform: 'rotate(18deg)',
                           filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                           zIndex: '3',
                           animation: 'float 4s ease-in-out infinite 2.3s'
                         }}>
                           🍚
                         </div>
                         
                         {/* Enhanced Floating Sparkles */}
                         <div style={{
                           position: 'absolute',
                           top: '2%',
                           left: '50%',
                           transform: 'translateX(-50%)',
                           fontSize: '1.5rem',
                           animation: 'float 2s ease-in-out infinite',
                           zIndex: '6',
                           filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.8))'
                         }}>
                           ✨
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           bottom: '2%',
                           left: '50%',
                           transform: 'translateX(-50%)',
                           fontSize: '1.5rem',
                           animation: 'float 2s ease-in-out infinite 1s',
                           zIndex: '6',
                           filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.8))'
                         }}>
                           ✨
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           top: '50%',
                           left: '2%',
                           transform: 'translateY(-50%)',
                           fontSize: '1.3rem',
                           animation: 'float 2s ease-in-out infinite 0.5s',
                           zIndex: '6',
                           filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.8))'
                         }}>
                           ✨
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           top: '50%',
                           right: '2%',
                           transform: 'translateY(-50%)',
                           fontSize: '1.3rem',
                           animation: 'float 2s ease-in-out infinite 1.5s',
                           zIndex: '6',
                           filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.8))'
                         }}>
                           ✨
                         </div>
                         
                         {/* Additional Sparkles */}
                         <div style={{
                           position: 'absolute',
                           top: '20%',
                           left: '20%',
                           fontSize: '1rem',
                           animation: 'float 3s ease-in-out infinite 0.3s',
                           zIndex: '6',
                           filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.6))'
                         }}>
                           ✨
                         </div>
                         
                         <div style={{
                           position: 'absolute',
                           top: '25%',
                           right: '25%',
                           fontSize: '1.1rem',
                           animation: 'float 3s ease-in-out infinite 0.7s',
                           zIndex: '6',
                           filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.6))'
                         }}>
                           ✨
                         </div>
                       </div>
                     </div>
                                         <div style={{ 
                       fontSize: '1.8rem', 
                       fontWeight: '700', 
                       background: 'linear-gradient(135deg, rgb(79 70 229) 0%, rgb(139 92 246) 50%, rgb(168 85 247) 100%)',
                       backgroundClip: 'text',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                       marginBottom: '0.75rem',
                       textShadow: '0 2px 4px rgba(79, 70, 229, 0.1)',
                       letterSpacing: '0.5px'
                     }}>
                       {t('designPreview')}
                     </div>
                     <div style={{ 
                       fontSize: '1.1rem', 
                       color: 'rgb(75 85 99)',
                       background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                       padding: '0.75rem 1.5rem',
                       borderRadius: '1rem',
                       backdropFilter: 'blur(10px)',
                       border: '1px solid rgba(255, 255, 255, 0.2)',
                       boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                       fontWeight: '500',
                       letterSpacing: '0.3px'
                     }}>
                       {t('designDescription')}
                     </div>
                  </div>
                </div>
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
              textShadow: '0 0 20px rgba(79, 70, 229, 0.5)'
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
        <div style={{ width: '100%', padding: '0 2rem' }}>
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
                                    
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
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
                padding: '1.5rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '320px' // Reduced height to match feature cards
              }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              >
                {/* Header Section - Icon and Name */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  flex: '0 0 auto'
                }}>
                  {/* Restaurant Icon */}
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '3.5rem',
                    animation: 'pulse 2s ease-in-out infinite',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1) rotate(5deg)';
                    e.target.style.filter = 'drop-shadow(0 6px 12px rgba(79, 70, 229, 0.3))';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) rotate(0deg)';
                    e.target.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))';
                  }}>
                    {restaurant.image}
                  </div>
                  
                  {/* Restaurant Name */}
                  <h3 className="gradient-text" style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '0.75rem',
                    lineHeight: '1.3',
                    minHeight: '2rem',
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
                  marginBottom: '1rem'
                }}>
                  {/* Restaurant Description */}
                  <p style={{ 
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
                    className="liquid-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurants/${restaurant.id}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '0.75rem',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '3rem'
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
              { step: t('step1'), icon: '👤', color: 'from-blue-500 to-indigo-600', delay: '0s', title: t('step1Title') },
              { step: t('step2'), icon: '🍽️', color: 'from-purple-500 to-pink-600', delay: '0.1s', title: t('step2Title') },
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
                    background: 'linear-gradient(135deg, rgb(79 70 229) 0%, rgb(139 92 246) 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
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
