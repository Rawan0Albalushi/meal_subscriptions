import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import { usePopupMessage } from '../../hooks/usePopupMessage';

const AdminUsers = () => {
    const { t, dir, language } = useLanguage();
    const { popup, showConfirm, showSuccess, showError, hidePopup } = usePopupMessage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        const user = users.find(u => u.id === userId);
        const userName = user ? user.name : 'المستخدم';
        
        showConfirm(
            language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
            language === 'ar' 
                ? `هل أنت متأكد من حذف المستخدم "${userName}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
            async () => {
                try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        setUsers(users.filter(user => user.id !== userId));
                        showSuccess(
                            language === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully',
                            language === 'ar' ? 'نجح الحذف' : 'Delete Successful'
                        );
                    } else {
                        showError(
                            language === 'ar' ? 'حدث خطأ أثناء حذف المستخدم' : 'Error deleting user',
                            language === 'ar' ? 'خطأ في الحذف' : 'Delete Error'
                        );
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    showError(
                        language === 'ar' ? 'حدث خطأ أثناء حذف المستخدم' : 'Error deleting user',
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

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setUsers(users.map(user => 
                    user.id === userId 
                        ? { ...user, is_active: !currentStatus }
                        : user
                ));
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.phone?.includes(searchTerm);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return '👑';
            case 'seller': return '🏪';
            case 'customer': return '👤';
            default: return '❓';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            case 'seller': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            case 'customer': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            default: return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        marginBottom: '1rem'
                    }}>
                        ⏳
                    </div>
                    <div style={{
                        color: 'rgb(107 114 128)',
                        fontSize: '1rem'
                    }}>
                        {t('loading')}...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            direction: dir
        }}>
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
                    marginBottom: '1.5rem'
                }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0
                    }}>
                        {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
                    </h1>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: '200px'
                    }}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث عن المستخدمين...' : 'Search users...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">{language === 'ar' ? 'جميع الأدوار' : 'All Roles'}</option>
                        <option value="admin">{language === 'ar' ? 'أدمن' : 'Admin'}</option>
                        <option value="seller">{language === 'ar' ? 'بائع' : 'Seller'}</option>
                        <option value="customer">{language === 'ar' ? 'عميل' : 'Customer'}</option>
                    </select>
                </div>
            </div>

            {/* Users Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: getRoleColor(user.role),
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                {getRoleIcon(user.role)}
                            </div>
                            <div style={{
                                flex: 1
                            }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(55 65 81)',
                                    margin: 0,
                                    marginBottom: '0.25rem'
                                }}>
                                    {user.name || user.full_name || (language === 'ar' ? 'بدون اسم' : 'No Name')}
                                </h3>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)',
                                    margin: 0
                                }}>
                                    {user.email}
                                </p>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: user.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: user.is_active ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                                }}>
                                    {user.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                    {user.phone || (language === 'ar' ? 'غير محدد' : 'Not specified')}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'الدور:' : 'Role:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                    {user.role}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'تاريخ التسجيل:' : 'Registered:'}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(55 65 81)',
                                    fontWeight: '500'
                                }}>
                                    {new Date(user.created_at).toLocaleDateString('en-US')}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <button
                                onClick={() => setEditingUser(user)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                                }}
                            >
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            <button
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: user.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                    color: user.is_active ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = user.is_active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = user.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                                }}
                            >
                                {user.is_active ? (language === 'ar' ? 'إلغاء تفعيل' : 'Deactivate') : (language === 'ar' ? 'تفعيل' : 'Activate')}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'rgb(239, 68, 68)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                            >
                                {language === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>
                        👥
                    </div>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {language === 'ar' ? 'لا توجد مستخدمين' : 'No Users Found'}
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {language === 'ar' 
                            ? 'لم يتم العثور على مستخدمين يطابقون معايير البحث الخاصة بك.'
                            : 'No users found matching your search criteria.'
                        }
                    </p>
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

export default AdminUsers;
