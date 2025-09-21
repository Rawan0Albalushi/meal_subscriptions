import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, deliveryAddressesAPI, subscriptionsAPI, subscriptionTypesAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import InteractiveMap from '../../components/InteractiveMap';

const SubscriptionForm = () => {
  const { restaurantId, subscriptionType, startDate, mealIds } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, language, dir } = useLanguage();
  
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
  
  // Week days mapping
  const weekDays = [
    { key: 'sunday', label: t('sunday'), icon: '🌅' },
    { key: 'monday', label: t('monday'), icon: '🌞' },
    { key: 'tuesday', label: t('tuesday'), icon: '☀️' },
    { key: 'wednesday', label: t('wednesday'), icon: '🌤️' },
    { key: 'thursday', label: t('thursday'), icon: '🌅' }
  ];

  // Function to get date for a specific day key based on start date
  const getDateForDayKey = (dayKey) => {
    if (!startDate) return null;
    
    const start = new Date(startDate);
    const dayIndex = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    // Handle monthly subscription format (e.g., "sunday_week1")
    let baseDayKey = dayKey;
    let weekOffset = 0;
    
    if (dayKey.includes('_week')) {
      const parts = dayKey.split('_week');
      baseDayKey = parts[0];
      weekOffset = parseInt(parts[1]) - 1; // Convert to 0-based index
    }
    
    const targetDayIndex = dayIndex[baseDayKey];
    if (targetDayIndex === undefined) return null;
    
    const startDayIndex = start.getDay();
    let daysToAdd = targetDayIndex - startDayIndex;
    
    // If the target day is before the start day, add 7 days
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    
    // Add weeks offset for monthly subscriptions
    daysToAdd += (weekOffset * 7);
    
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + daysToAdd);
    
    return targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

  // Function to get Date object for sorting
  const getDateObjectForDayKey = (dayKey) => {
    if (!startDate) return new Date();
    
    const start = new Date(startDate);
    const dayIndex = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    // Handle monthly subscription format (e.g., "sunday_week1")
    let baseDayKey = dayKey;
    let weekOffset = 0;
    
    if (dayKey.includes('_week')) {
      const parts = dayKey.split('_week');
      baseDayKey = parts[0];
      weekOffset = parseInt(parts[1]) - 1; // Convert to 0-based index
    }
    
    const targetDayIndex = dayIndex[baseDayKey];
    if (targetDayIndex === undefined) return new Date();
    
    const startDayIndex = start.getDay();
    let daysToAdd = targetDayIndex - startDayIndex;
    
    // If the target day is before the start day, add 7 days
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    
    // Add weeks offset for monthly subscriptions
    daysToAdd += (weekOffset * 7);
    
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + daysToAdd);
    
    return targetDate;
  };
  
  // Form data
  const [formData, setFormData] = useState({
    subscriptionType: subscriptionType || 'weekly',
    startDate: startDate || '',
    deliveryAddressId: '',
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
    return dayOfWeek >= 0 && dayOfWeek <= 3; // Sunday = 0, Wednesday = 3
  };

  // Helper function to format numbers with 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  const calculateTotalPrice = () => {
    if (!subscriptionTypeData) return '0.00';
    const subscriptionPrice = parseFloat(subscriptionTypeData.price || 0);
    const deliveryPrice = parseFloat(subscriptionTypeData.delivery_price || 0);
    return formatPrice(subscriptionPrice + deliveryPrice);
  };

  const calculateSubscriptionPrice = () => {
    if (!subscriptionTypeData) return '0.00';
    return formatPrice(subscriptionTypeData.price);
  };

  const calculateDeliveryPrice = () => {
    if (!subscriptionTypeData) return '0.00';
    return formatPrice(subscriptionTypeData.delivery_price);
  };

  const isDeliveryFree = () => {
    if (!subscriptionTypeData) return true;
    return parseFloat(subscriptionTypeData.delivery_price || 0) === 0;
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            const selectedMealsData = mealsData.map(({ dayKey, mealId, baseDayKey, deliveryDate }) => {
              const meal = mealsResponse.data.data.find(m => m.id == mealId);
              if (meal) {
                // Use baseDayKey if available (for monthly subscriptions), otherwise use dayKey
                const effectiveDayKey = baseDayKey || dayKey;
                const dayInfo = weekDays.find(day => day.key === effectiveDayKey);
                
                // For monthly subscriptions, create a more descriptive label
                let dayLabel = dayInfo?.label || effectiveDayKey;
                if (dayKey.includes('_week')) {
                  const weekNumber = dayKey.split('_week')[1];
                  dayLabel = `${dayLabel} - الأسبوع ${weekNumber}`;
                }
                
                return {
                  ...meal,
                  dayKey,
                  baseDayKey: effectiveDayKey,
                  dayLabel,
                  dayIcon: dayInfo?.icon || '📅',
                  deliveryDate
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

        // Fetch subscription type data for this restaurant
        const subscriptionTypeResponse = await subscriptionTypesAPI.getByRestaurant(restaurantId);
        if (subscriptionTypeResponse.data.success) {
          const restaurantSubscriptionTypes = subscriptionTypeResponse.data.data;
          const matchingType = restaurantSubscriptionTypes.find(type => type.type === subscriptionType);
          if (matchingType) {
            setSubscriptionTypeData(matchingType);
          } else {
            setError('نوع الاشتراك غير متوفر لهذا المطعم');
          }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate start date
    const selectedDate = new Date(formData.startDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      setPopupTitle(t('dateError'));
      setPopupMessage(t('startDateMustBeTomorrow'));
      setShowErrorPopup(true);
      return;
    }

    // Validate that the date is a weekday (Sunday to Wednesday)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6) { // Thursday = 4, Friday = 5, Saturday = 6
      setPopupTitle(t('dateError'));
      setPopupMessage(t('startDateMustBeWeekday'));
      setShowErrorPopup(true);
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);

      // Validate delivery address
      if (!formData.deliveryAddressId && deliveryAddresses.length > 0 && !addingNewAddress) {
        setPopupTitle(t('addressError'));
        setPopupMessage(t('selectDeliveryAddressOrAddNew'));
        setShowErrorPopup(true);
        return;
      }

      // Ensure we have a delivery address id; create one if needed
      let deliveryAddressId = formData.deliveryAddressId;
      const shouldCreateAddress = addingNewAddress || deliveryAddresses.length === 0 || !deliveryAddressId;
      if (shouldCreateAddress) {
        if (!newAddress.name || !newAddress.address || !newAddress.phone || !newAddress.city) {
          setError(t('enterCompleteAddressData'));
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
          const errorMsg = createRes.data?.message || t('addressSaveFailed');
          setPopupTitle(t('addressSaveError'));
          setPopupMessage(errorMsg);
          setShowErrorPopup(true);
          setSubmitting(false);
          return;
        }
        deliveryAddressId = createRes.data.data.id;
      }



      // Validate selected meals
      if (selectedMeals.length === 0) {
        setPopupTitle(t('mealsSelectionError'));
        setPopupMessage(t('selectAtLeastOneMeal'));
        setShowErrorPopup(true);
        return;
      }

      // Validate that the number of selected meals matches the subscription type meals_count
      if (subscriptionTypeData && selectedMeals.length !== subscriptionTypeData.meals_count) {
        setPopupTitle(t('mealsSelectionError'));
        setPopupMessage(t('selectRequiredMealsCount', { count: subscriptionTypeData.meals_count }));
        setShowErrorPopup(true);
        return;
      }

      // Get delivery days from selected meals
      const deliveryDays = selectedMeals.map(m => {
        // Use baseDayKey if available, otherwise extract from dayKey
        const dayKey = m.baseDayKey || m.dayKey.split('_')[0];
        
        // Ensure we're sending English day names to backend
        const dayMapping = {
          'الأحد': 'sunday',
          'الاثنين': 'monday', 
          'الثلاثاء': 'tuesday',
          'الأربعاء': 'wednesday',
          'الخميس': 'thursday',
          'الجمعة': 'friday',
          'السبت': 'saturday'
        };
        
        return dayMapping[dayKey] || dayKey;
      }).filter(Boolean);

      // Calculate total amount with proper precision
      const subscriptionPrice = parseFloat(subscriptionTypeData.price || 0);
      const deliveryPrice = parseFloat(subscriptionTypeData.delivery_price || 0);
      const totalAmount = subscriptionPrice + deliveryPrice;

      const subscriptionData = {
        restaurant_id: restaurantId,
        meal_ids: selectedMeals.map(m => m.mealId || m.id),
        delivery_address_id: deliveryAddressId,
        subscription_type: formData.subscriptionType,
        delivery_days: deliveryDays,
        start_date: formData.startDate,
        special_instructions: formData.specialInstructions,
        total_amount: totalAmount
      };

      // Use the new payment initiation flow
      const response = await subscriptionsAPI.initiatePayment(subscriptionData);
      
      if (response.data.success) {
        // Redirect to payment gateway immediately
        window.location.href = response.data.payment_link;
        return; // Exit early to prevent any other code from running
      } else {
        // Show error popup
        setPopupTitle(t('subscriptionCreationFailed'));
        setPopupMessage(response.data?.message || t('subscriptionCreationError'));
        setShowErrorPopup(true);
      }
    } catch (e) {
      console.error('Error creating subscription:', e);
      
      // Get detailed error message
      let errorMessage = t('subscriptionCreationError');
      
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
      setPopupTitle(t('subscriptionCreationFailed'));
      setPopupMessage(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(182, 84, 73, 0.05) 50%, rgba(74, 138, 143, 0.05) 100%)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{
            borderBottomColor: '#4a757c'
          }}></div>
          <p className="text-gray-600 text-lg font-medium">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(182, 84, 73, 0.05) 50%, rgba(74, 138, 143, 0.05) 100%)'
      }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button 
            onClick={() => navigate(`/restaurants/${restaurantId}`)}
            className="text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
            }}
          >
            {t('backToRestaurant')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir} style={{
      background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
    }}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4" style={{
              background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.3',
              padding: '0.5rem 0',
              minHeight: '4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {t('createNewSubscription')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('completeSubscriptionDetails')} {restaurant?.name || (language === 'ar' ? restaurant?.name_ar : restaurant?.name_en)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Form Card - Subscription Details */}
          <div className="bg-white/85 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">✏️</div>
              <h2 className="text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {t('subscriptionDetails')}
              </h2>
            </div>

            <div className="space-y-6">
              
              {/* Start Date Display */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  📅 {t('subscriptionStartDate')}
                </label>
                <div className="border-2 rounded-2xl p-4 text-center" style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(74, 138, 143, 0.05) 100%)',
                  borderColor: 'rgba(47, 110, 115, 0.2)'
                }}>
                  <div className="text-lg font-semibold text-gray-800">
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : t('dateNotSelected')}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  🏠 {t('deliveryAddress')}
                </label>
                
                {deliveryAddresses.length > 0 && !addingNewAddress ? (
                  <div className="space-y-4">
                    <select 
                      value={formData.deliveryAddressId} 
                      onChange={(e) => handleInputChange('deliveryAddressId', e.target.value)}
                      className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-lg transition-all duration-300 outline-none"
                      style={{
                        focusBorderColor: '#4a757c',
                        focusRingColor: 'rgba(47, 110, 115, 0.1)'
                      }}
                      required
                    >
                      <option value="">{t('selectDeliveryAddress')}</option>
                      {deliveryAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.name} - {address.address}
                        </option>
                      ))}
                    </select>
                                         <button 
                       type="button" 
                       onClick={() => setAddingNewAddress(true)}
                       className="w-full text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
                    }}
                     >
                       {t('addNewAddress')}
                     </button>
                     

                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('addressName')}
                        </label>
                        <input 
                          type="text" 
                          value={newAddress.name} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))} 
                          placeholder={t('addressNamePlaceholder')} 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                          style={{ 
                            '--tw-ring-color': '#4a757c',
                            '--tw-ring-opacity': '0.1'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#4a757c';
                            e.target.style.boxShadow = '0 0 0 2px rgba(74, 117, 124, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('detailedAddress')}
                        </label>
                        <input 
                          type="text" 
                          value={newAddress.address} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))} 
                          placeholder={t('detailedAddressPlaceholder')} 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                          style={{ 
                            '--tw-ring-color': '#4a757c',
                            '--tw-ring-opacity': '0.1'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#4a757c';
                            e.target.style.boxShadow = '0 0 0 2px rgba(74, 117, 124, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('city')}
                        </label>
                        <input 
                          type="text" 
                          value={newAddress.city} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))} 
                          placeholder={t('cityPlaceholder')} 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                          style={{ 
                            '--tw-ring-color': '#4a757c',
                            '--tw-ring-opacity': '0.1'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#4a757c';
                            e.target.style.boxShadow = '0 0 0 2px rgba(74, 117, 124, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('phone')}
                        </label>
                        <input 
                          type="tel" 
                          value={newAddress.phone} 
                          onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))} 
                          placeholder={t('phonePlaceholder')} 
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                          style={{ 
                            direction: 'ltr', 
                            textAlign: 'left',
                            '--tw-ring-color': '#4a757c',
                            '--tw-ring-opacity': '0.1'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#4a757c';
                            e.target.style.boxShadow = '0 0 0 2px rgba(74, 117, 124, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
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
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Map */}
              <div className="mt-6">
                                <div className="rounded-2xl p-6 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))',
                    borderColor: 'rgba(47, 110, 115, 0.2)',
                    '@media (max-width: 768px)': {
                      padding: '1rem',
                      borderRadius: '1rem',
                      marginTop: '1rem'
                    }
                  }}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center" style={{
                    '@media (max-width: 768px)': {
                      fontSize: '1rem',
                      marginBottom: '1rem'
                    }
                  }}>
                    {t('selectLocationOnMapTitle')}
                  </h3>
                  <InteractiveMap 
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                    initialLat={23.5880}
                    initialLng={58.3829}
                  />
                  
                  {selectedLocation && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-green-200" style={{
                      '@media (max-width: 768px)': {
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        marginTop: '0.75rem'
                      }
                    }}>
                      <div className="flex items-center justify-between" style={{
                        '@media (max-width: 768px)': {
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '0.5rem'
                        }
                      }}>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1" style={{
                            '@media (max-width: 768px)': {
                              fontSize: '0.875rem',
                              marginBottom: '0.25rem'
                            }
                          }}>
                            {t('selectedLocation')}
                          </p>
                          <p className="text-xs text-gray-600" style={{
                            '@media (max-width: 768px)': {
                              fontSize: '0.75rem'
                            }
                          }}>
                            {t('latitude')} {selectedLocation.lat.toFixed(6)}
                          </p>
                          <p className="text-xs text-gray-600" style={{
                            '@media (max-width: 768px)': {
                              fontSize: '0.75rem'
                            }
                          }}>
                            {t('longitude')} {selectedLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedLocation(null)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                          style={{
                            '@media (max-width: 768px)': {
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              width: '100%'
                            }
                          }}
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  {t('specialInstructions')}
                </label>
                <textarea 
                  value={formData.specialInstructions} 
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)} 
                  placeholder={t('specialInstructionsPlaceholder')} 
                  rows={4} 
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-lg transition-all duration-300 outline-none resize-none"
                  style={{ 
                    '--tw-ring-color': '#4a757c',
                    '--tw-ring-opacity': '0.1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4a757c';
                    e.target.style.boxShadow = '0 0 0 4px rgba(74, 117, 124, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Summary Card - Subscription Summary */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white/85 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                {t('subscriptionSummary')}
              </h2>
            </div>

            {/* Restaurant Info */}
            <div className="rounded-2xl p-6 text-white mb-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #4a757c, #ba6c5d)'
              }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                  <span className="text-2xl">🏪</span>
                </div>
                <span className="text-xl font-bold">{restaurant?.name || (language === 'ar' ? restaurant?.name_ar : restaurant?.name_en)}</span>
              </div>
              <p className="text-center text-white/90 leading-relaxed relative z-10">
                {restaurant?.description || (language === 'ar' ? restaurant?.description_ar : restaurant?.description_en)}
              </p>
            </div>

            {/* Subscription Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-4 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))',
                  border: '1px solid rgba(47, 110, 115, 0.2)'
                }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#4a757c' }}>
                  {t('subscriptionTypeLabel')}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {formData.subscriptionType === 'weekly' ? t('weekly') : t('monthly')}
                </div>
              </div>
              <div className="rounded-2xl p-4 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(182, 84, 73, 0.05), rgba(200, 106, 90, 0.05))',
                  border: '1px solid rgba(182, 84, 73, 0.2)'
                }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#b65449' }}>
                  {t('mealsCount')}
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
                  {t('selectedMeals')}
                </h3>
                <div className="space-y-3">
                  {selectedMeals
                    .sort((a, b) => {
                      // Prefer provided deliveryDate for stable ordering; fallback to computed
                      const dateA = a.deliveryDate ? new Date(a.deliveryDate) : getDateObjectForDayKey(a.dayKey);
                      const dateB = b.deliveryDate ? new Date(b.deliveryDate) : getDateObjectForDayKey(b.dayKey);
                      return dateA - dateB;
                    })
                    .map((meal, index) => (
                    <div key={meal.mealId || meal.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all duration-300">
                      <div className="text-2xl">{meal.dayIcon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold mb-1"
                          style={{ color: '#4a757c' }}>
                          {meal.dayLabel}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {meal.deliveryDate 
                            ? new Date(meal.deliveryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' 
                              }) 
                            : getDateForDayKey(meal.dayKey)}
                        </div>
                        <div className="font-semibold text-gray-800">
                          {language === 'ar' ? meal.name_ar : meal.name_en}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Price Details */}
            <div className="bg-gradient-to-br from-white/90 to-blue-50/50 rounded-3xl p-6 border border-white/30 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                💰 {t('priceBreakdown')}
              </h3>
              
              <div className="space-y-3">
                {/* Subscription Price */}
                <div className="flex items-center justify-between p-3 rounded-2xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))',
                    borderColor: 'rgba(47, 110, 115, 0.2)'
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #4a757c, #ba6c5d)'
                      }}>
                      📦
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium">{t('subscriptionPrice')}</div>
                      <div className="text-xs text-gray-500">{t('basePrice')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold"
                      style={{ color: '#4a757c' }}>
                      {calculateSubscriptionPrice()} {t('omaniRiyal')}
                    </div>
                  </div>
                </div>

                {/* Delivery Price */}
                <div className="flex items-center justify-between p-3 rounded-2xl border"
                  style={{
                    background: isDeliveryFree() 
                      ? 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))' 
                      : 'linear-gradient(135deg, rgba(182, 84, 73, 0.05), rgba(200, 106, 90, 0.05))',
                    borderColor: isDeliveryFree() 
                      ? 'rgba(47, 110, 115, 0.2)' 
                      : 'rgba(182, 84, 73, 0.2)'
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{
                        background: isDeliveryFree() 
                          ? 'linear-gradient(135deg, #4a757c, #ba6c5d)' 
                          : 'linear-gradient(135deg, #b65449, #c86a5a)'
                      }}>
                      🚚
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium">{t('deliveryPrice')}</div>
                      <div className="text-xs text-gray-500">
                        {isDeliveryFree() ? t('freeDelivery') : t('paidDelivery')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold"
                      style={{ 
                        color: isDeliveryFree() ? '#4a757c' : '#b65449'
                      }}>
                      {isDeliveryFree() ? t('free') : `${calculateDeliveryPrice()} ${t('omaniRiyal')}`}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 my-4"></div>

                {/* Total Amount */}
                <div className="flex items-center justify-between p-3 rounded-2xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(182, 84, 73, 0.05))',
                    borderColor: 'rgba(47, 110, 115, 0.2)'
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #4a757c, #ba6c5d)'
                      }}>
                      💰
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium">{t('totalAmount')}</div>
                      <div className="text-xs text-gray-500">{t('finalPrice')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold"
                      style={{ color: '#4a757c' }}>
                      {calculateTotalPrice()} {t('omaniRiyal')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full payment-button-elegant py-4 px-6 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                    style={{ borderColor: '#4a757c' }}></div>
                  <span style={{ color: '#4a757c' }}>{t('creatingSubscription')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg button-icon">💳</span>
                  <span className="button-text">
                    {language === 'ar' ? 'متابعة الدفع وإنشاء الاشتراك' : 'Proceed to Payment & Create Subscription'}
                  </span>
                </div>
              )}
            </button>
            </div>
          </form>
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
        show={showSuccessPopup}
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
        show={showErrorPopup}
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

