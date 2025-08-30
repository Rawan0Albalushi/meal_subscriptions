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
      // Prevent body scroll when popup is visible
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Auto close after 3 seconds for success messages
      if (type === 'success' && !showConfirmButton) {
        const timer = setTimeout(() => {
          onClose();
        }, 3000);
        return () => {
          clearTimeout(timer);
          // Restore body scroll when popup closes
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
        };
      }
      
      return () => {
        // Restore body scroll when popup closes
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [isVisible, type, showConfirmButton, onClose]);

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.currentTarget.style.transform = 'scale(0.95)';
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.currentTarget.style.transform = 'scale(1)';
  };

  // Handle background click to close popup
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
    <div 
      onClick={handleBackgroundClick}
      style={{
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
        padding: '1rem',
        WebkitOverflowScrolling: 'touch',
        '@media (max-width: 768px)': {
          padding: '0.5rem'
        }
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
        animation: 'slideIn 0.3s ease-out',
        WebkitOverflowScrolling: 'touch',
        '@media (max-width: 768px)': {
          borderRadius: '1rem',
          padding: '1.5rem',
          maxWidth: '90vw',
          margin: '0 0.5rem',
          maxHeight: '80vh',
          overflowY: 'auto'
        }
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
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          '@media (max-width: 768px)': {
            width: '3.5rem',
            height: '3.5rem',
            fontSize: '1.75rem',
            marginBottom: '1rem'
          }
        }}>
          {getIcon()}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '1rem',
          color: 'rgb(31 41 55)',
          '@media (max-width: 768px)': {
            fontSize: '1.25rem',
            marginBottom: '0.75rem'
          }
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '1rem',
          textAlign: 'center',
          color: 'rgb(75 85 99)',
          lineHeight: '1.6',
          marginBottom: '2rem',
          '@media (max-width: 768px)': {
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            lineHeight: '1.5'
          }
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: showConfirmButton ? 'space-between' : 'center',
          '@media (max-width: 768px)': {
            flexDirection: showConfirmButton ? 'column' : 'row',
            gap: '0.75rem'
          }
        }}>
          {showConfirmButton && (
            <button
              onClick={onClose}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
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
                transition: 'all 0.3s ease',
                WebkitTapHighlightColor: 'transparent',
                '@media (max-width: 768px)': {
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  minHeight: '48px',
                  WebkitAppearance: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
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
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              WebkitTapHighlightColor: 'transparent',
              '@media (max-width: 768px)': {
                padding: '1rem 1.5rem',
                fontSize: '0.875rem',
                minHeight: '48px',
                WebkitAppearance: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }
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
          
          @media (max-width: 768px) {
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          }
          
          /* Prevent text selection on mobile */
          @media (max-width: 768px) {
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PopupMessage;
