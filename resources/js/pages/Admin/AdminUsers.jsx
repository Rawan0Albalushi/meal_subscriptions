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
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        is_active: true,
        password: '',
        password_confirmation: ''
    });

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

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'customer',
            is_active: user.is_active !== false,
            password: '',
            password_confirmation: ''
        });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        // Validate password if provided
        if (editForm.password && editForm.password !== editForm.password_confirmation) {
            showError(
                language === 'ar' ? 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين' : 'Password and password confirmation do not match',
                language === 'ar' ? 'خطأ في كلمة المرور' : 'Password Error'
            );
            return;
        }

        if (editForm.password && editForm.password.length < 8) {
            showError(
                language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters long',
                language === 'ar' ? 'خطأ في كلمة المرور' : 'Password Error'
            );
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    phone: editForm.phone,
                    role: editForm.role,
                    is_active: editForm.is_active,
                    password: editForm.password || undefined
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(users.map(user => 
                    user.id === editingUser.id 
                        ? { ...user, ...editForm }
                        : user
                ));
                setEditingUser(null);
                showSuccess(
                    language === 'ar' ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully',
                    language === 'ar' ? 'نجح التحديث' : 'Update Successful'
                );
            } else {
                const errorData = await response.json();
                showError(
                    errorData.message || (language === 'ar' ? 'حدث خطأ أثناء تحديث المستخدم' : 'Error updating user'),
                    language === 'ar' ? 'خطأ في التحديث' : 'Update Error'
                );
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showError(
                language === 'ar' ? 'حدث خطأ أثناء تحديث المستخدم' : 'Error updating user',
                language === 'ar' ? 'خطأ في التحديث' : 'Update Error'
            );
        }
    };

    const handleRoleChange = (newRole) => {
        if (editingUser && editingUser.role !== newRole) {
            const roleNames = {
                admin: language === 'ar' ? 'أدمن' : 'Admin',
                seller: language === 'ar' ? 'بائع' : 'Seller',
                customer: language === 'ar' ? 'عميل' : 'Customer'
            };

            showConfirm(
                language === 'ar' ? 'تغيير دور المستخدم' : 'Change User Role',
                language === 'ar' 
                    ? `هل أنت متأكد من تغيير دور المستخدم "${editingUser.name}" من "${roleNames[editingUser.role]}" إلى "${roleNames[newRole]}"؟`
                    : `Are you sure you want to change user "${editingUser.name}" role from "${roleNames[editingUser.role]}" to "${roleNames[newRole]}"?`,
                () => {
                    setEditForm(prev => ({ ...prev, role: newRole }));
                },
                {
                    confirmText: language === 'ar' ? 'تغيير الدور' : 'Change Role',
                    cancelText: language === 'ar' ? 'إلغاء' : 'Cancel'
                }
            );
        } else {
            setEditForm(prev => ({ ...prev, role: newRole }));
        }
    };

    const handleQuickRoleChange = async (userId, newRole) => {
        const user = users.find(u => u.id === userId);
        if (!user || user.role === newRole) return;

        const roleNames = {
            admin: language === 'ar' ? 'أدمن' : 'Admin',
            seller: language === 'ar' ? 'بائع' : 'Seller',
            customer: language === 'ar' ? 'عميل' : 'Customer'
        };

        showConfirm(
            language === 'ar' ? 'تغيير دور المستخدم' : 'Change User Role',
            language === 'ar' 
                ? `هل أنت متأكد من تغيير دور المستخدم "${user.name}" من "${roleNames[user.role]}" إلى "${roleNames[newRole]}"؟`
                : `Are you sure you want to change user "${user.name}" role from "${roleNames[user.role]}" to "${roleNames[newRole]}"?`,
            async () => {
                try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                            role: newRole,
                            is_active: user.is_active
                        })
                    });

                    if (response.ok) {
                        setUsers(users.map(u => 
                            u.id === userId 
                                ? { ...u, role: newRole }
                                : u
                        ));
                        showSuccess(
                            language === 'ar' ? 'تم تغيير دور المستخدم بنجاح' : 'User role changed successfully',
                            language === 'ar' ? 'نجح تغيير الدور' : 'Role Change Successful'
                        );
                    } else {
                        const errorData = await response.json();
                        showError(
                            errorData.message || (language === 'ar' ? 'حدث خطأ أثناء تغيير دور المستخدم' : 'Error changing user role'),
                            language === 'ar' ? 'خطأ في تغيير الدور' : 'Role Change Error'
                        );
                    }
                } catch (error) {
                    console.error('Error changing user role:', error);
                    showError(
                        language === 'ar' ? 'حدث خطأ أثناء تغيير دور المستخدم' : 'Error changing user role',
                        language === 'ar' ? 'خطأ في تغيير الدور' : 'Role Change Error'
                    );
                }
            },
            {
                confirmText: language === 'ar' ? 'تغيير الدور' : 'Change Role',
                cancelText: language === 'ar' ? 'إلغاء' : 'Cancel'
            }
        );
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
                borderRadius: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                padding: window.innerWidth <= 768 ? '1rem' : '2rem',
                marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    marginBottom: '1.5rem'
                }}>
                    <h1 style={{
                        fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
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
                    gap: window.innerWidth <= 768 ? '0.5rem' : '1rem',
                    flexWrap: 'wrap',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: window.innerWidth <= 768 ? '100%' : '200px'
                    }}>
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'البحث عن المستخدمين...' : 'Search users...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: window.innerWidth <= 768 ? '0.375rem' : '0.5rem',
                                fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{
                            padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: window.innerWidth <= 768 ? '0.375rem' : '0.5rem',
                            fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem',
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
                                marginBottom: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'الدور:' : 'Role:'}
                                </span>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'rgb(55 65 81)',
                                        fontWeight: '500'
                                    }}>
                                        {user.role === 'admin' ? (language === 'ar' ? 'أدمن' : 'Admin') :
                                         user.role === 'seller' ? (language === 'ar' ? 'بائع' : 'Seller') :
                                         (language === 'ar' ? 'عميل' : 'Customer')}
                                    </span>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleQuickRoleChange(user.id, e.target.value)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.625rem',
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="customer">{language === 'ar' ? 'عميل' : 'Customer'}</option>
                                        <option value="seller">{language === 'ar' ? 'بائع' : 'Seller'}</option>
                                        <option value="admin">{language === 'ar' ? 'أدمن' : 'Admin'}</option>
                                    </select>
                                </div>
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
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => handleEditUser(user)}
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
                                    transition: 'all 0.2s',
                                    minWidth: '80px'
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

            {/* Edit User Modal */}
            {editingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: 'rgb(55 65 81)',
                                margin: 0
                            }}>
                                {language === 'ar' ? 'تعديل المستخدم' : 'Edit User'}
                            </h2>
                            <button
                                onClick={() => setEditingUser(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: 'rgb(107 114 128)',
                                    padding: '0.25rem'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {/* Name Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'الاسم' : 'Name'}
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
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

                            {/* Email Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
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

                            {/* Phone Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                </label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
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

                            {/* Password Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'كلمة المرور الجديدة (اختياري)' : 'New Password (Optional)'}
                                </label>
                                <input
                                    type="password"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder={language === 'ar' ? 'اتركه فارغاً للحفاظ على كلمة المرور الحالية' : 'Leave empty to keep current password'}
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

                            {/* Password Confirmation Field */}
                            {editForm.password && (
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'rgb(55 65 81)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.password_confirmation}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                        placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: editForm.password && editForm.password !== editForm.password_confirmation 
                                                ? '1px solid rgb(239, 68, 68)' 
                                                : '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                    {editForm.password && editForm.password !== editForm.password_confirmation && (
                                        <p style={{
                                            color: 'rgb(239, 68, 68)',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }}>
                                            {language === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Role Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'الدور' : 'Role'}
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '0.5rem'
                                }}>
                                    {['admin', 'seller', 'customer'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleChange(role)}
                                            style={{
                                                padding: '0.75rem',
                                                border: editForm.role === role ? '2px solid rgb(59 130 246)' : '1px solid rgba(0, 0, 0, 0.1)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: editForm.role === role 
                                                    ? 'rgba(59, 130, 246, 0.1)' 
                                                    : 'rgba(255, 255, 255, 0.8)',
                                                color: editForm.role === role 
                                                    ? 'rgb(59 130 246)' 
                                                    : 'rgb(55 65 81)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (editForm.role !== role) {
                                                    e.target.style.background = 'rgba(59, 130, 246, 0.05)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (editForm.role !== role) {
                                                    e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                                                }
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <span style={{ fontSize: '1.25rem' }}>
                                                    {getRoleIcon(role)}
                                                </span>
                                                <span>
                                                    {role === 'admin' ? (language === 'ar' ? 'أدمن' : 'Admin') :
                                                     role === 'seller' ? (language === 'ar' ? 'بائع' : 'Seller') :
                                                     (language === 'ar' ? 'عميل' : 'Customer')}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'الحالة' : 'Status'}
                                </label>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, is_active: true }))}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: editForm.is_active ? '2px solid rgb(34, 197, 94)' : '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: editForm.is_active 
                                                ? 'rgba(34, 197, 94, 0.1)' 
                                                : 'rgba(255, 255, 255, 0.8)',
                                            color: editForm.is_active 
                                                ? 'rgb(34, 197, 94)' 
                                                : 'rgb(55 65 81)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        {language === 'ar' ? 'نشط' : 'Active'}
                                    </button>
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, is_active: false }))}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: !editForm.is_active ? '2px solid rgb(239, 68, 68)' : '1px solid rgba(0, 0, 0, 0.1)',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: !editForm.is_active 
                                                ? 'rgba(239, 68, 68, 0.1)' 
                                                : 'rgba(255, 255, 255, 0.8)',
                                            color: !editForm.is_active 
                                                ? 'rgb(239, 68, 68)' 
                                                : 'rgb(55 65 81)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        {language === 'ar' ? 'غير نشط' : 'Inactive'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem'
                        }}>
                            <button
                                onClick={() => setEditingUser(null)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    color: 'rgb(107 114 128)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                                }}
                            >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
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
                                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                            </button>
                        </div>
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

export default AdminUsers;
