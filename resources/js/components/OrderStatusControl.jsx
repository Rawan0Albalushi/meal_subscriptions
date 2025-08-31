import React, { useState } from 'react';
import { subscriptionsAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const OrderStatusControl = ({ subscriptionId, itemId, currentStatus, onStatusUpdate }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const statusOptions = [
        { value: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending', icon: '⏳' },
        { value: 'preparing', label: language === 'ar' ? 'قيد التحضير' : 'Preparing', icon: '👨‍🍳' },
        { value: 'delivered', label: language === 'ar' ? 'تم التوصيل' : 'Delivered', icon: '✅' },
        { value: 'cancelled', label: language === 'ar' ? 'ملغي' : 'Cancelled', icon: '❌' }
    ];

    const handleStatusChange = async (newStatus) => {
        if (newStatus === currentStatus) return;

        setLoading(true);
        setError(null);

        try {
            const response = await subscriptionsAPI.updateItemStatus(subscriptionId, itemId, newStatus);
            
            if (response.data.success) {
                onStatusUpdate && onStatusUpdate(newStatus);
            } else {
                setError(response.data.message || 'فشل في تحديث الحالة');
            }
        } catch (err) {
            setError('خطأ في تحديث الحالة');
            console.error('Error updating status:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(135deg, rgb(239 68 68), rgb(236 72 153))',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    zIndex: 10
                }}>
                    {error}
                </div>
            )}
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'rgb(107 114 128)',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                }}>
                    {language === 'ar' ? 'تغيير الحالة:' : 'Change Status:'}
                </div>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem'
                }}>
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            disabled={loading || option.value === currentStatus}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: option.value === currentStatus 
                                    ? 'linear-gradient(135deg, #2f6e73, #4a8a8f)'
                                    : 'rgb(249 250 251)',
                                color: option.value === currentStatus ? 'white' : 'rgb(75 85 99)',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: loading || option.value === currentStatus ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: loading ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && option.value !== currentStatus) {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && option.value !== currentStatus) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>{option.icon}</span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
                
                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'rgb(107 114 128)'
                    }}>
                        {language === 'ar' ? 'جاري التحديث...' : 'Updating...'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStatusControl;
