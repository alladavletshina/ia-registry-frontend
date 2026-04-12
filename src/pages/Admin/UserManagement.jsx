import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
    Switch,
    Button,
    Chip,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Visibility,
    FilterList,
    Download,
    Search
} from '@mui/icons-material';
import userApi from '../../services/userApi';
import '../../styles/prototype.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [filters, setFilters] = useState({
        role: 'all',
        department: 'all',
        search: '',
        isActive: 'all'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userApi.getAll();
            const mappedUsers = data.map(user => ({
                id: user.id,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email,
                department: user.department || '',
                role: (user.role || 'user').toLowerCase(),
                isActive: user.active === true,
                lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : null
            }));
            setUsers(mappedUsers);
            setFilteredUsers(mappedUsers);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(user =>
                (user.fullName?.toLowerCase().includes(searchTerm)) ||
                (user.email?.toLowerCase().includes(searchTerm))
            );
        }

        if (filters.role !== 'all') {
            filtered = filtered.filter(user => user.role === filters.role);
        }

        if (filters.department !== 'all') {
            filtered = filtered.filter(user => user.department === filters.department);
        }

        if (filters.isActive !== 'all') {
            filtered = filtered.filter(user =>
                filters.isActive === 'active' ? user.isActive : !user.isActive
            );
        }

        setFilteredUsers(filtered);
    };

    const toggleUserActive = async (id, isActive) => {
        try {
            await userApi.update(id, { active: isActive });
            setUsers(users.map(user =>
                user.id === id ? { ...user, isActive } : user
            ));
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    };

    const handleBulkAction = (action) => {
        if (selectedUsers.length === 0) {
            alert('Выберите пользователей для выполнения действия');
            return;
        }

        switch(action) {
            case 'activate':
                if (window.confirm(`Активировать ${selectedUsers.length} пользователей?`)) {
                    setUsers(users.map(user =>
                        selectedUsers.includes(user.id) ? { ...user, isActive: true } : user
                    ));
                    setSelectedUsers([]);
                }
                break;
            case 'deactivate':
                if (window.confirm(`Деактивировать ${selectedUsers.length} пользователей?`)) {
                    setUsers(users.map(user =>
                        selectedUsers.includes(user.id) ? { ...user, isActive: false } : user
                    ));
                    setSelectedUsers([]);
                }
                break;
            case 'delete':
                if (window.confirm(`Удалить ${selectedUsers.length} пользователей?`)) {
                    setUsers(users.filter(user => !selectedUsers.includes(user.id)));
                    setSelectedUsers([]);
                }
                break;
        }
    };

    const exportToCSV = async () => {
        try {
            const blob = await userApi.exportToCsv();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка при скачивании CSV:', error);
            alert('Не удалось выгрузить отчёт. Попробуйте позже.');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'fullName', headerName: 'ФИО', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'department', headerName: 'Подразделение', width: 150 },
        {
            field: 'role',
            headerName: 'Роль',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'admin' ? 'Админ' : 'Пользователь'}
                    color={params.value === 'admin' ? 'primary' : 'default'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'isActive',
            headerName: 'Статус',
            width: 120,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Switch
                        checked={params.value}
                        onChange={(e) => toggleUserActive(params.row.id, e.target.checked)}
                        size="small"
                    />
                    <span style={{ fontSize: '12px' }}>
                        {params.value ? 'Активен' : 'Неактивен'}
                    </span>
                </div>
            )
        },
        {
            field: 'lastLogin',
            headerName: 'Последний вход',
            width: 150,
            renderCell: (params) => (
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {params.value || 'Никогда'}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Действия',
            width: 150,
            renderCell: (params) => (
                <div className="action-buttons" style={{ display: 'flex', gap: '4px' }}>
                    <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => navigate(`/admin/users/${params.row.id}`)}>
                        Просмотр
                    </Button>
                </div>
            )
        }
    ];

    const departments = Array.from(new Set(users.map(u => u.department))).filter(Boolean);

    return (
        <div className="user-management">
            <div className="content-header">
                <h1>Управление пользователями</h1>
                <div className="header-actions">
                    <Button variant="outlined" startIcon={<Download />} onClick={exportToCSV}>
                        Экспорт в CSV
                    </Button>
                </div>
            </div>

            <div className="main-content">
                {/* Карточки статистики */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4>Всего пользователей</h4>
                                <p className="number" style={{ fontSize: '28px', margin: '8px 0' }}>{users.length}</p>
                            </div>
                            <span style={{ fontSize: '32px' }}></span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4>Активных</h4>
                                <p className="number" style={{ fontSize: '28px', margin: '8px 0', color: '#10b981' }}>{users.filter(u => u.isActive).length}</p>
                            </div>
                            <span style={{ fontSize: '32px' }}></span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4>Администраторов</h4>
                                <p className="number" style={{ fontSize: '28px', margin: '8px 0', color: '#3b82f6' }}>{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                            <span style={{ fontSize: '32px' }}></span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4>Заблокированных</h4>
                                <p className="number" style={{ fontSize: '28px', margin: '8px 0', color: '#ef4444' }}>{users.filter(u => !u.isActive).length}</p>
                            </div>
                            <span style={{ fontSize: '32px' }}></span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="filters" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px',
                            width: '100%'
                        }}>
                            <TextField
                                size="small"
                                placeholder="Поиск по ФИО, email..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                InputProps={{
                                    startAdornment: <Search style={{ marginRight: '8px', color: '#94a3b8' }} />
                                }}
                            />

                            <FormControl size="small">
                                <InputLabel>Роль</InputLabel>
                                <Select
                                    value={filters.role}
                                    label="Роль"
                                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                                >
                                    <MenuItem value="all">Все роли</MenuItem>
                                    <MenuItem value="admin">Администраторы</MenuItem>
                                    <MenuItem value="user">Пользователи</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small">
                                <InputLabel>Подразделение</InputLabel>
                                <Select
                                    value={filters.department}
                                    label="Подразделение"
                                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                                >
                                    <MenuItem value="all">Все подразделения</MenuItem>
                                    {departments.map(dept => (
                                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small">
                                <InputLabel>Статус</InputLabel>
                                <Select
                                    value={filters.isActive}
                                    label="Статус"
                                    onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                                >
                                    <MenuItem value="all">Все статусы</MenuItem>
                                    <MenuItem value="active">Активные</MenuItem>
                                    <MenuItem value="inactive">Неактивные</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setFilters({
                                    role: 'all',
                                    department: 'all',
                                    search: '',
                                    isActive: 'all'
                                })}
                            >
                                Сбросить
                            </Button>
                        </div>
                    </div>

                    <div className="card-body">
                        {/* Панель массовых действий */}
                        {selectedUsers.length > 0 && (
                            <div className="bulk-actions-panel" style={{
                                padding: '12px 16px',
                                background: 'var(--primary-50)',
                                border: '1px solid var(--primary-100)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>Выбрано <strong>{selectedUsers.length}</strong> пользователей</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button size="small" variant="outlined" onClick={() => handleBulkAction('activate')}>Активировать</Button>
                                    <Button size="small" variant="outlined" onClick={() => handleBulkAction('deactivate')}>Деактивировать</Button>
                                    <Button size="small" variant="outlined" color="error" onClick={() => handleBulkAction('delete')}>Удалить</Button>
                                    <Button size="small" onClick={() => setSelectedUsers([])}>Снять выделение</Button>
                                </div>
                            </div>
                        )}

                        {/* Таблица пользователей */}
                        <div style={{ height: 500, width: '100%' }}>
                            <DataGrid
                                rows={filteredUsers}
                                columns={columns}
                                loading={loading}
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                checkboxSelection
                                disableSelectionOnClick
                                onSelectionModelChange={(newSelection) => setSelectedUsers(newSelection)}
                                selectionModel={selectedUsers}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;