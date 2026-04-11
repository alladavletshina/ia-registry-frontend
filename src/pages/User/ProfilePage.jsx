import React, { useState, useEffect } from 'react';
import userApi from '../../services/userApi';
import ChangePassword from '../../components/user/ChangePassword';
import '../../styles/prototype.css';

const ProfilePage = () => {
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

                            {activeTab === 'security' && (
                                <div className="security-tab">
                                    <ChangePassword />
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