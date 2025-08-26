import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const SubscriptionDetail = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchSubscription();
    }, [id]);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/subscriptions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setSubscription(data.data);
            } else {
                setError('Failed to fetch subscription details');
            }
        } catch (err) {
            setError('Error fetching subscription details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء الاشتراك؟' : 'Are you sure you want to cancel this subscription?')) {
            return;
        }

        try {
            setCancelling(true);
            const response = await fetch(`/api/subscriptions/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'cancelled'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSubscription(data.data);
                alert(language === 'ar' ? 'تم إلغاء الاشتراك بنجاح' : 'Subscription cancelled successfully');
            } else {
                alert(data.message || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Error cancelling subscription');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 text-lg mb-4">
                    {error || 'Subscription not found'}
                </div>
                <Link 
                    to="/my-subscriptions"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                    {language === 'ar' ? 'العودة للاشتراكات' : 'Back to Subscriptions'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link 
                    to="/my-subscriptions"
                    className="text-green-600 hover:text-green-700 font-medium"
                >
                    ← {language === 'ar' ? 'العودة للاشتراكات' : 'Back to Subscriptions'}
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                {t('subscriptionDetails')}
                            </h1>
                            <p className="text-green-100">
                                {subscription.restaurant?.name} • {subscription.subscription_type_text}
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                                {subscription.status_text}
                            </span>
                            
                            {subscription.status === 'pending' && (
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelling}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {cancelling ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {language === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...'}
                                        </span>
                                    ) : (
                                        language === 'ar' ? 'إلغاء الاشتراك' : 'Cancel Subscription'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Restaurant Info */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {language === 'ar' ? 'معلومات المطعم' : 'Restaurant Information'}
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {subscription.restaurant?.name}
                            </h3>
                            {subscription.restaurant?.description && (
                                <p className="text-gray-600 mb-2">{subscription.restaurant.description}</p>
                            )}
                            {subscription.restaurant?.phone && (
                                <p className="text-sm text-gray-500">📞 {subscription.restaurant.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('subscriptionType')}</span>
                                    <span className="font-medium">{subscription.subscription_type_text}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</span>
                                    <span className="font-medium">
                                        {new Date(subscription.start_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</span>
                                    <span className="font-medium">
                                        {new Date(subscription.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('totalAmount')}</span>
                                    <span className="font-bold text-green-600">
                                        {subscription.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('status')}</span>
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(subscription.status)}`}>
                                        {subscription.status_text}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    {subscription.delivery_address?.name}
                                </h3>
                                <p className="text-gray-600 mb-2">{subscription.delivery_address?.address}</p>
                                <p className="text-sm text-gray-500">📞 {subscription.delivery_address?.phone}</p>
                                {subscription.delivery_address?.city && (
                                    <p className="text-sm text-gray-500">🏙️ {subscription.delivery_address.city}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meals */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {language === 'ar' ? 'الوجبات المختارة' : 'Selected Meals'}
                        </h2>
                        
                        {subscription.subscription_items && subscription.subscription_items.length > 0 ? (
                            <div className="grid gap-4">
                                {subscription.subscription_items.map((item) => (
                                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {item.meal?.name}
                                                </h3>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div>
                                                        {item.day_of_week_text} • {item.meal?.meal_type_text}
                                                    </div>
                                                    <div>
                                                        {language === 'ar' ? 'تاريخ التوصيل' : 'Delivery Date'}: {new Date(item.delivery_date).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}: {new Date(`2000-01-01T${item.meal?.delivery_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
                                                <span className="font-bold text-green-600">
                                                    {item.price} {language === 'ar' ? 'ريال' : 'SAR'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status_text}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {language === 'ar' ? 'لا توجد وجبات مختارة' : 'No meals selected'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDetail;


