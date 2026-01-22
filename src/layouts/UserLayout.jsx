// src/layouts/UserLayout.jsx
import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/prototype.css';

// Импортируем страницы
import UserDashboard from '../pages/User/UserDashboard';
import MyAssets from '../pages/User/MyAssets';
import ProfilePage from '../pages/User/ProfilePage';
import TasksPage from '../pages/User/TasksPage'; // Импортируем новый компонент задач

const UserLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                        <button className="notifications-btn">
                            🔔
                            <span className="badge">3</span>
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="my-assets" element={<MyAssets />} />
                        <Route path="assets/:id" element={<AssetView />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Routes>
                </main>

                <footer className="content-footer">
                    <p>Система управления информационными активами © 2024</p>
                </footer>
            </div>
        </div>
    );
};

// Простой компонент для просмотра актива (оставляем на месте)
const AssetView = () => (
    <div>
        <h2>Просмотр актива</h2>
        <p>Здесь будет детальная информация об активе</p>
    </div>
);

export default UserLayout;