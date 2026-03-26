import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

const ASSETS_API_URL = process.env.REACT_APP_ASSETS_API_URL || 'http://localhost:8082/api/assets';

const assetApi = axios.create({
    baseURL: ASSETS_API_URL,
    timeout: 10000,
});

// Перехватчик запросов (добавление токена)
assetApi.interceptors.request.use(
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
assetApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return assetApi(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getAllAssets = async () => {
    try {
        const response = await assetApi.get();

        // Если API возвращает объект с полем data, содержащим массив
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        // Если возвращает сразу массив (как в вашем контроллере)
        if (Array.isArray(response.data)) {
            return response.data;
        }
        // Если есть _embedded (для Spring Data REST)
        if (response.data._embedded && Array.isArray(response.data._embedded.assets)) {
            return response.data._embedded.assets;
        }

        console.error('Неожиданный формат ответа API:', response.data);
        return [];
    } catch (error) {
        console.error('Ошибка загрузки активов:', error);
        throw error;
    }
};

export const getAssetById = async (id) => {
    try {
        const response = await assetApi.get(`/${id}`);
        return response.data;
    } catch (error) {

        if (error.response?.status === 404) {
            throw new Error('Актив не найден');
        }
        throw error;
    }
};

export const createAsset = async (assetData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${ASSETS_API_URL}`, assetData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка создания актива:', error);
        throw error;
    }
};

export const updateAsset = async (id, assetData) => {
    try {
        const response = await assetApi.put(`/${id}`, assetData);
        return response.data; // обновлённый объект
    } catch (error) {
        console.error(`Ошибка обновления актива ${id}:`, error);
        throw error;
    }
};

export const deleteAsset = async (id) => {
    try {
        await assetApi.delete(`/${id}`);
        // При 204 No Content ничего не возвращаем
    } catch (error) {
        console.error(`Ошибка удаления актива ${id}:`, error);
        throw error;
    }
};

// Если есть отдельный эндпоинт для получения активов текущего пользователя
export const getMyAssets = async () => {
    try {
        // Предположим, что есть /api/assets/my
        const response = await assetApi.get('/my');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error('Ошибка загрузки моих активов:', error);
        throw error;
    }
};

export const getAssetGroups = async () => {
    try {
        const response = await assetApi.get('/groups');
        return response.data; // массив { id, name, code, description }
    } catch (error) {
        console.error('Ошибка загрузки групп активов:', error);
        return [];
    }
};

export default {
    getAll: getAllAssets,
    getById: getAssetById,
    create: createAsset,
    update: updateAsset,
    delete: deleteAsset,
    getMyAssets,
    getAssetGroups,
};