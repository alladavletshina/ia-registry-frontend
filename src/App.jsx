// src/App.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/prototype.css';

// Импортируем AuthProvider из контекста
import { AuthProvider } from './contexts/AuthContext';

// Импортируем Layout компоненты
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Импортируем LoginPage
import LoginPage from './pages/Auth/LoginPage';

// Защищенный маршрут
import ProtectedRoute from './components/common/ProtectedRoute';

console.log('App component loading...');

function App() {
    console.log('App rendering...');

    return (
        <BrowserRouter>
            {/* Используем AuthProvider из contexts/AuthContext.jsx */}
            <AuthProvider>
                <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
                    <Routes>
                        {/* Public route */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Admin routes */}
                        <Route path="/admin/*" element={
                            <ProtectedRoute role="admin">
                                <AdminLayout />
                            </ProtectedRoute>
                        } />

                        {/* Protected User routes */}
                        <Route path="/user/*" element={
                            <ProtectedRoute role="user">
                                <UserLayout />
                            </ProtectedRoute>
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;