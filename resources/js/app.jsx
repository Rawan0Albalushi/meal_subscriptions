import './bootstrap';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import SubscriptionForm from './pages/SubscriptionForm';
import MySubscriptions from './pages/MySubscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';
import DeliveryAddresses from './pages/DeliveryAddresses';
import TestDesign from './pages/TestDesign';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
            // You can add API call to verify token here
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <LanguageProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar 
                        isAuthenticated={isAuthenticated} 
                        setIsAuthenticated={setIsAuthenticated}
                        user={user}
                        setUser={setUser}
                    />
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<Home />} />
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
                </div>
            </Router>
        </LanguageProvider>
    );
}

// Render the React app
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
