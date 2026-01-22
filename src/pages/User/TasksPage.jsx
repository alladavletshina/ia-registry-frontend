// src/pages/User/TasksPage.jsx
import React from 'react';
import UserTasks from '../../components/user/UserTasks'; // Правильный путь
import '../../styles/prototype.css';

const TasksPage = () => {
    return (
        <div className="tasks-page">
            <div className="content-header">
                <h1>Мои задачи</h1>
                {/* ... */}
            </div>
            <div className="main-content">
                {/* ... */}
                <UserTasks /> {/* Используем компонент */}
                {/* ... */}
            </div>
        </div>
    );
};

export default TasksPage;