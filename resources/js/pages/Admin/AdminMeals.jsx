import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminMeals = () => {
    const { t, dir, language } = useLanguage();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        restaurant_id: '',
        meal_type: 'all',
        is_available: 'all'
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [restaurants, setRestaurants] = useState([]);
    const [mealTypes, setMealTypes] = useState([]);
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [formData, setFormData] = useState({
        restaurant_id: '',
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        meal_type: 'breakfast',
        delivery_time: '',
        is_available: true,
        image: null,
        subscription_type_ids: []
    });

    useEffect(() => {
        fetchMeals();
        fetchRestaurants();
        fetchMealTypes();
        fetchSubscriptionTypes();
    }, [pagination.current_page, searchTerm, filters]);

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.current_page,
                search: searchTerm,
                ...filters
            });

            const response = await fetch(`/api/admin/meals?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMeals(data.data || []);
                setPagination(data.pagination || {
                    current_page: 1,
                    last_page: 1,
                    per_page: 20,
                    total: 0
                });
            } else {
                console.error('Failed to fetch meals:', response.status);
                const errorData = await response.json();
                console.error('Error data:', errorData);
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('/api/admin/meals/restaurants/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRestaurants(data.data);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchMealTypes = async () => {
        try {
            const response = await fetch('/api/admin/meals/types/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMealTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching meal types:', error);
        }
    };

    const fetchSubscriptionTypes = async () => {
        try {
            const response = await fetch('/api/admin/meals/subscription-types/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptionTypes(data.data || []);
            } else {
                console.error('Failed to fetch subscription types:', response.status);
            }
        } catch (error) {
            console.error('Error fetching subscription types:', error);
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


    const handleEdit = (meal) => {
        setEditingMeal(meal);
        
        // Format delivery_time for input field
        let formattedDeliveryTime = '';
        if (meal.delivery_time) {
            if (typeof meal.delivery_time === 'string') {
                // If it's already a string, try to extract time part
                const timeMatch = meal.delivery_time.match(/(\d{2}:\d{2})/);
                formattedDeliveryTime = timeMatch ? timeMatch[1] : '';
            } else if (meal.delivery_time_formatted) {
                // Use the formatted time from the model
                formattedDeliveryTime = meal.delivery_time_formatted;
            } else {
                // Try to parse as date and format
                try {
                    const date = new Date(meal.delivery_time);
                    formattedDeliveryTime = date.toTimeString().slice(0, 5);
                } catch (e) {
                    console.error('Error parsing delivery_time:', e);
                }
            }
        }
        
        setFormData({
            restaurant_id: meal.restaurant_id,
            name_ar: meal.name_ar,
            name_en: meal.name_en,
            description_ar: meal.description_ar || '',
            description_en: meal.description_en || '',
            meal_type: meal.meal_type,
            delivery_time: formattedDeliveryTime,
            is_available: meal.is_available,
            image: null,
            subscription_type_ids: meal.subscription_type_ids || []
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            // Required fields that must always be sent
            const requiredFields = ['restaurant_id', 'name_ar', 'name_en', 'meal_type', 'delivery_time'];
            
            Object.keys(formData).forEach(key => {
                // Always send required fields, even if empty
                if (requiredFields.includes(key) || (formData[key] !== null && formData[key] !== '')) {
                    // Convert boolean to string for FormData
                    let value = formData[key];
                    if (typeof value === 'boolean') {
                        value = value.toString();
                    } else if (key === 'subscription_type_ids' && Array.isArray(value)) {
                        // Handle array of subscription type IDs
                        value = JSON.stringify(value);
                    }
                    formDataToSend.append(key, value || '');
                }
            });


            // Add _method for PUT requests
            if (editingMeal) {
                formDataToSend.append('_method', 'PUT');
            }

            const url = editingMeal 
                ? `/api/admin/meals/${editingMeal.id}`
                : '/api/admin/meals';
            
            const method = editingMeal ? 'POST' : 'POST';


            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: formDataToSend
            });

            const responseData = await response.json();

            if (response.ok) {
                setShowModal(false);
                setEditingMeal(null);
                fetchMeals();
                alert(language === 'ar' ? 'تم حفظ الوجبة بنجاح' : 'Meal saved successfully');
            } else {
                console.error('Error response:', responseData);
                // Show more detailed error message
                let errorMessage = responseData.message || (language === 'ar' ? 'حدث خطأ في حفظ الوجبة' : 'Error saving meal');
                if (responseData.errors) {
                    const errorDetails = Object.values(responseData.errors).flat().join(', ');
                    errorMessage += `\nالتفاصيل: ${errorDetails}`;
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error saving meal:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الوجبة؟' : 'Are you sure you want to delete this meal?')) {
            try {
                const response = await fetch(`/api/admin/meals/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    fetchMeals();
                }
            } catch (error) {
                console.error('Error deleting meal:', error);
            }
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            const response = await fetch(`/api/admin/meals/${id}/toggle-availability`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchMeals();
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const getMealTypeLabel = (type) => {
        const mealType = mealTypes.find(mt => mt.value === type);
        return mealType ? (language === 'ar' ? mealType.label_ar : mealType.label_en) : type;
    };

    const getRestaurantName = (restaurantId) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        return restaurant ? (language === 'ar' ? restaurant.name_ar : restaurant.name_en) : 'Unknown';
    };

    // Filter meals based on search and filters
    const filteredMeals = meals.filter(meal => {
        const matchesSearch = !searchTerm || 
            meal.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meal.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meal.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meal.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRestaurant = !filters.restaurant_id || meal.restaurant_id == filters.restaurant_id;
        const matchesMealType = filters.meal_type === 'all' || meal.meal_type === filters.meal_type;
        const matchesAvailability = filters.is_available === 'all' || 
            (filters.is_available === 'available' && meal.is_available) ||
            (filters.is_available === 'unavailable' && !meal.is_available);
        
        return matchesSearch && matchesRestaurant && matchesMealType && matchesAvailability;
    });

    // Sort meals
    const sortedMeals = [...filteredMeals].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'id') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        } else if (sortField === 'restaurant') {
            aValue = getRestaurantName(a.restaurant_id);
            bValue = getRestaurantName(b.restaurant_id);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedMeals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMeals = sortedMeals.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
                            🍽️ {language === 'ar' ? 'إدارة الوجبات' : 'Meals Management'}
                        </h1>
                        <p style={{
                            color: '#6b7280',
                            margin: 0,
                            fontSize: '1.1rem'
                        }}>
                            {language === 'ar' ? `إدارة جميع الوجبات في النظام (${filteredMeals.length} وجبة)` : `Manage all meals in the system (${filteredMeals.length} meals)`}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingMeal(null);
                            setFormData({
                                restaurant_id: '',
                                name_ar: '',
                                name_en: '',
                                description_ar: '',
                                description_en: '',
                                meal_type: 'breakfast',
                                delivery_time: '',
                                is_available: true,
                                image: null,
                                subscription_type_ids: []
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
                        ➕ {language === 'ar' ? 'إضافة وجبة جديدة' : 'Add New Meal'}
                    </button>
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
                            placeholder={language === 'ar' ? 'البحث في الوجبات...' : 'Search meals...'}
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
                            {language === 'ar' ? 'نوع الوجبة' : 'Meal Type'}
                        </label>
                        <select
                            value={filters.meal_type}
                            onChange={(e) => handleFilterChange('meal_type', e.target.value)}
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
                            {mealTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {language === 'ar' ? type.label_ar : type.label_en}
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
                            {language === 'ar' ? 'الحالة' : 'Status'}
                        </label>
                        <select
                            value={filters.is_available}
                            onChange={(e) => handleFilterChange('is_available', e.target.value)}
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
                            <option value="available">{language === 'ar' ? 'متاح' : 'Available'}</option>
                            <option value="unavailable">{language === 'ar' ? 'غير متاح' : 'Unavailable'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Meals Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {/* Table Header Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            {language === 'ar' ? `عرض ${filteredMeals.length} وجبة` : `Showing ${filteredMeals.length} meals`}
                        </span>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <label style={{
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            color: '#6b7280'
                        }}>
                            {language === 'ar' ? 'عدد العناصر:' : 'Items per page:'}
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '0.5rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
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
                        {/* Meals Table */}
                        <div style={{
                            overflowX: 'auto',
                            borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.9rem'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        borderBottom: '2px solid #e5e7eb'
                                    }}>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'الصورة' : 'Image'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'اسم الوجبة' : 'Meal Name'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'المطعم' : 'Restaurant'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'النوع' : 'Type'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'الحالة' : 'Status'}
                                        </th>
                                        <th style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {language === 'ar' ? 'الإجراءات' : 'Actions'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedMeals.length > 0 ? paginatedMeals.map((meal, index) => (
                                        <tr key={meal.id} style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                                        }}>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                                {meal.image ? (
                                        <img
                                            src={`/storage/${meal.image}`}
                                            alt={language === 'ar' ? meal.name_ar : meal.name_en}
                                            style={{
                                                            width: '60px',
                                                            height: '60px',
                                                objectFit: 'cover',
                                                            borderRadius: '0.5rem',
                                                            border: '2px solid #e5e7eb'
                                            }}
                                        />
                                                ) : (
                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        backgroundColor: '#f3f4f6',
                                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#9ca3af',
                                                        fontSize: '1.5rem'
                                                    }}>
                                                        🍽️
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                            color: '#1f2937',
                                                    fontSize: '0.95rem'
                                        }}>
                                            {language === 'ar' ? meal.name_ar : meal.name_en}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: '#374151',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {getRestaurantName(meal.restaurant_id)}
                                    </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                            color: '#6b7280',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {getMealTypeLabel(meal.meal_type)}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: '#374151',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {meal.delivery_time}
                                    </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    color: meal.is_available ? '#10b981' : '#ef4444',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {meal.is_available 
                                                        ? (language === 'ar' ? 'متاح' : 'Available')
                                                        : (language === 'ar' ? 'غير متاح' : 'Unavailable')
                                                    }
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                textAlign: 'center'
                                            }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                                    justifyContent: 'center',
                                        flexWrap: 'wrap'
                                    }}>
                                        <button
                                            onClick={() => handleEdit(meal)}
                                            style={{
                                                            background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                            borderRadius: '0.375rem',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.backgroundColor = '#2563eb';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.backgroundColor = '#3b82f6';
                                                        }}
                                                    >
                                                        {language === 'ar' ? 'تعديل' : 'Edit'}
                                        </button>
                                        
                                        <button
                                            onClick={() => handleToggleAvailability(meal.id)}
                                            style={{
                                                            background: meal.is_available ? '#f59e0b' : '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                            borderRadius: '0.375rem',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.backgroundColor = meal.is_available ? '#d97706' : '#059669';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.backgroundColor = meal.is_available ? '#f59e0b' : '#10b981';
                                                        }}
                                                    >
                                                        {meal.is_available 
                                                ? (language === 'ar' ? 'إيقاف' : 'Disable')
                                                : (language === 'ar' ? 'تفعيل' : 'Enable')
                                            }
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDelete(meal.id)}
                                            style={{
                                                            background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                            borderRadius: '0.375rem',
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.backgroundColor = '#dc2626';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.backgroundColor = '#ef4444';
                                                        }}
                                                    >
                                                        {language === 'ar' ? 'حذف' : 'Delete'}
                                        </button>
                                    </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" style={{
                                                padding: '3rem',
                                                textAlign: 'center',
                                                color: '#6b7280',
                                                fontSize: '1.1rem'
                                            }}>
                                                {language === 'ar' ? 'لا توجد وجبات مطابقة للبحث' : 'No meals found matching your search'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(248, 250, 252, 0.8)',
                                borderRadius: '0.75rem',
                                border: '1px solid #e5e7eb'
                            }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
                                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}
                                    onMouseOver={(e) => {
                                        if (currentPage !== 1) {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.backgroundColor = '#f8fafc';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (currentPage !== 1) {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    {language === 'ar' ? 'السابق' : 'Previous'}
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            border: '2px solid',
                                            borderColor: page === currentPage ? '#667eea' : '#e5e7eb',
                                            borderRadius: '0.5rem',
                                            backgroundColor: page === currentPage ? '#667eea' : 'white',
                                            color: page === currentPage ? 'white' : '#374151',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontWeight: '500',
                                            fontSize: '0.9rem',
                                            minWidth: '2.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            if (page !== currentPage) {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.backgroundColor = '#f8fafc';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (page !== currentPage) {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.backgroundColor = 'white';
                                            }
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
                                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}
                                    onMouseOver={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.backgroundColor = '#f8fafc';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (currentPage !== totalPages) {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.backgroundColor = 'white';
                                        }
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
                            {editingMeal 
                                ? (language === 'ar' ? 'تعديل الوجبة' : 'Edit Meal')
                                : (language === 'ar' ? 'إضافة وجبة جديدة' : 'Add New Meal')
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
                                    {language === 'ar' ? 'المطعم' : 'Restaurant'} *
                                </label>
                                <select
                                    value={formData.restaurant_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, restaurant_id: e.target.value }))}
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
                                    <option value="">{language === 'ar' ? 'اختر المطعم' : 'Select Restaurant'}</option>
                                    {restaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
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
                                    {language === 'ar' ? 'اسم الوجبة (عربي)' : 'Meal Name (Arabic)'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'اسم الوجبة (إنجليزي)' : 'Meal Name (English)'} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'وصف الوجبة (عربي)' : 'Meal Description (Arabic)'}
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
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
                                    {language === 'ar' ? 'وصف الوجبة (إنجليزي)' : 'Meal Description (English)'}
                                </label>
                                <textarea
                                    value={formData.description_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
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
                                    {language === 'ar' ? 'نوع الوجبة' : 'Meal Type'} *
                                </label>
                                <select
                                    value={formData.meal_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, meal_type: e.target.value }))}
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
                                    {mealTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {language === 'ar' ? type.label_ar : type.label_en}
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
                                    {language === 'ar' ? 'أنواع الاشتراكات' : 'Subscription Types'}
                                </label>
                                <div style={{
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'white'
                                }}>
                                    {subscriptionTypes.length > 0 ? subscriptionTypes
                                        .filter(type => !formData.restaurant_id || type.restaurant_id == formData.restaurant_id)
                                        .map(type => (
                                            <label key={type.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '0.5rem',
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.subscription_type_ids.includes(type.id)}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...formData.subscription_type_ids, type.id]
                                                            : formData.subscription_type_ids.filter(id => id !== type.id);
                                                        setFormData(prev => ({ ...prev, subscription_type_ids: newIds }));
                                                    }}
                                                    style={{ marginLeft: '0.5rem' }}
                                                />
                                                <span style={{ fontSize: '0.9rem' }}>
                                                    {language === 'ar' ? type.name_ar : type.name_en} 
                                                    ({type.type} - {type.price} OMR)
                                                    {type.restaurant && ` - ${language === 'ar' ? type.restaurant.name_ar : type.restaurant.name_en}`}
                                                </span>
                                            </label>
                                        )) : (
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                                            {language === 'ar' ? 'جاري تحميل أنواع الاشتراكات...' : 'Loading subscription types...'}
                                        </p>
                                    )}
                                    {subscriptionTypes.length > 0 && subscriptionTypes.filter(type => !formData.restaurant_id || type.restaurant_id == formData.restaurant_id).length === 0 && (
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                                            {language === 'ar' ? 'لا توجد أنواع اشتراكات متاحة للمطعم المختار' : 'No subscription types available for selected restaurant'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'} *
                                </label>
                                <input
                                    type="time"
                                    value={formData.delivery_time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_time: e.target.value }))}
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    {language === 'ar' ? 'صورة الوجبة' : 'Meal Image'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
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
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
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
                                        {language === 'ar' ? 'متاح للطلب' : 'Available for Order'}
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
                                    {editingMeal 
                                        ? (language === 'ar' ? 'تحديث' : 'Update')
                                        : (language === 'ar' ? 'إضافة' : 'Add')
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMeals;
