import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PopupMessage = ({ 
    show, 
    onClose, 
    title, 
    message, 
    type = 'info', // info, success, warning, error, confirm
    confirmText = null,
    cancelText = null,
    onConfirm = null,
    onCancel = null
}) => {
    const { language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [show]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: '✅',
                    bgColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    iconBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    textColor: 'rgb(22, 163, 74)'
                };
            case 'error':
                return {
                    icon: '❌',
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    textColor: 'rgb(220, 38, 38)'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    textColor: 'rgb(217, 119, 6)'
                };
            case 'confirm':
                return {
                    icon: '❓',
                    bgColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    textColor: 'rgb(37, 99, 235)'
                };
            default:
                return {
                    icon: 'ℹ️',
                    bgColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    textColor: 'rgb(37, 99, 235)'
                };
        }
    };

    const typeStyles = getTypeStyles();

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: show ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                border: `1px solid ${typeStyles.borderColor}`,
                transform: show ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 0.3s ease-in-out',
                textAlign: 'center'
            }}>
                {/* Icon */}
                <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: typeStyles.iconBg,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    margin: '0 auto 1.5rem',
                    color: 'white'
                }}>
                    {typeStyles.icon}
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'rgb(55, 65, 81)',
                    margin: '0 0 1rem 0'
                }}>
                    {title}
                </h3>

                {/* Message */}
                <p style={{
                    color: 'rgb(107, 114, 128)',
                    margin: '0 0 2rem 0',
                    lineHeight: '1.6'
                }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center'
                }}>
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={() => {
                                    onCancel && onCancel();
                                    onClose();
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    color: 'rgb(107, 114, 128)',
                                    border: '1px solid rgba(107, 114, 128, 0.2)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '100px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                                }}
                            >
                                {cancelText || (language === 'ar' ? 'إلغاء' : 'Cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm && onConfirm();
                                    onClose();
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: typeStyles.iconBg,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '100px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                {confirmText || (language === 'ar' ? 'تأكيد' : 'Confirm')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: typeStyles.iconBg,
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            {language === 'ar' ? 'موافق' : 'OK'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupMessage;