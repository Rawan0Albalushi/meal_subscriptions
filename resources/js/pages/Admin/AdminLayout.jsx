import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminRestaurants from './AdminRestaurants';
import AdminReports from './AdminReports';
import ContactInformationManagement from './ContactInformationManagement';
import SubscriptionTypes from './SubscriptionTypes';
import AdminMeals from './AdminMeals';
import AdminSubscriptions from './AdminSubscriptions';
import AdminTodayOrders from './AdminTodayOrders';
import AdminAreas from './AdminAreas';

const AdminLayout = () => {
    const { t, dir, language, toggleLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleLanguageToggle = () => {
        toggleLanguage();
    };

    const menuItems = [
        {
            path: '/admin',
            icon: '📊',
            label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard',
            description: language === 'ar' ? 'نظرة عامة على النظام' : 'System overview'
        },
        {
            path: '/admin/users',
            icon: '👥',
            label: language === 'ar' ? 'المستخدمين' : 'Users',
            description: language === 'ar' ? 'إدارة جميع المستخدمين' : 'Manage all users'
        },
        {
            path: '/admin/restaurants',
            icon: '🍽️',
            label: language === 'ar' ? 'المطاعم' : 'Restaurants',
            description: language === 'ar' ? 'إدارة جميع المطاعم' : 'Manage all restaurants'
        },
        {
            path: '/admin/subscription-types',
            icon: '📋',
            label: language === 'ar' ? 'أنواع الاشتراكات' : 'Subscription Types',
            description: language === 'ar' ? 'إدارة أنواع الاشتراكات' : 'Manage subscription types'
        },
        {
            path: '/admin/meals',
            icon: '🍴',
            label: language === 'ar' ? 'الوجبات' : 'Meals',
            description: language === 'ar' ? 'إدارة جميع الوجبات' : 'Manage all meals'
        },
        {
            path: '/admin/areas',
            icon: '📍',
            label: language === 'ar' ? 'المناطق' : 'Areas',
            description: language === 'ar' ? 'إدارة المناطق المتاحة' : 'Manage available areas'
        },
        {
            path: '/admin/subscriptions',
            icon: '📋',
            label: language === 'ar' ? 'الاشتراكات' : 'Subscriptions',
            description: language === 'ar' ? 'إدارة جميع الاشتراكات' : 'Manage all subscriptions'
        },
        {
            path: '/admin/today-orders',
            icon: '📋',
            label: language === 'ar' ? 'طلبات اليوم' : 'Today\'s Orders',
            description: language === 'ar' ? 'عرض طلبات اليوم' : 'View today\'s orders'
        },
        {
            path: '/admin/reports',
            icon: '📊',
            label: language === 'ar' ? 'التقارير' : 'Reports',
            description: language === 'ar' ? 'التقارير والإحصائيات' : 'Reports and analytics'
        },
        {
            path: '/admin/contact-information',
            icon: '📞',
            label: language === 'ar' ? 'معلومات التواصل' : 'Contact Information',
            description: language === 'ar' ? 'إدارة معلومات التواصل' : 'Manage contact information'
        },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'transparent',
            direction: dir
        }}>
            {/* Simplified Admin Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: window.innerWidth <= 768 ? '0 0.5rem' : '0 1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: window.innerWidth <= 768 ? '3.5rem' : '4rem'
                    }}>
                        {/* Logo and Title */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: window.innerWidth <= 768 ? '0.5rem' : '1rem'
                        }}>
                            <div style={{
                                width: window.innerWidth <= 768 ? '2rem' : '2.5rem',
                                height: window.innerWidth <= 768 ? '2rem' : '2.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: window.innerWidth <= 768 ? '1rem' : '1.25rem',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                👑
                            </div>
                            <div style={{
                                display: window.innerWidth <= 768 ? 'none' : 'block'
                            }}>
                                <h1 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(79 70 229)',
                                    margin: 0
                                }}>
                                    {language === 'ar' ? 'لوحة تحكم الأدمن' : 'Admin Dashboard'}
                                </h1>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)',
                                    margin: 0
                                }}>
                                    {language === 'ar' ? 'مرحباً بك' : 'Welcome'} {user?.full_name || user?.name || (language === 'ar' ? 'الأدمن' : 'Admin')}
                                </p>
                            </div>
                        </div>
                        
                        {/* User Menu */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            {/* Language Toggle Button */}
                            <button
                                onClick={handleLanguageToggle}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: window.innerWidth <= 768 ? '0.25rem' : '0.5rem',
                                    padding: window.innerWidth <= 768 ? '0.375rem 0.75rem' : '0.5rem 1rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                                }}
                            >
                                <span>🌐</span>
                            <span style={{
                                    display: window.innerWidth <= 768 ? 'none' : 'inline'
                                }}>
                                    {language === 'ar' ? 'English' : 'العربية'}
                                </span>
                            </button>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(79, 70, 229, 0.1)',
                                borderRadius: '0.5rem',
                                color: 'rgb(79 70 229)',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}>
                                <span>👑</span>
                                <span>{user?.full_name || user?.name || (language === 'ar' ? 'الأدمن' : 'Admin')}</span>
                            </div>
                            
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'rgb(239 68 68)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                            >
                                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: window.innerWidth <= 768 ? '0.5rem' : '1rem',
                display: 'flex',
                gap: window.innerWidth <= 768 ? '1rem' : '2rem',
                minHeight: window.innerWidth <= 768 ? 'calc(100vh - 3.5rem)' : 'calc(100vh - 4rem)',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
            }}>
                {/* Enhanced Sidebar Navigation */}
                <div style={{
                    width: window.innerWidth <= 768 ? '100%' : '300px',
                    flexShrink: 0
                }}>
                    <nav style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: window.innerWidth <= 768 ? '0.75rem' : '1.25rem',
                        padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        height: 'fit-content',
                        position: window.innerWidth <= 768 ? 'static' : 'sticky',
                        top: '6rem',
                        maxWidth: '100%'
                    }}>


                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : '1fr',
                            gap: window.innerWidth <= 768 ? '1rem' : '0.75rem',
                            width: '100%',
                            paddingTop: '0.5rem'
                        }}>
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        display: 'flex',
                                        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                                        alignItems: 'center',
                                        justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start',
                                        gap: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                        padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '0.875rem 1rem',
                                        borderRadius: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        background: isActive(item.path) 
                                            ? 'rgba(79, 70, 229, 0.08)' 
                                            : 'rgba(255, 255, 255, 0.6)',
                                        color: isActive(item.path) ? 'rgb(79 70 229)' : 'rgb(55 65 81)',
                                        border: isActive(item.path) 
                                            ? '2px solid rgba(79, 70, 229, 0.3)' 
                                            : '1px solid rgba(0, 0, 0, 0.08)',
                                        boxShadow: isActive(item.path)
                                            ? '0 4px 12px rgba(79, 70, 229, 0.15)'
                                            : '0 2px 6px rgba(0, 0, 0, 0.06)',
                                        transform: isActive(item.path) ? 'translateY(-1px)' : 'translateY(0)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive(item.path)) {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                                            e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive(item.path)) {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                                            e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                                        e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.06)';
                                        }
                                    }}
                                >
                                    {/* Active Indicator - Subtle border instead of dot */}
                                    {isActive(item.path) && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '3px',
                                            background: 'rgb(79 70 229)',
                                            borderRadius: '0 2px 2px 0'
                                        }}></div>
                                    )}
                                    
                                    {/* Icon Container */}
                                    <div style={{
                                        width: window.innerWidth <= 768 ? '2.5rem' : '2.25rem',
                                        height: window.innerWidth <= 768 ? '2.5rem' : '2.25rem',
                                        background: isActive(item.path)
                                            ? 'rgba(79, 70, 229, 0.12)'
                                            : 'rgba(79, 70, 229, 0.06)',
                                        borderRadius: window.innerWidth <= 768 ? '0.5rem' : '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </div>
                                    
                                    {/* Text Content */}
                                    <div style={{
                                        flex: 1,
                                        minWidth: 0,
                                        paddingRight: window.innerWidth <= 768 ? '0.5rem' : '1rem',
                                        paddingTop: window.innerWidth <= 768 ? '0.25rem' : '0',
                                        background: 'transparent'
                                    }}>
                                        <div style={{
                                            fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.875rem',
                                            fontWeight: isActive(item.path) ? '700' : '600',
                                            marginBottom: window.innerWidth <= 768 ? '0.25rem' : '0.25rem',
                                            lineHeight: 1.2,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: window.innerWidth <= 768 ? 'center' : (dir === 'rtl' ? 'right' : 'left'),
                                            maxWidth: '100%',
                                            background: 'transparent',
                                            color: isActive(item.path) ? 'rgb(79 70 229)' : 'rgb(55 65 81)'
                                        }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.75rem',
                                            opacity: isActive(item.path) ? 0.8 : 0.65,
                                            lineHeight: 1.3,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: window.innerWidth <= 768 ? 'center' : (dir === 'rtl' ? 'right' : 'left'),
                                            maxWidth: '100%',
                                            background: 'transparent',
                                            color: isActive(item.path) ? 'rgba(79, 70, 229, 0.8)' : 'rgba(55, 65, 81, 0.65)'
                                        }}>
                                            {item.description}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>


                    </nav>
                    </div>

                {/* Main Content Area */}
                <div style={{
                    flex: 1,
                    minWidth: 0,
                    paddingTop: window.innerWidth <= 768 ? '1rem' : '0'
                }}>
                    <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/restaurants" element={<AdminRestaurants />} />
                        <Route path="/meals" element={<AdminMeals />} />
                        <Route path="/areas" element={<AdminAreas />} />
                        <Route path="/subscriptions" element={<AdminSubscriptions />} />
                        <Route path="/reports" element={<AdminReports />} />
                        <Route path="/subscription-types" element={<SubscriptionTypes />} />
                        <Route path="/contact-information" element={<ContactInformationManagement />} />
                        <Route path="/today-orders" element={<AdminTodayOrders />} />
                </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
