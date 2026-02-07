// src/utils/jwtUtils.js - УТИЛИТЫ ДЛЯ РАБОТЫ С JWT
export const decodeJWT = (token) => {
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

export const isTokenExpired = (token) => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
};

export const getTokenExpiry = (token) => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
};

export const getUserFromToken = (token, fallbackUsername = 'user') => {
    const decoded = decodeJWT(token);
    if (!decoded) {
        return {
            username: fallbackUsername,
            fullName: fallbackUsername === 'admin'
                ? 'Администратор Системы'
                : 'Пользователь Системы',
            email: `${fallbackUsername}@company.com`,
            role: fallbackUsername === 'admin' ? 'admin' : 'user'
        };
    }

    const username = decoded.preferred_username || decoded.sub || fallbackUsername;
    const email = decoded.email || `${username}@company.com`;
    const fullName = decoded.name ||
        `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim() ||
        (username === 'admin' ? 'Администратор Системы' : 'Пользователь Системы');

    let role = 'user';
    if (username === 'admin' || decoded.realm_access?.roles?.includes('admin')) {
        role = 'admin';
    }

    return {
        username,
        fullName,
        email,
        role,
        decodedToken: decoded // сохраняем полный декодированный токен для отладки
    };
};