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
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        phone: '',
        seller_id: null,
        is_active: true,
        logo: null,
        locations: []
    });
    const [sellers, setSellers] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]); // [{value, labelAr, labelEn}]

    // جلب خيارات المناطق (معرّفة أعلى لتجنب ReferenceError)
    const fetchLocationOptions = async () => {
        try {
            const response = await fetch('/api/areas/api-format');
            if (response.ok) {
                const data = await response.json();
                const options = Object.entries(data.data).map(([code, names]) => ({
                    value: code,
                    labelAr: names.ar,
                    labelEn: names.en
                }));
                setLocationOptions(options);
            }
        } catch (error) {
            console.error('Error fetching location options:', error);
        }
    };

    const toggleLocation = (code) => {
        setFormData(prev => {
            const exists = (prev.locations || []).includes(code);
            const updated = exists
                ? prev.locations.filter(c => c !== code)
                : [ ...(prev.locations || []), code ];
            return { ...prev, locations: updated };
        });
    };

    useEffect(() => {
        fetchRestaurants();
        fetchSellers();
        fetchLocationOptions();
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
            seller_id: restaurant.seller_id || null,
            is_active: restaurant.is_active,
            logo: null,
            locations: restaurant.locations || []
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
                    } else if (key === 'locations' && Array.isArray(value)) {
                        value.forEach(v => formDataToSend.append('locations[]', v));
                        return;
                    }
                    formDataToSend.append(key, value);
                }
            });
            

            const url = editingRestaurant 
                ? `/api/admin/restaurants/${editingRestaurant.id}`
                : '/api/admin/restaurants';

            // استخدام POST دائماً مع إضافة _method=PUT عند التعديل لضمان قراءة الحقول في Laravel مع multipart/form-data
            const method = 'POST';
            if (editingRestaurant) {
                formDataToSend.append('_method', 'PUT');
            }

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

    // Sort restaurants
    const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedRestaurants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRestaurants = sortedRestaurants.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
                borderRadius: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                padding: window.innerWidth <= 768 ? '1rem' : '2rem',
                marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
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
                        fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0
                    }}>
                        {language === 'ar' ? 'إدارة المطاعم' : 'Restaurant Management'}
                    </h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: window.innerWidth <= 768 ? '0.5rem 1rem' : '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: window.innerWidth <= 768 ? '0.375rem' : '0.5rem',
                            fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem',
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
                    gap: window.innerWidth <= 768 ? '0.5rem' : '1rem',
                    flexWrap: 'wrap',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: window.innerWidth <= 768 ? '100%' : '200px'
                    }}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث عن المطاعم...' : 'Search restaurants...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: window.innerWidth <= 768 ? '0.375rem' : '0.5rem',
                                fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: window.innerWidth <= 768 ? '0.375rem' : '0.5rem',
                            fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem',
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

            {/* Restaurants Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
            }}>
                {/* Table Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{
                            margin: 0,
                            color: '#2d3748',
                            fontWeight: '600',
                            fontSize: '1.25rem'
                        }}>
                            {language === 'ar' ? `المطاعم (${filteredRestaurants.length})` : `Restaurants (${filteredRestaurants.length})`}
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#64748b'
                        }}>
                            <span>{language === 'ar' ? 'عرض:' : 'Show:'}</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(parseInt(e.target.value));
                                    setCurrentPage(1);
                                }}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    border: '1px solid #cbd5e0',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    background: 'white'
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.875rem'
                    }}>
                        <thead>
                            <tr style={{
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                borderBottom: '2px solid #cbd5e0'
                            }}>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    position: 'relative'
                                }}
                                onClick={() => handleSort('logo')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {language === 'ar' ? 'الشعار' : 'Logo'}
                                        {sortField === 'logo' && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => handleSort('name')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {language === 'ar' ? 'اسم المطعم' : 'Restaurant Name'}
                                        {sortField === 'name' && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => handleSort('phone')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {language === 'ar' ? 'الهاتف' : 'Phone'}
                                        {sortField === 'phone' && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => handleSort('meals_count')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {language === 'ar' ? 'عدد الوجبات' : 'Meals Count'}
                                        {sortField === 'meals_count' && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => handleSort('is_active')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {language === 'ar' ? 'الحالة' : 'Status'}
                                        {sortField === 'is_active' && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => handleSort('created_at')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {language === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}
                                        {sortField === 'created_at' && (
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th style={{
                                    padding: '1rem 0.75rem',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRestaurants.map((restaurant, index) => (
                                <tr
                                    key={restaurant.id}
                                    style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        transition: 'all 0.2s ease',
                                        background: index % 2 === 0 ? 'white' : '#f8fafc'
                        }}
                        onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f1f5f9';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                                        e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f8fafc';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                                    {/* Logo */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '0.5rem',
                            background: restaurant.logo 
                                ? `url(/storage/${restaurant.logo})` 
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            color: 'white',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            {!restaurant.logo && '🍽️'}
                        </div>
                                    </td>

                                    {/* Restaurant Name */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div>
                        <div style={{
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                marginBottom: '0.25rem',
                                                fontSize: '0.875rem'
                                }}>
                                    {restaurant.name}
                                            </div>
                                            <div style={{
                                                color: '#6b7280',
                                                fontSize: '0.75rem',
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                maxWidth: '200px'
                                }}>
                                    {restaurant.description}
                            </div>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                            <div style={{
                                            color: '#374151',
                                            fontSize: '0.875rem'
                                        }}>
                                            {restaurant.phone || (
                                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                                    {language === 'ar' ? 'غير محدد' : 'Not specified'}
                                </span>
                                            )}
                            </div>
                                    </td>


                                    {/* Meals Count */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                            <div style={{
                                display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                            }}>
                                <span style={{
                                                background: '#dbeafe',
                                                color: '#1e40af',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                                fontWeight: '600'
                                }}>
                                                {restaurant.meals_count || 0}
                                </span>
                                <span style={{
                                                color: '#6b7280',
                                                fontSize: '0.75rem'
                                }}>
                                                {language === 'ar' ? 'وجبة' : 'meals'}
                                </span>
                            </div>
                                    </td>

                                    {/* Status */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                <span style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: restaurant.is_active 
                                                ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                                                : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                            color: restaurant.is_active ? '#166534' : '#dc2626',
                                            border: `1px solid ${restaurant.is_active ? '#bbf7d0' : '#fecaca'}`,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: restaurant.is_active ? '#22c55e' : '#ef4444'
                                            }}></span>
                                            {restaurant.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                                </span>
                                    </td>
                            
                                    {/* Created Date */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                            <div style={{
                                            color: '#6b7280',
                                            fontSize: '0.875rem'
                                        }}>
                                            {new Date(restaurant.created_at).toLocaleDateString('en-GB')}
                            </div>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{
                            display: 'flex',
                                            gap: '0.5rem',
                                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => handleEdit(restaurant)}
                                style={{
                                    padding: '0.5rem',
                                                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                                    color: '#1e40af',
                                                    border: '1px solid #93c5fd',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                }}
                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                                                    e.target.style.transform = 'translateY(0)';
                                }}
                                                title={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                                                ✏️
                            </button>
                            <button
                                onClick={() => handleToggleRestaurantStatus(restaurant.id, restaurant.is_active)}
                                style={{
                                    padding: '0.5rem',
                                                    background: restaurant.is_active 
                                                        ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' 
                                                        : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                                    color: restaurant.is_active ? '#dc2626' : '#166534',
                                                    border: `1px solid ${restaurant.is_active ? '#fecaca' : '#bbf7d0'}`,
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                }}
                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                }}
                                                title={restaurant.is_active ? (language === 'ar' ? 'إلغاء تفعيل' : 'Deactivate') : (language === 'ar' ? 'تفعيل' : 'Activate')}
                            >
                                                {restaurant.is_active ? '⏸️' : '▶️'}
                            </button>
                            <button
                                onClick={() => handleDeleteRestaurant(restaurant.id)}
                                style={{
                                    padding: '0.5rem',
                                                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                                    color: '#dc2626',
                                                    border: '1px solid #fecaca',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                }}
                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                                                    e.target.style.transform = 'translateY(0)';
                                }}
                                                title={language === 'ar' ? 'حذف' : 'Delete'}
                            >
                                                🗑️
                            </button>
                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            color: '#6b7280',
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? `عرض ${startIndex + 1} إلى ${Math.min(startIndex + itemsPerPage, sortedRestaurants.length)} من ${sortedRestaurants.length} مطعم`
                                : `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, sortedRestaurants.length)} of ${sortedRestaurants.length} restaurants`
                            }
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    background: currentPage === 1 ? '#f3f4f6' : 'white',
                                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {language === 'ar' ? 'السابق' : 'Previous'}
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: currentPage === pageNum ? '#3b82f6' : 'white',
                                            color: currentPage === pageNum ? 'white' : '#374151',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: currentPage === pageNum ? '600' : '400'
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    background: currentPage === totalPages ? '#f3f4f6' : 'white',
                                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {language === 'ar' ? 'التالي' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
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




                            {/* Locations (Areas) Selection */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'المناطق المتاحة' : 'Available Areas'}
                                </label>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem',
                                    background: 'white'
                                }}>
                                    {locationOptions.map(opt => {
                                        const checked = (formData.locations || []).includes(opt.value);
                                        return (
                                            <label key={opt.value} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.35rem 0.5rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '0.375rem',
                                                background: checked ? 'rgba(74,117,124,0.08)' : 'white',
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleLocation(opt.value)}
                                                />
                                                <span>{language === 'ar' ? opt.labelAr : opt.labelEn}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                    {language === 'ar' ? 'يمكن اختيار أكثر من منطقة.' : 'You can select multiple areas.'}
                                </div>
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
