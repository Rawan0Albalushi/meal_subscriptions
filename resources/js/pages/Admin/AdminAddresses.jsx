import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import { usePopupMessage } from '../../hooks/usePopupMessage';

const AdminAddresses = () => {
    const { t, dir, language } = useLanguage();
    const { popup, showConfirm, showSuccess, showError, hidePopup } = usePopupMessage();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        area: '',
        user_id: '',
        is_primary: 'all'
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });
    const [users, setUsers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        address: '',
        area: '',
        building_number: '',
        street: '',
        floor: '',
        apartment: '',
        landmark: '',
        is_primary: false
    });

    useEffect(() => {
        fetchAddresses();
        fetchUsers();
        fetchAreas();
        fetchStatistics();
    }, [pagination.current_page, searchTerm, filters]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.current_page,
                search: searchTerm,
                ...filters
            });

            const response = await fetch(`/api/admin/addresses?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAddresses(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/addresses/users/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await fetch('/api/admin/addresses/areas/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAreas(data.data);
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/api/admin/addresses/statistics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStatistics(data.data);
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

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            user_id: address.user_id,
            address: address.address,
            area: address.area,
            building_number: address.building_number || '',
            street: address.street || '',
            floor: address.floor || '',
            apartment: address.apartment || '',
            landmark: address.landmark || '',
            is_primary: address.is_primary
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingAddress 
                ? `/api/admin/addresses/${editingAddress.id}`
                : '/api/admin/addresses';
            
            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowModal(false);
                setEditingAddress(null);
                fetchAddresses();
                fetchStatistics();
            }
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleDelete = async (id) => {
        const address = addresses.find(a => a.id === id);
        const addressInfo = address 
            ? `${address.area || 'Unknown'} - ${address.street || 'Unknown'}`
            : 'العنوان';
        
        showConfirm(
            language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
            language === 'ar' 
                ? `هل أنت متأكد من حذف العنوان "${addressInfo}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete address "${addressInfo}"? This action cannot be undone.`,
            async () => {
            try {
                const response = await fetch(`/api/admin/addresses/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    fetchAddresses();
                    fetchStatistics();
                        showSuccess(
                            language === 'ar' ? 'تم حذف العنوان بنجاح' : 'Address deleted successfully',
                            language === 'ar' ? 'نجح الحذف' : 'Delete Successful'
                        );
                    } else {
                        showError(
                            language === 'ar' ? 'حدث خطأ أثناء حذف العنوان' : 'Error deleting address',
                            language === 'ar' ? 'خطأ في الحذف' : 'Delete Error'
                        );
                }
            } catch (error) {
                console.error('Error deleting address:', error);
                    showError(
                        language === 'ar' ? 'حدث خطأ أثناء حذف العنوان' : 'Error deleting address',
                        language === 'ar' ? 'خطأ في الحذف' : 'Delete Error'
                    );
            }
            },
            {
                confirmText: language === 'ar' ? 'حذف' : 'Delete',
                cancelText: language === 'ar' ? 'إلغاء' : 'Cancel'
        }
        );
    };

    const handleSetPrimary = async (id) => {
        try {
            const response = await fetch(`/api/admin/addresses/${id}/set-primary`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchAddresses();
            }
        } catch (error) {
            console.error('Error setting primary address:', error);
        }
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown';
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
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
                            📍 {language === 'ar' ? 'إدارة العناوين' : 'Addresses Management'}
                        </h1>
                        <p style={{
                            color: '#6b7280',
                            margin: 0,
                            fontSize: '1.1rem'
                        }}>
                            {language === 'ar' ? 'إدارة جميع عناوين التوصيل في النظام' : 'Manage all delivery addresses in the system'}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAddress(null);
                            setFormData({
                                user_id: '',
                                address: '',
                                area: '',
                                building_number: '',
                                street: '',
                                floor: '',
                                apartment: '',
                                landmark: '',
                                is_primary: false
                            });
                            setShowModal(true);
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        ➕ {language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}
                    </button>
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
                        {statistics.totalAddresses || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'إجمالي العناوين' : 'Total Addresses'}
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
                        {statistics.primaryAddresses || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'عناوين رئيسية' : 'Primary Addresses'}
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
                        color: '#f59e0b',
                        marginBottom: '0.5rem'
                    }}>
                        {statistics.usersWithAddresses || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'عملاء لديهم عناوين' : 'Users with Addresses'}
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
                        {statistics.averageAddressesPerUser?.toFixed(1) || 0}
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        {language === 'ar' ? 'متوسط العناوين لكل عميل' : 'Avg Addresses per User'}
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                            placeholder={language === 'ar' ? 'البحث في العناوين...' : 'Search addresses...'}
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
                            {language === 'ar' ? 'المنطقة' : 'Area'}
                        </label>
                        <select
                            value={filters.area}
                            onChange={(e) => handleFilterChange('area', e.target.value)}
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
                            <option value="">{language === 'ar' ? 'جميع المناطق' : 'All Areas'}</option>
                            {areas.map(area => (
                                <option key={area} value={area}>
                                    {area}
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
                            {language === 'ar' ? 'نوع العنوان' : 'Address Type'}
                        </label>
                        <select
                            value={filters.is_primary}
                            onChange={(e) => handleFilterChange('is_primary', e.target.value)}
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
                            <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                            <option value="primary">{language === 'ar' ? 'رئيسي' : 'Primary'}</option>
                            <option value="secondary">{language === 'ar' ? 'ثانوي' : 'Secondary'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Addresses List */}
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
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {addresses.map(address => (
                                <div key={address.id} style={{
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
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <h3 style={{
                                                    fontSize: '1.25rem',
                                                    fontWeight: 'bold',
                                                    color: '#1f2937',
                                                    margin: 0
                                                }}>
                                                    {language === 'ar' ? 'عنوان' : 'Address'} #{address.id}
                                                </h3>
                                                {address.is_primary && (
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {language === 'ar' ? 'رئيسي' : 'Primary'}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                marginBottom: '1rem'
                                            }}>
                                                <p style={{ margin: '0.25rem 0' }}>
                                                    <strong>{language === 'ar' ? 'العميل:' : 'Customer:'}</strong> {getUserName(address.user_id)}
                                                </p>
                                                <p style={{ margin: '0.25rem 0' }}>
                                                    <strong>{language === 'ar' ? 'المنطقة:' : 'Area:'}</strong> {address.area}
                                                </p>
                                                <p style={{ margin: '0.25rem 0' }}>
                                                    <strong>{language === 'ar' ? 'العنوان:' : 'Address:'}</strong> {address.address}
                                                </p>
                                                {address.building_number && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'رقم المبنى:' : 'Building Number:'}</strong> {address.building_number}
                                                    </p>
                                                )}
                                                {address.street && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'الشارع:' : 'Street:'}</strong> {address.street}
                                                    </p>
                                                )}
                                                {address.floor && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'الطابق:' : 'Floor:'}</strong> {address.floor}
                                                    </p>
                                                )}
                                                {address.apartment && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'الشقة:' : 'Apartment:'}</strong> {address.apartment}
                                                    </p>
                                                )}
                                                {address.landmark && (
                                                    <p style={{ margin: '0.25rem 0' }}>
                                                        <strong>{language === 'ar' ? 'معلم:' : 'Landmark:'}</strong> {address.landmark}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            alignItems: 'center'
                                        }}>
                                            <button
                                                onClick={() => handleEdit(address)}
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
                                            
                                            {!address.is_primary && (
                                                <button
                                                    onClick={() => handleSetPrimary(address.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.875rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    ⭐ {language === 'ar' ? 'تعيين كرئيسي' : 'Set Primary'}
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                🗑️ {language === 'ar' ? 'حذف' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
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

            {/* Modal */}
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
                        maxWidth: '600px',
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
                            {editingAddress 
                                ? (language === 'ar' ? 'تعديل العنوان' : 'Edit Address')
                                : (language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address')
                            }
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'العميل' : 'Customer'} *
                                </label>
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
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
                                    <option value="">{language === 'ar' ? 'اختر العميل' : 'Select Customer'}</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'العنوان الكامل' : 'Full Address'} *
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    required
                                    rows="3"
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'المنطقة' : 'Area'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        {language === 'ar' ? 'رقم المبنى' : 'Building Number'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.building_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, building_number: e.target.value }))}
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
                                        {language === 'ar' ? 'الشارع' : 'Street'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
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
                                        {language === 'ar' ? 'الطابق' : 'Floor'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.floor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
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
                                        {language === 'ar' ? 'الشقة' : 'Apartment'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.apartment}
                                        onChange={(e) => setFormData(prev => ({ ...prev, apartment: e.target.value }))}
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'معلم مميز' : 'Landmark'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.landmark}
                                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_primary}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                                        style={{
                                            width: '1.25rem',
                                            height: '1.25rem',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        {language === 'ar' ? 'عنوان رئيسي' : 'Primary Address'}
                                    </span>
                                </label>
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
                                    {editingAddress 
                                        ? (language === 'ar' ? 'تحديث' : 'Update')
                                        : (language === 'ar' ? 'إضافة' : 'Add')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Popup Message */}
            <PopupMessage
                show={popup.show}
                onClose={hidePopup}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                confirmText={popup.confirmText}
                cancelText={popup.cancelText}
                onConfirm={popup.onConfirm}
                onCancel={popup.onCancel}
            />
        </div>
    );
};

export default AdminAddresses;
