import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { t } = useLanguage();

    // Function to clear all auth data
    const clearAuthData = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('welcomeShown');
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    };

    // Function to validate auth data
    const validateAuthData = (token, userData) => {
        if (!token || !userData) {
            return false;
        }
        
        try {
            const user = JSON.parse(userData);
            return user && (user.id || user.email) && token.length > 10;
        } catch (error) {
            return false;
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                setUser(user);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                clearAuthData();
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            
            if (response.data.success) {
                const { user, token } = response.data.data;
                
                // Save to localStorage
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Set fresh login flag for welcome message
                sessionStorage.setItem('isFreshLogin', 'true');
                
                // Update state
                setUser(user);
                setIsAuthenticated(true);
                
                return { success: true, data: response.data.data };
            } else {
                const errorMessage = response.data.message || t('loginError');
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('loginError');
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            
            if (response.data.success) {
                const { user, token } = response.data.data;
                
                // Save to localStorage
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Set fresh login flag for welcome message
                sessionStorage.setItem('isFreshLogin', 'true');
                
                // Update state
                setUser(user);
                setIsAuthenticated(true);
                
                return { success: true, data: response.data.data };
            } else {
                const errorMessage = response.data.message || t('registrationError');
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('registrationError');
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthData();
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
