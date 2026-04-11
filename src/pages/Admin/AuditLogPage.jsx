// src/pages/Admin/AuditLogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Chip, Tooltip } from '@mui/material';
import { Download, FilterList, Search, Visibility } from '@mui/icons-material';
import auditApi from '../../services/auditApi';
import '../../styles/prototype.css';

const AuditLogPage = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        info: 0,
        warning: 0,
        danger: 0,
        success: 0,
    });

    // Фильтры (без пагинации)
    const [filters, setFilters] = useState({
        dateRange: 'all',
        actionType: 'all',
        severity: 'all',
        userId: '',
        searchTerm: '',
    });

    // Пагинация (отдельно)
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });

    // Преобразование dateRange в startDate/endDate
    const getDateParams = useCallback((range) => {
        const now = new Date();
        let startDate, endDate;

        switch (range) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
                endDate = new Date().toISOString().split('T')[0];
                break;
            case 'week':
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                startDate = weekAgo.toISOString().split('T')[0];
                endDate = new Date().toISOString().split('T')[0];
                break;
            case 'month':
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                startDate = monthAgo.toISOString().split('T')[0];
                endDate = new Date().toISOString().split('T')[0];
                break;
            default:
                return {};
        }
        return { startDate, endDate };
    }, []);

    // Загрузка записей аудита (с фильтрами и пагинацией)
    const loadAuditLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: paginationModel.page,
                size: paginationModel.pageSize,
                search: filters.searchTerm || undefined,
                action: filters.actionType !== 'all' ? filters.actionType : undefined,
                severity: filters.severity !== 'all' ? filters.severity : undefined,
                ...getDateParams(filters.dateRange),
            };
            console.log('📡 Запрос аудита:', params);
            const response = await auditApi.getLogs(params);
            setAuditLogs(response.content || []);
            setTotalCount(response.totalElements || 0);
        } catch (error) {
            console.error('Ошибка загрузки аудита:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, paginationModel, getDateParams]);

    // Загрузка статистики (только по дате)
    const loadStats = useCallback(async () => {
        try {
            const params = getDateParams(filters.dateRange);
            const statsData = await auditApi.getStats(params);
            setStats(statsData);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }, [filters.dateRange, getDateParams]);

    // Перезагрузка при изменении фильтров или пагинации
    useEffect(() => {
        loadAuditLogs();
    }, [loadAuditLogs]);

    // Перезагрузка статистики при изменении периода
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Экспорт в CSV (без пагинации, но с учётом фильтров)
    const exportToCSV = async () => {
        try {
            const params = {
                search: filters.searchTerm || undefined,
                action: filters.actionType !== 'all' ? filters.actionType : undefined,
                severity: filters.severity !== 'all' ? filters.severity : undefined,
                ...getDateParams(filters.dateRange),
            };
            const blob = await auditApi.export(params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            alert('Не удалось экспортировать данные');
        }
    };

    // Обработчик смены страницы/размера
    const handlePaginationModelChange = (newModel) => {
        setPaginationModel(newModel);
    };

    // Сброс всех фильтров (пагинация сбрасывается на первую страницу)
    const clearFilters = () => {
        setFilters({
            dateRange: 'all',
            actionType: 'all',
            severity: 'all',
            userId: '',
            searchTerm: '',
        });
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    // Вспомогательные функции для отображения
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
            'CREATE_ASSET': 'Создание актива',
            'UPDATE_ASSET': 'Изменение актива',
            'DELETE_ASSET': 'Удаление актива',
            'USER_REGISTER': 'Регистрация пользователя',
            'USER_UPDATE': 'Изменение пользователя',
            'PASSWORD_CHANGE': 'Смена пароля',
            'TASK_CREATE': 'Создание задачи',
            'TASK_UPDATE': 'Изменение задачи',
            'TASK_DELETE': 'Удаление задачи',
            'TASK_UPDATE_FIELDS': 'Обновление полей задачи'
        };
        return labels[action] || action;
    };

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

    const columns = [
        { field: 'timestamp', headerName: 'Время', width: 160 },
        { field: 'user', headerName: 'Пользователь', width: 120 },
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
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                <IconButton size="small" onClick={() => viewDetails(params.row)}>
                    <Visibility fontSize="small" />
                </IconButton>
            )
        }
    ];

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
                                    onChange={(e) => {
                                        setFilters({ ...filters, dateRange: e.target.value });
                                        setPaginationModel(prev => ({ ...prev, page: 0 }));
                                    }}
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
                                    onChange={(e) => {
                                        setFilters({ ...filters, actionType: e.target.value });
                                        setPaginationModel(prev => ({ ...prev, page: 0 }));
                                    }}
                                >
                                    <option value="all">Все действия</option>
                                    <option value="CREATE_ASSET">Создание активов</option>
                                    <option value="UPDATE_ASSET">Изменение активов</option>
                                    <option value="DELETE_ASSET">Удаление активов</option>
                                    <option value="USER_REGISTER">Регистрация пользователей</option>
                                    <option value="USER_UPDATE">Изменение пользователей</option>
                                    <option value="PASSWORD_CHANGE">Смена пароля</option>
                                    <option value="TASK_CREATE">Создание задач</option>
                                    <option value="TASK_UPDATE">Изменение задач</option>
                                    <option value="TASK_DELETE">Удаление задач</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Уровень опасности</label>
                                <select
                                    className="input select"
                                    value={filters.severity}
                                    onChange={(e) => {
                                        setFilters({ ...filters, severity: e.target.value });
                                        setPaginationModel(prev => ({ ...prev, page: 0 }));
                                    }}
                                >
                                    <option value="all">Все уровни</option>
                                    <option value="INFO">Информация</option>
                                    <option value="WARNING">Предупреждение</option>
                                    <option value="DANGER">Опасность</option>
                                    <option value="SUCCESS">Успех</option>
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
                                        onChange={(e) => {
                                            setFilters({ ...filters, searchTerm: e.target.value });
                                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                                        }}
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
                                <button className="btn btn-secondary" onClick={clearFilters} style={{ width: '100%' }}>
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
                            <div className="stat-badge" style={{ padding: '8px 16px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--primary-700)' }}>Всего записей:</span>
                                <strong style={{ marginLeft: '8px', fontSize: '16px' }}>{stats.total}</strong>
                            </div>
                            <div className="stat-badge" style={{ padding: '8px 16px', background: 'var(--warning-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-100)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--warning-700)' }}>Предупреждений:</span>
                                <strong style={{ marginLeft: '8px', fontSize: '16px' }}>{stats.warning}</strong>
                            </div>
                            <div className="stat-badge" style={{ padding: '8px 16px', background: 'var(--danger-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-100)' }}>
                                <span style={{ fontSize: '12px', color: 'var(--danger-700)' }}>Опасных действий:</span>
                                <strong style={{ marginLeft: '8px', fontSize: '16px' }}>{stats.danger}</strong>
                            </div>
                        </div>

                        <div style={{ height: 500, width: '100%' }}>
                            <DataGrid
                                rows={auditLogs}
                                columns={columns}
                                loading={loading}
                                paginationMode="server"
                                rowCount={totalCount}
                                paginationModel={paginationModel}
                                onPaginationModelChange={handlePaginationModelChange}
                                pageSizeOptions={[25, 50, 100]}
                                checkboxSelection
                                disableRowSelectionOnClick
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