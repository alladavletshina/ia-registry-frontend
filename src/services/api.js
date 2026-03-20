// src/services/api.js - РЕАЛЬНАЯ АВТОРИЗАЦИЯ
import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

// URL для авторизации
const AUTH_URL = 'http://localhost:8083/api/auth';

console.log('🔐 Auth endpoint:', AUTH_URL);

// Axios instance для auth
const authApi = axios.create({
    baseURL: AUTH_URL,
    timeout: 10000
});

// Перехватчик запросов (добавление токена)
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Перехватчик ответов (обработка 401)
authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return authApi(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// РЕАЛЬНЫЙ login запрос - ТОЧНО КАК В CURL
export const login = async (credentials) => {
    console.log('📤 Sending login to:', AUTH_URL + '/login');
    console.log('📤 Credentials:', credentials);

    try {
        const response = await authApi.post('/login', {
            username: credentials.username,
            password: credentials.password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Login response:', response.data);
        return response;

    } catch (error) {
        console.error('❌ Login error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

// Дополнительные методы
export const logout = (refreshToken) => {
    console.log('🔐 Logout request');
    return authApi.post('/logout', { refreshToken });
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token');
    }
    return authApi.get('/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Для остального - временно отключено
export const assetsAPI = {
    getAll: () => Promise.reject(new Error('Assets API not implemented')),
    getById: () => Promise.reject(new Error('Assets API not implemented')),
    create: () => Promise.reject(new Error('Assets API not implemented')),
    update: () => Promise.reject(new Error('Assets API not implemented')),
    delete: () => Promise.reject(new Error('Assets API not implemented')),
};

export const usersAPI = {
    getAll: () => Promise.reject(new Error('Users API not implemented')),
    create: () => Promise.reject(new Error('Users API not implemented')),
    update: () => Promise.reject(new Error('Users API not implemented')),
};

export default authApi;