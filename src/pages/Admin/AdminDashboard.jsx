// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import assetApi from '../../services/assetApi';
import userApi from '../../services/userApi';
import '../../styles/prototype.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalAssets: 0,
        totalUsers: 0,
        pendingReviews: 0,
        highRiskAssets: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [topAssets, setTopAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Получаем данные и нормализуем в массив
            let assets = [];
            let users = [];

            const assetsResponse = await assetApi.getAll();
            if (Array.isArray(assetsResponse)) {
                assets = assetsResponse;
            } else if (assetsResponse && Array.isArray(assetsResponse.data)) {
                assets = assetsResponse.data;
            }

            const usersResponse = await userApi.getAll();
            if (Array.isArray(usersResponse)) {
                users = usersResponse;
            } else if (usersResponse && Array.isArray(usersResponse.data)) {
                users = usersResponse.data;
            }

            const pendingReviews = assets.filter(a => a.status === 'needs_review').length;
            const highRiskAssets = assets.filter(a =>
                a.confidentiality === 'HIGH' ||
                a.integrity === 'HIGH' ||
                a.availability === 'HIGH'
            ).length;

            setStats({
                totalAssets: assets.length,
                totalUsers: users.length,
                pendingReviews,
                highRiskAssets
            });

            setRecentActivities([
                { id: 1, user: 'Иванов И.И.', action: 'Создал актив', asset: 'CRM система', time: '10:30' },
                { id: 2, user: 'Петрова А.С.', action: 'Запросил проверку', asset: 'Внутренняя документация', time: '11:15' },
                { id: 3, user: 'Администратор', action: 'Обновил категорию', asset: 'База данных клиентов', time: '14:20' },
            ]);

            setTopAssets(assets.slice(0, 3));
        } catch (error) {
            console.error('Ошибка загрузки дашборда:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                <h1>Панель управления администратора</h1>
                <p>Обзор системы управления информационными активами</p>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Всего активов</h3>
                    <p className="number">{stats.totalAssets}</p>
                    <span className="stat-trend">+{Math.floor(stats.totalAssets * 0.15)} за месяц</span>
                </div>
                <div className="stat-card">
                    <h3>Пользователей</h3>
                    <p className="number">{stats.totalUsers}</p>
                    <span className="stat-trend">+2 новых</span>
                </div>
                <div className="stat-card">
                    <h3>На проверке</h3>
                    <p className="number">{stats.pendingReviews}</p>
                    <span className="stat-trend warning">
                        {stats.pendingReviews > 0 ? 'Требуют внимания' : 'Все проверены'}
                    </span>
                </div>
                <div className="stat-card">
                    <h3>Высокий риск</h3>
                    <p className="number">{stats.highRiskAssets}</p>
                    <span className="stat-trend warning">
                        {stats.highRiskAssets > 0 ? 'Требует мониторинга' : 'Норма'}
                    </span>
                </div>
            </div>

            <div className="dashboard-sections">
                <section>
                    <div className="section-header">
                        <h3>Ключевые активы</h3>
                        <button
                            className="btn btn-secondary"
                            onClick={() => window.location.href = '/admin/assets'}
                        >
                            Все активы →
                        </button>
                    </div>

                    <div className="assets-grid">
                        {topAssets.map(asset => (
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
                                            <span className="label">Конф.</span>
                                            <span className={`value level-${asset.confidentiality}`}>
                                                {asset.confidentiality}
                                            </span>
                                        </div>
                                        <div className="cia-item">
                                            <span className="label">Целост.</span>
                                            <span className={`value level-${asset.integrity}`}>
                                                {asset.integrity}
                                            </span>
                                        </div>
                                        <div className="cia-item">
                                            <span className="label">Доступ.</span>
                                            <span className={`value level-${asset.availability}`}>
                                                {asset.availability}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="btn btn-primary flex-1"
                                            onClick={() => window.location.href = `/admin/assets/${asset.id}`}
                                        >
                                            Управлять
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="card">
                        <div className="card-body">
                            <h3 className="mb-6">Недавние действия</h3>
                            <div className="recent-activities">
                                {recentActivities.map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-icon">📝</div>
                                        <div className="activity-details">
                                            <div className="activity-text">
                                                <strong>{activity.user}</strong> {activity.action} "{activity.asset}"
                                            </div>
                                            <div className="activity-time">{activity.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="mt-8 mb-6">Быстрые действия</h3>
                            <div className="quick-actions">
                                <button
                                    className="quick-action-btn"
                                    onClick={() => window.location.href = '/admin/assets'}
                                >
                                    📁 Добавить актив
                                </button>
                                <button
                                    className="quick-action-btn"
                                    onClick={() => window.location.href = '/admin/users'}
                                >
                                    👥 Новый пользователь
                                </button>
                                <button
                                    className="quick-action-btn"
                                    onClick={() => window.location.href = '/admin/reports'}
                                >
                                    📊 Создать отчет
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;