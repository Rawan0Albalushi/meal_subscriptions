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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'نشط':
                return 'rgb(34 197 94)';
            case 'completed':
            case 'مكتمل':
                return 'rgb(59 130 246)';
            case 'cancelled':
            case 'ملغي':
                return 'rgb(239 68 68)';
            case 'pending':
            case 'في الانتظار':
                return 'rgb(245 158 11)';
            default:
                return 'rgb(107 114 128)';
        }
    };

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
                
                {/* Period Summary Table */}
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
                    
                    {/* Summary Table */}
                    <div style={{
                        overflowX: 'auto',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.9)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem'
                        }}>
                            <thead>
                                <tr style={{
                                    background: 'rgba(79, 70, 229, 0.1)',
                                    borderBottom: '2px solid rgba(79, 70, 229, 0.2)'
                                }}>
                                    <th style={{
                                        padding: '1rem',
                            textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'المؤشر' : 'Metric'}
                                    </th>
                                    <th style={{
                            padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'القيمة' : 'Value'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)'
                                    }}>
                                        {language === 'ar' ? 'النسبة المئوية' : 'Percentage'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: 'rgb(17 24 39)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الإيرادات' : 'Revenue'}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                fontWeight: '700',
                                color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                {formatCurrency(reports.revenue[selectedPeriod] || 0)}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                            textAlign: 'center',
                                        color: 'rgb(34 197 94)',
                                        fontWeight: '500'
                                    }}>
                                        +12%
                                    </td>
                                </tr>
                                <tr style={{
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <td style={{
                            padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: 'rgb(17 24 39)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الطلبات' : 'Orders'}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                fontWeight: '700',
                                color: 'rgb(239 68 68)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                {reports.orders[selectedPeriod] || 0}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                            textAlign: 'center',
                                        color: 'rgb(34 197 94)',
                                        fontWeight: '500'
                                    }}>
                                        +8%
                                    </td>
                                </tr>
                                <tr style={{
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <td style={{
                            padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: 'rgb(17 24 39)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                fontWeight: '700',
                                color: 'rgb(34 197 94)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                {reports.subscriptions.active}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                            textAlign: 'center',
                                        color: 'rgb(34 197 94)',
                                        fontWeight: '500'
                                    }}>
                                        +5%
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{
                            padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '500',
                                        color: 'rgb(17 24 39)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                 fontWeight: '700',
                                 color: 'rgb(245 158 11)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                             }}>
                                 {reports.subscriptions.total}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        color: 'rgb(34 197 94)',
                                        fontWeight: '500'
                                    }}>
                                        +3%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                                </div>
                            </div>
                        </div>
                        
            {/* Subscription Orders Table */}
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
                    
                {recentSubscriptions.length > 0 ? (
                    <div style={{
                        overflowX: 'auto',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.9)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem'
                        }}>
                            <thead>
                                <tr style={{
                                    background: 'rgba(79, 70, 229, 0.1)',
                                    borderBottom: '2px solid rgba(79, 70, 229, 0.2)'
                                }}>
                                    <th style={{
                                padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        #
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'اسم العميل' : 'Customer Name'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'المطعم' : 'Restaurant'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'المبلغ' : 'Amount'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الحالة' : 'Status'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(79 70 229)'
                                    }}>
                                        {language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSubscriptions.map((subscription, index) => (
                                    <tr key={index} style={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                        e.target.parentElement.style.background = 'rgba(79, 70, 229, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                        e.target.parentElement.style.background = 'transparent';
                                    }}>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '500',
                                            color: 'rgb(17 24 39)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {index + 1}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(17 24 39)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {subscription.customer_name}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                        color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {subscription.customer_phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {subscription.restaurant_name}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {subscription.subscription_type}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                        fontWeight: '600',
                                            color: 'rgb(79 70 229)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                                                                 {formatCurrency(subscription.total_amount)}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                         fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: `${getStatusColor(subscription.status)}20`,
                                                color: getStatusColor(subscription.status)
                                            }}>
                                                {subscription.status}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {formatDate(subscription.start_date)}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                         color: 'rgb(107 114 128)'
                                     }}>
                                            {formatDate(subscription.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                                     </div>
                ) : (
                                                         <div style={{
                                 textAlign: 'center',
                                 padding: '2rem',
                        color: 'rgb(107 114 128)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                             }}>
                                 {language === 'ar' ? 'لا توجد طلبات اشتراكات' : 'No subscription orders'}
                             </div>
                        )}
                </div>

            {/* Top Subscription Types Table */}
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
                    
                {topSubscriptionTypes.length > 0 ? (
                    <div style={{
                        overflowX: 'auto',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.9)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem'
                        }}>
                            <thead>
                                <tr style={{
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderBottom: '2px solid rgba(34, 197, 94, 0.2)'
                                }}>
                                    <th style={{
                                padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(34 197 94)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        #
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(34 197 94)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'اسم نوع الاشتراك' : 'Subscription Type Name'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(34 197 94)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'المطعم' : 'Restaurant'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(34 197 94)',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'عدد الاشتراكات' : 'Subscription Count'}
                                    </th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(34 197 94)'
                                    }}>
                                        {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSubscriptionTypes.map((subscriptionType, index) => (
                                    <tr key={index} style={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                        e.target.parentElement.style.background = 'rgba(34, 197, 94, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                        e.target.parentElement.style.background = 'transparent';
                                    }}>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                    fontWeight: '600',
                                            color: 'rgb(34 197 94)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                }}>
                                    #{index + 1}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(17 24 39)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                                                                 {subscriptionType.name}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                                                                 {subscriptionType.restaurant_name}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: 'rgb(34 197 94)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {subscriptionType.subscription_count} {language === 'ar' ? 'اشتراك' : 'subscriptions'}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                         fontWeight: '600',
                                         color: 'rgb(34 197 94)'
                                    }}>
                                                                                 {formatCurrency(subscriptionType.total_revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                                    </div>
                ) : (
                                                         <div style={{
                                 textAlign: 'center',
                                 padding: '2rem',
                        color: 'rgb(107 114 128)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                             }}>
                                 {language === 'ar' ? 'لا توجد أنواع اشتراكات' : 'No subscription types'}
                             </div>
                        )}
            </div>
        </div>
    );
};

export default SellerReports;
