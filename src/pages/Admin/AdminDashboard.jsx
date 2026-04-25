import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assetApi from '../../services/assetApi';
import userApi from '../../services/userApi';
import taskApi from '../../services/taskApi';
import auditApi from '../../services/auditApi';
// Импорты иконок Material UI
import TrendingUp from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Assessment from '@mui/icons-material/Assessment';
import People from '@mui/icons-material/People';
import Description from '@mui/icons-material/Description';
import TaskIcon from '@mui/icons-material/Task';
import DangerousIcon from '@mui/icons-material/Dangerous';
import InfoIcon from '@mui/icons-material/Info';
import '../../styles/prototype.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalAssets: 0,
        totalUsers: 0,
        pendingReviews: 0,
        highRiskAssets: 0,
        pendingTasks: 0,
        overdueTasks: 0
    });
    const [topAssets, setTopAssets] = useState([]);
    const [recentAuditEvents, setRecentAuditEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        // ... (без изменений, тот же код)
        setLoading(true);
        setError(null);
        try {
            let assets = [];
            const assetsRes = await assetApi.getAll();
            if (Array.isArray(assetsRes)) assets = assetsRes;
            else if (assetsRes?.data && Array.isArray(assetsRes.data)) assets = assetsRes.data;

            let users = [];
            const usersRes = await userApi.getAll();
            if (Array.isArray(usersRes)) users = usersRes;
            else if (usersRes?.data && Array.isArray(usersRes.data)) users = usersRes.data;

            const taskStats = await taskApi.getStats();

            let auditEvents = [];
            try {
                const auditRes = await auditApi.getLogs({ page: 0, size: 3, sort: 'timestamp,desc' });
                if (auditRes?.content) auditEvents = auditRes.content;
                else if (Array.isArray(auditRes)) auditEvents = auditRes;
            } catch (e) { console.warn(e); }

            const pendingReviews = assets.filter(a => a.status === 'NEEDS_REVIEW').length;
            const highRiskAssets = assets.filter(a =>
                a.confidentiality === 'HIGH' || a.integrity === 'HIGH' || a.availability === 'HIGH'
            ).length;

            const sortedAssets = [...assets].sort((a, b) => (b.latestRisk || 0) - (a.latestRisk || 0));
            const top3 = sortedAssets.slice(0, 3);

            setStats({
                totalAssets: assets.length,
                totalUsers: users.length,
                pendingReviews,
                highRiskAssets,
                pendingTasks: taskStats?.pending || 0,
                overdueTasks: taskStats?.overdue || 0
            });
            setTopAssets(top3);
            setRecentAuditEvents(auditEvents);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const formatAuditTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} ч назад`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} дн назад`;
        return date.toLocaleDateString('ru-RU');
    };

    // Заменяем текстовые иконки на компоненты
    const getSeverityIcon = (severity) => {
        switch(severity?.toUpperCase()) {
            case 'DANGER': return <DangerousIcon fontSize="small" style={{ color: '#ef4444' }} />;
            case 'WARNING': return <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />;
            case 'SUCCESS': return <CheckCircle fontSize="small" style={{ color: '#10b981' }} />;
            default: return <InfoIcon fontSize="small" style={{ color: '#3b82f6' }} />;
        }
    };

    const mapStatusToClient = (status) => {
        switch(status) {
            case 'ACTIVE': return 'active';
            case 'NEEDS_REVIEW': return 'needs_review';
            case 'ARCHIVED': return 'archived';
            default: return 'active';
        }
    };

    const getActionLabel = (action) => {
        const map = {
            'ASSET_CREATE': 'Создал актив',
            'ASSET_UPDATE': 'Изменил актив',
            'ASSET_DELETE': 'Удалил актив',
            'USER_CREATE': 'Создал пользователя',
            'USER_UPDATE': 'Изменил пользователя',
            'USER_REGISTER': 'Зарегистрировался',
            'LOGIN': 'Вошёл в систему',
            'LOGOUT': 'Вышел из системы',
            'TASK_CREATE': 'Создал задачу',
            'TASK_UPDATE': 'Изменил задачу',
            'TASK_DELETE': 'Удалил задачу',
            'TASK_UPDATE_FIELDS': 'Изменил задачу',
            'PASSWORD_CHANGE': 'Сменил пароль'
        };
        return map[action] || action;
    };

    const getShortDetails = (details, maxLength = 70) => {
        if (!details) return '';
        if (details.length <= maxLength) return details;
        return details.substring(0, maxLength) + '…';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка панели управления...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <h3>Ошибка</h3>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadDashboardData}>Повторить</button>
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
                <div className="stat-card" onClick={() => navigate('/admin/assets')} style={{ cursor: 'pointer' }}>
                    <h3>Всего активов</h3>
                    <p className="number">{stats.totalAssets}</p>
                    <span className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp fontSize="small" /> +{Math.floor(stats.totalAssets * 0.1)} за месяц
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
                    <h3>Пользователей</h3>
                    <p className="number">{stats.totalUsers}</p>
                    <span className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp fontSize="small" /> +2 новых
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/admin/assets?status=needs_review')} style={{ cursor: 'pointer' }}>
                    <h3>На проверке</h3>
                    <p className="number">{stats.pendingReviews}</p>
                    <span className="stat-trend warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.pendingReviews > 0 ? (
                            <><WarningIcon fontSize="small" /> Требуют внимания</>
                        ) : (
                            <><CheckCircle fontSize="small" /> Все проверены</>
                        )}
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/admin/assets?risk=high')} style={{ cursor: 'pointer' }}>
                    <h3>Высокий риск</h3>
                    <p className="number">{stats.highRiskAssets}</p>
                    <span className="stat-trend warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.highRiskAssets > 0 ? (
                            <><WarningIcon fontSize="small" /> Требует мониторинга</>
                        ) : (
                            <><CheckCircle fontSize="small" /> Норма</>
                        )}
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/admin/tasks?status=PENDING')} style={{ cursor: 'pointer' }}>
                    <h3>Задач в работе</h3>
                    <p className="number">{stats.pendingTasks}</p>
                    <span className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.pendingTasks > 0 ? 'Активны' : 'Нет активных'}
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/admin/tasks?status=OVERDUE')} style={{ cursor: 'pointer' }}>
                    <h3>Просрочено задач</h3>
                    <p className="number">{stats.overdueTasks}</p>
                    <span className="stat-trend warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.overdueTasks > 0 ? (
                            <><WarningIcon fontSize="small" /> Требуют внимания</>
                        ) : (
                            <><CheckCircle fontSize="small" /> Всё в срок</>
                        )}
                    </span>
                </div>
            </div>

            <div className="dashboard-sections">
                <section>
                    <div className="section-header">
                        <h3>Ключевые активы</h3>
                        <button className="btn btn-secondary" onClick={() => navigate('/admin/assets')}>
                            Все активы <ArrowForward fontSize="small" />
                        </button>
                    </div>
                    <div className="assets-grid">
                        {topAssets.length === 0 ? (
                            <div className="card p-8 text-center">
                                <p className="text-light">Нет активов</p>
                            </div>
                        ) : (
                            topAssets.map(asset => (
                                <div key={asset.id} className={`asset-card status-${mapStatusToClient(asset.status)}`}>
                                    <div className="card-header">
                                        <h4>{asset.name}</h4>
                                        <span className={`badge badge-${asset.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                                            {asset.status === 'ACTIVE' ? 'Активен' : 'На проверке'}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <p className="description">{asset.description || 'Нет описания'}</p>
                                        <div className="metadata">
                                            <div><strong>Владелец:</strong> {asset.ownerId || '—'}</div>
                                            <div><strong>Последняя проверка:</strong> {asset.lastReview || '—'}</div>
                                        </div>
                                        <div className="cia-rating">
                                            <div className="cia-item">
                                                <span className="label">Конф.</span>
                                                <span className={`value level-${asset.confidentiality?.toLowerCase()}`}>
                                                    {asset.confidentiality}
                                                </span>
                                            </div>
                                            <div className="cia-item">
                                                <span className="label">Целост.</span>
                                                <span className={`value level-${asset.integrity?.toLowerCase()}`}>
                                                    {asset.integrity}
                                                </span>
                                            </div>
                                            <div className="cia-item">
                                                <span className="label">Доступ.</span>
                                                <span className={`value level-${asset.availability?.toLowerCase()}`}>
                                                    {asset.availability}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button className="btn btn-primary flex-1" onClick={() => navigate(`/admin/assets/${asset.id}`)}>
                                                Управлять
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section>
                    <div className="card">
                        <div className="card-body">
                            <h3 className="mb-6">Быстрые действия</h3>
                            <div className="quick-actions">
                                <button className="quick-action-btn" onClick={() => navigate('/admin/reports')}>
                                    <Assessment fontSize="small" /> Посмотреть отчет
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/admin/users')}>
                                    <People fontSize="small" /> Посмотреть пользователей
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/admin/audit')}>
                                    <Description fontSize="small" /> Журнал аудита
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/admin/tasks')}>
                                    <TaskIcon fontSize="small" /> Задачи
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card mt-6">
                        <div className="card-body">
                            <div className="section-header">
                                <h3>Последние события аудита</h3>
                                <button className="btn btn-secondary" onClick={() => navigate('/admin/audit')}>
                                    Весь журнал <ArrowForward fontSize="small" />
                                </button>
                            </div>
                            {recentAuditEvents.length === 0 ? (
                                <p className="text-center text-light mt-4">Нет событий аудита</p>
                            ) : (
                                <div className="recent-activities">
                                    {recentAuditEvents.map(event => (
                                        <div key={event.id} className="activity-item">
                                            <div className="activity-icon">
                                                {getSeverityIcon(event.severity)}
                                            </div>
                                            <div className="activity-details">
                                                <div className="activity-text">
                                                    <strong>{event.user || event.username}</strong> – {getActionLabel(event.action)}
                                                </div>
                                                <div className="activity-time">{formatAuditTime(event.timestamp)}</div>
                                                <div className="activity-detail">{getShortDetails(event.details, 70)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;