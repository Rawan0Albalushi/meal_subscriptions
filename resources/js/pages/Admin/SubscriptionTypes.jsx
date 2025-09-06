import React, { useState, useEffect } from 'react';
import { adminSubscriptionTypesAPI } from '../../services/api';

const SubscriptionTypes = () => {
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
  const [formData, setFormData] = useState({
    restaurant_id: '',
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
      restaurant_id: subscriptionType.restaurant_id,
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
    if (!window.confirm('هل أنت متأكد من حذف نوع الاشتراك هذا؟')) {
      return;
    }
    
    try {
      await adminSubscriptionTypesAPI.delete(id);
      fetchSubscriptionTypes();
    } catch (error) {
      setError('فشل في حذف نوع الاشتراك');
      console.error('Error deleting subscription type:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      restaurant_id: '',
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      type: 'weekly',
      price: '',
      meals_count: '',
      is_active: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredSubscriptionTypes = subscriptionTypes.filter(type => {
    // Filter by restaurant
    if (filters.restaurant_id && type.restaurant_id != filters.restaurant_id) {
      return false;
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
        (type.restaurant && type.restaurant.name_ar.toLowerCase().includes(searchTerm)) ||
        (type.restaurant && type.restaurant.name_en.toLowerCase().includes(searchTerm)) ||
        type.price.toString().includes(searchTerm) ||
        type.meals_count.toString().includes(searchTerm) ||
        (type.type === 'weekly' && 'أسبوعي'.includes(searchTerm)) ||
        (type.type === 'monthly' && 'شهري'.includes(searchTerm))
      );
    }
    
    return true;
  });

  if (loading && subscriptionTypes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', direction: 'rtl' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2f6e73' }}>
          إدارة أنواع الاشتراك
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
          ➕ إضافة نوع جديد
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
          🔍 فلاتر البحث
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              البحث
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="ابحث بالاسم أو المطعم أو السعر..."
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
              المطعم
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
              <option value="">جميع المطاعم</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              نوع الاشتراك
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
              <option value="all">جميع الأنواع</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
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
                🔍 البحث: {filters.search}
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
                🏪 {restaurants.find(r => r.id == filters.restaurant_id)?.name_ar || 'مطعم'}
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
                📅 {filters.type === 'weekly' ? 'أسبوعي' : 'شهري'}
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
              🗑️ مسح الفلاتر
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
            {editingType ? 'تعديل نوع الاشتراك' : 'إضافة نوع اشتراك جديد'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                المطعم *
              </label>
              <select
                value={formData.restaurant_id}
                onChange={(e) => handleInputChange('restaurant_id', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgb(229 231 235)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="">اختر المطعم</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name_ar} - {restaurant.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  الاسم بالعربية *
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
                  الاسم بالإنجليزية *
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
                  الوصف بالعربية
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
                  الوصف بالإنجليزية
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
                  النوع *
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
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  السعر (ريال عماني) *
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
                  سعر التوصيل (ريال عماني) *
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
                  عدد الوجبات *
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
                <span style={{ fontWeight: '600' }}>نشط</span>
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
                {loading ? 'جاري الحفظ...' : (editingType ? 'تحديث' : 'إضافة')}
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
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscription Types List */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgb(229 231 235)',
          background: 'rgb(249 250 251)'
        }}>
          <h3 style={{ margin: 0, color: '#2f6e73', fontWeight: '600' }}>
            أنواع الاشتراك ({filteredSubscriptionTypes.length} من {subscriptionTypes.length})
          </h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgb(249 250 251)' }}>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  المطعم
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  الاسم
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  النوع
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  السعر
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  سعر التوصيل
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  عدد الوجبات
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  الحالة
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid rgb(229 231 235)' }}>
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptionTypes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
                    <div>لا توجد نتائج مطابقة للفلاتر المحددة</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      جرب تغيير الفلاتر أو البحث عن شيء آخر
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptionTypes.map((type) => (
                <tr key={type.id} style={{ borderBottom: '1px solid rgb(229 231 235)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {type.restaurant ? type.restaurant.name_ar : 'غير محدد'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)' }}>
                        {type.restaurant ? type.restaurant.name_en : 'Not specified'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {type.name_ar}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'rgb(107 114 128)' }}>
                        {type.name_en}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: type.type === 'weekly' ? 'rgb(220 252 231)' : 'rgb(219 234 254)',
                      color: type.type === 'weekly' ? 'rgb(21 128 61)' : 'rgb(30 64 175)'
                    }}>
                      {type.type === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#2f6e73' }}>
                    {type.price} ريال عماني
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#059669' }}>
                    {type.delivery_price || 0} ريال عماني
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {type.meals_count} وجبة
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: type.is_active ? 'rgb(220 252 231)' : 'rgb(254 242 242)',
                      color: type.is_active ? 'rgb(21 128 61)' : 'rgb(153 27 27)'
                    }}>
                      {type.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(type)}
                        style={{
                          padding: '0.5rem',
                          background: 'rgb(59 130 246)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        style={{
                          padding: '0.5rem',
                          background: 'rgb(239 68 68)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTypes;
