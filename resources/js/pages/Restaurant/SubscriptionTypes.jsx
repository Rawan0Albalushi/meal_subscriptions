import React, { useState, useEffect } from 'react';
import { subscriptionTypesAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { showAlert, showConfirm, showOperationFailed, showDeleteConfirm } from '../../utils/popupUtils';

const RestaurantSubscriptionTypes = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  
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
    is_active: true,
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const restaurantId = user.restaurant_id;
      
      if (!restaurantId) {
        setError('لم يتم العثور على معرف المطعم');
        return;
      }

      const response = await subscriptionTypesAPI.getByRestaurant(restaurantId);
      if (response.data.success) {
        setSubscriptionTypes(response.data.data);
      } else {
        setError('فشل في تحميل أنواع الاشتراكات');
      }
    } catch (error) {
      console.error('Error fetching subscription types:', error);
      setError('حدث خطأ أثناء تحميل أنواع الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const restaurantId = user.restaurant_id;
      
      const submitData = {
        ...formData,
        restaurant_id: restaurantId,
        price: parseFloat(formData.price),
        meals_count: parseInt(formData.meals_count),
      };

      if (editingType) {
        await subscriptionTypesAPI.update(editingType.id, submitData);
      } else {
        await subscriptionTypesAPI.create(submitData);
      }

      setShowForm(false);
      setEditingType(null);
      resetForm();
      fetchSubscriptionTypes();
    } catch (error) {
      console.error('Error saving subscription type:', error);
      setError('حدث خطأ أثناء حفظ نوع الاشتراك');
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name_ar: type.name_ar,
      name_en: type.name_en,
      description_ar: type.description_ar || '',
      description_en: type.description_en || '',
      type: type.type,
      price: type.price.toString(),
      meals_count: type.meals_count.toString(),
      is_active: type.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    showDeleteConfirm('هذا النوع من الاشتراك', async () => {

    try {
      await subscriptionTypesAPI.delete(id);
      fetchSubscriptionTypes();
    } catch (error) {
      console.error('Error deleting subscription type:', error);
      setError('حدث خطأ أثناء حذف نوع الاشتراك');
    }
    });
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
      is_active: true,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingType(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إدارة أنواع الاشتراكات
          </h1>
          <p className="text-gray-600">
            قم بإدارة أنواع الاشتراكات المتاحة في مطعمك
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            إضافة نوع اشتراك جديد
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingType ? 'تعديل نوع الاشتراك' : 'إضافة نوع اشتراك جديد'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (إنجليزي)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    النوع
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر (ريال عماني)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عدد الوجبات
                  </label>
                  <input
                    type="number"
                    value={formData.meals_count}
                    onChange={(e) => setFormData({...formData, meals_count: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  نشط
                </label>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  {editingType ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptionTypes.map((type) => (
            <div key={type.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? type.name_ar : type.name_en}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {type.type === 'weekly' ? 'أسبوعي' : 'شهري'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {type.price} ريال عماني
                  </p>
                  <p className="text-sm text-gray-500">
                    {type.meals_count} وجبة
                  </p>
                </div>
              </div>
              
              {(type.description_ar || type.description_en) && (
                <p className="text-gray-600 text-sm mb-4">
                  {language === 'ar' ? type.description_ar : type.description_en}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  type.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {type.is_active ? 'نشط' : 'غير نشط'}
                </span>
                
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subscriptionTypes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد أنواع اشتراكات
            </h3>
            <p className="text-gray-500 mb-4">
              قم بإضافة أنواع اشتراكات جديدة لعرضها هنا
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              إضافة نوع اشتراك جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSubscriptionTypes;
