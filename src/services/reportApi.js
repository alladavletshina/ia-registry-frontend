import axios from 'axios';

const REPORT_API_URL = process.env.REACT_APP_REPORT_API_URL || '/api/reports';

const reportApi = axios.create({
    baseURL: REPORT_API_URL,
    timeout: 10000,
});

reportApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getOverviewReport = (period = 'month') => {
    return reportApi.get('/overview', { params: { period } }).then(res => res.data);
};

export const getAssetsReport = (period = 'month') => {
    return reportApi.get('/assets', { params: { period } }).then(res => res.data);
};

export const getUsersReport = (period = 'month') => {
    return reportApi.get('/users', { params: { period } }).then(res => res.data);
};

export const getSecurityReport = (period = 'month') => {
    return reportApi.get('/security', { params: { period } }).then(res => res.data);
};

export const getPerformanceReport = (period = 'month') => {
    return reportApi.get('/performance', { params: { period } }).then(res => res.data);
};

export default {
    getOverviewReport,
    getAssetsReport,
    getUsersReport,
    getSecurityReport,
    getPerformanceReport,
};