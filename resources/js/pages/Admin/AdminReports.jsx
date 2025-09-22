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
    const [recentSubscriptions, setRecentSubscriptions] = useState([]);
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

    // Fetch recent subscriptions to mirror seller reports table
    useEffect(() => {
        fetchRecentSubscriptions();
    }, [selectedPeriod]);

    const fetchRecentSubscriptions = async () => {
        try {
            const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRecentSubscriptions(data.data?.recentSubscriptions || []);
            }
        } catch (error) {
            console.error('Error fetching recent subscriptions:', error);
            setRecentSubscriptions([]);
        }
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'OMR' }).format(num);
    };

    const getSubscriptionTypeText = (sub) => {
        try {
            if (!sub) return '-';
            if (typeof sub.subscription_type_text === 'string' && sub.subscription_type_text.trim()) {
                return sub.subscription_type_text;
            }
            const raw = sub.subscription_type;
            if (typeof raw === 'string') return raw;
            if (raw && typeof raw === 'object') {
                // Some APIs may hydrate relation as object
                if (language === 'ar') {
                    return raw.name_ar || raw.type || '-';
                }
                return raw.name_en || raw.type || '-';
            }
            if (sub.subscriptionType && typeof sub.subscriptionType === 'object') {
                return language === 'ar' ? (sub.subscriptionType.name_ar || sub.subscriptionType.type || '-') : (sub.subscriptionType.name_en || sub.subscriptionType.type || '-');
            }
            return '-';
        } catch (e) {
            return '-';
        }
    };

    const getMealPrice = (sub) => {
        try {
            const total = parseFloat(sub?.total_amount || 0);
            const delivery = parseFloat(sub?.delivery_price || 0);
            let price = total - delivery;
            if (!isNaN(price) && price > 0) return price;
            // Fallbacks from relations
            const typeObj = sub?.subscriptionType || sub?.subscription_type;
            const direct = parseFloat((typeObj && typeObj.price) || sub?.subscription_type_price || 0);
            return isNaN(direct) ? 0 : direct;
        } catch { return 0; }
    };

    const getDeliveryPrice = (sub) => {
        const val = parseFloat(sub?.delivery_price || 0);
        return isNaN(val) ? 0 : val;
    };

    const formatDateTime = (value) => {
        try {
            const raw = value || '';
            if (!raw) return '-';
            const d = new Date(raw);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleString();
        } catch {
            return '-';
        }
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
        const formatDatePretty = (val) => {
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
            language === 'ar' ? 'المطعم' : 'Restaurant',
            language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type',
            language === 'ar' ? 'السعر الإجمالي (بالريال)' : 'Total Amount (OMR)',
            language === 'ar' ? 'سعر الاشتراك (بالريال)' : 'Subscription Price (OMR)',
            language === 'ar' ? 'سعر التوصيل (بالريال)' : 'Delivery Price (OMR)',
            language === 'ar' ? 'نسبة مكسب الإدارة (%)' : 'Admin Commission (%)',
            language === 'ar' ? 'مبلغ مكسب الإدارة (بالريال)' : 'Admin Commission Amount (OMR)',
            language === 'ar' ? 'مستحقات التاجر (بالريال)' : 'Merchant Amount (OMR)',
            language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'
        ];
        const rows = [headers, ...recentSubscriptions.map((sub, idx) => [
            sub.id ?? idx + 1,
            sub.user?.name || '',
            sub.restaurant?.name_ar || sub.restaurant?.name_en || '',
            getSubscriptionTypeText(sub),
            formatCurrencyText(sub.total_amount || 0),
            formatCurrencyText(sub.subscription_price || 0),
            formatDeliveryText(sub.delivery_price || 0),
            sub.admin_commission_percentage ? `${sub.admin_commission_percentage}%` : '-',
            formatCurrencyText(sub.admin_commission_amount || 0),
            formatCurrencyText(sub.merchant_amount || 0),
            formatDatePretty(sub.created_at)
        ])];
        downloadExcelHTML(`admin_subscriptions_${new Date().toISOString().slice(0,10)}.xls`, rows);
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
            {/* Revenue */}
            <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>💰</div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(55 65 81)', lineHeight: 1 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'OMR' }).format(reports.revenueStats?.periodRevenue || 0)}</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)', marginTop: '0.25rem' }}>{language === 'ar' ? 'إيرادات الفترة' : 'Period Revenue'}</div>
                    </div>
                </div>
            </div>

            {/* Orders (use newSubscriptions as proxy for orders) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>📦</div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(55 65 81)', lineHeight: 1 }}>{reports.subscriptionStats?.newSubscriptions || 0}</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)', marginTop: '0.25rem' }}>{language === 'ar' ? 'طلبات الفترة' : 'Orders (period)'}</div>
                    </div>
                </div>
            </div>

            {/* Total Subscriptions */}
            <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>📊</div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(55 65 81)', lineHeight: 1 }}>{reports.subscriptionStats?.totalSubscriptions || 0}</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)', marginTop: '0.25rem' }}>{language === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}</div>
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
            background: 'transparent',
            direction: dir
        }}>
            {/* Header (aligned with seller reports styling) */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                    alignItems: 'center',
                        gap: '1rem'
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
                        }}>📊</div>
                    <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #2f6e73, #b65449)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        margin: 0
                    }}>
                            {language === 'ar' ? 'تقارير النظام' : 'System Reports'}
                    </h1>
                    </div>
                    
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '0.75rem',
                            fontSize: '0.9rem',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            minWidth: '160px',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
                        }}
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {language === 'ar' ? option.labelAr : option.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Report Type Selector removed (show key stats only) */}
            </div>

            {/* Key Stats only */}
            {renderOverviewReport()}

            {/* Recent Subscriptions (mirror seller reports table) */}
                <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                marginTop: '2rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'rgba(47, 110, 115, 0.12)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            color: '#2f6e73'
                        }}>📋</div>
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
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#2f6e73', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'رقم الاشتراك' : 'ID'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'اسم العميل' : 'Customer Name'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'المطعم' : 'Restaurant'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'السعر الإجمالي' : 'Total Amount'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'سعر الاشتراك' : 'Subscription Price'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'نسبة مكسب الإدارة' : 'Admin Commission %'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{language === 'ar' ? 'مبلغ مكسب الإدارة' : 'Admin Commission Amount'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)' }}>{language === 'ar' ? 'مستحقات التاجر' : 'Merchant Amount'}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(79 70 229)' }}>{language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSubscriptions.map((sub, index) => (
                                <tr key={sub.id || index} style={{
                                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '500', color: 'rgb(17 24 39)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{sub.id}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'rgb(17 24 39)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{sub.user?.name || '-'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgb(107 114 128)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{sub.restaurant?.name_ar || sub.restaurant?.name_en || '-'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgb(107 114 128)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{getSubscriptionTypeText(sub)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: '#2f6e73', fontWeight: '600', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{formatCurrency(sub.total_amount || 0)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgb(107 114 128)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{formatCurrency(sub.subscription_price || 0)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: parseFloat(sub.delivery_price || 0) > 0 ? '#f59e0b' : '#10b981', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{parseFloat(sub.delivery_price || 0) > 0 ? formatCurrency(sub.delivery_price || 0) : (language === 'ar' ? 'مجاني' : 'Free')}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: sub.admin_commission_percentage ? '#2f6e73' : 'rgb(107 114 128)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{sub.admin_commission_percentage ? `${sub.admin_commission_percentage}%` : (language === 'ar' ? 'غير محدد' : 'Not Set')}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: sub.admin_commission_amount > 0 ? '#2f6e73' : 'rgb(107 114 128)', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>{formatCurrency(sub.admin_commission_amount || 0)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgb(107 114 128)' }}>{formatCurrency(sub.merchant_amount || 0)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'rgb(107 114 128)' }}>{formatDateTime(sub.created_at)}</td>
                                </tr>
                            ))}
                            {recentSubscriptions.length === 0 && (
                                <tr>
                                    <td colSpan="11" style={{ padding: '1rem', textAlign: 'center', color: 'rgb(107 114 128)' }}>
                                        {language === 'ar' ? 'لا توجد بيانات' : 'No data'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                                    </div>
                                </div>
        </div>
    );
};

export default AdminReports;
