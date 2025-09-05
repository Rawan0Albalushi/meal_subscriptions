import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { paymentsAPI } from '../../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    console.log('PaymentSuccess: subscriptionId =', subscriptionId);
    
    if (!subscriptionId) {
      console.log('PaymentSuccess: No subscription ID found');
      setError(t('subscriptionIdMissing'));
      setLoading(false);
      return;
    }

    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        console.log('PaymentSuccess: Calling checkStatus API with subscriptionId =', subscriptionId);
        const response = await paymentsAPI.checkStatus(subscriptionId);
        console.log('PaymentSuccess: API response =', response);
        
        if (response.data.success) {
          console.log('PaymentSuccess: Setting payment data =', response.data.data);
          setPaymentData(response.data.data);
          
          // If payment is still pending, show a message
          if (response.data.data.status === 'pending') {
            setError(t('paymentStillProcessing'));
          }
        } else {
          console.log('PaymentSuccess: API returned success = false');
          setError(response.data.message || t('paymentVerificationFailed'));
        }
      } catch (e) {
        console.error('PaymentSuccess: Error checking payment status:', e);
        if (e.response?.status === 404) {
          setError(t('paymentSessionNotFound'));
        } else {
          setError(t('failedToVerifyPayment'));
        }
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [subscriptionId]);

  const handleContinue = () => {
    navigate('/my-subscriptions');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={dir} style={{
        background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
      }}>
        <div className="text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{
            borderBottomColor: '#4a757c'
          }}></div>
          <p className="text-gray-600 text-lg font-medium">{t('verifyingPayment')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={dir} style={{
        background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
      }}>
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-6 leading-relaxed">{error}</p>
          <div className={`flex flex-col sm:flex-row gap-3 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
            <button 
              onClick={() => window.location.reload()}
              className="text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex-1"
              style={{
                background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
              }}
            >
              {t('refresh')}
            </button>
            <button 
              onClick={() => navigate('/my-subscriptions')}
              className="text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex-1"
              style={{
                background: 'linear-gradient(135deg, #ba6c5d 0%, #4a757c 100%)'
              }}
            >
              {t('goToSubscriptions')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir} style={{
      background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
    }}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">✅</div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`} style={{
              background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {t('paymentSuccessful')}
            </h1>
            <p className={`text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>
              {t('paymentSuccessMessage')}
            </p>
          </div>
        </div>

        {/* Payment Details */}
        {paymentData && (
          <div className="bg-white/85 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20 mb-6 sm:mb-8">
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${dir === 'rtl' ? 'font-arabic text-right' : 'font-latin text-left'}`} style={{
              background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {t('paymentDetails')}
            </h2>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${dir === 'rtl' ? 'sm:grid-flow-col-dense' : ''}`}>
              <div className={`space-y-3 sm:space-y-4 ${dir === 'rtl' ? 'sm:order-2' : ''}`}>
                <div className={`flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl justify-between ${dir === 'rtl' ? 'text-right' : 'text-left'}`} style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(74, 138, 143, 0.05) 100%)',
                  border: '1px solid rgba(47, 110, 115, 0.2)'
                }}>
                  <span className={`font-medium text-gray-700 text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>{t('amount')}:</span>
                  <span className={`font-bold text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`} style={{ color: '#4a757c' }}>
                    {paymentData.amount} {paymentData.currency}
                  </span>
                </div>
                
                <div className={`flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl justify-between ${dir === 'rtl' ? 'text-right' : 'text-left'}`} style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(74, 138, 143, 0.05) 100%)',
                  border: '1px solid rgba(47, 110, 115, 0.2)'
                }}>
                  <span className={`font-medium text-gray-700 text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>{t('paymentMethod')}:</span>
                  <span className={`font-bold capitalize text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`} style={{ color: '#4a757c' }}>
                    {paymentData.gateway}
                  </span>
                </div>
              </div>
              
              <div className={`space-y-3 sm:space-y-4 ${dir === 'rtl' ? 'sm:order-1' : ''}`}>
                <div className={`flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl justify-between ${dir === 'rtl' ? 'text-right' : 'text-left'}`} style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(74, 138, 143, 0.05) 100%)',
                  border: '1px solid rgba(47, 110, 115, 0.2)'
                }}>
                  <span className={`font-medium text-gray-700 text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>{t('status')}:</span>
                  <span className={`font-bold capitalize text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'} ${
                    paymentData.status === 'paid' ? 'text-green-600' : 
                    paymentData.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {paymentData.status}
                  </span>
                </div>
                
                <div className={`flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl justify-between ${dir === 'rtl' ? 'text-right' : 'text-left'}`} style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(74, 138, 143, 0.05) 100%)',
                  border: '1px solid rgba(47, 110, 115, 0.2)'
                }}>
                  <span className={`font-medium text-gray-700 text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>{t('subscriptionStatus')}:</span>
                  <span className={`font-bold capitalize text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'} ${
                    paymentData.subscription_status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {paymentData.subscription_status}
                  </span>
                </div>
                
                <div className={`flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl justify-between ${dir === 'rtl' ? 'text-right' : 'text-left'}`} style={{
                  background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05) 0%, rgba(74, 138, 143, 0.05) 100%)',
                  border: '1px solid rgba(47, 110, 115, 0.2)'
                }}>
                  <span className={`font-medium text-gray-700 text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>{t('paidAt')}:</span>
                  <span className={`font-bold text-sm sm:text-base ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`} style={{ color: '#4a757c' }}>
                    {new Date(paymentData.paid_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center">
          <button 
            onClick={handleContinue}
            className={`text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-base sm:text-lg w-full sm:w-auto ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}
            style={{
              background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
            }}
          >
            {t('viewMySubscriptions')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

