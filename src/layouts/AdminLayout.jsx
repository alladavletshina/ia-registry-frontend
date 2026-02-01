// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/prototype.css';

// Импортируем страницы админа
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AssetRegistry from '../pages/Admin/AssetRegistry';
import UserManagement from '../pages/Admin/UserManagement';
import CategoryManagement from '../pages/Admin/CategoryManagement';
import ReportsPage from '../pages/Admin/ReportsPage';
import AdminSettings from '../pages/Admin/AdminSettings';
import AssetDetail from '../pages/Admin/AssetDetail';
import AuditLogPage from "../pages/Admin/AuditLogPage";
import NotificationCenter from '../components/admin/NotificationCenter'; // Добавьте этот импорт

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); // Добавлено
    const [unreadCount, setUnreadCount] = useState(3); // Моковое количество непрочитанных

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Дашборд' },
        { path: '/admin/assets', icon: '📁', label: 'Реестр активов' },
        { path: '/admin/users', icon: '👥', label: 'Пользователи' },
        { path: '/admin/categories', icon: '🏷️', label: 'Категории' },
        { path: '/admin/audit', icon: '📋', label: 'Журнал аудита' },
        { path: '/admin/reports', icon: '📈', label: 'Отчеты' },
        { path: '/admin/settings', icon: '⚙️', label: 'Настройки' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h3>Админ-панель</h3>
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="user-info">
                    <div className="user-avatar">A</div>
                    <div className="user-details">
                        <strong>{user?.fullName || 'Администратор'}</strong>
                        <span className="user-role">Администратор</span>
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
                    <h1>Панель управления</h1>
                    <div className="header-actions">
                        <span className="welcome-text">
                            Добро пожаловать, <strong>{user?.fullName}</strong>!
                        </span>

                        {/* Кнопка уведомлений с выпадающим списком */}
                        <div className="notification-dropdown" style={{ position: 'relative' }}>
                            <button
                                className="notifications-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                🔔
                                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '400px',
                                    background: 'white',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-xl)',
                                    border: '1px solid var(--border)',
                                    marginTop: '8px',
                                    zIndex: 1000
                                }}>
                                    <NotificationCenter
                                        onMarkAsRead={() => setUnreadCount(0)} // Обновляем счетчик
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="assets" element={<AssetRegistry />} />
                        <Route path="assets/:id" element={<AssetDetail />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="audit" element={<AuditLogPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Routes>
                </main>

                <footer className="content-footer">
                    <p>Система управления информационными активами © 2026</p>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;