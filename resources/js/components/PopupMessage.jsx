import React, { useEffect } from 'react';

const PopupMessage = ({ 
  isVisible, 
  type, // 'success' or 'error'
  title, 
  message, 
  onClose, 
  onConfirm,
  showConfirmButton = false,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء'
}) => {
  useEffect(() => {
    if (isVisible) {
      // Auto close after 3 seconds for success messages
      if (type === 'success' && !showConfirmButton) {
        const timer = setTimeout(() => {
          onClose();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, type, showConfirmButton, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))';
      case 'error':
        return 'linear-gradient(135deg, rgb(239 68 68), rgb(236 72 153))';
      default:
        return 'linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241))';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Icon */}
        <div style={{
          width: '4rem',
          height: '4rem',
          background: getBackgroundColor(),
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
          {getIcon()}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
          color: 'rgb(31 41 55)'
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '1rem',
          textAlign: 'center',
          color: 'rgb(75 85 99)',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: showConfirmButton ? 'space-between' : 'center'
        }}>
          {showConfirmButton && (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                background: 'rgb(229 231 235)',
                color: 'rgb(75 85 99)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgb(209 213 219)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgb(229 231 235)';
              }}
            >
              {cancelText}
            </button>
          )}
          
          <button
            onClick={showConfirmButton ? onConfirm : onClose}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              background: getBackgroundColor(),
              color: 'white',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
          >
            {showConfirmButton ? confirmText : 'حسناً'}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PopupMessage;
