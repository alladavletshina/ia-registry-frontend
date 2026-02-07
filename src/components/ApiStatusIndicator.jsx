// src/components/ApiStatusIndicator.jsx - упрощенная версия
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ApiStatusIndicator = () => {
    const { isAuthenticated, user } = useAuth();

    // Не показываем на странице логина
    if (!isAuthenticated) return null;

    const config = {
        color: '#FF9800',
        bgColor: '#FFF3E0',
        text: 'ТЕСТОВЫЙ РЕЖИМ',
        icon: '🧪',
        tooltip: 'Используются моковые данные'
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: config.bgColor,
            color: config.color,
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1000,
            opacity: 0.9,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: `1px solid ${config.color}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }}
             title={config.tooltip}
             onMouseEnter={(e) => {
                 e.currentTarget.style.opacity = '1';
                 e.currentTarget.style.transform = 'translateY(-2px)';
             }}
             onMouseLeave={(e) => {
                 e.currentTarget.style.opacity = '0.9';
                 e.currentTarget.style.transform = 'translateY(0)';
             }}
             onClick={() => console.log('API Status: Mock Mode')}>
            <span style={{ fontSize: '14px' }}>{config.icon}</span>
            <span>{config.text}</span>
        </div>
    );
};

export default ApiStatusIndicator;