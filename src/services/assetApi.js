import axios from 'axios';

const ASSETS_API_URL = process.env.REACT_APP_ASSETS_API_URL || 'http://localhost:8082/api/assets';

const assetApi = axios.create({
    baseURL: ASSETS_API_URL,
    timeout: 10000,
});

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

// Получить все активы
export const getAllAssets = async (filters = {}) => {
    try {
        const response = await assetApi.get('', { params: filters });
        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.data)) return response.data.data;
        return [];
    } catch (error) {
        console.error('Ошибка загрузки активов:', error);
        throw error;
    }
};

// Получить актив по ID
export const getAssetById = async (id) => {
    try {
        const response = await assetApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка загрузки актива ${id}:`, error);
        throw error;
    }
};

// Создать актив
export const createAsset = async (assetData) => {
    try {
        const response = await assetApi.post('', assetData);
        return response.data;
    } catch (error) {
        console.error('Ошибка создания актива:', error.response?.data || error);
        throw error;
    }
};

// Обновить актив
export const updateAsset = async (id, assetData) => {
    try {
        const response = await assetApi.put(`/${id}`, assetData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка обновления актива ${id}:`, error.response?.data || error);
        throw error;
    }
};

// Удалить актив
export const deleteAsset = async (id) => {
    try {
        await assetApi.delete(`/${id}`);
    } catch (error) {
        console.error(`Ошибка удаления актива ${id}:`, error);
        throw error;
    }
};

// Получить активы текущего пользователя
export const getMyAssets = async () => {
    try {
        const response = await assetApi.get('/my');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Ошибка загрузки моих активов:', error);
        return [];
    }
};

// Получить список групп активов
export const getAssetGroups = async () => {
    try {
        const response = await assetApi.get('/groups');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Ошибка загрузки групп:', error);
        return [];
    }
};

// === Управление угрозами актива ===

export const getAssetThreats = async (assetId) => {
    try {
        const response = await assetApi.get(`/${assetId}/threats`);
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки угроз актива:', error);
        return [];
    }
};

export const addAssetThreat = async (assetId, threatData) => {
    try {
        const response = await assetApi.post(`/${assetId}/threats`, threatData);
        return response.data;
    } catch (error) {
        console.error('Ошибка добавления угрозы:', error);
        throw error;
    }
};

export const removeAssetThreat = async (assetId, threatId) => {
    try {
        await assetApi.delete(`/${assetId}/threats/${threatId}`);
    } catch (error) {
        console.error('Ошибка удаления угрозы:', error);
        throw error;
    }
};

export const getLatestRisk = async (assetId) => {
    try {
        const response = await assetApi.get(`/${assetId}/risk/latest`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        console.error('Ошибка загрузки риска:', error);
        return null;
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
    getAssetThreats,
    addAssetThreat,
    removeAssetThreat,
    getLatestRisk,
};