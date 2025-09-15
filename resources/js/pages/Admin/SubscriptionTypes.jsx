import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { showAlert, showConfirm, showOperationFailed, showDeleteConfirm } from '../../utils/popupUtils';
import { adminSubscriptionTypesAPI } from '../../services/api';

const SubscriptionTypes = () => {
  const { t, dir, language } = useLanguage();
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [filters, setFilters] = useState({
    restaurant_id: '',
    type: 'all',
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    restaurant_ids: [],
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    type: 'weekly',
    price: '',
    delivery_price: '',
    meals_count: '',
    is_active: true
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchSubscriptionTypes();
    fetchRestaurants();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchSubscriptionTypes = async () => {
    try {
      setLoading(true);
      const response = await adminSubscriptionTypesAPI.getAll();
      if (response.data.success) {
        setSubscriptionTypes(response.data.data);
      }
    } catch (error) {
      setError('فشل في جلب أنواع الاشتراك');
      console.error('Error fetching subscription types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await adminSubscriptionTypesAPI.getRestaurants();
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingType) {
        await adminSubscriptionTypesAPI.update(editingType.id, formData);
      } else {
        await adminSubscriptionTypesAPI.create(formData);
      }
      setShowForm(false);
      setEditingType(null);
      resetForm();
      fetchSubscriptionTypes();
    } catch (error) {
      setError('فشل في حفظ نوع الاشتراك');
      console.error('Error saving subscription type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscriptionType) => {
    setEditingType(subscriptionType);
    setFormData({
      restaurant_ids: subscriptionType.restaurants ? subscriptionType.restaurants.map(r => r.id) : [],
      name_ar: subscriptionType.name_ar,
      name_en: subscriptionType.name_en,
      description_ar: subscriptionType.description_ar || '',
      description_en: subscriptionType.description_en || '',
      type: subscriptionType.type,
      price: subscriptionType.price.toString(),
      delivery_price: subscriptionType.delivery_price ? subscriptionType.delivery_price.toString() : '0',
      meals_count: subscriptionType.meals_count.toString(),
      is_active: subscriptionType.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    showDeleteConfirm('نوع الاشتراك هذا', async () => {
    
    try {
      await adminSubscriptionTypesAPI.delete(id);
      fetchSubscriptionTypes();
    } catch (error) {
      setError('فشل في حذف نوع الاشتراك');
      console.error('Error deleting subscription type:', error);
    }
    });
  };

  const resetForm = () => {
    setFormData({
      restaurant_ids: [],
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      type: 'weekly',
      price: '',
      delivery_price: '',
      meals_count: '',
      is_active: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRestaurantToggle = (restaurantId) => {
    setFormData(prev => ({
      ...prev,
      restaurant_ids: prev.restaurant_ids.includes(restaurantId)
        ? prev.restaurant_ids.filter(id => id !== restaurantId)
        : [...prev.restaurant_ids, restaurantId]
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredSubscriptionTypes = subscriptionTypes.filter(type => {
    // Filter by restaurant
    if (filters.restaurant_id) {
      return type.restaurants && type.restaurants.some(restaurant => restaurant.id == filters.restaurant_id);
    }
    
    // Filter by type
    if (filters.type !== 'all' && type.type !== filters.type) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      if (searchTerm === '') return true;
      
      return (
        type.name_ar.toLowerCase().includes(searchTerm) ||
        type.name_en.toLowerCase().includes(searchTerm) ||
        (type.restaurants && type.restaurants.some(restaurant => 
          restaurant.name_ar.toLowerCase().includes(searchTerm) ||
          restaurant.name_en.toLowerCase().includes(searchTerm)
        )) ||
        type.price.toString().includes(searchTerm) ||
        type.meals_count.toString().includes(searchTerm) ||
        (type.type === 'weekly' && 'أسبوعي'.includes(searchTerm)) ||
        (type.type === 'monthly' && 'شهري'.includes(searchTerm))
      );
    }
    
    return true;
  });

  // Sort subscription types
  const sortedSubscriptionTypes = [...filteredSubscriptionTypes].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'created_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'id') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    } else if (sortField === 'restaurant') {
      aValue = a.restaurants && a.restaurants.length > 0 ? a.restaurants[0].name_ar : '';
      bValue = b.restaurants && b.restaurants.length > 0 ? b.restaurants[0].name_ar : '';
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
  const totalPages = Math.ceil(sortedSubscriptionTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscriptionTypes = sortedSubscriptionTypes.slice(startIndex, startIndex + itemsPerPage);

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

  if (loading && subscriptionTypes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', direction: dir }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2f6e73' }}>
          {language === 'ar' ? 'إدارة أنواع الاشتراك' : 'Subscription Types Management'}
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingType(null);
            resetForm();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ➕ {language === 'ar' ? 'إضافة نوع جديد' : 'Add New Type'}
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#2f6e73', fontWeight: '600' }}>
          🔍 {language === 'ar' ? 'فلاتر البحث' : 'Search Filters'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              {language === 'ar' ? 'البحث' : 'Search'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث بالاسم أو المطعم أو السعر...' : 'Search by name, restaurant, or price...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: searchInput ? '2.5rem' : '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: '#6b7280'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Restaurant Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
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
                backgroundColor: 'white'
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

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              {language === 'ar' ? 'نوع الاشتراك' : 'Subscription Type'}
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
              <option value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</option>
            </select>
          </div>
        </div>

        {/* Active Filters and Clear Button */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Active Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {filters.search && (
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'rgb(59 130 246)',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                🔍 {language === 'ar' ? 'البحث' : 'Search'}: {filters.search}
              </span>
            )}
            {filters.restaurant_id && (
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'rgb(34 197 94)',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                🏪 {restaurants.find(r => r.id == filters.restaurant_id) ? (language === 'ar' ? restaurants.find(r => r.id == filters.restaurant_id).name_ar : restaurants.find(r => r.id == filters.restaurant_id).name_en) : (language === 'ar' ? 'مطعم' : 'Restaurant')}
              </span>
            )}
            {filters.type !== 'all' && (
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'rgb(168 85 247)',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                📅 {filters.type === 'weekly' ? (language === 'ar' ? 'أسبوعي' : 'Weekly') : (language === 'ar' ? 'شهري' : 'Monthly')}
              </span>
            )}
          </div>

          {/* Clear Filters Button */}
          {(filters.search || filters.restaurant_id || filters.type !== 'all') && (
            <button
              onClick={() => {
                setFilters({ restaurant_id: '', type: 'all', search: '' });
                setSearchInput('');
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgb(239 68 68)',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🗑️ {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgb(254 242 242)',
          border: '1px solid rgb(252 165 165)',
          borderRadius: '0.5rem',
          color: 'rgb(153 27 27)',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#2f6e73' }}>
            {editingType ? (language === 'ar' ? 'تعديل نوع الاشتراك' : 'Edit Subscription Type') : (language === 'ar' ? 'إضافة نوع اشتراك جديد' : 'Add New Subscription Type')}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                {language === 'ar' ? 'المطاعم' : 'Restaurants'} *
              </label>
              <div style={{
                border: '1px solid rgb(229 231 235)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'white'
              }}>
                {restaurants.map(restaurant => (
                  <label
                    key={restaurant.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(249 250 251)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.restaurant_ids.includes(restaurant.id)}
                      onChange={() => handleRestaurantToggle(restaurant.id)}
                      style={{
                        marginRight: '0.5rem',
                        width: '1rem',
                        height: '1rem'
                      }}
                    />
                    <span style={{ fontSize: '1rem' }}>
                      {restaurant.name_ar} - {restaurant.name_en}
                    </span>
                  </label>
                ))}
              </div>
              {formData.restaurant_ids.length === 0 && (
                <p style={{ color: 'rgb(239 68 68)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {language === 'ar' ? 'يجب اختيار مطعم واحد على الأقل' : 'Please select at least one restaurant'}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'الاسم بالعربية' : 'Name in Arabic'} *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => handleInputChange('name_ar', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'الاسم بالإنجليزية' : 'Name in English'} *
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'الوصف بالعربية' : 'Description in Arabic'}
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => handleInputChange('description_ar', e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'الوصف بالإنجليزية' : 'Description in English'}
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'النوع' : 'Type'} *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
                  <option value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'السعر (ريال عماني)' : 'Price (OMR)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'سعر التوصيل (ريال عماني)' : 'Delivery Price (OMR)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.delivery_price}
                  onChange={(e) => handleInputChange('delivery_price', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {language === 'ar' ? 'عدد الوجبات' : 'Number of Meals'} *
                </label>
                <input
                  type="number"
                  value={formData.meals_count}
                  onChange={(e) => handleInputChange('meals_count', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgb(229 231 235)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <span style={{ fontWeight: '600' }}>{language === 'ar' ? 'نشط' : 'Active'}</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #2f6e73, #4a8a8f)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (editingType ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إضافة' : 'Add'))}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingType(null);
                  resetForm();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgb(229 231 235)',
                  color: 'rgb(75 85 99)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscription Types List */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              margin: 0,
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '1.25rem'
            }}>
            {language === 'ar' ? 'أنواع الاشتراك' : 'Subscription Types'} ({filteredSubscriptionTypes.length} {language === 'ar' ? 'من' : 'of'} {subscriptionTypes.length})
          </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              <span>{language === 'ar' ? 'عرض:' : 'Show:'}</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #cbd5e0',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderBottom: '2px solid #cbd5e0'
              }}>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'المطعم' : 'Restaurant'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'النوع' : 'Type'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'عدد الوجبات' : 'Meals Count'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th style={{
                  padding: '1rem 0.75rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscriptionTypes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
                    <div>{language === 'ar' ? 'لا توجد نتائج مطابقة للفلاتر المحددة' : 'No results match the specified filters'}</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {language === 'ar' ? 'جرب تغيير الفلاتر أو البحث عن شيء آخر' : 'Try changing the filters or searching for something else'}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSubscriptionTypes.map((type, index) => (
                <tr
                  key={type.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    background: index % 2 === 0 ? 'white' : '#f8fafc'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Restaurant */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div>
                      {type.restaurants && type.restaurants.length > 0 ? (
                        type.restaurants.map((restaurant, index) => (
                          <div key={restaurant.id} style={{
                            marginBottom: index < type.restaurants.length - 1 ? '0.25rem' : '0',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'rgb(59 130 246)'
                          }}>
                            {language === 'ar' ? restaurant.name_ar : restaurant.name_en}
                          </div>
                        ))
                      ) : (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          {language === 'ar' ? 'غير محدد' : 'Not specified'}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem'
                      }}>
                        {language === 'ar' ? type.name_ar : type.name_en}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        {language === 'ar' ? type.name_en : type.name_ar}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: type.type === 'weekly' 
                        ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      color: type.type === 'weekly' ? '#166534' : '#1e40af',
                      border: `1px solid ${type.type === 'weekly' ? '#bbf7d0' : '#bfdbfe'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: type.type === 'weekly' ? '#22c55e' : '#3b82f6'
                      }}></span>
                      {type.type === 'weekly' ? (language === 'ar' ? 'أسبوعي' : 'Weekly') : (language === 'ar' ? 'شهري' : 'Monthly')}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {type.price}
                      </span>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '0.75rem'
                      }}>
                        {language === 'ar' ? 'ريال' : 'OMR'}
                      </span>
                    </div>
                  </td>

                  {/* Delivery Price */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        background: '#d1fae5',
                        color: '#065f46',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {type.delivery_price || 0}
                      </span>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '0.75rem'
                      }}>
                        {language === 'ar' ? 'ريال' : 'OMR'}
                      </span>
                    </div>
                  </td>

                  {/* Meals Count */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {type.meals_count}
                      </span>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '0.75rem'
                      }}>
                        {language === 'ar' ? 'وجبة' : 'meals'}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: type.is_active 
                        ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                        : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      color: type.is_active ? '#166534' : '#dc2626',
                      border: `1px solid ${type.is_active ? '#bbf7d0' : '#fecaca'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: type.is_active ? '#22c55e' : '#ef4444'
                      }}></span>
                      {type.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => handleEdit(type)}
                        style={{
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                          color: '#1e40af',
                          border: '1px solid #93c5fd',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        style={{
                          padding: '0.5rem',
                          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              {language === 'ar' ? 'عرض' : 'Showing'} {startIndex + 1} {language === 'ar' ? 'إلى' : 'to'} {Math.min(startIndex + itemsPerPage, sortedSubscriptionTypes.length)} {language === 'ar' ? 'من' : 'of'} {sortedSubscriptionTypes.length} {language === 'ar' ? 'نوع اشتراك' : 'subscription types'}
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: currentPage === pageNum ? '#3b82f6' : 'white',
                      color: currentPage === pageNum ? 'white' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: currentPage === pageNum ? '600' : '400'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: currentPage === totalPages ? '#f3f4f6' : 'white',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionTypes;
