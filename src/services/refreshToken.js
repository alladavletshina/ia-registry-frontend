// src/services/refreshToken.js
import axios from 'axios';

const KEYCLOAK_URL = process.env.REACT_APP_KEYCLOAK_URL;
const REALM = process.env.REACT_APP_KEYCLOAK_REALM;
const CLIENT_ID = process.env.REACT_APP_KEYCLOAK_CLIENT_ID;

/**
 * Обновляет access token с помощью refresh token
 * @returns {Promise<string>} новый access token
 */
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);
        params.append('client_id', CLIENT_ID);

        const response = await axios.post(
            `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, refresh_token } = response.data;

        // Сохраняем новые токены
        localStorage.setItem('token', access_token);
        if (refresh_token) {
            localStorage.setItem('refreshToken', refresh_token);
        }

        return access_token;
    } catch (error) {
        console.error('Failed to refresh token', error);
        // Если не удалось обновить, очищаем хранилище и перенаправляем на логин
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw error;
    }
};