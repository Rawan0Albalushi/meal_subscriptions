import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminReports = () => {
    const { t, dir, language } = useLanguage();
    const [reports, setReports] = useState({
        userStats: {},
        restaurantStats: {},
        subscriptionStats: {},
        revenueStats: {},
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('30days');
    const [selectedReport, setSelectedReport] = useState('overview');

    useEffect(() => {
        fetchReports();
    }, [selectedPeriod]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setReports(data.data || {});
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        {
            id: 'overview',
            icon: '📊',
            titleAr: 'نظرة عامة',
            titleEn: 'Overview',
            descriptionAr: 'إحصائيات شاملة للنظام',
            descriptionEn: 'Comprehensive system statistics'
        },
        {
            id: 'users',
            icon: '👥',
            titleAr: 'المستخدمين',
            titleEn: 'Users',
            descriptionAr: 'إحصائيات المستخدمين والتسجيلات',
            descriptionEn: 'User statistics and registrations'
        },
        {
            id: 'restaurants',
            icon: '🍽️',
            titleAr: 'المطاعم',
            titleEn: 'Restaurants',
            descriptionAr: 'إحصائيات المطاعم والوجبات',
            descriptionEn: 'Restaurant and meal statistics'
        },
        {
            id: 'subscriptions',
            icon: '📋',
            titleAr: 'الاشتراكات',
            titleEn: 'Subscriptions',
            descriptionAr: 'إحصائيات الاشتراكات والطلبات',
            descriptionEn: 'Subscription and order statistics'
        },
        {
            id: 'revenue',
            icon: '💰',
            titleAr: 'الإيرادات',
            titleEn: 'Revenue',
            descriptionAr: 'إحصائيات الإيرادات والمدفوعات',
            descriptionEn: 'Revenue and payment statistics'
        }
    ];

    const periodOptions = [
        { value: '7days', labelAr: 'آخر 7 أيام', labelEn: 'Last 7 Days' },
        { value: '30days', labelAr: 'آخر 30 يوم', labelEn: 'Last 30 Days' },
        { value: '90days', labelAr: 'آخر 90 يوم', labelEn: 'Last 90 Days' },
        { value: '1year', labelAr: 'آخر سنة', labelEn: 'Last Year' }
    ];

    const renderOverviewReport = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
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
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        👥
                    </div>
                    <div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            lineHeight: 1
                        }}>
                            {reports.userStats?.totalUsers || 0}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'rgb(107 114 128)',
                            marginTop: '0.25rem'
                        }}>
                            {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
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
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        🍽️
                    </div>
                    <div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            lineHeight: 1
                        }}>
                            {reports.restaurantStats?.totalRestaurants || 0}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'rgb(107 114 128)',
                            marginTop: '0.25rem'
                        }}>
                            {language === 'ar' ? 'إجمالي المطاعم' : 'Total Restaurants'}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
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
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        📋
                    </div>
                    <div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            lineHeight: 1
                        }}>
                            {reports.subscriptionStats?.totalSubscriptions || 0}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'rgb(107 114 128)',
                            marginTop: '0.25rem'
                        }}>
                            {language === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
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
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        💰
                    </div>
                    <div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            lineHeight: 1
                        }}>
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'OMR'
                            }).format(reports.revenueStats?.totalRevenue || 0)}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'rgb(107 114 128)',
                            marginTop: '0.25rem'
                        }}>
                            {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetailedReport = () => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'rgb(55 65 81)',
                margin: 0,
                marginBottom: '1.5rem',
                textAlign: dir === 'rtl' ? 'right' : 'left'
            }}>
                {language === 'ar' ? 'التقرير التفصيلي' : 'Detailed Report'}
            </h3>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                {Object.entries(reports[`${selectedReport}Stats`] || {}).map(([key, value]) => (
                    <div key={key} style={{
                        padding: '1rem',
                        background: 'rgba(79, 70, 229, 0.05)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(79, 70, 229, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'rgb(107 114 128)',
                            marginBottom: '0.25rem'
                        }}>
                            {key}
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)'
                        }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

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
            {/* Header */}
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0
                    }}>
                        {language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
                    </h1>
                    
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            minWidth: '150px'
                        }}
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {language === 'ar' ? option.labelAr : option.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Report Type Selector */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    {reportTypes.map((report) => (
                        <button
                            key={report.id}
                            onClick={() => setSelectedReport(report.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: selectedReport === report.id 
                                    ? 'rgba(79, 70, 229, 0.1)' 
                                    : 'rgba(255, 255, 255, 0.6)',
                                border: selectedReport === report.id 
                                    ? '2px solid rgba(79, 70, 229, 0.3)' 
                                    : '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: dir === 'rtl' ? 'right' : 'left',
                                direction: dir
                            }}
                            onMouseEnter={(e) => {
                                if (selectedReport !== report.id) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedReport !== report.id) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                                }
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
                                {report.icon}
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
                                    {language === 'ar' ? report.titleAr : report.titleEn}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? report.descriptionAr : report.descriptionEn}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Content */}
            {selectedReport === 'overview' ? renderOverviewReport() : renderDetailedReport()}

            {/* Recent Activity */}
            {reports.recentActivity && reports.recentActivity.length > 0 && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginTop: '2rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '1.5rem',
                        textAlign: dir === 'rtl' ? 'right' : 'left'
                    }}>
                        {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                    </h3>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {reports.recentActivity.map((activity, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'rgba(79, 70, 229, 0.05)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(79, 70, 229, 0.1)'
                            }}>
                                <div style={{
                                    width: '2rem',
                                    height: '2rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    color: 'white'
                                }}>
                                    📝
                                </div>
                                <div style={{
                                    flex: 1
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {activity.description}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'rgb(107 114 128)'
                                    }}>
                                        {new Date(activity.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
