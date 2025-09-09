import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showAlert, showOperationFailed } from '../utils/popupUtils';

const AddressDropdown = ({ 
    restaurantId, 
    value, 
    onChange, 
    placeholder = "اختر العنوان",
    className = "",
    disabled = false,
    showAddButton = false,
    onAddressAdded = null
}) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
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
    const [areas, setAreas] = useState({});

    useEffect(() => {
        if (restaurantId) {
            fetchAddresses();
            fetchAreas();
        }
    }, [restaurantId]);

    const fetchAddresses = async () => {
        if (!restaurantId) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`/api/seller/restaurants/${restaurantId}/addresses`);
            setAddresses(response.data.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/seller/restaurants/${restaurantId}/addresses`, formData);
            await fetchAddresses();
            setShowAddForm(false);
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
            if (onAddressAdded) onAddressAdded();
        } catch (error) {
            console.error('Error adding address:', error);
            showOperationFailed('إضافة العنوان');
        }
    };

    const selectedAddress = addresses.find(addr => addr.id == value);

    return (
        <div className={`relative ${className}`}>
            <div className="flex gap-2">
                {/* Address Selection */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {placeholder}
                    </label>
                    {loading ? (
                        <div className="text-gray-500 text-sm">جاري التحميل...</div>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                            {addresses.length === 0 ? (
                                <div className="text-gray-500 text-sm">لا توجد عناوين متاحة</div>
                            ) : (
                                addresses.map((address) => (
                                    <label key={address.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            value={address.id}
                                            checked={value == address.id}
                                            onChange={(e) => onChange(e.target.value)}
                                            disabled={disabled}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {address.name}
                                                {address.is_primary && (
                                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                        رئيسي
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {address.address} - {address.area_name}
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                {showAddButton && (
                    <button
                        type="button"
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-end"
                    >
                        إضافة عنوان
                    </button>
                )}
            </div>

            {/* Selected Address Details */}
            {selectedAddress && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">
                        <p><strong>العنوان:</strong> {selectedAddress.address}</p>
                        <p><strong>المنطقة:</strong> {selectedAddress.area_name}</p>
                        {selectedAddress.latitude && selectedAddress.longitude && (
                            <p><strong>الإحداثيات:</strong> {selectedAddress.latitude}, {selectedAddress.longitude}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Add Address Form */}
            {showAddForm && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <h4 className="text-lg font-medium mb-4">إضافة عنوان جديد</h4>
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
                                    rows="2"
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
                                    rows="2"
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
                                إضافة
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AddressDropdown;
