import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Popup from '../../components/Popup';
import RestaurantAddressManager from '../../components/RestaurantAddressManager';

const SellerRestaurants = () => {
    const { t, dir, language } = useLanguage();

    // دالة لعرض الـ popup
    const showPopup = (title, message, type = 'info', onConfirm = null) => {
        setPopup({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: onConfirm ? () => {
                onConfirm();
                setPopup(prev => ({ ...prev, isOpen: false }));
            } : null
        });
    };

    // دالة لإغلاق الـ popup
    const closePopup = () => {
        setPopup(prev => ({ ...prev, isOpen: false }));
    };
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [activeTab, setActiveTab] = useState('list');
    
    // Popup states
    const [popup, setPopup] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    }); // 'list', 'addresses'
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        phone: '',
        email: '',
        address_ar: '',
        address_en: '',
        locations: [],
        logo: null,
        existingLogo: null,
        is_active: true
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/seller/restaurants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.data || []);
            } else {
                const errorData = await response.json();
                console.error('Error fetching restaurants:', errorData);
                showPopup(
                    language === 'ar' ? 'خطأ في التحميل' : 'Loading Error',
                    language === 'ar' ? 'حدث خطأ في تحميل المطاعم' : 'Error loading restaurants',
                    'error'
                );
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            showPopup(
                language === 'ar' ? 'خطأ في التحميل' : 'Loading Error',
                language === 'ar' ? 'حدث خطأ في تحميل المطاعم' : 'Error loading restaurants',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // إعداد البيانات للإرسال
            const requestData = {
                name_ar: formData.name_ar,
                name_en: formData.name_en,
                description_ar: formData.description_ar,
                description_en: formData.description_en,
                phone: formData.phone,
                email: formData.email,
                address_ar: formData.address_ar,
                address_en: formData.address_en,
                locations: formData.locations,
                is_active: Boolean(formData.is_active) // تأكد من أن القيمة boolean
            };

            console.log('🔍 بيانات النموذج قبل الإرسال:', {
                original_is_active: formData.is_active,
                processed_is_active: requestData.is_active,
                requestData: requestData,
                editingRestaurant: editingRestaurant ? editingRestaurant.id : null,
                hasLogo: !!formData.logo,
                hasExistingLogo: !!formData.existingLogo
            });

            // إذا كان هناك ملف شعار، استخدم FormData
            let body, headers;
            if (formData.logo) {
                const formDataToSend = new FormData();
                Object.keys(requestData).forEach(key => {
                    if (key === 'locations') {
                        requestData.locations.forEach(location => {
                            formDataToSend.append('locations[]', location);
                        });
                    } else if (key === 'is_active') {
                        // إرسال is_active كـ "1" أو "0" بدلاً من true/false
                        formDataToSend.append(key, requestData[key] ? '1' : '0');
                    } else {
                        formDataToSend.append(key, requestData[key]);
                    }
                });
                formDataToSend.append('logo', formData.logo);
                body = formDataToSend;
                headers = {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                };
            } else {
                // بدون ملف، استخدم JSON
                body = JSON.stringify(requestData);
                headers = {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                };
            }

            const url = editingRestaurant 
                ? `/api/seller/restaurants/${editingRestaurant.id}`
                : '/api/seller/restaurants';
            
            const method = editingRestaurant ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers,
                body
            });

            if (response.ok) {
                const data = await response.json();
                showPopup(
                    language === 'ar' ? 'تم بنجاح' : 'Success',
                    language === 'ar' ? data.message || 'تم حفظ المطعم بنجاح' : data.message || 'Restaurant saved successfully',
                    'success',
                    () => {
                        setShowAddModal(false);
                        setEditingRestaurant(null);
                        resetForm();
                        fetchRestaurants();
                    }
                );
            } else {
                const errorData = await response.json();
                console.error('Error saving restaurant:', errorData);
                if (errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join('\n');
                    showPopup(
                        language === 'ar' ? 'أخطاء في النموذج' : 'Form Errors',
                        language === 'ar' ? `أخطاء في النموذج:\n${errorMessages}` : `Form errors:\n${errorMessages}`,
                        'error'
                    );
                } else {
                    showPopup(
                        language === 'ar' ? 'خطأ في الحفظ' : 'Save Error',
                        language === 'ar' ? 'حدث خطأ في حفظ المطعم' : 'Error saving restaurant',
                        'error'
                    );
                }
            }
        } catch (error) {
            console.error('Error saving restaurant:', error);
            showPopup(
                language === 'ar' ? 'خطأ في الحفظ' : 'Save Error',
                language === 'ar' ? 'حدث خطأ في حفظ المطعم' : 'Error saving restaurant',
                'error'
            );
        }
    };

    const handleManageAddresses = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setActiveTab('addresses');
    };

    const handleBackToList = () => {
        setActiveTab('list');
        setSelectedRestaurant(null);
    };

    const handleEdit = (restaurant) => {
        console.log('🔍 تحميل بيانات المطعم للتعديل:', restaurant);
        setEditingRestaurant(restaurant);
        setFormData({
            name_ar: restaurant.name_ar || '',
            name_en: restaurant.name_en || '',
            description_ar: restaurant.description_ar || '',
            description_en: restaurant.description_en || '',
            phone: restaurant.phone || '',
            email: restaurant.email || '',
            address_ar: restaurant.address_ar || '',
            address_en: restaurant.address_en || '',
            locations: restaurant.locations || [],
            logo: null, // سيتم الاحتفاظ بالشعار الموجود في الخادم
            existingLogo: restaurant.logo, // إضافة الشعار الموجود
            is_active: restaurant.is_active
        });
        console.log('✅ تم تحميل البيانات في النموذج:', {
            name_ar: restaurant.name_ar,
            name_en: restaurant.name_en,
            phone: restaurant.phone,
            email: restaurant.email,
            locations: restaurant.locations,
            is_active: restaurant.is_active,
            existingLogo: restaurant.logo
        });
        setShowAddModal(true);
    };

    const handleDelete = async (restaurantId) => {
        setPopup({
            isOpen: true,
            title: language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
            message: language === 'ar' ? 'هل أنت متأكد من حذف هذا المطعم؟' : 'Are you sure you want to delete this restaurant?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/seller/restaurants/${restaurantId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        showPopup(
                            language === 'ar' ? 'تم بنجاح' : 'Success',
                            language === 'ar' ? data.message || 'تم حذف المطعم بنجاح' : data.message || 'Restaurant deleted successfully',
                            'success',
                            () => fetchRestaurants()
                        );
                    } else {
                        const errorData = await response.json();
                        console.error('Error deleting restaurant:', errorData);
                        showPopup(
                            language === 'ar' ? 'خطأ في الحذف' : 'Delete Error',
                            language === 'ar' ? 'حدث خطأ في حذف المطعم' : 'Error deleting restaurant',
                            'error'
                        );
                    }
                } catch (error) {
                    console.error('Error deleting restaurant:', error);
                    showPopup(
                        language === 'ar' ? 'خطأ في الحذف' : 'Delete Error',
                        language === 'ar' ? 'حدث خطأ في حذف المطعم' : 'Error deleting restaurant',
                        'error'
                    );
                }
            }
        });
    };

    const handleToggleStatus = async (restaurantId) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${restaurantId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                showPopup(
                    language === 'ar' ? 'تم بنجاح' : 'Success',
                    language === 'ar' ? data.message || 'تم تغيير حالة المطعم' : data.message || 'Restaurant status updated',
                    'success',
                    () => fetchRestaurants()
                );
            } else {
                const errorData = await response.json();
                console.error('Error toggling restaurant status:', errorData);
                showPopup(
                    language === 'ar' ? 'خطأ في التحديث' : 'Update Error',
                    language === 'ar' ? 'حدث خطأ في تغيير حالة المطعم' : 'Error updating restaurant status',
                    'error'
                );
            }
        } catch (error) {
            console.error('Error toggling restaurant status:', error);
            showPopup(
                language === 'ar' ? 'خطأ في التحديث' : 'Update Error',
                language === 'ar' ? 'حدث خطأ في تغيير حالة المطعم' : 'Error updating restaurant status',
                'error'
            );
        }
    };

    const resetForm = () => {
        setFormData({
            name_ar: '',
            name_en: '',
            description_ar: '',
            description_en: '',
            phone: '',
            email: '',
            address_ar: '',
            address_en: '',
            locations: [],
            logo: null,
            existingLogo: null,
            is_active: true
        });
    };

    const locationOptions = [
        { value: 'bosher', labelAr: 'بوشر', labelEn: 'Bosher' },
        { value: 'khoudh', labelAr: 'الخوض', labelEn: 'Khoudh' },
        { value: 'maabilah', labelAr: 'معبيلة', labelEn: 'Maabilah' }
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({...formData, logo: file});
        }
    };

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
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '1rem'
            }}>
                <button
                    onClick={() => setActiveTab('list')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeTab === 'list' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: activeTab === 'list' ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {language === 'ar' ? 'قائمة المطاعم' : 'Restaurants List'}
                </button>
                {selectedRestaurant && (
                    <button
                        onClick={() => setActiveTab('addresses')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'addresses' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                            color: activeTab === 'addresses' ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {language === 'ar' ? 'إدارة العناوين' : 'Manage Addresses'}
                    </button>
                )}
            </div>

            {/* Addresses Management Tab */}
            {activeTab === 'addresses' && selectedRestaurant && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <button
                            onClick={handleBackToList}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            ← {language === 'ar' ? 'العودة للقائمة' : 'Back to List'}
                        </button>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                        }}>
                            {language === 'ar' ? 'إدارة عناوين' : 'Manage Addresses'}: {selectedRestaurant.name}
                        </h2>
                    </div>
                    <RestaurantAddressManager 
                        restaurantId={selectedRestaurant.id}
                        onAddressesChange={() => {
                            // يمكن إضافة أي منطق إضافي هنا عند تغيير العناوين
                        }}
                    />
                </div>
            )}

            {/* Restaurants List Tab */}
            {activeTab === 'list' && (
                <>
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
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.5rem'
                        }}>
                            {language === 'ar' ? 'إدارة المطاعم' : 'Restaurants Management'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة مطاعمك وإضافة مطاعم جديدة'
                                : 'Manage your restaurants and add new ones'
                            }
                        </p>
                    </div>
                    
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingRestaurant(null);
                            setShowAddModal(true);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {language === 'ar' ? '➕ إضافة مطعم جديد' : '➕ Add New Restaurant'}
                    </button>
                </div>
            </div>

            {/* Restaurants Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Restaurant Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                                                 <div style={{
                                     width: '5rem',
                                     height: '4rem',
                                     background: restaurant.is_active 
                                         ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                         : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                     borderRadius: '12px',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     fontSize: '2rem',
                                     color: 'white',
                                     overflow: 'hidden'
                                 }}>
                                     {restaurant.logo ? (
                                         <img 
                                             src={`/storage/${restaurant.logo}`}
                                             alt={language === 'ar' ? 'شعار المطعم' : 'Restaurant Logo'}
                                             style={{
                                                 width: '100%',
                                                 height: '100%',
                                                 objectFit: 'contain',
                                                 transition: 'transform 0.3s ease',
                                                 backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                             }}
                                             onLoad={(e) => {
                                                 e.target.style.transform = 'scale(1)';
                                             }}
                                             onError={(e) => {
                                                 e.target.style.display = 'none';
                                                 e.target.nextSibling.style.display = 'flex';
                                             }}
                                         />
                                     ) : (
                                         <div style={{
                                             width: '100%',
                                             height: '100%',
                                             background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                             fontSize: '2rem',
                                             color: 'white'
                                         }}>
                                             🏪
                                         </div>
                                     )}
                                 </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        margin: 0,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: restaurant.is_active 
                                                ? 'rgba(34, 197, 94, 0.1)' 
                                                : 'rgba(239, 68, 68, 0.1)',
                                            color: restaurant.is_active 
                                                ? 'rgb(34 197 94)' 
                                                : 'rgb(239 68 68)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {restaurant.is_active 
                                                ? (language === 'ar' ? 'نشط' : 'Active')
                                                : (language === 'ar' ? 'غير نشط' : 'Inactive')
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Details */}
                        <div style={{
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{
                                color: 'rgb(107 114 128)',
                                fontSize: '0.875rem',
                                margin: 0,
                                marginBottom: '1rem',
                                lineHeight: 1.5
                            }}>
                                {language === 'ar' ? restaurant.description_ar : restaurant.description_en}
                            </p>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                                fontSize: '0.75rem'
                            }}>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        📞 {language === 'ar' ? 'الهاتف' : 'Phone'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.phone || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        📧 {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.email || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        🍽️ {language === 'ar' ? 'الوجبات' : 'Meals'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {restaurant.meals?.length || 0} {language === 'ar' ? 'وجبة' : 'meals'}
                                    </div>
                                </div>
                                                                 <div>
                                     <span style={{
                                         color: 'rgb(107 114 128)',
                                         fontWeight: '500'
                                     }}>
                                         🖼️ {language === 'ar' ? 'الشعار' : 'Logo'}:
                                     </span>
                                     <div style={{
                                         color: 'rgb(55 65 81)',
                                         marginTop: '0.25rem'
                                     }}>
                                         {restaurant.logo ? (
                                             <img 
                                                 src={`/storage/${restaurant.logo}`}
                                                 alt={language === 'ar' ? 'شعار المطعم' : 'Restaurant Logo'}
                                                 style={{
                                                     width: '40px',
                                                     height: '40px',
                                                     borderRadius: '8px',
                                                     objectFit: 'cover'
                                                 }}
                                             />
                                         ) : (
                                             <span style={{ color: 'rgb(156 163 175)' }}>
                                                 {language === 'ar' ? 'غير متوفر' : 'Not available'}
                                             </span>
                                         )}
                                     </div>
                                 </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                onClick={() => handleEdit(restaurant)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                                }}
                            >
                                ✏️ {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            
                            <button
                                onClick={() => handleToggleStatus(restaurant.id)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    background: restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.1)' 
                                        : 'rgba(34, 197, 94, 0.1)',
                                    color: restaurant.is_active 
                                        ? 'rgb(239 68 68)' 
                                        : 'rgb(34 197 94)',
                                    border: `1px solid ${restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.2)' 
                                        : 'rgba(34, 197, 94, 0.2)'}`,
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.2)' 
                                        : 'rgba(34, 197, 94, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = restaurant.is_active 
                                        ? 'rgba(239, 68, 68, 0.1)' 
                                        : 'rgba(34, 197, 94, 0.1)';
                                }}
                            >
                                {restaurant.is_active 
                                    ? `❌ ${language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate'}`
                                    : `✅ ${language === 'ar' ? 'تفعيل' : 'Activate'}`
                                }
                            </button>
                            

                            
                            <button
                                onClick={() => handleDelete(restaurant.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'rgb(239 68 68)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {restaurants.length === 0 && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>
                        🏪
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد مطاعم' : 'No Restaurants'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0,
                        marginBottom: '1.5rem'
                    }}>
                        {language === 'ar' 
                            ? 'ابدأ بإضافة مطعمك الأول'
                            : 'Start by adding your first restaurant'
                        }
                    </p>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingRestaurant(null);
                            setShowAddModal(true);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {language === 'ar' ? '➕ إضافة مطعم جديد' : '➕ Add New Restaurant'}
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'rgb(55 65 81)',
                                margin: 0
                            }}>
                                {editingRestaurant 
                                    ? (language === 'ar' ? 'تعديل المطعم' : 'Edit Restaurant')
                                    : (language === 'ar' ? 'إضافة مطعم جديد' : 'Add New Restaurant')
                                }
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingRestaurant(null);
                                    resetForm();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'rgb(107 114 128)'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'اسم المطعم (عربي)' : 'Restaurant Name (Arabic)'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                        required
                                        placeholder={language === 'ar' ? 'أدخل اسم المطعم بالعربية' : 'Enter restaurant name in Arabic'}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'اسم المطعم (إنجليزي)' : 'Restaurant Name (English)'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                                        required
                                        placeholder={language === 'ar' ? 'أدخل اسم المطعم بالإنجليزية' : 'Enter restaurant name in English'}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                                    </label>
                                    <textarea
                                        value={formData.description_ar}
                                        onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                                    </label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📞 {language === 'ar' ? 'الهاتف' : 'Phone'}
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📧 {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📍 {language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address_ar}
                                        onChange={(e) => setFormData({...formData, address_ar: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        📍 {language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address_en}
                                        onChange={(e) => setFormData({...formData, address_en: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        🗺️ {language === 'ar' ? 'المناطق' : 'Locations'}
                                    </label>
                                    <div style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        minHeight: '100px',
                                        backgroundColor: 'white'
                                    }}>
                                        {locationOptions.map(option => (
                                            <label key={option.value} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                borderRadius: '0.25rem',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                            }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={option.value}
                                                    checked={formData.locations.includes(option.value)}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        const newLocations = isChecked
                                                            ? [...formData.locations, option.value]
                                                            : formData.locations.filter(loc => loc !== option.value);
                                                        setFormData({...formData, locations: newLocations});
                                                    }}
                                                    style={{
                                                        width: '1rem',
                                                        height: '1rem',
                                                        accentColor: 'rgb(59 130 246)'
                                                    }}
                                                />
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    color: 'rgb(55 65 81)'
                                                }}>
                                                    {language === 'ar' ? option.labelAr : option.labelEn}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        🖼️ {language === 'ar' ? 'شعار المطعم' : 'Restaurant Logo'}
                                    </label>
                                    <div style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px dashed rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                        e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                                        e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                                    }}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{
                                                display: 'none'
                                            }}
                                            id="logo-upload"
                                        />
                                        <label htmlFor="logo-upload" style={{
                                            cursor: 'pointer',
                                            display: 'block'
                                        }}>
                                            {formData.logo ? (
                                                <div>
                                                    <div style={{
                                                        fontSize: '2rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        ✅
                                                    </div>
                                                    <div style={{
                                                        color: 'rgb(34 197 94)',
                                                        fontWeight: '500',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {language === 'ar' ? 'تم اختيار ملف جديد' : 'New File Selected'}
                                                    </div>
                                                    <div style={{
                                                        color: 'rgb(107 114 128)',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {formData.logo.name}
                                                    </div>
                                                </div>
                                            ) : formData.existingLogo ? (
                                                <div>
                                                    <div style={{
                                                        fontSize: '2rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        🖼️
                                                    </div>
                                                    <div style={{
                                                        color: 'rgb(59 130 246)',
                                                        fontWeight: '500',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {language === 'ar' ? 'الشعار الحالي' : 'Current Logo'}
                                                    </div>
                                                    <div style={{
                                                        color: 'rgb(107 114 128)',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {language === 'ar' ? 'اضغط لاختيار ملف جديد' : 'Click to choose new file'}
                                                    </div>
                                                    <img 
                                                        src={`/storage/${formData.existingLogo}`}
                                                        alt={language === 'ar' ? 'الشعار الحالي' : 'Current Logo'}
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '150px',
                                                            height: 'auto',
                                                            borderRadius: '0.5rem',
                                                            marginTop: '0.5rem',
                                                            border: '2px solid rgba(59, 130, 246, 0.2)'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div style={{
                                                        fontSize: '2rem',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        📁
                                                    </div>
                                                    <div style={{
                                                        color: 'rgb(59 130 246)',
                                                        fontWeight: '500',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {language === 'ar' ? 'اختر شعار المطعم' : 'Choose Restaurant Logo'}
                                                    </div>
                                                    <div style={{
                                                        color: 'rgb(107 114 128)',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {language === 'ar' ? 'PNG, JPG, JPEG حتى 5MB' : 'PNG, JPG, JPEG up to 5MB'}
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '2rem'
                            }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    style={{
                                        width: '1rem',
                                        height: '1rem'
                                    }}
                                />
                                <label htmlFor="is_active" style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(55 65 81)',
                                    cursor: 'pointer'
                                }}>
                                    {language === 'ar' ? 'مطعم نشط' : 'Active Restaurant'}
                                </label>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingRestaurant(null);
                                        resetForm();
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(107, 114, 128, 0.1)',
                                        color: 'rgb(107 114 128)',
                                        border: '1px solid rgba(107, 114, 128, 0.2)',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                                    }}
                                >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {editingRestaurant 
                                        ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                                        : (language === 'ar' ? 'إضافة المطعم' : 'Add Restaurant')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
                </>
            )}

            {/* Popup Component */}
            <Popup
                isOpen={popup.isOpen}
                onClose={closePopup}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                confirmText={language === 'ar' ? 'حسناً' : 'OK'}
                showCancel={popup.type === 'warning'}
                cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
            />
        </div>
    );
};

export default SellerRestaurants;
