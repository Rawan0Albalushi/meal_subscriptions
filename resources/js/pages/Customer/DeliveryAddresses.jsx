import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DeliveryAddresses = () => {
    const { t, language } = useLanguage();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        additional_notes: '',
        is_default: false
    });

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/delivery-addresses', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setAddresses(data.data);
            } else {
                setError('Failed to fetch addresses');
            }
        } catch (err) {
            setError('Error fetching addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            
            const url = editingAddress 
                ? `/api/delivery-addresses/${editingAddress.id}`
                : '/api/delivery-addresses';
            
            const method = editingAddress ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setShowForm(false);
                setEditingAddress(null);
                resetForm();
                fetchAddresses();
                // You can add a success message state here instead of alert
                console.log(language === 'ar' ? 'تم حفظ العنوان بنجاح' : 'Address saved successfully');
            } else {
                console.log(data.message || 'Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            console.log('Error saving address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            name: address.name,
            phone: address.phone,
            address: address.address,
            city: address.city,
            postal_code: address.postal_code || '',
            additional_notes: address.additional_notes || '',
            is_default: address.is_default
        });
        setShowForm(true);
    };

    const handleDelete = async (addressId) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
            return;
        }

        try {
            const response = await fetch(`/api/delivery-addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                fetchAddresses();
                // You can add a success message state here instead of alert
                console.log(language === 'ar' ? 'تم حذف العنوان بنجاح' : 'Address deleted successfully');
            } else {
                console.log(data.message || 'Failed to delete address');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            console.log('Error deleting address');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            address: '',
            city: '',
            postal_code: '',
            additional_notes: '',
            is_default: false
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center" style={{
                background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(182, 84, 73, 0.05) 50%, rgba(74, 138, 143, 0.05) 100%)'
            }}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{
                        borderColor: 'rgba(47, 110, 115, 0.2)',
                        borderTopColor: '#2f6e73'
                    }}></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin" style={{ 
                        animationDelay: '0.5s',
                        borderTopColor: '#b65449'
                    }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center" style={{
                background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(182, 84, 73, 0.05) 50%, rgba(74, 138, 143, 0.05) 100%)'
            }}>
                <div className="text-center">
                    <div className="border rounded-2xl p-8 max-w-md mx-auto shadow-2xl" style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                        borderColor: 'rgba(239, 68, 68, 0.2)'
                    }}>
                        <div className="text-red-600 text-lg mb-6 font-semibold">{error}</div>
                        <button 
                            onClick={fetchAddresses}
                            className="text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            }}
                        >
                            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(182, 84, 73, 0.05) 50%, rgba(74, 138, 143, 0.05) 100%)'
        }}>
            {/* Hero Section */}
            <div className="relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #2f6e73 0%, #b65449 50%, #c86a5a 100%)'
            }}>
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
                        backgroundColor: 'rgba(182, 84, 73, 0.2)',
                        animationDelay: '1s'
                    }}></div>
                    <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{
                        backgroundColor: 'rgba(47, 110, 115, 0.2)',
                        animationDelay: '2s'
                    }}></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
                    <div className="text-center">
                        {/* Animated Badge */}
                        <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-10 animate-bounce">
                            <span className="text-white text-lg font-semibold">
                                {language === 'ar' ? '📍 إدارة عناوين التوصيل' : '📍 Manage Delivery Addresses'}
                            </span>
                        </div>
                        
                        {/* Main Heading with Glow Effect */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
                            <span className="animate-pulse" style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #b65449 50%, #2f6e73 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {language === 'ar' ? 'عناوين التوصيل' : 'Delivery Addresses'}
                            </span>
                        </h1>
                        
                        {/* Subtitle with Animation */}
                        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
                            {language === 'ar' 
                                ? 'إدارة عناوين التوصيل الخاصة بك بسهولة وأمان' 
                                : 'Manage your delivery addresses easily and securely'
                            }
                        </p>
                        
                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-12">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{addresses.length}</div>
                                <div className="text-white/80">{language === 'ar' ? 'عنوان' : 'Addresses'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {addresses.filter(a => a.is_default).length}
                                </div>
                                <div className="text-white/80">{language === 'ar' ? 'افتراضي' : 'Default'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {addresses.reduce((total, addr) => total + (addr.city ? 1 : 0), 0)}
                                </div>
                                <div className="text-white/80">{language === 'ar' ? 'مدينة' : 'Cities'}</div>
                            </div>
                        </div>
                        
                        {/* Add Address Button */}
                        <div className="mb-8">
                            <button
                                onClick={() => setShowForm(true)}
                                className="group relative inline-flex px-12 py-6 text-white rounded-2xl text-2xl font-bold transition-all duration-500 hover:scale-110 hover:shadow-2xl transform hover:-rotate-1 focus:outline-none focus:ring-4 focus:ring-offset-2"
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #b65449 50%, #2f6e73 100%)',
                                    boxShadow: '0 4px 12px rgba(47, 110, 115, 0.3)',
                                    focusRingColor: '#fbbf24'
                                }}
                            >
                                <span className="relative z-10 flex items-center">
                                    {language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}
                                    <svg className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #a54a3f 50%, #1f5a5f 100%)'
                                }}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">
                                <span style={{
                                    background: 'linear-gradient(135deg, #2f6e73 0%, #b65449 50%, #4a8a8f 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {editingAddress ? (language === 'ar' ? 'تعديل العنوان' : 'Edit Address') : (language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address')}
                                </span>
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {t('name')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl transition-all duration-300"
                                        style={{
                                            focusRingColor: '#2f6e73',
                                            focusBorderColor: '#2f6e73'
                                        }}
                                        required
                                        placeholder={language === 'ar' ? 'مثال: المنزل، العمل' : 'Example: Home, Work'}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {t('phone')} *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        required
                                        placeholder="+96899999999"
                                        style={{ direction: 'ltr', textAlign: 'left' }}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    {t('address')} *
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                    required
                                    placeholder={language === 'ar' ? 'الشارع، الحي، المدينة، مسقط' : 'Street, District, City, Muscat'}
                                />
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {t('city')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        required
                                        placeholder={language === 'ar' ? 'مسقط، صلالة، صحار' : 'Muscat, Salalah, Sohar'}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {t('postalCode')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        placeholder="12345"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    {t('additionalNotes')}
                                </label>
                                <textarea
                                    value={formData.additional_notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                    placeholder={language === 'ar' ? 'مثال: بجانب مسجد السلطان قابوس، الطابق الثالث' : 'Example: Next to Sultan Qaboos Mosque, 3rd floor'}
                                />
                            </div>
                            
                            <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                                    className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_default" className="text-lg font-semibold text-gray-700">
                                    {t('isDefault')}
                                </label>
                            </div>
                            
                            <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="group relative px-8 py-3 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #2f6e73 0%, #b65449 100%)',
                                        focusRingColor: '#2f6e73'
                                    }}
                                >
                                    {submitting ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                                        </span>
                                    ) : (
                                        t('save')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Addresses Section */}
            <div className="py-24 bg-gradient-to-b from-white/80 to-purple-50/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    {addresses.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-200 rounded-3xl p-12 max-w-md mx-auto shadow-2xl">
                                <div className="text-6xl mb-4 animate-bounce">📍</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {language === 'ar' ? 'لا توجد عناوين' : 'No addresses yet'}
                                </h3>
                                <p className="text-gray-600 mb-8 text-lg">
                                    {language === 'ar' 
                                        ? 'أضف عنوان التوصيل الأول الخاص بك' 
                                        : 'Add your first delivery address'
                                    }
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="group relative inline-flex px-8 py-4 text-white rounded-2xl text-lg font-bold transition-all duration-500 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #2f6e73 0%, #b65449 100%)',
                                        focusRingColor: '#2f6e73'
                                    }}
                                >
                                    <span className="relative z-10 flex items-center">
                                        {t('addAddress')}
                                        <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {addresses.map((address) => (
                                <div key={address.id} className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 overflow-hidden border border-white/50 backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="relative p-8">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white text-xl">📍</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                                                        {address.name}
                                                    </h3>
                                                    {address.is_default && (
                                                        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full mt-2">
                                                            {language === 'ar' ? 'افتراضي' : 'Default'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Address Details */}
                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white text-sm">📞</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 font-medium">{t('phone')}</div>
                                                    <div className="font-bold text-gray-900" style={{ direction: 'ltr' }}>{address.phone}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                                                    <span className="text-white text-sm">🏠</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 font-medium">{t('address')}</div>
                                                    <div className="font-bold text-gray-900">{address.address}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white text-sm">🏙️</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 font-medium">{t('city')}</div>
                                                    <div className="font-bold text-gray-900">{address.city}</div>
                                                </div>
                                            </div>
                                            
                                            {address.postal_code && (
                                                <div className="flex items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                                        <span className="text-white text-sm">📮</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 font-medium">{t('postalCode')}</div>
                                                        <div className="font-bold text-gray-900">{address.postal_code}</div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {address.additional_notes && (
                                                <div className="flex items-start p-4 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 mt-0.5 shadow-lg">
                                                        <span className="text-white text-sm">📝</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 font-medium">{t('additionalNotes')}</div>
                                                        <div className="font-bold text-gray-900">{address.additional_notes}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex space-x-3 rtl:space-x-reverse">
                                            <button
                                                onClick={() => handleEdit(address)}
                                                className="group/btn relative flex-1 px-6 py-3 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                <span className="relative z-10 text-gray-700 group-hover/btn:text-white transition-colors duration-300">
                                                    {language === 'ar' ? 'تعديل' : 'Edit'}
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-all duration-300 shadow-lg"></div>
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="group/btn relative flex-1 px-6 py-3 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                <span className="relative z-10 text-gray-700 group-hover/btn:text-white transition-colors duration-300">
                                                    {language === 'ar' ? 'حذف' : 'Delete'}
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-all duration-300 shadow-lg"></div>
                                            </button>
                                        </div>
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

export default DeliveryAddresses;

