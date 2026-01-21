
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Chip, Tooltip } from '@mui/material';
import { Download, FilterList, Search, Visibility } from '@mui/icons-material';
import '../../styles/prototype.css';

const AuditLogPage = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateRange: 'all',
        actionType: 'all',
        userId: '',
        searchTerm: ''
    });

    // Моковые данные аудита
    const mockAuditData = [
        { id: 1, timestamp: '2024-01-22 14:30:25', user: 'admin', action: 'ASSET_CREATE', details: 'Создан актив "CRM система"', ip: '192.168.1.100', severity: 'info' },
        { id: 2, timestamp: '2024-01-22 13:15:42', user: 'user1', action: 'ASSET_UPDATE', details: 'Изменен статус актива #2', ip: '192.168.1.101', severity: 'warning' },
        { id: 3, timestamp: '2024-01-22 11:45:18', user: 'admin', action: 'USER_CREATE', details: 'Добавлен новый пользователь', ip: '192.168.1.100', severity: 'info' },
        { id: 4, timestamp: '2024-01-22 10:20:33', user: 'user1', action: 'LOGIN', details: 'Успешный вход в систему', ip: '192.168.1.101', severity: 'info' },
        { id: 5, timestamp: '2024-01-22 09:55:47', user: 'admin', action: 'REPORT_GENERATE', details: 'Сформирован отчет по активам', ip: '192.168.1.100', severity: 'info' },
        { id: 6, timestamp: '2024-01-21 16:40:12', user: 'admin', action: 'ASSET_DELETE', details: 'Удален актив #5', ip: '192.168.1.100', severity: 'danger' },
        { id: 7, timestamp: '2024-01-21 15:25:38', user: 'petrova', action: 'PERMISSION_CHANGE', details: 'Изменены права доступа', ip: '192.168.1.102', severity: 'warning' },
        { id: 8, timestamp: '2024-01-21 14:10:55', user: 'user1', action: 'DATA_EXPORT', details: 'Экспорт данных в CSV', ip: '192.168.1.101', severity: 'info' },
        { id: 9, timestamp: '2024-01-21 12:35:21', user: 'admin', action: 'SETTINGS_UPDATE', details: 'Обновлены настройки системы', ip: '192.168.1.100', severity: 'info' },
        { id: 10, timestamp: '2024-01-21 11:20:44', user: 'user1', action: 'PASSWORD_CHANGE', details: 'Смена пароля', ip: '192.168.1.101', severity: 'info' },
    ];

    useEffect(() => {
        loadAuditLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, auditLogs]);

    const loadAuditLogs = async () => {
        setLoading(true);
        // Имитация загрузки с API
        setTimeout(() => {
            setAuditLogs(mockAuditData);
            setFilteredLogs(mockAuditData);
            setLoading(false);
        }, 500);
    };

    const applyFilters = () => {
        let filtered = [...auditLogs];

        // Фильтр по поиску
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(log =>
                log.user.toLowerCase().includes(term) ||
                log.details.toLowerCase().includes(term) ||
                log.action.toLowerCase().includes(term)
            );
        }

        // Фильтр по типу действия
        if (filters.actionType !== 'all') {
            filtered = filtered.filter(log => log.action === filters.actionType);
        }

        // Фильтр по дате
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(log => {
                const logDate = new Date(log.timestamp);

                switch(filters.dateRange) {
                    case 'today':
                        return logDate >= today;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return logDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return logDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        setFilteredLogs(filtered);
    };

    const getSeverityColor = (severity) => {
        const colors = {
            info: 'primary',
            warning: 'warning',
            danger: 'error',
            success: 'success'
        };
        return colors[severity] || 'default';
    };

    const getActionLabel = (action) => {
        const labels = {
            'ASSET_CREATE': 'Создание актива',
            'ASSET_UPDATE': 'Изменение актива',
            'ASSET_DELETE': 'Удаление актива',
            'USER_CREATE': 'Создание пользователя',
            'USER_UPDATE': 'Изменение пользователя',
            'LOGIN': 'Вход в систему',
            'LOGOUT': 'Выход из системы',
            'REPORT_GENERATE': 'Генерация отчета',
            'PERMISSION_CHANGE': 'Изменение прав',
            'DATA_EXPORT': 'Экспорт данных',
            'SETTINGS_UPDATE': 'Изменение настроек',
            'PASSWORD_CHANGE': 'Смена пароля'
        };
        return labels[action] || action;
    };

    const exportToCSV = () => {
        const headers = ['Время', 'Пользователь', 'Действие', 'Детали', 'IP адрес', 'Уровень'];
        const csvData = [
            headers.join(','),
            ...filteredLogs.map(log => [
                log.timestamp,
                log.user,
                getActionLabel(log.action),
                `"${log.details}"`,
                log.ip,
                log.severity
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            field: 'timestamp',
            headerName: 'Время',
            width: 160,
            renderCell: (params) => (
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {params.value}
                </div>
            )
        },
        {
            field: 'user',
            headerName: 'Пользователь',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )
        },
        {
            field: 'action',
            headerName: 'Действие',
            width: 180,
            renderCell: (params) => (
                <Chip
                    label={getActionLabel(params.value)}
                    size="small"
                    color={getSeverityColor(params.row.severity)}
                />
            )
        },
        {
            field: 'details',
            headerName: 'Детали',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {params.value}
                    </span>
                </Tooltip>
            )
        },
        { field: 'ip', headerName: 'IP адрес', width: 130 },
        {
            field: 'actions',
            headerName: 'Действия',
            width: 100,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => viewDetails(params.row)}
                >
                    <Visibility fontSize="small" />
                </IconButton>
            )
        }
    ];

    const viewDetails = (log) => {
        alert(`Детали события:\n\n` +
            `ID: ${log.id}\n` +
            `Время: ${log.timestamp}\n` +
            `Пользователь: ${log.user}\n` +
            `Действие: ${getActionLabel(log.action)}\n` +
            `Детали: ${log.details}\n` +
            `IP: ${log.ip}\n` +
            `Уровень важности: ${log.severity}`);
    };

    const clearFilters = () => {
        setFilters({
            dateRange: 'all',
            actionType: 'all',
            userId: '',
            searchTerm: ''
        });
    };

    return (
        <div className="audit-log-page">
            <div className="content-header">
                <h1>Журнал аудита</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={exportToCSV}>
                        <Download /> Экспорт в CSV
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-header">
                        <h3>Фильтры и поиск</h3>
                    </div>
                    <div className="card-body">
                        <div className="audit-filters" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px'
                        }}>
                            <div className="filter-group">
                                <label>Период</label>
                                <select
                                    className="input select"
                                    value={filters.dateRange}
                                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                                >
                                    <option value="all">Все время</option>
                                    <option value="today">Сегодня</option>
                                    <option value="week">Последние 7 дней</option>
                                    <option value="month">Последние 30 дней</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Тип действия</label>
                                <select
                                    className="input select"
                                    value={filters.actionType}
                                    onChange={(e) => setFilters({...filters, actionType: e.target.value})}
                                >
                                    <option value="all">Все действия</option>
                                    <option value="ASSET_CREATE">Создание активов</option>
                                    <option value="ASSET_UPDATE">Изменение активов</option>
                                    <option value="ASSET_DELETE">Удаление активов</option>
                                    <option value="USER_CREATE">Создание пользователей</option>
                                    <option value="LOGIN">Входы в систему</option>
                                    <option value="REPORT_GENERATE">Генерация отчетов</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Поиск</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Поиск по логам..."
                                        value={filters.searchTerm}
                                        onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                                    />
                                    <Search style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8'
                                    }} />
                                </div>
                            </div>

                            <div className="filter-group" style={{ alignSelf: 'end' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={clearFilters}
                                    style={{ width: '100%' }}
                                >
                                    <FilterList /> Сбросить фильтры
                                </button>
                            </div>
                        </div>

                        <div className="audit-stats" style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <div className="stat-badge" style={{
                                padding: '8px 16px',
                                background: 'var(--primary-50)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--primary-100)'
                            }}>
                                <span style={{ fontSize: '12px', color: 'var(--primary-700)' }}>Всего записей:</span>
                                <strong style={{ marginLeft: '8px', fontSize: '16px' }}>{filteredLogs.length}</strong>
                            </div>
                            <div className="stat-badge" style={{
                                padding: '8px 16px',
                                background: 'var(--warning-50)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--warning-100)'
                            }}>
                                <span style={{ fontSize: '12px', color: 'var(--warning-700)' }}>Предупреждений:</span>
                                <strong style={{ marginLeft: '8px', fontSize: '16px' }}>
                                    {filteredLogs.filter(l => l.severity === 'warning').length}
                                </strong>
                            </div>
                            <div className="stat-badge" style={{
                                padding: '8px 16px',
                                background: 'var(--danger-50)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--danger-100)'
                            }}>
                                <span style={{ fontSize: '12px', color: 'var(--danger-700)' }}>Опасных действий:</span>
                                <strong style={{ marginLeft: '8px', fontSize: '16px' }}>
                                    {filteredLogs.filter(l => l.severity === 'danger').length}
                                </strong>
                            </div>
                        </div>

                        <div style={{ height: 500, width: '100%' }}>
                            <DataGrid
                                rows={filteredLogs}
                                columns={columns}
                                loading={loading}
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                disableSelectionOnClick
                            />
                        </div>

                        <div className="audit-info mt-4" style={{
                            padding: '16px',
                            background: 'var(--secondary-50)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '12px',
                            color: 'var(--secondary-700)'
                        }}>
                            <strong>Информация:</strong> Журнал аудита хранит все значимые действия пользователей в системе.
                            Рекомендуется регулярно проверять его на предмет подозрительной активности.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogPage;