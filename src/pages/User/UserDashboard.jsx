import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import assetApi from '../../services/assetApi';
import taskApi from '../../services/taskApi';
import userApi from '../../services/userApi';
// Импорты иконок Material UI
import TrendingUp from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Folder from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Task';
import Person from '@mui/icons-material/Person';
import CalendarToday from '@mui/icons-material/CalendarToday';
import FlashOn from '@mui/icons-material/FlashOn';
import '../../styles/prototype.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        myAssetsCount: 0,
        needReview: 0,
        myTasks: 0,
        updatedToday: 0
    });
    const [recentAssets, setRecentAssets] = useState([]);
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [internalUserId, setInternalUserId] = useState(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await userApi.getCurrentUser();
            setInternalUserId(profile.id);
            await loadDashboardData(profile.id);
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
            setError('Не удалось загрузить данные пользователя');
            setLoading(false);
        }
    };

    const loadDashboardData = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            let myAssets = [];
            const assetsRes = await assetApi.getMyAssets();
            if (Array.isArray(assetsRes)) myAssets = assetsRes;
            else if (assetsRes?.data && Array.isArray(assetsRes.data)) myAssets = assetsRes.data;

            let myTasks = [];
            if (userId) {
                try {
                    const tasksRes = await taskApi.getAll({ userId: userId });
                    if (Array.isArray(tasksRes)) myTasks = tasksRes;
                    else if (tasksRes?.content && Array.isArray(tasksRes.content)) myTasks = tasksRes.content;
                } catch (e) {
                    console.warn('Ошибка загрузки задач:', e);
                }
            }

            const today = new Date().toISOString().split('T')[0];
            const needReviewCount = myAssets.filter(a => a.status === 'NEEDS_REVIEW').length;
            const updatedTodayCount = myAssets.filter(a => a.lastReview === today).length;

            setStats({
                myAssetsCount: myAssets.length,
                needReview: needReviewCount,
                myTasks: myTasks.length,
                updatedToday: updatedTodayCount
            });
            setRecentAssets(myAssets.slice(0, 3));
            setRecentTasks(myTasks.slice(0, 3));
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'PENDING': return 'Ожидает';
            case 'IN_PROGRESS': return 'В работе';
            case 'COMPLETED': return 'Выполнена';
            default: return status;
        }
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'HIGH': return 'Высокий';
            case 'MEDIUM': return 'Средний';
            default: return 'Низкий';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            default: return '#10b981';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка панели пользователя...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <h3>Ошибка</h3>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => loadUserProfile()}>Повторить</button>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <h1>Добро пожаловать, {user?.fullName}!</h1>
                <p>Здесь вы можете управлять своими информационными активами и задачами</p>
            </div>

            <div className="stats-cards">
                <div className="stat-card" onClick={() => navigate('/user/my-assets')} style={{ cursor: 'pointer' }}>
                    <h3>Мои активы</h3>
                    <p className="number">{stats.myAssetsCount}</p>
                    <span className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp fontSize="small" /> +{Math.floor(stats.myAssetsCount * 0.1)} за неделю
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/user/my-assets?filter=needs_review')} style={{ cursor: 'pointer' }}>
                    <h3>Требуют проверки</h3>
                    <p className="number">{stats.needReview}</p>
                    <span className="stat-trend warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.needReview > 0 ? (
                            <><WarningIcon fontSize="small" /> Требуют внимания</>
                        ) : (
                            <><CheckCircle fontSize="small" /> Всё в порядке</>
                        )}
                    </span>
                </div>
                <div className="stat-card" onClick={() => navigate('/user/tasks')} style={{ cursor: 'pointer' }}>
                    <h3>Мои задачи</h3>
                    <p className="number">{stats.myTasks}</p>
                    <span className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.myTasks > 0 ? `${stats.myTasks} активны` : 'Нет задач'}
                    </span>
                </div>
                <div className="stat-card">
                    <h3>Обновлено сегодня</h3>
                    <p className="number">{stats.updatedToday}</p>
                    <span className="stat-trend" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.updatedToday > 0 ? (
                            <><CheckCircle fontSize="small" /> Актуально</>
                        ) : (
                            'Требует обновления'
                        )}
                    </span>
                </div>
            </div>

            <div className="dashboard-sections">
                <section>
                    <div className="section-header">
                        <h3>Мои недавние активы</h3>
                        <button className="btn btn-secondary" onClick={() => navigate('/user/my-assets')}>
                            Все активы <ArrowForward fontSize="small" />
                        </button>
                    </div>
                    {recentAssets.length === 0 ? (
                        <div className="card p-8 text-center">
                            <p className="text-light mb-4">У вас пока нет активов</p>
                            <button className="btn btn-primary" onClick={() => alert('Обратитесь к администратору')}>
                                Запросить создание актива
                            </button>
                        </div>
                    ) : (
                        <div className="assets-grid">
                            {recentAssets.map(asset => (
                                <div key={asset.id} className={`asset-card status-${asset.status === 'ACTIVE' ? 'active' : 'needs_review'}`}>
                                    <div className="card-header">
                                        <h4>{asset.name}</h4>
                                        <span className={`badge badge-${asset.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                                            {asset.status === 'ACTIVE' ? 'Активен' : 'На проверке'}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <p className="description">{asset.description || 'Нет описания'}</p>
                                        <div className="metadata">
                                            <div><strong>Категория:</strong> {asset.category || '—'}</div>
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
                                            <button className="btn btn-secondary flex-1" onClick={() => navigate(`/user/assets/${asset.id}`)}>
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
                            <div className="section-header">
                                <h3>Мои последние задачи</h3>
                                <button className="btn btn-secondary" onClick={() => navigate('/user/tasks')}>
                                    Все задачи <ArrowForward fontSize="small" />
                                </button>
                            </div>
                            {recentTasks.length === 0 ? (
                                <p className="text-center text-light mt-4">У вас пока нет задач</p>
                            ) : (
                                <div className="assets-grid">
                                    {recentTasks.map(task => (
                                        <div key={task.id} className="task-card" style={{
                                            background: 'white',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--border)',
                                            padding: '16px',
                                            transition: 'all var(--transition-fast)',
                                            cursor: 'pointer',
                                            borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                                        }} onClick={() => navigate(`/user/tasks/${task.id}`)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <h4 style={{ margin: 0, fontSize: '16px' }}>{task.title}</h4>
                                                <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'primary' : 'warning'}`}>
                                                    {getStatusText(task.status)}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.4 }}>
                                                {task.description?.length > 80 ? task.description.substring(0, 80) + '…' : task.description || 'Нет описания'}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-light)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CalendarToday fontSize="inherit" /> Срок: {formatDate(task.dueDate)}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FlashOn fontSize="inherit" /> {getPriorityText(task.priority)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card mt-6">
                        <div className="card-body">
                            <h3 className="mb-6">Быстрые действия</h3>
                            <div className="quick-actions">
                                <button className="quick-action-btn" onClick={() => navigate('/user/my-assets')}>
                                    <Folder fontSize="small" /> Мои активы
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/user/tasks')}>
                                    <TaskIcon fontSize="small" /> Мои задачи
                                </button>
                                <button className="quick-action-btn" onClick={() => navigate('/user/profile')}>
                                    <Person fontSize="small" /> Мой профиль
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserDashboard;