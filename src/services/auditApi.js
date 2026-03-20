import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

const AUDIT_API_URL = process.env.REACT_APP_AUDIT_API_URL || 'http://localhost:8082/api/audit';

const auditApi = axios.create({
    baseURL: AUDIT_API_URL,
    timeout: 10000,
});

// Перехватчик запросов (добавление токена)
auditApi.interceptors.request.use(
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
auditApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return auditApi(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Получение списка записей аудита с фильтрацией и пагинацией
export const getAuditLogs = async (params = {}) => {
    try {
        const response = await auditApi.get('', {params});
        // Ожидаем, что API возвращает Page с полями content, totalElements и т.д.
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки журнала аудита:', error);
        throw error;
    }
};

// Получение статистики
export const getAuditStats = async (params = {}) => {
    try {
        const response = await auditApi.get('/stats', { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки статистики аудита:', error);
        throw error;
    }
};

// Экспорт в CSV (возвращает текстовый/бинарный ответ)
export const exportAuditLogs = async (params = {}) => {
    try {
        const response = await auditApi.get('/export', {
            params,
            responseType: 'blob', // важно для скачивания файла
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка экспорта аудита:', error);
        throw error;
    }
};

// Для теста: создание записи аудита (если нужно)
export const createAuditLog = async (data) => {
    try {
        const response = await auditApi.post('/', data);
        return response.data;
    } catch (error) {
        console.error('Ошибка создания записи аудита:', error);
        throw error;
    }
};

export default {
    getLogs: getAuditLogs,
    getStats: getAuditStats,
    export: exportAuditLogs,
    create: createAuditLog,
};