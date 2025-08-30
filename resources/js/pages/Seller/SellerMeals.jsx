import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SellerMeals = () => {
    const { t, dir, language } = useLanguage();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchMeals(selectedRestaurant);
        }
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/seller/restaurants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.data || []);
                if (data.data && data.data.length > 0) {
                    setSelectedRestaurant(data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeals = async (restaurantId) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${restaurantId}/meals`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMeals(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        marginBottom: '1rem'
                    }}>
                        ⏳
                    </div>
                    <div style={{
                        color: 'rgb(107 114 128)',
                        fontSize: '1rem'
                    }}>
                        {t('loading')}...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            direction: dir
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.5rem'
                        }}>
                            {language === 'ar' ? 'إدارة الوجبات' : 'Meals Management'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة وجبات مطاعمك وإضافة وجبات جديدة'
                                : 'Manage your restaurant meals and add new ones'
                            }
                        </p>
                    </div>
                </div>

                {/* Restaurant Selector */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'rgb(55 65 81)'
                    }}>
                        🏪 {language === 'ar' ? 'اختر المطعم' : 'Select Restaurant'}
                    </label>
                    <select
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            background: 'white'
                        }}
                    >
                        <option value="">
                            {language === 'ar' ? '-- اختر المطعم --' : '-- Select Restaurant --'}
                        </option>
                        {restaurants.map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Meals Display */}
            {selectedRestaurant && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {meals.map((meal) => (
                        <div
                            key={meal.id}
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    background: meal.is_available 
                                        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white'
                                }}>
                                    🍽️
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        margin: 0,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {language === 'ar' ? meal.name_ar : meal.name_en}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: meal.is_available 
                                                ? 'rgba(34, 197, 94, 0.1)' 
                                                : 'rgba(239, 68, 68, 0.1)',
                                            color: meal.is_available 
                                                ? 'rgb(34 197 94)' 
                                                : 'rgb(239 68 68)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {meal.is_available 
                                                ? (language === 'ar' ? 'متاح' : 'Available')
                                                : (language === 'ar' ? 'غير متاح' : 'Unavailable')
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                color: 'rgb(107 114 128)',
                                fontSize: '0.875rem',
                                margin: 0,
                                marginBottom: '1rem',
                                lineHeight: 1.5
                            }}>
                                {language === 'ar' ? meal.description_ar : meal.description_en}
                            </p>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                                fontSize: '0.75rem'
                            }}>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        💰 {language === 'ar' ? 'السعر' : 'Price'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem',
                                        fontWeight: '600'
                                    }}>
                                        {meal.price} {language === 'ar' ? 'ريال' : 'OMR'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        ⏰ {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {meal.delivery_time ? meal.delivery_time.substring(0, 5) : (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {selectedRestaurant && meals.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>
                        🍽️
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد وجبات' : 'No Meals'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'لا توجد وجبات لهذا المطعم بعد'
                            : 'No meals available for this restaurant yet'
                        }
                    </p>
                </div>
            )}

            {!selectedRestaurant && restaurants.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>
                        🏪
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد مطاعم' : 'No Restaurants'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'يجب عليك إضافة مطعم أولاً قبل إضافة الوجبات'
                            : 'You need to add a restaurant first before adding meals'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default SellerMeals;
