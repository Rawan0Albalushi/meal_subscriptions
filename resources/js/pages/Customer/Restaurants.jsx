import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const Restaurants = () => {
  const { t, language, dir } = useLanguage();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    locations: '',
    meal_types: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    locations: [], // [{ key, name }]
    meal_types: []
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const navigate = useNavigate();

  // لم نعد نستخدم خريطة أسماء العناوين الثابتة؛ الأسماء تأتي مترجمة من الباكند

  // أسماء أنواع الوجبات حسب اللغة
  const mealTypeNames = {
    ar: {
      'breakfast': 'فطور',
      'lunch': 'غداء',
      'dinner': 'عشاء'
    },
    en: {
      'breakfast': 'Breakfast',
      'lunch': 'Lunch',
      'dinner': 'Dinner'
    }
  };

  // Fallback لأنواع الوجبات فقط عند الحاجة
  const fallbackFilters = {
    meal_types: ['breakfast', 'lunch', 'dinner']
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await restaurantsAPI.getFilters();
        if (response.data.success) {
          const filtersData = response.data.data;
          setAvailableFilters({
            // نستخدم العناصر المترجمة من الباكند [{key,name}]
            locations: filtersData.locations || [],
            meal_types: filtersData.raw_meal_types || fallbackFilters.meal_types
          });
        } else {
          setAvailableFilters({
            locations: [],
            meal_types: fallbackFilters.meal_types
          });
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        setAvailableFilters({
          locations: [],
          meal_types: fallbackFilters.meal_types
        });
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantsAPI.getAll(filters);
        if (response.data.success) {
          setRestaurants(response.data.data);
        }
      } catch (error) {
        setError(t('restaurantsLoadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters, t]);

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      const locationDropdown = document.getElementById('location-dropdown');
      const mealTypeDropdown = document.getElementById('meal-type-dropdown');
      const locationButton = document.getElementById('location-button');
      const mealTypeButton = document.getElementById('meal-type-button');
      
      if (showLocationDropdown && 
          locationDropdown && 
          !locationDropdown.contains(event.target) &&
          locationButton &&
          !locationButton.contains(event.target)) {
        setShowLocationDropdown(false);
      }
      
      if (showMealTypeDropdown && 
          mealTypeDropdown && 
          !mealTypeDropdown.contains(event.target) &&
          mealTypeButton &&
          !mealTypeButton.contains(event.target)) {
        setShowMealTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationDropdown, showMealTypeDropdown]);

  const handleLocationFilter = (location) => {
    console.log('Location selected:', location);
    console.log('Current filters before:', filters);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        locations: prev.locations === location ? '' : location
      };
      console.log('New filters:', newFilters);
      return newFilters;
    });
    setShowLocationDropdown(false);
  };

  const handleMealTypeFilter = (mealType) => {
    console.log('Meal type selected:', mealType);
    console.log('Current filters before:', filters);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        meal_types: prev.meal_types === mealType ? '' : mealType
      };
      console.log('New filters:', newFilters);
      return newFilters;
    });
    setShowMealTypeDropdown(false);
  };

  const clearFilters = () => {
    setFilters({
      locations: '',
      meal_types: ''
    });
  };

  const hasActiveFilters = filters.locations || filters.meal_types;

  const getLocationNameByCode = (code) => {
    const item = availableFilters.locations.find(l => l.key === code);
    return item ? item.name : code;
  };

  const getSelectedLocationsText = () => {
    if (!filters.locations) return t('selectLocation');
    const found = availableFilters.locations.find(item => item.key === filters.locations);
    return found ? found.name : filters.locations;
  };

  const getSelectedMealTypesText = () => {
    if (!filters.meal_types) return t('selectMealType');
    return mealTypeNames[language][filters.meal_types] || filters.meal_types;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      overflowX: 'hidden',
      direction: dir,
              background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
    }}>
      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
                      }}>
              {t('availableRestaurants')}
            </h1>
            <p style={{ 
              fontSize: 'clamp(0.875rem, 3vw, 1.125rem)', 
              color: 'rgb(75 85 99)', 
              maxWidth: '600px', 
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {t('restaurantsDescription')}
            </p>
        </div>

        {/* Filters Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 10,
          '@media (max-width: 768px)': {
            padding: '1rem',
            marginBottom: '1.5rem',
            zIndex: 9997,
            position: 'relative'
          }
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            '@media (max-width: 768px)': {
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '0.75rem',
              marginBottom: '1rem'
            }
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#4a757c',
              margin: 0
            }}>
              🔍 {t('searchFilters')}
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgb(107 114 128)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  textDecoration: 'underline',
                  padding: '0.25rem 0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'rgb(75 85 99)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgb(107 114 128)';
                }}
              >
                {t('clearFilters')}
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '1rem',
              position: 'relative',
              zIndex: 1
            }
          }}>
            {/* Location Filter Dropdown */}
            <div 
              className={`filter-item ${showLocationDropdown ? 'open' : ''}`}
              style={{ 
                position: 'relative'
              }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'rgb(75 85 99)',
                marginBottom: '0.75rem'
              }}>
                📍 {t('locations')}
              </h3>
              <div style={{ position: 'relative' }}>
                <button
                  id="location-button"
                  className="filter-button"
                  onClick={() => {
                    setShowLocationDropdown(!showLocationDropdown);
                    if (showMealTypeDropdown) {
                      setShowMealTypeDropdown(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid rgb(209 213 219)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: filters.locations ? '#4a757c' : 'rgb(75 85 99)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#4a757c';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 117, 124, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgb(209 213 219)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {getSelectedLocationsText()}
                  </span>
                  <span style={{ 
                    marginLeft: dir === 'rtl' ? '0' : '0.5rem',
                    marginRight: dir === 'rtl' ? '0.5rem' : '0',
                    transform: showLocationDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </button>

                {showLocationDropdown && (
                  <div 
                    id="location-dropdown"
                    className="location-dropdown"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      borderRadius: '0.5rem',
                      border: '2px solid rgb(209 213 219)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                      zIndex: 10000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginTop: '0.25rem'
                    }}>
                    <div
                      className="dropdown-item"
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        borderBottom: '1px solid rgb(243 244 246)',
                        fontSize: '0.875rem',
                        color: 'rgb(75 85 99)',
                        fontWeight: '500',
                        textAlign: dir === 'rtl' ? 'right' : 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgb(249 250 251)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationFilter('');
                      }}
                    >
                      {t('clearSelection')}
                    </div>
                    {availableFilters.locations.map(item => (
                      <div
                        key={item.key}
                        className={`dropdown-item ${filters.locations === item.key ? 'selected' : ''}`}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          borderBottom: '1px solid rgb(243 244 246)',
                          fontSize: '0.875rem',
                          color: filters.locations === item.key ? '#4a757c' : 'rgb(75 85 99)',
                          fontWeight: filters.locations === item.key ? '600' : '500',
                          backgroundColor: filters.locations === item.key ? 'rgb(238 242 255)' : 'transparent',
                          textAlign: dir === 'rtl' ? 'right' : 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (filters.locations !== item.key) {
                            e.target.style.backgroundColor = 'rgb(249 250 251)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filters.locations !== item.key) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                        onClick={(e) => {
                          console.log('Clicked on location item:', item.key);
                          e.stopPropagation();
                          handleLocationFilter(item.key);
                        }}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meal Type Filter Dropdown */}
            <div 
              className={`filter-item ${showMealTypeDropdown ? 'open' : ''}`}
              style={{ 
                position: 'relative'
              }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'rgb(75 85 99)',
                marginBottom: '0.75rem'
              }}>
                🍽️ {t('mealTypes')}
              </h3>
              <div style={{ position: 'relative' }}>
                <button
                  id="meal-type-button"
                  className="filter-button meal-type"
                  onClick={() => {
                    setShowMealTypeDropdown(!showMealTypeDropdown);
                    if (showLocationDropdown) {
                      setShowLocationDropdown(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid rgb(209 213 219)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: filters.meal_types ? 'rgb(34 197 94)' : 'rgb(75 85 99)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgb(34 197 94)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgb(209 213 219)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {getSelectedMealTypesText()}
                  </span>
                  <span style={{ 
                    marginLeft: dir === 'rtl' ? '0' : '0.5rem',
                    marginRight: dir === 'rtl' ? '0.5rem' : '0',
                    transform: showMealTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </button>

                {showMealTypeDropdown && (
                  <div 
                    id="meal-type-dropdown"
                    className="meal-type-dropdown"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      borderRadius: '0.5rem',
                      border: '2px solid rgb(209 213 219)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                      zIndex: 9999,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginTop: '0.25rem'
                    }}>
                    <div
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        borderBottom: '1px solid rgb(243 244 246)',
                        fontSize: '0.875rem',
                        color: 'rgb(75 85 99)',
                        fontWeight: '500',
                        textAlign: dir === 'rtl' ? 'right' : 'left',
                        '@media (max-width: 768px)': {
                          padding: '0.75rem 1rem',
                          fontSize: '1rem',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center'
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgb(249 250 251)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMealTypeFilter('');
                      }}
                    >
                      {t('clearSelection')}
                    </div>
                    {availableFilters.meal_types.map(mealType => (
                      <div
                        key={mealType}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          borderBottom: '1px solid rgb(243 244 246)',
                          fontSize: '0.875rem',
                          color: filters.meal_types === mealType ? 'rgb(34 197 94)' : 'rgb(75 85 99)',
                          fontWeight: filters.meal_types === mealType ? '600' : '500',
                          backgroundColor: filters.meal_types === mealType ? 'rgb(240 253 244)' : 'transparent',
                          textAlign: dir === 'rtl' ? 'right' : 'left',
                          '@media (max-width: 768px)': {
                            padding: '0.875rem 1rem',
                            fontSize: '1rem',
                            minHeight: '48px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (filters.meal_types !== mealType) {
                            e.target.style.backgroundColor = 'rgb(249 250 251)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filters.meal_types !== mealType) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                        onClick={(e) => {
                          console.log('Clicked on meal type item:', mealType);
                          e.stopPropagation();
                          handleMealTypeFilter(mealType);
                        }}
                      >
                        {mealTypeNames[language][mealType] || mealType}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: 'rgb(75 85 99)' }}>{t('loadingRestaurants')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && restaurants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              color: 'rgb(75 85 99)', 
              marginBottom: '0.5rem' 
            }}>
              {t('noRestaurantsAvailable')}
            </h3>
            <p style={{ 
              color: 'rgb(107 114 128)',
              marginBottom: '1.5rem'
            }}>
              {t('tryChangingFilters')}
            </p>
            <button
              onClick={clearFilters}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                color: 'white',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t('showAllRestaurants')}
            </button>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            padding: '0 0.5rem',
            position: 'relative',
            zIndex: 1,
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '1rem',
              padding: '0',
              marginTop: '1rem'
            }
          }}>
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                height: '420px',
                '@media (max-width: 768px)': {
                  padding: '1rem',
                  height: 'auto',
                  minHeight: '380px'
                }
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
                {/* Icon Section - Fixed Height */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1rem',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {restaurant.logo ? (
                    <div style={{
                      width: '200px',
                      height: '160px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 25px rgba(47, 110, 115, 0.2)',
                      border: '2px solid rgba(47, 110, 115, 0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 12px 35px rgba(47, 110, 115, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(47, 110, 115, 0.2)';
                    }}>
                      <img 
                        src={`/storage/${restaurant.logo}`}
                        alt={language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          transition: 'transform 0.3s ease',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }}
                        onLoad={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'white'
                      }}>
                        🍽️
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: '200px',
                      height: '160px',
                      background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(47, 110, 115, 0.2)',
                      border: '2px solid rgba(47, 110, 115, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 12px 35px rgba(47, 110, 115, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(47, 110, 115, 0.2)';
                    }}>
                      🍽️
                    </div>
                  )}
                </div>

                {/* Title Section - Fixed Height */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1rem',
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    color: '#4a757c', 
                    margin: 0,
                    lineHeight: '1.3'
                  }}>
                    {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                  </h3>
                </div>

                {/* Description Section - Fixed Height */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1rem',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgb(107 114 128)',
                    lineHeight: '1.4',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {language === 'ar' ? restaurant.description_ar : restaurant.description_en}
                  </p>
                </div>
                
                {/* Info Section - Fixed Height */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  height: '80px',
                  justifyContent: 'center'
                }}>
                  {restaurant.locations && restaurant.locations.length > 0 && (
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#4a757c',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      📍 {restaurant.locations.map(loc => getLocationNameByCode(loc)).join('، ')}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgb(75 85 99)',
                    textAlign: 'center',
                    direction: 'ltr'
                  }}>
                    📞 {restaurant.phone}
                  </div>
                </div>
              
                {/* Button Section - Fixed at Bottom */}
                <div style={{ marginTop: 'auto' }}>
                  <button 
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    🍽️ {t('viewMeals')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
