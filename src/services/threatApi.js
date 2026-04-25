import axios from 'axios';

const THREATS_API_URL = process.env.REACT_APP_THREATS_API_URL || 'http://localhost:8082/api/assets/threats';

const threatApi = axios.create({
    baseURL: THREATS_API_URL,
    timeout: 10000,
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

// Получить список угроз из справочника (с пагинацией и поиском)
export const getThreats = async (params = { page: 0, size: 500 }) => {
    try {
        const response = await threatApi.get('', { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки угроз:', error);
        throw error;
    }
};

// Алиас для удобства
export const getAll = getThreats;

// Получить одну угрозу по ID
export const getThreatById = async (id) => {
    try {
        const response = await threatApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка загрузки угрозы ${id}:`, error);
        throw error;
    }
};

// Запустить синхронизацию с ФСТЭК (админ)
export const syncThreats = async () => {
    try {
        const response = await threatApi.post('/sync');
        return response.data;
    } catch (error) {
        console.error('Ошибка синхронизации угроз:', error);
        throw error;
    }
};

// Новый метод для загрузки файла
export const uploadThreatsFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await threatApi.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки файла угроз:', error);
        throw error;
    }
};

// Алиас для sync
export const sync = syncThreats;

export default {
    getThreats,
    getAll,
    getThreatById,
    syncThreats,
    sync,
    uploadThreatsFile,
};