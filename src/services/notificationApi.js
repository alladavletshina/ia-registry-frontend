import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

const NOTIFICATION_API_URL = process.env.REACT_APP_NOTIFICATION_API_URL;

const notificationApi = axios.create({
    baseURL: NOTIFICATION_API_URL,
    timeout: 10000,
});

// Перехватчик запросов (добавление токена)
notificationApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Перехватчик ответов (обработка 401 и обновление токена)
notificationApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return notificationApi(originalRequest);
            } catch (refreshError) {
                // Если не удалось обновить токен, очищаем хранилище и перенаправляем на логин
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const getMyNotifications = (params = { page: 0, size: 20 }) => {
    return notificationApi.get('', { params }).then(res => res.data);
};

export const getUnreadCount = () => {
    return notificationApi.get('/unread-count').then(res => res.data);
};

export const markAsRead = (id) => {
    return notificationApi.patch(`/read/${id}`).then(res => res.data);
};

export const markAllAsRead = () => {
    return notificationApi.patch('/read-all').then(res => res.data);
};

export const deleteNotification = (id) => {
    return notificationApi.delete(`/${id}`);
};

// Для администратора – все уведомления (только непрочитанные по умолчанию)
export const getAllNotifications = (params = { page: 0, size: 20 }) => {
    return notificationApi.get('/admin/all', { params }).then(res => res.data);
};

export default {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getAllNotifications,
};