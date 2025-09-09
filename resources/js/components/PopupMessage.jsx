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
                    icon: '✓',
                    bgColor: 'rgba(34, 197, 94, 0.08)',
                    borderColor: 'rgba(34, 197, 94, 0.2)',
                    iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    textColor: 'rgb(16, 185, 129)',
                    shadowColor: 'rgba(16, 185, 129, 0.3)'
                };
            case 'error':
                return {
                    icon: '✕',
                    bgColor: 'rgba(239, 68, 68, 0.08)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    textColor: 'rgb(239, 68, 68)',
                    shadowColor: 'rgba(239, 68, 68, 0.3)'
                };
            case 'warning':
                return {
                    icon: '⚠',
                    bgColor: 'rgba(245, 158, 11, 0.08)',
                    borderColor: 'rgba(245, 158, 11, 0.2)',
                    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    textColor: 'rgb(245, 158, 11)',
                    shadowColor: 'rgba(245, 158, 11, 0.3)'
                };
            case 'confirm':
                return {
                    icon: '?',
                    bgColor: 'rgba(59, 130, 246, 0.08)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    textColor: 'rgb(59, 130, 246)',
                    shadowColor: 'rgba(59, 130, 246, 0.3)'
                };
            default:
                return {
                    icon: 'i',
                    bgColor: 'rgba(59, 130, 246, 0.08)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    textColor: 'rgb(59, 130, 246)',
                    shadowColor: 'rgba(59, 130, 246, 0.3)'
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
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: show ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.5rem',
                padding: '2.5rem 2rem',
                maxWidth: '420px',
                width: '90%',
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px ${typeStyles.borderColor}`,
                border: `1px solid ${typeStyles.borderColor}`,
                transform: show ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: typeStyles.iconBg,
                    opacity: 0.1
                }} />

                {/* Icon */}
                <div style={{
                    width: '5rem',
                    height: '5rem',
                    background: typeStyles.iconBg,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    margin: '0 auto 1.5rem',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: `0 8px 20px ${typeStyles.shadowColor}`,
                    position: 'relative'
                }}>
                    {typeStyles.icon}
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'rgb(17, 24, 39)',
                    margin: '0 0 1rem 0',
                    letterSpacing: '-0.025em'
                }}>
                    {title}
                </h3>

                {/* Message */}
                <p style={{
                    color: 'rgb(75, 85, 99)',
                    margin: '0 0 2.5rem 0',
                    lineHeight: '1.7',
                    fontSize: '1rem'
                }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={() => {
                                    onCancel && onCancel();
                                    onClose();
                                }}
                                style={{
                                    padding: '0.875rem 2rem',
                                    background: 'rgba(107, 114, 128, 0.08)',
                                    color: 'rgb(107, 114, 128)',
                                    border: '1px solid rgba(107, 114, 128, 0.15)',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    minWidth: '120px',
                                    letterSpacing: '0.025em'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(107, 114, 128, 0.15)';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(107, 114, 128, 0.08)';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
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
                                    padding: '0.875rem 2rem',
                                    background: typeStyles.iconBg,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    minWidth: '120px',
                                    letterSpacing: '0.025em',
                                    boxShadow: `0 4px 12px ${typeStyles.shadowColor}`
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = `0 8px 20px ${typeStyles.shadowColor}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = `0 4px 12px ${typeStyles.shadowColor}`;
                                }}
                            >
                                {confirmText || (language === 'ar' ? 'تأكيد' : 'Confirm')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.875rem 2.5rem',
                                background: typeStyles.iconBg,
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                minWidth: '140px',
                                letterSpacing: '0.025em',
                                boxShadow: `0 4px 12px ${typeStyles.shadowColor}`
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 8px 20px ${typeStyles.shadowColor}`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = `0 4px 12px ${typeStyles.shadowColor}`;
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