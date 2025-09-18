import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import { usePopupMessage } from '../../hooks/usePopupMessage';

const AdminSubscriptions = () => {
    const { t, dir, language } = useLanguage();
    const { popup, showConfirm, showSuccess, showError, hidePopup } = usePopupMessage();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState({});
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
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
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
                console.log('Fetched subscriptions data:', data.data);
                if (data.data && data.data.length > 0) {
                    console.log('First subscription:', data.data[0]);
                    console.log('First subscription deliveryAddress:', data.data[0].deliveryAddress);
                }
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
        const updateKey = `${subscriptionId}-${itemId}`;
        
        try {
            // Set loading state
            setUpdatingStatus(prev => ({ ...prev, [updateKey]: true }));
            
            const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/items/${itemId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const responseData = await response.json();

            if (response.ok) {
                // Show success message
                showSuccess(
                    language === 'ar' ? 'تم تحديث حالة الوجبة بنجاح' : 'Meal status updated successfully',
                    language === 'ar' ? 'تم التحديث' : 'Updated'
                );
                
                // Refresh the subscriptions data
                fetchSubscriptions();
            } else {
                // Show error message
                const errorMessage = responseData.message || 
                    (language === 'ar' ? 'حدث خطأ في تحديث حالة الوجبة' : 'Error updating meal status');
                
                showError(
                    errorMessage,
                    language === 'ar' ? 'خطأ في التحديث' : 'Update Error'
                );
                
                // Refresh data to revert the UI change
                fetchSubscriptions();
            }
        } catch (error) {
            console.error('Error updating item status:', error);
            
            showError(
                language === 'ar' ? 'حدث خطأ في الاتصال بالخادم' : 'Network error occurred',
                language === 'ar' ? 'خطأ في الاتصال' : 'Connection Error'
            );
            
            // Refresh data to revert the UI change
            fetchSubscriptions();
        } finally {
            // Clear loading state
            setUpdatingStatus(prev => ({ ...prev, [updateKey]: false }));
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
            delivered: '#059669',
            cancelled: '#ef4444'
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

    const getDeliveryPhone = (subscription) => {
        return subscription.delivery_address?.phone || subscription.deliveryAddress?.phone || (language === 'ar' ? 'غير متوفر' : 'Not Available');
    };

    const getDeliveryLocation = (subscription) => {
        return subscription.delivery_address?.city || subscription.delivery_address?.location || subscription.deliveryAddress?.city || subscription.deliveryAddress?.location || (language === 'ar' ? 'غير متوفر' : 'Not Available');
    };

    const getDeliveryAddress = (subscription) => {
        return subscription.delivery_address?.address || subscription.deliveryAddress?.address || (language === 'ar' ? 'غير متوفر' : 'Not Available');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return '';
            }
            
            // Format date based on language preference
            if (language === 'ar') {
                // Arabic date formatting with Gregorian calendar
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    calendar: 'gregory' // Ensure Gregorian calendar
                };
                
                const formattedDate = date.toLocaleDateString('ar-SA', options);
                
                // Check if the formatted date is valid and doesn't contain "Invalid"
                if (formattedDate === 'Invalid Date' || formattedDate.includes('Invalid') || formattedDate === 'NaN') {
                    console.warn('Formatted date is invalid:', dateString);
                    return '';
                }
                
                return formattedDate;
            } else {
                // English date formatting
                const formattedDate = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                // Check if the formatted date is valid and doesn't contain "Invalid"
                if (formattedDate === 'Invalid Date' || formattedDate.includes('Invalid') || formattedDate === 'NaN') {
                    console.warn('Formatted date is invalid:', dateString);
                    return '';
                }
                
                return formattedDate;
            }
        } catch (error) {
            console.error('Error formatting date:', error, 'Date string:', dateString);
            return '';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'OMR'
        }).format(amount);
    };

    // Filter subscriptions based on search and filters
    const filteredSubscriptions = subscriptions.filter(subscription => {
        const matchesSearch = !searchTerm || 
            subscription.id.toString().includes(searchTerm) ||
            getUserName(subscription.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getRestaurantName(subscription.restaurant_id).toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filters.status === 'all' || subscription.status === filters.status;
        const matchesRestaurant = !filters.restaurant_id || subscription.restaurant_id == filters.restaurant_id;
        const matchesUser = !filters.user_id || subscription.user_id == filters.user_id;
        
        let matchesDate = true;
        if (filters.date_from) {
            const subscriptionDate = new Date(subscription.created_at);
            const fromDate = new Date(filters.date_from);
            matchesDate = matchesDate && subscriptionDate >= fromDate;
        }
        if (filters.date_to) {
            const subscriptionDate = new Date(subscription.created_at);
            const toDate = new Date(filters.date_to);
            matchesDate = matchesDate && subscriptionDate <= toDate;
        }
        
        return matchesSearch && matchesStatus && matchesRestaurant && matchesUser && matchesDate;
    });

    // Sort subscriptions
    const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'id') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        } else if (sortField === 'restaurant') {
            aValue = getRestaurantName(a.restaurant_id);
            bValue = getRestaurantName(b.restaurant_id);
        } else if (sortField === 'user') {
            aValue = getUserName(a.user_id);
            bValue = getUserName(b.user_id);
        } else if (sortField === 'total_amount') {
            aValue = parseFloat(a.total_amount || 0);
            bValue = parseFloat(b.total_amount || 0);
        } else if (sortField === 'subscription_amount') {
            aValue = (parseFloat(a.total_amount || 0) - parseFloat(a.delivery_price || 0)) || 0;
            bValue = (parseFloat(b.total_amount || 0) - parseFloat(b.delivery_price || 0)) || 0;
        } else if (sortField === 'delivery_price') {
            aValue = parseFloat(a.delivery_price || 0) || 0;
            bValue = parseFloat(b.delivery_price || 0) || 0;
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
    const totalPages = Math.ceil(sortedSubscriptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSubscriptions = sortedSubscriptions.slice(startIndex, startIndex + itemsPerPage);

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

    return (
        <div style={{ direction: dir }}>
            {/* CSS for loading spinner animation */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
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

            {/* Subscriptions Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {/* Table Header Controls */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}>
                                            <div style={{
                                                display: 'flex',
                        alignItems: 'center',
                                                gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? `عرض ${filteredSubscriptions.length} اشتراك` : `Showing ${filteredSubscriptions.length} subscriptions`}
                                                </span>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            color: '#6b7280'
                        }}>
                            {language === 'ar' ? 'عدد العناصر:' : 'Items per page:'}
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                                                style={{
                                padding: '0.5rem',
                                border: '2px solid #e5e7eb',
                                                    borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                                        </div>
                                    </div>
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
                        {/* Subscriptions Table */}
                        <div style={{
                            overflowX: 'auto',
                                            borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.9rem'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        borderBottom: '2px solid #e5e7eb'
                                    }}>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                                fontWeight: '600',
                                                color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'رقم الاشتراك' : 'Subscription ID'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'العميل' : 'Customer'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'المطعم' : 'Restaurant'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => handleSort('subscription_amount')}>
                                            {language === 'ar' ? 'مبلغ الاشتراك' : 'Subscription Amount'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => handleSort('delivery_price')}>
                                            {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => handleSort('total_amount')}>
                                            {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'التاريخ' : 'Date'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'الحالة' : 'Status'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'الوجبات' : 'Meals'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'الإجراءات' : 'Actions'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSubscriptions.length > 0 ? paginatedSubscriptions.map((subscription, index) => (
                                        <tr key={subscription.id} style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                                        }}>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                            <div style={{
                                                                fontWeight: '600',
                                                                color: '#1f2937',
                                                    fontSize: '0.95rem'
                                                            }}>
                                                    #{subscription.id}
                                                            </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                            <div style={{
                                                    color: '#374151',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                            }}>
                                                    {getUserName(subscription.user_id)}
                                                            </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                        <div style={{
                                                    color: '#374151',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {getRestaurantName(subscription.restaurant_id)}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: '#3b82f6',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {formatCurrency((parseFloat(subscription.total_amount || 0) - parseFloat(subscription.delivery_price || 0)).toFixed(2))}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: parseFloat(subscription.delivery_price || 0) > 0 ? '#f59e0b' : '#10b981',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {parseFloat(subscription.delivery_price || 0) > 0 
                                                        ? formatCurrency(parseFloat(subscription.delivery_price || 0).toFixed(2))
                                                        : (language === 'ar' ? 'مجاني' : 'Free')}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: '#059669',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {formatCurrency(parseFloat(subscription.total_amount || 0).toFixed(2))}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {formatDate(subscription.created_at)}
                                                    </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                        <div style={{
                                                    color: subscription.status === 'active' ? '#10b981' : 
                                                          subscription.status === 'pending' ? '#f59e0b' :
                                                          subscription.status === 'completed' ? '#3b82f6' : '#ef4444',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {getStatusLabel(subscription.status)}
                                                </div>
                                            </td>
                                            <td style={{
                                            padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                <button
                                                    onClick={() => {
                                                        console.log('View Meals clicked for subscription:', subscription);
                                                        console.log('deliveryAddress:', subscription.deliveryAddress);
                                                        const modal = document.getElementById(`meals-modal-${subscription.id}`);
                                                        if (modal) {
                                                            modal.style.display = 'flex';
                                                        }
                                                    }}
                                                    style={{
                                                        background: '#8b5cf6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.375rem',
                                                        padding: '0.5rem 0.75rem',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = '#7c3aed';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = '#8b5cf6';
                                                    }}
                                                >
                                                    🍽️ {language === 'ar' ? 'عرض الوجبات' : 'View Meals'}
                                                </button>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '0.5rem',
                                                    justifyContent: 'center',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <button
                                                        onClick={() => handleEdit(subscription)}
                                                        style={{
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.375rem',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.backgroundColor = '#2563eb';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.backgroundColor = '#3b82f6';
                                                        }}
                                                    >
                                                        {language === 'ar' ? 'تعديل' : 'Edit'}
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDelete(subscription.id)}
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.375rem',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.backgroundColor = '#dc2626';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.backgroundColor = '#ef4444';
                                                        }}
                                                    >
                                                        {language === 'ar' ? 'حذف' : 'Delete'}
                                                    </button>
                                        </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="10" style={{
                                                padding: '3rem',
                                                textAlign: 'center',
                                                color: '#6b7280',
                                                fontSize: '1.1rem'
                                            }}>
                                                {language === 'ar' ? 'لا توجد اشتراكات مطابقة للبحث' : 'No subscriptions found matching your search'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(248, 250, 252, 0.8)',
                                borderRadius: '0.75rem',
                                border: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
                                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}
                                    onMouseOver={(e) => {
                                        if (currentPage !== 1) {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.backgroundColor = '#f8fafc';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (currentPage !== 1) {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    {language === 'ar' ? 'السابق' : 'Previous'}
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            border: '2px solid',
                                            borderColor: page === currentPage ? '#667eea' : '#e5e7eb',
                                            borderRadius: '0.5rem',
                                            backgroundColor: page === currentPage ? '#667eea' : 'white',
                                            color: page === currentPage ? 'white' : '#374151',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontWeight: '500',
                                            fontSize: '0.9rem',
                                            minWidth: '2.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            if (page !== currentPage) {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.backgroundColor = '#f8fafc';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (page !== currentPage) {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.backgroundColor = 'white';
                                            }
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
                                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}
                                    onMouseOver={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.backgroundColor = '#f8fafc';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.backgroundColor = 'white';
                                        }
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

            {/* Meals Modal for each subscription */}
            {paginatedSubscriptions.map(subscription => (
                <div
                    key={`meals-modal-${subscription.id}`}
                    id={`meals-modal-${subscription.id}`}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                {language === 'ar' ? `وجبات الاشتراك #${subscription.id}` : `Meals for Subscription #${subscription.id}`}
                            </h2>
                            <button
                                onClick={() => {
                                    const modal = document.getElementById(`meals-modal-${subscription.id}`);
                                    if (modal) {
                                        modal.style.display = 'none';
                                    }
                                }}
                                style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#dc2626';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#ef4444';
                                }}
                            >
                                ✕ {language === 'ar' ? 'إغلاق' : 'Close'}
                            </button>
                        </div>

                        {/* Subscription Info */}
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#1e40af',
                                margin: 0,
                                marginBottom: '1rem'
                            }}>
                                {language === 'ar' ? 'معلومات الاشتراك' : 'Subscription Information'}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                <div>
                                    <strong style={{ color: '#1e40af' }}>
                                        {language === 'ar' ? 'المطعم:' : 'Restaurant:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {getRestaurantName(subscription.restaurant_id)}
                                    </span>
                                </div>
                                <div>
                                    <strong style={{ color: '#1e40af' }}>
                                        {language === 'ar' ? 'المبلغ:' : 'Amount:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {formatCurrency(subscription.total_amount)}
                                    </span>
                                </div>
                                <div>
                                    <strong style={{ color: '#1e40af' }}>
                                        {language === 'ar' ? 'التاريخ:' : 'Date:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {formatDate(subscription.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#059669',
                                margin: 0,
                                marginBottom: '1rem'
                            }}>
                                {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                <div>
                                    <strong style={{ color: '#059669' }}>
                                        {language === 'ar' ? 'الاسم:' : 'Name:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {getUserName(subscription.user_id)}
                                    </span>
                                </div>
                                <div>
                                    <strong style={{ color: '#059669' }}>
                                        {language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {getDeliveryPhone(subscription)}
                                    </span>
                                </div>
                                <div>
                                    <strong style={{ color: '#059669' }}>
                                        {language === 'ar' ? 'الموقع:' : 'Location:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {getDeliveryLocation(subscription)}
                                    </span>
                                </div>
                                <div>
                                    <strong style={{ color: '#059669' }}>
                                        {language === 'ar' ? 'العنوان:' : 'Address:'}
                                    </strong>
                                    <span style={{ color: '#374151', marginLeft: '0.5rem' }}>
                                        {getDeliveryAddress(subscription)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Meals List */}
                        {subscription.items && subscription.items.length > 0 ? (
                            <div>
                                <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    marginBottom: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(79, 70, 229, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    🍽️ {language === 'ar' ? 'تفاصيل الوجبات المطلوبة' : 'Requested Meals Details'} ({subscription.items.length} {language === 'ar' ? 'وجبة' : 'meals'})
                                </div>
                                
                                {/* Quick Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                    gap: '0.75rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        textAlign: 'center',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                                            {subscription.items.filter(item => item.status === 'delivered').length}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {language === 'ar' ? 'تم التوصيل' : 'Delivered'}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        textAlign: 'center',
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
                                            {subscription.items.filter(item => item.status === 'pending').length}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {language === 'ar' ? 'في الانتظار' : 'Pending'}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        textAlign: 'center',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>
                                            {subscription.items.filter(item => item.status === 'preparing').length}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {language === 'ar' ? 'قيد التحضير' : 'Preparing'}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        textAlign: 'center',
                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444' }}>
                                            {subscription.items.filter(item => item.status === 'cancelled').length}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {language === 'ar' ? 'ملغي' : 'Cancelled'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gap: '1rem'
                                }}>
                                {subscription.items.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        borderRadius: '1rem',
                                        border: '2px solid #e5e7eb',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.borderColor = '#4f46e5';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                marginBottom: '0.25rem',
                                                fontSize: '1rem'
                                            }}>
                                                {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                            </div>
                                            
                                            {/* Delivery Date Display */}
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#4f46e5',
                                                fontWeight: '600',
                                                marginBottom: '0.25rem',
                                                background: 'rgba(79, 70, 229, 0.1)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid rgba(79, 70, 229, 0.2)',
                                                display: 'inline-block'
                                            }}>
                                                📅 {language === 'ar' ? 'تاريخ التوصيل:' : 'Delivery Date:'} {formatDate(item.delivery_date) || (language === 'ar' ? 'غير محدد' : 'Not set')}
                                            </div>
                                            
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {language === 'ar' ? 'الكمية:' : 'Quantity:'} {item.quantity}
                                            </div>
                                            
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {language === 'ar' ? 'يوم الأسبوع:' : 'Day of Week:'} {item.day_of_week_text || item.day_of_week}
                                            </div>
                                            
                                            {item.meal?.description_ar && (
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#9ca3af',
                                                    marginTop: '0.25rem',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {language === 'ar' ? item.meal.description_ar : item.meal.description_en}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            alignItems: 'center'
                                        }}>
                                            {/* Loading indicator */}
                                            {updatingStatus[`${subscription.id}-${item.id}`] && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    color: '#6b7280',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        border: '2px solid #e5e7eb',
                                                        borderTop: '2px solid #3b82f6',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }}></div>
                                                    {language === 'ar' ? 'جاري التحديث...' : 'Updating...'}
                                                </div>
                                            )}
                                            <div style={{
                                                background: getItemStatusColor(item.status),
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                minWidth: '100px',
                                                textAlign: 'center'
                                            }}>
                                                {language === 'ar' ? 
                                                    (item.status === 'pending' ? 'في الانتظار' :
                                                     item.status === 'preparing' ? 'قيد التحضير' :
                                                     item.status === 'delivered' ? 'تم التوصيل' :
                                                     item.status === 'cancelled' ? 'ملغي' : item.status) :
                                                    item.status.charAt(0).toUpperCase() + item.status.slice(1)
                                                }
                                            </div>
                                            
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleUpdateItemStatus(subscription.id, item.id, e.target.value)}
                                                disabled={updatingStatus[`${subscription.id}-${item.id}`] || subscription.status === 'cancelled'}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.875rem',
                                                    backgroundColor: (updatingStatus[`${subscription.id}-${item.id}`] || subscription.status === 'cancelled') ? '#f3f4f6' : 'white',
                                                    cursor: (updatingStatus[`${subscription.id}-${item.id}`] || subscription.status === 'cancelled') ? 'not-allowed' : 'pointer',
                                                    minWidth: '120px',
                                                    opacity: (updatingStatus[`${subscription.id}-${item.id}`] || subscription.status === 'cancelled') ? 0.7 : 1,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onFocus={(e) => !(updatingStatus[`${subscription.id}-${item.id}`] || subscription.status === 'cancelled') && (e.target.style.borderColor = '#3b82f6')}
                                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            >
                                                <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                                                <option value="preparing">{language === 'ar' ? 'قيد التحضير' : 'Preparing'}</option>
                                                <option value="delivered">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                                                <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#6b7280',
                                fontSize: '1.1rem'
                            }}>
                                {language === 'ar' ? 'لا توجد وجبات في هذا الاشتراك' : 'No meals found in this subscription'}
                            </div>
                        )}

                        {subscription.notes && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(245, 158, 11, 0.2)'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#d97706',
                                    margin: 0,
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'ملاحظات:' : 'Notes:'}
                                </h4>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#d97706',
                                    margin: 0,
                                    lineHeight: '1.5'
                                }}>
                                    {subscription.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

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
