// src/layouts/UserLayout.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notificationApi from '../services/notificationApi';
import NotificationCenter from '../components/user/NotificationCenter';
import '../styles/prototype.css';

// Импортируем страницы
import UserDashboard from '../pages/User/UserDashboard';
import MyAssets from '../pages/User/MyAssets';
import ProfilePage from '../pages/User/ProfilePage';
import TasksPage from '../pages/User/TasksPage';
import AssetView from '../pages/User/AssetView';
import TaskDetail from '../components/tasks/TaskDetail';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Polling для счётчика уведомлений
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { count } = await notificationApi.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Закрытие дропдауна при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications &&
                !event.target.closest('.notification-dropdown') &&
                !event.target.closest('.notification-center')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/user/dashboard', icon: '📊', label: 'Дашборд' },
        { path: '/user/my-assets', icon: '📁', label: 'Мои активы' },
        { path: '/user/tasks', icon: '✅', label: 'Задачи' },
        { path: '/user/profile', icon: '👤', label: 'Профиль' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h3>Управление ИА</h3>
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="user-info">
                    <div className="user-avatar">{user?.fullName?.charAt(0)}</div>
                    <div className="user-details">
                        <strong>{user?.fullName}</strong>
                        <span className="user-role">Пользователь</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setShowNotifications(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="nav-icon">🚪</span>
                        {!sidebarCollapsed && <span>Выйти</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                <header className="content-header">
                    <h1>Панель пользователя</h1>
                    <div className="header-actions">
                        <span className="welcome-text">
                            Добро пожаловать, <strong>{user?.fullName}</strong>!
                        </span>
                        <div className="notification-dropdown" style={{ position: 'relative' }}>
                            <button
                                className="notifications-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifications(!showNotifications);
                                }}
                                aria-label="Уведомления"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="badge">{unreadCount}</span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="notification-center" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '400px',
                                    maxWidth: '90vw',
                                    background: 'white',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-xl)',
                                    border: '1px solid var(--border)',
                                    marginTop: '8px',
                                    zIndex: 1000,
                                }}>
                                    <NotificationCenter
                                        onMarkAsRead={() => {
                                            // После отметки прочитанных обновляем счётчик
                                            notificationApi.getUnreadCount().then(({ count }) => setUnreadCount(count));
                                        }}
                                        onClose={() => setShowNotifications(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="my-assets" element={<MyAssets />} />
                        <Route path="assets/:id" element={<AssetView />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="tasks/:id" element={<TaskDetail />} />
                    </Routes>
                </main>

                <footer className="content-footer">
                    <p>Система управления информационными активами © 2026</p>
                </footer>
            </div>
        </div>
    );
};

export default UserLayout;