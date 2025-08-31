import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ContactInformationManagement from './ContactInformationManagement';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'transparent'
        }}>
            {/* Admin Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '4rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem'
                        }}>
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#2f6e73'
                            }}>
                                لوحة تحكم المدير
                            </h1>
                            
                            {/* Navigation Links */}
                            <nav style={{
                                display: 'flex',
                                gap: '1rem'
                            }}>
                                <Link
                                    to="/admin/contact-information"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        textDecoration: 'none',
                                        color: isActive('/admin/contact-information') ? 'white' : '#2f6e73',
                                        backgroundColor: isActive('/admin/contact-information') ? '#2f6e73' : 'transparent',
                                        fontWeight: isActive('/admin/contact-information') ? '600' : '500',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive('/admin/contact-information')) {
                                            e.target.style.backgroundColor = 'rgba(47, 110, 115, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive('/admin/contact-information')) {
                                            e.target.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    معلومات التواصل
                                </Link>
                            </nav>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '0.875rem',
                                color: 'rgb(107 114 128)'
                            }}>
                                لوحة تحكم المدير
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '1rem'
            }}>
                <Routes>
                    <Route path="/contact-information" element={<ContactInformationManagement />} />
                    <Route path="/" element={
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            padding: '3rem',
                            textAlign: 'center',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#2f6e73',
                                marginBottom: '1rem'
                            }}>
                                لوحة تحكم المدير
                            </h2>
                            <p style={{
                                color: 'rgb(107 114 128)',
                                fontSize: '1.125rem',
                                marginBottom: '2rem'
                            }}>
                                مرحباً بك في لوحة تحكم المدير. اختر من القائمة أعلاه للوصول إلى الميزات المختلفة.
                            </p>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '1rem'
                            }}>
                                <Link
                                    to="/admin/contact-information"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#2f6e73',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgb(67 56 202)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#2f6e73';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    إدارة معلومات التواصل
                                </Link>
                            </div>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
};

export default AdminLayout;
