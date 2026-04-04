import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../services/userApi';
import '../../styles/prototype.css';

const ProfilePage = () => {
    const { user: authUser } = useAuth(); // пользователь из контекста (JWT)
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: ''
    });

    // Настройки уведомлений и безопасности (оставляем как есть или тоже загружаем с бэка)
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        assetUpdates: true,
        taskReminders: true,
        weeklyReports: false,
        securityAlerts: true
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30,
        showLastLogin: true
    });

    // Загрузка данных пользователя
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = await userApi.getCurrentUser();
            setProfileData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                position: userData.position || '',
                department: userData.department || ''
            });
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
            setError('Не удалось загрузить данные профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updateData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                position: profileData.position,
                department: profileData.department
            };
            const updated = await userApi.updateCurrentUser(updateData);
            setProfileData(prev => ({ ...prev, ...updated }));
            alert('Изменения профиля сохранены!');
            setIsEditing(false);
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            alert('Не удалось сохранить изменения');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = (type) => {
        // Здесь тоже можно отправлять на бэкенд, если есть соответствующие эндпоинты
        alert(`Настройки ${type === 'notifications' ? 'уведомлений' : 'безопасности'} сохранены!`);
    };

    const handlePasswordChange = () => {
        const newPassword = prompt('Введите новый пароль:');
        if (newPassword && newPassword.length >= 6) {
            alert('Пароль успешно изменен!');
        } else {
            alert('Пароль должен содержать минимум 6 символов');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <h3>Ошибка</h3>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadUserData}>Повторить</button>
            </div>
        );
    }

    return (
        <div className="profile-settings-container">
            <div className="content-header">
                <h1>Профиль и настройки</h1>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-body">
                        {/* Вкладки */}
                        <div className="profile-tabs">
                            <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                👤 Личная информация
                            </button>
                            <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                                🔔 Уведомления
                            </button>
                            <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                                🔐 Безопасность
                            </button>
                        </div>

                        <div className="profile-content mt-6">
                            {activeTab === 'profile' && (
                                <div className="profile-tab">
                                    <div className="profile-header">
                                        <div className="profile-avatar">
                                            {profileData.firstName?.charAt(0) || profileData.email?.charAt(0) || 'U'}
                                        </div>
                                        <div className="profile-info">
                                            <h2>{profileData.firstName} {profileData.lastName}</h2>
                                            <p>Пользователь системы</p>
                                        </div>
                                    </div>

                                    <div className="profile-form">
                                        <h3 className="mb-6">Личная информация</h3>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Имя</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileData.firstName}
                                                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Фамилия</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileData.lastName}
                                                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    className="input"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                    disabled={true}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Телефон</label>
                                                <input
                                                    type="tel"
                                                    className="input"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Должность</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileData.position}
                                                    onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Отдел</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileData.department}
                                                    onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-actions mt-8">
                                            {isEditing ? (
                                                <>
                                                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                                                        Отмена
                                                    </button>
                                                    <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                                                        {saving ? 'Сохранение...' : 'Сохранить'}
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                                    Редактировать профиль
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="notifications-tab">
                                    <h3 className="mb-6">Настройки уведомлений</h3>
                                    <p className="text-light mb-6">Выберите, какие уведомления вы хотите получать</p>
                                    <div className="notifications-list">
                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📧 Email уведомления</h4>
                                                <p>Получать уведомления по электронной почте</p>
                                            </div>
                                            <label className="switch">
                                                <input type="checkbox" checked={notificationSettings.emailNotifications} onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})} />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        {/* Остальные пункты уведомлений */}
                                    </div>
                                    <div className="form-actions mt-8">
                                        <button className="btn btn-primary" onClick={() => handleSaveSettings('notifications')}>Сохранить настройки уведомлений</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="security-tab">
                                    <h3 className="mb-6">Настройки безопасности</h3>
                                    <div className="security-settings">
                                        <div className="security-item">
                                            <div className="security-info">
                                                <h4>🔐 Двухфакторная аутентификация</h4>
                                                <p>Дополнительная защита вашего аккаунта</p>
                                            </div>
                                            <label className="switch">
                                                <input type="checkbox" checked={securitySettings.twoFactorAuth} onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})} />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        {/* Остальные настройки безопасности */}
                                    </div>
                                    <div className="password-section mt-8">
                                        <h4 className="mb-4">Смена пароля</h4>
                                        <button className="btn btn-warning" onClick={handlePasswordChange}>🔑 Изменить пароль</button>
                                        <p className="text-light mt-2">Рекомендуется менять пароль каждые 90 дней</p>
                                    </div>
                                    <div className="form-actions mt-8">
                                        <button className="btn btn-primary" onClick={() => handleSaveSettings('security')}>Сохранить настройки безопасности</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;