import React, { useState, useEffect } from 'react';
import { adminSubscriptionTypesAPI } from '../../services/api';

const SubscriptionTypes = () => {
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    type: 'weekly',
    price: '',
    meals_count: '',
    is_active: true
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchSubscriptionTypes();
  }, []);

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
      name_ar: subscriptionType.name_ar,
      name_en: subscriptionType.name_en,
      description_ar: subscriptionType.description_ar || '',
      description_en: subscriptionType.description_en || '',
      type: subscriptionType.type,
      price: subscriptionType.price.toString(),
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
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(79 70 229)' }}>
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
            background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
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
          <h2 style={{ marginBottom: '1.5rem', color: 'rgb(79 70 229)' }}>
            {editingType ? 'تعديل نوع الاشتراك' : 'إضافة نوع اشتراك جديد'}
          </h2>
          
          <form onSubmit={handleSubmit}>
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
                  background: 'linear-gradient(135deg, rgb(79 70 229), rgb(99 102 241))',
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
          <h3 style={{ margin: 0, color: 'rgb(79 70 229)', fontWeight: '600' }}>
            أنواع الاشتراك ({subscriptionTypes.length})
          </h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgb(249 250 251)' }}>
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
              {subscriptionTypes.map((type) => (
                <tr key={type.id} style={{ borderBottom: '1px solid rgb(229 231 235)' }}>
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
                  <td style={{ padding: '1rem', fontWeight: '600', color: 'rgb(79 70 229)' }}>
                    {type.price} ريال عماني
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTypes;
