// src/pages/Admin/AdminSettings.jsx
import React, { useState } from 'react';
import '../../styles/prototype.css';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [settings, setSettings] = useState({
        system: {
            appName: 'Управление ИА',
            sessionTimeout: 30,
            autoBackup: true,
            backupFrequency: 'daily',
            maxFileSize: 10,
            enableAuditLog: true
        },
        notifications: {
            emailNotifications: true,
            assetUpdates: true,
            userActivities: true,
            securityAlerts: true,
            dailyReports: true,
            weeklySummary: true
        },
        export: {
            format: 'pdf',
            includeMetadata: true,
            includeCIA: true,
            watermark: false,
            compression: 'medium'
        }
    });

    const handleSave = (section) => {
        console.log('Сохранение настроек:', section, settings[section]);
        alert(`Настройки ${getSectionName(section)} сохранены!`);
    };

    const getSectionName = (section) => {
        const names = {
            system: 'системы',
            notifications: 'уведомлений',
            export: 'экспорта'
        };
        return names[section] || section;
    };

    return (
        <div className="admin-settings">
            <div className="content-header">
                <h1>Настройки системы</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => handleSave(activeTab)}>
                        💾 Сохранить изменения
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-body">
                        {/* Вкладки */}
                        <div className="settings-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
                                onClick={() => setActiveTab('system')}
                            >
                                ⚙️ Системные настройки
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                🔔 Уведомления
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
                                onClick={() => setActiveTab('export')}
                            >
                                📤 Экспорт
                            </button>
                        </div>

                        {/* Контент вкладок */}
                        <div className="settings-content mt-6">
                            {activeTab === 'system' && (
                                <div className="system-settings">
                                    <h3 className="mb-6">Системные параметры</h3>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Название системы</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={settings.system.appName}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    system: {...settings.system, appName: e.target.value}
                                                })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Таймаут сессии (минут)</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={settings.system.sessionTimeout}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    system: {...settings.system, sessionTimeout: parseInt(e.target.value)}
                                                })}
                                                min="5"
                                                max="240"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Автоматическое резервное копирование</label>
                                            <div className="switch-container">
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.system.autoBackup}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            system: {...settings.system, autoBackup: e.target.checked}
                                                        })}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                                <span className="switch-label">
                                                    {settings.system.autoBackup ? 'Включено' : 'Выключено'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Частота резервного копирования</label>
                                            <select
                                                className="input select"
                                                value={settings.system.backupFrequency}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    system: {...settings.system, backupFrequency: e.target.value}
                                                })}
                                            >
                                                <option value="daily">Ежедневно</option>
                                                <option value="weekly">Еженедельно</option>
                                                <option value="monthly">Ежемесячно</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Макс. размер файла (МБ)</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={settings.system.maxFileSize}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    system: {...settings.system, maxFileSize: parseInt(e.target.value)}
                                                })}
                                                min="1"
                                                max="100"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Вести журнал аудита</label>
                                            <div className="switch-container">
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.system.enableAuditLog}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            system: {...settings.system, enableAuditLog: e.target.checked}
                                                        })}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                                <span className="switch-label">
                                                    {settings.system.enableAuditLog ? 'Включен' : 'Выключен'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-actions mt-8">
                                        <button className="btn btn-secondary" onClick={() => handleSave('system')}>
                                            Сбросить к умолчаниям
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleSave('system')}>
                                            Сохранить системные настройки
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="notification-settings">
                                    <h3 className="mb-6">Настройка уведомлений</h3>
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
                                                    checked={settings.notifications.emailNotifications}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        notifications: {...settings.notifications, emailNotifications: e.target.checked}
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📝 Обновления активов</h4>
                                                <p>Уведомления об изменениях в реестре активов</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.assetUpdates}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        notifications: {...settings.notifications, assetUpdates: e.target.checked}
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>👥 Действия пользователей</h4>
                                                <p>Уведомления о действиях других пользователей</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.userActivities}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        notifications: {...settings.notifications, userActivities: e.target.checked}
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
                                                    checked={settings.notifications.securityAlerts}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        notifications: {...settings.notifications, securityAlerts: e.target.checked}
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📊 Ежедневные отчеты</h4>
                                                <p>Ежедневные сводки по системе</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.dailyReports}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        notifications: {...settings.notifications, dailyReports: e.target.checked}
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        <div className="notification-item">
                                            <div className="notification-info">
                                                <h4>📈 Еженедельные сводки</h4>
                                                <p>Еженедельные отчеты о деятельности</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.notifications.weeklySummary}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        notifications: {...settings.notifications, weeklySummary: e.target.checked}
                                                    })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-actions mt-8">
                                        <button className="btn btn-primary" onClick={() => handleSave('notifications')}>
                                            Сохранить настройки уведомлений
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'export' && (
                                <div className="export-settings">
                                    <h3 className="mb-6">Настройки экспорта</h3>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Формат экспорта по умолчанию</label>
                                            <select
                                                className="input select"
                                                value={settings.export.format}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    export: {...settings.export, format: e.target.value}
                                                })}
                                            >
                                                <option value="pdf">PDF</option>
                                                <option value="excel">Excel</option>
                                                <option value="csv">CSV</option>
                                                <option value="json">JSON</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Уровень сжатия</label>
                                            <select
                                                className="input select"
                                                value={settings.export.compression}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    export: {...settings.export, compression: e.target.value}
                                                })}
                                            >
                                                <option value="low">Низкий (быстро)</option>
                                                <option value="medium">Средний</option>
                                                <option value="high">Высокий (медленно)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="checkboxes mt-6">
                                        <div className="checkbox-item">
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.export.includeMetadata}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        export: {...settings.export, includeMetadata: e.target.checked}
                                                    })}
                                                />
                                                <span className="checkmark"></span>
                                                Включать метаданные
                                            </label>
                                        </div>

                                        <div className="checkbox-item">
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.export.includeCIA}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        export: {...settings.export, includeCIA: e.target.checked}
                                                    })}
                                                />
                                                <span className="checkmark"></span>
                                                Включать оценку CIA
                                            </label>
                                        </div>

                                        <div className="checkbox-item">
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.export.watermark}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        export: {...settings.export, watermark: e.target.checked}
                                                    })}
                                                />
                                                <span className="checkmark"></span>
                                                Добавлять водяной знак
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-actions mt-8">
                                        <button className="btn btn-primary" onClick={() => handleSave('export')}>
                                            Сохранить настройки экспорта
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

export default AdminSettings;