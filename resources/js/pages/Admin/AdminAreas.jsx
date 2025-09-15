import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { showAlert, showConfirm, showSaveSuccess, showOperationFailed, showDeleteConfirm } from '../../utils/popupUtils';

const AdminAreas = () => {
    const { t, dir, language } = useLanguage();
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        code: '',
        is_active: true,
        sort_order: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [sortField, setSortField] = useState('sort_order');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch('/api/admin/areas', {
                headers: headers
            });
            
            if (response.ok) {
                const data = await response.json();
                setAreas(data.data);
            } else {
                // Fallback to public API if admin API fails
                const publicResponse = await fetch('/api/areas');
                if (publicResponse.ok) {
                    const publicData = await publicResponse.json();
                    setAreas(publicData.data);
                } else {
                    showOperationFailed('فشل في جلب المناطق');
                }
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
            showOperationFailed('حدث خطأ في جلب المناطق');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingArea 
                ? `/api/admin/areas/${editingArea.id}`
                : '/api/admin/areas';
            
            const method = editingArea ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showSaveSuccess();
                setShowModal(false);
                setEditingArea(null);
                setFormData({
                    name_ar: '',
                    name_en: '',
                    code: '',
                    is_active: true,
                    sort_order: 0
                });
                fetchAreas();
            } else {
                const errorData = await response.json();
                showOperationFailed(errorData.message || 'حدث خطأ في حفظ المنطقة');
            }
        } catch (error) {
            console.error('Error saving area:', error);
            showOperationFailed('حدث خطأ في حفظ المنطقة');
        }
    };

    const handleEdit = (area) => {
        setEditingArea(area);
        setFormData({
            name_ar: area.name_ar,
            name_en: area.name_en,
            code: area.code,
            is_active: area.is_active,
            sort_order: area.sort_order
        });
        setShowModal(true);
    };

    const handleDelete = async (area) => {
        const confirmed = await showDeleteConfirm(`هل أنت متأكد من حذف المنطقة "${area.name_ar}"؟`);
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/areas/${area.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showSaveSuccess();
                fetchAreas();
            } else {
                const errorData = await response.json();
                showOperationFailed(errorData.message || 'حدث خطأ في حذف المنطقة');
            }
        } catch (error) {
            console.error('Error deleting area:', error);
            showOperationFailed('حدث خطأ في حذف المنطقة');
        }
    };

    const openAddModal = () => {
        setEditingArea(null);
        setFormData({
            name_ar: '',
            name_en: '',
            code: '',
            is_active: true,
            sort_order: 0
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingArea(null);
        setFormData({
            name_ar: '',
            name_en: '',
            code: '',
            is_active: true,
            sort_order: 0
        });
    };

    // Filter and sort areas
    const filteredAndSortedAreas = areas
        .filter(area => {
            const matchesSearch = area.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                area.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                area.code.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFilter = filterActive === 'all' || 
                                (filterActive === 'active' && area.is_active) ||
                                (filterActive === 'inactive' && !area.is_active);
            
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
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
                        جاري التحميل...
                    </div>
                </div>
            </div>
        );
    }

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
                    gap: '1rem',
                    marginBottom: '1.5rem'
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
                            🗺️ {language === 'ar' ? 'إدارة المناطق' : 'Areas Management'}
                        </h1>
                    </div>
                    <button
                        onClick={openAddModal}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {language === 'ar' ? 'إضافة منطقة جديدة' : 'Add New Area'}
                    </button>
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
                            placeholder={language === 'ar' ? 'البحث في المناطق...' : 'Search areas...'}
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
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
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
                        <option value="all">{language === 'ar' ? 'جميع المناطق' : 'All Areas'}</option>
                        <option value="active">{language === 'ar' ? 'النشطة فقط' : 'Active Only'}</option>
                        <option value="inactive">{language === 'ar' ? 'غير النشطة' : 'Inactive Only'}</option>
                    </select>
                </div>
            </div>

            {/* Areas Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredAndSortedAreas.map((area) => (
                    <div
                        key={area.id}
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
                        {/* Area Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: 'rgb(55 65 81)',
                                    margin: 0,
                                    marginBottom: '0.25rem'
                                }}>
                                    {area.name_ar}
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(107 114 128)',
                                    margin: 0
                                }}>
                                    {area.name_en}
                                </p>
                            </div>
                            <div style={{
                                background: area.is_active 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {area.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                            </div>
                        </div>

                        {/* Area Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'الكود:' : 'Code:'}
                                </span>
                                <span style={{
                                    background: 'rgba(107, 114, 128, 0.1)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {area.code}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: 'rgb(107 114 128)'
                                }}>
                                    {language === 'ar' ? 'ترتيب العرض:' : 'Sort Order:'}
                                </span>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {area.sort_order}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                onClick={() => handleEdit(area)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgb(59 130 246)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
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
                                onClick={() => handleDelete(area)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'rgb(239 68 68)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
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

            {/* Empty State */}
            {filteredAndSortedAreas.length === 0 && (
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
                        fontSize: '4rem',
                        marginBottom: '1rem'
                    }}>
                        🗺️
                    </div>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'rgb(55 65 81)',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        {searchTerm || filterActive !== 'all' 
                            ? (language === 'ar' ? 'لم يتم العثور على مناطق' : 'No areas found')
                            : (language === 'ar' ? 'لا توجد مناطق' : 'No areas available')
                        }
                    </h3>
                    <p style={{
                        color: 'rgb(107 114 128)',
                        margin: 0
                    }}>
                        {searchTerm || filterActive !== 'all' 
                            ? (language === 'ar' ? 'جرب تغيير معايير البحث أو الفلترة' : 'Try changing your search or filter criteria')
                            : (language === 'ar' ? 'ابدأ بإضافة أول منطقة في النظام' : 'Start by adding the first area to the system')
                        }
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
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
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'rgb(55 65 81)',
                                margin: 0
                            }}>
                                {editingArea ? (language === 'ar' ? 'تعديل المنطقة' : 'Edit Area') : (language === 'ar' ? 'إضافة منطقة جديدة' : 'Add New Area')}
                            </h3>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: 'rgb(107 114 128)',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'الاسم العربي *' : 'Arabic Name *'}
                                </label>
                                <input
                                    type="text"
                                    name="name_ar"
                                    value={formData.name_ar}
                                    onChange={handleInputChange}
                                    required
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

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'الاسم الإنجليزي *' : 'English Name *'}
                                </label>
                                <input
                                    type="text"
                                    name="name_en"
                                    value={formData.name_en}
                                    onChange={handleInputChange}
                                    required
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

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'الكود *' : 'Code *'}
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder={language === 'ar' ? 'مثل: bosher, khoudh, maabilah' : 'e.g: bosher, khoudh, maabilah'}
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

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {language === 'ar' ? 'ترتيب العرض' : 'Sort Order'}
                                </label>
                                <input
                                    type="number"
                                    name="sort_order"
                                    value={formData.sort_order}
                                    onChange={handleInputChange}
                                    min="0"
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

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '1rem',
                                        height: '1rem'
                                    }}
                                />
                                <label style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgb(55 65 81)'
                                }}>
                                    {language === 'ar' ? 'نشط' : 'Active'}
                                </label>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem',
                                marginTop: '1rem'
                            }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgb(107 114 128)',
                                        background: 'rgba(107, 114, 128, 0.1)',
                                        border: '1px solid rgba(107, 114, 128, 0.2)',
                                        borderRadius: '0.5rem',
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
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'white',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                                    }}
                                >
                                    {editingArea ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إضافة' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAreas;
