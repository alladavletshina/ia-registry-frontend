// src/components/user/UserTasks.jsx
import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    HourglassEmpty,
    Warning,
    Assignment,
    FilterList,
    Download,
    Add,
    Edit,
    Delete,
    Visibility,
    CalendarToday,
    PriorityHigh,
    Person
} from '@mui/icons-material';
import '../../styles/prototype.css';

const UserTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assetId: null
    });

    // Моковые данные задач
    const mockTasks = [
        {
            id: 1,
            title: 'Обновить информацию по БД клиентов',
            description: 'Требуется обновить контактные данные клиентов в системе. Проверить корректность всех полей и добавить новые записи.',
            assetId: 1,
            assetName: 'База данных клиентов',
            dueDate: '2024-02-15',
            priority: 'high',
            status: 'pending',
            type: 'update',
            assignedBy: 'Администратор',
            assignedTo: 'Иванов И.И.',
            createdAt: '2024-01-25',
            updatedAt: '2024-01-30',
            estimatedTime: '4 часа',
            tags: ['обновление', 'клиенты', 'срочно']
        },
        {
            id: 2,
            title: 'Проверить документацию по безопасности',
            description: 'Проверить актуальность технической документации и соответствие стандартам ISO 27001',
            assetId: 2,
            assetName: 'Внутренняя документация',
            dueDate: '2024-02-10',
            priority: 'medium',
            status: 'in_progress',
            type: 'review',
            assignedBy: 'Петрова А.С.',
            assignedTo: 'Иванов И.И.',
            createdAt: '2024-01-20',
            updatedAt: '2024-01-28',
            estimatedTime: '8 часов',
            tags: ['документация', 'безопасность', 'проверка']
        },
        {
            id: 3,
            title: 'Подготовить квартальный отчет',
            description: 'Сформировать отчет по информационным активам за 4 квартал 2023 года',
            dueDate: '2024-02-01',
            priority: 'medium',
            status: 'completed',
            type: 'report',
            assignedBy: 'Система',
            assignedTo: 'Иванов И.И.',
            createdAt: '2024-01-15',
            completedAt: '2024-01-31',
            estimatedTime: '6 часов',
            tags: ['отчет', 'квартал', 'статистика']
        },
        {
            id: 4,
            title: 'Инвентаризация программного обеспечения',
            description: 'Составить актуальный список установленного ПО с указанием лицензий',
            assetId: 3,
            assetName: 'CRM система',
            dueDate: '2024-02-28',
            priority: 'low',
            status: 'pending',
            type: 'inventory',
            assignedBy: 'Администратор',
            assignedTo: 'Иванов И.И.',
            createdAt: '2024-01-30',
            updatedAt: '2024-01-30',
            estimatedTime: '12 часов',
            tags: ['инвентаризация', 'ПО', 'лицензии']
        },
        {
            id: 5,
            title: 'Резервное копирование данных',
            description: 'Выполнить полное резервное копирование баз данных',
            assetId: 1,
            assetName: 'База данных клиентов',
            dueDate: '2024-01-31',
            priority: 'high',
            status: 'overdue',
            type: 'backup',
            assignedBy: 'Система',
            assignedTo: 'Иванов И.И.',
            createdAt: '2024-01-25',
            updatedAt: '2024-01-30',
            estimatedTime: '3 часа',
            tags: ['резервная копия', 'база данных', 'срочно']
        }
    ];

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = () => {
        setLoading(true);
        setTimeout(() => {
            setTasks(mockTasks);
            setLoading(false);
        }, 500);
    };

    const filteredTasks = tasks.filter(task => {
        // Фильтр по статусу
        if (filter !== 'all' && filter !== task.status) {
            if (filter === 'overdue') {
                const today = new Date();
                const dueDate = new Date(task.dueDate);
                if (!(dueDate < today && task.status !== 'completed')) {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Поиск
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                task.title.toLowerCase().includes(searchLower) ||
                task.description.toLowerCase().includes(searchLower) ||
                task.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        return true;
    });

    const updateTaskStatus = (taskId, newStatus) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? {
                ...task,
                status: newStatus,
                updatedAt: new Date().toISOString().split('T')[0],
                ...(newStatus === 'completed' && { completedAt: new Date().toISOString().split('T')[0] })
            } : task
        ));
    };

    const createTask = () => {
        const newTaskData = {
            ...newTask,
            id: tasks.length + 1,
            status: 'pending',
            assignedTo: 'Иванов И.И.',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            tags: [],
            estimatedTime: '2 часа'
        };

        setTasks([...tasks, newTaskData]);
        setShowCreateModal(false);
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: '',
            assetId: null
        });
    };

    const deleteTask = (taskId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
            setTasks(tasks.filter(task => task.id !== taskId));
        }
    };

    const exportTasks = () => {
        const csvContent = [
            ['ID', 'Название', 'Статус', 'Приоритет', 'Срок', 'Тип', 'Назначена', 'Создана'].join(','),
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
            case 'pending': return <HourglassEmpty style={{ color: '#f59e0b' }} />;
            case 'in_progress': return <Assignment style={{ color: '#3b82f6' }} />;
            case 'completed': return <CheckCircle style={{ color: '#10b981' }} />;
            case 'overdue': return <Warning style={{ color: '#ef4444' }} />;
            default: return <HourglassEmpty />;
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'pending': return 'Ожидает';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Выполнена';
            case 'overdue': return 'Просрочена';
            default: return status;
        }
    };

    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'high': return <PriorityHigh style={{ color: '#ef4444' }} />;
            case 'medium': return <PriorityHigh style={{ color: '#f59e0b' }} />;
            case 'low': return <PriorityHigh style={{ color: '#10b981' }} />;
            default: return <PriorityHigh />;
        }
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'Высокий';
            case 'medium': return 'Средний';
            case 'low': return 'Низкий';
            default: return priority;
        }
    };

    const getTypeText = (type) => {
        const types = {
            'update': 'Обновление',
            'review': 'Проверка',
            'report': 'Отчет',
            'inventory': 'Инвентаризация',
            'backup': 'Резервное копирование'
        };
        return types[type] || type;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'completed') return false;
        const today = new Date();
        const due = new Date(dueDate);
        return due < today;
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length
    };

    if (loading) {
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
                        <div>
                            <h4>Всего задач</h4>
                            <p className="number" style={{ fontSize: '32px', margin: '8px 0' }}>{stats.total}</p>
                        </div>
                        <Assignment style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.7 }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h4>В работе</h4>
                            <p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#3b82f6' }}>{stats.inProgress}</p>
                        </div>
                        <HourglassEmpty style={{ fontSize: '32px', color: '#3b82f6', opacity: 0.7 }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h4>Выполнено</h4>
                            <p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#10b981' }}>{stats.completed}</p>
                        </div>
                        <CheckCircle style={{ fontSize: '32px', color: '#10b981', opacity: 0.7 }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h4>Просрочено</h4>
                            <p className="number" style={{ fontSize: '32px', margin: '8px 0', color: '#ef4444' }}>{stats.overdue}</p>
                        </div>
                        <Warning style={{ fontSize: '32px', color: '#ef4444', opacity: 0.7 }} />
                    </div>
                </div>
            </div>

            {/* Панель управления */}
            <div className="control-panel" style={{
                background: 'white',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Поиск задач..."
                                className="input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '250px', paddingLeft: '40px' }}
                            />
                            <FilterList style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }} />
                        </div>

                        <select
                            className="input select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">Все задачи</option>
                            <option value="pending">Ожидающие</option>
                            <option value="in_progress">В работе</option>
                            <option value="completed">Выполненные</option>
                            <option value="overdue">Просроченные</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={exportTasks}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Download /> Экспорт
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Add /> Новая задача
                        </button>
                    </div>
                </div>
            </div>

            {/* Список задач */}
            <div className="tasks-list">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state" style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'var(--bg-light)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)'
                    }}>
                        <Assignment style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }} />
                        <h4 style={{ color: '#64748b', marginBottom: '8px' }}>Нет задач</h4>
                        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                            {search ? 'По вашему запросу задачи не найдены' : 'У вас пока нет назначенных задач'}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Создать первую задачу
                        </button>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="task-card"
                            style={{
                                background: 'white',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)',
                                padding: '24px',
                                marginBottom: '16px',
                                transition: 'all var(--transition-fast)',
                                position: 'relative',
                                borderLeft: `4px solid ${
                                    task.priority === 'high' ? '#ef4444' :
                                        task.priority === 'medium' ? '#f59e0b' : '#10b981'
                                }`,
                                boxShadow: isOverdue(task.dueDate, task.status) ? '0 0 0 2px rgba(239, 68, 68, 0.1)' : 'var(--shadow-sm)'
                            }}
                        >
                            {isOverdue(task.dueDate, task.status) && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '16px',
                                    background: '#ef4444',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <Warning fontSize="small" /> ПРОСРОЧЕНО
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '18px' }}>{task.title}</h4>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                                                {getPriorityIcon(task.priority)} {getPriorityText(task.priority)}
                                            </span>
                                            <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'overdue' ? 'danger' : task.status === 'in_progress' ? 'primary' : 'warning'}`}>
                                                {getStatusIcon(task.status)} {getStatusText(task.status)}
                                            </span>
                                            <span className="badge badge-secondary">
                                                {getTypeText(task.type)}
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-light)', marginBottom: '16px', lineHeight: 1.6 }}>
                                        {task.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {task.tags.map((tag, index) => (
                                            <span key={index} style={{
                                                padding: '4px 10px',
                                                background: 'var(--bg-light)',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '12px',
                                                color: 'var(--text-light)'
                                            }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>
                                        <CalendarToday fontSize="small" /> Срок:
                                    </div>
                                    <div style={{
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        color: isOverdue(task.dueDate, task.status) ? '#ef4444' : 'inherit'
                                    }}>
                                        {formatDate(task.dueDate)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        {task.estimatedTime}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Person fontSize="small" style={{ color: '#64748b' }} />
                                        <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                            <strong>Назначил:</strong> {task.assignedBy}
                                        </span>
                                    </div>
                                    {task.assetName && (
                                        <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                            <strong>Актив:</strong> {task.assetName}
                                            {task.assetId && (
                                                <a
                                                    href={`/user/assets/${task.assetId}`}
                                                    style={{ marginLeft: '8px', fontSize: '11px', textDecoration: 'none' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        alert(`Переход к активу: ${task.assetName}`);
                                                    }}
                                                >
                                                    перейти →
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => alert(`Подробная информация о задаче: ${task.title}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Visibility fontSize="small" /> Подробнее
                                    </button>

                                    {task.status !== 'completed' && (
                                        <>
                                            {task.status === 'pending' && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                >
                                                    Взять в работу
                                                </button>
                                            )}
                                            {task.status === 'in_progress' && (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                                >
                                                    Завершить
                                                </button>
                                            )}
                                            {task.status === 'overdue' && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => {
                                                        const newDate = prompt('Укажите новый срок (ГГГГ-ММ-ДД):', task.dueDate);
                                                        if (newDate) {
                                                            updateTaskStatus(task.id, 'pending');
                                                            // В реальном приложении здесь будет обновление dueDate
                                                        }
                                                    }}
                                                >
                                                    Продлить срок
                                                </button>
                                            )}
                                        </>
                                    )}

                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => deleteTask(task.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Delete fontSize="small" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Модальное окно создания задачи */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '24px' }}>Создание новой задачи</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Название задачи *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    placeholder="Введите название задачи"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Описание</label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                    placeholder="Опишите задачу подробнее"
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Приоритет</label>
                                    <select
                                        className="input select"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option value="low">Низкий</option>
                                        <option value="medium">Средний</option>
                                        <option value="high">Высокий</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Срок выполнения</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={createTask}
                                disabled={!newTask.title.trim()}
                            >
                                Создать задачу
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTasks;