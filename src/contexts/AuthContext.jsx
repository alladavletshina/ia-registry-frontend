import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Конфигурация Keycloak
const KEYCLOAK_URL = process.env.REACT_APP_KEYCLOAK_URL;
const REALM = process.env.REACT_APP_KEYCLOAK_REALM;
const CLIENT_ID = process.env.REACT_APP_KEYCLOAK_CLIENT_ID;
const API_URL = process.env.REACT_APP_API_URL;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.warn('Invalid stored user data');
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = async ({ username, password }) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', CLIENT_ID);
            params.append('username', username);
            params.append('password', password);

            const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Auth failed: ${response.status} ${errorData}`);
            }

            const data = await response.json();
            const { access_token, refresh_token } = data;

            // Декодируем токен, чтобы получить информацию о пользователе
            const decoded = jwtDecode(access_token);

            // Извлечение ролей (зависит от настроек Keycloak)
            const realmAccess = decoded.realm_access || {};
            const roles = realmAccess.roles || [];
            // Определяем роль: если есть 'admin' — админ, иначе обычный пользователь
            const role = roles.includes('admin') ? 'admin' : 'user';

            const userData = {
                username: decoded.preferred_username || username,
                email: decoded.email || `${username}@example.com`,
                fullName: decoded.name || (roles.includes('admin') ? 'Administrator' : 'User'),
                role,
                token: access_token,
                refreshToken: refresh_token
            };

            localStorage.setItem('token', access_token);
            if (refresh_token) localStorage.setItem('refreshToken', refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            navigate(`/${role}/dashboard`);
            return { success: true, user: userData };

        } catch (error) {
            console.error('❌ Keycloak login failed:', error);
            let errorMessage = 'Ошибка авторизации';

            if (error.message.includes('401')) {
                errorMessage = 'Неверный логин или пароль';
            } else if (error.message.includes('Network Error')) {
                errorMessage = 'Сервер Keycloak недоступен';
            } else {
                errorMessage = error.message;
            }

            alert(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || data.errors?.[0] || 'Ошибка регистрации'
                };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Register error:', err);
            return { success: false, error: 'Ошибка соединения с сервером' };
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};