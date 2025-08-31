import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const SellerReports = () => {
    const { t, dir, language } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState({
        revenue: {
            total: 0,
            thisMonth: 0,
            thisWeek: 0,
            today: 0
        },
        subscriptions: {
            total: 0,
            active: 0,
            completed: 0,
            cancelled: 0
        },
        orders: {
            total: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0
        },
        restaurants: {
            total: 0,
            active: 0
        },
        meals: {
            total: 0,
            available: 0
        }
    });
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    const [restaurants, setRestaurants] = useState([]);
    const [recentSubscriptions, setRecentSubscriptions] = useState([]);
    const [topSubscriptionTypes, setTopSubscriptionTypes] = useState([]);

    useEffect(() => {
        fetchReportsData();
        fetchRestaurants();
    }, [selectedPeriod, selectedRestaurant]);

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
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            
            // Fetch reports data for the selected period and restaurant
            const params = new URLSearchParams({
                period: selectedPeriod,
                restaurant_id: selectedRestaurant
            });
            
            const response = await fetch(`/api/seller/reports?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports || {});
                setRecentSubscriptions(data.recentOrders || []);
                setTopSubscriptionTypes(data.topMeals || []);
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-OM', {
            style: 'currency',
            currency: 'OMR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 'today': return language === 'ar' ? 'اليوم' : 'Today';
            case 'week': return language === 'ar' ? 'هذا الأسبوع' : 'This Week';
            case 'month': return language === 'ar' ? 'هذا الشهر' : 'This Month';
            case 'year': return language === 'ar' ? 'هذا العام' : 'This Year';
            default: return language === 'ar' ? 'هذا الشهر' : 'This Month';
        }
    };

    const statCards = [
        {
            icon: '💰',
            titleAr: 'إجمالي الإيرادات',
            titleEn: 'Total Revenue',
            value: formatCurrency(reports.revenue.total),
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            change: '+12%',
            changeType: 'positive'
        },
                 {
             icon: '📦',
             titleAr: 'الاشتراكات النشطة',
             titleEn: 'Active Subscriptions',
             value: reports.orders.total,
             color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
             change: '+8%',
             changeType: 'positive'
         },
                 {
             icon: '🍽️',
             titleAr: 'إجمالي الاشتراكات',
             titleEn: 'Total Subscriptions',
             value: reports.subscriptions.total,
             color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
             change: '+5%',
             changeType: 'positive'
         },
        {
            icon: '🏪',
            titleAr: 'المطاعم النشطة',
            titleEn: 'Active Restaurants',
            value: reports.restaurants.active,
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            change: '+2%',
            changeType: 'positive'
        }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    fontSize: '1.125rem',
                    color: 'rgb(79 70 229)',
                    fontWeight: '600'
                }}>
                    {language === 'ar' ? 'جاري تحميل التقارير...' : 'Loading reports...'}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'transparent',
            direction: dir
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'rgb(17 24 39)',
                            margin: '0 0 0.5rem 0',
                            textAlign: 'center'
                        }}>
                            {language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgb(107 114 128)',
                            margin: '0',
                            textAlign: 'center'
                        }}>
                            {language === 'ar' ? 'عرض وتحليل أداء مطاعمك وطلبات العملاء' : 'View and analyze your restaurants performance and customer orders'}
                        </p>
                    </div>
                    
                    {/* Filters */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        {/* Period Filter */}
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'rgb(55 65 81)',
                                cursor: 'pointer',
                                minWidth: '120px'
                            }}
                        >
                            <option value="today">{language === 'ar' ? 'اليوم' : 'Today'}</option>
                            <option value="week">{language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
                            <option value="month">{language === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
                            <option value="year">{language === 'ar' ? 'هذا العام' : 'This Year'}</option>
                        </select>
                        
                        {/* Restaurant Filter */}
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'rgb(55 65 81)',
                                cursor: 'pointer',
                                minWidth: '150px'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع المطاعم' : 'All Restaurants'}</option>
                            {restaurants.map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {restaurant.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Period Summary */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(79, 70, 229, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'rgba(79, 70, 229, 0.1)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            📊
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: 'rgb(79 70 229)',
                                margin: '0 0 0.25rem 0'
                            }}>
                                {getPeriodLabel()}
                            </h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'rgb(107 114 128)',
                                margin: '0'
                            }}>
                                {language === 'ar' ? 'ملخص الأداء للفترة المحددة' : 'Performance summary for the selected period'}
                            </p>
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'rgb(79 70 229)',
                                marginBottom: '0.5rem'
                            }}>
                                {formatCurrency(reports.revenue[selectedPeriod] || 0)}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'rgb(107 114 128)'
                            }}>
                                {language === 'ar' ? 'الإيرادات' : 'Revenue'}
                            </div>
                        </div>
                        
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'rgb(239 68 68)',
                                marginBottom: '0.5rem'
                            }}>
                                {reports.orders[selectedPeriod] || 0}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'rgb(107 114 128)'
                            }}>
                                {language === 'ar' ? 'الطلبات' : 'Orders'}
                            </div>
                        </div>
                        
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'rgb(34 197 94)',
                                marginBottom: '0.5rem'
                            }}>
                                {reports.subscriptions.active}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'rgb(107 114 128)'
                            }}>
                                {language === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
                            </div>
                        </div>
                        
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                                                         <div style={{
                                 fontSize: '1.5rem',
                                 fontWeight: '700',
                                 color: 'rgb(245 158 11)',
                                 marginBottom: '0.5rem'
                             }}>
                                 {reports.subscriptions.total}
                             </div>
                             <div style={{
                                 fontSize: '0.875rem',
                                 color: 'rgb(107 114 128)'
                             }}>
                                 {language === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((card, index) => (
                    <div key={index} style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1.25rem',
                        padding: '1.5rem',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: card.color
                        }}></div>
                        
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
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: 'rgb(17 24 39)',
                                    margin: '0 0 0.25rem 0'
                                }}>
                                    {language === 'ar' ? card.titleAr : card.titleEn}
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: card.changeType === 'positive' ? 'rgb(34 197 94)' : 'rgb(239 68 68)',
                                        fontWeight: '500'
                                    }}>
                                        {card.change}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'rgb(107 114 128)'
                                    }}>
                                        {language === 'ar' ? 'من الشهر الماضي' : 'from last month'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'rgb(17 24 39)',
                            marginBottom: '0.5rem'
                        }}>
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders and Top Meals */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '2rem'
            }}>
                {/* Recent Orders */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'rgba(79, 70, 229, 0.1)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            📋
                        </div>
                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                             <h3 style={{
                                 fontSize: '1.25rem',
                                 fontWeight: '600',
                                 color: 'rgb(17 24 39)',
                                 margin: '0'
                             }}>
                                 {language === 'ar' ? 'جميع طلبات الاشتراكات' : 'All Subscription Orders'}
                             </h3>
                             <span style={{
                                 padding: '0.25rem 0.75rem',
                                 borderRadius: '9999px',
                                 fontSize: '0.875rem',
                                 fontWeight: '500',
                                 background: 'rgba(79, 70, 229, 0.1)',
                                 color: 'rgb(79 70 229)'
                             }}>
                                                                   {recentSubscriptions.length} {language === 'ar' ? 'اشتراك' : 'subscriptions'}
                             </span>
                         </div>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        paddingRight: '0.5rem'
                    }}>
                                                 {recentSubscriptions.length > 0 ? recentSubscriptions.map((subscription, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(79, 70, 229, 0.05)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)';
                                e.target.style.transform = 'translateY(0)';
                            }}>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    background: 'rgba(79, 70, 229, 0.1)',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem'
                                }}>
                                    🍽️
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgb(17 24 39)',
                                        marginBottom: '0.25rem'
                                    }}>
                                                                                 {subscription.customer_name}
                                    </div>
                                                                         <div style={{
                                         fontSize: '0.75rem',
                                         color: 'rgb(107 114 128)'
                                     }}>
                                         {subscription.restaurant_name} • {subscription.subscription_type} • {formatDate(subscription.created_at)}
                                     </div>
                                </div>
                                <div style={{
                                    textAlign: 'right'
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)'
                                    }}>
                                                                                 {formatCurrency(subscription.total_amount)}
                                    </div>
                                                                         <div style={{
                                         fontSize: '0.75rem',
                                         color: 'rgb(107 114 128)'
                                     }}>
                                         {subscription.status} • {formatDate(subscription.start_date)}
                                     </div>
                                </div>
                            </div>
                        )) : (
                                                         <div style={{
                                 textAlign: 'center',
                                 padding: '2rem',
                                 color: 'rgb(107 114 128)'
                             }}>
                                 {language === 'ar' ? 'لا توجد طلبات اشتراكات' : 'No subscription orders'}
                             </div>
                        )}
                    </div>
                </div>

                {/* Top Meals */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🏆
                        </div>
                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                             <h3 style={{
                                 fontSize: '1.25rem',
                                 fontWeight: '600',
                                 color: 'rgb(17 24 39)',
                                 margin: '0'
                             }}>
                                 {language === 'ar' ? 'أفضل أنواع الاشتراكات' : 'Top Subscription Types'}
                             </h3>
                             <span style={{
                                 padding: '0.25rem 0.75rem',
                                 borderRadius: '9999px',
                                 fontSize: '0.875rem',
                                 fontWeight: '500',
                                 background: 'rgba(34, 197, 94, 0.1)',
                                 color: 'rgb(34 197 94)'
                             }}>
                                 {topSubscriptionTypes.length} {language === 'ar' ? 'نوع اشتراك' : 'subscription types'}
                             </span>
                         </div>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        maxHeight: '600px',
                        overflowY: 'auto',
                        paddingRight: '0.5rem'
                    }}>
                                                 {topSubscriptionTypes.length > 0 ? topSubscriptionTypes.map((subscriptionType, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(34, 197, 94, 0.05)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)';
                                e.target.style.transform = 'translateY(0)';
                            }}>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'rgb(34 197 94)'
                                }}>
                                    #{index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgb(17 24 39)',
                                        marginBottom: '0.25rem'
                                    }}>
                                                                                 {subscriptionType.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'rgb(107 114 128)'
                                    }}>
                                                                                 {subscriptionType.restaurant_name}
                                    </div>
                                </div>
                                <div style={{
                                    textAlign: 'right'
                                }}>
                                                                         <div style={{
                                         fontSize: '0.875rem',
                                         fontWeight: '600',
                                         color: 'rgb(34 197 94)'
                                     }}>
                                         {subscriptionType.subscription_count} {language === 'ar' ? 'اشتراك' : 'subscriptions'}
                                     </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'rgb(107 114 128)'
                                    }}>
                                                                                 {formatCurrency(subscriptionType.total_revenue)}
                                    </div>
                                </div>
                            </div>
                        )) : (
                                                         <div style={{
                                 textAlign: 'center',
                                 padding: '2rem',
                                 color: 'rgb(107 114 128)'
                             }}>
                                 {language === 'ar' ? 'لا توجد أنواع اشتراكات' : 'No subscription types'}
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerReports;
