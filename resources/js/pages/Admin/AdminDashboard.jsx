import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
    const { t, dir, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSellers: 0,
        totalRestaurants: 0,
        totalMeals: 0,
        totalSubscriptions: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch admin dashboard data
            const dashboardResponse = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                const data = dashboardData.data || {};
                
                setStats({
                    totalUsers: data.totalUsers || 0,
                    totalSellers: data.totalSellers || 0,
                    totalRestaurants: data.totalRestaurants || 0,
                    totalMeals: data.totalMeals || 0,
                    totalSubscriptions: data.totalSubscriptions || 0,
                    totalRevenue: data.totalRevenue || 0
                });

                setRecentActivity(data.recentActivity || []);
            }
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: '👥',
            titleAr: 'إجمالي المستخدمين',
            titleEn: 'Total Users',
            value: stats.totalUsers,
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            icon: '🏪',
            titleAr: 'إجمالي البائعين',
            titleEn: 'Total Sellers',
            value: stats.totalSellers,
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            icon: '🍽️',
            titleAr: 'إجمالي المطاعم',
            titleEn: 'Total Restaurants',
            value: stats.totalRestaurants,
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            icon: '🍴',
            titleAr: 'إجمالي الوجبات',
            titleEn: 'Total Meals',
            value: stats.totalMeals,
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        },
        {
            icon: '📋',
            titleAr: 'إجمالي الاشتراكات',
            titleEn: 'Total Subscriptions',
            value: stats.totalSubscriptions,
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        },
        {
            icon: '💰',
            titleAr: 'إجمالي الإيرادات',
            titleEn: 'Total Revenue',
            value: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'OMR'
            }).format(stats.totalRevenue),
            color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        }
    ];

    const quickActions = [
        {
            icon: '👥',
            titleAr: 'إدارة المستخدمين',
            titleEn: 'Manage Users',
            descriptionAr: 'إدارة جميع المستخدمين في النظام',
            descriptionEn: 'Manage all users in the system',
            action: () => navigate('/admin/users')
        },
        {
            icon: '🏪',
            titleAr: 'إدارة المطاعم',
            titleEn: 'Manage Restaurants',
            descriptionAr: 'إدارة جميع المطاعم في النظام',
            descriptionEn: 'Manage all restaurants in the system',
            action: () => navigate('/admin/restaurants')
        },
        {
            icon: '📊',
            titleAr: 'التقارير والإحصائيات',
            titleEn: 'Reports & Analytics',
            descriptionAr: 'عرض التقارير والإحصائيات الشاملة',
            descriptionEn: 'View comprehensive reports and analytics',
            action: () => navigate('/admin/reports')
        },
        {
            icon: '📋',
            titleAr: 'أنواع الاشتراكات',
            titleEn: 'Subscription Types',
            descriptionAr: 'إدارة أنواع الاشتراكات والأسعار',
            descriptionEn: 'Manage subscription types and prices',
            action: () => navigate('/admin/subscription-types')
        },
        {
            icon: '📞',
            titleAr: 'معلومات التواصل',
            titleEn: 'Contact Information',
            descriptionAr: 'إدارة معلومات التواصل مع العملاء',
            descriptionEn: 'Manage contact information with customers',
            action: () => navigate('/admin/contact-information')
        },
        {
            icon: '⚙️',
            titleAr: 'إعدادات النظام',
            titleEn: 'System Settings',
            descriptionAr: 'إدارة إعدادات النظام العامة',
            descriptionEn: 'Manage general system settings',
            action: () => navigate('/admin/settings')
        }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        marginBottom: '1rem'
                    }}>
                        ⏳
                    </div>
                    <div style={{
                        color: 'rgb(107 114 128)',
                        fontSize: '1rem'
                    }}>
                        {t('loading')}...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            direction: dir
        }}>
            {/* Welcome Section */}
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
                        👑
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'مرحباً بك في لوحة تحكم الأدمن' : 'Welcome to Admin Dashboard'} {user?.full_name || user?.name || (language === 'ar' ? 'الأدمن' : 'Admin')}!
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'مرحباً بك في لوحة تحكم الأدمن. هنا يمكنك إدارة النظام بالكامل ومتابعة جميع الأنشطة.'
                                : 'Welcome to your admin dashboard. Here you can manage the entire system and monitor all activities.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: card.color,
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                {card.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(55 65 81)',
                                    lineHeight: 1
                                }}>
                                    {card.value}
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(107 114 128)',
                                    marginTop: '0.25rem'
                                }}>
                                    {language === 'ar' ? card.titleAr : card.titleEn}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'rgb(55 65 81)',
                    margin: 0,
                    marginBottom: '1.5rem',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
                }}>
                    {language === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
                </h2>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                }}>
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.action}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.5rem',
                                background: 'rgba(79, 70, 229, 0.05)',
                                border: '1px solid rgba(79, 70, 229, 0.1)',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: dir === 'rtl' ? 'right' : 'left',
                                width: '100%',
                                direction: dir
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(79, 70, 229, 0.1)';
                                e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(79, 70, 229, 0.05)';
                                e.target.style.borderColor = 'rgba(79, 70, 229, 0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                color: 'white',
                                order: dir === 'rtl' ? 2 : 1
                            }}>
                                {action.icon}
                            </div>
                            <div style={{
                                order: dir === 'rtl' ? 1 : 2,
                                flex: 1
                            }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {language === 'ar' ? action.titleAr : action.titleEn}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? action.descriptionAr : action.descriptionEn}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
