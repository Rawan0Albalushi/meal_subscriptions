import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, subscriptionsAPI, deliveryAddressesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import AddressDropdown from '../../components/AddressDropdown';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t, language, dir } = useLanguage();

    const [cart, setCart] = useState(null);
    const [deliveryAddresses, setDeliveryAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState(null);

    // Form states
    const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');

    // Popup states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupTitle, setPopupTitle] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchCartData();
        fetchDeliveryAddresses();
    }, [isAuthenticated]);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.get();

            if (response.data.success && response.data.data) {
                setCart(response.data.data);
                setSelectedDeliveryAddress(response.data.data.delivery_address_id || '');
                setSpecialInstructions(response.data.data.special_instructions || '');
            } else {
                setCart(null);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryAddresses = async () => {
        try {
            const response = await deliveryAddressesAPI.getAll();
            setDeliveryAddresses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching delivery addresses:', error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setUpdating(true);
            await cartAPI.removeItem(itemId);

            setPopupTitle(t('success'));
            setPopupMessage(t('itemRemovedFromCart'));
            setShowSuccessPopup(true);

            fetchCartData();
        } catch (error) {
            console.error('Error removing item:', error);
            setPopupTitle(t('error'));
            setPopupMessage(t('failedToRemoveItem'));
            setShowErrorPopup(true);
        } finally {
            setUpdating(false);
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm(t('confirmClearCart'))) {
            return;
        }

        try {
            setUpdating(true);
            await cartAPI.clear();

            setPopupTitle(t('success'));
            setPopupMessage(t('cartCleared'));
            setShowSuccessPopup(true);

            setCart(null);
        } catch (error) {
            console.error('Error clearing cart:', error);
            setPopupTitle(t('error'));
            setPopupMessage(t('failedToClearCart'));
            setShowErrorPopup(true);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateDeliveryAddress = async (addressId) => {
        try {
            setUpdating(true);
            await cartAPI.updateDeliveryAddress({ delivery_address_id: addressId });
            setSelectedDeliveryAddress(addressId);

            setPopupTitle(t('success'));
            setPopupMessage(t('deliveryAddressUpdated'));
            setShowSuccessPopup(true);

            fetchCartData();
        } catch (error) {
            console.error('Error updating delivery address:', error);
            setPopupTitle(t('error'));
            setPopupMessage(t('failedToUpdateAddress'));
            setShowErrorPopup(true);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateSpecialInstructions = async () => {
        try {
            setUpdating(true);
            await cartAPI.updateSpecialInstructions({ special_instructions: specialInstructions });

            setPopupTitle(t('success'));
            setPopupMessage(t('specialInstructionsUpdated'));
            setShowSuccessPopup(true);

            fetchCartData();
        } catch (error) {
            console.error('Error updating special instructions:', error);
            setPopupTitle(t('error'));
            setPopupMessage(t('failedToUpdateInstructions'));
            setShowErrorPopup(true);
        } finally {
            setUpdating(false);
        }
    };

    const handleCheckout = async () => {
        if (!selectedDeliveryAddress) {
            setPopupTitle(t('error'));
            setPopupMessage(t('pleaseSelectDeliveryAddress'));
            setShowErrorPopup(true);
            return;
        }

        try {
            setCheckingOut(true);

            const checkoutData = {
                delivery_address_id: selectedDeliveryAddress,
                special_instructions: specialInstructions
            };

            const response = await subscriptionsAPI.checkoutFromCart(checkoutData);

            if (response.data.success && response.data.payment_link) {
                // Redirect to payment
                window.location.href = response.data.payment_link;
            } else {
                throw new Error(response.data.message || 'Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            setPopupTitle(t('error'));
            setPopupMessage(error.response?.data?.message || t('checkoutFailed'));
            setShowErrorPopup(true);
        } finally {
            setCheckingOut(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPrice = (price) => {
        return `${parseFloat(price).toFixed(3)} ${t('omr')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">
                            {t('cartEmpty')}
                        </h2>
                        <p className="text-gray-500 mb-8">
                            {t('startAddingItems')}
                        </p>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            {t('browseRestaurants')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8" dir={dir}>
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    {t('myCart')}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            {/* Restaurant Info */}
                            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={cart.restaurant?.logo}
                                    alt={cart.restaurant?.name_ar}
                                    className="w-16 h-16 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {language === 'ar' ? cart.restaurant?.name_ar : cart.restaurant?.name_en}
                                    </h3>
                                    <p className="text-gray-600">
                                        {language === 'ar' ? cart.subscription_type?.name_ar : cart.subscription_type?.name_en}
                                    </p>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-4">
                                {cart.cart_items?.map((item) => (
                                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={item.meal?.image}
                                                    alt={item.meal?.name_ar}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">
                                                        {language === 'ar' ? item.meal?.name_ar : item.meal?.name_en}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(item.delivery_date)} - {t(item.meal_type)}
                                                    </p>
                                                    <p className="text-lg font-bold text-orange-500">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={updating}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title={t('removeItem')}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Clear Cart */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleClearCart}
                                    disabled={updating}
                                    className="text-red-500 hover:text-red-700 font-medium"
                                >
                                    {t('clearCart')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                {t('orderSummary')}
                            </h3>

                            {/* Delivery Address */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('deliveryAddress')} *
                                </label>
                                <AddressDropdown
                                    addresses={deliveryAddresses}
                                    value={selectedDeliveryAddress}
                                    onChange={handleUpdateDeliveryAddress}
                                    placeholder={t('selectDeliveryAddress')}
                                />
                            </div>

                            {/* Special Instructions */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('specialInstructions')}
                                </label>
                                <textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    onBlur={handleUpdateSpecialInstructions}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows="3"
                                    placeholder={t('enterSpecialInstructions')}
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('subtotal')}</span>
                                    <span>{formatPrice(cart.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{t('deliveryFee')}</span>
                                    <span>{formatPrice(cart.delivery_price)}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between text-lg font-bold text-gray-800">
                                    <span>{t('total')}</span>
                                    <span>{formatPrice(cart.total_with_delivery)}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut || !selectedDeliveryAddress}
                                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {checkingOut ? t('processing') : t('proceedToPayment')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <PopupMessage
                    title={popupTitle}
                    message={popupMessage}
                    type="success"
                    onClose={() => setShowSuccessPopup(false)}
                />
            )}

            {/* Error Popup */}
            {showErrorPopup && (
                <PopupMessage
                    title={popupTitle}
                    message={popupMessage}
                    type="error"
                    onClose={() => setShowErrorPopup(false)}
                />
            )}
        </div>
    );
};

export default Cart;