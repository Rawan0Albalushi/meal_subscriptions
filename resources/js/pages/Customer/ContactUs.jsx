import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactUs = () => {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';
    const [contactInfo, setContactInfo] = useState({
        phone: '+968 9999 9999',
        email: 'info@mealsubscriptions.om'
    });
    const [loading, setLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState({ phone: false, email: false });
    const [toastMessage, setToastMessage] = useState('');

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await fetch('/api/contact-information');
            const data = await response.json();
            
            if (data.success) {
                setContactInfo(data.data);
            }
        } catch (error) {
            console.error('Error fetching contact information:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus(prev => ({ ...prev, [type]: true }));
            setToastMessage(language === 'ar' ? 'تم النسخ!' : 'Copied!');
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [type]: false }));
                setToastMessage('');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>
                        {language === 'ar' ? 'جاري تحميل معلومات التواصل...' : 'Loading contact information...'}
                    </p>
                </div>
            </div>
        );
    }

    return (<>
        <div style={{
            minHeight: '100vh',
            padding: 'clamp(1rem, 4vw, 2rem)',
            direction: isRTL ? 'rtl' : 'ltr',
            background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Contact Information Section */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    padding: 'clamp(2rem, 5vw, 3rem)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                        fontWeight: 'bold',
                        color: '#4a757c',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                    </h2>

                    <p style={{
                        color: '#64748b',
                        fontSize: '1.125rem',
                        marginBottom: '3rem',
                        lineHeight: '1.6',
                        textAlign: 'center'
                    }}>
                        {language === 'ar' 
                            ? 'نحن هنا لمساعدتك! يمكنك التواصل معنا من خلال المعلومات التالية.'
                            : 'We\'re here to help! You can reach us through the following information.'
                        }
                    </p>

                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '2rem' 
                    }}>
                        {/* Phone */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(47, 110, 115, 0.05)',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(47, 110, 115, 0.1)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        onClick={() => copyToClipboard(contactInfo.phone, 'phone')}
                        role="button"
                        aria-label={language === 'ar' ? 'نسخ رقم الهاتف' : 'Copy phone number'}
                        >
                            <div style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.25rem',
                                boxShadow: '0 8px 20px rgba(47, 110, 115, 0.3)'
                            }}>
                                📞
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#4a757c',
                                    marginBottom: '0.25rem'
                                }}>
                                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    margin: 0
                                }}>
                                    {contactInfo.phone}
                                </p>
                            </div>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: copyStatus.phone ? '#4CAF50' : 'rgba(74, 117, 124, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(47, 110, 115, 0.2)',
                                flexShrink: 0
                            }}>
                                <span style={{
                                    fontSize: '1.125rem',
                                    color: copyStatus.phone ? 'white' : '#4a757c',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {copyStatus.phone ? '✓' : '📋'}
                                </span>
                            </div>
                            {/* Inline badge removed on mobile in favor of toast */}
                        </div>

                        {/* Email */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(79, 70, 229, 0.05)',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(79, 70, 229, 0.1)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        onClick={() => copyToClipboard(contactInfo.email, 'email')}
                        role="button"
                        aria-label={language === 'ar' ? 'نسخ البريد الإلكتروني' : 'Copy email address'}
                        >
                            <div style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.25rem',
                                boxShadow: '0 8px 20px rgba(47, 110, 115, 0.3)'
                            }}>
                                ✉️
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    color: '#2f6e73',
                                    marginBottom: '0.25rem'
                                }}>
                                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    margin: 0,
                                    wordBreak: 'break-all'
                                }}>
                                    {contactInfo.email}
                                </p>
                            </div>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: copyStatus.email ? '#10b981' : 'rgba(47, 110, 115, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(47, 110, 115, 0.2)',
                                flexShrink: 0
                            }}>
                                <span style={{
                                    fontSize: '1.125rem',
                                    color: copyStatus.email ? 'white' : '#2f6e73',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {copyStatus.email ? '✓' : '📋'}
                                </span>
                            </div>
                            {/* Inline badge removed on mobile in favor of toast */}
                        </div>
                    </div>

                </div>
            </div>
        </div>
        {toastMessage && (
            <div style={{
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 'max(16px, env(safe-area-inset-bottom))',
                background: '#111827',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                zIndex: 1000,
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
            }}>
                {toastMessage}
            </div>
        )}
    </>);
};

export default ContactUs;
