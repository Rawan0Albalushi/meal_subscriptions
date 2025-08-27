import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, deliveryAddressesAPI, subscriptionsAPI, subscriptionTypesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PopupMessage from '../../components/PopupMessage';
import InteractiveMap from '../../components/InteractiveMap';

const SubscriptionForm = () => {
  const { restaurantId, subscriptionType, startDate, mealIds } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [subscriptionTypeData, setSubscriptionTypeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Popup message states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');

  // Address form (inline create)
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', address: '', phone: '', city: '' });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  // Week days mapping
  const weekDays = [
    { key: 'sunday', label: 'الأحد', icon: '🌅' },
    { key: 'monday', label: 'الاثنين', icon: '🌞' },
    { key: 'tuesday', label: 'الثلاثاء', icon: '☀️' },
    { key: 'wednesday', label: 'الأربعاء', icon: '🌤️' },
    { key: 'thursday', label: 'الخميس', icon: '🌅' }
  ];

  // Function to get date for a specific day key based on start date
  const getDateForDayKey = (dayKey) => {
    if (!startDate) return null;
    
    const start = new Date(startDate);
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const dayIndex = dayKeys.indexOf(dayKey);
    
    if (dayIndex === -1) return null;
    
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);
    
    return targetDate.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Form data
  const [formData, setFormData] = useState({
    subscriptionType: subscriptionType || 'weekly',
    startDate: startDate || '',
    deliveryAddressId: '',
    paymentMethod: 'credit_card',
    specialInstructions: ''
  });

  // Function to get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Function to check if date is a weekday
  const isWeekday = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday = 0, Thursday = 4
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant
        const restaurantResponse = await restaurantsAPI.getById(restaurantId);
        if (restaurantResponse.data.success) {
          setRestaurant(restaurantResponse.data.data);
        }

        // Fetch selected meals with days
        const mealsResponse = await restaurantsAPI.getMeals(restaurantId);
        if (mealsResponse.data.success) {
          try {
            const mealsData = JSON.parse(decodeURIComponent(mealIds || '[]'));
            const selectedMealsData = mealsData.map(({ dayKey, mealId }) => {
              const meal = mealsResponse.data.data.find(m => m.id == mealId);
              if (meal) {
                const dayInfo = weekDays.find(day => day.key === dayKey);
                return {
                  ...meal,
                  dayKey,
                  dayLabel: dayInfo?.label || dayKey,
                  dayIcon: dayInfo?.icon || '📅'
                };
              }
              return null;
            }).filter(Boolean);
            setSelectedMeals(selectedMealsData);
          } catch (e) {
            console.error('Error parsing meals data:', e);
            // Fallback to old format
            const mealIdsArray = (mealIds || '').split(',').filter(Boolean);
            const selectedMealsData = mealIdsArray
              .map(id => mealsResponse.data.data.find(m => m.id == id))
              .filter(Boolean);
            setSelectedMeals(selectedMealsData);
          }
        }

        // Fetch user's delivery addresses
        const addressesResponse = await deliveryAddressesAPI.getAll();
        if (addressesResponse.data.success) {
          setDeliveryAddresses(addressesResponse.data.data);
        }

        // Fetch subscription type data
        const subscriptionTypeResponse = await subscriptionTypesAPI.getByType(subscriptionType);
        if (subscriptionTypeResponse.data.success) {
          setSubscriptionTypeData(subscriptionTypeResponse.data.data);
        }
      } catch (e) {
        console.error('Error fetching data:', e);
        
        // Get detailed error message
        let errorMessage = 'حدث خطأ أثناء جلب البيانات';
        
        if (e.response?.data?.message) {
          errorMessage = e.response.data.message;
        } else if (e.response?.data?.error) {
          errorMessage = e.response.data.error;
        } else if (e.message) {
          errorMessage = e.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, mealIds, startDate, isAuthenticated, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const calculateTotalPrice = () => {
    if (!subscriptionTypeData) return 0;
    return subscriptionTypeData.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate start date
    const selectedDate = new Date(formData.startDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      setPopupTitle('خطأ في التاريخ');
      setPopupMessage('تاريخ البداية يجب أن يكون غداً أو بعده. لا يمكن إنشاء اشتراك ليوم اليوم.');
      setShowErrorPopup(true);
      return;
    }

    // Validate that the date is a weekday (Sunday to Thursday)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday = 5, Saturday = 6
      setPopupTitle('خطأ في التاريخ');
      setPopupMessage('تاريخ البداية يجب أن يكون يوم عمل (الأحد إلى الخميس)');
      setShowErrorPopup(true);
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);

      // Validate delivery address
      if (!formData.deliveryAddressId && deliveryAddresses.length > 0 && !addingNewAddress) {
        setPopupTitle('خطأ في العنوان');
        setPopupMessage('يرجى اختيار عنوان التوصيل أو إضافة عنوان جديد');
        setShowErrorPopup(true);
        return;
      }

      // Ensure we have a delivery address id; create one if needed
      let deliveryAddressId = formData.deliveryAddressId;
      const shouldCreateAddress = addingNewAddress || deliveryAddresses.length === 0 || !deliveryAddressId;
      if (shouldCreateAddress) {
        if (!newAddress.name || !newAddress.address || !newAddress.phone || !newAddress.city) {
          setError('يرجى إدخال بيانات العنوان كاملة');
          setSubmitting(false);
          return;
        }
        const createRes = await deliveryAddressesAPI.create({
          name: newAddress.name,
          address: newAddress.address,
          phone: newAddress.phone,
          city: newAddress.city,
          latitude: selectedLocation?.lat || null,
          longitude: selectedLocation?.lng || null
        });
        if (!createRes.data?.success) {
          const errorMsg = createRes.data?.message || 'تعذر حفظ العنوان';
          setPopupTitle('خطأ في حفظ العنوان');
          setPopupMessage(errorMsg);
          setShowErrorPopup(true);
          setSubmitting(false);
          return;
        }
        deliveryAddressId = createRes.data.data.id;
      }

      // Validate payment method
      if (!formData.paymentMethod) {
        setPopupTitle('خطأ في طريقة الدفع');
        setPopupMessage('يرجى اختيار طريقة الدفع');
        setShowErrorPopup(true);
        return;
      }

      // Validate selected meals
      if (selectedMeals.length === 0) {
        setPopupTitle('خطأ في اختيار الوجبات');
        setPopupMessage('يرجى اختيار وجبة واحدة على الأقل');
        setShowErrorPopup(true);
        return;
      }

      // Get delivery days from selected meals
      const deliveryDays = selectedMeals.map(m => m.dayKey).filter(Boolean);

      const subscriptionData = {
        restaurant_id: restaurantId,
        meal_ids: selectedMeals.map(m => m.mealId || m.id),
        delivery_address_id: deliveryAddressId,
        subscription_type: formData.subscriptionType,
        delivery_days: deliveryDays,
        start_date: formData.startDate,
        special_instructions: formData.specialInstructions,
        payment_method: formData.paymentMethod,
        total_amount: calculateTotalPrice()
      };

      const response = await subscriptionsAPI.create(subscriptionData);
      if (response.data.success) {
        // Show success popup
        setPopupTitle('تم إنشاء الاشتراك بنجاح! 🎉');
        setPopupMessage('تم إنشاء اشتراكك بنجاح. سيتم توجيهك إلى صفحة الاشتراكات لمتابعة طلبك.');
        setShowSuccessPopup(true);
      } else {
        // Show error popup
        setPopupTitle('فشل في إنشاء الاشتراك');
        setPopupMessage(response.data?.message || 'حدث خطأ أثناء إنشاء الاشتراك');
        setShowErrorPopup(true);
      }
    } catch (e) {
      console.error('Error creating subscription:', e);
      
      // Get detailed error message
      let errorMessage = 'حدث خطأ أثناء إنشاء الاشتراك';
      
      if (e.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = e.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.response?.data?.error) {
        errorMessage = e.response.data.error;
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      // Show error popup with detailed message
      setPopupTitle('فشل في إنشاء الاشتراك');
      setPopupMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button 
            onClick={() => navigate(`/restaurants/${restaurantId}`)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            العودة للمطعم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              إنشاء اشتراك جديد
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              أكمل تفاصيل اشتراكك وابدأ رحلتك مع {restaurant?.name_ar}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Summary Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ملخص الاشتراك
              </h2>
            </div>

            {/* Restaurant Info */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                  <span className="text-2xl">🏪</span>
                </div>
                <span className="text-xl font-bold">{restaurant?.name_ar}</span>
              </div>
              <p className="text-center text-white/90 leading-relaxed relative z-10">
                {restaurant?.description_ar}
              </p>
            </div>

            {/* Subscription Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-2">
                  نوع الاشتراك
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {formData.subscriptionType === 'weekly' ? 'أسبوعي' : 'شهري'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">
                  عدد الوجبات
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {selectedMeals.length}
                </div>
              </div>
            </div>

            {/* Selected Meals */}
            {selectedMeals.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  الوجبات المختارة
                </h3>
                <div className="space-y-3">
                  {selectedMeals.map((meal, index) => (
                    <div key={meal.mealId || meal.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all duration-300">
                      <div className="text-2xl">{meal.dayIcon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-indigo-600 mb-1">
                          {meal.dayLabel}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {getDateForDayKey(meal.dayKey)}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {meal.name_ar}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
              
              <div className="text-sm opacity-90 mb-2 relative z-10">
                سعر الاشتراك
              </div>
              <div className="text-3xl font-bold relative z-10">
                {calculateTotalPrice()} ريال عماني
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">✏️</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                تفاصيل الاشتراك
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Start Date Display */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  📅 تاريخ بدء الاشتراك
                </label>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-4 text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'لم يتم تحديد التاريخ'}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  🏠 عنوان التوصيل
                </label>
                
                {deliveryAddresses.length > 0 && !addingNewAddress ? (
                  <div className="space-y-4">
                    <select 
                      value={formData.deliveryAddressId} 
                      onChange={(e) => handleInputChange('deliveryAddressId', e.target.value)}
                      className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
                      required
                    >
                      <option value="">اختر عنوان التوصيل</option>
                      {deliveryAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.name} - {address.address}
                        </option>
                      ))}
                    </select>
                                         <button 
                       type="button" 
                       onClick={() => setAddingNewAddress(true)}
                       className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                     >
                       + إضافة عنوان جديد
                     </button>
                     
                     <button 
                       type="button" 
                       onClick={() => setShowMap(!showMap)}
                       className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                     >
                       🗺️ تحديد الموقع على الخريطة
                     </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          اسم العنوان
                        </label>
                        <input 
                          type="text" 
                          value={newAddress.name} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))} 
                          placeholder="مثل: المنزل، العمل" 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 outline-none"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          العنوان التفصيلي
                        </label>
                        <input 
                          type="text" 
                          value={newAddress.address} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))} 
                          placeholder="الحي، الشارع، رقم المنزل" 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 outline-none"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          المدينة
                        </label>
                        <input 
                          type="text" 
                          value={newAddress.city} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))} 
                          placeholder="الرياض، جدة، الدمام" 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 outline-none"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <input 
                          type="tel" 
                          value={newAddress.phone} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))} 
                          placeholder="05xxxxxxxx" 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 outline-none"
                          required 
                        />
                      </div>
                    </div>
                    {deliveryAddresses.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setAddingNewAddress(false)}
                        className="mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Map */}
              {showMap && (
                <div className="mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                      🗺️ تحديد موقعك على الخريطة
                    </h3>
                    <InteractiveMap 
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                      initialLat={23.5880}
                      initialLng={58.3829}
                    />
                    
                    {selectedLocation && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              الموقع المحدد:
                            </p>
                            <p className="text-xs text-gray-600">
                              خط العرض: {selectedLocation.lat.toFixed(6)}
                            </p>
                            <p className="text-xs text-gray-600">
                              خط الطول: {selectedLocation.lng.toFixed(6)}
                            </p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setSelectedLocation(null)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  📝 تعليمات خاصة
                </label>
                <textarea 
                  value={formData.specialInstructions} 
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)} 
                  placeholder="أي تعليمات خاصة للتوصيل أو تفضيلات إضافية..." 
                  rows={4} 
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl text-xl font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    جاري إنشاء الاشتراك...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🚀</span>
                    إنشاء الاشتراك
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        )}
      </div>
      
      {/* Success Popup */}
      <PopupMessage
        isVisible={showSuccessPopup}
        type="success"
        title={popupTitle}
        message={popupMessage}
        onClose={() => {
          setShowSuccessPopup(false);
          // Navigate to subscriptions page after popup closes
          navigate('/my-subscriptions');
        }}
      />
      
      {/* Error Popup */}
      <PopupMessage
        isVisible={showErrorPopup}
        type="error"
        title={popupTitle}
        message={popupMessage}
        onClose={() => {
          setShowErrorPopup(false);
        }}
      />
    </div>
  );
};

export default SubscriptionForm;

