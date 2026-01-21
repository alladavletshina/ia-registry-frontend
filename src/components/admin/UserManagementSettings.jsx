// src/components/admin/UserManagementSettings.jsx
import React, { useState } from 'react';

const UserManagementSettings = () => {
    const [users, setUsers] = useState([
        { id: 1, username: 'admin', fullName: 'Администратор Системы', email: 'admin@company.com', role: 'admin', isActive: true },
        { id: 2, username: 'user1', fullName: 'Иванов Иван Иванович', email: 'i.ivanov@company.com', role: 'user', isActive: true },
        { id: 3, username: 'petrova', fullName: 'Петрова Анна Сергеевна', email: 'a.petrova@company.com', role: 'user', isActive: true },
        { id: 4, username: 'sidorov', fullName: 'Сидоров Владимир Петрович', email: 'v.sidorov@company.com', role: 'user', isActive: false },
        { id: 5, username: 'smirnova', fullName: 'Смирнова Ольга Игоревна', email: 'o.smirnova@company.com', role: 'user', isActive: true }
    ]);

    const toggleUserStatus = (id) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, isActive: !user.isActive } : user
        ));
    };

    const changeUserRole = (id, newRole) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, role: newRole } : user
        ));
    };

    const addUser = () => {
        const newUser = {
            id: users.length + 1,
            username: `user${users.length + 1}`,
            fullName: 'Новый пользователь',
            email: `user${users.length + 1}@company.com`,
            role: 'user',
            isActive: true
        };
        setUsers([...users, newUser]);
    };

    return (
        <div className="user-management-settings">
            <div className="section-header">
                <h3>Управление пользователями</h3>
                <button className="btn btn-primary" onClick={addUser}>
                    + Добавить пользователя
                </button>
            </div>

            <div className="users-table">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Логин</th>
                        <th>ФИО</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>
                                <strong>{user.username}</strong>
                            </td>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>
                                <select
                                    value={user.role}
                                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                                    className="input select"
                                >
                                    <option value="admin">Администратор</option>
                                    <option value="user">Пользователь</option>
                                    <option value="auditor">Аудитор</option>
                                    <option value="viewer">Наблюдатель</option>
                                </select>
                            </td>
                            <td>
                                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {user.isActive ? 'Активен' : 'Неактивен'}
                                    </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => toggleUserStatus(user.id)}
                                    >
                                        {user.isActive ? 'Деактивировать' : 'Активировать'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            if (window.confirm('Вы уверены, что хотите удалить пользователя?')) {
                                                setUsers(users.filter(u => u.id !== user.id));
                                            }
                                        }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="user-stats mt-6">
                <div className="stat-cards">
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
                </div>
            </div>
        </div>
    );
};

export default UserManagementSettings;