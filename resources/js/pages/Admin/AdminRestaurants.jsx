import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import { usePopupMessage } from '../../hooks/usePopupMessage';

const AdminRestaurants = () => {
    const { t, dir, language } = useLanguage();
    const { popup, showConfirm, showSuccess, showError, hidePopup } = usePopupMessage();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
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
        seller_id: null,
        is_active: true,
        logo: null
    });
    const [sellers, setSellers] = useState([]);

    useEffect(() => {
        fetchRestaurants();
        fetchSellers();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/restaurants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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

    const fetchSellers = async () => {
        try {
            const response = await fetch('/api/admin/restaurants/sellers/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSellers(data.data || []);
            } else {
                console.error('Failed to fetch sellers');
            }
        } catch (error) {
            console.error('Error fetching sellers:', error);
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
            seller_id: restaurant.seller_id || null,
            is_active: restaurant.is_active,
            logo: null
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    // Convert boolean to string for FormData
                    let value = formData[key];
                    if (typeof value === 'boolean') {
                        value = value.toString();
                    } else if (key === 'seller_id' && (value === '' || value === null)) {
                        // Skip empty seller_id
                        return;
                    }
                    formDataToSend.append(key, value);
                }
            });
            

            const url = editingRestaurant 
                ? `/api/admin/restaurants/${editingRestaurant.id}`
                : '/api/admin/restaurants';
            
            const method = editingRestaurant ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: formDataToSend
            });

            const responseData = await response.json();

            if (response.ok) {
                setShowAddModal(false);
                setEditingRestaurant(null);
                setFormData({
                    name_ar: '',
                    name_en: '',
                    description_ar: '',
                    description_en: '',
                    phone: '',
                    email: '',
                    address_ar: '',
            address_en: '',
            seller_id: null,
            is_active: true,
                    logo: null
                });
                fetchRestaurants();
                showSuccess(
                    language === 'ar' 
                        ? (editingRestaurant ? 'تم تحديث المطعم بنجاح' : 'تم إضافة المطعم بنجاح')
                        : (editingRestaurant ? 'Restaurant updated successfully' : 'Restaurant added successfully'),
                    language === 'ar' ? 'نجح الإجراء' : 'Success'
                );
            } else {
                showError(
                    responseData.message || (language === 'ar' 
                        ? (editingRestaurant ? 'حدث خطأ أثناء تحديث المطعم' : 'حدث خطأ أثناء إضافة المطعم')
                        : (editingRestaurant ? 'Error updating restaurant' : 'Error adding restaurant')),
                    language === 'ar' ? 'خطأ' : 'Error'
                );
            }
        } catch (error) {
            console.error('Error saving restaurant:', error);
            showError(
                language === 'ar' 
                    ? (editingRestaurant ? 'حدث خطأ أثناء تحديث المطعم' : 'حدث خطأ أثناء إضافة المطعم')
                    : (editingRestaurant ? 'Error updating restaurant' : 'Error adding restaurant'),
                language === 'ar' ? 'خطأ' : 'Error'
            );
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        const restaurantName = restaurant ? restaurant.name : 'المطعم';
        
        showConfirm(
            language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
            language === 'ar' 
                ? `هل أنت متأكد من حذف المطعم "${restaurantName}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete restaurant "${restaurantName}"? This action cannot be undone.`,
            async () => {
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setRestaurants(restaurants.filter(restaurant => restaurant.id !== restaurantId));
                        showSuccess(
                            language === 'ar' ? 'تم حذف المطعم بنجاح' : 'Restaurant deleted successfully',
                            language === 'ar' ? 'نجح الحذف' : 'Delete Successful'
                        );
                    } else {
                        showError(
                            language === 'ar' ? 'حدث خطأ أثناء حذف المطعم' : 'Error deleting restaurant',
                            language === 'ar' ? 'خطأ في الحذف' : 'Delete Error'
                        );
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
                    showError(
                        language === 'ar' ? 'حدث خطأ أثناء حذف المطعم' : 'Error deleting restaurant',
                        language === 'ar' ? 'خطأ في الحذف' : 'Delete Error'
                    );
                }
            },
            {
                confirmText: language === 'ar' ? 'حذف' : 'Delete',
                cancelText: language === 'ar' ? 'إلغاء' : 'Cancel'
            }
        );
    };

    const handleToggleRestaurantStatus = async (restaurantId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setRestaurants(restaurants.map(restaurant => 
                    restaurant.id === restaurantId 
                        ? { ...restaurant, is_active: !currentStatus }
                        : restaurant
                ));
            }
        } catch (error) {
            console.error('Error toggling restaurant status:', error);
        }
    };

    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            restaurant.phone?.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'active' && restaurant.is_active) ||
                            (filterStatus === 'inactive' && !restaurant.is_active);
        return matchesSearch && matchesStatus;
    });

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
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0
                    }}>
                        {language === 'ar' ? 'إدارة المطاعم' : 'Restaurant Management'}
                    </h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
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
                        {language === 'ar' ? 'إضافة مطعم جديد' : 'Add New Restaurant'}
                    </button>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: '200px'
                    }}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث عن المطاعم...' : 'Search restaurants...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                        <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                        <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                </div>
            </div>

            {/* Restaurants Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredRestaurants.map((restaurant) => (
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
                        {/* Restaurant Logo */}
                        <div style={{
                            width: '100%',
                            height: '200px',
                            background: restaurant.logo 
                                ? `url(${restaurant.logo})` 
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            color: 'white'
                        }}>
                            {!restaurant.logo && '🍽️'}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                flex: 1
                            }}>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(55 65 81)',
                                    margin: 0,
                                    marginBottom: '0.5rem'
                                }}>
                                    {restaurant.name}
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(107 114 128)',
                                    margin: 0,
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {restaurant.description}
                                </p>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: restaurant.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: restaurant.is_active ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                                }}>
                                    {restaurant.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                    {restaurant.phone || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                    {restaurant.email || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'عدد الوجبات:' : 'Meals Count:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                    {restaurant.meals_count || 0}
                                </span>
                            </div>
                            
                            {restaurant.seller && (
                            <div style={{
                                display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                        {language === 'ar' ? 'البائع:' : 'Seller:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                        {restaurant.seller.name}
                                </span>
                            </div>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <button
                                onClick={() => handleEdit(restaurant)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
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
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            <button
                                onClick={() => handleToggleRestaurantStatus(restaurant.id, restaurant.is_active)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: restaurant.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                    color: restaurant.is_active ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = restaurant.is_active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = restaurant.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                                }}
                            >
                                {restaurant.is_active ? (language === 'ar' ? 'إلغاء تفعيل' : 'Deactivate') : (language === 'ar' ? 'تفعيل' : 'Activate')}
                            </button>
                            <button
                                onClick={() => handleDeleteRestaurant(restaurant.id)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'rgb(239, 68, 68)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
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
                                {language === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRestaurants.length === 0 && (
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
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد مطاعم' : 'No Restaurants Found'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'لم يتم العثور على مطاعم تطابق معايير البحث الخاصة بك.'
                            : 'No restaurants found matching your search criteria.'
                        }
                    </p>
                </div>
            )}

            {/* Add/Edit Restaurant Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
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
                                    setFormData({
                                        name_ar: '',
                                        name_en: '',
                                        description_ar: '',
                                        description_en: '',
                                        phone: '',
                                        email: '',
                                        address_ar: '',
            address_en: '',
            seller_id: null,
            is_active: true,
                                        logo: null
                                    });
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'rgb(107 114 128)',
                                    padding: '0.5rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'اسم المطعم (عربي)' : 'Restaurant Name (Arabic)'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'اسم المطعم (إنجليزي)' : 'Restaurant Name (English)'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'وصف المطعم (عربي)' : 'Restaurant Description (Arabic)'}
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'وصف المطعم (إنجليزي)' : 'Restaurant Description (English)'}
                                </label>
                                <textarea
                                    value={formData.description_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.address_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address_ar: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.address_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address_en: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>


                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'البائع (اختياري)' : 'Seller (Optional)'}
                                </label>
                                <select
                                    value={formData.seller_id || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, seller_id: e.target.value || null }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">{language === 'ar' ? 'لا يوجد بائع' : 'No Seller'}</option>
                                    {sellers.map(seller => (
                                        <option key={seller.id} value={seller.id}>
                                            {seller.name} ({seller.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'شعار المطعم' : 'Restaurant Logo'}
                                </label>
                                
                                {/* Current Logo Display */}
                                {editingRestaurant && editingRestaurant.logo && (
                                    <div style={{
                                        marginBottom: '0.5rem',
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#f9fafb'
                                    }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {language === 'ar' ? 'الشعار الحالي:' : 'Current Logo:'}
                                        </div>
                                        <img 
                                            src={`/storage/${editingRestaurant.logo}`} 
                                            alt="Current Logo"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '0.25rem'
                                            }}
                                        />
                                    </div>
                                )}
                                
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.files[0] }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        style={{
                                            width: '1rem',
                                            height: '1rem'
                                        }}
                                    />
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        {language === 'ar' ? 'المطعم نشط' : 'Restaurant is Active'}
                                    </span>
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
                                        setFormData({
                                            name_ar: '',
                                            name_en: '',
                                            description_ar: '',
                                            description_en: '',
                                            phone: '',
                                            email: '',
                                            address_ar: '',
            address_en: '',
            seller_id: null,
            is_active: true,
                                            logo: null
                                        });
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(107, 114, 128, 0.1)',
                                        color: 'rgb(107, 114, 128)',
                                        border: '1px solid rgba(107, 114, 128, 0.2)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
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
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {editingRestaurant 
                                        ? (language === 'ar' ? 'تحديث المطعم' : 'Update Restaurant')
                                        : (language === 'ar' ? 'إضافة المطعم' : 'Add Restaurant')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Popup Message */}
            <PopupMessage
                show={popup.show}
                onClose={hidePopup}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                confirmText={popup.confirmText}
                cancelText={popup.cancelText}
                onConfirm={popup.onConfirm}
                onCancel={popup.onCancel}
            />
        </div>
    );
};

export default AdminRestaurants;
