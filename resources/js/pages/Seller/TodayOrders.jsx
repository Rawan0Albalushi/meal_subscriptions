import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { sellerAPI } from '../../services/api';

const TodayOrders = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
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
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [dateFormatted, setDateFormatted] = useState('');

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchTodayOrders();
        }
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const response = await sellerAPI.getRestaurants();
            if (response.data.success) {
                setRestaurants(response.data.data);
                // Auto-select first restaurant if available
                if (response.data.data.length > 0) {
                    setSelectedRestaurant(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('فشل في تحميل المطاعم');
        }
    };

    const fetchTodayOrders = async () => {
        if (!selectedRestaurant) return;
        
        try {
            setLoading(true);
            const response = await sellerAPI.getTodayOrders(selectedRestaurant);
            
            if (response.data.success) {
                setOrders(response.data.data.orders);
                setGroupedOrders(response.data.data.grouped_orders);
                setStats(response.data.data.stats);
                setDateFormatted(response.data.data.date_formatted);
            } else {
                setError('فشل في تحميل طلبات اليوم');
            }
        } catch (error) {
            console.error('Error fetching today orders:', error);
            setError('خطأ في تحميل طلبات اليوم');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            const order = orders.find(order => order.id === itemId);
            if (!order) {
                alert('لم يتم العثور على الطلب');
                return;
            }
            
            const response = await sellerAPI.updateItemStatus(
                selectedRestaurant,
                order.subscription_id,
                itemId,
                newStatus
            );
            
            if (response.data.success) {
                // Update local state
                setOrders(prev => prev.map(order => 
                    order.id === itemId ? { ...order, status: newStatus } : order
                ));
                
                // Refresh data
                fetchTodayOrders();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('فشل في تحديث حالة الطلب');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'from-yellow-500 to-orange-500';
            case 'preparing':
                return 'from-blue-500 to-indigo-500';
            case 'delivered':
                return 'from-green-500 to-emerald-500';
            case 'cancelled':
                return 'from-red-500 to-pink-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return '⏳';
            case 'preparing':
                return '👨‍🍳';
            case 'delivered':
                return '✅';
            case 'cancelled':
                return '❌';
            default:
                return '📋';
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

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            pending: 'preparing',
            preparing: 'delivered',
            delivered: 'delivered',
            cancelled: 'cancelled'
        };
        return statusFlow[currentStatus];
    };

    if (loading && !selectedRestaurant) {
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
        <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
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
                    {restaurants.length > 0 && (
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
                                value={selectedRestaurant || ''}
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
                                {restaurants.map(restaurant => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button
                        onClick={fetchTodayOrders}
                        disabled={loading || !selectedRestaurant}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: loading || !selectedRestaurant ? 'not-allowed' : 'pointer',
                            opacity: loading || !selectedRestaurant ? 0.6 : 1,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading && selectedRestaurant) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
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
                gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                marginBottom: '2rem'
            }}>
                {Object.entries(stats).map(([key, value]) => (
                    <div
                        key={key}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                            padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.5rem'
                        }}>
                            {value}
                        </div>
                        <div style={{
                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                            color: 'rgb(107 114 128)',
                            textTransform: 'capitalize'
                        }}>
                            {key === 'total' 
                                ? (language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders')
                                : getStatusText(key)
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders by Status */}
            {Object.entries(groupedOrders).map(([status, statusOrders]) => (
                statusOrders.length > 0 && (
                    <div
                        key={status}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            marginBottom: '2rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: `linear-gradient(135deg, ${getStatusColor(status)})`,
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                color: 'white'
                            }}>
                                {getStatusIcon(status)}
                            </div>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: 'rgb(55 65 81)',
                                margin: 0
                            }}>
                                {getStatusText(status)} ({statusOrders.length})
                            </h2>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: window.innerWidth <= 768 ? '1rem' : '1rem'
                        }}>
                            {statusOrders.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        borderRadius: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    {/* Customer Info */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                        marginBottom: window.innerWidth <= 768 ? '0.75rem' : '1rem'
                                    }}>
                                        <div style={{
                                            width: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            height: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                            color: 'white'
                                        }}>
                                            👤
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                                fontWeight: '600',
                                                color: 'rgb(55 65 81)'
                                            }}>
                                                {order.subscription?.user?.full_name || order.subscription?.user?.name}
                                            </div>
                                            <div style={{
                                                fontSize: window.innerWidth <= 768 ? '0.625rem' : '0.75rem',
                                                color: 'rgb(107 114 128)'
                                            }}>
                                                {order.subscription?.user?.phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meal Info */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                        marginBottom: window.innerWidth <= 768 ? '0.75rem' : '1rem'
                                    }}>
                                        <div style={{
                                            width: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            height: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                            color: 'white'
                                        }}>
                                            🍽️
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                                fontWeight: '600',
                                                color: 'rgb(55 65 81)'
                                            }}>
                                                {language === 'ar' ? order.meal?.name_ar : order.meal?.name_en}
                                            </div>
                                            <div style={{
                                                fontSize: window.innerWidth <= 768 ? '0.625rem' : '0.75rem',
                                                color: 'rgb(107 114 128)'
                                            }}>
                                                {language === 'ar' ? order.meal?.type_ar : order.meal?.type_en}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                        marginBottom: window.innerWidth <= 768 ? '0.75rem' : '1rem'
                                    }}>
                                        <div style={{
                                            width: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            height: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                            color: 'white'
                                        }}>
                                            📍
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: window.innerWidth <= 768 ? '0.625rem' : '0.75rem',
                                                color: 'rgb(107 114 128)',
                                                lineHeight: '1.4'
                                            }}>
                                                {order.subscription?.delivery_address?.address}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Time */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                        marginBottom: window.innerWidth <= 768 ? '0.75rem' : '1rem'
                                    }}>
                                        <div style={{
                                            width: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            height: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                            color: 'white'
                                        }}>
                                            🕐
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: window.innerWidth <= 768 ? '0.625rem' : '0.75rem',
                                                color: 'rgb(107 114 128)'
                                            }}>
                                                {order.meal?.delivery_time || '12:00 PM'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Update Button */}
                                    {status !== 'delivered' && status !== 'cancelled' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, getNextStatus(status))}
                                            style={{
                                                width: '100%',
                                                padding: window.innerWidth <= 768 ? '0.625rem' : '0.75rem',
                                                background: `linear-gradient(135deg, ${getStatusColor(getNextStatus(status))})`,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            {getNextStatus(status) === 'preparing' 
                                                ? (language === 'ar' ? 'بدء التحضير' : 'Start Preparing')
                                                : getNextStatus(status) === 'delivered'
                                                ? (language === 'ar' ? 'تم التوصيل' : 'Mark as Delivered')
                                                : getStatusText(getNextStatus(status))
                                            }
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}

            {/* Empty State */}
            {orders.length === 0 && !loading && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '3rem',
                    textAlign: 'center',
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
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد طلبات اليوم' : 'No Orders Today'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' 
                            ? 'لا توجد طلبات للتوصيل اليوم. تحقق من الطلبات غداً!'
                            : 'No orders to deliver today. Check back tomorrow!'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default TodayOrders;
