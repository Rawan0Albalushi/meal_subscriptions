import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminSettings = () => {
    const { t, dir, language } = useLanguage();
    const [settings, setSettings] = useState({});
    const [systemInfo, setSystemInfo] = useState({});
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        fetchSettings();
        fetchSystemInfo();
        fetchLogs();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchSystemInfo = async () => {
        try {
            const response = await fetch('/api/admin/settings/system-info', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSystemInfo(data.data);
            }
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/admin/settings/logs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const handleUpdateSettings = async (section, sectionSettings) => {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    section,
                    settings: sectionSettings
                })
            });

            if (response.ok) {
                fetchSettings();
                alert(language === 'ar' ? 'تم تحديث الإعدادات بنجاح' : 'Settings updated successfully');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            alert(language === 'ar' ? 'حدث خطأ في تحديث الإعدادات' : 'Error updating settings');
        }
    };

    const handleClearCache = async () => {
        try {
            const response = await fetch('/api/admin/settings/clear-cache', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert(language === 'ar' ? 'تم مسح الذاكرة المؤقتة بنجاح' : 'Cache cleared successfully');
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            alert(language === 'ar' ? 'حدث خطأ في مسح الذاكرة المؤقتة' : 'Error clearing cache');
        }
    };

    const handleDownloadLog = async (filename) => {
        try {
            const response = await fetch(`/api/admin/settings/logs/${filename}/download`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading log:', error);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString('en-US');
    };

    const tabs = [
        { id: 'general', label: language === 'ar' ? 'عام' : 'General', icon: '⚙️' },
        { id: 'delivery', label: language === 'ar' ? 'التوصيل' : 'Delivery', icon: '🚚' },
        { id: 'payment', label: language === 'ar' ? 'الدفع' : 'Payment', icon: '💳' },
        { id: 'notifications', label: language === 'ar' ? 'الإشعارات' : 'Notifications', icon: '🔔' },
        { id: 'security', label: language === 'ar' ? 'الأمان' : 'Security', icon: '🔒' },
        { id: 'backup', label: language === 'ar' ? 'النسخ الاحتياطي' : 'Backup', icon: '💾' },
        { id: 'system', label: language === 'ar' ? 'النظام' : 'System', icon: '🖥️' },
        { id: 'logs', label: language === 'ar' ? 'السجلات' : 'Logs', icon: '📋' }
    ];

    const renderGeneralSettings = () => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#1f2937'
            }}>
                {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
            </h3>
            
            <div style={{
                display: 'grid',
                gap: '1.5rem'
            }}>
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}
                    </label>
                    <input
                        type="text"
                        defaultValue={settings.general?.site_name_ar || ''}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}
                    </label>
                    <input
                        type="text"
                        defaultValue={settings.general?.site_name_en || ''}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'اللغة الافتراضية' : 'Default Language'}
                    </label>
                    <select
                        defaultValue={settings.general?.default_language || 'ar'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
                        <option value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</option>
                    </select>
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'العملة' : 'Currency'}
                    </label>
                    <input
                        type="text"
                        defaultValue={settings.general?.currency || 'OMR'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'رمز العملة' : 'Currency Symbol'}
                    </label>
                    <input
                        type="text"
                        defaultValue={settings.general?.currency_symbol || 'ر.ع'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            <button
                onClick={() => {
                    const formData = new FormData(document.querySelector('form'));
                    const generalSettings = {
                        site_name_ar: formData.get('site_name_ar'),
                        site_name_en: formData.get('site_name_en'),
                        default_language: formData.get('default_language'),
                        currency: formData.get('currency'),
                        currency_symbol: formData.get('currency_symbol')
                    };
                    handleUpdateSettings('general', generalSettings);
                }}
                style={{
                    marginTop: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                }}
            >
                {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </button>
        </div>
    );

    const renderDeliverySettings = () => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#1f2937'
            }}>
                {language === 'ar' ? 'إعدادات التوصيل' : 'Delivery Settings'}
            </h3>
            
            <div style={{
                display: 'grid',
                gap: '1.5rem'
            }}>
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'سعر التوصيل الافتراضي' : 'Default Delivery Price'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        defaultValue={settings.delivery?.default_delivery_price || 2.00}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'حد التوصيل المجاني' : 'Free Delivery Threshold'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        defaultValue={settings.delivery?.free_delivery_threshold || 10.00}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'أقل وقت توصيل (دقيقة)' : 'Minimum Delivery Time (minutes)'}
                    </label>
                    <input
                        type="number"
                        defaultValue={settings.delivery?.delivery_time_min || 30}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        {language === 'ar' ? 'أقصى وقت توصيل (دقيقة)' : 'Maximum Delivery Time (minutes)'}
                    </label>
                    <input
                        type="number"
                        defaultValue={settings.delivery?.delivery_time_max || 60}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            <button
                onClick={() => {
                    const formData = new FormData(document.querySelector('form'));
                    const deliverySettings = {
                        default_delivery_price: parseFloat(formData.get('default_delivery_price')),
                        free_delivery_threshold: parseFloat(formData.get('free_delivery_threshold')),
                        delivery_time_min: parseInt(formData.get('delivery_time_min')),
                        delivery_time_max: parseInt(formData.get('delivery_time_max'))
                    };
                    handleUpdateSettings('delivery', deliverySettings);
                }}
                style={{
                    marginTop: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                }}
            >
                {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </button>
        </div>
    );

    const renderSystemInfo = () => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#1f2937'
            }}>
                {language === 'ar' ? 'معلومات النظام' : 'System Information'}
            </h3>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                <div style={{
                    background: 'rgba(249, 250, 251, 0.8)',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(229, 231, 235, 0.5)'
                }}>
                    <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '1rem'
                    }}>
                        {language === 'ar' ? 'معلومات الخادم' : 'Server Information'}
                    </h4>
                    <div style={{
                        display: 'grid',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        <div>
                            <strong>{language === 'ar' ? 'إصدار PHP:' : 'PHP Version:'}</strong> {systemInfo.php_version}
                        </div>
                        <div>
                            <strong>{language === 'ar' ? 'إصدار Laravel:' : 'Laravel Version:'}</strong> {systemInfo.laravel_version}
                        </div>
                        <div>
                            <strong>{language === 'ar' ? 'برنامج الخادم:' : 'Server Software:'}</strong> {systemInfo.server_software}
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(249, 250, 251, 0.8)',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(229, 231, 235, 0.5)'
                }}>
                    <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '1rem'
                    }}>
                        {language === 'ar' ? 'قاعدة البيانات' : 'Database'}
                    </h4>
                    <div style={{
                        display: 'grid',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        <div>
                            <strong>{language === 'ar' ? 'نوع قاعدة البيانات:' : 'Database Driver:'}</strong> {systemInfo.database_driver}
                        </div>
                        <div>
                            <strong>{language === 'ar' ? 'نوع الذاكرة المؤقتة:' : 'Cache Driver:'}</strong> {systemInfo.cache_driver}
                        </div>
                        <div>
                            <strong>{language === 'ar' ? 'نوع الطابور:' : 'Queue Driver:'}</strong> {systemInfo.queue_driver}
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(249, 250, 251, 0.8)',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(229, 231, 235, 0.5)'
                }}>
                    <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '1rem'
                    }}>
                        {language === 'ar' ? 'الذاكرة والملفات' : 'Memory & Files'}
                    </h4>
                    <div style={{
                        display: 'grid',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        <div>
                            <strong>{language === 'ar' ? 'حد الذاكرة:' : 'Memory Limit:'}</strong> {systemInfo.memory_limit}
                        </div>
                        <div>
                            <strong>{language === 'ar' ? 'حد وقت التنفيذ:' : 'Max Execution Time:'}</strong> {systemInfo.max_execution_time}s
                        </div>
                        <div>
                            <strong>{language === 'ar' ? 'حد رفع الملفات:' : 'Upload Max Filesize:'}</strong> {systemInfo.upload_max_filesize}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={handleClearCache}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    🗑️ {language === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
                </button>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                color: '#1f2937'
            }}>
                {language === 'ar' ? 'ملفات السجل' : 'Log Files'}
            </h3>
            
            <div style={{
                display: 'grid',
                gap: '1rem'
            }}>
                {Object.entries(logs).map(([filename, info]) => (
                    <div key={filename} style={{
                        background: 'rgba(249, 250, 251, 0.8)',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(229, 231, 235, 0.5)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#374151',
                                margin: 0,
                                marginBottom: '0.5rem'
                            }}>
                                {filename}
                            </h4>
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                <span>
                                    <strong>{language === 'ar' ? 'الحجم:' : 'Size:'}</strong> {formatFileSize(info.size)}
                                </span>
                                <span>
                                    <strong>{language === 'ar' ? 'عدد الأسطر:' : 'Lines:'}</strong> {info.lines}
                                </span>
                                <span>
                                    <strong>{language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'}</strong> {formatDate(info.modified)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDownloadLog(filename)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}
                        >
                            📥 {language === 'ar' ? 'تحميل' : 'Download'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ direction: dir }}>
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
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        ⚙️ {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '1.1rem'
                    }}>
                        {language === 'ar' ? 'إدارة إعدادات النظام العامة' : 'Manage general system settings'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                background: activeTab === tab.id 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'rgba(249, 250, 251, 0.8)',
                                color: activeTab === tab.id ? 'white' : '#374151',
                                border: activeTab === tab.id 
                                    ? 'none'
                                    : '1px solid rgba(229, 231, 235, 0.5)'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'delivery' && renderDeliverySettings()}
            {activeTab === 'system' && renderSystemInfo()}
            {activeTab === 'logs' && renderLogs()}
            
            {/* Placeholder for other tabs */}
            {!['general', 'delivery', 'system', 'logs'].includes(activeTab) && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        color: '#1f2937'
                    }}>
                        {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                    </h3>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '1.1rem'
                    }}>
                        {language === 'ar' ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
