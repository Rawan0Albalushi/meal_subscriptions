import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactInformationManagement = () => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [contactInfo, setContactInfo] = useState({
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/contact-information', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(contactInfo)
            });

            const data = await response.json();

            if (data.success) {
                setMessage(language === 'ar' ? 'تم تحديث معلومات التواصل بنجاح' : 'Contact information updated successfully');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating contact information');
            }
        } catch (error) {
            console.error('Error updating contact information:', error);
            setMessage(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'rgb(75 85 99)', fontSize: '1.125rem' }}>
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: 'clamp(1rem, 4vw, 2rem)',
            direction: isRTL ? 'rtl' : 'ltr'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto'
            }}>
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
                        color: 'rgb(79 70 229)',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        {language === 'ar' ? 'إدارة معلومات التواصل' : 'Contact Information Management'}
                    </h2>

                    {message && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '2rem',
                            borderRadius: '0.5rem',
                            backgroundColor: message.includes('successfully') || message.includes('نجاح') 
                                ? 'rgba(34, 197, 94, 0.1)' 
                                : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${message.includes('successfully') || message.includes('نجاح') 
                                ? 'rgb(34, 197, 94)' 
                                : 'rgb(239, 68, 68)'}`,
                            color: message.includes('successfully') || message.includes('نجاح') 
                                ? 'rgb(34, 197, 94)' 
                                : 'rgb(239, 68, 68)',
                            textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: 'rgb(79 70 229)',
                                fontSize: '1.125rem'
                            }}>
                                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={contactInfo.phone}
                                onChange={handleInputChange}
                                placeholder={language === 'ar' ? '+968 9999 9999' : '+968 9999 9999'}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: '2px solid rgba(79, 70, 229, 0.2)',
                                    fontSize: '1rem',
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgb(79 70 229)';
                                    e.target.style.backgroundColor = 'white';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: 'rgb(79 70 229)',
                                fontSize: '1.125rem'
                            }}>
                                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={contactInfo.email}
                                onChange={handleInputChange}
                                placeholder={language === 'ar' ? 'info@mealsubscriptions.om' : 'info@mealsubscriptions.om'}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: '2px solid rgba(79, 70, 229, 0.2)',
                                    fontSize: '1rem',
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgb(79 70 229)';
                                    e.target.style.backgroundColor = 'white';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                width: '100%',
                                padding: '1rem 2rem',
                                backgroundColor: saving ? 'rgb(156 163 175)' : 'rgb(79 70 229)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                if (!saving) {
                                    e.target.style.backgroundColor = 'rgb(67 56 202)';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!saving) {
                                    e.target.style.backgroundColor = 'rgb(79 70 229)';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                }
                            }}
                        >
                            {saving 
                                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                                : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactInformationManagement;
