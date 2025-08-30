import React from 'react';

const Popup = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'success', // success, error, info, warning
    onConfirm = null,
    confirmText = 'حسناً',
    showCancel = false,
    cancelText = 'إلغاء'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return 'ℹ️';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    border: 'rgba(34, 197, 94, 0.2)',
                    text: 'rgb(34 197 94)'
                };
            case 'error':
                return {
                    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'rgba(239, 68, 68, 0.2)',
                    text: 'rgb(239 68 68)'
                };
            case 'warning':
                return {
                    bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    border: 'rgba(245, 158, 11, 0.2)',
                    text: 'rgb(245 158 11)'
                };
            case 'info':
                return {
                    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'rgba(59, 130, 246, 0.2)',
                    text: 'rgb(59 130 246)'
                };
            default:
                return {
                    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'rgba(59, 130, 246, 0.2)',
                    text: 'rgb(59 130 246)'
                };
        }
    };

    const colors = getColors();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '1rem'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                border: `1px solid ${colors.border}`,
                animation: 'popupSlideIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        width: '3rem',
                        height: '3rem',
                        background: colors.bg,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            {title}
                        </h3>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'rgb(107 114 128)'
                        }}>
                            {type === 'success' ? 'تم بنجاح' : 
                             type === 'error' ? 'حدث خطأ' : 
                             type === 'warning' ? 'تحذير' : 'معلومات'}
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div style={{
                    marginBottom: '2rem',
                    lineHeight: 1.6,
                    color: 'rgb(55 65 81)',
                    fontSize: '0.95rem'
                }}>
                    {message}
                </div>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: showCancel ? 'space-between' : 'center'
                }}>
                    {showCancel && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(107, 114, 128, 0.1)',
                                color: 'rgb(107 114 128)',
                                border: '1px solid rgba(107, 114, 128, 0.2)',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                            }}
                        >
                            {cancelText}
                        </button>
                    )}
                    
                    <button
                        onClick={onConfirm || onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: colors.bg,
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minWidth: '120px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes popupSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Popup;
