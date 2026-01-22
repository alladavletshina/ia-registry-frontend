// src/pages/Admin/UserManagement.jsx (ОБНОВЛЕННАЯ ВЕРСИЯ)
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Switch,
    Button,
    Chip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Delete,
    Edit,
    Visibility,
    FilterList,
    Download,
    Search,
    Add
} from '@mui/icons-material';
import { mockUsersAPI } from '../../services/mockApi';
import '../../styles/prototype.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filters, setFilters] = useState({
        role: 'all',
        department: 'all',
        search: '',
        isActive: 'all'
    });
    const [newUser, setNewUser] = useState({
        username: '',
        fullName: '',
        email: '',
        role: 'user',
        department: '',
        isActive: true
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
            const response = await mockUsersAPI.getAll();
            setUsers(response.data.map(user => ({ ...user, isActive: true })));
            setFilteredUsers(response.data.map(user => ({ ...user, isActive: true })));
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
                user.username.toLowerCase().includes(searchTerm) ||
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
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
            await mockUsersAPI.update(id, { isActive });
            setUsers(users.map(user =>
                user.id === id ? { ...user, isActive } : user
            ));
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    };

    const handleCreateUser = async () => {
        try {
            const response = await mockUsersAPI.create(newUser);
            setUsers([...users, response.data]);
            setShowCreateModal(false);
            setNewUser({
                username: '',
                fullName: '',
                email: '',
                role: 'user',
                department: '',
                isActive: true
            });
            alert('Пользователь успешно создан!');
        } catch (error) {
            console.error('Ошибка создания пользователя:', error);
            alert('Ошибка при создании пользователя');
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
                }
                break;
            case 'deactivate':
                if (window.confirm(`Деактивировать ${selectedUsers.length} пользователей?`)) {
                    setUsers(users.map(user =>
                        selectedUsers.includes(user.id) ? { ...user, isActive: false } : user
                    ));
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

    const exportToCSV = () => {
        const headers = ['ID', 'Логин', 'ФИО', 'Email', 'Роль', 'Подразделение', 'Статус'];
        const csvData = [
            headers.join(','),
            ...filteredUsers.map(user => [
                user.id,
                user.username,
                `"${user.fullName}"`,
                user.email,
                user.role,
                user.department,
                user.isActive ? 'Активен' : 'Неактивен'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70
        },
        {
            field: 'username',
            headerName: 'Логин',
            width: 120
        },
        {
            field: 'fullName',
            headerName: 'ФИО',
            width: 200
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200
        },
        {
            field: 'department',
            headerName: 'Подразделение',
            width: 150
        },
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
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => window.open(`/admin/users/${params.row.id}`, '_blank')}
                    >
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
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Добавить пользователя
                    </Button>
                </div>
            </div>

            <div className="main-content">
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
                                placeholder="Поиск по ФИО, логину, email..."
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
                <span>
                  Выбрано <strong>{selectedUsers.length}</strong> пользователей
                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleBulkAction('activate')}
                                    >
                                        Активировать
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleBulkAction('deactivate')}
                                    >
                                        Деактивировать
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleBulkAction('delete')}
                                    >
                                        Удалить
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedUsers([])}
                                    >
                                        Снять выделение
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Кнопки экспорта */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={exportToCSV}
                            >
                                Экспорт в CSV
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setFilters({
                                    role: 'all',
                                    department: 'all',
                                    search: '',
                                    isActive: 'all'
                                })}
                            >
                                Сбросить фильтры
                            </Button>
                        </div>

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
                                onSelectionModelChange={(newSelection) => {
                                    setSelectedUsers(newSelection);
                                }}
                                selectionModel={selectedUsers}
                            />
                        </div>

                        {/* Статистика */}
                        <div className="user-stats mt-6" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px'
                        }}>
                            <div className="stat-card">
                                <h4>Всего пользователей</h4>
                                <p className="number">{users.length}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Активных</h4>
                                <p className="number">{users.filter(u => u.isActive).length}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Администраторов</h4>
                                <p className="number">{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Заблокированных</h4>
                                <p className="number">{users.filter(u => !u.isActive).length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно создания пользователя */}
            <Dialog
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Добавить нового пользователя</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
                        <TextField
                            label="Логин"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            fullWidth
                            required
                        />
                        <TextField
                            label="ФИО"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Роль</InputLabel>
                            <Select
                                value={newUser.role}
                                label="Роль"
                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            >
                                <MenuItem value="user">Пользователь</MenuItem>
                                <MenuItem value="admin">Администратор</MenuItem>
                                <MenuItem value="auditor">Аудитор</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Подразделение"
                            value={newUser.department}
                            onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                            fullWidth
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCreateModal(false)}>Отмена</Button>
                    <Button
                        onClick={handleCreateUser}
                        variant="contained"
                        disabled={!newUser.username || !newUser.fullName || !newUser.email}
                    >
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserManagement;