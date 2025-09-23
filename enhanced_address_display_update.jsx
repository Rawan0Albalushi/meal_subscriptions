// التحديث المحسن لعرض تفاصيل العنوان في صفحة طلبات الاشتراكات للبائع
// استبدل القسم الحالي من السطر 1635 إلى 1655 بهذا الكود:

{/* Delivery Address */}
<div style={{
    background: 'rgba(59, 130, 246, 0.05)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(59, 130, 246, 0.2)'
}}>
    <h3 style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1e40af',
        margin: 0,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    }}>
        📍 {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
    </h3>
    
    <div style={{
        display: 'grid',
        gap: '1rem'
    }}>
        {/* اسم المستلم */}
        {selectedSubscription.delivery_address?.name && (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: 'white',
                    flexShrink: 0
                }}>
                    👤
                </div>
                <div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        {language === 'ar' ? 'اسم المستلم' : 'Recipient Name'}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#1f2937',
                        fontWeight: '600'
                    }}>
                        {selectedSubscription.delivery_address.name}
                    </div>
                </div>
            </div>
        )}

        {/* رقم الهاتف */}
        {selectedSubscription.delivery_address?.phone && (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: 'white',
                    flexShrink: 0
                }}>
                    📞
                </div>
                <div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#1f2937',
                        fontWeight: '600',
                        direction: 'ltr',
                        textAlign: 'left'
                    }}>
                        {selectedSubscription.delivery_address.phone}
                    </div>
                </div>
            </div>
        )}

        {/* العنوان التفصيلي */}
        {selectedSubscription.delivery_address?.address && (
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: 'white',
                    flexShrink: 0,
                    marginTop: '0.125rem'
                }}>
                    🏠
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        {language === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#1f2937',
                        fontWeight: '500',
                        lineHeight: '1.5'
                    }}>
                        {selectedSubscription.delivery_address.address}
                    </div>
                </div>
            </div>
        )}

        {/* المدينة والرمز البريدي */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
            gap: '0.75rem'
        }}>
            {/* المدينة */}
            {selectedSubscription.delivery_address?.city && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        🏙️
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'المدينة' : 'City'}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#1f2937',
                            fontWeight: '600'
                        }}>
                            {selectedSubscription.delivery_address.city}
                        </div>
                    </div>
                </div>
            )}

            {/* الرمز البريدي */}
            {selectedSubscription.delivery_address?.postal_code && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        📮
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#1f2937',
                            fontWeight: '600',
                            direction: 'ltr',
                            textAlign: 'left'
                        }}>
                            {selectedSubscription.delivery_address.postal_code}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* الملاحظات الإضافية */}
        {selectedSubscription.delivery_address?.additional_notes && (
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    color: 'white',
                    flexShrink: 0,
                    marginTop: '0.125rem'
                }}>
                    📝
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#1f2937',
                        fontWeight: '500',
                        lineHeight: '1.5',
                        fontStyle: 'italic'
                    }}>
                        {selectedSubscription.delivery_address.additional_notes}
                    </div>
                </div>
            </div>
        )}

        {/* رابط الخريطة */}
        {(() => {
            const lat = selectedSubscription?.delivery_address?.latitude;
            const lng = selectedSubscription?.delivery_address?.longitude;
            const address = selectedSubscription?.delivery_address?.address;
            let link = null;
            if (typeof lat === 'number' && typeof lng === 'number') {
                link = `https://www.google.com/maps?q=${lat},${lng}`;
            } else if (address) {
                link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            }
            if (!link) return null;
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        🗺️
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'الموقع على الخريطة' : 'Map Location'}
                        </div>
                        <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                                fontSize: '0.9rem',
                                color: '#2563eb',
                                textDecoration: 'underline',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            {language === 'ar' ? 'فتح على الخريطة' : 'Open Map'} 🚀
                        </a>
                    </div>
                </div>
            );
        })()}
    </div>
</div>
