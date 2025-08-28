import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const SubscriptionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubscriptionDetails();
    }, [id]);

    const fetchSubscriptionDetails = async () => {
        try {
            setLoading(true);
            const response = await subscriptionsAPI.getById(id);
            if (response.data.success) {
                setSubscription(response.data.data);
            } else {
                setError('فشل في جلب تفاصيل الاشتراك');
            }
        } catch (err) {
            setError('خطأ في جلب تفاصيل الاشتراك');
            console.error('Error fetching subscription:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'from-yellow-500 to-orange-500';
            case 'active':
                return 'from-green-500 to-emerald-500';
            case 'completed':
                return 'from-blue-500 to-indigo-500';
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
            case 'active':
                return '✅';
            case 'completed':
                return '🎉';
            case 'cancelled':
                return '❌';
            default:
                return '📋';
        }
    };

    const getPaymentMethodText = (method) => {
        const methods = {
            'credit_card': { ar: 'بطاقة ائتمان', en: 'Credit Card' },
            'cash': { ar: 'نقداً', en: 'Cash' },
            'bank_transfer': { ar: 'تحويل بنكي', en: 'Bank Transfer' }
        };
        return methods[method]?.[language] || method;
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'from-green-500 to-emerald-500';
            case 'pending':
                return 'from-yellow-500 to-orange-500';
            case 'failed':
                return 'from-red-500 to-pink-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            // Handle different date formats
            let date;
            if (typeof dateString === 'string') {
                // Remove any extra spaces and normalize
                const cleanDateString = dateString.trim();
                // Try different date formats
                if (cleanDateString.includes('-')) {
                    date = new Date(cleanDateString);
                } else if (cleanDateString.includes('/')) {
                    date = new Date(cleanDateString);
                } else {
                    date = new Date(cleanDateString);
                }
            } else if (dateString instanceof Date) {
                date = dateString;
            } else {
                date = new Date(dateString);
            }
            
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return '';
            }
            
            const formattedDate = date.toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Check if the formatted date is valid
            if (formattedDate === 'Invalid Date') {
                console.warn('Formatted date is invalid:', dateString);
                return '';
            }
            
            return formattedDate;
        } catch (error) {
            console.error('Error formatting date:', error, 'Date string:', dateString);
            return '';
        }
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>
                        {language === 'ar' ? 'جاري تحميل تفاصيل الاشتراك...' : 'Loading subscription details...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <p style={{ color: '#ef4444', fontSize: '1.125rem', marginBottom: '2rem' }}>{error}</p>
                    <button 
                        onClick={() => navigate('/my-subscriptions')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                            color: 'white',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {language === 'ar' ? 'العودة للاشتراكات' : 'Back to Subscriptions'}
                    </button>
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
                {/* Floating decorative elements */}
                        <div>
                    <div style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        right: '15%',
                        width: '80px',
                        height: '80px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}></div>
                        </div>
                        
                <div style={{ width: '100%', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderRadius: '9999px',
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.875rem',
                            color: 'rgb(67 56 202)',
                            marginBottom: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            📋 {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                        </div>
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
                            {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
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
                                ? 'تابع تفاصيل اشتراكك ووجباتك المخططة' 
                                : 'Track your subscription details and planned meals'
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '3rem 0' }}>
                <div style={{ width: '100%', padding: '0 2rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        
                        {/* Back Button */}
                        <div style={{ marginBottom: '2rem' }}>
                            <button 
                                onClick={() => navigate('/my-subscriptions')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    color: 'rgb(79 70 229)',
                                    border: '1px solid rgb(229 231 235)',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                                }}
                            >
                                ← {language === 'ar' ? 'العودة للاشتراكات' : 'Back to Subscriptions'}
                            </button>
                        </div>

                        {/* بطاقة موحدة - Unified Card */}
                        <div style={{
                            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1.5rem',
                            padding: '2.5rem',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(226, 232, 240, 0.6)',
                            position: 'relative',
                            overflow: 'hidden',
                            marginBottom: '3rem'
                        }}>
                            {/* Decorative background elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                right: '-50%',
                                width: '200%',
                                height: '200%',
                                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%)',
                                zIndex: 0
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                left: '-50%',
                                width: '200%',
                                height: '200%',
                                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.03) 0%, transparent 70%)',
                                zIndex: 0
                            }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* العنوان الرئيسي */}
                                <h2 style={{ 
                                    fontSize: '2rem', 
                                    fontWeight: '700', 
                                    marginBottom: '2.5rem',
                                    color: 'rgb(15 23 42)',
                                    textAlign: 'center'
                                }}>
                                {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                            </h2>

                                {/* معلومات المطعم */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.25rem', 
                                    marginBottom: '2.5rem',
                                    padding: '1.5rem',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(226, 232, 240, 0.5)'
                                }}>
                                    <div style={{
                                        width: '4rem',
                                        height: '4rem',
                                        background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                        borderRadius: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '2rem',
                                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                                    }}>
                                        🍽️
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ 
                                            fontSize: '1.5rem', 
                                            fontWeight: '700', 
                                            marginBottom: '0.5rem',
                                            color: 'rgb(15 23 42)'
                                        }}>
                                            {language === 'ar' ? subscription.restaurant?.name_ar : subscription.restaurant?.name_en}
                                        </h3>
                                        <p style={{ 
                                            fontSize: '1rem', 
                                            color: 'rgb(71 85 105)',
                                            fontWeight: '500'
                                        }}>
                                            {subscription.subscription_type_text} • {subscription.subscription_items?.length || 0} {language === 'ar' ? 'وجبة' : 'meals'}
                                        </p>
                                    </div>
                                </div>

                                {/* شبكة المعلومات */}
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '1.5rem',
                                    marginBottom: '2.5rem'
                                }}>
                                    {/* التواريخ */}
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(226, 232, 240, 0.5)',
                                        textAlign: 'center',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(135deg, rgb(59 130 246), rgb(37 99 235))',
                                                borderRadius: '0.375rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}>
                                                📅
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.875rem', 
                                                color: 'rgb(100 116 139)', 
                                                fontWeight: '500'
                                            }}>
                                                {language === 'ar' ? 'التواريخ' : 'Dates'}
                                    </span>
                                </div>
                                        <div style={{ 
                                            fontSize: '1rem', 
                                            fontWeight: '600', 
                                            color: 'rgb(15 23 42)',
                                            lineHeight: '1.4'
                                        }}>
                                                                                         <div style={{ marginBottom: '0.5rem' }}>
                                                 {language === 'ar' ? 'من:' : 'From:'} {subscription.start_date ? formatDate(subscription.start_date) : (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                             </div>
                                             <div>
                                                 {language === 'ar' ? 'إلى:' : 'To:'} {subscription.end_date ? formatDate(subscription.end_date) : (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                             </div>
                                        </div>
                                    </div>

                                    {/* المبلغ الإجمالي */}
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(79, 70, 229, 0.2)',
                                        textAlign: 'center',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                                borderRadius: '0.375rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}>
                                                💰
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.875rem', 
                                                color: 'rgb(79 70 229)', 
                                                fontWeight: '600'
                                            }}>
                                                {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                                    </span>
                                </div>
                                        <div style={{ 
                                            fontSize: '1.75rem', 
                                            fontWeight: '700', 
                                            color: 'rgb(79 70 229)',
                                            lineHeight: '1.2'
                                        }}>
                                        {subscription.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                                        </div>
                                    </div>

                                    {/* طريقة الدفع */}
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(226, 232, 240, 0.5)',
                                        textAlign: 'center',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{
                                                width: '1.5rem',
                                                height: '1.5rem',
                                                background: 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))',
                                                borderRadius: '0.375rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}>
                                                💳
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.875rem', 
                                                color: 'rgb(100 116 139)', 
                                                fontWeight: '500'
                                            }}>
                                                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                                    </span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '1.125rem', 
                                            fontWeight: '700', 
                                            color: 'rgb(15 23 42)',
                                            lineHeight: '1.3'
                                        }}>
                                            {getPaymentMethodText(subscription.payment_method)}
                                        </div>
                                    </div>
                                </div>

                                {/* عنوان التوصيل */}
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(226, 232, 240, 0.5)',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            width: '2rem',
                                            height: '2rem',
                                            background: 'linear-gradient(135deg, rgb(59 130 246), rgb(37 99 235))',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}>
                                            📍
                                        </div>
                                        <span style={{ 
                                            fontSize: '1rem', 
                                            color: 'rgb(100 116 139)', 
                                            fontWeight: '500'
                                        }}>
                                            {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                                    </span>
                                    </div>
                                    <div style={{ 
                                        fontSize: '1.25rem', 
                                        fontWeight: '700', 
                                        color: 'rgb(15 23 42)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {subscription.delivery_address?.name}
                                    </div>
                                    <div style={{ 
                                        fontSize: '1rem', 
                                        color: 'rgb(71 85 105)', 
                                        marginBottom: '0.5rem',
                                        lineHeight: '1.4'
                                    }}>
                                        {subscription.delivery_address?.address}
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        fontSize: '1rem', 
                                        color: 'rgb(71 85 105)',
                                        fontWeight: '500'
                                    }}>
                                        <span style={{ fontSize: '1.125rem' }}>📞</span>
                                        {subscription.delivery_address?.phone}
                                    </div>
                                </div>

                                {/* التعليمات الخاصة إذا وجدت */}
                                {subscription.special_instructions && (
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(226, 232, 240, 0.5)',
                                        marginTop: '1.5rem',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.75rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{
                                                width: '2rem',
                                                height: '2rem',
                                                background: 'linear-gradient(135deg, rgb(245 158 11), rgb(217 119 6))',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}>
                                                📝
                                            </div>
                                            <span style={{ 
                                                fontSize: '1rem', 
                                                color: 'rgb(100 116 139)', 
                                                fontWeight: '500'
                                            }}>
                                                {language === 'ar' ? 'تعليمات خاصة' : 'Special Instructions'}
                                            </span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '1rem', 
                                            color: 'rgb(15 23 42)',
                                            lineHeight: '1.5'
                                        }}>
                                            {subscription.special_instructions}
                            </div>
                        </div>
                                )}
                        </div>
                    </div>

                        {/* Meals Schedule */}
                        <div style={{ marginTop: '3rem' }}>
                            <h2 style={{ 
                                fontSize: '2rem', 
                                fontWeight: 'bold', 
                                marginBottom: '2rem',
                                color: 'rgb(31 41 55)',
                                textAlign: 'center'
                            }}>
                                {language === 'ar' ? 'جدول الوجبات' : 'Meals Schedule'}
                        </h2>
                        
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                gap: '1.5rem' 
                            }}>
                                {subscription.subscription_items?.map((item, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(15px)',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                                        border: '1px solid rgba(229, 231, 235, 0.3)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                                    }}>
                                        
                                        {/* Meal Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.25rem'
                                            }}>
                                                🍽️
                                            </div>
                                            <div>
                                                <h3 style={{ 
                                                    fontSize: '1.125rem', 
                                                    fontWeight: 'bold', 
                                                    marginBottom: '0.25rem',
                                                    color: 'rgb(31 41 55)'
                                                }}>
                                                    {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                                </h3>
                                                <p style={{ 
                                                    fontSize: '0.875rem', 
                                                    color: 'rgb(75 85 99)' 
                                                }}>
                                                    {item.meal?.meal_type_text} • {formatTime(item.meal?.delivery_time)}
                                                </p>
                                                    </div>
                                                </div>
                                                        
                                        {/* Delivery Date */}
                                        <div style={{
                                            padding: '0.75rem',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.5rem',
                                            border: '1px solid rgb(229 231 235)',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)', marginBottom: '0.25rem' }}>
                                                {language === 'ar' ? 'تاريخ التوصيل' : 'Delivery Date'}
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(31 41 55)' }}>
                                                {(() => {
                                                    if (!item.delivery_date) {
                                                        return language === 'ar' ? 'غير محدد' : 'Not specified';
                                                    }
                                                    const formattedDate = formatDate(item.delivery_date);
                                                    return formattedDate || (language === 'ar' ? 'غير محدد' : 'Not specified');
                                                })()}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                                                {item.day_of_week_text}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <OrderStatusBadge status={item.status} language={language} />
                                    </div>
                                ))}
                            </div>
                            </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SubscriptionDetail;
