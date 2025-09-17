import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useCart = () => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.get();

            if (response.data.success) {
                setCart(response.data.data);
            } else {
                setCart(null);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError(err.response?.data?.message || 'Failed to fetch cart');
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const createOrUpdateCart = async (cartData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.create(cartData);

            if (response.data.success) {
                setCart(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create/update cart');
            }
        } catch (err) {
            console.error('Error creating/updating cart:', err);
            setError(err.response?.data?.message || 'Failed to create/update cart');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.addItem(itemData);

            if (response.data.success) {
                // Refresh cart after adding item
                await fetchCart();
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to add item to cart');
            }
        } catch (err) {
            console.error('Error adding item to cart:', err);
            setError(err.response?.data?.message || 'Failed to add item to cart');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.removeItem(itemId);

            if (response.data.success) {
                // Refresh cart after removing item
                await fetchCart();
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to remove item from cart');
            }
        } catch (err) {
            console.error('Error removing item from cart:', err);
            setError(err.response?.data?.message || 'Failed to remove item from cart');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.clear();

            if (response.data.success) {
                setCart(null);
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to clear cart');
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError(err.response?.data?.message || 'Failed to clear cart');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveryAddress = async (addressId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.updateDeliveryAddress({ delivery_address_id: addressId });

            if (response.data.success) {
                // Refresh cart after updating
                await fetchCart();
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update delivery address');
            }
        } catch (err) {
            console.error('Error updating delivery address:', err);
            setError(err.response?.data?.message || 'Failed to update delivery address');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSpecialInstructions = async (instructions) => {
        try {
            setLoading(true);
            setError(null);
            const response = await cartAPI.updateSpecialInstructions({ special_instructions: instructions });

            if (response.data.success) {
                // Refresh cart after updating
                await fetchCart();
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update special instructions');
            }
        } catch (err) {
            console.error('Error updating special instructions:', err);
            setError(err.response?.data?.message || 'Failed to update special instructions');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch cart when user is authenticated
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Helper functions
    const getCartItemsCount = () => {
        return cart?.cart_items?.length || 0;
    };

    const getCartTotal = () => {
        return cart ? cart.total_amount + cart.delivery_price : 0;
    };

    const isItemInCart = (mealId, deliveryDate, mealType) => {
        if (!cart?.cart_items) return false;

        return cart.cart_items.some(item =>
            item.meal_id === mealId &&
            item.delivery_date === deliveryDate &&
            item.meal_type === mealType
        );
    };

    const hasItems = () => {
        return cart && cart.cart_items && cart.cart_items.length > 0;
    };

    return {
        cart,
        loading,
        error,
        fetchCart,
        createOrUpdateCart,
        addItem,
        removeItem,
        clearCart,
        updateDeliveryAddress,
        updateSpecialInstructions,
        // Helper functions
        getCartItemsCount,
        getCartTotal,
        isItemInCart,
        hasItems,
    };
};

export default useCart;