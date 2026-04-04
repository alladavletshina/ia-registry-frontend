import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userApi from '../../services/userApi';
import { ArrowBack, Edit, Block, CheckCircle } from '@mui/icons-material';
import '../../styles/prototype.css';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUser();
    }, [id]);

    const loadUser = async () => {
        setLoading(true);
        try {
            const data = await userApi.getById(id);
            setUser(data);
        } catch (err) {
            console.error('Ошибка загрузки пользователя:', err);
            setError('Не удалось загрузить данные пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        const newStatus = !user.active;
        try {
            await userApi.update(user.id, { active: newStatus });
            setUser({ ...user, active: newStatus });
        } catch (err) {
            console.error('Ошибка изменения статуса:', err);
            alert('Не удалось изменить статус');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка данных пользователя...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="empty-state">
                <h3>Ошибка</h3>
                <p>{error || 'Пользователь не найден'}</p>
                <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
                    Вернуться к списку
                </button>
            </div>
        );
    }

    return (
        <div className="user-detail">
            <div className="content-header">
                <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
                    <ArrowBack /> Назад
                </button>
                <h1>Пользователь: {user.firstName} {user.lastName}</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleToggleStatus}>
                        {user.active ? <Block /> : <CheckCircle />}
                        {user.active ? ' Заблокировать' : ' Активировать'}
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-body">
                        <div className="detail-section">
                            <h3>Основная информация</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <strong>ID:</strong> {user.id}
                                </div>
                                <div className="detail-item">
                                    <strong>Keycloak ID:</strong> {user.keycloakId || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Email:</strong> {user.email}
                                </div>
                                <div className="detail-item">
                                    <strong>Имя:</strong> {user.firstName || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Фамилия:</strong> {user.lastName || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Телефон:</strong> {user.phone || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Должность:</strong> {user.position || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Отдел:</strong> {user.department || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Роль:</strong> {user.role || '—'}
                                </div>
                                <div className="detail-item">
                                    <strong>Статус:</strong>
                                    <span className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}>
                                        {user.active ? 'Активен' : 'Неактивен'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <strong>Дата создания:</strong> {new Date(user.createdAt).toLocaleString()}
                                </div>
                                <div className="detail-item">
                                    <strong>Дата обновления:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;