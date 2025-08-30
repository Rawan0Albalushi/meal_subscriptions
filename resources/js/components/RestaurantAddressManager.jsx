import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RestaurantAddressManager = ({ restaurantId, onAddressesChange }) => {
    const [addresses, setAddresses] = useState([]);
    const [areas, setAreas] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        address_ar: '',
        address_en: '',
        area: '',
        latitude: '',
        longitude: '',
        is_primary: false
    });

    useEffect(() => {
        fetchAddresses();
        fetchAreas();
    }, [restaurantId]);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`/api/seller/restaurants/${restaurantId}/addresses`);
            setAddresses(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setLoading(false);
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await axios.get('/api/restaurant-addresses/areas');
            setAreas(response.data.data);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            name_ar: '',
            name_en: '',
            address_ar: '',
            address_en: '',
            area: '',
            latitude: '',
            longitude: '',
            is_primary: false
        });
        setEditingAddress(null);
        setShowAddForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await axios.put(`/api/seller/restaurants/${restaurantId}/addresses/${editingAddress.id}`, formData);
            } else {
                await axios.post(`/api/seller/restaurants/${restaurantId}/addresses`, formData);
            }
            
            fetchAddresses();
            resetForm();
            if (onAddressesChange) onAddressesChange();
        } catch (error) {
            console.error('Error saving address:', error);
            alert('حدث خطأ أثناء حفظ العنوان');
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            name_ar: address.name_ar,
            name_en: address.name_en,
            address_ar: address.address_ar,
            address_en: address.address_en,
            area: address.area,
            latitude: address.latitude || '',
            longitude: address.longitude || '',
            is_primary: address.is_primary
        });
        setShowAddForm(true);
    };

    const handleDelete = async (addressId) => {
        if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;
        
        try {
            await axios.delete(`/api/seller/restaurants/${restaurantId}/addresses/${addressId}`);
            fetchAddresses();
            if (onAddressesChange) onAddressesChange();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('حدث خطأ أثناء حذف العنوان');
        }
    };

    const handleSetPrimary = async (addressId) => {
        try {
            await axios.put(`/api/seller/restaurants/${restaurantId}/addresses/${addressId}/set-primary`);
            fetchAddresses();
            if (onAddressesChange) onAddressesChange();
        } catch (error) {
            console.error('Error setting primary address:', error);
            alert('حدث خطأ أثناء تعيين العنوان الرئيسي');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    إدارة عناوين المطعم
                </h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showAddForm ? 'إلغاء' : 'إضافة عنوان جديد'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">
                        {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    اسم العنوان (عربي)
                                </label>
                                <input
                                    type="text"
                                    name="name_ar"
                                    value={formData.name_ar}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    اسم العنوان (إنجليزي)
                                </label>
                                <input
                                    type="text"
                                    name="name_en"
                                    value={formData.name_en}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    العنوان التفصيلي (عربي)
                                </label>
                                <textarea
                                    name="address_ar"
                                    value={formData.address_ar}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    العنوان التفصيلي (إنجليزي)
                                </label>
                                <textarea
                                    name="address_en"
                                    value={formData.address_en}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المنطقة
                                </label>
                                <div className="space-y-2 border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                                    {Object.entries(areas).map(([key, value]) => (
                                        <label key={key} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                                type="radio"
                                                name="area"
                                                value={key}
                                                checked={formData.area === key}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                required
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {value.ar}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {value.en}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    خط العرض
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="23.5880"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    خط الطول
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="58.3829"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_primary"
                                checked={formData.is_primary}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="mr-2 text-sm text-gray-700">
                                العنوان الرئيسي
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {editingAddress ? 'تحديث' : 'إضافة'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses List */}
            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        لا توجد عناوين مسجلة لهذا المطعم
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`border rounded-lg p-4 ${
                                address.is_primary ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-lg font-medium text-gray-800">
                                            {address.name}
                                        </h4>
                                        {address.is_primary && (
                                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                رئيسي
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">{address.address}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>المنطقة: {address.area_name}</span>
                                        {address.latitude && address.longitude && (
                                            <span>
                                                الإحداثيات: {address.latitude}, {address.longitude}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!address.is_primary && (
                                        <button
                                            onClick={() => handleSetPrimary(address.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            تعيين كرئيسي
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RestaurantAddressManager;
