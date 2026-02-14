// src/App.jsx - ФИНАЛЬНЫЙ
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/prototype.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
                    <Routes>
                        {/* Public route - ВХОД */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Public route - РЕГИСТРАЦИЯ */}
                        <Route path="/register" element={<RegisterPage />} />

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