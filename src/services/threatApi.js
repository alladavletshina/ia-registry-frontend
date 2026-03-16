import axios from 'axios';

const THREATS_API_URL = process.env.REACT_APP_THREATS_API_URL;

const threatApi = axios.create({
    baseURL: THREATS_API_URL,
    timeout: 80000,
});

// Добавляем токен к каждому запросу
threatApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Получить список угроз с пагинацией и поиском
 * @param {Object} params - параметры: page, size, search (опционально)
 */
export const getThreats = async (params = {}) => {
    try {
        const response = await threatApi.get('', { params });
        // Бэкенд возвращает Page<ThreatDto>, содержащую content
        if (response.data && Array.isArray(response.data.content)) {
            return response.data;
        }
        console.error('Неожиданный формат ответа API угроз:', response.data);
        return { content: [], totalElements: 0 };
    } catch (error) {
        console.error('Ошибка загрузки угроз:', error);
        throw error;
    }
};

/**
 * Получить угрозу по ID
 * @param {string} id - идентификатор угрозы (например, "1")
 */
export const getThreatById = async (id) => {
    try {
        const response = await threatApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка загрузки угрозы ${id}:`, error);
        throw error;
    }
};

/**
 * Запустить синхронизацию с БДУ ФСТЭК вручную
 */
export const syncThreats = async () => {
    try {
        const response = await threatApi.post('/sync');
        return response.data;
    } catch (error) {
        console.error('Ошибка синхронизации угроз:', error);
        throw error;
    }
};

export default {
    getAll: getThreats,
    getById: getThreatById,
    sync: syncThreats,
};