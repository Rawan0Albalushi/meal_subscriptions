import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import SubscriptionForm from './pages/SubscriptionForm';
import MySubscriptions from './pages/MySubscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';
import DeliveryAddresses from './pages/DeliveryAddresses';
import TestDesign from './pages/TestDesign';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    return (
        <>
            {/* Show Navbar on all pages except home, or on home if user is authenticated */}
            {(location.pathname !== '/' || isAuthenticated) && <Navbar />}
            <main style={{ 
                width: '100%', 
                padding: (location.pathname === '/' && !isAuthenticated) ? '0' : '1rem',
                paddingTop: (location.pathname === '/' && !isAuthenticated) ? '0' : '1rem'
            }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/test-design" element={<TestDesign />} />
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
                        path="/subscribe/:restaurantId/:mealId" 
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
