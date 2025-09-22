import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, subscriptionsAPI, deliveryAddressesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PopupMessage from '../../components/PopupMessage';
import AddressDropdown from '../../components/AddressDropdown';
import InteractiveMap from '../../components/InteractiveMap';

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
    
    // Address form (inline create)
    const [addingNewAddress, setAddingNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', address: '', phone: '', city: '' });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showAddressErrors, setShowAddressErrors] = useState(false);

    useEffect(() => {
        if (showAddressErrors && isNewAddressComplete()) {
            setShowAddressErrors(false);
        }
    }, [newAddress, showAddressErrors]);
    
    // Subscription details
    const [subscriptionTypeData, setSubscriptionTypeData] = useState(null);
    const [selectedMeals, setSelectedMeals] = useState([]);

    // Popup states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupTitle, setPopupTitle] = useState('');
    const [lastCheckoutError, setLastCheckoutError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchCartData();
        fetchDeliveryAddresses();
    }, [isAuthenticated]);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.get();

            if (response.data.success && response.data.data) {
                const cartData = response.data.data;
                setCart(cartData);
                setSelectedDeliveryAddress(cartData.delivery_address_id || '');
                setSpecialInstructions(cartData.special_instructions || '');
                
                // Set subscription type data
                if (cartData.subscription_type) {
                    setSubscriptionTypeData(cartData.subscription_type);
                }
                
                // Set selected meals from cart items
                if (cartData.cart_items && cartData.cart_items.length > 0) {
                    const meals = cartData.cart_items.map(item => ({
                        ...item.meal,
                        dayKey: item.day_key,
                        deliveryDate: item.delivery_date,
                        dayIcon: getDayIcon(item.day_key),
                        dayLabel: getDayLabel(item.day_key)
                    }));
                    console.log('Meals data from backend:', meals);
                    console.log('Meal images:', meals.map(meal => ({ id: meal.id, name: meal.name_ar, image: meal.image, image_url: meal.image_url })));
                    console.log('Cart items:', cartData.cart_items);
                    setSelectedMeals(meals);
                }
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

    // Scroll to top when cart data is loaded
    useEffect(() => {
        if (cart && !loading) {
            window.scrollTo(0, 0);
        }
    }, [cart, loading]);

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
            
            // Scroll to top after removing item
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
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
        // Beautiful confirm instead of window.confirm
        const confirmed = await new Promise((resolve) => {
            const confirmBox = document.createElement('div');
            confirmBox.style.position = 'fixed';
            confirmBox.style.top = '0';
            confirmBox.style.left = '0';
            confirmBox.style.right = '0';
            confirmBox.style.bottom = '0';
            confirmBox.style.background = 'rgba(0,0,0,0.5)';
            confirmBox.style.display = 'flex';
            confirmBox.style.alignItems = 'center';
            confirmBox.style.justifyContent = 'center';
            confirmBox.style.zIndex = '10000';

            const modal = document.createElement('div');
            modal.style.background = 'white';
            modal.style.borderRadius = '12px';
            modal.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            modal.style.padding = '24px';
            modal.style.width = '100%';
            modal.style.maxWidth = '420px';
            modal.style.direction = dir;

            modal.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                    <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#f59e0b,#ef4444); display:flex; align-items:center; justify-content:center; color:white; font-weight:700;">!</div>
                    <div style="font-size:1.1rem; font-weight:700; color:#111827;">${t('confirm')}</div>
                </div>
                <div style="color:#4b5563; font-size:0.95rem; margin-bottom:16px;">${t('confirmClearCart')}</div>
                <div style="display:flex; gap:8px; justify-content:${dir==='rtl'?'flex-start':'flex-end'};">
                    <button id="confirmCancelBtn" style="padding:10px 14px; border:1px solid #e5e7eb; background:#fff; color:#374151; border-radius:8px; font-weight:600; cursor:pointer;">${t('cancel')}</button>
                    <button id="confirmOkBtn" style="padding:10px 14px; border:none; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border-radius:8px; font-weight:700; cursor:pointer;">${t('clearCart')}</button>
                </div>
            `;

            confirmBox.appendChild(modal);
            document.body.appendChild(confirmBox);

            const cleanup = () => document.body.removeChild(confirmBox);
            modal.querySelector('#confirmOkBtn').onclick = () => { cleanup(); resolve(true); };
            modal.querySelector('#confirmCancelBtn').onclick = () => { cleanup(); resolve(false); };
        });

        if (!confirmed) return;

        try {
            setUpdating(true);
            await cartAPI.clear();

            setPopupTitle(t('success'));
            setPopupMessage(t('cartCleared'));
            setShowSuccessPopup(true);

            setCart(null);
            
            // Scroll to top after clearing cart
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
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

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const isNewAddressComplete = () => {
        return (
            newAddress.name?.trim() &&
            newAddress.address?.trim() &&
            newAddress.phone?.trim() &&
            newAddress.city?.trim()
        );
    };

    const getNewAddressErrors = () => {
        return {
            name: !newAddress.name?.trim(),
            address: !newAddress.address?.trim(),
            phone: !newAddress.phone?.trim(),
            city: !newAddress.city?.trim()
        };
    };

    const handleSaveNewAddress = async () => {
        if (!isNewAddressComplete()) {
            setShowAddressErrors(true);
            setPopupTitle(t('addressError'));
            setPopupMessage(t('enterCompleteAddressData'));
            setShowErrorPopup(true);
            return;
        }

        try {
            setUpdating(true);
            const createRes = await deliveryAddressesAPI.create({
                name: newAddress.name,
                address: newAddress.address,
                phone: newAddress.phone,
                city: newAddress.city,
                latitude: selectedLocation?.lat || null,
                longitude: selectedLocation?.lng || null
            });

            if (!createRes.data?.success || !createRes.data?.data?.id) {
                const errorMsg = createRes.data?.message || t('addressSaveFailed');
                setPopupTitle(t('addressSaveError'));
                setPopupMessage(errorMsg);
                setShowErrorPopup(true);
                return;
            }

            const createdId = createRes.data.data.id;
            setSelectedDeliveryAddress(createdId);

            await cartAPI.updateDeliveryAddress({ delivery_address_id: createdId });
            await fetchDeliveryAddresses();

            setPopupTitle(t('success'));
            setPopupMessage(t('deliveryAddressUpdated'));
            setShowSuccessPopup(true);

            // Exit add mode after successful save
            setAddingNewAddress(false);
        } catch (error) {
            console.error('Error saving new address:', error);
            setPopupTitle(t('error'));
            setPopupMessage(t('addressSaveFailed'));
            setShowErrorPopup(true);
        } finally {
            setUpdating(false);
        }
    };

    const handleCheckout = async () => {
        console.log('Starting checkout process...');
        console.log('Selected delivery address:', selectedDeliveryAddress);
        console.log('Special instructions:', specialInstructions);
        
        try {
            setCheckingOut(true);
            console.log('Setting checkingOut to true');

            // Prepare/ensure a delivery address id. If user is adding a new address, create it now.
            let deliveryAddressId = selectedDeliveryAddress;

            const shouldCreateAddress = addingNewAddress || !deliveryAddressId;
            if (shouldCreateAddress) {
                if (!isNewAddressComplete()) {
                    setShowAddressErrors(true);
                    console.log('New address is incomplete while trying to checkout');
                    setPopupTitle(t('error'));
                    setPopupMessage(t('enterCompleteAddressData'));
                    setShowErrorPopup(true);
                    setCheckingOut(false);
                    return;
                }

                console.log('Creating new delivery address before checkout');
                const createRes = await deliveryAddressesAPI.create({
                    name: newAddress.name,
                    address: newAddress.address,
                    phone: newAddress.phone,
                    city: newAddress.city,
                    latitude: selectedLocation?.lat || null,
                    longitude: selectedLocation?.lng || null
                });

                if (!createRes.data?.success || !createRes.data?.data?.id) {
                    const errorMsg = createRes.data?.message || t('addressSaveFailed');
                    setPopupTitle(t('addressSaveError'));
                    setPopupMessage(errorMsg);
                    setShowErrorPopup(true);
                    setCheckingOut(false);
                    return;
                }

                deliveryAddressId = createRes.data.data.id;
                setSelectedDeliveryAddress(deliveryAddressId);

                // Persist the new address on the cart for backend validation
                await cartAPI.updateDeliveryAddress({ delivery_address_id: deliveryAddressId });
                // Refresh local addresses list
                await fetchDeliveryAddresses();
            }

            if (!deliveryAddressId) {
                console.log('No delivery address available after attempts');
                setPopupTitle(t('error'));
                setPopupMessage(t('pleaseSelectDeliveryAddress'));
                setShowErrorPopup(true);
                setCheckingOut(false);
                return;
            }

            // Use the ensured deliveryAddressId
            const checkoutData = {
                delivery_address_id: deliveryAddressId,
                special_instructions: specialInstructions
            };

            console.log('Sending checkout data:', checkoutData);
            const response = await subscriptionsAPI.checkoutFromCart(checkoutData);
            console.log('Checkout response:', response);

            if (response.data.success && response.data.payment_link) {
                console.log('Checkout successful, redirecting to payment link:', response.data.payment_link);
                // Redirect to payment
                window.location.href = response.data.payment_link;
            } else {
                console.log('Checkout failed:', response.data);
                throw new Error(response.data.message || 'Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            console.error('Error response:', error.response);
            setPopupTitle(t('error'));
            setPopupMessage(error.response?.data?.message || t('checkoutFailed'));
            setShowErrorPopup(true);
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message;
            setLastCheckoutError(`${status ? `[${status}] ` : ''}${serverMessage || error.message || 'Unknown error'}`);
        } finally {
            setCheckingOut(false);
            console.log('Setting checkingOut to false');
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

    // Helper functions for subscription pricing
    const calculateTotalPrice = () => {
        if (!cart?.subscription_type) return '0.00';
        const subscriptionPrice = parseFloat(cart.subscription_type.price || 0);
        const deliveryPrice = parseFloat(cart.subscription_type.delivery_price || 0);
        return formatPrice(subscriptionPrice + deliveryPrice);
    };

    const calculateSubscriptionPrice = () => {
        if (!cart?.subscription_type) return '0.00';
        return formatPrice(cart.subscription_type.price);
    };

    const calculateDeliveryPrice = () => {
        if (!cart?.subscription_type) return '0.00';
        return formatPrice(cart.subscription_type.delivery_price);
    };

    const isDeliveryFree = () => {
        if (!cart?.subscription_type) return true;
        return parseFloat(cart.subscription_type.delivery_price || 0) === 0;
    };

    // Helper functions for day mapping
    const getDayIcon = (dayKey) => {
        const dayIcons = {
            'sunday': '🌅',
            'monday': '🌞',
            'tuesday': '☀️',
            'wednesday': '🌤️',
            'thursday': '🌅'
        };
        return dayIcons[dayKey] || '📅';
    };

    const getDayLabel = (dayKey) => {
        const dayLabels = {
            'sunday': t('sunday'),
            'monday': t('monday'),
            'tuesday': t('tuesday'),
            'wednesday': t('wednesday'),
            'thursday': t('thursday')
        };
        return dayLabels[dayKey] || dayKey;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
            }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{
                        borderBottomColor: '#4a757c'
                    }}></div>
                    <p className="text-gray-600 text-lg font-medium">{t('loadingData')}</p>
                </div>
            </div>
        );
    }

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        return (
            <div className="min-h-screen py-8" style={{
                background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
            }}>
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-16">
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/20 max-w-2xl mx-auto">
                            <div className="text-6xl mb-6">🛒</div>
                            <h2 className="text-3xl font-bold mb-4" style={{
                                background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                            {t('cartEmpty')}
                        </h2>
                            <p className="text-gray-600 mb-8 text-lg">
                            {t('startAddingItems')}
                        </p>
                        <button
                            onClick={() => navigate('/restaurants')}
                                className="text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
                                }}
                        >
                            {t('browseRestaurants')}
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8" dir={dir} style={{
            background: 'linear-gradient(135deg, #faeeee 0%, #eefafa 100%)'
        }}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4" style={{
                            background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: '1.3',
                            padding: '0.5rem 0',
                            minHeight: '4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                    {t('myCart')}
                </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {language === 'ar' ? 'راجع تفاصيل الاشتراك وأكمل طلبك' : 'Review your subscription details and complete your order'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                    {/* Subscription Details */}
                    <div className="lg:col-span-4">
                        <div className="bg-white/85 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
                            {/* Restaurant Info */}
                            <div className="rounded-2xl p-4 text-white mb-4 relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #4a757c, #ba6c5d)'
                                }}>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                                
                                <div className="text-center relative z-10">
                                    <h3 className="text-xl font-bold mb-1">
                                        {language === 'ar' ? cart.restaurant?.name_ar : cart.restaurant?.name_en}
                                    </h3>
                                    <p className="text-white/90 text-sm">
                                        {language === 'ar' ? cart.subscription_type?.name_ar : cart.subscription_type?.name_en}
                                    </p>
                                </div>
                            </div>

                            {/* Subscription Details */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="rounded-2xl p-4 text-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))',
                                        border: '1px solid rgba(47, 110, 115, 0.2)'
                                    }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2"
                                        style={{ color: '#4a757c' }}>
                                        {t('subscriptionTypeLabel')}
                                    </div>
                                    <div className="text-lg font-bold text-gray-800">
                                        {cart.subscription_type?.type === 'weekly' ? t('weekly') : t('monthly')}
                                    </div>
                                </div>
                                <div className="rounded-2xl p-4 text-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(182, 84, 73, 0.05), rgba(200, 106, 90, 0.05))',
                                        border: '1px solid rgba(182, 84, 73, 0.2)'
                                    }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2"
                                        style={{ color: '#b65449' }}>
                                        {t('mealsCount')}
                                    </div>
                                    <div className="text-lg font-bold text-gray-800">
                                        {selectedMeals.length}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Meals */}
                            {selectedMeals.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                        {t('selectedMeals')}
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedMeals
                                            .sort((a, b) => {
                                                const dateA = a.deliveryDate ? new Date(a.deliveryDate) : new Date();
                                                const dateB = b.deliveryDate ? new Date(b.deliveryDate) : new Date();
                                                return dateA - dateB;
                                            })
                                            .map((meal, index) => (
                                            <div key={meal.id || index} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="relative">
                                                        {(meal.image || meal.image_url) ? (
                                                            <img
                                                                src={meal.image_url || meal.image}
                                                                alt={language === 'ar' ? meal.name_ar : meal.name_en}
                                                                className="w-28 h-28 rounded-xl object-cover shadow-sm"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div 
                                                            className={`w-28 h-28 rounded-xl shadow-sm flex items-center justify-center text-4xl ${(meal.image || meal.image_url) ? 'hidden' : 'flex'}`}
                                                            style={{ backgroundColor: '#f3f4f6' }}
                                                        >
                                                            🍽️
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold mb-1"
                                                            style={{ color: '#4a757c' }}>
                                                            {meal.dayLabel}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mb-2">
                                                            {meal.deliveryDate 
                                                                ? new Date(meal.deliveryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' 
                                                                }) 
                                                                : formatDate(meal.deliveryDate)}
                                                        </div>
                                                        <div className="font-semibold text-gray-800 mb-2">
                                                            {language === 'ar' ? meal.name_ar : meal.name_en}
                                                        </div>
                                                        {meal.description_ar || meal.description_en ? (
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                {language === 'ar' ? meal.description_ar : meal.description_en}
                                                            </div>
                                                        ) : null}
                                                        {meal.delivery_time ? (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <span>🕐</span>
                                                                <span>{t('deliveryTime')}: {meal.delivery_time}</span>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                            )}

                            {/* Clear Cart */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleClearCart}
                                    disabled={updating}
                                    className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300"
                                >
                                    🗑️ {t('clearCart')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/85 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 sticky top-4">
                            <div className="text-center mb-8">
                                <div className="text-5xl mb-4">📋</div>
                                <h3 className="text-2xl font-bold" style={{
                                    background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {language === 'ar' ? 'ملخص الاشتراك' : 'Subscription Summary'}
                            </h3>
                            </div>

                            {/* Delivery Address */}
                            <div className="mb-6">
                                <label className="block text-lg font-bold text-gray-800 mb-3">
                                    🏠 {t('deliveryAddress')} *
                                </label>
                                
                                {deliveryAddresses.length > 0 && !addingNewAddress ? (
                                    <div className="space-y-4">
                                        <select 
                                    value={selectedDeliveryAddress}
                                            onChange={(e) => handleUpdateDeliveryAddress(e.target.value)}
                                            className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-lg transition-all duration-300 outline-none"
                                            style={{
                                                focusBorderColor: '#4a757c',
                                                focusRingColor: 'rgba(47, 110, 115, 0.1)'
                                            }}
                                            required
                                        >
                                            <option value="">{t('selectDeliveryAddress')}</option>
                                            {deliveryAddresses.map((address) => (
                                                <option key={address.id} value={address.id}>
                                                    {address.name} - {address.address}
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            onClick={() => setAddingNewAddress(true)}
                                            className="w-full text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                            style={{
                                                background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
                                            }}
                                        >
                                            {t('addNewAddress')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {t('addressName')}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={newAddress.name} 
                                                    onChange={(e) => { setAddingNewAddress(true); setNewAddress(prev => ({ ...prev, name: e.target.value })); }} 
                                                    placeholder={t('addressNamePlaceholder')} 
                                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                                                    required 
                                                />
                                                {showAddressErrors && getNewAddressErrors().name && (
                                                    <p className="mt-1 text-sm text-red-600">{t('fieldIsRequired')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {t('detailedAddress')}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={newAddress.address} 
                                                    onChange={(e) => { setAddingNewAddress(true); setNewAddress(prev => ({ ...prev, address: e.target.value })); }} 
                                                    placeholder={t('detailedAddressPlaceholder')} 
                                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                                                    required 
                                                />
                                                {showAddressErrors && getNewAddressErrors().address && (
                                                    <p className="mt-1 text-sm text-red-600">{t('fieldIsRequired')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {t('city')}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={newAddress.city} 
                                                    onChange={(e) => { setAddingNewAddress(true); setNewAddress(prev => ({ ...prev, city: e.target.value })); }} 
                                                    placeholder={t('cityPlaceholder')} 
                                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                                                    required 
                                                />
                                                {showAddressErrors && getNewAddressErrors().city && (
                                                    <p className="mt-1 text-sm text-red-600">{t('fieldIsRequired')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {t('phone')}
                                                </label>
                                                <input 
                                                    type="tel" 
                                                    value={newAddress.phone} 
                                                    onChange={(e) => { setAddingNewAddress(true); setNewAddress(prev => ({ ...prev, phone: e.target.value })); }} 
                                                    placeholder={t('phonePlaceholder')} 
                                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl transition-all duration-300 outline-none"
                                                    style={{ 
                                                        direction: 'ltr', 
                                                        textAlign: 'left'
                                                    }}
                                                    required 
                                                />
                                                {showAddressErrors && getNewAddressErrors().phone && (
                                                    <p className="mt-1 text-sm text-red-600">{t('fieldIsRequired')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Interactive Map */}
                            <div className="mb-6">
                                <div className="rounded-2xl p-6 border"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))',
                                        borderColor: 'rgba(47, 110, 115, 0.2)'
                                    }}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                        {t('selectLocationOnMapTitle')}
                                    </h3>
                                    <InteractiveMap 
                                        onLocationSelect={handleLocationSelect}
                                        selectedLocation={selectedLocation}
                                        initialLat={23.5880}
                                        initialLng={58.3829}
                                    />
                                    
                                    {selectedLocation && (
                                        <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">
                                                        {t('selectedLocation')}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {t('latitude')} {selectedLocation.lat.toFixed(6)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {t('longitude')} {selectedLocation.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setSelectedLocation(null)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    {t('cancel')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="mb-6">
                                <label className="block text-lg font-bold text-gray-800 mb-3">
                                    {t('specialInstructions')}
                                </label>
                                <textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    onBlur={(e) => {
                                        handleUpdateSpecialInstructions();
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-lg transition-all duration-300 outline-none resize-none"
                                    style={{ 
                                        '--tw-ring-color': '#4a757c',
                                        '--tw-ring-opacity': '0.1'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#4a757c';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(74, 117, 124, 0.1)';
                                    }}
                                    rows="3"
                                    placeholder={t('specialInstructionsPlaceholder')}
                                />
                            </div>

                            {/* Enhanced Price Details */}
                            <div className="bg-gradient-to-br from-white/90 to-blue-50/50 rounded-3xl p-6 border border-white/30 shadow-lg mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                    💰 {t('priceBreakdown')}
                                </h3>
                                
                                <div className="space-y-3">
                                    {/* Subscription Price */}
                                    <div className="flex items-center justify-between p-3 rounded-2xl border"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))',
                                            borderColor: 'rgba(47, 110, 115, 0.2)'
                                        }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                                                style={{
                                                    background: 'linear-gradient(135deg, #4a757c, #ba6c5d)'
                                                }}>
                                                📦
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 font-medium">{t('subscriptionPrice')}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold" style={{ color: '#4a757c' }}>
                                                {calculateSubscriptionPrice()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Price */}
                                    <div className="flex items-center justify-between p-3 rounded-2xl border"
                                        style={{
                                            background: isDeliveryFree() 
                                                ? 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(74, 138, 143, 0.05))' 
                                                : 'linear-gradient(135deg, rgba(182, 84, 73, 0.05), rgba(200, 106, 90, 0.05))',
                                            borderColor: isDeliveryFree() 
                                                ? 'rgba(47, 110, 115, 0.2)' 
                                                : 'rgba(182, 84, 73, 0.2)'
                                        }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                                                style={{
                                                    background: isDeliveryFree() 
                                                        ? 'linear-gradient(135deg, #4a757c, #ba6c5d)' 
                                                        : 'linear-gradient(135deg, #b65449, #c86a5a)'
                                                }}>
                                                🚚
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 font-medium">{t('deliveryPrice')}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold"
                                                style={{ 
                                                    color: isDeliveryFree() ? '#4a757c' : '#b65449'
                                                }}>
                                                {isDeliveryFree() ? t('free') : calculateDeliveryPrice()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-gray-200 my-4"></div>

                                    {/* Total Amount */}
                                    <div className="flex items-center justify-between p-3 rounded-2xl border"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(47, 110, 115, 0.05), rgba(182, 84, 73, 0.05))',
                                            borderColor: 'rgba(47, 110, 115, 0.2)'
                                        }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                                                style={{
                                                    background: 'linear-gradient(135deg, #4a757c, #ba6c5d)'
                                                }}>
                                                💰
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 font-medium">{t('totalAmount')}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold" style={{ color: '#4a757c' }}>
                                                {calculateTotalPrice()}
                                            </div>
                                </div>
                                </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            {(() => {
                                const canProceed = !checkingOut && (
                                    addingNewAddress ? isNewAddressComplete() : Boolean(selectedDeliveryAddress)
                                );
                                return (
                                    <>
                                    <button
                                onClick={handleCheckout}
                                disabled={!canProceed}
                                className="w-full text-white py-4 px-6 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)'
                                }}
                            >
                                {checkingOut ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                                        <span>{t('processing')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-lg">💳</span>
                                        <span>
                                            {language === 'ar' ? 'متابعة الدفع وإنشاء الاشتراك' : 'Proceed to Payment & Create Subscription'}
                                        </span>
                                    </div>
                                )}
                            </button>
                            {!canProceed && addingNewAddress && showAddressErrors && (
                                (() => {
                                    const errs = getNewAddressErrors();
                                    const missing = [
                                        errs.name ? t('addressName') : null,
                                        errs.address ? t('detailedAddress') : null,
                                        errs.city ? t('city') : null,
                                        errs.phone ? t('phone') : null,
                                    ].filter(Boolean);
                                    return (
                                        <p className="mt-2 text-sm text-red-600">
                                            {t('pleaseFillRequiredFields')}: {missing.join('، ')}
                                        </p>
                                    );
                                })()
                            )}
                                    </>
                        );
                    })()}
                            {lastCheckoutError && (
                                <div className="mt-3 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                                    {lastCheckoutError}
                                </div>
                            )}
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