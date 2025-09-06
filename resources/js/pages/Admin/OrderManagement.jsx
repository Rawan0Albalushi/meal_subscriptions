import React, { useState, useEffect } from 'react';
import { adminSubscriptionsAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import { usePopupMessage } from '../../hooks/usePopupMessage';

const OrderManagement = () => {
    const { language } = useLanguage();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [restaurantFilter, setRestaurantFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [exportLoading, setExportLoading] = useState(false);
    const { showPopup, hidePopup, popup } = usePopupMessage();

    useEffect(() => {
        fetchSubscriptions();
        fetchRestaurants();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, [searchTerm, restaurantFilter, userFilter, statusFilter]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search: searchTerm,
                restaurant_id: restaurantFilter !== 'all' ? restaurantFilter : '',
                user_id: userFilter !== 'all' ? userFilter : '',
                status: statusFilter !== 'all' ? statusFilter : ''
            });

            const response = await adminSubscriptionsAPI.getAll(params.toString());
            
            if (response.data.success) {
                setSubscriptions(response.data.data);
            } else {
                setError('فشل في جلب الطلبات');
            }
        } catch (err) {
            setError('خطأ في جلب الطلبات');
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await adminSubscriptionsAPI.getRestaurants();
            if (response.data.success) {
                setRestaurants(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching restaurants:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminSubscriptionsAPI.getUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case 'restaurant':
                setRestaurantFilter(value);
                break;
            case 'user':
                setUserFilter(value);
                break;
            case 'status':
                setStatusFilter(value);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRestaurantFilter('all');
        setUserFilter('all');
        setStatusFilter('all');
    };

    const exportToExcel = async () => {
        try {
            setExportLoading(true);
            
            const excelData = subscriptions.map(subscription => ({
                'رقم الطلب': subscription.id,
                'اسم العميل': subscription.user?.name || 'غير محدد',
                'المطعم': subscription.restaurant?.name_ar || 'غير محدد',
                'نوع الاشتراك': subscription.subscription_type_text || 'غير محدد',
                'تاريخ الطلب': new Date(subscription.created_at).toLocaleDateString('en-US'),
                'تاريخ البداية': new Date(subscription.start_date).toLocaleDateString('en-US'),
                'تاريخ النهاية': new Date(subscription.end_date).toLocaleDateString('en-US'),
                'المبلغ الإجمالي': subscription.total_amount,
                'حالة الطلب': subscription.status === 'active' ? 'نشط' :
                              subscription.status === 'pending' ? 'في الانتظار' :
                              subscription.status === 'cancelled' ? 'ملغي' : subscription.status,
                'حالة الدفع': subscription.payment_status === 'paid' ? 'مدفوع' :
                              subscription.payment_status === 'pending' ? 'في الانتظار' :
                              subscription.payment_status === 'failed' ? 'فشل' : subscription.payment_status,
                'عدد العناصر': subscription.items?.length || 0
            }));

            const headers = Object.keys(excelData[0] || {});
            const csvContent = [
                headers.join(','),
                ...excelData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showPopup('نجح التصدير', 'تم تصدير البيانات بنجاح', 'success');
        } catch (err) {
            showPopup('خطأ في التصدير', 'فشل في تصدير البيانات', 'error');
            console.error('Error exporting data:', err);
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل الطلبات</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchSubscriptions}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                إدارة الطلبات
                        </h1>
                            <p className="text-gray-600 mt-1">
                                إدارة ومتابعة جميع طلبات الاشتراكات
                        </p>
                    </div>
                        <div className="flex items-center space-x-6 space-x-reverse">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                                <p className="text-2xl font-bold text-blue-600">{subscriptions.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">الطلبات النشطة</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {subscriptions.filter(s => s.status === 'active').length}
                                </p>
                </div>
                            <button
                                onClick={exportToExcel}
                                disabled={exportLoading || subscriptions.length === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
                            >
                                {exportLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>جاري التصدير...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>تصدير Excel</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">فلترة متقدمة</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            مسح جميع الفلاتر
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="ابحث بالرقم أو الاسم..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Restaurant Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المطعم</label>
                            <select
                                value={restaurantFilter}
                                onChange={(e) => handleFilterChange('restaurant', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">جميع المطاعم</option>
                                {restaurants.map(restaurant => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* User Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">العميل</label>
                            <select
                                value={userFilter}
                                onChange={(e) => handleFilterChange('user', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">جميع العملاء</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="active">نشط</option>
                                <option value="pending">في الانتظار</option>
                                <option value="cancelled">ملغي</option>
                                <option value="completed">مكتمل</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow-sm p-6">

                    {subscriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                            <p className="text-gray-600">لم يتم العثور على أي طلبات في النظام</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {subscriptions.map(subscription => (
                                <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">طلب #{subscription.id}</h3>
                                            <p className="text-gray-600">العميل: {subscription.user?.name || 'غير محدد'}</p>
                                            <p className="text-gray-600">المطعم: {subscription.restaurant?.name_ar || 'غير محدد'}</p>
                                            <p className="text-gray-600">المبلغ: {subscription.total_amount} ر.ع</p>
                                            <p className="text-gray-600">تاريخ الطلب: {new Date(subscription.created_at).toLocaleDateString('en-US')}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                            subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {subscription.status === 'active' ? 'نشط' :
                                             subscription.status === 'pending' ? 'في الانتظار' :
                                             subscription.status === 'cancelled' ? 'ملغي' :
                                             subscription.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Popup Message */}
            <PopupMessage
                show={popup.show}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onClose={hidePopup}
            />
        </div>
    );
};

export default OrderManagement;