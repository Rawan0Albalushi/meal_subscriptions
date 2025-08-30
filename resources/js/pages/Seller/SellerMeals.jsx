import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SellerMeals = () => {
    const { t, dir, language } = useLanguage();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        price: '',
        meal_type: 'lunch',
        delivery_time: '',
        is_available: true
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchMeals(selectedRestaurant);
        }
    }, [selectedRestaurant]);

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
                if (data.data && data.data.length > 0) {
                    setSelectedRestaurant(data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeals = async (restaurantId) => {
        try {
            const response = await fetch(`/api/seller/restaurants/${restaurantId}/meals`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMeals(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('🔍 [Frontend] بدء عملية حفظ الوجبة:', {
                isEditing: !!editingMeal,
                restaurantId: selectedRestaurant,
                mealId: editingMeal?.id,
                formData: formData,
                hasImage: !!selectedImage,
                imageName: selectedImage?.name,
                imageSize: selectedImage?.size
            });

            const formDataToSend = new FormData();
            
            // إضافة البيانات النصية
            formDataToSend.append('name_ar', formData.name_ar);
            formDataToSend.append('name_en', formData.name_en);
            formDataToSend.append('description_ar', formData.description_ar);
            formDataToSend.append('description_en', formData.description_en);
            formDataToSend.append('price', parseFloat(formData.price));
            formDataToSend.append('meal_type', formData.meal_type);
            formDataToSend.append('delivery_time', formData.delivery_time);
            formDataToSend.append('is_available', formData.is_available ? '1' : '0');
            
            // إضافة الصورة إذا تم اختيارها
            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
                console.log('📸 [Frontend] تم إضافة الصورة للطلب:', {
                    name: selectedImage.name,
                    size: selectedImage.size,
                    type: selectedImage.type
                });
            }

            const url = editingMeal 
                ? `/api/seller/restaurants/${selectedRestaurant}/meals/${editingMeal.id}`
                : `/api/seller/restaurants/${selectedRestaurant}/meals`;
            
            const method = editingMeal ? 'PUT' : 'POST';

            console.log('🌐 [Frontend] إرسال الطلب:', {
                url: url,
                method: method,
                hasAuthToken: !!localStorage.getItem('auth_token')
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    // لا نضع Content-Type هنا لأن FormData يضعه تلقائياً مع boundary
                },
                body: formDataToSend
            });

            console.log('📡 [Frontend] استلام الرد:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ [Frontend] تم حفظ الوجبة بنجاح:', result);
                
                setShowAddModal(false);
                setEditingMeal(null);
                resetForm();
                fetchMeals(selectedRestaurant);
            } else {
                const errorData = await response.json();
                console.error('❌ [Frontend] خطأ في حفظ الوجبة:', errorData);
                alert(errorData.message || 'حدث خطأ في حفظ الوجبة');
            }
        } catch (error) {
            console.error('💥 [Frontend] خطأ غير متوقع في حفظ الوجبة:', error);
            alert('حدث خطأ في حفظ الوجبة');
        }
    };

    const handleEdit = (meal) => {
        setEditingMeal(meal);
        setFormData({
            name_ar: meal.name_ar,
            name_en: meal.name_en,
            description_ar: meal.description_ar || '',
            description_en: meal.description_en || '',
            price: meal.price.toString(),
            meal_type: meal.meal_type,
            delivery_time: meal.delivery_time ? meal.delivery_time.substring(0, 5) : '',
            is_available: meal.is_available,
        });
        setSelectedImage(null);
        setImagePreview(meal.image ? `/storage/${meal.image}` : null);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الوجبة؟' : 'Are you sure you want to delete this meal?')) {
            return;
        }

        try {
            const response = await fetch(`/api/seller/restaurants/${selectedRestaurant}/meals/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchMeals(selectedRestaurant);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'حدث خطأ في حذف الوجبة');
            }
        } catch (error) {
            console.error('Error deleting meal:', error);
            alert('حدث خطأ في حذف الوجبة');
        }
    };

    const resetForm = () => {
        setFormData({
            name_ar: '',
            name_en: '',
            description_ar: '',
            description_en: '',
            price: '',
            meal_type: 'lunch',
            delivery_time: '',
            is_available: true
        });
        setSelectedImage(null);
        setImagePreview(null);
    };

    const openAddModal = () => {
        setEditingMeal(null);
        resetForm();
        setShowAddModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('📸 [Frontend] تم اختيار صورة جديدة:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: new Date(file.lastModified).toISOString()
            });

            // التحقق من حجم الملف
            if (file.size > 2 * 1024 * 1024) { // 2MB
                console.warn('⚠️ [Frontend] حجم الصورة كبير جداً:', {
                    size: file.size,
                    maxSize: 2 * 1024 * 1024
                });
                alert('حجم الصورة يجب أن يكون أقل من 2MB');
                return;
            }

            // التحقق من نوع الملف
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                console.warn('⚠️ [Frontend] نوع الملف غير مدعوم:', {
                    type: file.type,
                    allowedTypes: allowedTypes
                });
                alert('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, أو GIF');
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
                console.log('🖼️ [Frontend] تم إنشاء معاينة الصورة');
            };
            reader.onerror = (error) => {
                console.error('❌ [Frontend] خطأ في قراءة الصورة:', error);
            };
            reader.readAsDataURL(file);
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
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.5rem'
                        }}>
                            {language === 'ar' ? 'إدارة الوجبات' : 'Meals Management'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة وجبات مطاعمك وإضافة وجبات جديدة'
                                : 'Manage your restaurant meals and add new ones'
                            }
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        ➕ {language === 'ar' ? 'إضافة وجبة جديدة' : 'Add New Meal'}
                    </button>
                </div>

                {/* Restaurant Selector */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'rgb(55 65 81)'
                    }}>
                        🏪 {language === 'ar' ? 'اختر المطعم' : 'Select Restaurant'}
                    </label>
                    <select
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            background: 'white'
                        }}
                    >
                        <option value="">
                            {language === 'ar' ? '-- اختر المطعم --' : '-- Select Restaurant --'}
                        </option>
                        {restaurants.map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Meals Display */}
            {selectedRestaurant && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {meals.map((meal) => (
                        <div
                            key={meal.id}
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
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                {meal.image ? (
                                    <div style={{
                                        width: '8rem',
                                        height: '6rem',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)',
                                        border: '2px solid rgba(79, 70, 229, 0.1)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.2)';
                                    }}>
                                        <img 
                                            src={`/storage/${meal.image}`}
                                            alt={language === 'ar' ? meal.name_ar : meal.name_en}
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
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: meal.is_available 
                                                ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            display: 'none',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem',
                                            color: 'white'
                                        }}>
                                            🍽️
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '8rem',
                                        height: '6rem',
                                        background: meal.is_available 
                                            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.2)',
                                        border: '2px solid rgba(79, 70, 229, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.2)';
                                    }}>
                                        🍽️
                                    </div>
                                )}
                                <div>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: 'rgb(55 65 81)',
                                        margin: 0,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {language === 'ar' ? meal.name_ar : meal.name_en}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: meal.is_available 
                                                ? 'rgba(34, 197, 94, 0.1)' 
                                                : 'rgba(239, 68, 68, 0.1)',
                                            color: meal.is_available 
                                                ? 'rgb(34 197 94)' 
                                                : 'rgb(239 68 68)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {meal.is_available 
                                                ? (language === 'ar' ? 'متاح' : 'Available')
                                                : (language === 'ar' ? 'غير متاح' : 'Unavailable')
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                color: 'rgb(107 114 128)',
                                fontSize: '0.875rem',
                                margin: 0,
                                marginBottom: '1rem',
                                lineHeight: 1.5
                            }}>
                                {language === 'ar' ? meal.description_ar : meal.description_en}
                            </p>
                            
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.75rem',
                                    fontSize: '0.75rem',
                                    flex: 1
                                }}>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        💰 {language === 'ar' ? 'السعر' : 'Price'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem',
                                        fontWeight: '600'
                                    }}>
                                        {meal.price} {language === 'ar' ? 'ريال' : 'OMR'}
                                    </div>
                                </div>
                                <div>
                                    <span style={{
                                        color: 'rgb(107 114 128)',
                                        fontWeight: '500'
                                    }}>
                                        ⏰ {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}:
                                    </span>
                                    <div style={{
                                        color: 'rgb(55 65 81)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {meal.delivery_time ? meal.delivery_time.substring(0, 5) : (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <button
                                    onClick={() => handleEdit(meal)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(79, 70, 229, 0.1)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    title={language === 'ar' ? 'تعديل' : 'Edit'}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(meal.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    title={language === 'ar' ? 'حذف' : 'Delete'}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {selectedRestaurant && meals.length === 0 && (
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
                        🍽️
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد وجبات' : 'No Meals'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'لا توجد وجبات لهذا المطعم بعد'
                            : 'No meals available for this restaurant yet'
                        }
                    </p>
                </div>
            )}

            {!selectedRestaurant && restaurants.length === 0 && (
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
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'يجب عليك إضافة مطعم أولاً قبل إضافة الوجبات'
                            : 'You need to add a restaurant first before adding meals'
                        }
                    </p>
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
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
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
                                {editingMeal 
                                    ? (language === 'ar' ? 'تعديل الوجبة' : 'Edit Meal')
                                    : (language === 'ar' ? 'إضافة وجبة جديدة' : 'Add New Meal')
                                }
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
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
                                        {language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                        required
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
                                        {language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                                        required
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
                                        {language === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}
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
                                        {language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}
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

                            {/* Image Upload Section */}
                            <div style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    📸 {language === 'ar' ? 'صورة الوجبة' : 'Meal Image'}
                                </label>
                                
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div style={{
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <img 
                                            src={imagePreview} 
                                            alt={language === 'ar' ? 'معاينة الصورة' : 'Image Preview'}
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '200px',
                                                borderRadius: '0.5rem',
                                                border: '2px solid rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </div>
                                )}
                                
                                {/* File Input */}
                                <div style={{
                                    border: '2px dashed rgba(0, 0, 0, 0.1)',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    background: 'rgba(0, 0, 0, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                                    e.target.style.background = 'rgba(0, 0, 0, 0.02)';
                                }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{
                                            display: 'none'
                                        }}
                                        id="meal-image-input"
                                    />
                                    <label 
                                        htmlFor="meal-image-input"
                                        style={{
                                            cursor: 'pointer',
                                            display: 'block'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '2rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            📷
                                        </div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: 'rgb(107 114 128)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {language === 'ar' 
                                                ? 'انقر لاختيار صورة أو اسحب الصورة هنا'
                                                : 'Click to select image or drag image here'
                                            }
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'rgb(156 163 175)'
                                        }}>
                                            {language === 'ar' 
                                                ? 'JPG, PNG, GIF حتى 2MB'
                                                : 'JPG, PNG, GIF up to 2MB'
                                            }
                                        </div>
                                    </label>
                                </div>
                                
                                {/* Remove Image Button */}
                                {(selectedImage || imagePreview) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setImagePreview(null);
                                        }}
                                        style={{
                                            marginTop: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'rgb(239 68 68)',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️ {language === 'ar' ? 'إزالة الصورة' : 'Remove Image'}
                                    </button>
                                )}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
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
                                        {language === 'ar' ? 'نوع الوجبة' : 'Meal Type'} *
                                    </label>
                                    <select
                                        value={formData.meal_type}
                                        onChange={(e) => setFormData({...formData, meal_type: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="breakfast">{language === 'ar' ? 'فطور' : 'Breakfast'}</option>
                                        <option value="lunch">{language === 'ar' ? 'غداء' : 'Lunch'}</option>
                                        <option value="dinner">{language === 'ar' ? 'عشاء' : 'Dinner'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'السعر' : 'Price'} *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
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
                                        {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'} *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.delivery_time}
                                        onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
                                        required
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
                                marginBottom: '2rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {language === 'ar' ? 'الحالة' : 'Status'}
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                                        style={{
                                            width: '1rem',
                                            height: '1rem'
                                        }}
                                    />
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'rgb(55 65 81)'
                                    }}>
                                        {language === 'ar' ? 'متاح' : 'Available'}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(107, 114, 128, 0.1)',
                                        color: 'rgb(107 114 128)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
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
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingMeal 
                                        ? (language === 'ar' ? 'تحديث' : 'Update')
                                        : (language === 'ar' ? 'إضافة' : 'Add')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerMeals;
