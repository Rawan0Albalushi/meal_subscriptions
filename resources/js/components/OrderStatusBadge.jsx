import React from 'react';

const OrderStatusBadge = ({ status, language = 'ar' }) => {
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                text: language === 'ar' ? 'قيد الانتظار' : 'Pending',
                icon: '⏳',
                gradient: 'linear-gradient(135deg, rgb(234 179 8), rgb(245 158 11))',
                shadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                pulse: true
            },
            preparing: {
                text: language === 'ar' ? 'قيد التحضير' : 'Preparing',
                icon: '👨‍🍳',
                gradient: 'linear-gradient(135deg, rgb(59 130 246), rgb(99 102 241))',
                shadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                pulse: true
            },
            delivered: {
                text: language === 'ar' ? 'تم التوصيل' : 'Delivered',
                icon: '✅',
                gradient: 'linear-gradient(135deg, rgb(34 197 94), rgb(16 185 129))',
                shadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                pulse: false
            },
            cancelled: {
                text: language === 'ar' ? 'ملغي' : 'Cancelled',
                icon: '❌',
                gradient: 'linear-gradient(135deg, rgb(239 68 68), rgb(236 72 153))',
                shadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                pulse: false
            }
        };

        return configs[status] || configs.pending;
    };

    const config = getStatusConfig(status);

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '1rem',
            background: config.gradient,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600',
            boxShadow: config.shadow,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            animation: config.pulse ? 'pulse 2s infinite' : 'none',
            '@media (max-width: 768px)': {
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '0.75rem',
                gap: '0.4rem'
            }
        }}>
            {/* Pulse animation for active statuses */}
            {config.pulse && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%) scale(0)',
                    animation: 'ripple 2s infinite',
                    pointerEvents: 'none'
                }}></div>
            )}
            
            <span style={{ 
                fontSize: '1rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                '@media (max-width: 768px)': {
                    fontSize: '0.9rem'
                }
            }}>
                {config.icon}
            </span>
            <span style={{ 
                fontWeight: '700',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                '@media (max-width: 768px)': {
                    fontWeight: '600',
                    fontSize: '0.7rem'
                }
            }}>
                {config.text}
            </span>
        </div>
    );
};

export default OrderStatusBadge;
