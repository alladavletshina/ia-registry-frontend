import React, { useState } from 'react';
import userApi from '../../services/userApi';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Пароль должен содержать минимум 6 символов' });
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