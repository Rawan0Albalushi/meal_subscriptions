import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
            // Token expired or invalid
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
    getUser: () => api.get('/user'),
};

// Restaurants API
export const restaurantsAPI = {
    getAll: () => api.get('/restaurants'),
    getById: (id) => api.get(`/restaurants/${id}`),
    getMeals: (restaurantId) => api.get(`/restaurants/${restaurantId}/meals`),
};

// Subscriptions API
export const subscriptionsAPI = {
    getAll: () => api.get('/subscriptions'),
    getById: (id) => api.get(`/subscriptions/${id}`),
    create: (subscriptionData) => api.post('/subscriptions', subscriptionData),
    update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
    delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Delivery Addresses API
export const deliveryAddressesAPI = {
    getAll: () => api.get('/delivery-addresses'),
    getById: (id) => api.get(`/delivery-addresses/${id}`),
    create: (addressData) => api.post('/delivery-addresses', addressData),
    update: (id, addressData) => api.put(`/delivery-addresses/${id}`, addressData),
    delete: (id) => api.delete(`/delivery-addresses/${id}`),
};

export default api;
