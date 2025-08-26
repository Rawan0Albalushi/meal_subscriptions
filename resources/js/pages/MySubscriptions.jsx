import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

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
            const response = await fetch('/api/subscriptions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setSubscriptions(data.data);
            } else {
                setError('Failed to fetch subscriptions');
            }
        } catch (err) {
            setError('Error fetching subscriptions');
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
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>
                        {language === 'ar' ? 'جاري تحميل اشتراكاتك...' : 'Loading your subscriptions...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <p style={{ color: '#ef4444', fontSize: '1.125rem', marginBottom: '2rem' }}>{error}</p>
                        <button 
                            onClick={fetchSubscriptions}
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
                            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
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
                            📋 {language === 'ar' ? 'اشتراكاتك' : 'Your Subscriptions'}
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
                                {language === 'ar' ? 'اشتراكاتي' : 'My Subscriptions'}
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
                                ? 'تابع اشتراكاتك وإدارة وجباتك اليومية بسهولة' 
                                : 'Track your subscriptions and manage your daily meals easily'
                            }
                        </p>
                            </div>
                        </div>
            </section>

            {/* Subscriptions Section */}
            <section style={{ padding: '3rem 0' }}>
                <div style={{ width: '100%', padding: '0 2rem' }}>
                    {subscriptions.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '4rem 2rem',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1.25rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(229, 231, 235, 0.5)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
                            <h2 style={{ 
                                fontSize: '2rem', 
                                fontWeight: 'bold', 
                                marginBottom: '1rem',
                                color: 'rgb(79 70 229)'
                            }}>
                                {language === 'ar' ? 'لا توجد اشتراكات' : 'No Subscriptions'}
                            </h2>
                            <p style={{ 
                                fontSize: '1.125rem', 
                                color: 'rgb(75 85 99)', 
                                marginBottom: '2rem',
                                maxWidth: '500px',
                                margin: '0 auto 2rem auto'
                            }}>
                                    {language === 'ar' 
                                    ? 'ابدأ رحلتك مع اشتراكات الوجبات واكتشف المطاعم المميزة' 
                                    : 'Start your journey with meal subscriptions and discover amazing restaurants'
                                    }
                                </p>
                            <Link to="/restaurants" style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.75rem',
                                background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}>
                                🚀 {language === 'ar' ? 'استكشف المطاعم' : 'Explore Restaurants'}
                                </Link>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {subscriptions.map((subscription) => (
                                <div key={subscription.id} style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '1.25rem',
                                    padding: '2rem',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(229, 231, 235, 0.5)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                                }}>
                                    {/* Restaurant Info */}
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
                                            
                                    {/* Status */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            background: `linear-gradient(135deg, ${getStatusColor(subscription.status).includes('green') ? 'rgb(34 197 94)' : 
                                                                                   getStatusColor(subscription.status).includes('yellow') ? 'rgb(234 179 8)' :
                                                                                   getStatusColor(subscription.status).includes('red') ? 'rgb(239 68 68)' :
                                                                                   getStatusColor(subscription.status).includes('blue') ? 'rgb(59 130 246)' :
                                                                                   'rgb(107 114 128)'}, ${getStatusColor(subscription.status).includes('green') ? 'rgb(16 185 129)' : 
                                                                                   getStatusColor(subscription.status).includes('yellow') ? 'rgb(245 158 11)' :
                                                                                   getStatusColor(subscription.status).includes('red') ? 'rgb(236 72 153)' :
                                                                                   getStatusColor(subscription.status).includes('blue') ? 'rgb(99 102 241)' :
                                                                                   'rgb(156 163 175)'})`,
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: '600'
                                        }}>
                                            <span>{getStatusIcon(subscription.status)}</span>
                                                    {subscription.status_text}
                                            </div>
                                        </div>
                                        
                                    {/* Details Grid */}
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                                        gap: '1rem', 
                                        marginBottom: '1.5rem' 
                                    }}>
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgb(229 231 235)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)', marginBottom: '0.5rem' }}>
                                                    {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                                                </div>
                                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(31 41 55)' }}>
                                                    {new Date(subscription.start_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgb(229 231 235)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)', marginBottom: '0.5rem' }}>
                                                    {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                                </div>
                                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(31 41 55)' }}>
                                                    {new Date(subscription.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgb(249 250 251)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgb(229 231 235)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'rgb(107 114 128)', marginBottom: '0.5rem' }}>
                                                    {t('totalAmount')}
                                                </div>
                                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgb(79 70 229)' }}>
                                                    {subscription.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                    {/* Action Button */}
                                    <Link to={`/subscriptions/${subscription.id}`} style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease'
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

