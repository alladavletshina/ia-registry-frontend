// src/pages/User/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockAssetsAPI } from '../../services/mockApi';
import '../../styles/prototype.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        myAssetsCount: 0,
        needReview: 0,
        myTasks: 0,
        updatedToday: 0
    });
    const [recentAssets, setRecentAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const response = await mockAssetsAPI.getMyAssets();
            const assets = response.data;

            // Рассчитываем статистику
            const today = new Date().toISOString().split('T')[0];
            const needReviewCount = assets.filter(a => a.status === 'needs_review').length;
            const updatedTodayCount = assets.filter(a => a.lastReview === today).length;

            setStats({
                myAssetsCount: assets.length,
                needReview: needReviewCount,
                myTasks: 3, // Заглушка
                updatedToday: updatedTodayCount
            });

            setRecentAssets(assets.slice(0, 3));
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestUpdate = (assetId, changes) => {
        console.log('Запрос на обновление актива:', assetId, changes);
        alert('Запрос на проверку отправлен администратору');
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <h1>Добро пожаловать, {user?.fullName}!</h1>
                <p>Здесь вы можете управлять своими информационными активами</p>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Мои активы</h3>
                    <p className="number">{stats.myAssetsCount}</p>
                    <span className="stat-trend">+{Math.floor(stats.myAssetsCount * 0.1)} за неделю</span>
                </div>
                <div className="stat-card">
                    <h3>Требуют проверки</h3>
                    <p className="number">{stats.needReview}</p>
                    <span className="stat-trend warning">{stats.needReview > 0 ? 'Требуют внимания' : 'Всё в порядке'}</span>
                </div>
                <div className="stat-card">
                    <h3>Мои задачи</h3>
                    <p className="number">{stats.myTasks}</p>
                    <span className="stat-trend">{stats.myTasks > 0 ? '2 активны' : 'Нет задач'}</span>
                </div>
                <div className="stat-card">
                    <h3>Обновлено сегодня</h3>
                    <p className="number">{stats.updatedToday}</p>
                    <span className="stat-trend">{stats.updatedToday > 0 ? '✓ Актуально' : 'Требует обновления'}</span>
                </div>
            </div>

            <div className="dashboard-sections">
                <section>
                    <div className="section-header">
                        <h3>Недавние активы</h3>
                        <button
                            className="btn btn-secondary"
                            onClick={() => window.location.href = '/user/my-assets'}
                        >
                            Все активы →
                        </button>
                    </div>

                    {recentAssets.length === 0 ? (
                        <div className="card p-8 text-center">
                            <p className="text-light mb-4">У вас пока нет активов</p>
                            <button className="btn btn-primary">
                                Создать первый актив
                            </button>
                        </div>
                    ) : (
                        <div className="assets-grid">
                            {recentAssets.map(asset => (
                                <div key={asset.id} className={`asset-card status-${asset.status}`}>
                                    <div className="card-header">
                                        <h4>{asset.name}</h4>
                                        <span className={`badge badge-${asset.status === 'active' ? 'success' : 'warning'}`}>
                                            {asset.status === 'active' ? 'Активен' : 'На проверке'}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <p className="description">{asset.description}</p>

                                        <div className="metadata">
                                            <div>
                                                <strong>Категория:</strong>
                                                <span>{asset.category}</span>
                                            </div>
                                            <div>
                                                <strong>Владелец:</strong>
                                                <span>{asset.owner}</span>
                                            </div>
                                            <div>
                                                <strong>Последняя проверка:</strong>
                                                <span>{asset.lastReview}</span>
                                            </div>
                                        </div>

                                        <div className="cia-rating">
                                            <div className="cia-item">
                                                <span className="label">Конфиденциальность</span>
                                                <span className={`value level-${asset.confidentiality}`}>
                                                    {asset.confidentiality}
                                                </span>
                                            </div>
                                            <div className="cia-item">
                                                <span className="label">Целостность</span>
                                                <span className={`value level-${asset.integrity}`}>
                                                    {asset.integrity}
                                                </span>
                                            </div>
                                            <div className="cia-item">
                                                <span className="label">Доступность</span>
                                                <span className={`value level-${asset.availability}`}>
                                                    {asset.availability}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="btn btn-secondary flex-1"
                                                onClick={() => handleRequestUpdate(asset.id, { status: 'needs_review' })}
                                            >
                                                Запросить проверку
                                            </button>
                                            <button
                                                className="btn btn-primary flex-1"
                                                onClick={() => window.location.href = `/user/assets/${asset.id}`}
                                            >
                                                Подробнее
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="card">
                        <div className="card-body">
                            <h3 className="mb-6">Быстрые действия</h3>
                            <div className="quick-actions">
                                <button className="quick-action-btn">
                                    📝 Создать отчет
                                </button>
                                <button className="quick-action-btn">
                                    📋 Новая задача
                                </button>
                                <button className="quick-action-btn">
                                    🔔 Уведомления
                                </button>
                                <button className="quick-action-btn">
                                    📊 Статистика
                                </button>
                            </div>

                            <h3 className="mt-8 mb-6">Важные даты</h3>
                            <div className="important-dates">
                                <div className="date-item">
                                    <span className="date">15 фев</span>
                                    <span>Проверка БД клиентов</span>
                                </div>
                                <div className="date-item">
                                    <span className="date">20 фев</span>
                                    <span>Обновление документации</span>
                                </div>
                                <div className="date-item">
                                    <span className="date">01 мар</span>
                                    <span>Обучение по безопасности</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserDashboard;