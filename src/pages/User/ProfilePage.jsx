import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: 'user@company.com',
        department: 'Отдел продаж',
        phone: '+7 (999) 123-45-67',
        position: 'Специалист'
    });

    const handleSave = () => {
        // Здесь будет вызов API для сохранения
        alert('Изменения сохранены!');
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
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
                <h3>Личная информация</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>ФИО</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Подразделение</label>
                        <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-group">
                        <label>Должность</label>
                        <input
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Телефон</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-actions">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)}>
                                Отмена
                            </button>
                            <button onClick={handleSave} className="primary">
                                Сохранить
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="primary">
                            Редактировать профиль
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;