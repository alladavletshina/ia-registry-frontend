import axios from 'axios';
import { refreshAccessToken } from './refreshToken'; // импортируем функцию

const USERS_API_URL = process.env.REACT_APP_USERS_API_URL;

const userApi = axios.create({
    baseURL: USERS_API_URL,
    timeout: 10000,
});

// Добавляем токен к каждому запросу
userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Перехватчик ответов для обработки 401
userApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка 401 и это не повторный запрос на обновление
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Пытаемся обновить токен
                const newToken = await refreshAccessToken();

                // Обновляем заголовок исходного запроса
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Повторяем исходный запрос
                return userApi(originalRequest);
            } catch (refreshError) {
                // Если обновление не удалось, пробрасываем ошибку дальше
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getCurrentUser = async () => {
    try {
        const response = await userApi.get('/me');
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки текущего пользователя:', error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await userApi.get();
        // Если API возвращает массив напрямую
        if (Array.isArray(response.data)) {
            return response.data;
        }
        // Если данные обёрнуты в поле data
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        console.error('Неожиданный формат ответа API пользователей:', response.data);
        return [];
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await userApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка загрузки пользователя ${id}:`, error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await userApi.post('/', userData);
        return response.data;
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await userApi.put(`/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка обновления пользователя ${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        await userApi.delete(`/${id}`);
    } catch (error) {
        console.error(`Ошибка удаления пользователя ${id}:`, error);
        throw error;
    }
};

export const exportUsersToCsv = async () => {
    try {
        const response = await userApi.get('/report/csv', {
            responseType: 'blob', // важно для скачивания файла
        });
        return response.data; // возвращаем Blob
    } catch (error) {
        console.error('Ошибка экспорта пользователей в CSV:', error);
        throw error;
    }
};

export const updateCurrentUser = async (userData) => {
    try {
        const response = await userApi.put('/me', userData);
        return response.data;
    } catch (error) {
        console.error('Ошибка обновления текущего пользователя:', error);
        throw error;
    }
};

export default {
    getAll: getAllUsers,
    getById: getUserById,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
    getCurrentUser,
    exportToCsv: exportUsersToCsv,
    updateCurrentUser,
};