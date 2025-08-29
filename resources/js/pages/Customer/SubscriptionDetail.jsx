import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionsAPI, restaurantsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const SubscriptionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language, dir } = useLanguage();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mealTypeFilter, setMealTypeFilter] = useState('');
    const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);

    // أسماء أنواع الوجبات حسب اللغة
    const mealTypeNames = {
        ar: {
            'breakfast': 'فطور',
            'lunch': 'غداء',
            'dinner': 'عشاء'
        },
        en: {
            'breakfast': 'Breakfast',
            'lunch': 'Lunch',
            'dinner': 'Dinner'
        }
    };

    // Fallback filters في حالة عدم وجود بيانات
    const fallbackMealTypes = ['breakfast', 'lunch', 'dinner'];

    useEffect(() => {
        fetchSubscriptionDetails();
    }, [id]);

    // إغلاق القوائم المنسدلة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            const mealTypeDropdown = document.getElementById('meal-type-dropdown');
            const mealTypeButton = document.getElementById('meal-type-button');
            
            if (showMealTypeDropdown && 
                mealTypeDropdown && 
                !mealTypeDropdown.contains(event.target) &&
                mealTypeButton &&
                !mealTypeButton.contains(event.target)) {
                setShowMealTypeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMealTypeDropdown]);

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

    const handleMealTypeFilter = (mealType) => {
        console.log('Meal type selected:', mealType);
        setMealTypeFilter(prev => prev === mealType ? '' : mealType);
        setShowMealTypeDropdown(false);
    };

    const clearMealTypeFilter = () => {
        setMealTypeFilter('');
        setShowMealTypeDropdown(false);
    };

    const getSelectedMealTypeText = () => {
        if (!mealTypeFilter) return language === 'ar' ? 'جميع أنواع الوجبات' : 'All Meal Types';
        return mealTypeNames[language][mealTypeFilter] || mealTypeFilter;
    };

    // فلترة الوجبات حسب النوع المختار
    const filteredMeals = subscription?.subscription_items?.filter(item => {
        if (!mealTypeFilter) return true;
        return item.meal?.meal_type === mealTypeFilter;
    }) || [];

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
            
            const formattedDate = date.toLocaleDateString('ar-EG', {
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
            <div style={{ 
                minHeight: '100vh', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '1rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ 
                        color: 'rgb(75 85 99)', 
                        fontSize: 'clamp(0.875rem, 4vw, 1.125rem)',
                        padding: '0 1rem'
                    }}>
                        {language === 'ar' ? 'جاري تحميل تفاصيل الاشتراك...' : 'Loading subscription details...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '1rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '1rem' }}>❌</div>
                    <p style={{ 
                        color: '#ef4444', 
                        fontSize: 'clamp(0.875rem, 4vw, 1.125rem)', 
                        marginBottom: '2rem',
                        padding: '0 1rem'
                    }}>{error}</p>
                    <button 
                        onClick={() => navigate('/my-subscriptions')}
                        style={{
                            padding: 'clamp(0.5rem, 3vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                            color: 'white',
                            border: 'none',
                            fontSize: 'clamp(0.875rem, 4vw, 1rem)',
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
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
            position: 'relative'
        }}>
            {/* Unified Background Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            {/* Hero Section */}
            <section style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                position: 'relative',
                overflow: 'hidden',
                padding: 'clamp(1rem, 5vw, 2rem) 0 clamp(1.5rem, 6vw, 3rem) 0'
            }}>
                {/* Floating decorative elements - Hidden on mobile */}
                <div style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
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
                    <div style={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '20%',
                        width: '120px',
                        height: '120px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}></div>
                </div>
                
                <div style={{ width: '100%', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <h1 style={{ 
                            fontSize: 'clamp(1.75rem, 6vw, 3.5rem)', 
                            fontWeight: 'bold', 
                            lineHeight: '1.2', 
                            marginBottom: 'clamp(1rem, 4vw, 1.5rem)',
                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                        </h1>
                        <p style={{ 
                            color: 'rgb(75 85 99)', 
                            fontSize: 'clamp(0.875rem, 4vw, 1.125rem)', 
                            lineHeight: '1.7',
                            maxWidth: '600px',
                            margin: '0 auto',
                            padding: '0 1rem'
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
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '2rem 1rem',
                position: 'relative',
                zIndex: 1
            }}>
                
                {/* Unified Subscription Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '2rem',
                    padding: '2rem',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    marginBottom: '2rem',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '@media (max-width: 768px)': {
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }
                }}>
                    {/* Card Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        opacity: 0.5,
                        zIndex: 0
                    }}></div>
                    
                    {/* Header Section */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
                        position: 'relative',
                        zIndex: 1,
                        '@media (min-width: 768px)': {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '2rem',
                            marginBottom: '2.5rem',
                            paddingBottom: '2rem'
                        }
                    }}>

                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            <h2 style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: '800', 
                                marginBottom: '0.75rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                '@media (max-width: 768px)': {
                                    fontSize: '1.5rem'
                                }
                            }}>
                                {language === 'ar' ? subscription.restaurant?.name_ar : subscription.restaurant?.name_en}
                            </h2>

                        </div>
                    </div>

                    {/* Main Information Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                        position: 'relative',
                        zIndex: 1,
                        '@media (min-width: 768px)': {
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '2rem',
                            marginBottom: '2.5rem'
                        }
                    }}>
                        
                        {/* Restaurant & Dates Section */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '@media (max-width: 768px)': {
                                borderRadius: '1.25rem',
                                padding: '1.25rem'
                            }
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}></div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                marginBottom: '1rem',
                                color: '#667eea',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                '@media (max-width: 768px)': {
                                    fontSize: '1.125rem',
                                    marginBottom: '0.75rem'
                                }
                            }}>
                                📋 {language === 'ar' ? 'معلومات الاشتراك' : 'Subscription Info'}
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>
                                        {formatDate(subscription.start_date)}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    border: '1px solid rgba(102, 126, 234, 0.1)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937' }}>
                                        {formatDate(subscription.end_date)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information Section */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '@media (max-width: 768px)': {
                                borderRadius: '1.25rem',
                                padding: '1.25rem'
                            }
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                            }}></div>
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '700', 
                                marginBottom: '1rem',
                                color: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                '@media (max-width: 768px)': {
                                    fontSize: '1.125rem',
                                    marginBottom: '0.75rem'
                                }
                            }}>
                                💰 {language === 'ar' ? 'معلومات الدفع' : 'Payment Info'}
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(74, 222, 128, 0.1)'
                                }}>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                                        {language === 'ar' ? 'سعر الاشتراك' : 'Subscription Price'}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1f2937' }}>
                                        {subscription.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(74, 222, 128, 0.1)'
                                }}>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                                        {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1f2937' }}>
                                        {subscription.delivery_price > 0 
                                            ? `${subscription.delivery_price} ${language === 'ar' ? 'ريال' : 'SAR'}`
                                            : language === 'ar' ? 'مجاني' : 'Free'
                                        }
                                    </span>
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
                                }}>
                                    <span style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
                                        {language === 'ar' ? 'المجموع' : 'Total'}
                                    </span>
                                    <span style={{ 
                                        fontSize: '1.125rem', 
                                        fontWeight: '800', 
                                        color: 'white'
                                    }}>
                                        {(parseFloat(subscription.total_amount) + parseFloat(subscription.delivery_price)).toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Delivery Address Section */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(236, 72, 153, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '@media (max-width: 768px)': {
                                borderRadius: '1.25rem',
                                padding: '1.25rem'
                            }
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                            }}></div>
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '700', 
                                marginBottom: '1rem',
                                color: '#db2777',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                '@media (max-width: 768px)': {
                                    fontSize: '1.125rem',
                                    marginBottom: '0.75rem'
                                }
                            }}>
                                📍 {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                            </h3>
                            
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                border: '1px solid rgba(236, 72, 153, 0.1)'
                            }}>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    {subscription.delivery_address?.name}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                                    {subscription.delivery_address?.address}
                                </div>
                                                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '600',
                                    direction: 'ltr'
                                }}>
                                    📞 {subscription.delivery_address?.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Special Instructions (if exists) */}
                    {subscription.special_instructions && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '@media (max-width: 768px)': {
                                borderRadius: '1.25rem',
                                padding: '1.25rem',
                                marginBottom: '1.5rem'
                            }
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            }}></div>
                            <h3 style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '700', 
                                marginBottom: '1rem',
                                color: '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                '@media (max-width: 768px)': {
                                    fontSize: '1.125rem',
                                    marginBottom: '0.75rem'
                                }
                            }}>
                                📝 {language === 'ar' ? 'تعليمات خاصة' : 'Special Instructions'}
                            </h3>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                border: '1px solid rgba(245, 158, 11, 0.1)'
                            }}>
                                <p style={{ 
                                    fontSize: '0.875rem', 
                                    color: '#1f2937',
                                    lineHeight: '1.6',
                                    margin: 0,
                                    fontWeight: '500'
                                }}>
                                    {subscription.special_instructions}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Meals Section - Redesigned for Mobile */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '@media (max-width: 768px)': {
                        borderRadius: '1rem',
                        padding: '1rem',
                        margin: '0 -0.5rem'
                    }
                }}>
                    {/* Enhanced Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: `
                            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.06) 0%, transparent 50%),
                            linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)
                        `,
                        opacity: 1,
                        zIndex: 0
                    }}></div>
                    
                    {/* Redesigned Header */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid rgba(102, 126, 234, 0.15)',
                        position: 'relative',
                        zIndex: 1,
                        '@media (min-width: 768px)': {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem',
                            paddingBottom: '1.5rem'
                        }
                    }}>
                        {/* Title with Enhanced Design */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            '@media (max-width: 768px)': {
                                justifyContent: 'center'
                            }
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
                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                                '@media (max-width: 768px)': {
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    fontSize: '1.25rem',
                                    borderRadius: '0.75rem'
                                }
                            }}>
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    margin: 0,
                                    '@media (max-width: 768px)': {
                                        fontSize: '1.25rem'
                                    }
                                }}>
                                    {language === 'ar' ? 'الوجبات' : 'Meals'}
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    margin: '0.25rem 0 0 0',
                                    fontWeight: '500',
                                    '@media (max-width: 768px)': {
                                        fontSize: '0.8rem'
                                    }
                                }}>
                                    {filteredMeals.length} {language === 'ar' ? 'وجبة' : 'meal'}
                                </p>
                            </div>
                        </div>
                        

                    </div>
                    
                    {/* Redesigned Meals List */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1rem', 
                        position: 'relative', 
                        zIndex: 1,
                        '@media (max-width: 768px)': {
                            gap: '0.75rem'
                        }
                    }}>
                        {filteredMeals.length === 0 ? (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                                borderRadius: '1.25rem',
                                padding: '2.5rem 1.5rem',
                                textAlign: 'center',
                                border: '2px solid rgba(102, 126, 234, 0.15)',
                                '@media (max-width: 768px)': {
                                    borderRadius: '1rem',
                                    padding: '2rem 1rem'
                                }
                            }}>
                                <div style={{ 
                                    fontSize: '3.5rem', 
                                    marginBottom: '1rem',
                                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                                    '@media (max-width: 768px)': {
                                        fontSize: '2.5rem',
                                        marginBottom: '0.75rem'
                                    }
                                }}>
                                </div>
                                <p style={{ 
                                    fontSize: '1rem',
                                    color: '#6b7280',
                                    marginBottom: '1.5rem',
                                    fontWeight: '500',
                                    lineHeight: '1.5',
                                    '@media (max-width: 768px)': {
                                        fontSize: '0.9rem',
                                        marginBottom: '1.25rem'
                                    }
                                }}>
                                    {language === 'ar' 
                                        ? 'لا توجد وجبات في هذا الاشتراك' 
                                        : 'No meals in this subscription'
                                    }
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        padding: '0.875rem 1.5rem',
                                        borderRadius: '0.875rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                        minHeight: '44px',
                                        '@media (max-width: 768px)': {
                                            padding: '0.75rem 1.25rem',
                                            fontSize: '0.85rem',
                                            borderRadius: '0.75rem'
                                        }
                                    }}
                                >
                                    {language === 'ar' ? 'إعادة تحميل' : 'Reload'}
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '1rem',
                                '@media (min-width: 640px)': {
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                    gap: '1.25rem'
                                },
                                '@media (max-width: 768px)': {
                                    gap: '0.75rem'
                                }
                            }}>
                                {filteredMeals.map((item, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '1.25rem',
                                        padding: '1.5rem',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                                        border: '2px solid rgba(255, 255, 255, 0.6)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        '@media (max-width: 768px)': {
                                            padding: '1.25rem',
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(255, 255, 255, 0.4)'
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                                    }}>
                                        {/* Enhanced Card Background */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0',
                                            width: '100%',
                                            height: '100%',
                                            background: `
                                                radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
                                                radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)
                                            `,
                                            opacity: 1,
                                            zIndex: 0
                                        }}></div>
                                        

                                        
                                        {/* Enhanced Meal Name */}
                                        <h4 style={{
                                            fontSize: '1.125rem',
                                            fontWeight: '700',
                                            marginBottom: '0.75rem',
                                            color: '#1f2937',
                                            lineHeight: '1.4',
                                            position: 'relative',
                                            zIndex: 1,
                                            '@media (max-width: 768px)': {
                                                fontSize: '1rem',
                                                lineHeight: '1.3',
                                                marginBottom: '0.5rem'
                                            }
                                        }}>
                                            {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                        </h4>
                                        
                                        {/* Simplified Info Row - Only Time and Day */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            marginBottom: '1rem',
                                            position: 'relative',
                                            zIndex: 1,
                                            '@media (max-width: 768px)': {
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                gap: '0.5rem',
                                                fontSize: '0.8rem'
                                            }
                                        }}>
                                            <span style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem',
                                                fontWeight: '600',
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                borderRadius: '0.5rem',
                                                '@media (max-width: 768px)': {
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.4rem'
                                                }
                                            }}>
                                                🕐 {formatTime(item.meal?.delivery_time)}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                opacity: '0.8',
                                                fontWeight: '500',
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(118, 75, 162, 0.1)',
                                                borderRadius: '0.5rem',
                                                '@media (max-width: 768px)': {
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.4rem'
                                                }
                                            }}>
                                                {item.day_of_week_text}
                                            </span>
                                        </div>
                                        
                                        {/* Enhanced Delivery Date Section */}
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                                            borderRadius: '0.875rem',
                                            padding: '1rem',
                                            border: '1px solid rgba(102, 126, 234, 0.15)',
                                            position: 'relative',
                                            zIndex: 1,
                                            '@media (max-width: 768px)': {
                                                padding: '0.75rem',
                                                borderRadius: '0.75rem'
                                            }
                                        }}>
                                            <div style={{ 
                                                fontSize: '0.75rem', 
                                                color: '#6b7280', 
                                                marginBottom: '0.5rem',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                '@media (max-width: 768px)': {
                                                    fontSize: '0.7rem',
                                                    marginBottom: '0.4rem'
                                                }
                                            }}>
                                                {language === 'ar' ? 'تاريخ التوصيل' : 'Delivery Date'}
                                            </div>
                                            <div style={{ 
                                                fontSize: '1rem', 
                                                fontWeight: '700', 
                                                color: '#1f2937',
                                                marginBottom: '1rem',
                                                '@media (max-width: 768px)': {
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.3',
                                                    marginBottom: '0.75rem'
                                                }
                                            }}>
                                                {formatDate(item.delivery_date)}
                                            </div>
                                            
                                            {/* Enhanced Status Section */}
                                            <div style={{
                                                borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                                                paddingTop: '0.75rem',
                                                '@media (max-width: 768px)': {
                                                    paddingTop: '0.5rem'
                                                }
                                            }}>
                                                <div style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: '#6b7280', 
                                                    marginBottom: '0.5rem',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    '@media (max-width: 768px)': {
                                                        fontSize: '0.7rem',
                                                        marginBottom: '0.4rem'
                                                    }
                                                }}>
                                                    {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    '@media (max-width: 768px)': {
                                                        justifyContent: 'center'
                                                    }
                                                }}>
                                                    <OrderStatusBadge status={item.status} language={language} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default SubscriptionDetail;
