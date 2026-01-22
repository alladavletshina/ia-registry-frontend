// src/pages/User/TasksPage.jsx
import React from 'react';
import UserTasks from '../../components/user/UserTasks';
import '../../styles/prototype.css';

const TasksPage = () => {
    return (
        <div className="tasks-page">
            <div className="content-header">
                <h1>Мои задачи</h1>
                <div className="header-actions">
                    <span className="welcome-text">
                        Управление задачами по информационным активам
                    </span>
                </div>
            </div>

            <div className="main-content">
                <UserTasks />

                {/* Информационный блок */}
                <div className="info-card mt-6">
                    <div className="card">
                        <div className="card-body">
                            <h4>📌 Как работать с задачами:</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '16px' }}>
                                <div>
                                    <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>1. Создание задачи</h5>
                                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        Нажмите "Новая задача" для создания задачи. Укажите название, описание, приоритет и срок выполнения.
                                    </p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>2. Управление статусом</h5>
                                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        Используйте кнопки "Взять в работу", "Завершить" для изменения статуса задачи.
                                    </p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>3. Фильтрация</h5>
                                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        Используйте фильтры по статусу и поиск для быстрого нахождения нужных задач.
                                    </p>
                                </div>
                                <div>
                                    <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>4. Экспорт</h5>
                                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        Экспортируйте задачи в CSV для создания отчетов и анализа.
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}>
                                <h5 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Цветовые обозначения:</h5>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                                        <span style={{ fontSize: '13px' }}>Выполнено</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                        <span style={{ fontSize: '13px' }}>В работе</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
                                        <span style={{ fontSize: '13px' }}>Ожидает</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
                                        <span style={{ fontSize: '13px' }}>Просрочено</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksPage;