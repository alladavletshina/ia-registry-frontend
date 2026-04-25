import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '@mui/material/Pagination';
import AssetSearch from '../../components/assets/AssetSearch';
import {
    CheckCircle,
    HourglassEmpty,
    Warning,
    Assignment,
    FilterList,
    Download,
    Add,
    Delete,
    Edit,
    CalendarToday,
    PriorityHigh,
    Person,
    Close
} from '@mui/icons-material';
import taskApi from '../../services/taskApi';
import userApi from '../../services/userApi';
import '../../styles/prototype.css';

const AdminTasks = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        type: 'UPDATE',
        estimatedTime: '',
        tags: '',
        assetId: null,
        assignedTo: ''
    });
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        type: '',
        assignedTo: '',
        search: ''
    });

    // Пагинация
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    // Загрузка задач с пагинацией и фильтрами
    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: pageSize,
                ...(filters.status && { status: filters.status }),
                ...(filters.priority && { priority: filters.priority }),
                ...(filters.type && { type: filters.type }),
                ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
                ...(filters.search && { search: filters.search })
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
    }, [filters, page, pageSize]);

    const loadStats = useCallback(async () => {
        try {
            const data = await taskApi.getStats();
            setStats(data);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const data = await userApi.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        }
    }, []);

    useEffect(() => {
        loadTasks();
        loadStats();
        loadUsers();
    }, [loadTasks, loadStats, loadUsers]);

    const getUserName = (userId) => {
        if (!userId) return '—';
        if (user && (userId === user.id || userId === user.keycloakId)) {
            return user.fullName || user.email || 'Администратор';
        }
        const found = users.find(u => u.id === userId || u.keycloakId === userId);
        if (found) return found.fullName || found.email || userId;
        return userId;
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            alert('Введите название задачи');
            return false;
        }
        if (!formData.description.trim()) {
            alert('Введите описание задачи');
            return false;
        }
        if (!formData.dueDate) {
            alert('Укажите срок выполнения');
            return false;
        }
        if (!formData.assetId) {
            alert('Выберите связанный актив');
            return false;
        }
        if (!formData.assignedTo) {
            alert('Назначьте исполнителя');
            return false;
        }
        const today = new Date().toISOString().split('T')[0];
        if (formData.dueDate < today) {
            alert('Срок выполнения не может быть в прошлом');
            return false;
        }
        return true;
    };

    const handleCreateTask = async () => {
        if (!validateForm()) return;
        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                dueDate: formData.dueDate,
                type: formData.type,
                estimatedTime: formData.estimatedTime,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                assetId: parseInt(formData.assetId),
                assignedTo: formData.assignedTo
            };
            await taskApi.create(taskData);
            resetForm();
            setShowCreateModal(false);
            await loadTasks();
            await loadStats();
        } catch (error) {
            console.error('Ошибка создания задачи:', error);
            alert('Не удалось создать задачу');
        }
    };

    const handleUpdateTask = async () => {
        if (!editingTask) return;
        if (!validateForm()) return;
        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                dueDate: formData.dueDate,
                type: formData.type,
                estimatedTime: formData.estimatedTime,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                assetId: parseInt(formData.assetId),
                assignedTo: formData.assignedTo
            };
            await taskApi.update(editingTask.id, taskData);
            resetForm();
            setEditingTask(null);
            setShowCreateModal(false);
            await loadTasks();
            await loadStats();
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            alert('Не удалось обновить задачу');
        }
    };

    const handleDeleteTask = async (taskId) => {
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

    const handleEditClick = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'MEDIUM',
            dueDate: task.dueDate || '',
            type: task.type || 'UPDATE',
            estimatedTime: task.estimatedTime || '',
            tags: task.tags ? task.tags.join(', ') : '',
            assetId: task.assetId || null,
            assignedTo: task.assignedTo || ''
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'MEDIUM',
            dueDate: '',
            type: 'UPDATE',
            estimatedTime: '',
            tags: '',
            assetId: null,
            assignedTo: ''
        });
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await taskApi.patch(taskId, { status: newStatus });
            await loadTasks();
            await loadStats();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус');
        }
    };

    const exportTasks = () => {
        const csvContent = [
            ['ID', 'Название', 'Статус', 'Приоритет', 'Срок', 'Тип', 'Исполнитель', 'Создатель', 'Создана'].join(','),
            ...tasks.map(task => [
                task.id,
                `"${task.title}"`,
                getStatusText(task.status),
                getPriorityText(task.priority),
                task.dueDate,
                getTypeText(task.type),
                getUserName(task.assignedTo),
                getUserName(task.assignedBy),
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
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const isOverdue = (dueDate, status) => {
        if (!dueDate || status === 'COMPLETED') return false;
        const today = new Date();
        const due = new Date(dueDate);
        return due < today;
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage - 1);
    };

    if (loading && tasks.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка задач...</p>
            </div>
        );
    }

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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div><h4>Всего задач</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0' }}>{stats.total}</p></div>
                        <Assignment style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.7 }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div><h4>В работе</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#3b82f6' }}>{stats.inProgress}</p></div>
                        <HourglassEmpty style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.7 }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div><h4>Выполнено</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#10b981' }}>{stats.completed}</p></div>
                        <CheckCircle style={{ fontSize: '32px', color: '#10b981', opacity: 0.7 }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div><h4>Просрочено</h4><p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#ef4444' }}>{stats.overdue}</p></div>
                        <Warning style={{ fontSize: '32px', color: '#ef4444', opacity: 0.7 }} />
                    </div>
                </div>
            </div>

            {/* Панель фильтров */}
            <div className="control-panel" style={{
                background: 'white',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                        <input type="text" placeholder="Поиск..." className="input" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
                    </div>
                    <div style={{ flex: '0 1 150px' }}>
                        <select className="input select" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                            <option value="">Все статусы</option>
                            <option value="PENDING">Ожидает</option>
                            <option value="IN_PROGRESS">В работе</option>
                            <option value="COMPLETED">Выполнена</option>
                            <option value="OVERDUE">Просрочена</option>
                        </select>
                    </div>
                    <div style={{ flex: '0 1 150px' }}>
                        <select className="input select" value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})}>
                            <option value="">Все приоритеты</option>
                            <option value="HIGH">Высокий</option>
                            <option value="MEDIUM">Средний</option>
                            <option value="LOW">Низкий</option>
                        </select>
                    </div>
                    <div style={{ flex: '0 1 150px' }}>
                        <select className="input select" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                            <option value="">Все типы</option>
                            <option value="UPDATE">Обновление</option>
                            <option value="REVIEW">Проверка</option>
                            <option value="REPORT">Отчет</option>
                            <option value="INVENTORY">Инвентаризация</option>
                            <option value="BACKUP">Резервное копирование</option>
                        </select>
                    </div>
                    <div style={{ flex: '0 1 200px' }}>
                        <select className="input select" value={filters.assignedTo} onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}>
                            <option value="">Все исполнители</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.email}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setFilters({ status: '', priority: '', type: '', assignedTo: '', search: '' })}>
                        Сбросить
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="btn btn-secondary" onClick={exportTasks}><Download /> Экспорт</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Показывать:</span>
                            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} className="input select" style={{ width: '80px' }}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setEditingTask(null); setShowCreateModal(true); }}>
                        <Add /> Новая задача
                    </button>
                </div>
            </div>

            {/* Список задач */}
            <div className="tasks-list">
                {tasks.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <Assignment style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }} />
                        <h4 style={{ color: '#64748b', marginBottom: 8 }}>Нет задач</h4>
                        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Создайте первую задачу</p>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingTask(null); setShowCreateModal(true); }}>Создать задачу</button>
                    </div>
                ) : (
                    tasks.map(task => (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <h4 style={{ margin: 0, fontSize: '18px' }}>{task.title}</h4>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span className={`badge badge-${task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}`}>
                                                {getPriorityIcon(task.priority)} {getPriorityText(task.priority)}
                                            </span>
                                            <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' : task.status === 'OVERDUE' ? 'danger' : task.status === 'IN_PROGRESS' ? 'primary' : 'warning'}`}>
                                                {getStatusIcon(task.status)} {getStatusText(task.status)}
                                            </span>
                                            <span className="badge badge-secondary">{getTypeText(task.type)}</span>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>{task.description}</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {task.tags?.map((tag, index) => (
                                            <span key={index} style={{ padding: '4px 10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-full)', fontSize: '12px', color: 'var(--text-light)' }}>#{tag}</span>
                                        ))}
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
                                        <span style={{ fontSize: '13px', color: 'var(--text-light)' }}><strong>Исполнитель:</strong> {getUserName(task.assignedTo)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Person fontSize="small" style={{ color: '#64748b' }} />
                                        <span style={{ fontSize: '13px', color: 'var(--text-light)' }}><strong>Создатель:</strong> {getUserName(task.assignedBy)}</span>
                                    </div>
                                    {task.assetId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}><strong>Актив:</strong></span>
                                            <a href={`/admin/assets/${task.assetId}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px', cursor: 'pointer' }}
                                               onClick={(e) => { e.preventDefault(); navigate(`/admin/assets/${task.assetId}`); }}>
                                                {task.assetName || `Актив #${task.assetId}`}
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {task.status !== 'COMPLETED' && (
                                        <>
                                            {task.status === 'PENDING' && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>Взять в работу</button>}
                                            {task.status === 'IN_PROGRESS' && <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(task.id, 'COMPLETED')}>Завершить</button>}
                                        </>
                                    )}
                                    <button className="btn btn-sm btn-secondary" onClick={() => handleEditClick(task)}><Edit fontSize="small" /></button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTask(task.id)}><Delete fontSize="small" /></button>
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

            {/* Модальное окно создания/редактирования задачи */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3>{editingTask ? 'Редактирование задачи' : 'Создание новой задачи'}</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Close /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div><label>Название <span className="required-star">*</span></label><input type="text" className="input" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                            <div><label>Описание <span className="required-star">*</span></label><textarea className="input" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div><label>Приоритет</label><select className="input select" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}><option value="LOW">Низкий</option><option value="MEDIUM">Средний</option><option value="HIGH">Высокий</option></select></div>
                                <div><label>Тип</label><select className="input select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option value="UPDATE">Обновление</option><option value="REVIEW">Проверка</option><option value="REPORT">Отчет</option><option value="INVENTORY">Инвентаризация</option><option value="BACKUP">Резервное копирование</option></select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div><label>Срок выполнения <span className="required-star">*</span></label><input type="date" className="input" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} /></div>
                                <div><label>Оценка времени</label><input type="text" className="input" value={formData.estimatedTime} onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})} placeholder="например, 4 часа" /></div>
                            </div>
                            <div><label>Теги (через запятую)</label><input type="text" className="input" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="обновление, срочно" /></div>
                            <div><label>Актив (связанный) <span className="required-star">*</span></label><AssetSearch value={formData.assetId ? Number(formData.assetId) : null} onChange={(assetId) => setFormData({...formData, assetId: assetId || null})} placeholder="Поиск актива по названию..." /></div>
                            <div><label>Исполнитель <span className="required-star">*</span></label><select className="input select" value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}><option value="">Не назначен</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.email}</option>)}</select></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Отмена</button>
                            <button className="btn btn-primary" onClick={editingTask ? handleUpdateTask : handleCreateTask}>{editingTask ? 'Сохранить' : 'Создать'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTasks;