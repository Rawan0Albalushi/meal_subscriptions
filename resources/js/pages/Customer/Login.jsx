import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error, clearError, isAuthenticated } = useAuth();
  const { t, language, dir } = useLanguage();
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    // Clear error when switching between login/register
    clearError();
    setShowSuccessMessage(false);
  }, [isLogin, clearError]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.fullName.trim()) {
      newErrors.fullName = t('fullNameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordMinLength');
    }
    
    if (!isLogin && !formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired');
    } else if (!isLogin && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
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
        
        // Handle field-specific errors
        if (result.fieldErrors) {
          console.log('Field errors:', result.fieldErrors);
          setErrors(prev => ({ ...prev, ...result.fieldErrors }));
        }
        
        // Error is already set in AuthContext and will be displayed
        // Force re-render to show error
        setTimeout(() => {
          console.log('Current error state:', error);
        }, 100);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Error is already handled by AuthContext and will be displayed
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
    // Clear general error when user starts typing
    if (error) {
      clearError();
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
          newErrors.email = t('emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = t('invalidEmail');
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = t('passwordRequired');
        } else if (value.length < 6) {
          newErrors.password = t('passwordMinLength');
        } else {
          delete newErrors.password;
        }
        break;
      case 'fullName':
        if (!value) {
          newErrors.fullName = t('fullNameRequired');
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = t('confirmPasswordRequired');
        } else if (value !== formData.password) {
          newErrors.confirmPassword = t('passwordsDoNotMatch');
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        direction: dir,
        background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
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
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              ✅
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'rgb(55 65 81)',
              marginBottom: '0.5rem'
            }}>
              {isLogin ? t('loginSuccess') : t('registrationSuccess')}
            </h3>
            <p style={{
              color: 'rgb(75 85 99)',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {isLogin ? t('redirectingToHome') : t('redirectingToHome')}
            </p>
            <div style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: 'rgb(75 85 99)',
              opacity: 0.8
            }}>
              ⏱️ {t('redirecting')}
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
            background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.75rem',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(74, 117, 124, 0.3)'
          }}>
            {language === 'ar' ? 'م' : 'M'}
          </div>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: '#4a757c'
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
            {t('loginPageDescription')}
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '1.75rem', 
                height: '1.75rem', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                color: 'white',
                flexShrink: 0
              }}>
                🍽️
              </div>
              <span style={{ color: 'rgb(55 65 81)', fontSize: '0.875rem' }}>{t('diverseMeals')}</span>
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
              <span style={{ color: 'rgb(55 65 81)', fontSize: '0.875rem' }}>{t('fixedDelivery')}</span>
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
              <span style={{ color: 'rgb(55 65 81)', fontSize: '0.875rem' }}>{t('securePayment')}</span>
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
          direction: dir
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
                            background: isLogin ? 'linear-gradient(135deg, #4a757c, #ba6c5d)' : 'transparent',
            color: isLogin ? 'white' : '#4a757c',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                            background: !isLogin ? 'linear-gradient(135deg, #4a757c, #ba6c5d)' : 'transparent',
            color: !isLogin ? 'white' : '#4a757c',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              {t('createAccount')}
            </button>
          </div>

          <h2 style={{ 
            fontSize: 'clamp(1.25rem, 3vw, 1.875rem)', 
            fontWeight: 'bold', 
            color: '#4a757c', 
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
            {isLogin ? t('loginDescription') : t('registerDescription')}
          </p>

          {/* General Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <span>{error}</span>
              </div>
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
                  {t('fullName')}
                </label>
                <input 
                  key={`fullName-${isLogin}`}
                  type="text" 
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem',
                    borderRadius: '0.625rem',
                    border: errors.fullName ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
                  }}
                  placeholder={t('enterFullName')}
                />
                {errors.fullName && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
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
                {t('email')}
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
                  border: errors.email ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: dir === 'rtl' ? 'right' : 'left'
                }}
                placeholder={t('enterEmail')}
              />
              {errors.email && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  textAlign: dir === 'rtl' ? 'right' : 'left'
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
                {t('password')}
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
                  border: errors.password ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: dir === 'rtl' ? 'right' : 'left'
                }}
                placeholder={t('enterPassword')}
              />
              {errors.password && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  textAlign: dir === 'rtl' ? 'right' : 'left'
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
                  {t('confirmPassword')}
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
                    border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid rgb(209 213 219)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
                  }}
                  placeholder={t('confirmPasswordPlaceholder')}
                />
                {errors.confirmPassword && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    textAlign: dir === 'rtl' ? 'right' : 'left'
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
                  {t('rememberMe')}
                </label>
                <a href="#" style={{ color: '#2f6e73', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '500' }}>
                  {t('forgotPassword')}
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
                  : 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                color: 'white',
                padding: '0.875rem',
                borderRadius: '0.625rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '0.75rem',
                boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(74, 117, 124, 0.3)'
              }}
            >
              {isSubmitting 
                ? (isLogin ? t('loggingIn') : t('creatingAccount')) 
                : (isLogin ? t('login') : t('createAccount'))
              }
            </button>
          </form>

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
              {dir === 'rtl' ? '← ' : ''}{t('backToHome')}{dir === 'ltr' ? ' →' : ''}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
