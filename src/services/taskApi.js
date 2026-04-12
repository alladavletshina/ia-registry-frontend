import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

const TASKS_API_URL = process.env.REACT_APP_TASKS_API_URL;

const taskApi = axios.create({
    baseURL: TASKS_API_URL,
    timeout: 10000,
});

// Перехватчик запросов (добавление токена)
taskApi.interceptors.request.use(
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
taskApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return taskApi(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getAllTasks = async (params = {}) => {
    try {
        // Логируем параметры перед отправкой
        console.log('Отправляемые параметры:', params);

        const response = await taskApi.get('', {params});

        // Предполагаем, что бэкенд возвращает Page с полем content (массив задач)
        if (response.data && Array.isArray(response.data.content)) {
            return response.data.content;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }

        // Логируем неожиданный формат ответа
        console.error('Неожиданный формат ответа API задач:', response.data);
        return [];
    } catch (error) {
        // Подробная обработка ошибки
        if (error.response) {
            console.error('Ошибка сервера:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Нет ответа от сервера:', error.request);
        } else {
            console.error('Ошибка конфигурации запроса:', error.message);
        }
        throw error;
    }
};

export const getTaskById = async (id) => {
    try {
        const response = await taskApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка загрузки задачи ${id}:`, error);
        throw error;
    }
};

export const createTask = async (taskData) => {
    try {
        const response = await taskApi.post('', taskData);
        return response.data;
    } catch (error) {
        console.error('Ошибка создания задачи:', error);
        throw error;
    }
};

export const updateTask = async (id, taskData) => {
    try {
        const response = await taskApi.patch(`/${id}`, taskData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка обновления задачи ${id}:`, error);
        throw error;
    }
};

export const patchTask = async (id, patchData) => {
    try {
        const response = await taskApi.patch(`/${id}`, patchData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка частичного обновления задачи ${id}:`, error);
        throw error;
    }
};

export const deleteTask = async (id) => {
    try {
        await taskApi.delete(`/${id}`);
    } catch (error) {
        console.error(`Ошибка удаления задачи ${id}:`, error);
        throw error;
    }
};

export const getTaskStats = async () => {
    try {
        const response = await taskApi.get('/stats');
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки статистики задач:', error);
        throw error;
    }
};

/**
 * Обновить поля задачи (статус, срок и др.) через универсальный эндпоинт
 * @param {number} id - ID задачи
 * @param {object} fields - объект с полями для обновления (например, { dueDate: '2026-05-01' })
 */
export const updateTaskFields = async (id, fields) => {
    try {
        const response = await taskApi.patch(`/${id}/update`, fields);
        return response.data;
    } catch (error) {
        console.error(`Ошибка обновления задачи ${id}:`, error);
        throw error;
    }
};

export const getStatsByUser = (userId) => {
    return taskApi.get('/stats/by-user', { params: { userId } }).then(res => res.data);
};

const taskApiObject = {
    getAll: getAllTasks,
    getById: getTaskById,
    create: createTask,
    update: updateTask,
    patch: patchTask,
    delete: deleteTask,
    getStats: getTaskStats,
    updateTaskFields,
    getStatsByUser,
};

export default taskApiObject;