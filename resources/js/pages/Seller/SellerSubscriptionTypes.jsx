import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { showAlert, showConfirm, showSaveSuccess, showOperationFailed, showDeleteConfirm } from '../../utils/popupUtils';

const SellerSubscriptionTypes = () => {
    const { t, dir, language } = useLanguage();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        type: 'weekly',
        price: '',
        delivery_price: '0',
        meals_count: '',
        is_active: true
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchSubscriptionTypes(selectedRestaurant);
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

    const fetchSubscriptionTypes = async (restaurantId) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${restaurantId}/subscription-types`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSubscriptionTypes(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching subscription types:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                restaurant_id: selectedRestaurant,
                price: parseFloat(formData.price),
                delivery_price: parseFloat(formData.delivery_price),
                meals_count: parseInt(formData.meals_count),
            };

            const url = editingType 
                ? `/api/seller/subscription-types/${editingType.id}`
                : '/api/seller/subscription-types';
            
            const method = editingType ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                setShowAddModal(false);
                setEditingType(null);
                resetForm();
                fetchSubscriptionTypes(selectedRestaurant);
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'حدث خطأ في حفظ نوع الاشتراك', 'خطأ في الحفظ', 'error');
            }
        } catch (error) {
            console.error('Error saving subscription type:', error);
            showOperationFailed('حفظ نوع الاشتراك');
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            name_ar: type.name_ar,
            name_en: type.name_en,
            description_ar: type.description_ar || '',
            description_en: type.description_en || '',
            type: type.type,
            price: type.price.toString(),
            delivery_price: type.delivery_price.toString(),
            meals_count: type.meals_count.toString(),
            is_active: type.is_active,
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        showDeleteConfirm('هذا النوع من الاشتراك', async () => {

        try {
            const response = await fetch(`/api/seller/subscription-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchSubscriptionTypes(selectedRestaurant);
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'حدث خطأ في حذف نوع الاشتراك', 'خطأ في الحذف', 'error');
            }
        } catch (error) {
            console.error('Error deleting subscription type:', error);
            showOperationFailed('حذف نوع الاشتراك');
        }
        });
    };

    const resetForm = () => {
        setFormData({
            name_ar: '',
            name_en: '',
            description_ar: '',
            description_en: '',
            type: 'weekly',
            price: '',
            delivery_price: '0',
            meals_count: '',
            is_active: true
        });
    };

    const openAddModal = () => {
        setEditingType(null);
        resetForm();
        setShowAddModal(true);
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
        <div style={{ direction: dir }}>
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
                            {language === 'ar' ? 'إدارة أنواع الاشتراكات' : 'Subscription Types Management'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة أنواع الاشتراكات لمطاعمك وتحديد الأسعار'
                                : 'Manage subscription types for your restaurants and set prices'
                            }
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
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
                        ➕ {language === 'ar' ? 'إضافة نوع اشتراك' : 'Add Subscription Type'}
                    </button>
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

            {/* Subscription Types Display */}
            {selectedRestaurant && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {subscriptionTypes.map((type) => (
                        <div
                            key={type.id}
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
                                        background: type.is_active 
                                            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        color: 'white'
                                    }}>
                                        📋
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.125rem',
                                            fontWeight: '600',
                                            color: 'rgb(55 65 81)',
                                            margin: 0,
                                            marginBottom: '0.25rem'
                                        }}>
                                            {language === 'ar' ? type.name_ar : type.name_en}
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: type.is_active 
                                                    ? 'rgba(34, 197, 94, 0.1)' 
                                                    : 'rgba(239, 68, 68, 0.1)',
                                                color: type.is_active 
                                                    ? 'rgb(34 197 94)' 
                                                    : 'rgb(239 68 68)',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500'
                                            }}>
                                                {type.is_active 
                                                    ? (language === 'ar' ? 'نشط' : 'Active')
                                                    : (language === 'ar' ? 'غير نشط' : 'Inactive')
                                                }
                                            </span>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(79, 70, 229, 0.1)',
                                                color: 'rgb(79 70 229)',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500'
                                            }}>
                                                {type.type === 'weekly' 
                                                    ? (language === 'ar' ? 'أسبوعي' : 'Weekly')
                                                    : (language === 'ar' ? 'شهري' : 'Monthly')
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <button
                                        onClick={() => handleEdit(type)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'rgba(79, 70, 229, 0.1)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type.id)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                        title={language === 'ar' ? 'حذف' : 'Delete'}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <p style={{
                                color: 'rgb(107 114 128)',
                                fontSize: '0.875rem',
                                margin: 0,
                                marginBottom: '1rem',
                                lineHeight: 1.5
                            }}>
                                {language === 'ar' ? type.description_ar : type.description_en}
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
                                        💰 {language === 'ar' ? 'سعر الاشتراك' : 'Subscription Price'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem',
                                        fontWeight: '600'
                                    }}>
                                        {type.price} {language === 'ar' ? 'ريال' : 'OMR'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        🚚 {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {type.delivery_price > 0 
                                            ? `${type.delivery_price} ${language === 'ar' ? 'ريال' : 'OMR'}`
                                            : (language === 'ar' ? 'مجاني' : 'Free')
                                        }
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        🍽️ {language === 'ar' ? 'عدد الوجبات' : 'Meals Count'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {type.meals_count} {language === 'ar' ? 'وجبة' : 'meals'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        💵 {language === 'ar' ? 'السعر الإجمالي' : 'Total Price'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem',
                                        fontWeight: '600'
                                    }}>
                                        {(parseFloat(type.price) + parseFloat(type.delivery_price)).toFixed(2)} {language === 'ar' ? 'ريال' : 'OMR'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {selectedRestaurant && subscriptionTypes.length === 0 && (
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
                        📋
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد أنواع اشتراكات' : 'No Subscription Types'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'لا توجد أنواع اشتراكات لهذا المطعم بعد'
                            : 'No subscription types available for this restaurant yet'
                        }
                    </p>
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
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
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
                                {editingType 
                                    ? (language === 'ar' ? 'تعديل نوع الاشتراك' : 'Edit Subscription Type')
                                    : (language === 'ar' ? 'إضافة نوع اشتراك جديد' : 'Add New Subscription Type')
                                }
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
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
                                        {language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'} *
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
                                        {language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'} *
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
                                        {language === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}
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
                                        {language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}
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
                                gridTemplateColumns: '1fr 1fr 1fr',
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
                                        {language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type'} *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
                                        <option value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</option>
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
                                        {language === 'ar' ? 'سعر الاشتراك' : 'Subscription Price'} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                                        {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.delivery_price}
                                        onChange={(e) => setFormData({...formData, delivery_price: e.target.value})}
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
                                marginBottom: '2rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'عدد الوجبات' : 'Meals Count'} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.meals_count}
                                        onChange={(e) => setFormData({...formData, meals_count: e.target.value})}
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
                                        {language === 'ar' ? 'الحالة' : 'Status'}
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            style={{
                                                width: '1rem',
                                                height: '1rem'
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: 'rgb(55 65 81)'
                                        }}>
                                            {language === 'ar' ? 'نشط' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(107, 114, 128, 0.1)',
                                        color: 'rgb(107 114 128)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
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
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingType 
                                        ? (language === 'ar' ? 'تحديث' : 'Update')
                                        : (language === 'ar' ? 'إضافة' : 'Add')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
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
                            ? 'يجب عليك إضافة مطعم أولاً قبل إضافة أنواع الاشتراكات'
                            : 'You need to add a restaurant first before adding subscription types'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default SellerSubscriptionTypes;
