import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error, clearError, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Clear form on component mount and when switching between login/register
  useEffect(() => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setTouched({});
  }, [isLogin]);

  // Also clear on initial mount
  useEffect(() => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setTouched({});
  }, []);

  // Redirect if already authenticated (but not during registration success)
  useEffect(() => {
    // Check if user is actually authenticated with valid token
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (isAuthenticated && token && user && !showSuccessMessage) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, showSuccessMessage]);

  // Clear auth error when switching forms
  useEffect(() => {
    clearError();
    setShowSuccessMessage(false);
  }, [isLogin, clearError]);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    // Full name validation for registration
    if (!isLogin && !formData.fullName) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }
    
    // Confirm password validation for registration
    if (!isLogin && !formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword
        });
      }

      console.log('Auth result:', result);
      if (result.success) {
        if (isLogin) {
          // Show success message for login
          console.log('Showing login success message');
          setShowSuccessMessage(true);
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            console.log('Redirecting to home page');
            navigate('/');
          }, 2000);
        } else {
          // Show success message for registration
          console.log('Showing success message');
          setShowSuccessMessage(true);
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            console.log('Redirecting to home page');
            navigate('/');
          }, 2000);
        }
      } else {
        console.log('Auth failed:', result.error);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Validate field immediately if it has been touched
    if (touched[field]) {
      validateField(field, value);
    }
    // If password changed, also validate confirm password
    if (field === 'password' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'كلمة المرور مطلوبة';
        } else if (value.length < 6) {
          newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        } else {
          delete newErrors.password;
        }
        break;
      case 'fullName':
        if (!value) {
          newErrors.fullName = 'الاسم الكامل مطلوب';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Validate field on blur
    validateField(field, formData[field]);
  };



  return (
    <div 
      key={`login-${isLogin}`}
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        direction: 'rtl'
      }}
    >
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="success-icon" style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              {isLogin ? '🎉' : '✅'}
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'rgb(34 197 94)',
              marginBottom: '0.5rem'
            }}>
              {isLogin ? 'تم تسجيل الدخول بنجاح!' : 'تم التسجيل بنجاح!'}
            </h2>
            <p style={{
              color: 'rgb(75 85 99)',
              marginBottom: '1rem'
            }}>
              سيتم توجيهك للصفحة الرئيسية خلال لحظات...
            </p>
                                          <div style={{
                  width: '100%',
                  height: '0.25rem',
                  background: 'rgb(229 231 235)',
                  borderRadius: '0.125rem',
                  overflow: 'hidden'
                }}>
                  <div className="progress-bar" style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))',
                    transformOrigin: 'left'
                  }}></div>
                </div>
            <div style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: 'rgb(75 85 99)',
              opacity: 0.8
            }}>
              ⏱️ جاري التوجيه...
            </div>
          </div>
        </div>
      )}


      <div style={{ 
        maxWidth: '900px', 
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        
        {/* Left Side - Welcome Section */}
        <div style={{ 
          textAlign: 'center',
          color: 'rgb(55 65 81)',
          padding: '1.5rem'
        }}>
          <div style={{ 
            height: '3.5rem', 
            width: '3.5rem', 
            borderRadius: '1.25rem', 
            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.75rem',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)'
          }}>
            م
          </div>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'rgb(79 70 229)'
          }}>
                                    {t('welcomeTo')}
                          <span style={{ display: 'block', marginTop: '0.5rem' }}>
                {t('mealSubscriptions')}
              </span>
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            color: 'rgb(75 85 99)',
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            {isLogin 
              ? 'سجل دخولك للوصول إلى اشتراكاتك المفضلة'
              : 'انضم إلينا واحصل على أفضل الوجبات المميزة'
            }
          </p>
          
          {/* Features List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            textAlign: 'right'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                color: 'white',
                flexShrink: 0
              }}>
                ✅
              </div>
              <span style={{ color: 'rgb(55 65 81)', fontSize: '0.875rem' }}>وجبات متنوعة من أفضل المطاعم</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgb(59 130 246), rgb(37 99 235))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                color: 'white',
                flexShrink: 0
              }}>
                ⏰
              </div>
              <span style={{ color: 'rgb(55 65 81)', fontSize: '0.875rem' }}>توصيل في الوقت المحدد</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgb(168 85 247), rgb(147 51 234))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                color: 'white',
                flexShrink: 0
              }}>
                💳
              </div>
              <span style={{ color: 'rgb(55 65 81)', fontSize: '0.875rem' }}>دفع آمن وسهل</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          direction: 'rtl'
        }}>
          {/* Toggle Buttons */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '0.75rem',
            padding: '0.25rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: isLogin ? 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))' : 'transparent',
                color: isLogin ? 'white' : 'rgb(79 70 229)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: !isLogin ? 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))' : 'transparent',
                color: !isLogin ? 'white' : 'rgb(79 70 229)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              إنشاء حساب
            </button>
          </div>

          <h2 style={{ 
            fontSize: 'clamp(1.25rem, 3vw, 1.875rem)', 
            fontWeight: 'bold', 
            color: 'rgb(79 70 229)', 
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
                            {isLogin ? t('welcomeBack') + '!' : t('joinUs')}
          </h2>
          <p style={{ 
            color: 'rgb(75 85 99)', 
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {isLogin ? 'سجل دخولك للوصول إلى اشتراكاتك' : 'أنشئ حسابك الجديد واستمتع بخدماتنا'}
          </p>

          {/* Backend Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form 
            key={`form-${isLogin}`}
            noValidate
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {!isLogin && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: 'rgb(55 65 81)', 
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}>
                  الاسم الكامل
                </label>
                <input 
                  key={`fullName-${isLogin}`}
                  type="text" 
                  autoComplete="off"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem',
                    borderRadius: '0.625rem',
                    border: touched.fullName && errors.fullName ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    textAlign: 'right'
                  }}
                  placeholder="أدخل اسمك الكامل"
                />
                {touched.fullName && errors.fullName && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    textAlign: 'right'
                  }}>
                    {errors.fullName}
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'rgb(55 65 81)', 
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                البريد الإلكتروني
              </label>
              <input 
                key={`email-${isLogin}`}
                type="email" 
                autoComplete="off"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '0.625rem',
                  border: touched.email && errors.email ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'right'
                }}
                placeholder="أدخل بريدك الإلكتروني"
              />
              {touched.email && errors.email && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  textAlign: 'right'
                }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'rgb(55 65 81)', 
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                كلمة المرور
              </label>
              <input 
                key={`password-${isLogin}`}
                type="password" 
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '0.625rem',
                  border: touched.password && errors.password ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'right'
                }}
                placeholder="أدخل كلمة المرور"
              />
              {touched.password && errors.password && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  textAlign: 'right'
                }}>
                  {errors.password}
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: 'rgb(55 65 81)', 
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}>
                  تأكيد كلمة المرور
                </label>
                <input 
                  key={`confirmPassword-${isLogin}`}
                  type="password" 
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem',
                    borderRadius: '0.625rem',
                    border: touched.confirmPassword && errors.confirmPassword ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    textAlign: 'right'
                  }}
                  placeholder="أعد إدخال كلمة المرور"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    textAlign: 'right'
                  }}>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {isLogin && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgb(75 85 99)' }}>
                  <input type="checkbox" style={{ width: '0.875rem', height: '0.875rem' }} />
                  تذكرني
                </label>
                <a href="#" style={{ color: 'rgb(79 70 229)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '500' }}>
                  نسيت كلمة المرور؟
                </a>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: isSubmitting 
                  ? 'rgb(156 163 175)' 
                  : 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
                color: 'white',
                padding: '0.875rem',
                borderRadius: '0.625rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '0.75rem',
                boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(79, 70, 229, 0.3)'
              }}
            >
              {isSubmitting 
                ? (isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...') 
                : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')
              }
            </button>
          </form>

          {/* Social Login */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgb(209 213 219)' }}></div>
              <span style={{ color: 'rgb(75 85 99)', fontSize: '0.75rem' }}>أو</span>
              <div style={{ flex: 1, height: '1px', background: 'rgb(209 213 219)' }}></div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.625rem',
                borderRadius: '0.625rem',
                border: '1px solid rgb(209 213 219)',
                background: 'white',
                color: 'rgb(55 65 81)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem'
              }}>
                <span style={{ fontSize: '1rem' }}>🔍</span>
                Google
              </button>
              <button style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.625rem',
                borderRadius: '0.625rem',
                border: '1px solid rgb(209 213 219)',
                background: 'white',
                color: 'rgb(55 65 81)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem'
              }}>
                <span style={{ fontSize: '1rem' }}>🍎</span>
                Apple
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/" style={{ 
              color: 'rgb(75 85 99)', 
              textDecoration: 'none', 
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem'
            }}>
              ← العودة للصفحة الرئيسية
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
