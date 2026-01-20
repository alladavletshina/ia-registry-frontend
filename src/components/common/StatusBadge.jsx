// src/components/common/StatusBadge.jsx
import React from 'react';
import '../../styles/prototype.css';

const StatusBadge = ({ status, size = 'default' }) => {
    const statusConfig = {
        active: {
            label: 'Активен',
            className: 'status-active',
            icon: '✓'
        },
        needs_review: {
            label: 'Требует проверки',
            className: 'status-review',
            icon: '⚠'
        },
        archived: {
            label: 'Архивирован',
            className: 'status-archived',
            icon: '📁'
        },
        draft: {
            label: 'Черновик',
            className: 'status-draft',
            icon: '✎'
        }
    };

    const config = statusConfig[status] || {
        label: status,
        className: 'badge-secondary',
        icon: '?'
    };

    const sizeClass = size === 'small' ? 'text-xs px-2 py-1' : '';

    return (
        <span className={`status-badge ${config.className} ${sizeClass} inline-flex items-center gap-2`}>
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
};

export default StatusBadge;