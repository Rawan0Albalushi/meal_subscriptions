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
import ContactUs from './pages/Customer/ContactUs';
import ContactInformationManagement from './pages/Admin/ContactInformationManagement';
import AdminLayout from './pages/Admin/AdminLayout';
import SellerLayout from './pages/Seller/SellerLayout';

import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Check if current path is seller dashboard
    const isSellerPath = location.pathname.startsWith('/seller');

    return (
        <>
            {/* Global Background Wrapper */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f8fafc 100%)',
                backgroundAttachment: 'fixed',
                zIndex: -2
            }}></div>
            
            {/* Background Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
                `,
                pointerEvents: 'none',
                zIndex: -1
            }}></div>
            
            {/* Show Navbar on all pages except seller dashboard */}
            {!isSellerPath && <Navbar />}
            <main style={{ 
                width: '100%', 
                padding: (location.pathname === '/' && !isAuthenticated) ? '0' : '1rem',
                paddingTop: (location.pathname === '/' && !isAuthenticated) ? '0' : '1rem',
                position: 'relative',
                zIndex: 1,
                background: 'transparent'
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
                    <Route path="/contact-us" element={<ContactUs />} />
                    
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
