import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminSubscriptionsAPI } from '../../services/api';

const AdminTodayOrders = () => {
    const { t, dir, language } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        preparing: 0,
        delivered: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    const [restaurants, setRestaurants] = useState([]);
    const [dateFormatted, setDateFormatted] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRestaurants();
        fetchTodayOrders();
    }, []);

    useEffect(() => {
        fetchTodayOrders();
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const response = await adminSubscriptionsAPI.getRestaurants();
            if (response.data.success) {
                setRestaurants(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchTodayOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams({
                restaurant_id: selectedRestaurant !== 'all' ? selectedRestaurant : '',
                date: new Date().toISOString().split('T')[0]
            });

            console.log('🔄 Fetching today orders with params:', params.toString());

            const response = await fetch(`/api/admin/today-orders?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('📊 API Response:', data);
                
                if (data.success) {
                    const { orders, grouped_orders, stats, date_formatted } = data.data;
                    console.log('📋 Orders data:', {
                        ordersCount: orders.length,
                        stats: stats,
                        dateFormatted: date_formatted
                    });
                    
                    setOrders(orders);
                    setGroupedOrders(grouped_orders);
                    setStats(stats);
                    setDateFormatted(date_formatted);
                } else {
                    console.error('❌ API returned success: false', data.message);
                    setError(data.message || (language === 'ar' ? 'فشل في جلب البيانات' : 'Failed to fetch data'));
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', response.status, errorData);
                setError(errorData.message || (language === 'ar' ? 'خطأ في الخادم' : 'Server error'));
            }
        } catch (error) {
            console.error('💥 Network Error:', error);
            setError(language === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            const order = orders.find(order => order.id === itemId);
            if (!order) {
                alert(language === 'ar' ? 'لم يتم العثور على الطلب' : 'Order not found');
                return;
            }
            
            const response = await fetch(`/api/admin/orders/${itemId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchTodayOrders();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(language === 'ar' ? 'فشل في تحديث حالة الطلب' : 'Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'from-yellow-500 to-orange-500';
            case 'preparing': return 'from-teal-500 to-teal-600';
            case 'delivered': return 'from-green-500 to-emerald-500';
            case 'cancelled': return 'from-red-500 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'preparing': return '👨‍🍳';
            case 'delivered': return '✅';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    const getStatusText = (status) => {
        const statuses = {
            pending: { ar: 'في الانتظار', en: 'Pending' },
            preparing: { ar: 'قيد التحضير', en: 'Preparing' },
            delivered: { ar: 'تم التوصيل', en: 'Delivered' },
            cancelled: { ar: 'ملغي', en: 'Cancelled' }
        };
        return statuses[status]?.[language] || status;
    };

    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            (order.subscription?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.meal?.name_ar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.meal?.name_en || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ color: 'rgb(107 114 128)', fontSize: '1rem' }}>
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                    <div style={{ color: 'rgb(239 68 68)', fontSize: '1rem' }}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ direction: dir }}>
            {/* Header Section */}
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
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        📋
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'طلبات اليوم' : 'Today\'s Orders'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {dateFormatted}
                        </p>
                    </div>
                </div>

                {/* Restaurant Selector and Refresh Button */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth <= 768 ? 'stretch' : 'flex-end',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.5rem'
                        }}>
                            {language === 'ar' ? 'اختر المطعم:' : 'Select Restaurant:'}
                        </label>
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                fontSize: '0.875rem',
                                background: 'white',
                                minWidth: '200px'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع المطاعم' : 'All Restaurants'}</option>
                            {restaurants.map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        onClick={fetchTodayOrders}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>🔄</span>
                        <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.75rem',
                marginBottom: '2rem'
            }}>
                {Object.entries(stats).map(([key, value]) => (
                    <div
                        key={key}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textAlign: 'center',
                            minWidth: '0'
                        }}
                    >
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.25rem'
                        }}>
                            {value}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'rgb(107 114 128)',
                            textTransform: 'capitalize',
                            lineHeight: '1.2'
                        }}>
                            {key === 'total' 
                                ? (language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders')
                                : getStatusText(key)
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflowX: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        color: 'white'
                    }}>
                        📋
                    </div>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0
                    }}>
                        {language === 'ar' ? 'قائمة الطلبات' : 'Orders List'} ({filteredOrders.length}/{orders.length})
                    </h2>
                </div>

                {/* Search and Filter Controls */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    alignItems: window.innerWidth <= 768 ? 'stretch' : 'center'
                }}>
                    {/* Search Input */}
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث في الطلبات...' : 'Search orders...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                fontSize: '0.875rem',
                                background: 'white',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div style={{ minWidth: window.innerWidth <= 768 ? 'auto' : '200px' }}>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                fontSize: '0.875rem',
                                background: 'white'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                            <option value="pending">{getStatusText('pending')}</option>
                            <option value="preparing">{getStatusText('preparing')}</option>
                            <option value="delivered">{getStatusText('delivered')}</option>
                            <option value="cancelled">{getStatusText('cancelled')}</option>
                        </select>
                    </div>
                </div>

                {filteredOrders.length > 0 ? (
                    <div style={{
                        overflowX: 'auto',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem'
                        }}>
                            <thead>
                                <tr style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderBottom: '2px solid rgba(0, 0, 0, 0.1)'
                                }}>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'العميل' : 'Customer'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'المطعم' : 'Restaurant'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الوجبة' : 'Meal'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الحالة' : 'Status'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, index) => (
                                    <tr key={order.id} style={{
                                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(248, 250, 252, 0.7)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.2s'
                                    }}>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: 'white'
                                                }}>
                                                    👤
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: 'rgb(55 65 81)'
                                                    }}>
                                                        {order.subscription?.user?.full_name || order.subscription?.user?.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgb(107 114 128)'
                                                    }}>
                                                        #{order.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    🍽️
                                                </div>
                                                <span style={{ color: 'rgb(55 65 81)' }}>
                                                    {language === 'ar' ? order.restaurant?.name_ar : order.restaurant?.name_en}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    🍽️
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: 'rgb(55 65 81)'
                                                    }}>
                                                        {language === 'ar' ? order.meal?.name_ar : order.meal?.name_en}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgb(107 114 128)'
                                                    }}>
                                                        {language === 'ar' ? order.meal?.type_ar : order.meal?.type_en}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    🕐
                                                </div>
                                                <span style={{ 
                                                    color: 'rgb(55 65 81)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {(() => {
                                                        const deliveryTime = order.meal?.delivery_time;
                                                        if (!deliveryTime) return '12:00 PM';
                                                        
                                                        // Handle ISO string format
                                                        if (deliveryTime.includes && deliveryTime.includes('T')) {
                                                            const date = new Date(deliveryTime);
                                                            return date.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            });
                                                        }
                                                        
                                                        // Handle simple time format
                                                        return deliveryTime;
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: order.status === 'delivered' ? '#10b981' : 
                                                                order.status === 'preparing' ? '#3b82f6' : 
                                                                order.status === 'pending' ? '#f59e0b' : '#ef4444',
                                                    borderRadius: '0.25rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: 'white'
                                                }}>
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: 'rgb(55 65 81)'
                                                }}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                            textAlign: 'center'
                                        }}>
                                            {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                                                <select
                                                    onChange={(e) => {
                                                        const selectedAction = e.target.value;
                                                        if (selectedAction && selectedAction !== '') {
                                                            if (selectedAction === 'cancel') {
                                                                if (window.confirm(language === 'ar' 
                                                                    ? 'هل أنت متأكد من إلغاء هذا الطلب؟'
                                                                    : 'Are you sure you want to cancel this order?'
                                                                )) {
                                                                    handleStatusUpdate(order.id, 'cancelled');
                                                                }
                                                            } else {
                                                                handleStatusUpdate(order.id, selectedAction);
                                                            }
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 0.75rem',
                                                        background: '#ffffff',
                                                        color: '#374151',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '0.375rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        minWidth: '140px'
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        {language === 'ar' ? 'اختر الإجراء' : 'Select Action'}
                                                    </option>
                                                    {order.status === 'pending' && (
                                                        <option value="preparing">
                                                            👨‍🍳 {language === 'ar' ? 'بدء التحضير' : 'Start Preparing'}
                                                        </option>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <option value="delivered">
                                                            ✅ {language === 'ar' ? 'تم التوصيل' : 'Mark Delivered'}
                                                        </option>
                                                    )}
                                                    <option value="cancel" style={{ color: '#dc2626' }}>
                                                        ❌ {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                                                    </option>
                                                </select>
                                            ) : (
                                                <span style={{
                                                    color: 'rgb(107 114 128)',
                                                    fontSize: '0.75rem',
                                                    fontStyle: 'italic',
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(107, 114, 128, 0.1)',
                                                    borderRadius: '0.5rem',
                                                    display: 'inline-block'
                                                }}>
                                                    {language === 'ar' ? 'لا يمكن تغيير الحالة' : 'Cannot change status'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'rgb(107 114 128)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {orders.length === 0 ? '📋' : '🔍'}
                        </div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.5rem'
                        }}>
                            {orders.length === 0 
                                ? (language === 'ar' ? 'لا توجد طلبات' : 'No Orders')
                                : (language === 'ar' ? 'لا توجد نتائج' : 'No Results')
                            }
                        </h3>
                        <p style={{ fontSize: '0.875rem' }}>
                            {orders.length === 0 
                                ? (language === 'ar' 
                                    ? 'لا توجد طلبات لعرضها في الجدول'
                                    : 'No orders to display in the table'
                                )
                                : (language === 'ar'
                                    ? 'جرب تغيير معايير البحث أو الفلترة'
                                    : 'Try changing your search or filter criteria'
                                )
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTodayOrders;
