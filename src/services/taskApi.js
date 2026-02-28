import axios from 'axios';

const TASKS_API_URL = process.env.REACT_APP_TASKS_API_URL;

const taskApi = axios.create({
    baseURL: TASKS_API_URL,
    timeout: 10000,
});

// Добавляем токен к каждому запросу
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

export default {
    getAll: getAllTasks,
    getById: getTaskById,
    create: createTask,
    update: updateTask,
    patch: patchTask,
    delete: deleteTask,
    getStats: getTaskStats,
};