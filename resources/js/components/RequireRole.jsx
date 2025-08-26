import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const RequireRole = ({ role, children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RequireRole;
