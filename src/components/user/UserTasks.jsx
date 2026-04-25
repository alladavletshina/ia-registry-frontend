import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import {
    CheckCircle,
    HourglassEmpty,
    Warning,
    Assignment,
    FilterList,
    Download,
    Add,
    Delete,
    Visibility,
    CalendarToday,
    PriorityHigh,
    Person
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import taskApi from '../../services/taskApi';
import userApi from '../../services/userApi';
import '../../styles/prototype.css';

const UserTasks = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [internalUserId, setInternalUserId] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assetId: null
    });

    // Состояния пагинации
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    // Получаем внутренний ID пользователя
    useEffect(() => {
        const fetchInternalId = async () => {
            try {
                const profile = await userApi.getCurrentUser();
                setInternalUserId(profile.id);
            } catch (err) {
                console.error('Failed to get internal user id', err);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchInternalId();
    }, []);

    const loadTasks = useCallback(async () => {
        if (!internalUserId) return;
        setLoading(true);
        try {
            const params = {
                userId: internalUserId,
                page,
                size: pageSize,
                ...(search && { search })
            };
            const pageData = await taskApi.getPage(params);
            setTasks(pageData.content || []);
            setTotalElements(pageData.totalElements || 0);
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            alert('Не удалось загрузить задачи');
        } finally {
            setLoading(false);
        }
    }, [search, internalUserId, page, pageSize]);

    const loadStats = useCallback(async () => {
        if (!internalUserId) return;
        try {
            const data = await taskApi.getStatsByUser(internalUserId);
            setStats(data);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }, [internalUserId]);

    useEffect(() => {
        if (internalUserId) {
            loadTasks();
            loadStats();
        }
    }, [internalUserId, loadTasks, loadStats]);

    // Фильтрация на клиенте (только по статусу, т.к. поиск уже передан на сервер)
    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'overdue') {
            const today = new Date();
            const dueDate = new Date(task.dueDate);
            return dueDate < today && task.status !== 'COMPLETED';
        }
        return task.status === filter;
    });

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await taskApi.updateTaskFields(taskId, { status: newStatus });
            await loadTasks();
            await loadStats();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус задачи');
        }
    };

    const extendTaskDueDate = async (taskId, newDueDate) => {
        try {
            await taskApi.updateTaskFields(taskId, { dueDate: newDueDate });
            await loadTasks();
            await loadStats();
            alert('Срок задачи продлён');
        } catch (error) {
            console.error('Ошибка продления срока:', error);
            alert('Не удалось продлить срок');
        }
    };

    const createTask = async () => {
        if (!newTask.title.trim()) {
            alert('Введите название задачи');
            return;
        }
        try {
            const taskData = {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                dueDate: newTask.dueDate,
                type: 'UPDATE',
                estimatedTime: '2 часа',
                tags: [],
                assetId: newTask.assetId
            };
            await taskApi.create(taskData);
            setShowCreateModal(false);
            setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assetId: null });
            await loadTasks();
            await loadStats();
        } catch (error) {
            console.error('Ошибка создания задачи:', error);
            alert('Не удалось создать задачу');
        }
    };

    const deleteTask = async (taskId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
            try {
                await taskApi.delete(taskId);
                await loadTasks();
                await loadStats();
            } catch (error) {
                console.error('Ошибка удаления задачи:', error);
                alert('Не удалось удалить задачу');
            }
        }
    };

    const exportTasks = () => {
        const csvContent = [
            ['ID', 'Название', 'Статус', 'Приоритет', 'Срок', 'Тип', 'Назначил', 'Создана'].join(','),
            ...filteredTasks.map(task => [
                task.id,
                `"${task.title}"`,
                getStatusText(task.status),
                getPriorityText(task.priority),
                task.dueDate,
                getTypeText(task.type),
                task.assignedBy,
                task.createdAt
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'PENDING': return <HourglassEmpty style={{ color: '#f59e0b' }} />;
            case 'IN_PROGRESS': return <Assignment style={{ color: '#3b82f6' }} />;
            case 'COMPLETED': return <CheckCircle style={{ color: '#10b981' }} />;
            case 'OVERDUE': return <Warning style={{ color: '#ef4444' }} />;
            default: return <HourglassEmpty />;
        }
    };

    const getStatusText = (status) => {
        const map = {
            'PENDING': 'Ожидает',
            'IN_PROGRESS': 'В работе',
            'COMPLETED': 'Выполнена',
            'OVERDUE': 'Просрочена'
        };
        return map[status] || status;
    };

    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'HIGH': return <PriorityHigh style={{ color: '#ef4444' }} />;
            case 'MEDIUM': return <PriorityHigh style={{ color: '#f59e0b' }} />;
            case 'LOW': return <PriorityHigh style={{ color: '#10b981' }} />;
            default: return <PriorityHigh />;
        }
    };

    const getPriorityText = (priority) => {
        const map = { 'HIGH': 'Высокий', 'MEDIUM': 'Средний', 'LOW': 'Низкий' };
        return map[priority] || priority;
    };

    const getTypeText = (type) => {
        const map = {
            'UPDATE': 'Обновление',
            'REVIEW': 'Проверка',
            'REPORT': 'Отчет',
            'INVENTORY': 'Инвентаризация',
            'BACKUP': 'Резервное копирование'
        };
        return map[type] || type;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'COMPLETED') return false;
        const today = new Date();
        const due = new Date(dueDate);
        return due < today;
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage - 1);
    };

    if (loadingProfile || (loading && !internalUserId)) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка задач...</p>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';

    return (
        <div className="user-tasks-container">
            {/* Статистика */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div className="stat-card">
                    <div><h4>Всего задач</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0' }}>{stats.total}</p></div>
                    <Assignment style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.7 }} />
                </div>
                <div className="stat-card">
                    <div><h4>В работе</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#3b82f6' }}>{stats.inProgress}</p></div>
                    <HourglassEmpty style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.7 }} />
                </div>
                <div className="stat-card">
                    <div><h4>Выполнено</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#10b981' }}>{stats.completed}</p></div>
                    <CheckCircle style={{ fontSize: '32px', color: '#10b981', opacity: 0.7 }} />
                </div>
                <div className="stat-card">
                    <div><h4>Просрочено</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#ef4444' }}>{stats.overdue}</p></div>
                    <Warning style={{ fontSize: '32px', color: '#ef4444', opacity: 0.7 }} />
                </div>
            </div>

            {/* Панель управления */}
            <div className="control-panel" style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input type="text" placeholder="Поиск задач..." className="input" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '250px', paddingLeft: '40px' }} />
                            <FilterList style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        </div>
                        <select className="input select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '150px' }}>
                            <option value="all">Все задачи</option>
                            <option value="PENDING">Ожидающие</option>
                            <option value="IN_PROGRESS">В работе</option>
                            <option value="COMPLETED">Выполненные</option>
                            <option value="overdue">Просроченные</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                            <span>Показывать:</span>
                            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} className="input select" style={{ width: '80px' }}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" onClick={exportTasks} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download /> Экспорт</button>
                        {isAdmin && (
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Add /> Новая задача</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Список задач */}
            <div className="tasks-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <Assignment style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }} />
                        <h4 style={{ color: '#64748b', marginBottom: 8 }}>Нет задач</h4>
                        <p style={{ color: '#94a3b8', marginBottom: 24 }}>{search ? 'По вашему запросу задачи не найдены' : 'У вас пока нет назначенных задач'}</p>
                        {isAdmin && <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Создать первую задачу</button>}
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} className="task-card" style={{
                            background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginBottom: '16px', position: 'relative',
                            borderLeft: `4px solid ${task.priority === 'HIGH' ? '#ef4444' : task.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'}`,
                            boxShadow: isOverdue(task.dueDate, task.status) ? '0 0 0 2px rgba(239,68,68,0.1)' : 'var(--shadow-sm)'
                        }}>
                            {isOverdue(task.dueDate, task.status) && (
                                <div style={{ position: 'absolute', top: '-8px', right: '16px', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Warning fontSize="small" /> ПРОСРОЧЕНО
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '18px' }}>{task.title}</h4>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span className={`badge badge-${task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}`}>
                                                {getPriorityIcon(task.priority)} {getPriorityText(task.priority)}
                                            </span>
                                            <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' : task.status === 'OVERDUE' ? 'danger' : task.status === 'IN_PROGRESS' ? 'primary' : 'warning'}`}>
                                                {getStatusIcon(task.status)} {getStatusText(task.status)}
                                            </span>
                                            <span className="badge badge-secondary">{getTypeText(task.type)}</span>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-light)', marginBottom: '16px', lineHeight: 1.6 }}>{task.description}</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {task.tags?.map((tag, index) => <span key={index} style={{ padding: '4px 10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-full)', fontSize: '12px', color: 'var(--text-light)' }}>#{tag}</span>)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}><CalendarToday fontSize="small" /> Срок:</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: isOverdue(task.dueDate, task.status) ? '#ef4444' : 'inherit' }}>{formatDate(task.dueDate)}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{task.estimatedTime}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Person fontSize="small" style={{ color: '#64748b' }} />
                                        <span style={{ fontSize: '13px', color: 'var(--text-light)' }}><strong>Назначил:</strong> {task.assignedBy}</span>
                                    </div>
                                    {task.assetId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}><strong>Актив:</strong></span>
                                            <a
                                                href={`/user/assets/${task.assetId}`}
                                                style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px', cursor: 'pointer' }}
                                                onClick={(e) => { e.preventDefault(); navigate(`/user/assets/${task.assetId}`); }}
                                            >
                                                {task.assetName || `Актив #${task.assetId}`}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/user/tasks/${task.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Visibility fontSize="small" /> Подробнее</button>
                                    {task.status !== 'COMPLETED' && (
                                        <>
                                            {task.status === 'PENDING' && <button className="btn btn-sm btn-primary" onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}>Взять в работу</button>}
                                            {task.status === 'IN_PROGRESS' && <button className="btn btn-sm btn-success" onClick={() => updateTaskStatus(task.id, 'COMPLETED')}>Завершить</button>}
                                            {isOverdue(task.dueDate, task.status) && <button className="btn btn-sm btn-danger" onClick={() => { const newDate = prompt('Укажите новый срок (ГГГГ-ММ-ДД):', task.dueDate); if (newDate) extendTaskDueDate(task.id, newDate); }}>Продлить срок</button>}
                                        </>
                                    )}
                                    {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => deleteTask(task.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Delete fontSize="small" /></button>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Пагинация */}
            {totalElements > pageSize && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <Pagination
                        count={Math.ceil(totalElements / pageSize)}
                        page={page + 1}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </div>
            )}

            {/* Модальное окно создания задачи */}
            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h3 style={{ marginBottom: '24px' }}>Создание новой задачи</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Название задачи *</label><input type="text" className="input" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} placeholder="Введите название задачи" /></div>
                            <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Описание</label><textarea className="input" rows={4} value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} placeholder="Опишите задачу подробнее" style={{ width: '100%', resize: 'vertical' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Приоритет</label><select className="input select" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}><option value="LOW">Низкий</option><option value="MEDIUM">Средний</option><option value="HIGH">Высокий</option></select></div>
                                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Срок выполнения</label><input type="date" className="input" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} min={new Date().toISOString().split('T')[0]} /></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Отмена</button>
                            <button className="btn btn-primary" onClick={createTask} disabled={!newTask.title.trim()}>Создать задачу</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTasks;