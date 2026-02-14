
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext();
const API_URL = 'http://localhost:8082/api';

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

    const login = async (credentials) => {
        setLoading(true);
        try {
            console.log('🔐 Attempting REAL backend auth...');
            const response = await apiLogin(credentials);
            const { accessToken, refreshToken } = response.data;

            if (!accessToken) {
                throw new Error('No access token received');
            }

            localStorage.setItem('token', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            const userData = {
                username: credentials.username,
                role: credentials.username === 'admin' ? 'admin' : 'user',
                fullName: credentials.username === 'admin' ? 'Administrator' : 'User',
                email: `${credentials.username}@example.com`
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            navigate(`/${userData.role}/dashboard`);
            return { success: true, user: userData };

        } catch (error) {
            console.error('❌ Backend auth failed:', error);
            let errorMessage = 'Ошибка авторизации';

            if (error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    errorMessage = 'Неверный логин или пароль';
                } else if (status === 404) {
                    errorMessage = 'Сервер авторизации не найден';
                } else if (status === 500) {
                    errorMessage = 'Внутренняя ошибка сервера';
                } else if (data?.message) {
                    errorMessage = data.message;
                }
            } else if (error.message.includes('Network Error')) {
                errorMessage = 'Сервер недоступен. Проверьте что бэкенд запущен на localhost:8083';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Таймаут подключения к серверу';
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