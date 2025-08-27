import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import RequireRole from './components/RequireRole';
import Home from './pages/Customer/Home';
import Login from './pages/Customer/Login';
import Restaurants from './pages/Customer/Restaurants';
import RestaurantDetail from './pages/Customer/RestaurantDetail';
import SubscriptionForm from './pages/Customer/SubscriptionForm';
import MySubscriptions from './pages/Customer/MySubscriptions';
import SubscriptionDetail from './pages/Customer/SubscriptionDetail';
import DeliveryAddresses from './pages/Customer/DeliveryAddresses';
import AdminLayout from './pages/Admin/AdminLayout';
import SellerLayout from './pages/Seller/SellerLayout';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    return (
        <>
            {/* Show Navbar on all pages */}
            <Navbar />
            <main style={{ 
                width: '100%', 
                padding: (location.pathname === '/' && !isAuthenticated) ? '0' : '1rem',
                paddingTop: (location.pathname === '/' && !isAuthenticated) ? '0' : '1rem'
            }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/restaurants" element={<Restaurants />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                    <Route 
                        path="/subscribe/:restaurantId" 
                        element={
                            isAuthenticated ? 
                            <SubscriptionForm /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/subscribe/:restaurantId/:subscriptionType/:startDate/:mealIds" 
                        element={
                            isAuthenticated ? 
                            <SubscriptionForm /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/my-subscriptions" 
                        element={
                            isAuthenticated ? 
                            <MySubscriptions /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/subscriptions/:id" 
                        element={
                            isAuthenticated ? 
                            <SubscriptionDetail /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/delivery-addresses" 
                        element={
                            isAuthenticated ? 
                            <DeliveryAddresses /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    
                    {/* Admin routes */}
                    <Route 
                        path="/admin/*" 
                        element={
                            <RequireRole role="admin">
                                <AdminLayout />
                            </RequireRole>
                        } 
                    />
                    
                    {/* Seller routes */}
                    <Route 
                        path="/seller/*" 
                        element={
                            <RequireRole role="seller">
                                <SellerLayout />
                            </RequireRole>
                        } 
                    />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </LanguageProvider>
    );
}

// Render the React app
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
