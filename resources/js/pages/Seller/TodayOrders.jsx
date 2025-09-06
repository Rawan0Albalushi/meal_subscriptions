import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { sellerAPI } from '../../services/api';

const TodayOrders = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [groupedOrders, setGroupedOrders] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        preparing: 0,
        delivered: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [dateFormatted, setDateFormatted] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedOrders, setSelectedOrders] = useState([]);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);



    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchTodayOrders();
        }
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const response = await sellerAPI.getRestaurants();
            if (response.data.success) {
                setRestaurants(response.data.data);
                // Auto-select first restaurant if available
                if (response.data.data.length > 0) {
                    setSelectedRestaurant(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('فشل في تحميل المطاعم');
        }
    };

    const fetchTodayOrders = async () => {
        if (!selectedRestaurant) return;
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 جلب طلبات اليوم للمطعم:', selectedRestaurant);
            
            const response = await sellerAPI.getTodayOrders(selectedRestaurant);
            
            console.log('📊 استجابة طلبات اليوم:', response.data);
            
            if (response.data.success) {
                const { orders, grouped_orders, stats, date_formatted } = response.data.data;
                
                console.log('📋 تفاصيل الطلبات:', {
                    total_orders: orders.length,
                    stats: stats,
                    date_formatted: date_formatted,
                    grouped_orders: Object.keys(grouped_orders).map(key => ({
                        status: key,
                        count: grouped_orders[key].length
                    }))
                });
                
                setOrders(orders);
                setGroupedOrders(grouped_orders);
                setStats(stats);
                setDateFormatted(date_formatted);
                
                // إذا لم توجد طلبات، اعرض رسالة واضحة
                if (orders.length === 0) {
                    console.log('ℹ️ لا توجد طلبات لليوم الحالي');
                }
            } else {
                console.error('❌ فشل في جلب طلبات اليوم:', response.data);
                setError(response.data.message || 'فشل في تحميل طلبات اليوم');
            }
        } catch (error) {
            console.error('💥 خطأ في جلب طلبات اليوم:', error);
            setError('خطأ في تحميل طلبات اليوم');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            const order = orders.find(order => order.id === itemId);
            if (!order) {
                alert('لم يتم العثور على الطلب');
                return;
            }
            
            const response = await sellerAPI.updateItemStatus(
                selectedRestaurant,
                order.subscription_id,
                itemId,
                newStatus
            );
            
            if (response.data.success) {
                // Update local state
                setOrders(prev => prev.map(order => 
                    order.id === itemId ? { ...order, status: newStatus } : order
                ));
                
                // Refresh data
                fetchTodayOrders();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('فشل في تحديث حالة الطلب');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'from-yellow-500 to-orange-500';
            case 'preparing':
                return 'from-teal-500 to-teal-600';
            case 'delivered':
                return 'from-green-500 to-emerald-500';
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
            case 'preparing':
                return '👨‍🍳';
            case 'delivered':
                return '✅';
            case 'cancelled':
                return '❌';
            default:
                return '📋';
        }
    };

    const getStatusText = (status) => {
        const statuses = {
            pending: { ar: 'في الانتظار', en: 'Pending' },
            preparing: { ar: 'قيد التحضير', en: 'Preparing' },
            delivered: { ar: 'تم التوصيل', en: 'Delivered' },
            cancelled: { ar: 'ملغي', en: 'Cancelled' }
        };
        return statuses[status]?.[language] || status;
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            pending: 'preparing',
            preparing: 'delivered',
            delivered: 'delivered',
            cancelled: 'cancelled'
        };
        return statusFlow[currentStatus];
    };

    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            (order.subscription?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.subscription?.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.meal?.name_ar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.meal?.name_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.subscription?.delivery_address?.phone || '').includes(searchTerm);
        
        return matchesStatus && matchesSearch;
    });

    // Sort orders
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'customer':
                aValue = (a.subscription?.user?.name || a.subscription?.user?.full_name || '').toLowerCase();
                bValue = (b.subscription?.user?.name || b.subscription?.user?.full_name || '').toLowerCase();
                break;
            case 'meal':
                aValue = (language === 'ar' ? a.meal?.name_ar : a.meal?.name_en || '').toLowerCase();
                bValue = (language === 'ar' ? b.meal?.name_ar : b.meal?.name_en || '').toLowerCase();
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'delivery_time':
                aValue = a.meal?.delivery_time || '';
                bValue = b.meal?.delivery_time || '';
                break;
            default:
                aValue = a.id;
                bValue = b.id;
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    if (loading && !selectedRestaurant) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ color: 'rgb(107 114 128)', fontSize: '1rem' }}>
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                    <div style={{ color: 'rgb(239 68 68)', fontSize: '1rem' }}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            {/* Header Section */}
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
                        📋
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'طلبات اليوم' : 'Today\'s Orders'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {dateFormatted}
                        </p>
                    </div>
                </div>

                {/* Restaurant Selector and Refresh Button */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth <= 768 ? 'stretch' : 'flex-end',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    {restaurants.length > 0 && (
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'rgb(55 65 81)',
                                marginBottom: '0.5rem'
                            }}>
                                {language === 'ar' ? 'اختر المطعم:' : 'Select Restaurant:'}
                            </label>
                            <select
                                value={selectedRestaurant || ''}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    fontSize: '0.875rem',
                                    background: 'white',
                                    minWidth: '200px'
                                }}
                            >
                                {restaurants.map(restaurant => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button
                        onClick={fetchTodayOrders}
                        disabled={loading || !selectedRestaurant}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: loading || !selectedRestaurant ? 'not-allowed' : 'pointer',
                            opacity: loading || !selectedRestaurant ? 0.6 : 1,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading && selectedRestaurant) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <span>🔄</span>
                        <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.75rem',
                marginBottom: '2rem'
            }}>
                {Object.entries(stats).map(([key, value]) => (
                    <div
                        key={key}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textAlign: 'center',
                            minWidth: '0'
                        }}
                    >
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.25rem'
                        }}>
                            {value}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'rgb(107 114 128)',
                            textTransform: 'capitalize',
                            lineHeight: '1.2'
                        }}>
                            {key === 'total' 
                                ? (language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders')
                                : getStatusText(key)
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflowX: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        color: 'white'
                    }}>
                        📋
                    </div>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0
                    }}>
                        {language === 'ar' ? 'قائمة الطلبات' : 'Orders List'} ({sortedOrders.length}/{orders.length})
                    </h2>
                </div>

                {/* Search and Filter Controls */}
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    alignItems: window.innerWidth <= 768 ? 'stretch' : 'center'
                }}>
                    {/* Search Input */}
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث في الطلبات...' : 'Search orders...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                fontSize: '0.875rem',
                                background: 'white',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div style={{ minWidth: window.innerWidth <= 768 ? 'auto' : '200px' }}>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                fontSize: '0.875rem',
                                background: 'white'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                            <option value="pending">{getStatusText('pending')}</option>
                            <option value="preparing">{getStatusText('preparing')}</option>
                            <option value="delivered">{getStatusText('delivered')}</option>
                            <option value="cancelled">{getStatusText('cancelled')}</option>
                        </select>
                    </div>

                    {/* Selected Orders Counter */}
                    {selectedOrders.length > 0 && (
                        <div style={{
                            background: 'rgba(102, 126, 234, 0.1)',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            color: 'rgb(55 65 81)',
                            fontWeight: '600'
                        }}>
                            {language === 'ar' 
                                ? `${selectedOrders.length} طلب محدد`
                                : `${selectedOrders.length} orders selected`
                            }
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedOrders.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => {
                                    if (window.confirm(language === 'ar' 
                                        ? `هل تريد تغيير حالة ${selectedOrders.length} طلب إلى "قيد التحضير"؟`
                                        : `Do you want to change the status of ${selectedOrders.length} orders to "Preparing"?`
                                    )) {
                                        selectedOrders.forEach(orderId => {
                                            handleStatusUpdate(orderId, 'preparing');
                                        });
                                        setSelectedOrders([]);
                                    }
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                👨‍🍳 {language === 'ar' ? 'بدء التحضير' : 'Start Preparing'}
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm(language === 'ar' 
                                        ? `هل تريد تغيير حالة ${selectedOrders.length} طلب إلى "تم التوصيل"؟`
                                        : `Do you want to change the status of ${selectedOrders.length} orders to "Delivered"?`
                                    )) {
                                        selectedOrders.forEach(orderId => {
                                            handleStatusUpdate(orderId, 'delivered');
                                        });
                                        setSelectedOrders([]);
                                    }
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                ✅ {language === 'ar' ? 'تم التوصيل' : 'Mark Delivered'}
                            </button>
                        </div>
                    )}

                                                                                   {/* Export Buttons */}
                      <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                      }}>
                          {/* Excel Export Button */}
                         <button
                             onClick={() => {
                                 // إنشاء جدول HTML للتصدير إلى Excel
                                 const table = document.createElement('table');
                                 
                                 // إضافة رؤوس الجدول
                                 const thead = document.createElement('thead');
                                 const headerRow = document.createElement('tr');
                                 [
                                     language === 'ar' ? 'رقم الطلب' : 'Order ID',
                                     language === 'ar' ? 'العميل' : 'Customer',
                                     language === 'ar' ? 'رقم الهاتف' : 'Phone',
                                     language === 'ar' ? 'الوجبة' : 'Meal',
                                     language === 'ar' ? 'العنوان' : 'Address',
                                     language === 'ar' ? 'وقت التوصيل' : 'Delivery Time',
                                     language === 'ar' ? 'الحالة' : 'Status'
                                 ].forEach(header => {
                                     const th = document.createElement('th');
                                     th.textContent = header;
                                     headerRow.appendChild(th);
                                 });
                                 thead.appendChild(headerRow);
                                 table.appendChild(thead);
                                 
                                 // إضافة بيانات الجدول
                                 const tbody = document.createElement('tbody');
                                 sortedOrders.forEach(order => {
                                     const row = document.createElement('tr');
                                     [
                                         order.id,
                                         order.subscription?.user?.full_name || order.subscription?.user?.name || '',
                                         order.subscription?.delivery_address?.phone || '',
                                         language === 'ar' ? order.meal?.name_ar : order.meal?.name_en || '',
                                         order.subscription?.delivery_address?.address || '',
                                         order.meal?.delivery_time || '',
                                         getStatusText(order.status)
                                     ].forEach(cellData => {
                                         const td = document.createElement('td');
                                         td.textContent = cellData;
                                         row.appendChild(td);
                                     });
                                     tbody.appendChild(row);
                                 });
                                 table.appendChild(tbody);
                                 
                                 // تحويل الجدول إلى HTML
                                 const htmlContent = `
                                     <html>
                                         <head>
                                             <meta charset="utf-8">
                                             <style>
                                                 table { border-collapse: collapse; width: 100%; }
                                                 th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                                 th { background-color: #f2f2f2; font-weight: bold; }
                                                 tr:nth-child(even) { background-color: #f9f9f9; }
                                             </style>
                                         </head>
                                         <body>
                                             ${table.outerHTML}
                                         </body>
                                     </html>
                                 `;
                                 
                                 const blob = new Blob([htmlContent], { 
                                     type: 'application/vnd.ms-excel;charset=utf-8' 
                                 });
                                 const link = document.createElement('a');
                                 const url = URL.createObjectURL(blob);
                                 link.setAttribute('href', url);
                                 link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.xls`);
                                 link.style.visibility = 'hidden';
                                 document.body.appendChild(link);
                                 link.click();
                                 document.body.removeChild(link);
                                 
                                 // تنظيف الذاكرة
                                 URL.revokeObjectURL(url);
                             }}
                             style={{
                                 padding: '0.75rem 1rem',
                                 background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                 color: 'white',
                                 border: 'none',
                                 borderRadius: '0.5rem',
                                 fontSize: '0.875rem',
                                 fontWeight: '600',
                                 cursor: 'pointer',
                                 transition: 'all 0.2s',
                                 whiteSpace: 'nowrap'
                             }}
                             onMouseEnter={(e) => {
                                 e.target.style.transform = 'translateY(-2px)';
                                 e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                             }}
                             onMouseLeave={(e) => {
                                 e.target.style.transform = 'translateY(0)';
                                 e.target.style.boxShadow = 'none';
                             }}
                         >
                             📈 {language === 'ar' ? 'تصدير Excel' : 'Export Excel'}
                         </button>
                     </div>

                    {/* Clear Filters Button */}
                    {(searchTerm !== '' || filterStatus !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                            }}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            🗑️ {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                        </button>
                    )}
                </div>

                {sortedOrders.length > 0 ? (
                    <div style={{
                        overflowX: 'auto',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem'
                        }}>
                            <thead>
                                <tr style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderBottom: '2px solid rgba(0, 0, 0, 0.1)'
                                }}>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => {
                                        if (sortBy === 'customer') {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy('customer');
                                            setSortOrder('asc');
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {language === 'ar' ? 'العميل' : 'Customer'}
                                            {sortBy === 'customer' && (
                                                <span style={{ fontSize: '0.75rem' }}>
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrders(sortedOrders.map(order => order.id));
                                                } else {
                                                    setSelectedOrders([]);
                                                }
                                            }}
                                            style={{
                                                width: '1rem',
                                                height: '1rem',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => {
                                        if (sortBy === 'meal') {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy('meal');
                                            setSortOrder('asc');
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {language === 'ar' ? 'الوجبة' : 'Meal'}
                                            {sortBy === 'meal' && (
                                                <span style={{ fontSize: '0.75rem' }}>
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'العنوان' : 'Address'}
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => {
                                        if (sortBy === 'delivery_time') {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy('delivery_time');
                                            setSortOrder('asc');
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}
                                            {sortBy === 'delivery_time' && (
                                                <span style={{ fontSize: '0.75rem' }}>
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'start',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => {
                                        if (sortBy === 'status') {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy('status');
                                            setSortOrder('asc');
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {language === 'ar' ? 'الحالة' : 'Status'}
                                            {sortBy === 'status' && (
                                                <span style={{ fontSize: '0.75rem' }}>
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th style={{
                                        padding: '1rem 0.75rem',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrders.map((order, index) => (
                                    <tr key={order.id} style={{
                                        background: selectedOrders.includes(order.id) 
                                            ? 'rgba(102, 126, 234, 0.1)' 
                                            : index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(248, 250, 252, 0.7)',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selectedOrders.includes(order.id)) {
                                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedOrders.includes(order.id)) {
                                            e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(248, 250, 252, 0.7)';
                                        }
                                    }}>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                            textAlign: 'center'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedOrders([...selectedOrders, order.id]);
                                                    } else {
                                                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                    }
                                                }}
                                                style={{
                                                    width: '1rem',
                                                    height: '1rem',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: 'white'
                                                }}>
                                                    👤
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: 'rgb(55 65 81)'
                                                    }}>
                                                        {order.subscription?.user?.full_name || order.subscription?.user?.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgb(107 114 128)'
                                                    }}>
                                                        #{order.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    📞
                                                </div>
                                                <span style={{ color: 'rgb(55 65 81)' }}>
                                                    {order.subscription?.delivery_address?.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    🍽️
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: 'rgb(55 65 81)'
                                                    }}>
                                                        {language === 'ar' ? order.meal?.name_ar : order.meal?.name_en}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgb(107 114 128)'
                                                    }}>
                                                        {language === 'ar' ? order.meal?.type_ar : order.meal?.type_en}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                            maxWidth: '200px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    📍
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'rgb(107 114 128)',
                                                    lineHeight: '1.4',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {order.subscription?.delivery_address?.address}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '1rem 0.75rem',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.625rem',
                                                    color: 'white'
                                                }}>
                                                    🕐
                                                </div>
                                                                                                 <span style={{ 
                                                     color: 'rgb(55 65 81)',
                                                     fontSize: '0.75rem',
                                                     fontWeight: '500'
                                                 }}>
                                                     {(() => {
                                                         const deliveryTime = order.meal?.delivery_time;
                                                         if (!deliveryTime) return '12:00 PM';
                                                         
                                                         // Handle ISO string format
                                                         if (deliveryTime.includes('T')) {
                                                             const date = new Date(deliveryTime);
                                                             return date.toLocaleTimeString('en-US', {
                                                                 hour: '2-digit',
                                                                 minute: '2-digit',
                                                                 hour12: true
                                                             });
                                                         }
                                                         
                                                         // Handle simple time format
                                                         return deliveryTime;
                                                     })()}
                                                 </span>
                                            </div>
                                        </td>
                                                                                 <td style={{
                                             padding: '1rem 0.75rem',
                                             borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                         }}>
                                             <div style={{
                                                 display: 'flex',
                                                 alignItems: 'center',
                                                 gap: '0.5rem'
                                             }}>
                                                 <div style={{
                                                     width: '1.5rem',
                                                     height: '1.5rem',
                                                     background: order.status === 'delivered' ? '#10b981' : 
                                                                 order.status === 'preparing' ? '#3b82f6' : 
                                                                 order.status === 'pending' ? '#f59e0b' : '#ef4444',
                                                     borderRadius: '0.25rem',
                                                     display: 'flex',
                                                     alignItems: 'center',
                                                     justifyContent: 'center',
                                                     fontSize: '0.75rem',
                                                     color: 'white'
                                                 }}>
                                                     {getStatusIcon(order.status)}
                                                 </div>
                                                 <span style={{
                                                     fontSize: '0.75rem',
                                                     fontWeight: '500',
                                                     color: 'rgb(55 65 81)'
                                                 }}>
                                                     {getStatusText(order.status)}
                                                 </span>
                                             </div>
                                         </td>
                                                                                 <td style={{
                                             padding: '1rem 0.75rem',
                                             borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                             textAlign: 'center'
                                         }}>
                                                                                                                                                                                       {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                                                  <div style={{ position: 'relative' }}>
                                                      <select
                                                          onChange={(e) => {
                                                              const selectedAction = e.target.value;
                                                              if (selectedAction && selectedAction !== '') {
                                                                  if (selectedAction === 'cancel') {
                                                                      if (window.confirm(language === 'ar' 
                                                                          ? 'هل أنت متأكد من إلغاء هذا الطلب؟'
                                                                          : 'Are you sure you want to cancel this order?'
                                                                      )) {
                                                                          handleStatusUpdate(order.id, 'cancelled');
                                                                      }
                                                                  } else {
                                                                      handleStatusUpdate(order.id, selectedAction);
                                                                  }
                                                                  // Reset select value
                                                                  e.target.value = '';
                                                              }
                                                          }}
                                                          style={{
                                                              padding: '0.5rem 0.75rem',
                                                              background: '#ffffff',
                                                              color: '#374151',
                                                              border: '1px solid #d1d5db',
                                                              borderRadius: '0.375rem',
                                                              fontSize: '0.75rem',
                                                              fontWeight: '500',
                                                              cursor: 'pointer',
                                                              transition: 'all 0.2s ease',
                                                              minWidth: '140px',
                                                              outline: 'none',
                                                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                          }}
                                                          onMouseEnter={(e) => {
                                                              e.target.style.borderColor = '#9ca3af';
                                                              e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                                                          }}
                                                          onMouseLeave={(e) => {
                                                              e.target.style.borderColor = '#d1d5db';
                                                              e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                                          }}
                                                          defaultValue=""
                                                      >
                                                          <option value="" disabled>
                                                              {language === 'ar' ? 'اختر الإجراء' : 'Select Action'}
                                                          </option>
                                                          {order.status === 'pending' && (
                                                              <option value="preparing">
                                                                  👨‍🍳 {language === 'ar' ? 'بدء التحضير' : 'Start Preparing'}
                                                              </option>
                                                          )}
                                                          {order.status === 'preparing' && (
                                                              <option value="delivered">
                                                                  ✅ {language === 'ar' ? 'تم التوصيل' : 'Mark Delivered'}
                                                              </option>
                                                          )}
                                                          <option value="cancel" style={{ color: '#dc2626' }}>
                                                              ❌ {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                                                          </option>
                                                      </select>
                                                  </div>
                                             ) : (
                                                 <span style={{
                                                     color: 'rgb(107 114 128)',
                                                     fontSize: '0.75rem',
                                                     fontStyle: 'italic',
                                                     padding: '0.5rem 1rem',
                                                     background: 'rgba(107, 114, 128, 0.1)',
                                                     borderRadius: '0.5rem',
                                                     display: 'inline-block'
                                                 }}>
                                                     {language === 'ar' ? 'لا يمكن تغيير الحالة' : 'Cannot change status'}
                                                 </span>
                                             )}
                                         </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'rgb(107 114 128)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {orders.length === 0 ? '📋' : '🔍'}
                        </div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.5rem'
                        }}>
                            {orders.length === 0 
                                ? (language === 'ar' ? 'لا توجد طلبات' : 'No Orders')
                                : (language === 'ar' ? 'لا توجد نتائج' : 'No Results')
                            }
                        </h3>
                        <p style={{ fontSize: '0.875rem' }}>
                            {orders.length === 0 
                                ? (language === 'ar' 
                                    ? 'لا توجد طلبات لعرضها في الجدول'
                                    : 'No orders to display in the table'
                                )
                                : (language === 'ar'
                                    ? 'جرب تغيير معايير البحث أو الفلترة'
                                    : 'Try changing your search or filter criteria'
                                )
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {orders.length === 0 && !loading && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '3rem',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>
                        📋
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد طلبات اليوم' : 'No Orders Today'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' 
                            ? 'لا توجد طلبات للتوصيل اليوم. تحقق من الطلبات غداً!'
                            : 'No orders to deliver today. Check back tomorrow!'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default TodayOrders;
