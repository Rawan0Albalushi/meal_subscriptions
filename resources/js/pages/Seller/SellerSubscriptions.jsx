import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SellerSubscriptions = () => {
    try {
        const { t, dir, language } = useLanguage();
        const [restaurants, setRestaurants] = useState([]);
        const [selectedRestaurant, setSelectedRestaurant] = useState('');
        const [subscriptions, setSubscriptions] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedSubscription, setSelectedSubscription] = useState(null);
        const [showDetailsModal, setShowDetailsModal] = useState(false);
        const [statusFilter, setStatusFilter] = useState('all');
        const [dateFilter, setDateFilter] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(10);
        const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        date_from: '',
        date_to: ''
    });
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');


    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchSubscriptions(selectedRestaurant);
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

    const fetchSubscriptions = async (restaurantId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/seller/restaurants/${restaurantId}/subscriptions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const subscriptionsData = data.data || [];
                setSubscriptions(subscriptionsData);
                
                // Debug logging
                if (process.env.NODE_ENV === 'development') {
                    console.log('Fetched subscriptions:', subscriptionsData);
                    console.log('=== Available Dates ===');
                    const allDates = new Set();
                    subscriptionsData.forEach(sub => {
                        console.log(`Subscription ${sub.id}:`, {
                            itemsCount: sub.subscription_items?.length || 0,
                            items: sub.subscription_items?.map(item => {
                                const date = new Date(item.delivery_date);
                                const isoDate = date.toISOString().split('T')[0];
                                const europeanDate = date.toLocaleDateString('en-US').split('/').reverse().join('-');
                                const usDate = date.toLocaleDateString('en-US');
                                
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                const formattedDate = `${day}-${month}-${year}`;
                                
                                allDates.add(isoDate);
                                allDates.add(europeanDate);
                                allDates.add(usDate);
                                allDates.add(formattedDate);
                                
                                return {
                                    id: item.id,
                                    delivery_date: item.delivery_date,
                                    iso_date: isoDate,
                                    european_date: europeanDate,
                                    us_date: usDate,
                                    formatted_date: formattedDate,
                                    status: item.status
                                };
                            }) || []
                        });
                    });
                    console.log('All available dates:', Array.from(allDates).sort());
                }
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSubscriptionStatus = async (subscriptionId, newStatus) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${selectedRestaurant}/subscriptions/${subscriptionId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                // تحديث فوري للاشتراك المحدد في النافذة المنبثقة
                if (selectedSubscription && selectedSubscription.id === subscriptionId) {
                    setSelectedSubscription(prev => ({
                        ...prev,
                        status: newStatus
                    }));
                }
                
                // رسالة نجاح
                showMessage(
                    language === 'ar' 
                        ? `تم تحديث حالة الاشتراك إلى ${getStatusText(newStatus)}` 
                        : `Subscription status updated to ${getStatusText(newStatus)}`,
                    'success'
                );
                
                // تحديث قائمة الاشتراكات
                fetchSubscriptions(selectedRestaurant);
            }
        } catch (error) {
            console.error('Error updating subscription status:', error);
        }
    };

    const updateItemStatus = async (subscriptionId, itemId, newStatus) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${selectedRestaurant}/subscriptions/${subscriptionId}/items/${itemId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                // تحديث فوري للاشتراك المحدد في النافذة المنبثقة
                if (selectedSubscription && selectedSubscription.id === subscriptionId) {
                    setSelectedSubscription(prev => ({
                        ...prev,
                        subscription_items: prev.subscription_items.map(item => 
                            item.id === itemId 
                                ? { ...item, status: newStatus }
                                : item
                        )
                    }));
                }
                
                // رسالة نجاح
                showMessage(
                    language === 'ar' 
                        ? `تم تحديث حالة الوجبة إلى ${getItemStatusText(newStatus)}` 
                        : `Meal status updated to ${getItemStatusText(newStatus)}`,
                    'success'
                );
                
                // تحديث قائمة الاشتراكات
                fetchSubscriptions(selectedRestaurant);
            }
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statuses = {
            'pending': language === 'ar' ? 'في الانتظار' : 'Pending',
            'active': language === 'ar' ? 'نشط' : 'Active',
            'completed': language === 'ar' ? 'مكتمل' : 'Completed',
            'cancelled': language === 'ar' ? 'ملغي' : 'Cancelled'
        };
        return statuses[status] || status;
    };

    const getItemStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'preparing': 'bg-orange-100 text-orange-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getItemStatusText = (status) => {
        const statuses = {
            'pending': language === 'ar' ? 'في الانتظار' : 'Pending',
            'preparing': language === 'ar' ? 'قيد التحضير' : 'Preparing',
            'delivered': language === 'ar' ? 'تم التوصيل' : 'Delivered',
            'cancelled': language === 'ar' ? 'ملغي' : 'Cancelled'
        };
        return statuses[status] || status;
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            status: 'all',
            date_from: '',
            date_to: ''
        });
        setStatusFilter('all');
        setDateFilter('');
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const sortSubscriptions = (subscriptions) => {
        return [...subscriptions].sort((a, b) => {
            let aValue, bValue;
            
            switch (sortField) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'customer':
                    aValue = a.user?.name || '';
                    bValue = b.user?.name || '';
                    break;
                case 'subscription_amount':
                    aValue = (parseFloat(a.total_amount || 0) - parseFloat(a.delivery_price || 0)) || 0;
                    bValue = (parseFloat(b.total_amount || 0) - parseFloat(b.delivery_price || 0)) || 0;
                    break;
                case 'delivery_price':
                    aValue = parseFloat(a.delivery_price || 0) || 0;
                    bValue = parseFloat(b.delivery_price || 0) || 0;
                    break;
                case 'total_amount':
                    aValue = parseFloat(a.total_amount || 0) || 0;
                    bValue = parseFloat(b.total_amount || 0) || 0;
                    break;
                case 'date':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.id;
                    bValue = b.id;
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const filteredSubscriptions = subscriptions.filter(subscription => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                subscription.id.toString().includes(searchLower) ||
                subscription.user?.name?.toLowerCase().includes(searchLower) ||
                subscription.user?.email?.toLowerCase().includes(searchLower) ||
                subscription.delivery_address?.address?.toLowerCase().includes(searchLower);
            
            if (!matchesSearch) return false;
        }
        
        // Filter by status
        if (filters.status !== 'all') {
            const hasMatchingStatus = subscription.subscription_items?.some(item => item.status === filters.status);
            if (!hasMatchingStatus) return false;
        }
        
        // Filter by date range
        if (filters.date_from || filters.date_to) {
            const hasMatchingDate = subscription.subscription_items?.some(item => {
                if (!item.delivery_date) return false;
                
                try {
                    const itemDate = new Date(item.delivery_date);
                    const fromDate = filters.date_from ? new Date(filters.date_from) : null;
                    const toDate = filters.date_to ? new Date(filters.date_to) : null;
                    
                    if (fromDate && itemDate < fromDate) return false;
                    if (toDate && itemDate > toDate) return false;
                    
                    return true;
                } catch (error) {
                    console.error('Error processing date:', item.delivery_date, error);
                    return false;
                }
            });
            if (!hasMatchingDate) return false;
        }
        
        // Legacy filters for backward compatibility
        if (statusFilter !== 'all') {
            const hasMatchingStatus = subscription.subscription_items?.some(item => item.status === statusFilter);
            if (!hasMatchingStatus) return false;
        }
        
        if (dateFilter) {
            const hasMatchingDate = subscription.subscription_items?.some(item => {
                if (!item.delivery_date) return false;
                
                try {
                    const itemDate = new Date(item.delivery_date).toISOString().split('T')[0];
                    return itemDate === dateFilter;
                } catch (error) {
                    return false;
                }
            });
            if (!hasMatchingDate) return false;
        }
        
        return true;
    }).map(subscription => {
        // Create a copy of subscription with filtered items
        const filteredSubscription = { ...subscription };
        
        // Filter items within each subscription based on current filters
        if (subscription.subscription_items) {
            filteredSubscription.subscription_items = subscription.subscription_items.filter(item => {
                let matchesStatus = true;
                let matchesDate = true;
                
                // Filter by status
                const currentStatusFilter = filters.status !== 'all' ? filters.status : statusFilter;
                if (currentStatusFilter !== 'all') {
                    matchesStatus = item.status === currentStatusFilter;
                }
                
                // Filter by date
                if (filters.date_from || filters.date_to) {
                    if (!item.delivery_date) {
                        matchesDate = false;
                    } else {
                        try {
                            const itemDate = new Date(item.delivery_date);
                            const fromDate = filters.date_from ? new Date(filters.date_from) : null;
                            const toDate = filters.date_to ? new Date(filters.date_to) : null;
                            
                            if (fromDate && itemDate < fromDate) matchesDate = false;
                            if (toDate && itemDate > toDate) matchesDate = false;
                        } catch (error) {
                            matchesDate = false;
                        }
                    }
                } else if (dateFilter) {
                    if (!item.delivery_date) {
                        matchesDate = false;
                    } else {
                        try {
                            const itemDate = new Date(item.delivery_date).toISOString().split('T')[0];
                            matchesDate = itemDate === dateFilter;
                        } catch (error) {
                            matchesDate = false;
                        }
                    }
                }
                
                return matchesStatus && matchesDate;
            });
        }
        
        return filteredSubscription;
    });

    // Sort and pagination logic
    const sortedSubscriptions = sortSubscriptions(filteredSubscriptions);
    const totalPages = Math.ceil(sortedSubscriptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSubscriptions = sortedSubscriptions.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading && restaurants.length === 0) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                background: 'transparent'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: 'rgb(107 114 128)',
                    textAlign: 'center'
                }}>
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: windowWidth <= 768 ? '1rem 0.5rem' : '1rem',
            background: 'transparent',
            minHeight: '100vh'
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
                        📋 {language === 'ar' ? 'إدارة طلبات الاشتراك' : 'Subscription Management'}
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '1.1rem'
                    }}>
                        {language === 'ar' ? 'عرض وإدارة طلبات الاشتراك لمطاعمك' : 'View and manage subscription requests for your restaurants'}
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
                    textAlign: 'center',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        {subscriptions.length}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500'
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
                    textAlign: 'center',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        {subscriptions.filter(sub => sub.subscription_items?.some(item => item.status === 'delivered')).length}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>
                        {language === 'ar' ? 'وجبات مسلمة' : 'Delivered Meals'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        {subscriptions.filter(sub => sub.subscription_items?.some(item => item.status === 'pending')).length}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500'
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
                    textAlign: 'center',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        {subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.total_amount) || 0), 0).toFixed(2)}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>
                        {language === 'ar' ? 'إجمالي الإيرادات (ريال)' : 'Total Revenue (OMR)'}
                    </div>
                </div>
            </div>

            {/* Restaurant Selector */}
            {restaurants.length > 0 && (
                <div style={{
                    marginBottom: '1.5rem',
                    background: 'transparent'
                }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: 'rgb(55 65 81)',
                        textAlign: dir === 'rtl' ? 'right' : 'left',
                        background: 'transparent'
                    }}>
                        {language === 'ar' ? 'اختر المطعم:' : 'Select Restaurant:'}
                    </label>
                    <select
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.75rem',
                            border: '1px solid rgb(209 213 219)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            background: 'white',
                            color: 'rgb(55 65 81)',
                            direction: dir
                        }}
                    >
                        {restaurants.map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Search and Filters */}
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
                            {language === 'ar' ? 'تصفية حسب حالة الوجبات' : 'Filter by Meal Status'}
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
                            <option value="all">{language === 'ar' ? 'جميع الوجبات' : 'All Meals'}</option>
                            <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                            <option value="preparing">{language === 'ar' ? 'قيد التحضير' : 'Preparing'}</option>
                            <option value="delivered">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                            <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
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

                    {/* Clear Filters Button */}
                    {(searchTerm || filters.status !== 'all' || filters.date_from || filters.date_to || statusFilter !== 'all' || dateFilter) && (
                        <div>
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#dc2626';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#ef4444';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <span>🗑️</span>
                                {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Results Info */}
            {(searchTerm || filters.status !== 'all' || filters.date_from || filters.date_to || statusFilter !== 'all' || dateFilter) && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'rgb(59 130 246)',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
                }}>
                    {(() => {
                        const totalItems = subscriptions.reduce((sum, sub) => sum + (sub.subscription_items?.length || 0), 0);
                        const filteredItems = filteredSubscriptions.reduce((sum, sub) => sum + (sub.subscription_items?.length || 0), 0);
                        
                        return (
                            <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    {language === 'ar' 
                                        ? `تم العثور على ${filteredSubscriptions.length} اشتراك من أصل ${subscriptions.length} (${filteredItems} وجبة من أصل ${totalItems})`
                                        : `Found ${filteredSubscriptions.length} subscriptions out of ${subscriptions.length} (${filteredItems} meals out of ${totalItems})`
                                    }
                                </div>
                                {(filters.date_from || filters.date_to || dateFilter) && (
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                        {language === 'ar' 
                                            ? `تم تطبيق فلترة التاريخ`
                                            : `Date filtering applied`
                                        }
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

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
                ) : filteredSubscriptions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1rem'
                    }}>
                        <div style={{
                            fontSize: '1.125rem',
                            color: '#6b7280',
                            marginBottom: '1rem'
                        }}>
                            {(searchTerm || filters.status !== 'all' || filters.date_from || filters.date_to || statusFilter !== 'all' || dateFilter) 
                                ? (language === 'ar' ? 'لا توجد نتائج تطابق الفلتر المحدد' : 'No results match the selected filter')
                                : (language === 'ar' ? 'لا توجد طلبات اشتراك' : 'No subscription requests')
                            }
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            marginBottom: '1.5rem'
                        }}>
                            {(searchTerm || filters.status !== 'all' || filters.date_from || filters.date_to || statusFilter !== 'all' || dateFilter)
                                ? (language === 'ar' ? 'جرب تغيير معايير الفلترة أو مسح الفلاتر' : 'Try changing filter criteria or clear filters')
                                : (language === 'ar' ? 'ستظهر هنا طلبات الاشتراك الجديدة' : 'New subscription requests will appear here')
                            }
                        </div>
                        {(searchTerm || filters.status !== 'all' || filters.date_from || filters.date_to || statusFilter !== 'all' || dateFilter) && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#2563eb';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <span>🔄</span>
                                {language === 'ar' ? 'عرض جميع الاشتراكات' : 'Show All Subscriptions'}
                            </button>
                        )}
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
                                            letterSpacing: '0.05em',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => handleSort('id')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'رقم الاشتراك' : 'Subscription ID'}
                                            {sortField === 'id' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                        onClick={() => handleSort('customer')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'العميل' : 'Customer'}
                                            {sortField === 'customer' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                        onClick={() => handleSort('subscription_amount')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'مبلغ الاشتراك' : 'Subscription Amount'}
                                            {sortField === 'subscription_amount' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                        onClick={() => handleSort('delivery_price')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                                            {sortField === 'delivery_price' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                        onClick={() => handleSort('total_amount')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                                            {sortField === 'total_amount' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                        onClick={() => handleSort('date')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'التاريخ' : 'Date'}
                                            {sortField === 'date' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                        onClick={() => handleSort('status')}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                                            {language === 'ar' ? 'الحالة' : 'Status'}
                                            {sortField === 'status' && (
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
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
                                                    {subscription.user?.name}
                                           </div>
                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {subscription.user?.email}
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
                                                    {(parseFloat(subscription.total_amount || 0) - parseFloat(subscription.delivery_price || 0)).toFixed(2)} {language === 'ar' ? 'ريال' : 'OMR'}
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
                                                        ? `${parseFloat(subscription.delivery_price || 0).toFixed(2)} ${language === 'ar' ? 'ريال' : 'OMR'}`
                                                        : (language === 'ar' ? 'مجاني' : 'Free')
                                                    }
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
                                                    {parseFloat(subscription.total_amount || 0).toFixed(2)} {language === 'ar' ? 'ريال' : 'OMR'}
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
                                                    {new Date(subscription.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
                                                        month: 'short',
    day: 'numeric'
                                                    })}
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
                                                    {getStatusText(subscription.status)}
                                                        </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubscription(subscription);
                                                        setShowDetailsModal(true);
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
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="8" style={{
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
                    </>
                )}

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
            </div>

            {/* Subscription Details Modal */}
            {showDetailsModal && selectedSubscription && (
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
                                {language === 'ar' ? `تفاصيل الطلب #${selectedSubscription.id}` : `Request Details #${selectedSubscription.id}`}
                            </h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
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

                        {/* Customer Information */}
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
                                 gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
                                 gap: '1rem'
                             }}>
                                 <div>
                                     <div style={{
                                         fontSize: '0.875rem',
                                         fontWeight: '600',
                                         color: 'rgb(107 114 128)',
                                         marginBottom: '0.25rem',
                                         textAlign: dir === 'rtl' ? 'right' : 'left'
                                     }}>
                                         {language === 'ar' ? 'الاسم' : 'Name'}
                                     </div>
                                     <div style={{
                                         fontSize: '1rem',
                                         color: 'rgb(17 24 39)',
                                         textAlign: dir === 'rtl' ? 'right' : 'left'
                                     }}>
                                         {selectedSubscription.user?.name}
                                     </div>
                                 </div>
                                 <div>
                                     <div style={{
                                         fontSize: '0.875rem',
                                         fontWeight: '600',
                                         color: 'rgb(107 114 128)',
                                         marginBottom: '0.25rem',
                                         textAlign: dir === 'rtl' ? 'right' : 'left'
                                     }}>
                                         {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                     </div>
                                     <div style={{
                                         fontSize: '1rem',
                                         color: 'rgb(17 24 39)',
                                         textAlign: dir === 'rtl' ? 'right' : 'left'
                                     }}>
                                         {selectedSubscription.user?.email}
                                     </div>
                                 </div>
                                 <div>
                                     <div style={{
                                         fontSize: '0.875rem',
                                         fontWeight: '600',
                                         color: 'rgb(107 114 128)',
                                         marginBottom: '0.25rem',
                                         textAlign: dir === 'rtl' ? 'right' : 'left'
                                     }}>
                                         {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                     </div>
                                     <div style={{
                                         fontSize: '1rem',
                                         color: 'rgb(17 24 39)',
                                         textAlign: dir === 'rtl' ? 'right' : 'left'
                                     }}>
                                         {selectedSubscription.delivery_address?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Delivery Address */}
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
                                {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
                                gap: '1rem'
                            }}>
                                {/* اسم العنوان */}
                                {selectedSubscription.delivery_address?.name && (
                                    <div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {language === 'ar' ? 'اسم العنوان' : 'Address Name'}
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'rgb(17 24 39)',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {selectedSubscription.delivery_address.name}
                                        </div>
                                    </div>
                                )}

                                {/* رقم الهاتف */}
                                {selectedSubscription.delivery_address?.phone && (
                                    <div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'rgb(17 24 39)',
                                            textAlign: dir === 'rtl' ? 'right' : 'left',
                                            direction: 'ltr'
                                        }}>
                                            {selectedSubscription.delivery_address.phone}
                                        </div>
                                    </div>
                                )}

                                {/* العنوان التفصيلي */}
                                {selectedSubscription.delivery_address?.address && (
                                    <div style={{
                                        gridColumn: windowWidth <= 768 ? '1' : '1 / -1'
                                    }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {language === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'}
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'rgb(17 24 39)',
                                            textAlign: dir === 'rtl' ? 'right' : 'left',
                                            lineHeight: '1.5'
                                        }}>
                                            {selectedSubscription.delivery_address.address}
                                        </div>
                                    </div>
                                )}

                                {/* المدينة */}
                                {selectedSubscription.delivery_address?.city && (
                                    <div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {language === 'ar' ? 'المدينة' : 'City'}
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'rgb(17 24 39)',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {selectedSubscription.delivery_address.city}
                                        </div>
                                    </div>
                                )}

                                {/* الرمز البريدي */}
                                {selectedSubscription.delivery_address?.postal_code && (
                                    <div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'rgb(17 24 39)',
                                            textAlign: dir === 'rtl' ? 'right' : 'left',
                                            direction: 'ltr'
                                        }}>
                                            {selectedSubscription.delivery_address.postal_code}
                                        </div>
                                    </div>
                                )}

                                {/* الملاحظات الإضافية */}
                                {selectedSubscription.delivery_address?.additional_notes && (
                                    <div style={{
                                        gridColumn: windowWidth <= 768 ? '1' : '1 / -1'
                                    }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem',
                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                        }}>
                                            {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            color: 'rgb(17 24 39)',
                                            textAlign: dir === 'rtl' ? 'right' : 'left',
                                            lineHeight: '1.5',
                                            fontStyle: 'italic'
                                        }}>
                                            {selectedSubscription.delivery_address.additional_notes}
                                        </div>
                                    </div>
                                )}

                                {/* رابط الخريطة */}
                                {(() => {
                                    const lat = selectedSubscription?.delivery_address?.latitude;
                                    const lng = selectedSubscription?.delivery_address?.longitude;
                                    const address = selectedSubscription?.delivery_address?.address;
                                    let link = null;
                                    if (typeof lat === 'number' && typeof lng === 'number') {
                                        link = `https://www.google.com/maps?q=${lat},${lng}`;
                                    } else if (address) {
                                        link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                                    }
                                    if (!link) return null;
                                    return (
                                        <div style={{
                                            gridColumn: windowWidth <= 768 ? '1' : '1 / -1'
                                        }}>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: 'rgb(107 114 128)',
                                                marginBottom: '0.25rem',
                                                textAlign: dir === 'rtl' ? 'right' : 'left'
                                            }}>
                                                {language === 'ar' ? 'الموقع على الخريطة' : 'Map Location'}
                                            </div>
                                            <a 
                                                href={link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{ 
                                                    fontSize: '1rem',
                                                    color: '#2563eb',
                                                    textDecoration: 'underline',
                                                    fontWeight: '500',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                {language === 'ar' ? 'فتح على الخريطة' : 'Open Map'} 🚀
                                            </a>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Subscription Items */}
                        <div style={{
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                color: 'rgb(17 24 39)',
                                textAlign: dir === 'rtl' ? 'right' : 'left'
                            }}>
                                {language === 'ar' ? 'الوجبات المطلوبة' : 'Requested Meals'}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gap: '1rem'
                            }}>
                                {selectedSubscription.subscription_items?.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        backgroundColor: 'rgb(249 250 251)',
                                        borderRadius: '0.75rem',
                                        flexWrap: windowWidth <= 768 ? 'wrap' : 'nowrap',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            flex: 1,
                                            minWidth: 0
                                        }}>
                                            <div style={{
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                marginBottom: '0.25rem',
                                                color: 'rgb(17 24 39)',
                                                textAlign: dir === 'rtl' ? 'right' : 'left'
                                            }}>
                                                {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                            </div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: 'rgb(107 114 128)',
                                                textAlign: dir === 'rtl' ? 'right' : 'left'
                                            }}>
                                                {new Date(item.delivery_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getItemStatusColor(item.status)}`}>
                                                {getItemStatusText(item.status)}
                                            </span>
                                            
                                            {/* رسالة توضيحية للوجبات غير القابلة للتعديل */}
                                            {(item.status === 'cancelled' || item.status === 'delivered') && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280',
                                                    fontStyle: 'italic',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    {item.status === 'cancelled' 
                                                        ? (language === 'ar' ? '⛔ لا يمكن تعديل الوجبة الملغية' : '⛔ Cannot modify cancelled meal')
                                                        : (language === 'ar' ? '✅ لا يمكن تعديل الوجبة المُسلمة' : '✅ Cannot modify delivered meal')
                                                    }
                                                </span>
                                            )}
                                            
                                            <select
                                                value={item.status}
                                                onChange={(e) => updateItemStatus(selectedSubscription.id, item.id, e.target.value)}
                                                disabled={selectedSubscription.status === 'cancelled' || item.status === 'cancelled' || item.status === 'delivered'}
                                                style={{
                                                    padding: '0.5rem',
                                                    border: '1px solid rgb(209 213 219)',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.875rem',
                                                    background: (selectedSubscription.status === 'cancelled' || item.status === 'cancelled' || item.status === 'delivered') ? '#f3f4f6' : 'white',
                                                    cursor: (selectedSubscription.status === 'cancelled' || item.status === 'cancelled' || item.status === 'delivered') ? 'not-allowed' : 'pointer',
                                                    opacity: (selectedSubscription.status === 'cancelled' || item.status === 'cancelled' || item.status === 'delivered') ? 0.7 : 1
                                                }}
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

                        {/* Special Instructions */}
                        {selectedSubscription.special_instructions && (
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
                                    {selectedSubscription.special_instructions}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
    } catch (error) {
        console.error('Error in SellerSubscriptions component:', error);
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'red',
                background: 'white'
            }}>
                <h1>خطأ في تحميل الصفحة</h1>
                <p>Error: {error.message}</p>
            </div>
        );
    }
};

export default SellerSubscriptions;
