import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token and language preference
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add language preference from localStorage
        const language = localStorage.getItem('language') || 'ar';
        config.headers['Accept-Language'] = language;
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    user: () => api.get('/auth/user'),
};

// Restaurants API
export const restaurantsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.locations) {
            params.append('locations[]', filters.locations);
        }
        if (filters.meal_types) {
            params.append('meal_types[]', filters.meal_types);
        }
        return api.get(`/restaurants?${params.toString()}`);
    },
    getFilters: () => api.get('/restaurants/filters'),
    getById: (id) => api.get(`/restaurants/${id}`),
    getMeals: (restaurantId, params = {}) => {
        const queryString = new URLSearchParams();
        if (params.subscription_type_id) {
            queryString.append('subscription_type_id', params.subscription_type_id);
        }
        const url = `/restaurants/${restaurantId}/meals${queryString.toString() ? `?${queryString.toString()}` : ''}`;
        return api.get(url);
    },
};

// Subscriptions API
export const subscriptionsAPI = {
    getAll: () => api.get('/subscriptions'),
    getById: (id) => api.get(`/subscriptions/${id}`),
    create: (subscriptionData) => api.post('/subscriptions', subscriptionData),
    initiatePayment: (subscriptionData) => api.post('/subscriptions/initiate-payment', subscriptionData),
    checkoutFromCart: (checkoutData) => api.post('/subscriptions/checkout-from-cart', checkoutData),
    update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
    updateItemStatus: (subscriptionId, itemId, status) => api.put(`/subscriptions/${subscriptionId}/items/${itemId}/status`, { status }),
    delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    create: (cartData) => api.post('/cart', cartData),
    addItem: (itemData) => api.post('/cart/items', itemData),
    removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
    clear: () => api.delete('/cart/clear'),
    updateDeliveryAddress: (addressData) => api.put('/cart/delivery-address', addressData),
    updateSpecialInstructions: (instructionsData) => api.put('/cart/special-instructions', instructionsData),
};

// Seller APIs
export const sellerAPI = {
    // Restaurant management
    getRestaurants: () => api.get('/seller/restaurants'),
    getRestaurant: (id) => api.get(`/seller/restaurants/${id}`),
    createRestaurant: (data) => api.post('/seller/restaurants', data),
    updateRestaurant: (id, data) => api.put(`/seller/restaurants/${id}`, data),
    deleteRestaurant: (id) => api.delete(`/seller/restaurants/${id}`),
    toggleRestaurantStatus: (id) => api.put(`/seller/restaurants/${id}/toggle-status`),
    
    // Meal management
    getRestaurantMeals: (restaurantId) => api.get(`/seller/restaurants/${restaurantId}/meals`),
    getRestaurantMeal: (restaurantId, mealId) => api.get(`/seller/restaurants/${restaurantId}/meals/${mealId}`),
    createRestaurantMeal: (restaurantId, data) => api.post(`/seller/restaurants/${restaurantId}/meals`, data),
    updateRestaurantMeal: (restaurantId, mealId, data) => api.put(`/seller/restaurants/${restaurantId}/meals/${mealId}`, data),
    deleteRestaurantMeal: (restaurantId, mealId) => api.delete(`/seller/restaurants/${restaurantId}/meals/${mealId}`),
    toggleMealAvailability: (restaurantId, mealId) => api.put(`/seller/restaurants/${restaurantId}/meals/${mealId}/toggle-availability`),
    
    // Subscription management
    getRestaurantSubscriptions: (restaurantId) => api.get(`/seller/restaurants/${restaurantId}/subscriptions`),
    getRestaurantSubscription: (restaurantId, subscriptionId) => api.get(`/seller/restaurants/${restaurantId}/subscriptions/${subscriptionId}`),
    updateSubscriptionStatus: (restaurantId, subscriptionId, status) => api.put(`/seller/restaurants/${restaurantId}/subscriptions/${subscriptionId}/status`, { status }),
    updateItemStatus: (restaurantId, subscriptionId, itemId, status) => api.put(`/seller/restaurants/${restaurantId}/subscriptions/${subscriptionId}/items/${itemId}/status`, { status }),
    
    // Today's orders
    getTodayOrders: (restaurantId) => api.get(`/seller/restaurants/${restaurantId}/today-orders`),
};

// Subscription Types API
export const subscriptionTypesAPI = {
    getAll: () => api.get('/subscription-types'),
    getById: (id) => api.get(`/subscription-types/${id}`),
    getByType: (type) => api.get(`/subscription-types/type/${type}`),
    getByRestaurant: (restaurantId) => api.get(`/restaurants/${restaurantId}/subscription-types`),
    create: (typeData) => api.post('/subscription-types', typeData),
    update: (id, typeData) => api.put(`/subscription-types/${id}`, typeData),
    delete: (id) => api.delete(`/subscription-types/${id}`),
};

// Delivery Addresses API
export const deliveryAddressesAPI = {
    getAll: () => api.get('/delivery-addresses'),
    getById: (id) => api.get(`/delivery-addresses/${id}`),
    create: (addressData) => api.post('/delivery-addresses', addressData),
    update: (id, addressData) => api.put(`/delivery-addresses/${id}`, addressData),
    delete: (id) => api.delete(`/delivery-addresses/${id}`),
};

// Payment APIs
export const paymentsAPI = {
    checkStatus: (subscriptionId) => api.get(`/payments/status/${subscriptionId}`),
    success: (subscriptionId) => api.get(`/payments/success?subscription_id=${subscriptionId}`),
    cancel: (subscriptionId) => api.get(`/payments/cancel?subscription_id=${subscriptionId}`),
};

// Admin APIs
export const adminSubscriptionTypesAPI = {
    getAll: () => api.get('/admin/subscription-types'),
    getById: (id) => api.get(`/admin/subscription-types/${id}`),
    create: (typeData) => api.post('/admin/subscription-types', typeData),
    update: (id, typeData) => api.put(`/admin/subscription-types/${id}`, typeData),
    delete: (id) => api.delete(`/admin/subscription-types/${id}`),
    getRestaurants: () => api.get('/admin/subscription-types/restaurants/list'),
};

// Admin Subscriptions API
export const adminSubscriptionsAPI = {
    getAll: (params = '') => api.get(`/admin/subscriptions${params ? '?' + params : ''}`),
    getById: (id) => api.get(`/admin/subscriptions/${id}`),
    update: (id, subscriptionData) => api.put(`/admin/subscriptions/${id}`, subscriptionData),
    updateItemStatus: (subscriptionId, itemId, status) => api.put(`/admin/subscriptions/${subscriptionId}/items/${itemId}/status`, { status }),
    delete: (id) => api.delete(`/admin/subscriptions/${id}`),
    getStatistics: () => api.get('/admin/subscriptions/statistics'),
    getRestaurants: () => api.get('/admin/subscriptions/restaurants/list'),
    getUsers: () => api.get('/admin/subscriptions/users/list'),
    getStatusOptions: () => api.get('/admin/subscriptions/status-options'),
};

export default api;
