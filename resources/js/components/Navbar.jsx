import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ isAuthenticated, setIsAuthenticated, user, setUser }) => {
    const { t, language, toggleLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                <span className="text-2xl group-hover:animate-bounce">🍽️</span>
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                                {language === 'ar' ? 'اشتراك الوجبات' : 'Meal Subscriptions'}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
                        <Link
                            to="/"
                            className="group relative px-6 py-3 rounded-xl text-gray-700 hover:text-purple-600 text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            <span className="relative z-10">{t('home')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </Link>
                        <Link
                            to="/restaurants"
                            className="group relative px-6 py-3 rounded-xl text-gray-700 hover:text-purple-600 text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            <span className="relative z-10">{t('restaurants')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </Link>
                        
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/my-subscriptions"
                                    className="group relative px-6 py-3 rounded-xl text-gray-700 hover:text-purple-600 text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                >
                                    <span className="relative z-10">{t('mySubscriptions')}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                </Link>
                                <Link
                                    to="/delivery-addresses"
                                    className="group relative px-6 py-3 rounded-xl text-gray-700 hover:text-purple-600 text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                >
                                    <span className="relative z-10">{t('deliveryAddresses')}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                </Link>
                            </>
                        )}

                        <button
                            onClick={toggleLanguage}
                            className="group relative px-6 py-3 rounded-xl text-gray-700 hover:text-purple-600 text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            <span className="relative z-10">{t('language')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </button>

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                {t('logout')}
                            </button>
                        ) : (
                            <button 
                                onClick={() => alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first')}
                                className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                                {t('login')}
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-4 pt-4 pb-6 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200/50">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t('home')}
                        </Link>
                        <Link
                            to="/restaurants"
                            className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t('restaurants')}
                        </Link>
                        
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/my-subscriptions"
                                    className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('mySubscriptions')}
                                </Link>
                                <Link
                                    to="/delivery-addresses"
                                    className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('deliveryAddresses')}
                                </Link>
                            </>
                        )}

                        <button
                            onClick={toggleLanguage}
                            className="text-gray-700 hover:text-purple-600 block w-full text-right px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            {t('language')}
                        </button>

                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="mt-4 bg-red-600 hover:bg-red-700 text-white block w-full text-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                {t('logout')}
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
                                    setIsMenuOpen(false);
                                }}
                                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white block w-full text-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                                {t('login')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

