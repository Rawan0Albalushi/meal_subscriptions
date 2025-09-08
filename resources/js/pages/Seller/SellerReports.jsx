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

    useEffect(() => {
        if (restaurants && restaurants.length >= 0) {
            fetchAllSubscriptionOrders();
        }
    }, [selectedRestaurant, restaurants]);

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
                // After restaurants load, fetch all subscription orders
                setTimeout(fetchAllSubscriptionOrders, 0);
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
                setTopSubscriptionTypes(data.topMeals || []);
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSubscriptionOrders = async () => {
        try {
            let aggregated = [];
            const token = localStorage.getItem('auth_token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            const fetchForRestaurant = async (restaurantId) => {
                const resp = await fetch(`/api/seller/restaurants/${restaurantId}/subscriptions`, { headers });
                if (!resp.ok) return [];
                const json = await resp.json();
                return Array.isArray(json.data) ? json.data : [];
            };

            if (selectedRestaurant === 'all') {
                const ids = (restaurants || []).map(r => r.id);
                const results = await Promise.all(ids.map(id => fetchForRestaurant(id)));
                aggregated = results.flat();
            } else if (selectedRestaurant) {
                aggregated = await fetchForRestaurant(selectedRestaurant);
            }

            // Sort by created_at desc
            aggregated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setRecentSubscriptions(aggregated);
        } catch (e) {
            console.error('Error fetching all subscription orders for seller:', e);
            setRecentSubscriptions([]);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
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

    const downloadCSV = (filename, rows) => {
        const delimiter = '\t';
        const content = rows
            .map(r => r.map(v => {
                if (v === null || v === undefined) return '';
                const s = String(v).replace(/"/g, '""');
                return /["\t\n]/.test(s) ? `"${s}"` : s;
            }).join(delimiter))
            .join('\r\n');
        let blob;
        try {
            // Prefer UTF-16LE which Excel handles reliably for Arabic
            // @ts-ignore
            const enc = new TextEncoder('utf-16le');
            const bom = new Uint8Array([0xFF, 0xFE]);
            const encoded = enc.encode(content);
            const buffer = new Uint8Array(bom.length + encoded.length);
            buffer.set(bom, 0);
            buffer.set(encoded, bom.length);
            blob = new Blob([buffer], { type: 'text/csv;charset=utf-16le;' });
        } catch (e) {
            blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadExcelHTML = (filename, rows) => {
        const htmlRows = rows.map((r, idx) => {
            const tag = idx === 0 ? 'th' : 'td';
            const tds = r.map(cell => `<${tag} style="border:1px solid #ddd;padding:6px;white-space:nowrap;">${String(cell).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</${tag}>`).join('');
            return `<tr>${tds}</tr>`;
        }).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Segoe UI,Arial,sans-serif;font-size:12pt} th{background:#f3f4f6;text-align:center} td{text-align:center}</style></head><body><table dir="${dir}">${htmlRows}</table></body></html>`;
        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/\.csv$/i, '.xls');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportExcel = () => {
        const currencyLabel = language === 'ar' ? 'ريال' : 'OMR';
        const formatCurrencyText = (n) => `${parseFloat(n || 0).toFixed(2)} ${currencyLabel}`;
        const formatDeliveryText = (n) => {
            const v = parseFloat(n || 0);
            if (v > 0) return `${v.toFixed(2)} ${currencyLabel}`;
            return language === 'ar' ? 'مجاني' : 'Free';
        };
        const formatDateTime = (val) => {
            const d = new Date(val);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        };
        const headers = [
            language === 'ar' ? 'رقم' : 'ID',
            language === 'ar' ? 'العميل' : 'Customer',
            language === 'ar' ? 'الهاتف' : 'Phone',
            language === 'ar' ? 'المطعم' : 'Restaurant',
            language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type',
            language === 'ar' ? 'سعر الوجبة (بالريال)' : 'Meal Price (OMR)',
            language === 'ar' ? 'سعر التوصيل (بالريال)' : 'Delivery Price (OMR)',
            language === 'ar' ? 'الإجمالي (بالريال)' : 'Total (OMR)',
            language === 'ar' ? 'تاريخ البدء' : 'Start Date',
            language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'
        ];
        const rows = [headers, ...recentSubscriptions.map((s) => [
            s.id || '',
            (s.user?.name || s.customer_name || ''),
            (s.deliveryAddress?.phone || s.delivery_address?.phone || s.customer_phone || ''),
            resolveRestaurantName(s),
            s.subscription_type || '',
            formatCurrencyText((s.total_amount || 0) - (s.delivery_price || 0)),
            formatDeliveryText(s.delivery_price || 0),
            formatCurrencyText(s.total_amount || 0),
            s.start_date ? formatDateTime(s.start_date) : '',
            s.created_at ? formatDateTime(s.created_at) : ''
        ])];
        downloadExcelHTML(`seller_subscriptions_${new Date().toISOString().slice(0,10)}.xls`, rows);
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

    const resolveRestaurantName = (subscription) => {
        const fromRel = subscription?.restaurant?.name_ar || subscription?.restaurant?.name_en || subscription?.restaurant?.name;
        if (fromRel) return fromRel;
        if (subscription?.restaurant_name) return subscription.restaurant_name;
        const found = (restaurants || []).find(r => r.id === subscription?.restaurant_id);
        return found?.name_ar || found?.name_en || found?.name || '-';
    };

    const getDisplayValue = (data, key) => {
        if (!data || typeof data !== 'object') return 0;
        const value = data[key];
        return value !== undefined && value !== null ? value : 0;
    };

    const getRevenueDisplay = () => {
        const currentValue = getDisplayValue(reports.revenue, selectedPeriod);
        return {
            value: currentValue
        };
    };

    const getOrdersDisplay = () => {
        const currentValue = getDisplayValue(reports.orders, selectedPeriod);
        return {
            value: currentValue
        };
    };

    const getTotalSubscriptionsDisplay = () => {
        const totalValue = getDisplayValue(reports.subscriptions, 'total');
        return {
            value: totalValue
        };
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
                    color: '#2f6e73',
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
            {/* Page Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, #2f6e73, #b65449)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        boxShadow: '0 8px 25px rgba(47, 110, 115, 0.3)'
                    }}>
                        📊
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #2f6e73, #b65449)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: '0',
                        textAlign: 'center'
                    }}>
                        {language === 'ar' ? 'تقارير المبيعات' : 'Sales Reports'}
                    </h1>
                </div>
                <p style={{
                    fontSize: '1rem',
                    color: 'rgb(107 114 128)',
                    margin: '0',
                    fontWeight: '500',
                    textAlign: 'center'
                }}>
                    {language === 'ar' 
                        ? 'مراقبة وتحليل أداء مبيعاتك وإحصائيات الاشتراكات' 
                        : 'Monitor and analyze your sales performance and subscription statistics'
                    }
                </p>
            </div>

            {/* Statistics Cards */}
            <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {/* Revenue Card */}
                    <div
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
                            gap: '1rem'
                    }}>
                        <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
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
                                    {formatCurrency(getRevenueDisplay().value)}
                                </div>
                                <div style={{
                                fontSize: '0.875rem',
                                color: 'rgb(107 114 128)',
                                    marginTop: '0.25rem'
                            }}>
                                    {language === 'ar' ? 'الإيرادات' : 'Revenue'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Orders Card */}
                    <div
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
                        gap: '1rem'
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
                                📦
                            </div>
                            <div>
                            <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(55 65 81)',
                                    lineHeight: 1
                                }}>
                                    {getOrdersDisplay().value}
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                    color: 'rgb(107 114 128)',
                                    marginTop: '0.25rem'
                            }}>
                                {language === 'ar' ? 'الطلبات' : 'Orders'}
                                </div>
                            </div>
                            </div>
                        </div>
                        
                    {/* Total Subscriptions Card */}
                    <div
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
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                📊
                            </div>
                            <div>
                            <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(55 65 81)',
                                    lineHeight: 1
                                }}>
                                    {getTotalSubscriptionsDisplay().value}
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
            </div>

                                {/* Filters */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    padding: '0 1.5rem'
                }}>
                    {/* Period Filter */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'rgb(55 65 81)',
                            textAlign: 'center'
                        }}>
                            {language === 'ar' ? 'الفترة الزمنية' : 'Time Period'}
                        </label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'rgb(55 65 81)',
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <option value="today">{language === 'ar' ? 'اليوم' : 'Today'}</option>
                            <option value="week">{language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
                            <option value="month">{language === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
                            <option value="year">{language === 'ar' ? 'هذا العام' : 'This Year'}</option>
                        </select>
                    </div>
                    
                    {/* Restaurant Filter */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'rgb(55 65 81)',
                            textAlign: 'center'
                        }}>
                            {language === 'ar' ? 'المطعم' : 'Restaurant'}
                        </label>
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'rgb(55 65 81)',
                                cursor: 'pointer',
                                width: '100%',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
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
                        justifyContent: 'space-between',
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
                                 {language === 'ar' ? 'جميع طلبات الاشتراك' : 'All Subscription Orders'}
                             </h3>
                             <span style={{
                                 padding: '0.25rem 0.75rem',
                                 borderRadius: '9999px',
                                 fontSize: '0.875rem',
                                 fontWeight: '500',
                                 background: 'rgba(47, 110, 115, 0.1)',
                                 color: '#2f6e73'
                             }}>
                                                                   {recentSubscriptions.length} {language === 'ar' ? 'اشتراك' : 'subscriptions'}
                             </span>
                        </div>
                        <div>
                            <button onClick={handleExportExcel} style={{
                                padding: '0.5rem 0.85rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(47, 110, 115, 0.3)',
                                background: 'rgba(47, 110, 115, 0.08)',
                                color: '#2f6e73',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}>
                                {language === 'ar' ? 'تصدير (Excel)' : 'Export (Excel)'}
                            </button>
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
                                    background: 'rgba(47, 110, 115, 0.1)',
                                    borderBottom: '2px solid rgba(47, 110, 115, 0.2)'
                                }}>
                                    <th style={{
                                padding: '1rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: '#2f6e73',
                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'رقم الاشتراك' : 'ID'}
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
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                        {language === 'ar' ? 'سعر الوجبة' : 'Meal Price'}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                        {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                        {language === 'ar' ? 'الإجمالي' : 'Total'}
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
                                            {subscription.id}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                         fontWeight: '600',
                                             color: 'rgb(17 24 39)',
                                             borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                     }}>
                                        {subscription.user?.name || subscription.customer_name || '-'}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                         color: 'rgb(107 114 128)',
                                             borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                         }}>
                                            {subscription.deliveryAddress?.phone || subscription.delivery_address?.phone || subscription.customer_phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {resolveRestaurantName(subscription)}
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
                                            color: '#2f6e73',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {formatCurrency((subscription.total_amount || 0) - (subscription.delivery_price || 0))}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: subscription.delivery_price > 0 ? '#f59e0b' : '#10b981',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {subscription.delivery_price > 0 ? formatCurrency(subscription.delivery_price) : (language === 'ar' ? 'مجاني' : 'Free')}
                                        </td>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            color: 'rgb(107 114 128)',
                                            borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {formatCurrency(subscription.total_amount || 0)}
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


        </div>
    );
};

export default SellerReports;
