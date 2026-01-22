// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/prototype.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!credentials.login.trim() || !credentials.password.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);
        try {
            await login(credentials);
        } catch (error) {
            // Ошибка обрабатывается в AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h1>Система управления информационными активами</h1>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Введите логин"
                        value={credentials.login}
                        onChange={(e) => setCredentials({...credentials, login: e.target.value})}
                        className="input"
                        disabled={isLoading}
                        required
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="password"
                        placeholder="Введите пароль"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        className="input"
                        disabled={isLoading}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Вход...' : 'Войти в систему'}
                </button>

                <div className="demo-credentials mt-8">
                    <p>Демонстрационный доступ:</p>
                    <p><strong>Администратор:</strong> admin / admin123</p>
                    <p><strong>Пользователь:</strong> user / user123</p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;