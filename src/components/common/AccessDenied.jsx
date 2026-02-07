// src/components/common/AccessDenied.jsx - СОЗДАЕМ НОВЫЙ ФАЙЛ
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AccessDenied = ({ requiredRole = null }) => {
    const { user, logout } = useAuth();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '50px 40px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    fontSize: '64px',
                    color: '#ff4757',
                    marginBottom: '20px'
                }}>
                    ⚠️
                </div>

                <h1 style={{
                    color: '#333',
                    marginBottom: '16px',
                    fontSize: '24px'
                }}>
                    Доступ запрещен
                </h1>

                <p style={{
                    color: '#666',
                    marginBottom: '24px',
                    lineHeight: 1.6
                }}>
                    {requiredRole
                        ? `Для доступа к этой странице требуется роль "${requiredRole}"`
                        : 'Для доступа к этой странице требуется авторизация'
                    }
                </p>

                {user && (
                    <div style={{
                        background: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        textAlign: 'left'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#495057' }}>
                            <strong>Текущий пользователь:</strong> {user.username}<br />
                            <strong>Роль:</strong> {user.role}
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                        }}
                    >
                        Перейти на свой дашборд
                    </Link>

                    <button
                        onClick={() => logout()}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            color: '#6c757d',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;