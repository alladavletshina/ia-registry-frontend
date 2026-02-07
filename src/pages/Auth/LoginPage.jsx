// LoginPage.jsx - для РЕАЛЬНОЙ авторизации
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация
        if (!username.trim() || !password.trim()) {
            setError('Введите логин и пароль');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login({ username, password });

            if (!result.success) {
                setError(result.error || 'Ошибка авторизации');
            }
        } catch (err) {
            console.error('Login catch error:', err);
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    const handleTestLogin = (testUsername) => {
        setUsername(testUsername);
        setPassword(testUsername === 'admin' ? 'admin123' : 'user123');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Система управления информационными активами</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Логин</label>
                        <input
                            type="text"
                            placeholder="Введите логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Пароль</label>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <strong>Ошибка:</strong> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Авторизация...
                            </>
                        ) : 'Войти'}
                    </button>
                </form>

                <div style={styles.testButtons}>
                    <p style={styles.testTitle}>Тестовые учетные данные:</p>
                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={() => handleTestLogin('admin')}
                            style={styles.testButton}
                            disabled={loading}
                        >
                            <strong>Admin</strong>
                            <span style={styles.testPassword}>admin123</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTestLogin('user')}
                            style={{...styles.testButton, background: '#3498db'}}
                            disabled={loading}
                        >
                            <strong>User</strong>
                            <span style={styles.testPassword}>user123</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.15)'
    },
    title: {
        textAlign: 'center',
        marginBottom: '8px',
        color: '#2c3e50',
        fontSize: '28px',
        fontWeight: '600'
    },
    subtitle: {
        textAlign: 'center',
        color: '#7f8c8d',
        marginBottom: '30px',
        fontSize: '16px'
    },
    backendInfo: {
        background: '#f8f9fa',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '25px',
        border: '1px solid #e9ecef',
        fontSize: '13px',
        color: '#495057'
    },
    form: {
        marginBottom: '25px'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#2c3e50',
        fontSize: '14px',
        fontWeight: '500'
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s',
        backgroundColor: '#fdfdfd'
    },
    error: {
        background: '#fee',
        color: '#c33',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #fcc',
        fontSize: '14px'
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s'
    },
    spinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    testButtons: {
        marginTop: '25px',
        textAlign: 'center'
    },
    testTitle: {
        color: '#7f8c8d',
        marginBottom: '12px',
        fontSize: '14px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px'
    },
    testButton: {
        flex: 1,
        padding: '14px',
        background: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'opacity 0.3s'
    },
    testPassword: {
        fontSize: '11px',
        opacity: 0.9,
        fontFamily: 'monospace'
    }
};

// Добавь в глобальные стили или в компонент
const globalStyles = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed !important;
    }
`;

// Добавляем глобальные стили
const styleSheet = document.createElement("style");
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

export default LoginPage;