// src/components/admin/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import {
    Warning,
    CheckCircle,
    Info,
    Assignment,
    PersonAdd,
    Security
} from '@mui/icons-material';

const NotificationCenter = ({ onMarkAsRead }) => { // Добавлен пропс
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'warning',
            title: 'Критический актив требует внимания',
            message: 'База данных клиентов не проверялась более 90 дней',
            time: '10 минут назад',
            read: false,
            action: '/admin/assets/1'
        },
        {
            id: 2,
            type: 'info',
            title: 'Новый запрос на проверку',
            message: 'Пользователь Иванов И.И. запросил проверку актива "CRM система"',
            time: '30 минут назад',
            read: false,
            action: '/admin/assets/3'
        },
        {
            id: 3,
            type: 'success',
            title: 'Новый пользователь зарегистрирован',
            message: 'Петрова А.С. успешно создала аккаунт',
            time: '2 часа назад',
            read: true,
            action: '/admin/users'
        },
        {
            id: 4,
            type: 'security',
            title: 'Подозрительная активность',
            message: 'Несколько неудачных попыток входа с IP 192.168.1.100',
            time: '5 часов назад',
            read: false,
            action: '/admin/audit'
        }
    ]);

    const getIcon = (type) => {
        switch(type) {
            case 'warning': return <Warning style={{ color: '#f59e0b' }} />;
            case 'success': return <CheckCircle style={{ color: '#10b981' }} />;
            case 'info': return <Info style={{ color: '#3b82f6' }} />;
            case 'assignment': return <Assignment style={{ color: '#8b5cf6' }} />;
            case 'security': return <Security style={{ color: '#ef4444' }} />;
            default: return <Info />;
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifs =>
            notifs.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );

        // Вызываем callback для обновления счетчика
        if (onMarkAsRead && notifications.filter(n => !n.read && n.id === id).length > 0) {
            onMarkAsRead();
        }
    };

    const markAllAsRead = () => {
        const hadUnread = notifications.some(n => !n.read);
        setNotifications(notifs =>
            notifs.map(notif => ({ ...notif, read: true }))
        );

        // Вызываем callback для обновления счетчика
        if (onMarkAsRead && hadUnread) {
            onMarkAsRead();
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

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
                        <p>Нет новых уведомлений</p>
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
                                    <span className="notification-time">{notification.time}</span>
                                    {notification.action && (
                                        <a
                                            href={notification.action}
                                            className="btn btn-sm btn-primary"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Перейти
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