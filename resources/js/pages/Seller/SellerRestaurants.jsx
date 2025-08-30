import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SellerRestaurants = () => {
    const { t, dir, language } = useLanguage();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        phone: '',
        email: '',
        address_ar: '',
        address_en: '',
        locations: [],
        delivery_price: '',
        is_active: true
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/seller/restaurants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'locations') {
                    formData.locations.forEach(location => {
                        formDataToSend.append('locations[]', location);
                    });
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const url = editingRestaurant 
                ? `/api/seller/restaurants/${editingRestaurant.id}`
                : '/api/seller/restaurants';
            
            const method = editingRestaurant ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataToSend
            });

            if (response.ok) {
                setShowAddModal(false);
                setEditingRestaurant(null);
                resetForm();
                fetchRestaurants();
            }
        } catch (error) {
            console.error('Error saving restaurant:', error);
        }
    };

    const handleEdit = (restaurant) => {
        setEditingRestaurant(restaurant);
        setFormData({
            name_ar: restaurant.name_ar || '',
            name_en: restaurant.name_en || '',
            description_ar: restaurant.description_ar || '',
            description_en: restaurant.description_en || '',
            phone: restaurant.phone || '',
            email: restaurant.email || '',
            address_ar: restaurant.address_ar || '',
            address_en: restaurant.address_en || '',
            locations: restaurant.locations || [],
            delivery_price: restaurant.delivery_price || '',
            is_active: restaurant.is_active
        });
        setShowAddModal(true);
    };

    const handleDelete = async (restaurantId) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المطعم؟' : 'Are you sure you want to delete this restaurant?')) {
            return;
        }

        try {
            const response = await fetch(`/api/seller/restaurants/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchRestaurants();
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
        }
    };

    const handleToggleStatus = async (restaurantId) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${restaurantId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchRestaurants();
            }
        } catch (error) {
            console.error('Error toggling restaurant status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name_ar: '',
            name_en: '',
            description_ar: '',
            description_en: '',
            phone: '',
            email: '',
            address_ar: '',
            address_en: '',
            locations: [],
            delivery_price: '',
            is_active: true
        });
    };

    const locationOptions = [
        { value: 'bosher', labelAr: 'بوشر', labelEn: 'Bosher' },
        { value: 'khoudh', labelAr: 'الخوض', labelEn: 'Khoudh' },
        { value: 'maabilah', labelAr: 'معبيلة', labelEn: 'Maabilah' }
    ];

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
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.5rem'
                        }}>
                            {language === 'ar' ? 'إدارة المطاعم' : 'Restaurants Management'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة مطاعمك وإضافة مطاعم جديدة'
                                : 'Manage your restaurants and add new ones'
                            }
                        </p>
                    </div>
                    
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingRestaurant(null);
                            setShowAddModal(true);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {language === 'ar' ? '➕ إضافة مطعم جديد' : '➕ Add New Restaurant'}
                    </button>
                </div>
            </div>

            {/* Restaurants Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
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
                        {/* Restaurant Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    background: restaurant.is_active 
                                        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white'
                                }}>
                                    🏪
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        margin: 0,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: restaurant.is_active 
                                                ? 'rgba(34, 197, 94, 0.1)' 
                                                : 'rgba(239, 68, 68, 0.1)',
                                            color: restaurant.is_active 
                                                ? 'rgb(34 197 94)' 
                                                : 'rgb(239 68 68)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {restaurant.is_active 
                                                ? (language === 'ar' ? 'نشط' : 'Active')
                                                : (language === 'ar' ? 'غير نشط' : 'Inactive')
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Details */}
                        <div style={{
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{
                                color: 'rgb(107 114 128)',
                                fontSize: '0.875rem',
                                margin: 0,
                                marginBottom: '1rem',
                                lineHeight: 1.5
                            }}>
                                {language === 'ar' ? restaurant.description_ar : restaurant.description_en}
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
                                        📞 {language === 'ar' ? 'الهاتف' : 'Phone'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.phone || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        📧 {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.email || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        🍽️ {language === 'ar' ? 'الوجبات' : 'Meals'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.meals?.length || 0} {language === 'ar' ? 'وجبة' : 'meals'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        💰 {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.delivery_price 
                                            ? `${restaurant.delivery_price} ${language === 'ar' ? 'ريال' : 'OMR'}`
                                            : (language === 'ar' ? 'مجاني' : 'Free')
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                onClick={() => handleEdit(restaurant)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                                }}
                            >
                                ✏️ {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            
                            <button
                                onClick={() => handleToggleStatus(restaurant.id)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    background: restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.1)' 
                                        : 'rgba(34, 197, 94, 0.1)',
                                    color: restaurant.is_active 
                                        ? 'rgb(239 68 68)' 
                                        : 'rgb(34 197 94)',
                                    border: `1px solid ${restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.2)' 
                                        : 'rgba(34, 197, 94, 0.2)'}`,
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.2)' 
                                        : 'rgba(34, 197, 94, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.1)' 
                                        : 'rgba(34, 197, 94, 0.1)';
                                }}
                            >
                                {restaurant.is_active 
                                    ? `❌ ${language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate'}`
                                    : `✅ ${language === 'ar' ? 'تفعيل' : 'Activate'}`
                                }
                            </button>
                            
                            <button
                                onClick={() => handleDelete(restaurant.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'rgb(239 68 68)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {restaurants.length === 0 && !loading && (
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
                        margin: 0,
                        marginBottom: '1.5rem'
                    }}>
                        {language === 'ar' 
                            ? 'ابدأ بإضافة مطعمك الأول'
                            : 'Start by adding your first restaurant'
                        }
                    </p>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingRestaurant(null);
                            setShowAddModal(true);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {language === 'ar' ? '➕ إضافة مطعم جديد' : '➕ Add New Restaurant'}
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'rgb(55 65 81)',
                                margin: 0
                            }}>
                                {editingRestaurant 
                                    ? (language === 'ar' ? 'تعديل المطعم' : 'Edit Restaurant')
                                    : (language === 'ar' ? 'إضافة مطعم جديد' : 'Add New Restaurant')
                                }
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingRestaurant(null);
                                    resetForm();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'rgb(107 114 128)'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'اسم المطعم (عربي)' : 'Restaurant Name (Arabic)'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'اسم المطعم (إنجليزي)' : 'Restaurant Name (English)'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                                    </label>
                                    <textarea
                                        value={formData.description_ar}
                                        onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                                    </label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📞 {language === 'ar' ? 'الهاتف' : 'Phone'}
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📧 {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📍 {language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address_ar}
                                        onChange={(e) => setFormData({...formData, address_ar: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📍 {language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address_en}
                                        onChange={(e) => setFormData({...formData, address_en: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        🗺️ {language === 'ar' ? 'المناطق' : 'Locations'}
                                    </label>
                                    <select
                                        multiple
                                        value={formData.locations}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData({...formData, locations: selected});
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            minHeight: '100px'
                                        }}
                                    >
                                        {locationOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {language === 'ar' ? option.labelAr : option.labelEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        💰 {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.delivery_price}
                                        onChange={(e) => setFormData({...formData, delivery_price: e.target.value})}
                                        placeholder={language === 'ar' ? '0.00' : '0.00'}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '2rem'
                            }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    style={{
                                        width: '1rem',
                                        height: '1rem'
                                    }}
                                />
                                <label htmlFor="is_active" style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(55 65 81)',
                                    cursor: 'pointer'
                                }}>
                                    {language === 'ar' ? 'مطعم نشط' : 'Active Restaurant'}
                                </label>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingRestaurant(null);
                                        resetForm();
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(107, 114, 128, 0.1)',
                                        color: 'rgb(107 114 128)',
                                        border: '1px solid rgba(107, 114, 128, 0.2)',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                                    }}
                                >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {editingRestaurant 
                                        ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                                        : (language === 'ar' ? 'إضافة المطعم' : 'Add Restaurant')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerRestaurants;
