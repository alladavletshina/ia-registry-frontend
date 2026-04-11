// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import AdminTasks from '../pages/Admin/AdminTasks';
import { useAuth } from '../contexts/AuthContext';
import notificationApi from '../services/notificationApi';
import TaskDetail from '../components/tasks/TaskDetail';
import '../styles/prototype.css';

// Импортируем страницы админа
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AssetRegistry from '../pages/Admin/AssetRegistry';
import UserManagement from '../pages/Admin/UserManagement';
import ThreatManagement from '../pages/Admin/ThreatManagement';
import ReportsPage from '../pages/Admin/ReportsPage';
import AssetDetail from '../pages/Admin/AssetDetail';
import AuditLogPage from "../pages/Admin/AuditLogPage";
import UserDetail from '../pages/Admin/UserDetail';
import NotificationCenter from '../components/admin/NotificationCenter';
import AccessDenied from '../components/common/AccessDenied';

const AdminLayout = () => {
    const { user, logout, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // <-- Для отслеживания текущего пути
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Проверяем авторизацию при загрузке и изменении маршрута
    useEffect(() => {
        const checkAuthAndRole = async () => {
            setIsCheckingAuth(true);

            if (loading) {
                // Ждем завершения загрузки
                return;
            }

            // Проверка 1: Пользователь авторизован?
            if (!isAuthenticated) {
                console.log('🚫 Не авторизован, редирект на логин');
                navigate('/login', {
                    state: {
                        from: location,
                        message: 'Требуется авторизация для доступа к панели администратора'
                    }
                });
                return;
            }

            // Проверка 2: У пользователя есть данные?
            if (!user) {
                console.log('🚫 Нет данных пользователя');
                navigate('/login');
                return;
            }

            // Проверка 3: У пользователя роль admin?
            if (user.role !== 'admin') {
                console.log(`🚫 Пользователь ${user.username} (роль: ${user.role}) пытается получить доступ к админ-панели`);
                // Не делаем автоматический редирект, покажем компонент AccessDenied
            }

            setIsCheckingAuth(false);
        };

        checkAuthAndRole();
    }, [isAuthenticated, user, loading, navigate, location]);

    // Добавить useEffect для polling
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { count } = await notificationApi.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        fetchUnreadCount(); // первый вызов
        const interval = setInterval(fetchUnreadCount, 30000); // каждые 30 секунд

        return () => clearInterval(interval);
    }, []);

    // Защищаем уведомления от кликов вне зоны
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
        { path: '/admin/dashboard', icon: '📊', label: 'Дашборд', requiredRole: 'admin' },
        { path: '/admin/assets', icon: '📁', label: 'Реестр активов', requiredRole: 'admin' },
        { path: '/admin/users', icon: '👥', label: 'Пользователи', requiredRole: 'admin' },
        { path: '/admin/threats', icon: '🛡️', label: 'Угрозы ФСТЭК', requiredRole: 'admin' },
        { path: '/admin/audit', icon: '📋', label: 'Журнал аудита', requiredRole: 'admin' },
        { path: '/admin/tasks', icon: '✅', label: 'Задачи', requiredRole: 'admin' },
        { path: '/admin/reports', icon: '📈', label: 'Отчеты', requiredRole: 'admin' },
    ];

    // Если проверка еще не завершена, показываем загрузку
    if (loading || isCheckingAuth) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>Загрузка панели администратора</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>Проверка прав доступа...</p>
                </div>
            </div>
        );
    }

    // Если пользователь не админ, показываем компонент "Доступ запрещен"
    if (user?.role !== 'admin') {
        return <AccessDenied requiredRole="admin" />;
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h3>Админ-панель</h3>
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
                        title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="user-info">
                    <div className="user-avatar" style={{
                        background: `linear-gradient(135deg, ${user?.role === 'admin' ? '#f59e0b' : '#3b82f6'}, ${user?.role === 'admin' ? '#f97316' : '#8b5cf6'})`
                    }}>
                        {user?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div className="user-details">
                        <strong>{user?.fullName || 'Администратор'}</strong>
                        <span className="user-role" style={{
                            color: user?.role === 'admin' ? '#f59e0b' : '#3b82f6'
                        }}>
                            {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </span>
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
                            onClick={() => {
                                // Закрываем уведомления при переходе
                                setShowNotifications(false);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        title="Выйти из системы"
                    >
                        <span className="nav-icon">🚪</span>
                        {!sidebarCollapsed && <span>Выйти</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                <header className="content-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="toggle-btn"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{ display: 'none' }} // Скрываем на мобилке, но можно показать
                            aria-label="Меню"
                        >
                            ☰
                        </button>
                        <h1>Панель управления</h1>
                    </div>
                    <div className="header-actions">
                        <span className="welcome-text">
                            Добро пожаловать, <strong>{user?.fullName}</strong>!
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                color: user?.role === 'admin' ? '#f59e0b' : '#3b82f6',
                                fontWeight: '600'
                            }}>
                                ({user?.role === 'admin' ? 'Администратор' : 'Пользователь'})
                            </span>
                        </span>

                        {/* Кнопка уведомлений с выпадающим списком */}
                        <div className="notification-dropdown" style={{ position: 'relative' }}>
                            <button
                                className="notifications-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifications(!showNotifications);
                                }}
                                aria-label="Уведомления"
                                title="Показать уведомления"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="badge" style={{
                                        animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
                                    }}>
                                        {unreadCount}
                                    </span>
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
                                    animation: 'slideDown 0.2s ease'
                                }}>
                                    <NotificationCenter
                                        onMarkAsRead={() => setUnreadCount(0)}
                                        onClose={() => setShowNotifications(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users/:id" element={<UserDetail />} />
                        <Route path="assets" element={<AssetRegistry />} />
                        <Route path="assets/:id" element={<AssetDetail />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="tasks" element={<AdminTasks />} />
                        <Route path="threats" element={<ThreatManagement />} />
                        <Route path="audit" element={<AuditLogPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="tasks/:id" element={<TaskDetail />} />

                        {/* Защищенный маршрут для 404 в админ-зоне */}
                        <Route path="*" element={
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                background: 'white',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <h2 style={{ color: 'var(--text-dark)', marginBottom: '16px' }}>Страница не найдена</h2>
                                <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                                    Запрошенная страница не существует в панели администратора.
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/admin/dashboard')}
                                >
                                    Вернуться на дашборд
                                </button>
                            </div>
                        } />
                    </Routes>
                </main>

                <footer className="content-footer">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <p>Система управления информационными активами © 2026</p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-light)' }}>
                            <span>Пользователь: <strong>{user?.username}</strong></span>
                            <span>Роль: <strong style={{
                                color: user?.role === 'admin' ? 'var(--warning)' : 'var(--primary)'
                            }}>{user?.role}</strong></span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Стили для анимаций */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    /* Адаптивность для мобильных устройств */
                    @media (max-width: 768px) {
                        .admin-layout {
                            flex-direction: column;
                        }
                        
                        .admin-sidebar {
                            width: 100%;
                            height: auto;
                            position: sticky;
                            top: 0;
                            z-index: 100;
                        }
                        
                        .admin-sidebar.collapsed {
                            height: 60px;
                            overflow: hidden;
                        }
                        
                        .content-header {
                            flex-direction: column;
                            align-items: flex-start;
                            gap: 12px;
                        }
                        
                        .header-actions {
                            width: 100%;
                            justify-content: space-between;
                        }
                        
                        .notification-dropdown .notification-center {
                            width: 100vw;
                            right: -20px;
                            max-width: none;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default AdminLayout;