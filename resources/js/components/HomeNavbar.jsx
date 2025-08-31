import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const HomeNavbar = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const { logout, user, isAuthenticated } = useAuth();
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const navigate = useNavigate();

    // Track window width for responsive behavior
    const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    React.useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show welcome message when user is authenticated
    React.useEffect(() => {
        if (isAuthenticated && user) {
            // Only show welcome message if this is a fresh login (not page reload)
            const hasShownWelcome = sessionStorage.getItem('welcomeShown');
            const isFreshLogin = sessionStorage.getItem('isFreshLogin');
            
            if (!hasShownWelcome && isFreshLogin) {
                setShowWelcomeMessage(true);
                sessionStorage.setItem('welcomeShown', 'true');
                sessionStorage.removeItem('isFreshLogin'); // Clear the fresh login flag
                const timer = setTimeout(() => {
                    setShowWelcomeMessage(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            // Clear the flag when user logs out
            sessionStorage.removeItem('welcomeShown');
            sessionStorage.removeItem('isFreshLogin');
        }
    }, [isAuthenticated, user]);

    const handleLogout = () => {
        logout();
        setShowWelcomeMessage(false);
        sessionStorage.removeItem('welcomeShown');
        navigate('/');
    };

    return (
        <>
            {/* Welcome Message Toast */}
            {showWelcomeMessage && user && (
                <div className="success-message" style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, #2f6e73, #b65449)',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    maxWidth: '400px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            👋
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                {t('welcome')} {user.full_name || user.name || t('dear')}!
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                                {t('loginSuccess')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Header - Matching Restaurants page */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
                        {/* Logo Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
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
                                background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                {language === 'ar' ? 'اشتراكات الوجبات' : 'Meal Subscriptions'}
                            </span>
                        </div>

                        {/* Center Section - Navigation Links */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/restaurants" style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                color: '#2f6e73',
                                textDecoration: 'none',
                                fontSize: '1.125rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}>
                                {t('restaurants')}
                            </Link>
                            
                            <Link to="/my-subscriptions" style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                color: '#2f6e73',
                                textDecoration: 'none',
                                fontSize: '1.125rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}>
                                {t('mySubscriptions')}
                            </Link>


                        </div>

                        {/* Right Section - Simple Auth */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Language Toggle Button - Always Visible */}
                            <button
                                onClick={toggleLanguage}
                                style={{
                                    width: '2.75rem',
                                    height: '2.75rem',
                                    borderRadius: '0.75rem',
                                    color: '#2f6e73',
                                    border: '2px solid rgba(47, 110, 115, 0.3)',
                                    fontWeight: '600',
                                    fontSize: '1.5rem',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(47, 110, 115, 0.15)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backdropFilter: 'blur(10px)'
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
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        color: '#2f6e73',
                                        fontSize: '1.125rem',
                                        fontWeight: '500'
                                    }}>
                                        {t('hello')} {user?.full_name || user?.name || t('user')}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '1.125rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {t('logout')}
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    color: '#2f6e73',
                                    textDecoration: 'none',
                                    fontSize: '1.125rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}>
                                    {t('login')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default HomeNavbar;
