import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscriptionsAPI } from '../../services/api';

const MySubscriptions = () => {
    const { t, language } = useLanguage();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setError('فشل في جلب الاشتراكات');
            }
        } catch (err) {
            setError('خطأ في جلب الاشتراكات');
            console.error('Error fetching subscriptions:', err);
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

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '1rem',
                background: 'transparent'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ 
                        color: 'rgb(75 85 99)', 
                        fontSize: 'clamp(0.875rem, 4vw, 1.125rem)',
                        padding: '0 1rem'
                    }}>
                        {language === 'ar' ? 'جاري تحميل اشتراكاتك...' : 'Loading your subscriptions...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '1rem',
                background: 'transparent'
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
                        onClick={fetchSubscriptions}
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
                        {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'transparent' }}>
            {/* Hero Section */}
            <section style={{ 
                position: 'relative',
                overflow: 'hidden',
                padding: 'clamp(1rem, 5vw, 2rem) 0 clamp(1.5rem, 6vw, 3rem) 0',
                background: 'transparent'
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
                            {language === 'ar' ? 'اشتراكاتي' : 'My Subscriptions'}
                        </h1>
                        <p style={{ 
                            color: 'rgb(75 85 99)', 
                            fontSize: 'clamp(0.875rem, 4vw, 1.125rem)', 
                            lineHeight: '1.7',
                            maxWidth: '600px',
                            margin: '0 auto clamp(1rem, 4vw, 2rem) auto',
                            padding: '0 clamp(0.5rem, 2vw, 1rem)'
                        }}>
                            {language === 'ar' 
                                ? 'تابع اشتراكاتك وإدارة وجباتك اليومية بسهولة' 
                                : 'Track your subscriptions and manage your daily meals easily'
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Subscriptions Section */}
            <section style={{ padding: 'clamp(1.5rem, 6vw, 3rem) 0' }}>
                <div style={{ width: '100%', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
                    {subscriptions.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 'clamp(0.75rem, 3vw, 1.25rem)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(229, 231, 235, 0.5)',
                            margin: '0 clamp(0.5rem, 2vw, 1rem)'
                        }}>
                            <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', marginBottom: '1rem' }}>🍽️</div>
                            <h2 style={{ 
                                fontSize: 'clamp(1.25rem, 5vw, 2rem)', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                color: 'rgb(79 70 229)'
                            }}>
                                {language === 'ar' ? 'لا توجد اشتراكات' : 'No Subscriptions'}
                            </h2>
                            <p style={{ 
                                fontSize: 'clamp(0.875rem, 4vw, 1.125rem)', 
                                color: 'rgb(75 85 99)', 
                                marginBottom: '2rem',
                                maxWidth: '500px',
                                margin: '0 auto 2rem auto',
                                padding: '0 clamp(0.5rem, 2vw, 1rem)'
                            }}>
                                {language === 'ar' 
                                    ? 'ابدأ رحلتك مع اشتراكات الوجبات واكتشف المطاعم المميزة' 
                                    : 'Start your journey with meal subscriptions and discover amazing restaurants'
                                }
                            </p>
                            <Link to="/restaurants" style={{
                                display: 'inline-block',
                                padding: 'clamp(0.5rem, 3vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: 'clamp(0.875rem, 4vw, 1rem)',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}>
                                🚀 {language === 'ar' ? 'استكشف المطاعم' : 'Explore Restaurants'}
                            </Link>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr',
                            gap: 'clamp(1rem, 4vw, 2rem)',
                            maxWidth: '1200px',
                            margin: '0 auto',
                            '@media (min-width: 640px)': {
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
                            }
                        }}>
                            {subscriptions.map((subscription) => (
                                <div key={subscription.id} style={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(15px)',
                                    borderRadius: 'clamp(0.75rem, 3vw, 1.25rem)',
                                    padding: 'clamp(1rem, 4vw, 2rem)',
                                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(229, 231, 235, 0.3)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (window.innerWidth > 768) {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (window.innerWidth > 768) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                                    }
                                }}>
                                    {/* Restaurant Info */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 'clamp(0.5rem, 3vw, 1rem)', 
                                        marginBottom: 'clamp(1rem, 4vw, 1.5rem)' 
                                    }}>
                                        <div style={{
                                            width: 'clamp(2.5rem, 8vw, 3rem)',
                                            height: 'clamp(2.5rem, 8vw, 3rem)',
                                            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                                            flexShrink: 0
                                        }}>
                                            🍽️
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <h3 style={{ 
                                                fontSize: 'clamp(1rem, 4vw, 1.25rem)', 
                                                fontWeight: 'bold', 
                                                marginBottom: '0.25rem',
                                                color: 'rgb(31 41 55)',
                                                wordBreak: 'break-word'
                                            }}>
                                                {language === 'ar' ? subscription.restaurant?.name_ar : subscription.restaurant?.name_en}
                                            </h3>
                                            <p style={{ 
                                                fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', 
                                                color: 'rgb(75 85 99)',
                                                wordBreak: 'break-word'
                                            }}>
                                                {subscription.subscription_type_text} • {subscription.subscription_items?.length || 0} {language === 'ar' ? 'وجبة' : 'meals'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Details Grid - Improved for mobile */}
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr',
                                        gap: 'clamp(0.5rem, 2vw, 1rem)', 
                                        marginBottom: 'clamp(1rem, 4vw, 1.5rem)',
                                        '@media (min-width: 480px)': {
                                            gridTemplateColumns: 'repeat(2, 1fr)'
                                        },
                                        '@media (min-width: 640px)': {
                                            gridTemplateColumns: 'repeat(3, 1fr)'
                                        }
                                    }}>
                                        <div style={{
                                            padding: 'clamp(0.75rem, 3vw, 1rem)',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgb(229 231 235)'
                                        }}>
                                            <div style={{ 
                                                fontSize: 'clamp(0.625rem, 2.5vw, 0.75rem)', 
                                                color: 'rgb(107 114 128)', 
                                                marginBottom: '0.5rem' 
                                            }}>
                                                {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                                            </div>
                                            <div style={{ 
                                                fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
                                                fontWeight: '600', 
                                                color: 'rgb(31 41 55)' 
                                            }}>
                                                {new Date(subscription.start_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            padding: 'clamp(0.75rem, 3vw, 1rem)',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgb(229 231 235)'
                                        }}>
                                            <div style={{ 
                                                fontSize: 'clamp(0.625rem, 2.5vw, 0.75rem)', 
                                                color: 'rgb(107 114 128)', 
                                                marginBottom: '0.5rem' 
                                            }}>
                                                {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                            </div>
                                            <div style={{ 
                                                fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
                                                fontWeight: '600', 
                                                color: 'rgb(31 41 55)' 
                                            }}>
                                                {new Date(subscription.end_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            padding: 'clamp(0.75rem, 3vw, 1rem)',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgb(229 231 235)',
                                            '@media (min-width: 480px)': {
                                                gridColumn: 'span 2'
                                            },
                                            '@media (min-width: 640px)': {
                                                gridColumn: 'span 1'
                                            }
                                        }}>
                                            <div style={{ 
                                                fontSize: 'clamp(0.625rem, 2.5vw, 0.75rem)', 
                                                color: 'rgb(107 114 128)', 
                                                marginBottom: '0.5rem' 
                                            }}>
                                                {t('totalAmount')}
                                            </div>
                                            <div style={{ 
                                                fontSize: 'clamp(0.875rem, 3vw, 1rem)', 
                                                fontWeight: '600', 
                                                color: 'rgb(79 70 229)' 
                                            }}>
                                                {subscription.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <Link to={`/subscriptions/${subscription.id}`} style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: 'clamp(0.75rem, 3vw, 1rem)',
                                        borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: 'clamp(0.875rem, 4vw, 1rem)',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
                                    }}>
                                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default MySubscriptions;

