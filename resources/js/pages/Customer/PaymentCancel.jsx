import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  const [loading, setLoading] = useState(false);

  const subscriptionId = searchParams.get('subscription_id');
  const error = searchParams.get('error');
  const info = searchParams.get('info');

  useEffect(() => {
    console.log('PaymentCancel: subscriptionId =', subscriptionId);
    console.log('PaymentCancel: error =', error);
    console.log('PaymentCancel: info =', info);
  }, [subscriptionId, error, info]);

  const handleRetry = () => {
    if (subscriptionId) {
      navigate(`/my-subscriptions`);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={dir} style={{
      background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
    }}>
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">❌</div>
        <h1 className={`text-3xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`} style={{
          background: 'linear-gradient(135deg, #ba6c5d 0%, #4a757c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {error ? t('paymentFailed') : t('paymentCancelled')}
        </h1>
        <p className={`text-gray-600 text-lg mb-8 leading-relaxed ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}>
          {error || info || t('paymentCancelledMessage')}
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={handleRetry}
            className={`w-full text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}
            style={{
              background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
            }}
          >
            {t('goToSubscriptions')}
          </button>
          
          <button 
            onClick={handleGoHome}
            className={`w-full text-gray-700 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gray-300 hover:border-gray-400 ${dir === 'rtl' ? 'font-arabic' : 'font-latin'}`}
            style={{
              background: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            {t('goHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

