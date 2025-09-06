import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import { usePopupMessage } from '../../hooks/usePopupMessage';

const AdminSubscriptions = () => {
    const { t, dir, language } = useLanguage();
    const { popup, showConfirm, showSuccess, showError, hidePopup } = usePopupMessage();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        restaurant_id: '',
        user_id: '',
        date_from: '',
        date_to: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [formData, setFormData] = useState({
        status: 'pending',
        notes: ''
    });

    useEffect(() => {
        fetchSubscriptions();
        fetchRestaurants();
        fetchUsers();
        fetchStatusOptions();
        fetchStatistics();
    }, [pagination.current_page, searchTerm, filters]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.current_page,
                search: searchTerm,
                ...filters
            });

            const response = await fetch(`/api/admin/subscriptions?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/admin/subscriptions/restaurants/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.data);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/subscriptions/users/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStatusOptions = async () => {
        try {
            const response = await fetch('/api/admin/subscriptions/status-options', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStatusOptions(data.data);
            }
        } catch (error) {
            console.error('Error fetching status options:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/api/admin/subscriptions/statistics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStatistics(data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current_page: page }));
    };

    const handleEdit = (subscription) => {
        setEditingSubscription(subscription);
        setFormData({
            status: subscription.status,
            notes: subscription.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/subscriptions/${editingSubscription.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowModal(false);
                setEditingSubscription(null);
                fetchSubscriptions();
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
        }
    };

    const handleDelete = async (id) => {
        const subscription = subscriptions.find(s => s.id === id);
        const subscriptionInfo = subscription 
            ? `${subscription.user?.name || 'Unknown'} - ${subscription.restaurant?.name || 'Unknown'}`
            : 'الاشتراك';
        
        showConfirm(
            language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
            language === 'ar' 
                ? `هل أنت متأكد من حذف الاشتراك "${subscriptionInfo}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete subscription "${subscriptionInfo}"? This action cannot be undone.`,
            async () => {
                try {
                    const response = await fetch(`/api/admin/subscriptions/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        fetchSubscriptions();
                        showSuccess(
                            language === 'ar' ? 'تم حذف الاشتراك بنجاح' : 'Subscription deleted successfully',
                            language === 'ar' ? 'نجح الحذف' : 'Delete Successful'
                        );
                    } else {
                        showError(
                            language === 'ar' ? 'حدث خطأ أثناء حذف الاشتراك' : 'Error deleting subscription',
                            language === 'ar' ? 'خطأ في الحذف' : 'Delete Error'
                        );
                    }
                } catch (error) {
                    console.error('Error deleting subscription:', error);
                    showError(
                        language === 'ar' ? 'حدث خطأ أثناء حذف الاشتراك' : 'Error deleting subscription',
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

    const handleUpdateItemStatus = async (subscriptionId, itemId, status) => {
        try {
            const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/items/${itemId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchSubscriptions();
            }
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    const getStatusLabel = (status) => {
        const statusOption = statusOptions.find(option => option.value === status);
        return statusOption ? (language === 'ar' ? statusOption.label_ar : statusOption.label_en) : status;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            active: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            completed: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            cancelled: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        };
        return colors[status] || colors.pending;
    };

    const getItemStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            preparing: '#3b82f6',
            ready: '#10b981',
            delivered: '#059669'
        };
        return colors[status] || colors.pending;
    };

    const getRestaurantName = (restaurantId) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        return restaurant ? (language === 'ar' ? restaurant.name_ar : restaurant.name_en) : 'Unknown';
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'OMR'
        }).format(amount);
    };

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
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        📋 {language === 'ar' ? 'إدارة الاشتراكات' : 'Subscriptions Management'}
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '1.1rem'
                    }}>
                        {language === 'ar' ? 'إدارة جميع الاشتراكات في النظام' : 'Manage all subscriptions in the system'}
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.totalSubscriptions || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#10b981',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.activeSubscriptions || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'اشتراكات نشطة' : 'Active Subscriptions'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#f59e0b',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.pendingSubscriptions || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'في الانتظار' : 'Pending'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#8b5cf6',
                        marginBottom: '0.5rem'
                    }}>
                        {formatCurrency(statistics.totalRevenue || 0)}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    alignItems: 'end'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'البحث' : 'Search'}
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder={language === 'ar' ? 'البحث في الاشتراكات...' : 'Search subscriptions...'}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                transition: 'border-color 0.3s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'الحالة' : 'Status'}
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {language === 'ar' ? option.label_ar : option.label_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'المطعم' : 'Restaurant'}
                        </label>
                        <select
                            value={filters.restaurant_id}
                            onChange={(e) => handleFilterChange('restaurant_id', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">{language === 'ar' ? 'جميع المطاعم' : 'All Restaurants'}</option>
                            {restaurants.map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'العميل' : 'Customer'}
                        </label>
                        <select
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">{language === 'ar' ? 'جميع العملاء' : 'All Customers'}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'من تاريخ' : 'From Date'}
                        </label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
                        </label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Subscriptions List */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#6b7280'
                    }}>
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {subscriptions.map(subscription => (
                                <div key={subscription.id} style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                margin: 0,
                                                marginBottom: '0.5rem'
                                            }}>
                                                {language === 'ar' ? 'اشتراك' : 'Subscription'} #{subscription.id}
                                            </h3>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                flexWrap: 'wrap',
                                                fontSize: '0.875rem',
                                                color: '#6b7280'
                                            }}>
                                                <span>
                                                    <strong>{language === 'ar' ? 'العميل:' : 'Customer:'}</strong> {getUserName(subscription.user_id)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'المطعم:' : 'Restaurant:'}</strong> {getRestaurantName(subscription.restaurant_id)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {formatDate(subscription.created_at)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'المبلغ:' : 'Amount:'}</strong> {formatCurrency(subscription.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                background: getStatusColor(subscription.status),
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600'
                                            }}>
                                                {getStatusLabel(subscription.status)}
                                            </span>
                                            
                                            <button
                                                onClick={() => handleEdit(subscription)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                ✏️ {language === 'ar' ? 'تعديل' : 'Edit'}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDelete(subscription.id)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                🗑️ {language === 'ar' ? 'حذف' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subscription Items */}
                                    {subscription.items && subscription.items.length > 0 && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: 'rgba(249, 250, 251, 0.8)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(229, 231, 235, 0.5)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                margin: 0,
                                                marginBottom: '1rem'
                                            }}>
                                                {language === 'ar' ? 'الوجبات المطلوبة:' : 'Requested Meals:'}
                                            </h4>
                                            
                                            <div style={{
                                                display: 'grid',
                                                gap: '0.75rem'
                                            }}>
                                                {subscription.items.map(item => (
                                                    <div key={item.id} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        background: 'white',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid rgba(229, 231, 235, 0.5)'
                                                    }}>
                                                        <div>
                                                            <div style={{
                                                                fontWeight: '600',
                                                                color: '#1f2937',
                                                                marginBottom: '0.25rem'
                                                            }}>
                                                                {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.875rem',
                                                                color: '#6b7280'
                                                            }}>
                                                                {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '0.5rem',
                                                            alignItems: 'center'
                                                        }}>
                                                            <span style={{
                                                                background: getItemStatusColor(item.status),
                                                                color: 'white',
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                {item.status}
                                                            </span>
                                                            
                                                            <select
                                                                value={item.status}
                                                                onChange={(e) => handleUpdateItemStatus(subscription.id, item.id, e.target.value)}
                                                                style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '0.25rem',
                                                                    fontSize: '0.75rem',
                                                                    backgroundColor: 'white'
                                                                }}
                                                            >
                                                                <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                                                                <option value="preparing">{language === 'ar' ? 'قيد التحضير' : 'Preparing'}</option>
                                                                <option value="ready">{language === 'ar' ? 'جاهز' : 'Ready'}</option>
                                                                <option value="delivered">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {subscription.notes && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#1e40af',
                                                margin: 0,
                                                marginBottom: '0.5rem'
                                            }}>
                                                {language === 'ar' ? 'ملاحظات:' : 'Notes:'}
                                            </h4>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#1e40af',
                                                margin: 0,
                                                lineHeight: '1.5'
                                            }}>
                                                {subscription.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '2rem'
                            }}>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: pagination.current_page === 1 ? '#f9fafb' : 'white',
                                        color: pagination.current_page === 1 ? '#9ca3af' : '#374151',
                                        cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'السابق' : 'Previous'}
                                </button>

                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '2px solid',
                                            borderColor: page === pagination.current_page ? '#667eea' : '#e5e7eb',
                                            borderRadius: '0.5rem',
                                            backgroundColor: page === pagination.current_page ? '#667eea' : 'white',
                                            color: page === pagination.current_page ? 'white' : '#374151',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: pagination.current_page === pagination.last_page ? '#f9fafb' : 'white',
                                        color: pagination.current_page === pagination.last_page ? '#9ca3af' : '#374151',
                                        cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'التالي' : 'Next'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: '#1f2937'
                        }}>
                            {language === 'ar' ? 'تعديل الاشتراك' : 'Edit Subscription'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'الحالة' : 'Status'} *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {language === 'ar' ? option.label_ar : option.label_en}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
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
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'تحديث' : 'Update'}
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

export default AdminSubscriptions;
