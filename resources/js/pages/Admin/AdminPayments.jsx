import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminPayments = () => {
    const { t, dir, language } = useLanguage();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        payment_method: 'all',
        restaurant_id: '',
        user_id: '',
        amount_from: '',
        amount_to: '',
        date_from: '',
        date_to: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundData, setRefundData] = useState({
        refund_amount: '',
        refund_reason: ''
    });
    const [formData, setFormData] = useState({
        status: 'pending',
        notes: ''
    });

    useEffect(() => {
        fetchPayments();
        fetchRestaurants();
        fetchUsers();
        fetchPaymentMethods();
        fetchStatusOptions();
        fetchStatistics();
    }, [pagination.current_page, searchTerm, filters]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.current_page,
                search: searchTerm,
                ...filters
            });

            // Remove empty values from params
            for (let [key, value] of params.entries()) {
                if (value === '' || value === 'all') {
                    params.delete(key);
                }
            }

            const response = await fetch(`/api/admin/payments?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    setPayments(data.data || []);
                    setPagination(data.pagination || {});
                } else {
                    setPayments([]);
                }
            } else {
                setPayments([]);
            }
        } catch (error) {
            console.error('💥 Network Error fetching payments:', error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/admin/payments/restaurants/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setRestaurants(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/payments/users/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUsers(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch('/api/admin/payments/methods/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setPaymentMethods(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const fetchStatusOptions = async () => {
        try {
            const response = await fetch('/api/admin/payments/status-options', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStatusOptions(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error fetching status options:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/api/admin/payments/statistics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    setStatistics(data.data || {});
                }
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current_page: page }));
    };

    const handleEdit = (payment) => {
        setEditingPayment(payment);
        setFormData({
            status: payment.status,
            notes: payment.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/payments/${editingPayment.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowModal(false);
                setEditingPayment(null);
                fetchPayments();
            }
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    const handleRefund = (payment) => {
        setEditingPayment(payment);
        setRefundData({
            refund_amount: payment.amount,
            refund_reason: ''
        });
        setShowRefundModal(true);
    };

    const handleRefundSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/payments/${editingPayment.id}/refund`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(refundData)
            });

            if (response.ok) {
                setShowRefundModal(false);
                setEditingPayment(null);
                fetchPayments();
                fetchStatistics();
            }
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    };

    const getStatusLabel = (status) => {
        const statusOption = statusOptions.find(option => option.value === status);
        return statusOption ? (language === 'ar' ? statusOption.label_ar : statusOption.label_en) : status;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            completed: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            failed: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            refunded: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
        };
        return colors[status] || colors.pending;
    };

    const getPaymentMethodLabel = (method) => {
        const methodOption = paymentMethods.find(option => option.value === method);
        return methodOption ? (language === 'ar' ? methodOption.label_ar : methodOption.label_en) : method;
    };

    const getRestaurantName = (payment) => {
        // For now, return N/A since we simplified the backend
        // This can be enhanced later when we add proper restaurant relationships
        return 'N/A';
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'OMR'
        }).format(amount);
    };


    return (
        <div style={{ direction: dir }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        💳 {language === 'ar' ? 'إدارة المدفوعات' : 'Payments Management'}
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '1.1rem'
                    }}>
                        {language === 'ar' ? 'إدارة جميع المدفوعات في النظام' : 'Manage all payments in the system'}
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.totalPayments || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'إجمالي المدفوعات' : 'Total Payments'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#10b981',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.completedPayments || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'مدفوعات مكتملة' : 'Completed Payments'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#ef4444',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.failedPayments || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'مدفوعات فاشلة' : 'Failed Payments'}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#8b5cf6',
                        marginBottom: '0.5rem'
                    }}>
                        {formatCurrency(statistics.totalAmount || 0)}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'إجمالي المبلغ' : 'Total Amount'}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    alignItems: 'end'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'البحث' : 'Search'}
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder={language === 'ar' ? 'البحث في المدفوعات...' : 'Search payments...'}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                transition: 'border-color 0.3s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'الحالة' : 'Status'}
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {language === 'ar' ? option.label_ar : option.label_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                        </label>
                        <select
                            value={filters.payment_method}
                            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">{language === 'ar' ? 'جميع الطرق' : 'All Methods'}</option>
                            {paymentMethods.map(method => (
                                <option key={method.value} value={method.value}>
                                    {language === 'ar' ? method.label_ar : method.label_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'المطعم' : 'Restaurant'}
                        </label>
                        <select
                            value={filters.restaurant_id}
                            onChange={(e) => handleFilterChange('restaurant_id', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">{language === 'ar' ? 'جميع المطاعم' : 'All Restaurants'}</option>
                            {restaurants.map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'العميل' : 'Customer'}
                        </label>
                        <select
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">{language === 'ar' ? 'جميع العملاء' : 'All Customers'}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'من مبلغ' : 'From Amount'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={filters.amount_from}
                            onChange={(e) => handleFilterChange('amount_from', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'إلى مبلغ' : 'To Amount'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={filters.amount_to}
                            onChange={(e) => handleFilterChange('amount_to', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'من تاريخ' : 'From Date'}
                        </label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
                        </label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#6b7280'
                    }}>
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#6b7280'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }}>
                            💳
                        </div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? 'لا توجد مدفوعات' : 'No Payments Found'}
                        </h3>
                        <p style={{
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            {language === 'ar' 
                                ? 'لم يتم العثور على أي مدفوعات تطابق المعايير المحددة' 
                                : 'No payments found matching the specified criteria'
                            }
                        </p>
                    </div>
                ) : (
                    <>

                        <div style={{
                            display: 'grid',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {payments.map(payment => (
                                <div key={payment.id} style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                margin: 0,
                                                marginBottom: '0.5rem'
                                            }}>
                                                {language === 'ar' ? 'دفعة' : 'Payment'} #{payment.id}
                                            </h3>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                flexWrap: 'wrap',
                                                fontSize: '0.875rem',
                                                color: '#6b7280'
                                            }}>
                                                <span>
                                                    <strong>{language === 'ar' ? 'العميل:' : 'Customer:'}</strong> {getUserName(payment.user_id)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'المطعم:' : 'Restaurant:'}</strong> {getRestaurantName(payment)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'}</strong> {getPaymentMethodLabel(payment.gateway_name)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'المبلغ:' : 'Amount:'}</strong> {formatCurrency(payment.amount)}
                                                </span>
                                                <span>
                                                    <strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {formatDate(payment.created_at)}
                                                </span>
                                                {payment.id && (
                                                    <span>
                                                        <strong>{language === 'ar' ? 'رقم المعاملة:' : 'Transaction ID:'}</strong> {payment.id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                background: getStatusColor(payment.status),
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600'
                                            }}>
                                                {getStatusLabel(payment.status)}
                                            </span>
                                            
                                            <button
                                                onClick={() => handleEdit(payment)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                ✏️ {language === 'ar' ? 'تعديل' : 'Edit'}
                                            </button>
                                            
                                            {payment.status === 'completed' && (
                                                <button
                                                    onClick={() => handleRefund(payment)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.875rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    💰 {language === 'ar' ? 'استرداد' : 'Refund'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {payment.notes && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#1e40af',
                                                margin: 0,
                                                marginBottom: '0.5rem'
                                            }}>
                                                {language === 'ar' ? 'ملاحظات:' : 'Notes:'}
                                            </h4>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#1e40af',
                                                margin: 0,
                                                lineHeight: '1.5'
                                            }}>
                                                {payment.notes}
                                            </p>
                                        </div>
                                    )}

                                    {payment.refund_amount && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(139, 92, 246, 0.2)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#7c3aed',
                                                margin: 0,
                                                marginBottom: '0.5rem'
                                            }}>
                                                {language === 'ar' ? 'معلومات الاسترداد:' : 'Refund Information:'}
                                            </h4>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#7c3aed',
                                                lineHeight: '1.5'
                                            }}>
                                                <p style={{ margin: '0.25rem 0' }}>
                                                    <strong>{language === 'ar' ? 'مبلغ الاسترداد:' : 'Refund Amount:'}</strong> {formatCurrency(payment.refund_amount)}
                                                </p>
                                                {payment.refund_reason && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'سبب الاسترداد:' : 'Refund Reason:'}</strong> {payment.refund_reason}
                                                    </p>
                                                )}
                                                {payment.refunded_at && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'تاريخ الاسترداد:' : 'Refund Date:'}</strong> {formatDate(payment.refunded_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '2rem'
                            }}>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: pagination.current_page === 1 ? '#f9fafb' : 'white',
                                        color: pagination.current_page === 1 ? '#9ca3af' : '#374151',
                                        cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'السابق' : 'Previous'}
                                </button>

                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '2px solid',
                                            borderColor: page === pagination.current_page ? '#667eea' : '#e5e7eb',
                                            borderRadius: '0.5rem',
                                            backgroundColor: page === pagination.current_page ? '#667eea' : 'white',
                                            color: page === pagination.current_page ? 'white' : '#374151',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: pagination.current_page === pagination.last_page ? '#f9fafb' : 'white',
                                        color: pagination.current_page === pagination.last_page ? '#9ca3af' : '#374151',
                                        cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'التالي' : 'Next'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: '#1f2937'
                        }}>
                            {language === 'ar' ? 'تعديل المدفوعة' : 'Edit Payment'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'الحالة' : 'Status'} *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {language === 'ar' ? option.label_ar : option.label_en}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'تحديث' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: '#1f2937'
                        }}>
                            {language === 'ar' ? 'استرداد المدفوعة' : 'Refund Payment'}
                        </h2>

                        <form onSubmit={handleRefundSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'مبلغ الاسترداد' : 'Refund Amount'} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={editingPayment?.amount}
                                    value={refundData.refund_amount}
                                    onChange={(e) => setRefundData(prev => ({ ...prev, refund_amount: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem'
                                    }}
                                />
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    margin: '0.5rem 0 0 0'
                                }}>
                                    {language === 'ar' ? 'الحد الأقصى:' : 'Maximum:'} {formatCurrency(editingPayment?.amount || 0)}
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'سبب الاسترداد' : 'Refund Reason'} *
                                </label>
                                <textarea
                                    value={refundData.refund_reason}
                                    onChange={(e) => setRefundData(prev => ({ ...prev, refund_reason: e.target.value }))}
                                    rows="4"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowRefundModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {language === 'ar' ? 'استرداد' : 'Refund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
