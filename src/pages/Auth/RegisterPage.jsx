// RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        position: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const result = await register(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Регистрация</h1>

                {success && (
                    <div style={styles.success}>
                        Регистрация прошла успешно! Сейчас вы будете перенаправлены на страницу входа.
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            required
                            disabled={loading || success}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Пароль *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                            disabled={loading || success}
                            minLength="6"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Имя *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                style={styles.input}
                                required
                                disabled={loading || success}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Фамилия *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                style={styles.input}
                                required
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Телефон</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={styles.input}
                            disabled={loading || success}
                            placeholder="+79991234567"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Должность</label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                style={styles.input}
                                disabled={loading || success}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Отдел</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                style={styles.input}
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        style={{...styles.button, opacity: loading || success ? 0.7 : 1}}
                        disabled={loading || success}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div style={styles.loginLink}>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
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
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '20px'
    },
    card: {
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border)'
    },
    title: {
        textAlign: 'center',
        marginBottom: '32px',
        color: 'var(--text-dark)',
        fontSize: '28px',
        fontWeight: '700'
    },
    form: {
        marginBottom: '20px'
    },
    inputGroup: {
        marginBottom: '16px',
        flex: 1
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: 'var(--text-dark)',
        fontSize: '14px',
        fontWeight: '500'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '15px',
        backgroundColor: 'var(--bg-light)'
    },
    row: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    error: {
        background: 'var(--danger-100)',
        color: 'var(--danger-500)',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px'
    },
    success: {
        background: '#d4edda',
        color: '#155724',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '20px'
    },
    button: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '10px',
        cursor: 'pointer'
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
        color: 'var(--text-light)'
    }
};

export default RegisterPage;