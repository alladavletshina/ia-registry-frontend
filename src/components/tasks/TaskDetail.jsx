import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import taskApi from '../../services/taskApi';
import '../../styles/prototype.css';

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadTask();
    }, [id]);

    const loadTask = async () => {
        setLoading(true);
        try {
            const data = await taskApi.getById(id);
            setTask(data);
        } catch (err) {
            console.error('Failed to load task:', err);
            setError('Не удалось загрузить задачу');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await taskApi.updateTaskFields(id, { status: newStatus });
            await loadTask();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Ошибка при обновлении статуса');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusText = (status) => {
        const map = { 'PENDING': 'Ожидает', 'IN_PROGRESS': 'В работе', 'COMPLETED': 'Выполнена', 'OVERDUE': 'Просрочена' };
        return map[status] || status;
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
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка задачи...</p>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="empty-state">
                <h3>Ошибка</h3>
                <p>{error || 'Задача не найдена'}</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Назад</button>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';
    const canEdit = isAdmin || task.assignedTo === user?.keycloakId;

    return (
        <div className="task-detail">
            <div className="content-header">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Назад</button>
                <h1>{task.title}</h1>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-body">
                        <div className="detail-section">
                            <h3>Информация о задаче</h3>
                            <div className="detail-grid">
                                <div className="detail-item"><strong>Статус:</strong> <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' : task.status === 'OVERDUE' ? 'danger' : task.status === 'IN_PROGRESS' ? 'primary' : 'warning'}`}>{getStatusText(task.status)}</span></div>
                                <div className="detail-item"><strong>Приоритет:</strong> <span className={`badge badge-${task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}`}>{getPriorityText(task.priority)}</span></div>
                                <div className="detail-item"><strong>Тип:</strong> {getTypeText(task.type)}</div>
                                <div className="detail-item"><strong>Срок выполнения:</strong> {formatDate(task.dueDate)}</div>
                                <div className="detail-item"><strong>Оценка времени:</strong> {task.estimatedTime || '—'}</div>
                                <div className="detail-item"><strong>Создана:</strong> {formatDate(task.createdAt)}</div>
                                <div className="detail-item"><strong>Обновлена:</strong> {formatDate(task.updatedAt)}</div>
                                {task.assetName && <div className="detail-item"><strong>Актив:</strong> {task.assetName}</div>}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Описание</h3>
                            <p>{task.description || 'Нет описания'}</p>
                        </div>

                        {canEdit && task.status !== 'COMPLETED' && (
                            <div className="detail-section">
                                <h3>Действия</h3>
                                <div className="task-actions" style={{ display: 'flex', gap: '12px' }}>
                                    {task.status === 'PENDING' && (
                                        <button className="btn btn-primary" onClick={() => handleStatusChange('IN_PROGRESS')} disabled={updating}>Взять в работу</button>
                                    )}
                                    {task.status === 'IN_PROGRESS' && (
                                        <button className="btn btn-success" onClick={() => handleStatusChange('COMPLETED')} disabled={updating}>Завершить</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;