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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-600 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
                        <div className="text-red-600 text-lg mb-6 font-semibold">{error}</div>
                        <button 
                            onClick={fetchSubscriptions}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
                    <div className="text-center">
                        {/* Animated Badge */}
                        <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-10 animate-bounce">
                            <span className="text-white text-lg font-semibold">
                                {language === 'ar' ? '📋 إدارة اشتراكاتك' : '📋 Manage Your Subscriptions'}
                            </span>
                        </div>
                        
                        {/* Main Heading with Glow Effect */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
                            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
                                {language === 'ar' ? 'اشتراكاتي' : 'My Subscriptions'}
                            </span>
                        </h1>
                        
                        {/* Subtitle with Animation */}
                        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
                            {language === 'ar' 
                                ? 'عرض جميع اشتراكاتك وإدارتها بسهولة' 
                                : 'View and manage all your subscriptions easily'
                            }
                        </p>
                        
                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-12">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{subscriptions.length}</div>
                                <div className="text-white/80">{language === 'ar' ? 'اشتراك' : 'Subscriptions'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {subscriptions.filter(s => s.status === 'active').length}
                                </div>
                                <div className="text-white/80">{language === 'ar' ? 'نشط' : 'Active'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {subscriptions.reduce((total, sub) => total + (sub.subscription_items?.length || 0), 0)}
                                </div>
                                <div className="text-white/80">{language === 'ar' ? 'وجبة' : 'Meals'}</div>
                            </div>
                        </div>
                        
                        {/* New Subscription Button */}
                        <div className="mb-8">
                            <Link
                                to="/restaurants"
                                className="group relative inline-flex px-12 py-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white rounded-2xl text-2xl font-bold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:-rotate-1 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                <span className="relative z-10 flex items-center">
                                    {language === 'ar' ? 'اشتراك جديد' : 'New Subscription'}
                                    <svg className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscriptions Section */}
            <div className="py-24 bg-gradient-to-b from-white/80 to-purple-50/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-200 rounded-3xl p-12 max-w-md mx-auto shadow-2xl">
                                <div className="text-6xl mb-4 animate-bounce">🍽️</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {language === 'ar' ? 'لا توجد اشتراكات' : 'No subscriptions yet'}
                                </h3>
                                <p className="text-gray-600 mb-8 text-lg">
                                    {language === 'ar' 
                                        ? 'ابدأ بإنشاء اشتراكك الأول للحصول على وجباتك المفضلة' 
                                        : 'Start by creating your first subscription to get your favorite meals'
                                    }
                                </p>
                                <Link
                                    to="/restaurants"
                                    className="group relative inline-flex px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl text-lg font-bold transition-all duration-500 hover:scale-105 hover:shadow-lg"
                                >
                                    <span className="relative z-10 flex items-center">
                                        {language === 'ar' ? 'تصفح المطاعم' : 'Browse Restaurants'}
                                        <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {subscriptions.map((subscription) => (
                                <div key={subscription.id} className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-white/50 backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="relative p-8">
                                        {/* Header */}
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                                            <div className="flex items-center mb-6 lg:mb-0">
                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                                                    <div className="text-3xl">🍽️</div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                                        {language === 'ar' ? subscription.restaurant?.name_ar : subscription.restaurant?.name_en}
                                                    </h3>
                                                    <p className="text-gray-600 text-lg">
                                                        {subscription.subscription_type_text} • {subscription.subscription_items?.length || 0} {language === 'ar' ? 'وجبة' : 'meals'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                                <div className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getStatusColor(subscription.status)} shadow-lg flex items-center`}>
                                                    <span className="mr-2">{getStatusIcon(subscription.status)}</span>
                                                    {subscription.status_text}
                                                </div>
                                                
                                                <Link
                                                    to={`/subscriptions/${subscription.id}`}
                                                    className="group/btn relative px-6 py-3 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                                >
                                                    <span className="relative z-10 text-gray-700 group-hover/btn:text-white transition-colors duration-300">
                                                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl group-hover/btn:from-purple-500 group-hover/btn:to-pink-500 transition-all duration-300 shadow-lg"></div>
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        {/* Subscription Details */}
                                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                                            <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                                                <div className="text-sm text-gray-500 font-medium mb-2">
                                                    {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">
                                                    {new Date(subscription.start_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            <div className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                                                <div className="text-sm text-gray-500 font-medium mb-2">
                                                    {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">
                                                    {new Date(subscription.end_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            <div className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                                                <div className="text-sm text-gray-500 font-medium mb-2">
                                                    {t('totalAmount')}
                                                </div>
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {subscription.total_amount} {language === 'ar' ? 'ريال' : 'SAR'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Delivery Address */}
                                        {subscription.delivery_address && (
                                            <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center mb-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                                        <span className="text-white text-xl">📍</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 font-medium">
                                                            {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                                                        </div>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {subscription.delivery_address.name} - {subscription.delivery_address.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Selected Meals */}
                                        {subscription.subscription_items && subscription.subscription_items.length > 0 && (
                                            <div className="border-t border-gray-200 pt-8">
                                                <h4 className="text-xl font-bold text-gray-900 mb-6">
                                                    {language === 'ar' ? 'الوجبات المختارة' : 'Selected Meals'}
                                                </h4>
                                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {subscription.subscription_items.slice(0, 6).map((item) => (
                                                        <div key={item.id} className="group p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                                                            <div className="flex items-center mb-3">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                                                                    <span className="text-white text-sm">🍽️</span>
                                                                </div>
                                                                <div className="font-bold text-gray-900">
                                                                    {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <div>{item.day_of_week_text} • {item.meal?.meal_type_text}</div>
                                                                <div className="font-semibold text-purple-600">
                                                                    {item.price} {language === 'ar' ? 'ريال' : 'SAR'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {subscription.subscription_items.length > 6 && (
                                                        <div className="flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                                            <span className="text-purple-600 font-semibold">
                                                                +{subscription.subscription_items.length - 6} {language === 'ar' ? 'وجبات أخرى' : 'more meals'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MySubscriptions;

