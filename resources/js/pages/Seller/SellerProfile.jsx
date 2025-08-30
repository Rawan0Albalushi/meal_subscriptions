import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const SellerProfile = () => {
    const { t, dir, language } = useLanguage();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate password change
            if (formData.new_password || formData.confirm_password) {
                if (!formData.current_password) {
                    setMessage({
                        type: 'error',
                        text: language === 'ar' ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required'
                    });
                    setLoading(false);
                    return;
                }
                if (formData.new_password !== formData.confirm_password) {
                    setMessage({
                        type: 'error',
                        text: language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match'
                    });
                    setLoading(false);
                    return;
                }
                if (formData.new_password.length < 6) {
                    setMessage({
                        type: 'error',
                        text: language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' : 'New password must be at least 6 characters'
                    });
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    current_password: formData.current_password || null,
                    new_password: formData.new_password || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully'
                });
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));

                // Update user context if needed
                if (updateUser) {
                    updateUser(data.data);
                }
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || (language === 'ar' ? 'حدث خطأ أثناء تحديث الملف الشخصي' : 'Error updating profile')
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            direction: dir
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        👤
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        </h1>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            margin: 0,
                            fontSize: '0.875rem'
                        }}>
                            {language === 'ar' 
                                ? 'إدارة بياناتك الشخصية وإعدادات الحساب'
                                : 'Manage your personal information and account settings'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <form onSubmit={handleSubmit}>
                    {/* Message Display */}
                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '2rem',
                            background: message.type === 'success' 
                                ? 'rgba(34, 197, 94, 0.1)' 
                                : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${message.type === 'success' 
                                ? 'rgba(34, 197, 94, 0.2)' 
                                : 'rgba(239, 68, 68, 0.2)'}`,
                            color: message.type === 'success' 
                                ? 'rgb(34 197 94)' 
                                : 'rgb(239 68 68)'
                        }}>
                            {message.text}
                        </div>
                    )}

                    {/* Personal Information Section */}
                    <div style={{
                        marginBottom: '2rem'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '1.5rem'
                        }}>
                            {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    📧 {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    📞 {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Change Section */}
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(79, 70, 229, 0.05)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(79, 70, 229, 0.1)'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '1.5rem'
                        }}>
                            🔐 {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                        </h2>
                        <p style={{
                            color: 'rgb(107 114 128)',
                            fontSize: '0.875rem',
                            margin: 0,
                            marginBottom: '1.5rem'
                        }}>
                            {language === 'ar' 
                                ? 'اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور'
                                : 'Leave fields empty if you don\'t want to change your password'
                            }
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.current_password}
                                    onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(107, 114, 128, 0.05)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(107, 114, 128, 0.1)'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'rgb(55 65 81)',
                            margin: 0,
                            marginBottom: '1.5rem'
                        }}>
                            ℹ️ {language === 'ar' ? 'معلومات الحساب' : 'Account Information'}
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                                </label>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(79, 70, 229, 0.1)',
                                    color: 'rgb(79 70 229)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {language === 'ar' ? 'بائع' : 'Seller'}
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}
                                </label>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    color: 'rgb(107 114 128)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem'
                                }}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'آخر تحديث' : 'Last Updated'}
                                </label>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    color: 'rgb(107 114 128)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem'
                                }}>
                                    {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                    }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 2rem',
                                background: loading 
                                    ? 'rgba(107, 114, 128, 0.3)' 
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {loading 
                                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                                : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellerProfile;
