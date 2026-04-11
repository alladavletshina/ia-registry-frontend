import React, { useState } from 'react';
import userApi from '../../services/userApi';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const validatePassword = (password) => {
        if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
        if (!/[0-9]/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
        if (!/[a-z]/.test(password)) return 'Пароль должен содержать хотя бы одну строчную букву';
        if (!/[A-Z]/.test(password)) return 'Пароль должен содержать хотя бы одну заглавную букву';
        if (!/[@#$%^&+=!]/.test(password)) return 'Пароль должен содержать хотя бы один спецсимвол (@ # $ % ^ & + = !)';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!oldPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Заполните все поля' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Новый пароль и подтверждение не совпадают' });
            return;
        }
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setMessage({ type: 'error', text: passwordError });
            return;
        }

        setLoading(true);
        try {
            await userApi.changePassword(oldPassword, newPassword);
            setMessage({ type: 'success', text: 'Пароль успешно изменён!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Ошибка при смене пароля';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password">
            <h3>Смена пароля</h3>
            <form onSubmit={handleSubmit} className="password-form">
                <div className="form-group">
                    <label>Текущий пароль</label>
                    <input
                        type="password"
                        className="input"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Новый пароль</label>
                    <input
                        type="password"
                        className="input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                    <div className="password-requirements">
                        <small>Пароль должен содержать:</small>
                        <ul>
                            <li className={newPassword.length >= 8 ? 'valid' : ''}>✓ минимум 8 символов</li>
                            <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>✓ хотя бы одну цифру</li>
                            <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>✓ хотя бы одну строчную букву</li>
                            <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>✓ хотя бы одну заглавную букву</li>
                            <li className={/[@#$%^&+=!]/.test(newPassword) ? 'valid' : ''}>✓ хотя бы один спецсимвол (@ # $ % ^ & + = !)</li>
                        </ul>
                    </div>
                </div>
                <div className="form-group">
                    <label>Подтверждение нового пароля</label>
                    <input
                        type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                        <small className="error-text">Пароли не совпадают</small>
                    )}
                </div>
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Смена...' : 'Сменить пароль'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;