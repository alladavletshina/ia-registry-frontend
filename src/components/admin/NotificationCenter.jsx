import React, { useState, useEffect } from 'react';
import {
    Warning,
    CheckCircle,
    Info,
    Assignment,
    Security
} from '@mui/icons-material';
import notificationApi from '../../services/notificationApi';

const NotificationCenter = ({ onMarkAsRead, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            // Для всех пользователей – один эндпоинт с параметром unreadOnly=true
            const response = await notificationApi.getMyNotifications({ page: 0, size: 20, unreadOnly: true });
            setNotifications(response.content || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load notifications:', err);
            setError('Не удалось загрузить уведомления');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const getIcon = (type) => {
        switch(type?.toUpperCase()) {
            case 'WARNING': return <Warning style={{ color: '#f59e0b' }} />;
            case 'SUCCESS': return <CheckCircle style={{ color: '#10b981' }} />;
            case 'INFO': return <Info style={{ color: '#3b82f6' }} />;
            case 'ASSIGNMENT': return <Assignment style={{ color: '#8b5cf6' }} />;
            case 'SECURITY': return <Security style={{ color: '#ef4444' }} />;
            default: return <Info />;
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            // Обновляем список
            await loadNotifications();
            if (onMarkAsRead) onMarkAsRead();
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            await loadNotifications();
            if (onMarkAsRead) onMarkAsRead();
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
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

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="notification-center" style={{ minWidth: '300px' }}>
                <div className="notification-header">
                    <h3>Уведомления</h3>
                </div>
                <div className="notification-list" style={{ padding: '20px', textAlign: 'center' }}>
                    Загрузка...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notification-center">
                <div className="notification-header">
                    <h3>Уведомления</h3>
                </div>
                <div className="notification-list" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="notification-center">
            <div className="notification-header">
                <h3>Уведомления {unreadCount > 0 && `(${unreadCount})`}</h3>
                <div className="notification-actions">
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Отметить все как прочитанные
                    </button>
                </div>
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <Info style={{ fontSize: 48, color: '#94a3b8' }} />
                        <p>Нет уведомлений</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="notification-icon">
                                {getIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">
                                    <strong>{notification.title}</strong>
                                    {!notification.read && <span className="unread-dot" />}
                                </div>
                                <p className="notification-message">{notification.message}</p>
                                <div className="notification-footer">
                                    <span className="notification-time">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                    {notification.actionUrl && (
                                        <a
                                            href={notification.actionUrl}
                                            className="btn btn-sm btn-primary"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {notification.actionLabel || 'Перейти'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;