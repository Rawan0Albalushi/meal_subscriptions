import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, deliveryAddressesAPI, subscriptionsAPI, subscriptionTypesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import PopupMessage from '../../components/PopupMessage';

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
          city: newAddress.city
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>{error}</p>
          <button onClick={() => navigate(`/restaurants/${restaurantId}`)} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>العودة للمطعم</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      direction: 'rtl',
      overflowX: 'hidden',
      padding: 'clamp(1rem, 3vw, 2rem)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(2rem, 5vw, 3rem)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          padding: 'clamp(2rem, 4vw, 3rem)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ 
            fontSize: 'clamp(2rem, 6vw, 3rem)', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}>
            إنشاء اشتراك جديد
          </div>
          <p style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            margin: '0'
          }}>
            أكمل تفاصيل اشتراكك وابدأ رحلتك مع {restaurant?.name_ar}
          </p>
        </div>

        {/* Main Content */}
        <div style={{ 
          maxWidth: '700px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1rem, 3vw, 1.5rem)'
        }}>
          
          {/* Summary Card */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '1.5rem', 
            padding: 'clamp(2rem, 4vw, 2.5rem)', 
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.12)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%)',
              zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                position: 'relative'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '0.75rem',
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2))'
                }}>
                  📋
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '800', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0',
                  letterSpacing: '-0.025em'
                }}>
                  ملخص الاشتراك
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '2px'
                }}></div>
              </div>

              {/* Restaurant Info */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                borderRadius: '1.25rem', 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(10px)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%'
                }}></div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    padding: '0.5rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>🏪</span>
                  </div>
                  <span style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    {restaurant?.name_ar}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  opacity: '0.9',
                  textAlign: 'center',
                  lineHeight: '1.5',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {restaurant?.description_ar}
                </div>
              </div>

              {/* Subscription Details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '1rem', 
                marginBottom: '1.5rem',
                maxWidth: '350px',
                margin: '0 auto 1.5rem auto'
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                  border: '1px solid rgba(102, 126, 234, 0.1)', 
                  borderRadius: '1rem', 
                  padding: '1.25rem',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '3px',
                    background: formData.subscriptionType === 'weekly' 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'linear-gradient(135deg, #f59e0b, #d97706)'
                  }}></div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgb(107 114 128)', 
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    نوع الاشتراك
                  </div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '800', 
                    color: 'rgb(55 65 81)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    {formData.subscriptionType === 'weekly' ? 'أسبوعي' : 'شهري'}
                  </div>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                  border: '1px solid rgba(102, 126, 234, 0.1)', 
                  borderRadius: '1rem', 
                  padding: '1.25rem',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '3px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }}></div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgb(107 114 128)', 
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    عدد الوجبات
                  </div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '800', 
                    color: 'rgb(55 65 81)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    {selectedMeals.length}
                  </div>
                </div>
              </div>

              {/* Selected Meals */}
              {selectedMeals.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    marginBottom: '1rem', 
                    color: 'rgb(55 65 81)',
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    الوجبات المختارة
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '40px',
                      height: '2px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '1px'
                    }}></div>
                  </h4>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '0.75rem',
                    maxWidth: '550px',
                    margin: '0 auto'
                  }}>
                    {selectedMeals.map((meal, index) => (
                      <div key={meal.mealId || meal.id} style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        borderRadius: '1rem',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          height: '2px',
                          background: `linear-gradient(135deg, ${index % 3 === 0 ? '#10b981' : index % 3 === 1 ? '#f59e0b' : '#667eea'}, ${index % 3 === 0 ? '#059669' : index % 3 === 1 ? '#d97706' : '#764ba2'})`
                        }}></div>
                        
                        <div style={{ 
                          fontSize: '1.25rem',
                          width: '2rem',
                          textAlign: 'center',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}>
                          {meal.dayIcon}
                        </div>
                        <div style={{ flex: '1' }}>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: '700', 
                            color: 'rgb(79 70 229)',
                            marginBottom: '0.25rem',
                            letterSpacing: '-0.025em'
                          }}>
                            {meal.dayLabel}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'rgb(107 114 128)',
                            marginBottom: '0.25rem',
                            fontWeight: '400'
                          }}>
                            {getDateForDayKey(meal.dayKey)}
                          </div>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            color: 'rgb(55 65 81)',
                            marginBottom: '0.375rem',
                            fontWeight: '500'
                          }}>
                            {meal.name_ar}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                borderRadius: '1.25rem', 
                padding: '1.5rem', 
                textAlign: 'center',
                color: 'white',
                maxWidth: '280px',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(10px)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%'
                }}></div>
                
                <div style={{ 
                  fontSize: '1rem', 
                  marginBottom: '0.5rem',
                  opacity: '0.9',
                  fontWeight: '500',
                  position: 'relative',
                  zIndex: 1
                }}>
                  سعر الاشتراك
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '900',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  zIndex: 1,
                  letterSpacing: '-0.025em'
                }}>
                  {calculateTotalPrice()} ريال عماني
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '1.5rem', 
            padding: 'clamp(2rem, 4vw, 2.5rem)', 
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.12)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.03) 0%, transparent 70%)',
              zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                position: 'relative'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '0.75rem',
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2))'
                }}>
                  ✏️
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '800', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0',
                  letterSpacing: '-0.025em'
                }}>
                  تفاصيل الاشتراك
                </h3>
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '2px'
                }}></div>
              </div>

              <form onSubmit={handleSubmit}>


                {/* Selected Start Date Display */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    marginBottom: '0.75rem', 
                    color: 'rgb(55 65 81)',
                    position: 'relative'
                  }}>
                    📅 تاريخ بدء الاشتراك
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      width: '40px',
                      height: '2px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '1px'
                    }}></div>
                  </label>
                  <div style={{ 
                    padding: '1rem', 
                    borderRadius: '1rem', 
                    border: '2px solid rgba(102, 126, 234, 0.2)', 
                    fontSize: '1rem', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    color: 'rgb(55 65 81)',
                    fontWeight: '600'
                  }}>
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'لم يتم تحديد التاريخ'}
                  </div>
                </div>

                {/* Delivery Address */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    marginBottom: '0.75rem', 
                    color: 'rgb(55 65 81)',
                    position: 'relative'
                  }}>
                    🏠 عنوان التوصيل
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      width: '40px',
                      height: '2px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '1px'
                    }}></div>
                  </label>
                  
                  {deliveryAddresses.length > 0 && !addingNewAddress ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <select 
                        value={formData.deliveryAddressId} 
                        onChange={(e) => handleInputChange('deliveryAddressId', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '1rem', 
                          borderRadius: '1rem', 
                          border: '2px solid rgba(102, 126, 234, 0.1)', 
                          fontSize: '1rem', 
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgb(102, 126, 234)';
                          e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                        }}
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
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.75rem 1.25rem',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                        }}
                      >
                        + إضافة عنوان جديد
                      </button>
                    </div>
                  ) : (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                      borderRadius: '1.25rem', 
                      padding: '1.5rem',
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '1rem' 
                      }}>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            marginBottom: '0.5rem', 
                            color: 'rgb(55 65 81)'
                          }}>
                            اسم العنوان
                          </label>
                          <input 
                            type="text" 
                            value={newAddress.name} 
                            onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))} 
                            placeholder="مثل: المنزل، العمل" 
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              borderRadius: '0.75rem', 
                              border: '1px solid rgba(102, 126, 234, 0.1)', 
                              fontSize: '0.9rem', 
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'rgb(102, 126, 234)';
                              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                            }}
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            marginBottom: '0.5rem', 
                            color: 'rgb(55 65 81)'
                          }}>
                            العنوان التفصيلي
                          </label>
                          <input 
                            type="text" 
                            value={newAddress.address} 
                            onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))} 
                            placeholder="الحي، الشارع، رقم المنزل" 
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              borderRadius: '0.75rem', 
                              border: '1px solid rgba(102, 126, 234, 0.1)', 
                              fontSize: '0.9rem', 
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'rgb(102, 126, 234)';
                              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                            }}
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            marginBottom: '0.5rem', 
                            color: 'rgb(55 65 81)'
                          }}>
                            المدينة
                          </label>
                          <input 
                            type="text" 
                            value={newAddress.city} 
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))} 
                            placeholder="الرياض، جدة، الدمام" 
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              borderRadius: '0.75rem', 
                              border: '1px solid rgba(102, 126, 234, 0.1)', 
                              fontSize: '0.9rem', 
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'rgb(102, 126, 234)';
                              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                            }}
                            required 
                          />
                        </div>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            marginBottom: '0.5rem', 
                            color: 'rgb(55 65 81)'
                          }}>
                            رقم الهاتف
                          </label>
                          <input 
                            type="tel" 
                            value={newAddress.phone} 
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))} 
                            placeholder="05xxxxxxxx" 
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              borderRadius: '0.75rem', 
                              border: '1px solid rgba(102, 126, 234, 0.1)', 
                              fontSize: '0.9rem', 
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'rgb(102, 126, 234)';
                              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                            }}
                            required 
                          />
                        </div>
                      </div>
                      {deliveryAddresses.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setAddingNewAddress(false)}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 6px 15px rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                          }}
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    marginBottom: '0.75rem', 
                    color: 'rgb(55 65 81)',
                    position: 'relative'
                  }}>
                    📝 تعليمات خاصة
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      width: '40px',
                      height: '2px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '1px'
                    }}></div>
                  </label>
                  <textarea 
                    value={formData.specialInstructions} 
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)} 
                    placeholder="أي تعليمات خاصة للتوصيل أو تفضيلات إضافية..." 
                    rows={4} 
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      borderRadius: '1rem', 
                      border: '2px solid rgba(102, 126, 234, 0.1)', 
                      fontSize: '1rem', 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
                      resize: 'vertical',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgb(102, 126, 234)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: submitting ? 'rgb(156 163 175)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1.25rem',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: submitting ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.3)',
                    transform: submitting ? 'none' : 'translateY(0)',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '-0.025em'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                >
                  {submitting ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '1.25rem', 
                        height: '1.25rem', 
                        border: '2px solid transparent', 
                        borderTop: '2px solid white', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }}></div>
                      جاري إنشاء الاشتراك...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🚀</span>
                      إنشاء الاشتراك
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgb(239, 68, 68)', 
              borderRadius: '0.75rem', 
              padding: '1rem', 
              textAlign: 'center',
              color: 'rgb(239, 68, 68)',
              fontSize: '1rem'
            }}>
              {error}
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
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

