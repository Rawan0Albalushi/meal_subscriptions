import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SellerSubscriptions = () => {
    const { t, dir, language } = useLanguage();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

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
                // Refresh subscriptions
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
                // Refresh subscriptions
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

    const filteredSubscriptions = subscriptions.filter(subscription => {
        // Debug logging for subscription
        if (process.env.NODE_ENV === 'development') {
            console.log(`Checking subscription ${subscription.id}:`, {
                statusFilter,
                dateFilter,
                itemsCount: subscription.subscription_items?.length || 0
            });
        }
        
        // Filter by status
        if (statusFilter !== 'all') {
            const hasMatchingStatus = subscription.subscription_items?.some(item => item.status === statusFilter);
            if (!hasMatchingStatus) return false;
        }
        
        // Filter by date
        if (dateFilter) {
            const hasMatchingDate = subscription.subscription_items?.some(item => {
                // Ensure delivery_date exists and is valid
                if (!item.delivery_date) return false;
                
                try {
                    // Convert delivery_date to multiple formats for comparison
                    const itemDateObj = new Date(item.delivery_date);
                    
                    // Format 1: YYYY-MM-DD (ISO)
                    const itemDateISO = itemDateObj.toISOString().split('T')[0];
                    
                    // Format 2: DD-MM-YYYY (European format)
                    const itemDateEuropean = itemDateObj.toLocaleDateString('en-US').split('/').reverse().join('-');
                    
                    // Format 3: MM/DD/YYYY (US format)
                    const itemDateUS = itemDateObj.toLocaleDateString('en-US');
                    
                    // Format 4: DD-MM-YYYY (with leading zeros)
                    const day = String(itemDateObj.getDate()).padStart(2, '0');
                    const month = String(itemDateObj.getMonth() + 1).padStart(2, '0');
                    const year = itemDateObj.getFullYear();
                    const itemDateFormatted = `${day}-${month}-${year}`;
                    
                    // Try to match the dateFilter with any of these formats
                    const matches = itemDateISO === dateFilter || 
                                   itemDateEuropean === dateFilter || 
                                   itemDateUS === dateFilter ||
                                   itemDateFormatted === dateFilter;
                    
                    // Debug logging (remove in production)
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`Item ${item.id}: delivery_date=${item.delivery_date}, ISO=${itemDateISO}, European=${itemDateEuropean}, US=${itemDateUS}, Formatted=${itemDateFormatted}, filter=${dateFilter}, matches=${matches}`);
                    }
                    
                    return matches;
                } catch (error) {
                    console.error('Error processing date:', item.delivery_date, error);
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
                if (statusFilter !== 'all') {
                    matchesStatus = item.status === statusFilter;
                }
                
                // Filter by date
                if (dateFilter) {
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
            padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '1rem',
            background: 'transparent'
        }}>
            {/* Header */}
            <div style={{
                marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                background: 'transparent'
            }}>
                <h1 style={{
                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: 'rgb(17 24 39)',
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                    background: 'transparent'
                }}>
                    {language === 'ar' ? 'إدارة طلبات الاشتراك' : 'Subscription Management'}
                </h1>
                <p style={{
                    fontSize: '1rem',
                    color: 'rgb(107 114 128)',
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                    background: 'transparent'
                }}>
                    {language === 'ar' ? 'عرض وإدارة طلبات الاشتراك لمطاعمك' : 'View and manage subscription requests for your restaurants'}
                </p>
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

            {/* Filters */}
            <div style={{
                marginBottom: '1.5rem',
                background: 'transparent'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end'
                }}>
                    {/* Status Filter */}
                    <div style={{
                        flex: '1',
                        minWidth: '200px'
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
                            {language === 'ar' ? 'تصفية حسب حالة الوجبات:' : 'Filter by Meal Status:'}
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgb(209 213 219)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                background: 'white',
                                color: 'rgb(55 65 81)',
                                direction: dir
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع الوجبات' : 'All Meals'}</option>
                            <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                            <option value="preparing">{language === 'ar' ? 'قيد التحضير' : 'Preparing'}</option>
                            <option value="delivered">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                            <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div style={{
                        flex: '1',
                        minWidth: '200px'
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
                            {language === 'ar' ? 'تصفية حسب تاريخ التوصيل:' : 'Filter by Delivery Date:'}
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgb(209 213 219)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                background: 'white',
                                color: 'rgb(55 65 81)',
                                direction: dir
                            }}
                        />
                    </div>

                    {/* Clear Filters Button */}
                    {(statusFilter !== 'all' || dateFilter) && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '0.5rem'
                        }}>
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setDateFilter('');
                                }}
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
                            
                            {/* Test Date Button */}
                            <button
                                onClick={() => {
                                    // Get first available date from subscriptions
                                    let firstAvailableDate = null;
                                    subscriptions.forEach(sub => {
                                        sub.subscription_items?.forEach(item => {
                                            if (item.delivery_date && !firstAvailableDate) {
                                                const date = new Date(item.delivery_date);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const year = date.getFullYear();
                                                firstAvailableDate = `${day}-${month}-${year}`;
                                            }
                                        });
                                    });
                                    
                                    if (firstAvailableDate) {
                                        setDateFilter(firstAvailableDate);
                                        setStatusFilter('all');
                                    } else {
                                        // Fallback to today's date
                                        const today = new Date();
                                        const day = String(today.getDate()).padStart(2, '0');
                                        const month = String(today.getMonth() + 1).padStart(2, '0');
                                        const year = today.getFullYear();
                                        setDateFilter(`${day}-${month}-${year}`);
                                        setStatusFilter('all');
                                    }
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#10b981',
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
                                    e.target.style.backgroundColor = '#059669';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#10b981';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <span>🧪</span>
                                {language === 'ar' ? 'اختبار التاريخ' : 'Test Date'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Results Info */}
            {(statusFilter !== 'all' || dateFilter) && (
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
                        
                        // Get available dates for debugging
                        const availableDates = new Set();
                        subscriptions.forEach(sub => {
                            sub.subscription_items?.forEach(item => {
                                if (item.delivery_date) {
                                    const date = new Date(item.delivery_date);
                                    
                                    // Add multiple date formats
                                    availableDates.add(date.toISOString().split('T')[0]); // YYYY-MM-DD
                                    availableDates.add(date.toLocaleDateString('en-US').split('/').reverse().join('-')); // DD-MM-YYYY
                                    availableDates.add(date.toLocaleDateString('en-US')); // MM/DD/YYYY
                                    
                                    // Add DD-MM-YYYY with leading zeros
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();
                                    availableDates.add(`${day}-${month}-${year}`);
                                }
                            });
                        });
                        
                        return (
                            <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    {language === 'ar' 
                                        ? `تم العثور على ${filteredSubscriptions.length} اشتراك من أصل ${subscriptions.length} (${filteredItems} وجبة من أصل ${totalItems})`
                                        : `Found ${filteredSubscriptions.length} subscriptions out of ${subscriptions.length} (${filteredItems} meals out of ${totalItems})`
                                    }
                                </div>
                                {dateFilter && (
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                        {language === 'ar' 
                                            ? `التواريخ المتاحة: ${Array.from(availableDates).sort().slice(0, 5).join(', ')}${availableDates.size > 5 ? '...' : ''}`
                                            : `Available dates: ${Array.from(availableDates).sort().slice(0, 5).join(', ')}${availableDates.size > 5 ? '...' : ''}`
                                        }
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Subscriptions List */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    background: 'transparent'
                }}>
                    <div style={{
                        fontSize: '1rem',
                        color: 'rgb(107 114 128)',
                        textAlign: 'center'
                    }}>
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                </div>
            ) : filteredSubscriptions.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    background: 'transparent'
                }}>
                    <div style={{
                        fontSize: '1.125rem',
                        color: 'rgb(107 114 128)',
                        marginBottom: '1rem'
                    }}>
                        {(statusFilter !== 'all' || dateFilter) 
                            ? (language === 'ar' ? 'لا توجد نتائج تطابق الفلتر المحدد' : 'No results match the selected filter')
                            : (language === 'ar' ? 'لا توجد طلبات اشتراك' : 'No subscription requests')
                        }
                    </div>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'rgb(156 163 175)',
                        marginBottom: '1.5rem'
                    }}>
                        {(statusFilter !== 'all' || dateFilter)
                            ? (language === 'ar' ? 'جرب تغيير معايير الفلترة أو مسح الفلاتر' : 'Try changing filter criteria or clear filters')
                            : (language === 'ar' ? 'ستظهر هنا طلبات الاشتراك الجديدة' : 'New subscription requests will appear here')
                        }
                    </div>
                    {(statusFilter !== 'all' || dateFilter) && (
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                setDateFilter('');
                            }}
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
                <div style={{
                    display: 'grid',
                    gap: '1rem',
                    background: 'transparent'
                }}>
                    {filteredSubscriptions.map(subscription => (
                        <div key={subscription.id} style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease'
                        }}>
                                                         {/* Subscription Header */}
                             <div style={{
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 alignItems: 'flex-start',
                                 marginBottom: '1.5rem',
                                 flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap',
                                 gap: '1rem'
                             }}>
                                 <div style={{
                                     flex: 1,
                                     minWidth: 0
                                 }}>
                                     <div style={{
                                         fontSize: '1.25rem',
                                         fontWeight: '700',
                                         marginBottom: '0.5rem',
                                         color: 'rgb(17 24 39)',
                                         textAlign: dir === 'rtl' ? 'right' : 'left',
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '0.5rem'
                                     }}>
                                         <span style={{ fontSize: '1rem' }}>📦</span>
                                         {language === 'ar' ? `طلب #${subscription.id}` : `Request #${subscription.id}`}
                                     </div>
                                     
                                                                           {/* Customer Info */}
                                      <div style={{
                                          background: 'rgba(239, 246, 255, 0.8)',
                                          border: '1px solid rgba(59, 130, 246, 0.2)',
                                          borderRadius: '0.5rem',
                                          padding: '0.75rem',
                                          marginBottom: '0.75rem'
                                      }}>
                                          <div style={{
                                              fontSize: '0.875rem',
                                              fontWeight: '600',
                                              color: 'rgb(59 130 246)',
                                              marginBottom: '0.5rem',
                                              textAlign: dir === 'rtl' ? 'right' : 'left',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.5rem'
                                          }}>
                                              <span style={{ fontSize: '0.75rem' }}>👤</span>
                                              {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                                          </div>
                                          <div style={{
                                              fontSize: '0.875rem',
                                              color: 'rgb(17 24 39)',
                                              textAlign: dir === 'rtl' ? 'right' : 'left',
                                              lineHeight: '1.4'
                                          }}>
                                              <div style={{ marginBottom: '0.25rem' }}>
                                                  <strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {subscription.user?.name}
                                              </div>
                                              <div style={{ marginBottom: '0.25rem' }}>
                                                  <strong>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {subscription.user?.email}
                                              </div>
                                              <div>
                                                  <strong>{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</strong> {subscription.delivery_address?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
                                              </div>
                                          </div>
                                      </div>
                                     
                                     {/* Delivery Address */}
                                     <div style={{
                                         background: 'rgba(240, 253, 244, 0.8)',
                                         border: '1px solid rgba(34, 197, 94, 0.2)',
                                         borderRadius: '0.5rem',
                                         padding: '0.75rem'
                                     }}>
                                         <div style={{
                                             fontSize: '0.875rem',
                                             fontWeight: '600',
                                             color: 'rgb(34 197 94)',
                                             marginBottom: '0.5rem',
                                             textAlign: dir === 'rtl' ? 'right' : 'left',
                                             display: 'flex',
                                             alignItems: 'center',
                                             gap: '0.5rem'
                                         }}>
                                             <span style={{ fontSize: '0.75rem' }}>📍</span>
                                             {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                                         </div>
                                         <div style={{
                                             fontSize: '0.875rem',
                                             color: 'rgb(17 24 39)',
                                             textAlign: dir === 'rtl' ? 'right' : 'left',
                                             lineHeight: '1.4'
                                         }}>
                                             {subscription.delivery_address?.address}
                                         </div>
                                     </div>
                                 </div>
                                 
                                 
                             </div>

                                                         {/* Subscription Details */}
                             <div style={{
                                 background: 'rgba(255, 251, 235, 0.8)',
                                 border: '1px solid rgba(245, 158, 11, 0.2)',
                                 borderRadius: '0.75rem',
                                 padding: '1rem',
                                 marginBottom: '1.5rem'
                             }}>
                                 <div style={{
                                     fontSize: '0.875rem',
                                     fontWeight: '600',
                                     color: 'rgb(245, 158, 11)',
                                     marginBottom: '1rem',
                                     textAlign: dir === 'rtl' ? 'right' : 'left',
                                     display: 'flex',
                                     alignItems: 'center',
                                     gap: '0.5rem'
                                 }}>
                                     <span style={{ fontSize: '1rem' }}>📋</span>
                                     {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                                 </div>
                                 
                                                                   <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(5, 1fr)',
                                      gap: '0.75rem'
                                  }}>
                                                                           <div style={{
                                          background: 'rgba(255, 255, 255, 0.6)',
                                          padding: '0.5rem',
                                          borderRadius: '0.375rem',
                                          border: '1px solid rgba(245, 158, 11, 0.1)'
                                      }}>
                                          <div style={{
                                              fontSize: '0.625rem',
                                              fontWeight: '600',
                                              color: 'rgb(107 114 128)',
                                              marginBottom: '0.25rem',
                                              textTransform: 'uppercase',
                                              textAlign: dir === 'rtl' ? 'right' : 'left'
                                          }}>
                                              {language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type'}
                                          </div>
                                          <div style={{
                                              fontSize: '0.75rem',
                                              color: 'rgb(17 24 39)',
                                              textAlign: dir === 'rtl' ? 'right' : 'left',
                                              fontWeight: '500'
                                          }}>
                                              {subscription.subscription_type === 'weekly' ? 
                                                  (language === 'ar' ? 'أسبوعي' : 'Weekly') : 
                                                  (language === 'ar' ? 'شهري' : 'Monthly')}
                                          </div>
                                      </div>
                                     
                                                                           <div style={{
                                          background: 'rgba(255, 255, 255, 0.6)',
                                          padding: '0.5rem',
                                          borderRadius: '0.375rem',
                                          border: '1px solid rgba(245, 158, 11, 0.1)'
                                      }}>
                                          <div style={{
                                              fontSize: '0.625rem',
                                              fontWeight: '600',
                                              color: 'rgb(107 114 128)',
                                              marginBottom: '0.25rem',
                                              textTransform: 'uppercase',
                                              textAlign: dir === 'rtl' ? 'right' : 'left'
                                          }}>
                                              {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                                          </div>
                                          <div style={{
                                              fontSize: '0.75rem',
                                              color: 'rgb(17 24 39)',
                                              textAlign: dir === 'rtl' ? 'right' : 'left',
                                              fontWeight: '500'
                                          }}>
                                              {subscription.total_amount} {language === 'ar' ? 'ريال' : 'OMR'}
                                          </div>
                                      </div>
                                     
                                                                           <div style={{
                                          background: 'rgba(255, 255, 255, 0.6)',
                                          padding: '0.5rem',
                                          borderRadius: '0.375rem',
                                          border: '1px solid rgba(245, 158, 11, 0.1)'
                                      }}>
                                          <div style={{
                                              fontSize: '0.625rem',
                                              fontWeight: '600',
                                              color: 'rgb(107 114 128)',
                                              marginBottom: '0.25rem',
                                              textTransform: 'uppercase',
                                              textAlign: dir === 'rtl' ? 'right' : 'left'
                                          }}>
                                              {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                                          </div>
                                          <div style={{
                                              fontSize: '0.75rem',
                                              color: 'rgb(17 24 39)',
                                              textAlign: dir === 'rtl' ? 'right' : 'left',
                                              fontWeight: '500'
                                          }}>
                                              {new Date(subscription.start_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}
                                          </div>
                                      </div>
                                     
                                                                                                                  <div style={{
                                           background: 'rgba(255, 255, 255, 0.6)',
                                           padding: '0.5rem',
                                           borderRadius: '0.375rem',
                                           border: '1px solid rgba(245, 158, 11, 0.1)'
                                       }}>
                                           <div style={{
                                               fontSize: '0.625rem',
                                               fontWeight: '600',
                                               color: 'rgb(107 114 128)',
                                               marginBottom: '0.25rem',
                                               textTransform: 'uppercase',
                                               textAlign: dir === 'rtl' ? 'right' : 'left'
                                           }}>
                                               {language === 'ar' ? 'عدد الوجبات' : 'Meals Count'}
                                           </div>
                                           <div style={{
                                               fontSize: '0.75rem',
                                               color: 'rgb(17 24 39)',
                                               textAlign: dir === 'rtl' ? 'right' : 'left',
                                               fontWeight: '500'
                                           }}>
                                               {subscription.subscription_items?.length || 0}
                                           </div>
                                       </div>
                                      
                                                                             <div style={{
                                           background: 'rgba(255, 255, 255, 0.6)',
                                           padding: '0.5rem',
                                           borderRadius: '0.375rem',
                                           border: '1px solid rgba(245, 158, 11, 0.1)'
                                       }}>
                                           <div style={{
                                               fontSize: '0.625rem',
                                               fontWeight: '600',
                                               color: 'rgb(107 114 128)',
                                               marginBottom: '0.25rem',
                                               textTransform: 'uppercase',
                                               textAlign: dir === 'rtl' ? 'right' : 'left'
                                           }}>
                                               {language === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
                                           </div>
                                           <div style={{
                                               fontSize: '0.75rem',
                                               color: 'rgb(17 24 39)',
                                               textAlign: dir === 'rtl' ? 'right' : 'left',
                                               fontWeight: '500'
                                           }}>
                                               {new Date(subscription.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}
                                           </div>
                                       </div>
                                 </div>
                             </div>

                            {/* Meal Details Section */}
                            {subscription.subscription_items && subscription.subscription_items.length > 0 && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    background: 'transparent'
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        marginBottom: '1rem',
                                        textAlign: dir === 'rtl' ? 'right' : 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '1rem' }}>🍽️</span>
                                        {language === 'ar' ? 'تفاصيل الوجبات المطلوبة' : 'Requested Meals Details'}
                                    </div>
                                    
                                    <div style={{
                                        display: 'grid',
                                        gap: '0.75rem',
                                        background: 'transparent'
                                    }}>
                                        {subscription.subscription_items.length > 0 ? (
                                            subscription.subscription_items.map((item, index) => (
                                            <div key={item.id} style={{
                                                background: 'rgba(249, 250, 251, 0.8)',
                                                border: '1px solid rgba(209, 213, 219, 0.5)',
                                                borderRadius: '0.75rem',
                                                padding: '1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap',
                                                gap: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{
                                                    flex: 1,
                                                    minWidth: 0
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        <div style={{
                                                            width: '2rem',
                                                            height: '2rem',
                                                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(147 51 234))',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: 'rgb(17 24 39)',
                                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                                        }}>
                                                            {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '1rem',
                                                        fontSize: '0.875rem',
                                                        color: 'rgb(107 114 128)'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <span style={{ fontSize: '0.75rem' }}>📅</span>
                                                            <span>{new Date(item.delivery_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}</span>
                                                        </div>
                                                        
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <span style={{ fontSize: '0.75rem' }}>💰</span>
                                                            <span>{item.meal?.price} {language === 'ar' ? 'ريال' : 'OMR'}</span>
                                                        </div>
                                                        
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <span style={{ fontSize: '0.75rem' }}>🍽️</span>
                                                            <span>{language === 'ar' ? 
                                                                (item.meal?.type === 'breakfast' ? 'فطور' : 
                                                                 item.meal?.type === 'lunch' ? 'غداء' : 'عشاء') : 
                                                                 (item.meal?.type === 'breakfast' ? 'Breakfast' : 
                                                                  item.meal?.type === 'lunch' ? 'Lunch' : 'Dinner')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {item.meal?.description_ar || item.meal?.description_en ? (
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'rgb(156 163 175)',
                                                            marginTop: '0.5rem',
                                                            textAlign: dir === 'rtl' ? 'right' : 'left',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {language === 'ar' ? item.meal?.description_ar : item.meal?.description_en}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: dir === 'rtl' ? 'flex-start' : 'flex-end',
                                                    gap: '0.75rem',
                                                    minWidth: 'fit-content'
                                                }}>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getItemStatusColor(item.status)}`}>
                                                        {getItemStatusText(item.status)}
                                                    </span>
                                                    
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => updateItemStatus(subscription.id, item.id, e.target.value)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            border: '1px solid rgb(209 213 219)',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.75rem',
                                                            background: 'white',
                                                            minWidth: '120px'
                                                        }}
                                                    >
                                                        <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                                                        <option value="preparing">{language === 'ar' ? 'قيد التحضير' : 'Preparing'}</option>
                                                        <option value="delivered">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                                                        <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '2rem 1rem',
                                                backgroundColor: 'rgba(249, 250, 251, 0.8)',
                                                border: '1px solid rgba(209, 213, 219, 0.5)',
                                                borderRadius: '0.75rem',
                                                color: 'rgb(107 114 128)'
                                            }}>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    {language === 'ar' ? 'لا توجد وجبات مطابقة للفلتر' : 'No meals match the filter'}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.875rem',
                                                    color: 'rgb(156 163 175)'
                                                }}>
                                                    {language === 'ar' ? 'جرب تغيير معايير الفلترة' : 'Try changing filter criteria'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Special Instructions */}
                            {subscription.special_instructions && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: 'rgba(254, 243, 199, 0.8)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(251, 191, 36, 0.3)'
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgb(146, 64, 14)',
                                        marginBottom: '0.5rem',
                                        textAlign: dir === 'rtl' ? 'right' : 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '1rem' }}>📝</span>
                                        {language === 'ar' ? 'تعليمات خاصة' : 'Special Instructions'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'rgb(146, 64, 14)',
                                        textAlign: dir === 'rtl' ? 'right' : 'left',
                                        lineHeight: '1.5'
                                    }}>
                                        {subscription.special_instructions}
                                    </div>
                                </div>
                            )}

                                                         
                        </div>
                    ))}
                </div>
            )}

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
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: dir === 'rtl' ? 'auto' : '1rem',
                                left: dir === 'rtl' ? '1rem' : 'auto',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'rgb(107 114 128)'
                            }}
                        >
                            ×
                        </button>

                        {/* Modal Header */}
                        <div style={{
                            marginBottom: '2rem',
                            paddingRight: dir === 'rtl' ? '2rem' : '0',
                            paddingLeft: dir === 'rtl' ? '0' : '2rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '0.5rem',
                                color: 'rgb(17 24 39)',
                                textAlign: dir === 'rtl' ? 'right' : 'left'
                            }}>
                                {language === 'ar' ? `تفاصيل الطلب #${selectedSubscription.id}` : `Request Details #${selectedSubscription.id}`}
                            </h2>
                        </div>

                        {/* Customer Information */}
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            backgroundColor: 'rgb(249 250 251)',
                            borderRadius: '0.75rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                color: 'rgb(17 24 39)',
                                textAlign: dir === 'rtl' ? 'right' : 'left'
                            }}>
                                {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                            </h3>
                                                         <div style={{
                                 display: 'grid',
                                 gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
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
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            backgroundColor: 'rgb(249 250 251)',
                            borderRadius: '0.75rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                color: 'rgb(17 24 39)',
                                textAlign: dir === 'rtl' ? 'right' : 'left'
                            }}>
                                {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                            </h3>
                            <div style={{
                                fontSize: '1rem',
                                color: 'rgb(17 24 39)',
                                textAlign: dir === 'rtl' ? 'right' : 'left'
                            }}>
                                {selectedSubscription.delivery_address?.address}
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
                                        flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap',
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
                                            
                                            <select
                                                value={item.status}
                                                onChange={(e) => updateItemStatus(selectedSubscription.id, item.id, e.target.value)}
                                                style={{
                                                    padding: '0.5rem',
                                                    border: '1px solid rgb(209 213 219)',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.875rem',
                                                    background: 'white'
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
                                marginBottom: '2rem',
                                padding: '1.5rem',
                                backgroundColor: 'rgb(254 243 199)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgb(251 191 36)'
                            }}>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem',
                                    color: 'rgb(17 24 39)',
                                    textAlign: dir === 'rtl' ? 'right' : 'left'
                                }}>
                                    {language === 'ar' ? 'تعليمات خاصة' : 'Special Instructions'}
                                </h3>
                                <div style={{
                                    fontSize: '1rem',
                                    color: 'rgb(17 24 39)',
                                    textAlign: dir === 'rtl' ? 'right' : 'left'
                                }}>
                                    {selectedSubscription.special_instructions}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerSubscriptions;
