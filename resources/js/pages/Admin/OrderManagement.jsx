import React, { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderStatusControl from '../../components/OrderStatusControl';

const OrderManagement = () => {
    const { language } = useLanguage();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await subscriptionsAPI.getAll();
            
            if (response.data.success) {
                setSubscriptions(response.data.data);
            } else {
                setError('فشل في جلب الطلبات');
            }
        } catch (err) {
            setError('خطأ في جلب الطلبات');
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (subscriptionId, itemId, newStatus) => {
        setSubscriptions(prev => prev.map(subscription => {
            if (subscription.id === subscriptionId) {
                return {
                    ...subscription,
                    subscription_items: subscription.subscription_items.map(item => {
                        if (item.id === itemId) {
                            return { ...item, status: newStatus };
                        }
                        return item;
                    })
                };
            }
            return subscription;
        }));
    };

    const filteredSubscriptions = subscriptions.filter(subscription => {
        if (filter === 'all') return true;
        return subscription.subscription_items.some(item => item.status === filter);
    });

    const getFilterOptions = () => [
        { value: 'all', label: language === 'ar' ? 'جميع الطلبات' : 'All Orders', icon: '📋' },
        { value: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending', icon: '⏳' },
        { value: 'preparing', label: language === 'ar' ? 'قيد التحضير' : 'Preparing', icon: '👨‍🍳' },
        { value: 'delivered', label: language === 'ar' ? 'تم التوصيل' : 'Delivered', icon: '✅' },
        { value: 'cancelled', label: language === 'ar' ? 'ملغي' : 'Cancelled', icon: '❌' }
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>
                        {language === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem 0 3rem 0'
            }}>
                <div style={{ width: '100%', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <h1 style={{ 
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                            fontWeight: 'bold', 
                            lineHeight: '1.2', 
                            marginBottom: '1.5rem',
                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {language === 'ar' ? 'إدارة الطلبات' : 'Order Management'}
                        </h1>
                        <p style={{ 
                            marginTop: '1rem', 
                            color: 'rgb(75 85 99)', 
                            marginBottom: '2rem', 
                            fontSize: '1.125rem', 
                            lineHeight: '1.7',
                            maxWidth: '600px',
                            margin: '0 auto 2rem auto'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة وتتبع جميع الطلبات وتحديث حالاتها' 
                                : 'Manage and track all orders and update their status'
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section style={{ padding: '2rem 0' }}>
                <div style={{ width: '100%', padding: '0 2rem' }}>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        {getFilterOptions().map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '1rem',
                                    border: 'none',
                                    background: filter === option.value 
                                        ? 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    color: filter === option.value ? 'white' : 'rgb(75 85 99)',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: filter === option.value 
                                        ? '0 8px 25px rgba(79, 70, 229, 0.3)'
                                        : '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    if (filter !== option.value) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (filter !== option.value) {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Orders Section */}
            <section style={{ padding: '0 0 3rem 0' }}>
                <div style={{ width: '100%', padding: '0 2rem' }}>
                    {error && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgb(239 68 68), rgb(236 72 153))',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {filteredSubscriptions.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '4rem 2rem',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1.25rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(229, 231, 235, 0.5)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                            <h2 style={{ 
                                fontSize: '2rem', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                color: 'rgb(79 70 229)'
                            }}>
                                {language === 'ar' ? 'لا توجد طلبات' : 'No Orders'}
                            </h2>
                            <p style={{ 
                                fontSize: '1.125rem', 
                                color: 'rgb(75 85 99)', 
                                marginBottom: '2rem'
                            }}>
                                {language === 'ar' 
                                    ? 'لا توجد طلبات تطابق المعايير المحددة' 
                                    : 'No orders match the selected criteria'
                                }
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {filteredSubscriptions.map((subscription) => (
                                <div key={subscription.id} style={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(15px)',
                                    borderRadius: '1.25rem',
                                    padding: '2rem',
                                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(229, 231, 235, 0.3)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}>
                                    {/* Subscription Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: '3rem',
                                            height: '3rem',
                                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '1.5rem'
                                        }}>
                                            🍽️
                                        </div>
                                        <div>
                                            <h3 style={{ 
                                                fontSize: '1.25rem', 
                                                fontWeight: 'bold', 
                                                marginBottom: '0.25rem',
                                                color: 'rgb(31 41 55)'
                                            }}>
                                                {language === 'ar' ? subscription.restaurant?.name_ar : subscription.restaurant?.name_en}
                                            </h3>
                                            <p style={{ 
                                                fontSize: '0.875rem', 
                                                color: 'rgb(75 85 99)' 
                                            }}>
                                                {subscription.subscription_type_text} • {subscription.subscription_items?.length || 0} {language === 'ar' ? 'وجبة' : 'meals'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ 
                                            fontSize: '1rem', 
                                            fontWeight: '600', 
                                            marginBottom: '1rem',
                                            color: 'rgb(31 41 55)'
                                        }}>
                                            {language === 'ar' ? 'تفاصيل الطلب:' : 'Order Details:'}
                                        </h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {subscription.subscription_items?.map((item, index) => (
                                                <div key={index} style={{
                                                    padding: '1rem',
                                                    background: 'rgb(249 250 251)',
                                                    borderRadius: '0.75rem',
                                                    border: '1px solid rgb(229 231 235)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                                        <div style={{
                                                            width: '2rem',
                                                            height: '2rem',
                                                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                                            borderRadius: '0.5rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '1rem'
                                                        }}>
                                                            🍽️
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <h5 style={{ 
                                                                fontSize: '0.875rem', 
                                                                fontWeight: '600', 
                                                                marginBottom: '0.25rem',
                                                                color: 'rgb(31 41 55)'
                                                            }}>
                                                                {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                                            </h5>
                                                            <p style={{ 
                                                                fontSize: '0.75rem', 
                                                                color: 'rgb(75 85 99)' 
                                                            }}>
                                                                {item.day_of_week_text} • {new Date(item.delivery_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <OrderStatusBadge status={item.status} language={language} />
                                                    </div>
                                                    
                                                    <OrderStatusControl 
                                                        subscriptionId={subscription.id}
                                                        itemId={item.id}
                                                        currentStatus={item.status}
                                                        onStatusUpdate={(newStatus) => handleStatusUpdate(subscription.id, item.id, newStatus)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div style={{
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(99, 102, 241, 0.05))',
                                        borderRadius: '0.75rem',
                                        border: '1px solid rgba(79, 70, 229, 0.1)'
                                    }}>
                                        <h5 style={{ 
                                            fontSize: '0.875rem', 
                                            fontWeight: '600', 
                                            marginBottom: '0.5rem',
                                            color: 'rgb(79 70 229)'
                                        }}>
                                            {language === 'ar' ? 'معلومات العميل:' : 'Customer Info:'}
                                        </h5>
                                        <p style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'rgb(75 85 99)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {language === 'ar' ? 'الاسم:' : 'Name:'} {subscription.user?.name}
                                        </p>
                                        <p style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'rgb(75 85 99)',
                                            marginBottom: '0.25rem',
                                            direction: 'ltr'
                                        }}>
                                            {language === 'ar' ? 'الهاتف:' : 'Phone:'} {subscription.delivery_address?.phone}
                                        </p>
                                        <p style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'rgb(75 85 99)'
                                        }}>
                                            {language === 'ar' ? 'العنوان:' : 'Address:'} {subscription.delivery_address?.address}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default OrderManagement;
