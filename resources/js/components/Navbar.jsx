import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

const Navbar = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const { logout, user, isAuthenticated } = useAuth();
    const { getCartItemsCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Get page title based on current location
    const getPageTitle = () => {
        // Always return the platform name regardless of the page
        return language === 'ar' ? 'اشتراكات الوجبات' : 'Meal Subscriptions';
    };

    return (
        <>
            {/* Simple Header - Consistent across all pages */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        height: 'clamp(3.5rem, 8vw, 4rem)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        {/* Logo Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                                    background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                                    borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                        }}>
                                    🍽️
                        </div>
                                <span style={{ 
                                    fontSize: '1.25rem', 
                                    fontWeight: 'bold', 
                                    background: 'linear-gradient(135deg, #4a757c, #ba6c5d)', 
                                    WebkitBackgroundClip: 'text', 
                                    WebkitTextFillColor: 'transparent' 
                                }}>
                                    {getPageTitle()}
                                </span>
                            </Link>
                        </div>

                        {/* Center Section - Navigation Links (Desktop) */}
                        <div style={{ 
                            display: windowWidth > 768 ? 'flex' : 'none',
                            alignItems: 'center', 
                            gap: 'clamp(0.5rem, 2vw, 1rem)',
                            flexWrap: 'wrap'
                        }}>
                            <Link to="/restaurants" style={{
                                padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                borderRadius: '0.5rem',
                                color: '#4a757c',
                                textDecoration: 'none',
                                fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(74, 117, 124, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                            >
                                {t('restaurants')}
                            </Link>
                            
                            <Link to="/my-subscriptions" style={{
                                padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                borderRadius: '0.5rem',
                                color: '#4a757c',
                                textDecoration: 'none',
                                fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(74, 117, 124, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                                    >
                                        {t('mySubscriptions')}
                                    </Link>

                            {isAuthenticated && (
                                <Link to="/cart" style={{
                                    padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                    borderRadius: '0.5rem',
                                    color: '#4a757c',
                                    textDecoration: 'none',
                                    fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(74, 117, 124, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                }}
                                >
                                    🛒 {language === 'ar' ? 'السلة' : 'Cart'}
                                    {getCartItemsCount() > 0 && (
                                        <span style={{
                                            background: '#ef4444',
                                            borderRadius: '50%',
                                            width: '0.5rem',
                                            height: '0.5rem',
                                            display: 'inline-block',
                                            marginLeft: '0.375rem'
                                        }}></span>
                                    )}
                                </Link>
                            )}

                            <Link to="/contact-us" style={{
                                padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                borderRadius: '0.5rem',
                                color: '#4a757c',
                                textDecoration: 'none',
                                fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(74, 117, 124, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                            >
                                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                            </Link>

                        </div>

                        {/* Mobile Menu Button */}
                        {windowWidth <= 768 && (
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{
                                    width: 'clamp(2.5rem, 6vw, 3rem)',
                                    height: 'clamp(2.5rem, 6vw, 3rem)',
                                    borderRadius: '0.5rem',
                                    background: 'linear-gradient(135deg, #4a757c, #ba6c5d)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {isMobileMenuOpen ? '✕' : '☰'}
                            </button>
                        )}

                        {/* Right Section - Simple Auth (Desktop) */}
                        <div style={{ 
                            display: windowWidth > 768 ? 'flex' : 'none',
                            alignItems: 'center', 
                            gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                            flexWrap: 'wrap'
                        }}>
                            {/* Language Toggle Button - Always Visible */}
                            <button
                                onClick={toggleLanguage}
                                style={{
                                    width: 'clamp(2.5rem, 5vw, 2.75rem)',
                                    height: 'clamp(2.5rem, 5vw, 2.75rem)',
                                    borderRadius: '0.75rem',
                                    color: '#2f6e73',
                                    border: '2px solid rgba(47, 110, 115, 0.3)',
                                    fontWeight: '600',
                                    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(47, 110, 115, 0.15)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backdropFilter: 'blur(10px)',
                                    whiteSpace: 'nowrap'
                                }}
                                title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-3px) scale(1.08)';
                                    e.target.style.boxShadow = '0 12px 25px rgba(47, 110, 115, 0.25)';
                                    e.target.style.borderColor = 'rgba(47, 110, 115, 0.6)';
                                    e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(47, 110, 115, 0.15)';
                                    e.target.style.borderColor = 'rgba(47, 110, 115, 0.3)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                                }}
                            >
                                🌐
                            </button>

                            {isAuthenticated && user ? (
                                <>
                                    <span style={{
                                        padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                        borderRadius: '0.5rem',
                                        color: '#2f6e73',
                                        fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {t('hello')} {user?.full_name || user?.name || t('user')}
                                    </span>
                                    
                                    {/* Dashboard Link for Admin/Seller */}
                                    {(user.role === 'admin' || user.role === 'seller') && (
                                        <Link to={user.role === 'admin' ? '/admin' : '/seller'} style={{
                                            padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                            borderRadius: '0.5rem',
                                            background: 'rgba(47, 110, 115, 0.1)',
                                            color: '#2f6e73',
                                            textDecoration: 'none',
                                            fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                            fontWeight: '500',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(47, 110, 115, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                        }}
                                        >
                                            {user.role === 'admin' ? 'لوحة التحكم' : 'لوحة البائع'}
                                        </Link>
                                    )}
                                    
                                     <button
                                         onClick={handleLogout}
                                        style={{
                                            padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                            borderRadius: '0.5rem',
                                            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(47, 110, 115, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                     >
                                         {t('logout')}
                                     </button>
                                     
                                    {/* Language Toggle Button */}
                                </>
                            ) : (
                                <Link to="/login" style={{
                                    padding: 'clamp(0.375rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem)',
                                    borderRadius: '0.5rem',
                                    color: '#2f6e73',
                                    textDecoration: 'none',
                                    fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                }}
                                     >
                                         {t('login')}
                                 </Link>
                             )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {windowWidth <= 768 && isMobileMenuOpen && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                        padding: '1rem',
                        animation: 'slideDown 0.3s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {/* Navigation Links */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                <Link to="/restaurants" 
                                    style={{
                                        padding: 'clamp(0.75rem, 3vw, 1rem)',
                                        borderRadius: '0.75rem',
                                        color: '#2f6e73',
                                        textDecoration: 'none',
                                        fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                        fontWeight: '600',
                                        background: 'rgba(47, 110, 115, 0.05)',
                                        border: '1px solid rgba(47, 110, 115, 0.1)',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                        e.target.style.transform = 'translateX(-5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(47, 110, 115, 0.05)';
                                        e.target.style.transform = 'translateX(0)';
                                    }}
                                >
                                    🍽️ {t('restaurants')}
                            </Link>
                            
                                <Link to="/my-subscriptions" 
                                    style={{
                                        padding: 'clamp(0.75rem, 3vw, 1rem)',
                                        borderRadius: '0.75rem',
                                        color: '#2f6e73',
                                        textDecoration: 'none',
                                        fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                        fontWeight: '600',
                                        background: 'rgba(47, 110, 115, 0.05)',
                                        border: '1px solid rgba(47, 110, 115, 0.1)',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                        e.target.style.transform = 'translateX(-5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(47, 110, 115, 0.05)';
                                        e.target.style.transform = 'translateX(0)';
                                    }}
                                >
                                    📋 {t('mySubscriptions')}
                                    </Link>

                                {isAuthenticated && (
                                    <Link to="/cart" 
                                        style={{
                                            padding: 'clamp(0.75rem, 3vw, 1rem)',
                                            borderRadius: '0.75rem',
                                            color: '#2f6e73',
                                            textDecoration: 'none',
                                            fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                            fontWeight: '600',
                                            background: 'rgba(47, 110, 115, 0.05)',
                                            border: '1px solid rgba(47, 110, 115, 0.1)',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                            e.target.style.transform = 'translateX(-5px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(47, 110, 115, 0.05)';
                                            e.target.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        🛒 {language === 'ar' ? 'السلة' : 'Cart'}
                                        {getCartItemsCount() > 0 && (
                                            <span style={{
                                                background: '#ef4444',
                                                borderRadius: '50%',
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                display: 'inline-block',
                                                marginInlineStart: '0.375rem'
                                            }}></span>
                                        )}
                                    </Link>
                                )}

                                <Link to="/contact-us" 
                                    style={{
                                        padding: 'clamp(0.75rem, 3vw, 1rem)',
                                        borderRadius: '0.75rem',
                                        color: '#2f6e73',
                                        textDecoration: 'none',
                                        fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                        fontWeight: '600',
                                        background: 'rgba(47, 110, 115, 0.05)',
                                        border: '1px solid rgba(47, 110, 115, 0.1)',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                        e.target.style.transform = 'translateX(-5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(47, 110, 115, 0.05)';
                                        e.target.style.transform = 'translateX(0)';
                                    }}
                                >
                                    📞 {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                                </Link>
                            </div>

                            {/* Language Toggle */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '0.75rem 0',
                                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                            <button
                                onClick={toggleLanguage}
                                    style={{
                                        padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 5vw, 2rem)',
                                        borderRadius: '1rem',
                                        color: '#2f6e73',
                                        border: '2px solid #2f6e73',
                                        background: 'rgba(47, 110, 115, 0.05)',
                                        fontWeight: '600',
                                        fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(47, 110, 115, 0.15)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                        e.target.style.background = '#2f6e73';
                                        e.target.style.color = 'white';
                                        e.target.style.boxShadow = '0 8px 20px rgba(47, 110, 115, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.background = 'rgba(47, 110, 115, 0.05)';
                                        e.target.style.color = '#2f6e73';
                                        e.target.style.boxShadow = '0 4px 12px rgba(47, 110, 115, 0.15)';
                                    }}
                                >
                                    🌐 {language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                            </button>
                            </div>

                            {/* Auth Section */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                                                                                                   {isAuthenticated && user ? (
                                    <>
                                        <div style={{
                                            padding: 'clamp(0.75rem, 3vw, 1rem)',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(47, 110, 115, 0.05)',
                                            border: '1px solid rgba(47, 110, 115, 0.1)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                                                color: '#2f6e73',
                                                fontWeight: '600',
                                                marginBottom: '0.25rem'
                                            }}>
                                                👋 {t('hello')}
                                            </div>
                                            <div style={{
                                                fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                                                color: 'rgb(75 85 99)'
                                            }}>
                                                {user?.full_name || user?.name || 'المستخدم'}
                                            </div>
                                        </div>
                                        
                                        {/* Dashboard Link for Admin/Seller in Mobile */}
                                        {(user.role === 'admin' || user.role === 'seller') && (
                                            <Link to={user.role === 'admin' ? '/admin' : '/seller'} 
                                                style={{
                                                    padding: 'clamp(0.75rem, 3vw, 1rem)',
                                                    borderRadius: '0.75rem',
                                                    background: 'rgba(47, 110, 115, 0.1)',
                                                    color: '#2f6e73',
                                                    textDecoration: 'none',
                                                    fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                                    fontWeight: '600',
                                                    border: '1px solid rgba(47, 110, 115, 0.2)',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'center'
                                                }}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'rgba(47, 110, 115, 0.2)';
                                                    e.target.style.transform = 'translateX(-5px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'rgba(47, 110, 115, 0.1)';
                                                    e.target.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                🎛️ {user.role === 'admin' ? 'لوحة التحكم' : 'لوحة البائع'}
                                            </Link>
                                        )}
                                        
                                 <button
                                     onClick={() => {
                                         handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            style={{
                                                padding: 'clamp(0.75rem, 3vw, 1rem)',
                                                borderRadius: '0.75rem',
                                                background: 'linear-gradient(135deg, rgb(239 68 68), rgb(220 38 38))',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                                            }}
                                        >
                                            🚪 {t('logout')}
                                 </button>
                                    </>
                                ) : (
                                    <Link to="/login" 
                                                                            style={{
                                        padding: 'clamp(0.75rem, 3vw, 1rem)',
                                        borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 15px rgba(47, 110, 115, 0.3)'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(47, 110, 115, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(47, 110, 115, 0.3)';
                                    }}
                                    >
                                        🔐 {t('login')}
                                 </Link>
                             )}
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Navbar;

