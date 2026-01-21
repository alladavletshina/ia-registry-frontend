// src/pages/User/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    // Данные профиля
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        email: 'user@company.com',
        department: 'Отдел продаж',
        phone: '+7 (999) 123-45-67',
        position: 'Специалист'
    });

    // Настройки уведомлений
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        assetUpdates: true,
        taskReminders: true,
        weeklyReports: false,
        securityAlerts: true
    });

    // Настройки безопасности
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30,
        showLastLogin: true
    });

    const handleSaveProfile = () => {
        // Здесь будет вызов API для сохранения
        alert('Изменения профиля сохранены!');
        setIsEditing(false);
    };

    const handleSaveSettings = (type) => {
        const message = type === 'notifications' ? 'Настройки уведомлений сохранены!' : 'Настройки безопасности сохранены!';
        alert(message);
    };

    const handlePasswordChange = () => {
        const newPassword = prompt('Введите новый пароль:');
        if (newPassword && newPassword.length >= 6) {
            alert('Пароль успешно изменен!');
        } else {
            alert('Пароль должен содержать минимум 6 символов');
        }
    };

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
                            <button
                                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Личная информация
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                🔔 Уведомления
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                🔐 Безопасность
                            </button>
                        </div>

                        {/* Контент вкладок */}
                        <div className="profile-content mt-6">
                            {activeTab === 'profile' && (
                                <div className="profile-tab">
                                    <div className="profile-header">
                                        <div className="profile-avatar">
                                            {user?.fullName?.charAt(0)}
                                        </div>
                                        <div className="profile-info">
                                            <h2>{user?.fullName}</h2>
                                            <p>Пользователь системы</p>
                                        </div>
                                    </div>

                                    <div className="profile-form">
                                        <h3 className="mb-6">Личная информация</h3>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>ФИО</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileData.fullName}
                                                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    className="input"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Подразделение</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={profileData.department}
                                                    onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                                                    disabled={!isEditing}
                                                />
                                            </div>
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

                                        <div className="form-actions mt-8">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => setIsEditing(false)}
                                                    >
                                                        Отмена
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleSaveProfile}
                                                    >
                                                        Сохранить
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => setIsEditing(true)}
                                                >
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
                                    <p className="text-light mb-6">
                                        Выберите, какие уведомления вы хотите получать
                                    </p>

                                    <div className="notifications-list">
                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📧 Email уведомления</h4>
                                                <p>Получать уведомления по электронной почте</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.emailNotifications}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        emailNotifications: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📝 Обновления активов</h4>
                                                <p>Уведомления об изменениях ваших активов</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.assetUpdates}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        assetUpdates: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>⏰ Напоминания о задачах</h4>
                                                <p>Уведомления о предстоящих задачах</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.taskReminders}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        taskReminders: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📊 Еженедельные отчеты</h4>
                                                <p>Еженедельные сводки по вашей деятельности</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.weeklyReports}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        weeklyReports: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>🔐 Оповещения безопасности</h4>
                                                <p>Критические оповещения о безопасности</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.securityAlerts}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        securityAlerts: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-actions mt-8">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleSaveSettings('notifications')}
                                        >
                                            Сохранить настройки уведомлений
                                        </button>
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
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.twoFactorAuth}
                                                    onChange={(e) => setSecuritySettings({
                                                        ...securitySettings,
                                                        twoFactorAuth: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="security-item">
                                            <div className="security-info">
                                                <h4>⏱️ Таймаут сессии</h4>
                                                <p>Время неактивности до автоматического выхода (минут)</p>
                                            </div>
                                            <select
                                                className="input select"
                                                value={securitySettings.sessionTimeout}
                                                onChange={(e) => setSecuritySettings({
                                                    ...securitySettings,
                                                    sessionTimeout: parseInt(e.target.value)
                                                })}
                                            >
                                                <option value="15">15 минут</option>
                                                <option value="30">30 минут</option>
                                                <option value="60">1 час</option>
                                                <option value="120">2 часа</option>
                                            </select>
                                        </div>

                                        <div className="security-item">
                                            <div className="security-info">
                                                <h4>👁️ Последний вход</h4>
                                                <p>Показывать информацию о последнем входе</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.showLastLogin}
                                                    onChange={(e) => setSecuritySettings({
                                                        ...securitySettings,
                                                        showLastLogin: e.target.checked
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="password-section mt-8">
                                        <h4 className="mb-4">Смена пароля</h4>
                                        <button
                                            className="btn btn-warning"
                                            onClick={handlePasswordChange}
                                        >
                                            🔑 Изменить пароль
                                        </button>
                                        <p className="text-light mt-2">
                                            Рекомендуется менять пароль каждые 90 дней
                                        </p>
                                    </div>

                                    <div className="form-actions mt-8">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleSaveSettings('security')}
                                        >
                                            Сохранить настройки безопасности
                                        </button>
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