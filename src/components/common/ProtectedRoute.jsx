// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                padding: '50px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>
                    <div style={{ marginBottom: '10px' }}>Загрузка...</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Проверка авторизации</div>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        console.log(`User role ${user.role} doesn't match required ${role}`);
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;