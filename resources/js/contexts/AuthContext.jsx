import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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

    // Check if user is logged in on app start
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
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
                
                // Update state
                setUser(user);
                
                return { success: true, data: response.data.data };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
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
                
                // Update state
                setUser(user);
                
                return { success: true, data: response.data.data };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
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
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            
            // Update state
            setUser(null);
            setError(null);
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
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
