// services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Интерцептор для добавления токена
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout')
};

export const assetsAPI = {
    getAll: (filters) => api.get('/assets', { params: filters }),
    getById: (id) => api.get(`/assets/${id}`),
    create: (asset) => api.post('/assets', asset),
    update: (id, asset) => api.put(`/assets/${id}`, asset),
    delete: (id) => api.delete(`/assets/${id}`),
    getMyAssets: () => api.get('/assets/my')
};

export const usersAPI = {
    getAll: () => api.get('/users'),
    create: (user) => api.post('/users', user),
    update: (id, user) => api.put(`/users/${id}`, user)
};