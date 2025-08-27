import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsAPI } from '../../services/api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    locations: '',
    meal_types: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    locations: [],
    meal_types: []
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const navigate = useNavigate();

  // أسماء العناوين بالعربية
  const locationNames = {
    'bosher': 'بوشر',
    'khoudh': 'الخوض',
    'maabilah': 'المعبيلة'
  };

  // أسماء أنواع الوجبات بالعربية
  const mealTypeNames = {
    'breakfast': 'فطور',
    'lunch': 'غداء',
    'dinner': 'عشاء'
  };

  // Fallback filters في حالة عدم وجود بيانات
  const fallbackFilters = {
    locations: ['bosher', 'khoudh', 'maabilah'],
    meal_types: ['breakfast', 'lunch', 'dinner']
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await restaurantsAPI.getFilters();
        if (response.data.success) {
          setAvailableFilters(response.data.data);
        } else {
          // Fallback to default filters
          setAvailableFilters(fallbackFilters);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        // Fallback to default filters
        setAvailableFilters(fallbackFilters);
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
        setError('حدث خطأ في تحميل المطاعم');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters]);

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

  const getSelectedLocationsText = () => {
    if (!filters.locations) return 'اختر العنوان';
    return locationNames[filters.locations] || filters.locations;
  };

  const getSelectedMealTypesText = () => {
    if (!filters.meal_types) return 'اختر نوع الوجبة';
    return mealTypeNames[filters.meal_types] || filters.meal_types;
  };

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

        {/* Filters Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'rgb(79 70 229)',
              margin: 0
            }}>
              🔍 فلاتر البحث
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
                مسح الفلاتر
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Location Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'rgb(75 85 99)',
                marginBottom: '0.75rem'
              }}>
                📍 العناوين
              </h3>
              <div style={{ position: 'relative' }}>
                <button
                  id="location-button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid rgb(209 213 219)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: filters.locations ? 'rgb(79 70 229)' : 'rgb(75 85 99)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'right'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgb(79 70 229)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
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
                    marginLeft: '0.5rem',
                    transform: showLocationDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </button>

                {showLocationDropdown && (
                  <div 
                    id="location-dropdown"
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
                      zIndex: 1001,
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
                        fontWeight: '500'
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
                      إلغاء التحديد
                    </div>
                    {availableFilters.locations.map(location => (
                      <div
                        key={location}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          borderBottom: '1px solid rgb(243 244 246)',
                          fontSize: '0.875rem',
                          color: filters.locations === location ? 'rgb(79 70 229)' : 'rgb(75 85 99)',
                          fontWeight: filters.locations === location ? '600' : '500',
                          backgroundColor: filters.locations === location ? 'rgb(238 242 255)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (filters.locations !== location) {
                            e.target.style.backgroundColor = 'rgb(249 250 251)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filters.locations !== location) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                        onClick={(e) => {
                          console.log('Clicked on location item:', location);
                          e.stopPropagation();
                          handleLocationFilter(location);
                        }}
                      >
                        {locationNames[location] || location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meal Type Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'rgb(75 85 99)',
                marginBottom: '0.75rem'
              }}>
                🍽️ أنواع الوجبات
              </h3>
              <div style={{ position: 'relative' }}>
                <button
                  id="meal-type-button"
                  onClick={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
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
                    textAlign: 'right'
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
                    marginLeft: '0.5rem',
                    transform: showMealTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </button>

                {showMealTypeDropdown && (
                  <div 
                    id="meal-type-dropdown"
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
                      zIndex: 1001,
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
                        fontWeight: '500'
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
                      إلغاء التحديد
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
                          backgroundColor: filters.meal_types === mealType ? 'rgb(240 253 244)' : 'transparent'
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
                        {mealTypeNames[mealType] || mealType}
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

        {/* No Results */}
        {!loading && !error && restaurants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              color: 'rgb(75 85 99)', 
              marginBottom: '0.5rem' 
            }}>
              لا توجد مطاعم متاحة
            </h3>
            <p style={{ 
              color: 'rgb(107 114 128)',
              marginBottom: '1.5rem'
            }}>
              جرب تغيير الفلاتر المحددة
            </p>
            <button
              onClick={clearFilters}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                color: 'white',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              عرض جميع المطاعم
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
            zIndex: 1
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
                height: '400px'
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
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ 
                    fontSize: '3rem',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {restaurant.logo || '🍽️'}
                  </div>
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
                    color: 'rgb(79 70 229)', 
                    margin: 0,
                    lineHeight: '1.3'
                  }}>
                    {restaurant.name_ar}
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
                    {restaurant.description_ar || restaurant.description_en}
                  </p>
                </div>
                
                {/* Info Section - Fixed Height */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  height: '60px',
                  justifyContent: 'center'
                }}>
                  {restaurant.locations && restaurant.locations.length > 0 && (
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: 'rgb(79 70 229)',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      📍 {restaurant.locations.map(loc => locationNames[loc] || loc).join('، ')}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'rgb(75 85 99)',
                    textAlign: 'center'
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
                      background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
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
                    🍽️ عرض الوجبات
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
