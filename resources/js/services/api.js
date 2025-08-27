import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
    getMeals: (restaurantId) => api.get(`/restaurants/${restaurantId}/meals`),
};

// Subscriptions API
export const subscriptionsAPI = {
    getAll: () => api.get('/subscriptions'),
    getById: (id) => api.get(`/subscriptions/${id}`),
    create: (subscriptionData) => api.post('/subscriptions', subscriptionData),
    update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
    updateItemStatus: (subscriptionId, itemId, status) => api.put(`/subscriptions/${subscriptionId}/items/${itemId}/status`, { status }),
    delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Subscription Types API
export const subscriptionTypesAPI = {
    getAll: () => api.get('/subscription-types'),
    getById: (id) => api.get(`/subscription-types/${id}`),
    getByType: (type) => api.get(`/subscription-types/type/${type}`),
};

// Delivery Addresses API
export const deliveryAddressesAPI = {
    getAll: () => api.get('/delivery-addresses'),
    getById: (id) => api.get(`/delivery-addresses/${id}`),
    create: (addressData) => api.post('/delivery-addresses', addressData),
    update: (id, addressData) => api.put(`/delivery-addresses/${id}`, addressData),
    delete: (id) => api.delete(`/delivery-addresses/${id}`),
};

// Admin APIs
export const adminSubscriptionTypesAPI = {
    getAll: () => api.get('/admin/subscription-types'),
    getById: (id) => api.get(`/admin/subscription-types/${id}`),
    create: (typeData) => api.post('/admin/subscription-types', typeData),
    update: (id, typeData) => api.put(`/admin/subscription-types/${id}`, typeData),
    delete: (id) => api.delete(`/admin/subscription-types/${id}`),
};

export default api;
