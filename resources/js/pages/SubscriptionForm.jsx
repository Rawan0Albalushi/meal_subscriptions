import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsAPI, deliveryAddressesAPI, subscriptionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionForm = () => {
  const { restaurantId, mealId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    subscriptionType: 'weekly',
    startDate: '',
    deliveryDays: [],
    deliveryAddressId: '',
    paymentMethod: 'credit_card',
    specialInstructions: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant and meal data
        const restaurantResponse = await restaurantsAPI.getById(restaurantId);
        if (restaurantResponse.data.success) {
          setRestaurant(restaurantResponse.data.data);
        }

        const mealsResponse = await restaurantsAPI.getMeals(restaurantId);
        if (mealsResponse.data.success) {
          const meal = mealsResponse.data.data.find(m => m.id == mealId);
          setSelectedMeal(meal);
        }

        // Fetch user's delivery addresses
        const addressesResponse = await deliveryAddressesAPI.getAll();
        if (addressesResponse.data.success) {
          setDeliveryAddresses(addressesResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, mealId, isAuthenticated, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day)
        ? prev.deliveryDays.filter(d => d !== day)
        : [...prev.deliveryDays, day]
    }));
  };

  const calculateTotalPrice = () => {
    if (!selectedMeal) return 0;
    
    const daysCount = formData.deliveryDays.length;
    const weeksCount = formData.subscriptionType === 'weekly' ? 1 : 4;
    
    return selectedMeal.price * daysCount * weeksCount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.deliveryDays.length === 0) {
      setError('يرجى اختيار أيام التوصيل');
      return;
    }

    if (!formData.deliveryAddressId) {
      setError('يرجى اختيار عنوان التوصيل');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const subscriptionData = {
        restaurant_id: restaurantId,
        meal_id: mealId,
        delivery_address_id: formData.deliveryAddressId,
        subscription_type: formData.subscriptionType,
        delivery_days: formData.deliveryDays,
        start_date: formData.startDate,
        special_instructions: formData.specialInstructions,
        payment_method: formData.paymentMethod,
        total_amount: calculateTotalPrice()
      };

      const response = await subscriptionsAPI.create(subscriptionData);
      
      if (response.data.success) {
        // Redirect to subscription detail page
        navigate(`/subscriptions/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الاشتراك');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && !submitting) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>{error}</p>
          <button 
            onClick={() => navigate(`/restaurants/${restaurantId}`)}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            العودة للمطعم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      direction: 'rtl',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'rgb(79 70 229)'
          }}>
            إنشاء اشتراك جديد
          </h1>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 3vw, 1.125rem)', 
            color: 'rgb(75 85 99)',
            lineHeight: '1.6'
          }}>
            اختر تفاصيل اشتراكك وابدأ رحلتك مع {restaurant?.name_ar}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.5)'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Selected Meal */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem', 
                  color: 'rgb(79 70 229)' 
                }}>
                  الوجبة المختارة
                </h3>
                {selectedMeal && (
                  <div style={{
                    background: 'rgb(249 250 251)',
                    borderRadius: '0.75rem',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    border: '1px solid rgb(229 231 235)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '1rem', 
                      marginBottom: '1rem' 
                    }}>
                      <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)' }}>🍽️</div>
                      <div style={{ width: '100%' }}>
                        <h4 style={{ 
                          fontSize: 'clamp(1rem, 3vw, 1.125rem)', 
                          fontWeight: 'bold', 
                          marginBottom: '0.5rem',
                          color: 'rgb(79 70 229)'
                        }}>
                          {selectedMeal.name_ar}
                        </h4>
                        <p style={{ 
                          fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                          color: 'rgb(75 85 99)',
                          lineHeight: '1.6'
                        }}>
                          {selectedMeal.description_ar}
                        </p>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.75rem',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', 
                        fontWeight: 'bold', 
                        color: 'rgb(79 70 229)' 
                      }}>
                        {selectedMeal.price} ريال
                      </span>
                      <span style={{ 
                        padding: 'clamp(0.25rem, 2vw, 0.375rem) clamp(0.5rem, 3vw, 0.75rem)', 
                        borderRadius: '1rem', 
                        fontSize: 'clamp(0.7rem, 2vw, 0.75rem)',
                        fontWeight: '600',
                        background: selectedMeal.meal_type === 'breakfast' ? '#fef3c7' : 
                                   selectedMeal.meal_type === 'lunch' ? '#dbeafe' : '#f3e8ff',
                        color: selectedMeal.meal_type === 'breakfast' ? '#92400e' : 
                               selectedMeal.meal_type === 'lunch' ? '#1e40af' : '#7c3aed',
                        border: '1px solid',
                        borderColor: selectedMeal.meal_type === 'breakfast' ? '#f59e0b' : 
                                   selectedMeal.meal_type === 'lunch' ? '#3b82f6' : '#8b5cf6'
                      }}>
                        {selectedMeal.meal_type === 'breakfast' ? 'فطور' : 
                         selectedMeal.meal_type === 'lunch' ? 'غداء' : 'عشاء'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Type */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgb(79 70 229)' }}>
                  نوع الاشتراك
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { value: 'weekly', label: 'أسبوعي', description: '4 وجبات في الأسبوع' },
                    { value: 'monthly', label: 'شهري', description: '16 وجبة في الشهر' }
                  ].map((type) => (
                    <label key={type.value} style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: formData.subscriptionType === type.value ? '2px solid rgb(79 70 229)' : '1px solid rgb(229 231 235)',
                      background: formData.subscriptionType === type.value ? 'rgb(238 242 255)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        name="subscriptionType"
                        value={type.value}
                        checked={formData.subscriptionType === type.value}
                        onChange={(e) => handleInputChange('subscriptionType', e.target.value)}
                        style={{ display: 'none' }}
                      />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {type.label}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgb(79 70 229)' }}>
                  تاريخ بداية الاشتراك
                </h3>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgb(229 231 235)',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                  required
                />
              </div>

              {/* Delivery Days */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgb(79 70 229)' }}>
                  أيام التوصيل
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { value: 'sunday', label: 'الأحد' },
                    { value: 'monday', label: 'الاثنين' },
                    { value: 'tuesday', label: 'الثلاثاء' },
                    { value: 'wednesday', label: 'الأربعاء' },
                    { value: 'thursday', label: 'الخميس' },
                    { value: 'friday', label: 'الجمعة' },
                    { value: 'saturday', label: 'السبت' }
                  ].map((day) => (
                    <label key={day.value} style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: formData.deliveryDays.includes(day.value) ? '2px solid rgb(79 70 229)' : '1px solid rgb(229 231 235)',
                      background: formData.deliveryDays.includes(day.value) ? 'rgb(238 242 255)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.deliveryDays.includes(day.value)}
                        onChange={() => handleDeliveryDayToggle(day.value)}
                        style={{ display: 'none' }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgb(79 70 229)' }}>
                  عنوان التوصيل
                </h3>
                {deliveryAddresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: 'rgb(249 250 251)', borderRadius: '0.75rem' }}>
                    <p style={{ color: 'rgb(75 85 99)', marginBottom: '1rem' }}>لا توجد عناوين توصيل</p>
                    <button
                      type="button"
                      onClick={() => navigate('/delivery-addresses')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      إضافة عنوان جديد
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {deliveryAddresses.map((address) => (
                      <label key={address.id} style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: formData.deliveryAddressId == address.id ? '2px solid rgb(79 70 229)' : '1px solid rgb(229 231 235)',
                        background: formData.deliveryAddressId == address.id ? 'rgb(238 242 255)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="radio"
                          name="deliveryAddress"
                          value={address.id}
                          checked={formData.deliveryAddressId == address.id}
                          onChange={(e) => handleInputChange('deliveryAddressId', e.target.value)}
                          style={{ display: 'none' }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {address.name}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                            {address.address}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'rgb(75 85 99)' }}>
                            📞 {address.phone}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgb(79 70 229)' }}>
                  طريقة الدفع
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { value: 'credit_card', label: 'بطاقة ائتمان', icon: '💳' },
                    { value: 'cash', label: 'نقداً', icon: '💰' },
                    { value: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦' }
                  ].map((method) => (
                    <label key={method.value} style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: formData.paymentMethod === method.value ? '2px solid rgb(79 70 229)' : '1px solid rgb(229 231 235)',
                      background: formData.paymentMethod === method.value ? 'rgb(238 242 255)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        style={{ display: 'none' }}
                      />
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{method.icon}</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{method.label}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgb(79 70 229)' }}>
                  تعليمات خاصة (اختياري)
                </h3>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="أي تعليمات خاصة للتوصيل..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgb(229 231 235)',
                    fontSize: '1rem',
                    background: 'white',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  color: '#dc2626',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: submitting ? 'rgb(156 163 175)' : 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                  color: 'white',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {submitting ? 'جاري إنشاء الاشتراك...' : 'إنشاء الاشتراك'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            height: 'fit-content',
            position: 'sticky',
            top: '6rem'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem', 
              color: 'rgb(79 70 229)' 
            }}>
              ملخص الاشتراك
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgb(243 244 246)'
                }}>
                  <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>المطعم:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    color: 'rgb(79 70 229)'
                  }}>{restaurant?.name_ar}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgb(243 244 246)'
                }}>
                  <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>الوجبة:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    color: 'rgb(79 70 229)'
                  }}>{selectedMeal?.name_ar}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgb(243 244 246)'
                }}>
                  <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>نوع الاشتراك:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    color: 'rgb(79 70 229)'
                  }}>
                    {formData.subscriptionType === 'weekly' ? 'أسبوعي' : 'شهري'}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgb(243 244 246)'
                }}>
                  <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>أيام التوصيل:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    color: 'rgb(79 70 229)'
                  }}>
                    {formData.deliveryDays.length} يوم
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgb(243 244 246)'
                }}>
                  <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>سعر الوجبة:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    color: 'rgb(79 70 229)'
                  }}>{selectedMeal?.price} ريال</span>
                </div>
              </div>
            </div>

            <div style={{ 
              borderTop: '2px solid rgb(79 70 229)', 
              paddingTop: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ 
                  fontSize: 'clamp(1rem, 3vw, 1.125rem)', 
                  fontWeight: 'bold',
                  color: 'rgb(31 41 55)'
                }}>المجموع:</span>
                <span style={{ 
                  fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', 
                  fontWeight: 'bold', 
                  color: 'rgb(79 70 229)' 
                }}>
                  {calculateTotalPrice()} ريال
                </span>
              </div>
            </div>

            <div style={{ 
              fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
              color: 'rgb(75 85 99)', 
              lineHeight: '1.6',
              textAlign: 'center',
              padding: '0.75rem',
              background: 'rgb(249 250 251)',
              borderRadius: '0.5rem',
              border: '1px solid rgb(229 231 235)'
            }}>
              * سيتم خصم المبلغ عند تأكيد الاشتراك
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;

