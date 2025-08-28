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

                            {/* Meal Type Filter */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                position: 'relative',
                                zIndex: 10
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: 'rgb(75 85 99)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        🍽️ {language === 'ar' ? 'فلتر أنواع الوجبات' : 'Meal Type Filter'}
                                    </h3>
                                    
                                    {/* Meal Type Filter Dropdown */}
                                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                                        <button
                                            id="meal-type-button"
                                            onClick={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: '2px solid rgb(209 213 219)',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                color: mealTypeFilter ? 'rgb(34 197 94)' : 'rgb(75 85 99)',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                textAlign: dir === 'rtl' ? 'right' : 'left'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = 'rgb(34 197 94)';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = 'rgb(209 213 219)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <span style={{ 
                                                color: mealTypeFilter ? 'rgb(34 197 94)' : 'rgb(75 85 99)',
                                                fontWeight: mealTypeFilter ? '600' : '500'
                                            }}>
                                                {getSelectedMealTypeText()}
                                            </span>
                                            <span style={{ 
                                                fontSize: '1rem',
                                                transition: 'transform 0.2s ease',
                                                transform: showMealTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}>
                                                ▼
                                            </span>
                                        </button>

                                        {showMealTypeDropdown && (
                                            <div
                                                id="meal-type-dropdown"
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    background: 'white',
                                                    borderRadius: '0.5rem',
                                                    border: '2px solid rgb(209 213 219)',
                                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                                    zIndex: 1000,
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    marginTop: '0.25rem'
                                                }}>
                                                <div
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.2s ease',
                                                        borderBottom: '1px solid rgb(243 244 246)',
                                                        fontSize: '0.875rem',
                                                        color: 'rgb(75 85 99)',
                                                        fontWeight: '500',
                                                        textAlign: dir === 'rtl' ? 'right' : 'left'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = 'rgb(249 250 251)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearMealTypeFilter();
                                                    }}
                                                >
                                                    {language === 'ar' ? 'عرض جميع الوجبات' : 'Show All Meals'}
                                                </div>
                                                {fallbackMealTypes.map(mealType => (
                                                    <div
                                                        key={mealType}
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s ease',
                                                            borderBottom: '1px solid rgb(243 244 246)',
                                                            fontSize: '0.875rem',
                                                            color: mealTypeFilter === mealType ? 'rgb(34 197 94)' : 'rgb(75 85 99)',
                                                            fontWeight: mealTypeFilter === mealType ? '600' : '500',
                                                            backgroundColor: mealTypeFilter === mealType ? 'rgb(240 253 244)' : 'transparent',
                                                            textAlign: dir === 'rtl' ? 'right' : 'left'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (mealTypeFilter !== mealType) {
                                                                e.target.style.backgroundColor = 'rgb(249 250 251)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (mealTypeFilter !== mealType) {
                                                                e.target.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            console.log('Clicked on meal type item:', mealType);
                                                            e.stopPropagation();
                                                            handleMealTypeFilter(mealType);
                                                        }}
                                                    >
                                                        {mealTypeNames[language][mealType] || mealType}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Filter Status */}
                                    {mealTypeFilter && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            background: 'rgb(240 253 244)',
                                            borderRadius: '0.5rem',
                                            border: '1px solid rgb(34 197 94)',
                                            fontSize: '0.875rem',
                                            color: 'rgb(34 197 94)',
                                            fontWeight: '500'
                                        }}>
                                            <span>✅</span>
                                            <span>
                                                {language === 'ar' 
                                                    ? `عرض وجبات ${mealTypeNames[language][mealTypeFilter]} فقط` 
                                                    : `Showing ${mealTypeNames[language][mealTypeFilter]} meals only`
                                                }
                                            </span>
                                            <button
                                                onClick={clearMealTypeFilter}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'rgb(34 197 94)',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    padding: '0.25rem',
                                                    borderRadius: '0.25rem',
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                gap: '1.5rem' 
                            }}>
                                {filteredMeals.length === 0 ? (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        textAlign: 'center',
                                        padding: '3rem',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(229, 231, 235, 0.3)'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                                        <h3 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: '600', 
                                            color: 'rgb(75 85 99)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {language === 'ar' 
                                                ? `لا توجد وجبات ${mealTypeFilter ? mealTypeNames[language][mealTypeFilter] : ''} في هذا الاشتراك` 
                                                : `No ${mealTypeFilter ? mealTypeNames[language][mealTypeFilter] : ''} meals in this subscription`
                                            }
                                        </h3>
                                        <p style={{ 
                                            fontSize: '1rem', 
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '1.5rem'
                                        }}>
                                            {language === 'ar' 
                                                ? 'جرب اختيار نوع وجبة مختلف أو عرض جميع الوجبات' 
                                                : 'Try selecting a different meal type or show all meals'
                                            }
                                        </p>
                                        <button
                                            onClick={clearMealTypeFilter}
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
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            {language === 'ar' ? 'عرض جميع الوجبات' : 'Show All Meals'}
                                        </button>
                                    </div>
                                ) : (
                                    filteredMeals.map((item, index) => (
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
                                ))
                                )}
                            </div>
                            </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SubscriptionDetail;
