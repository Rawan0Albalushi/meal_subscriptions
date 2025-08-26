import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500">Admin Panel</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
                            <p className="text-gray-600">Welcome to the admin panel. This is a placeholder for admin functionality.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
