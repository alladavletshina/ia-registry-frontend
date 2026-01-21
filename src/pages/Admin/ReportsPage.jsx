// src/pages/Admin/ReportsPage.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ С ПРОВЕРКАМИ
import React, { useState, useEffect, useCallback } from 'react';
import {
    Download,
    Print,
    FilterList,
    CalendarToday,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Timeline,
    Assessment,
    FileCopy
} from '@mui/icons-material';
import '../../styles/prototype.css';

// Создаем простые компоненты графиков без recharts
const SimpleBarChart = ({ data, width = 400, height = 300 }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div>Нет данных</div>
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(item => item.value || 0));
    if (maxValue === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div>Нет данных для отображения</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: width, height: height, padding: '20px' }}>
            <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: '10px' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            style={{
                                width: '80%',
                                height: `${((item.value || 0) / maxValue) * 100}%`,
                                backgroundColor: item.color || '#3b82f6',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease'
                            }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                            {item.name || `Элемент ${index + 1}`}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                            {item.value || 0}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimplePieChart = ({ data, width = 300, height = 300 }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div>Нет данных</div>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    if (total === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div>Нет данных для отображения</div>
                </div>
            </div>
        );
    }

    let currentAngle = 0;

    return (
        <div style={{ width: width, height: height, position: 'relative' }}>
            <svg width={width} height={height}>
                {data.map((item, index) => {
                    const value = item.value || 0;
                    const percentage = (value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;

                    const x1 = 150 + 100 * Math.cos((startAngle - 90) * Math.PI / 180);
                    const y1 = 150 + 100 * Math.sin((startAngle - 90) * Math.PI / 180);
                    const x2 = 150 + 100 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
                    const y2 = 150 + 100 * Math.sin((startAngle + angle - 90) * Math.PI / 180);

                    const largeArc = angle > 180 ? 1 : 0;

                    return (
                        <path
                            key={index}
                            d={`M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color || `hsl(${(index * 60) % 360}, 70%, 60%)`}
                            stroke="white"
                            strokeWidth="2"
                        />
                    );
                })}
                <circle cx="150" cy="150" r="60" fill="white" />
            </svg>

            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{total}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Всего</div>
            </div>

            <div style={{ marginTop: '20px' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: item.color || `hsl(${(index * 60) % 360}, 70%, 60%)`,
                                marginRight: '8px',
                                borderRadius: '2px'
                            }}
                        />
                        <span style={{ fontSize: '14px' }}>{item.name || `Элемент ${index + 1}`}: </span>
                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{item.value || 0}</span>
                        <span style={{ marginLeft: '4px', color: '#64748b' }}>
                            ({((item.value || 0) / total * 100).toFixed(1)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimpleLineChart = ({ data, width = 500, height = 300 }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div>Нет данных</div>
                </div>
            </div>
        );
    }

    const values = data.map(item => item.value || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;

    if (range === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div>Нет данных для отображения</div>
                </div>
            </div>
        );
    }

    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * (width - 40) + 20;
        const y = height - 40 - ((item.value - minValue) / range) * (height - 80);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ width: width, height: height, padding: '20px' }}>
            <svg width={width} height={height}>
                {/* Сетка */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <g key={i}>
                        <line
                            x1="20"
                            y1={20 + (height - 40) * ratio}
                            x2={width - 20}
                            y2={20 + (height - 40) * ratio}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                        />
                        <text
                            x="0"
                            y={20 + (height - 40) * ratio}
                            fill="#64748b"
                            fontSize="12"
                            dy="4"
                        >
                            {Math.round(minValue + range * (1 - ratio))}
                        </text>
                    </g>
                ))}

                {/* Ось X */}
                <line
                    x1="20"
                    y1={height - 20}
                    x2={width - 20}
                    y2={height - 20}
                    stroke="#94a3b8"
                    strokeWidth="2"
                />

                {/* Линия графика */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                />

                {/* Точки */}
                {data.map((item, index) => {
                    const x = (index / (data.length - 1)) * (width - 40) + 20;
                    const y = height - 40 - ((item.value - minValue) / range) * (height - 80);

                    return (
                        <g key={index}>
                            <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="#3b82f6"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <text
                                x={x}
                                y={height - 5}
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize="12"
                            >
                                {item.label || item.month || `Точка ${index + 1}`}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const ReportsPage = () => {
    const [activeReport, setActiveReport] = useState('overview');
    const [dateRange, setDateRange] = useState('month');
    const [loading, setLoading] = useState(true); // Начинаем с true, чтобы показать загрузку
    const [reportData, setReportData] = useState(null);

    // Моковые данные для отчетов
    const mockReportData = {
        overview: {
            title: 'Обзорная аналитика',
            description: 'Общая статистика по системе за выбранный период',
            data: {
                totalAssets: 156,
                totalUsers: 24,
                pendingReviews: 18,
                completedReviews: 42,
                highRiskAssets: 7,
                mediumRiskAssets: 23,
                lowRiskAssets: 126,
                averageCIA: {
                    confidentiality: 2.8,
                    integrity: 3.2,
                    availability: 3.5
                },
                categoryDistribution: [
                    { name: 'Базы данных', value: 45, color: '#8884d8' },
                    { name: 'Документация', value: 32, color: '#82ca9d' },
                    { name: 'ПО', value: 28, color: '#ffc658' }
                ],
                ciaDistribution: [
                    { name: 'Конф-ть', value: 2.8, color: '#ef4444' },
                    { name: 'Целостность', value: 3.2, color: '#f59e0b' },
                    { name: 'Доступность', value: 3.5, color: '#10b981' }
                ]
            }
        },
        assets: {
            title: 'Отчет по активам',
            description: 'Детальный анализ информационных активов',
            data: {
                byCategory: [
                    { name: 'Базы данных', value: 45, color: '#8884d8' },
                    { name: 'Документация', value: 32, color: '#82ca9d' },
                    { name: 'ПО', value: 28, color: '#ffc658' },
                    { name: 'Оборудование', value: 18, color: '#ff8042' },
                    { name: 'Персонал', value: 12, color: '#0088fe' },
                    { name: 'Процессы', value: 21, color: '#00C49F' }
                ],
                byStatus: [
                    { name: 'Активные', value: 124, color: '#10b981' },
                    { name: 'На проверке', value: 18, color: '#f59e0b' },
                    { name: 'Архивные', value: 14, color: '#64748b' }
                ],
                byConfidentiality: [
                    { name: 'Критическая', value: 7, color: '#ef4444' },
                    { name: 'Высокая', value: 23, color: '#f97316' },
                    { name: 'Средняя', value: 68, color: '#eab308' },
                    { name: 'Низкая', value: 58, color: '#22c55e' }
                ],
                growthTrend: [
                    { month: 'Янв', value: 120 },
                    { month: 'Фев', value: 132 },
                    { month: 'Мар', value: 141 },
                    { month: 'Апр', value: 145 },
                    { month: 'Май', value: 148 },
                    { month: 'Июн', value: 152 },
                    { month: 'Июл', value: 156 }
                ]
            }
        },
        users: {
            title: 'Активность пользователей',
            description: 'Статистика по использованию системы',
            data: {
                activityByRole: [
                    { name: 'Администраторы', logins: 245, actions: 1204 },
                    { name: 'Пользователи', logins: 1542, actions: 3248 },
                    { name: 'Аудиторы', logins: 86, actions: 412 }
                ],
                dailyActivity: [
                    { day: 'Пн', logins: 145, actions: 324 },
                    { day: 'Вт', logins: 162, actions: 368 },
                    { day: 'Ср', logins: 178, actions: 412 },
                    { day: 'Чт', logins: 154, actions: 356 },
                    { day: 'Пт', logins: 132, actions: 298 },
                    { day: 'Сб', logins: 48, actions: 86 },
                    { day: 'Вс', logins: 32, actions: 54 }
                ],
                topUsers: [
                    { name: 'Иванов И.И.', actions: 324, lastLogin: 'Сегодня' },
                    { name: 'Петрова А.С.', actions: 298, lastLogin: 'Вчера' },
                    { name: 'Сидоров В.П.', actions: 256, lastLogin: '2 дня назад' },
                    { name: 'Кузнецов Д.А.', actions: 198, lastLogin: 'Сегодня' },
                    { name: 'Смирнова О.И.', actions: 176, lastLogin: '3 дня назад' }
                ]
            }
        },
        security: {
            title: 'Отчет по безопасности',
            description: 'Анализ угроз и уязвимостей',
            data: {
                riskDistribution: [
                    { name: 'Высокий риск', value: 12, color: '#ef4444' },
                    { name: 'Средний риск', value: 34, color: '#f59e0b' },
                    { name: 'Низкий риск', value: 89, color: '#10b981' },
                    { name: 'Информационный', value: 21, color: '#3b82f6' }
                ],
                auditEvents: [
                    { date: '01.01', value: 45 },
                    { date: '08.01', value: 52 },
                    { date: '15.01', value: 48 },
                    { date: '22.01', value: 56 },
                    { date: '29.01', value: 62 }
                ],
                complianceStatus: {
                    iso27001: 85,
                    gdpr: 92,
                    sox: 78,
                    pciDss: 65
                }
            }
        },
        performance: {
            title: 'Производительность системы',
            description: 'Метрики скорости и доступности',
            data: {
                responseTimes: [
                    { hour: '00:00', value: 142 },
                    { hour: '04:00', value: 138 },
                    { hour: '08:00', value: 156 },
                    { hour: '12:00', value: 234 },
                    { hour: '16:00', value: 198 },
                    { hour: '20:00', value: 167 }
                ],
                uptime: 99.8,
                avgResponseTime: 172,
                peakLoad: 2450,
                errors: {
                    '400': 12,
                    '401': 5,
                    '404': 8,
                    '500': 2
                }
            }
        }
    };

    const loadReportData = useCallback(async () => {
        setLoading(true);
        // Имитация загрузки данных
        setTimeout(() => {
            const data = mockReportData[activeReport] || mockReportData.overview;
            setReportData(data);
            setLoading(false);
        }, 500);
    }, [activeReport]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData, dateRange]);

    const exportReport = (format) => {
        if (!reportData) return;

        const filename = `report_${activeReport}_${new Date().toISOString().split('T')[0]}`;

        if (format === 'pdf') {
            alert(`Отчет ${filename} готовится к экспорту в PDF`);
            // Здесь будет логика генерации PDF
        } else if (format === 'excel') {
            alert(`Отчет ${filename} готовится к экспорту в Excel`);
            // Здесь будет логика генерации Excel
        } else {
            // CSV экспорт
            const headers = ['Показатель', 'Значение'];
            const data = Object.entries(reportData.data).map(([key, value]) =>
                [key, typeof value === 'object' ? JSON.stringify(value) : value]
            );

            const csvContent = [
                headers.join(','),
                ...data.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.csv`;
            link.click();
        }
    };

    const printReport = () => {
        window.print();
    };

    const renderOverviewReport = () => {
        if (!reportData || !reportData.data) return null;

        return (
            <div className="overview-report">
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div className="stat-card">
                        <h4>Всего активов</h4>
                        <p className="number">{reportData.data.totalAssets || 0}</p>
                        <span className="stat-trend">+12 за месяц</span>
                    </div>
                    <div className="stat-card">
                        <h4>Пользователей</h4>
                        <p className="number">{reportData.data.totalUsers || 0}</p>
                        <span className="stat-trend">+3 новых</span>
                    </div>
                    <div className="stat-card">
                        <h4>На проверке</h4>
                        <p className="number">{reportData.data.pendingReviews || 0}</p>
                        <span className="stat-trend warning">Требуют внимания</span>
                    </div>
                    <div className="stat-card">
                        <h4>Высокий риск</h4>
                        <p className="number">{reportData.data.highRiskAssets || 0}</p>
                        <span className="stat-trend warning">Критические</span>
                    </div>
                </div>

                <div className="charts-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '30px',
                    marginTop: '30px'
                }}>
                    <div className="chart-card">
                        <h4>Распределение по категориям</h4>
                        <SimplePieChart data={reportData.data.categoryDistribution} />
                    </div>

                    <div className="chart-card">
                        <h4>Средние значения CIA</h4>
                        <SimpleBarChart data={reportData.data.ciaDistribution} />
                    </div>
                </div>
            </div>
        );
    };

    const renderAssetsReport = () => {
        if (!reportData || !reportData.data) return null;

        return (
            <div className="assets-report">
                <div className="charts-row" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '30px',
                    marginBottom: '30px'
                }}>
                    <div className="chart-card">
                        <h4>Активы по категориям</h4>
                        <SimpleBarChart data={reportData.data.byCategory} />
                    </div>

                    <div className="chart-card">
                        <h4>Статус активов</h4>
                        <SimplePieChart data={reportData.data.byStatus} />
                    </div>
                </div>

                <div className="growth-chart">
                    <h4>Рост количества активов</h4>
                    <div className="chart-card">
                        <SimpleLineChart data={reportData.data.growthTrend} />
                    </div>
                </div>
            </div>
        );
    };

    const renderUsersReport = () => {
        if (!reportData || !reportData.data) return null;

        const topUsers = reportData.data.topUsers || [];
        const dailyActivity = reportData.data.dailyActivity || [];
        const activityByRole = reportData.data.activityByRole || [];

        return (
            <div className="users-report">
                <div className="top-section" style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '30px',
                    marginBottom: '30px'
                }}>
                    <div className="chart-card">
                        <h4>Активность по дням недели</h4>
                        <SimpleBarChart
                            data={dailyActivity.map(item => ({
                                name: item.day,
                                value: item.logins || 0,
                                color: '#8884d8'
                            }))}
                        />
                    </div>

                    <div className="top-users">
                        <h4>Самые активные пользователи</h4>
                        <div className="users-list">
                            {topUsers.map((user, index) => (
                                <div key={user.name || index} className="user-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'var(--bg-light)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '8px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{index + 1}. {user.name || 'Неизвестный'}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                            {user.actions || 0} действий
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                        {user.lastLogin || 'Не входил'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="role-activity">
                    <h4>Активность по ролям</h4>
                    <div className="chart-card">
                        <SimpleBarChart
                            data={activityByRole.map(item => ({
                                name: item.name,
                                value: item.actions || 0,
                                color: '#82ca9d'
                            }))}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderReportContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="loading-spinner"></div>
                    <p>Загрузка отчета...</p>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    <div>Нет данных для отображения</div>
                </div>
            );
        }

        switch (activeReport) {
            case 'overview':
                return renderOverviewReport();
            case 'assets':
                return renderAssetsReport();
            case 'users':
                return renderUsersReport();
            case 'security':
                return (
                    <div className="security-report">
                        <div className="compliance-cards" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {Object.entries(reportData.data.complianceStatus || {}).map(([standard, score]) => (
                                <div key={standard} className="compliance-card" style={{
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    textAlign: 'center'
                                }}>
                                    <h5>{standard.toUpperCase()}</h5>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>
                                        {score}%
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        background: '#e5e7eb',
                                        borderRadius: '4px',
                                        marginTop: '10px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${score}%`,
                                            height: '100%',
                                            background: score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#ef4444'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="chart-card">
                            <h4>Распределение рисков</h4>
                            <SimplePieChart data={reportData.data.riskDistribution} />
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="performance-report">
                        <div className="performance-stats" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            <div className="stat-card">
                                <h4>Доступность</h4>
                                <p className="number" style={{ color: '#10b981' }}>
                                    {reportData.data.uptime || 0}%
                                </p>
                            </div>
                            <div className="stat-card">
                                <h4>Среднее время ответа</h4>
                                <p className="number">{reportData.data.avgResponseTime || 0}мс</p>
                            </div>
                            <div className="stat-card">
                                <h4>Пиковая нагрузка</h4>
                                <p className="number">{reportData.data.peakLoad || 0} зап/сек</p>
                            </div>
                            <div className="stat-card">
                                <h4>Ошибки</h4>
                                <p className="number">
                                    {Object.values(reportData.data.errors || {}).reduce((a, b) => a + b, 0)}
                                </p>
                            </div>
                        </div>

                        <div className="chart-card">
                            <h4>Время ответа системы</h4>
                            <SimpleLineChart data={reportData.data.responseTimes} />
                        </div>
                    </div>
                );
            default:
                return (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                        <div>Выбранный отчет недоступен</div>
                    </div>
                );
        }
    };

    const reportTypes = [
        { id: 'overview', label: 'Обзор', icon: <Assessment /> },
        { id: 'assets', label: 'Активы', icon: <BarChartIcon /> },
        { id: 'users', label: 'Пользователи', icon: <PieChartIcon /> },
        { id: 'security', label: 'Безопасность', icon: <Timeline /> },
        { id: 'performance', label: 'Производительность', icon: <FileCopy /> }
    ];

    return (
        <div className="reports-page">
            <div className="content-header">
                <h1>Отчеты и аналитика</h1>
                <div className="header-actions">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            className="input select"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="week">За неделю</option>
                            <option value="month">За месяц</option>
                            <option value="quarter">За квартал</option>
                            <option value="year">За год</option>
                        </select>
                        <button className="btn btn-secondary" onClick={printReport}>
                            <Print /> Печать
                        </button>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                    const menu = e.currentTarget.nextElementSibling;
                                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                }}
                            >
                                <Download /> Экспорт
                            </button>
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                minWidth: '150px',
                                zIndex: 1000,
                                marginTop: '4px',
                                display: 'none'
                            }} className="dropdown-menu">
                                <button
                                    onClick={() => {
                                        exportReport('pdf');
                                        document.querySelector('.dropdown-menu').style.display = 'none';
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--text-dark)',
                                        transition: 'background-color var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-100)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    PDF
                                </button>
                                <button
                                    onClick={() => {
                                        exportReport('excel');
                                        document.querySelector('.dropdown-menu').style.display = 'none';
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--text-dark)',
                                        transition: 'background-color var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-100)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={() => {
                                        exportReport('csv');
                                        document.querySelector('.dropdown-menu').style.display = 'none';
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--text-dark)',
                                        transition: 'background-color var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-100)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-body">
                        {/* Вкладки отчетов */}
                        <div className="report-tabs" style={{
                            display: 'flex',
                            gap: '8px',
                            borderBottom: '2px solid var(--border)',
                            paddingBottom: '12px',
                            marginBottom: '24px',
                            flexWrap: 'wrap'
                        }}>
                            {reportTypes.map(report => (
                                <button
                                    key={report.id}
                                    className={`tab-btn ${activeReport === report.id ? 'active' : ''}`}
                                    onClick={() => setActiveReport(report.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: activeReport === report.id ? 'white' : 'var(--text-light)',
                                        background: activeReport === report.id ? 'var(--primary)' : 'none',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                >
                                    {report.icon}
                                    {report.label}
                                </button>
                            ))}
                        </div>

                        {/* Заголовок отчета */}
                        {reportData && (
                            <div className="report-header" style={{
                                marginBottom: '30px',
                                padding: '20px',
                                background: 'linear-gradient(135deg, var(--primary-50), white)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)'
                            }}>
                                <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-dark)', fontSize: '24px' }}>
                                    {reportData.title || 'Отчет'}
                                </h2>
                                <p className="text-light">{reportData.description || 'Описание отчета'}</p>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '16px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid var(--border)'
                                }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                        Дата формирования: {new Date().toLocaleDateString('ru-RU')}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                        Период: {
                                        dateRange === 'week' ? 'неделя' :
                                            dateRange === 'month' ? 'месяц' :
                                                dateRange === 'quarter' ? 'квартал' : 'год'
                                    }
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Контент отчета */}
                        <div className="report-content">
                            {renderReportContent()}
                        </div>

                        {/* Кнопки действий */}
                        <div className="report-actions" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '40px',
                            paddingTop: '20px',
                            borderTop: '1px solid var(--border)'
                        }}>
                            <div>
                                <button className="btn btn-secondary">
                                    <FilterList /> Настроить фильтры
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" onClick={() => alert('Расписание настроек')}>
                                    <CalendarToday /> Запланировать
                                </button>
                                <button className="btn btn-primary" onClick={() => exportReport('pdf')}>
                                    <Download /> Скачать отчет
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Блок с предупреждениями */}
                <div className="report-alerts mt-6">
                    <div className="card">
                        <div className="card-body">
                            <h3>Рекомендации по отчету</h3>
                            <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
                                <li>Обратите внимание на активы с высоким уровнем риска</li>
                                <li>Проверьте своевременность обновления активов</li>
                                <li>Проанализируйте активность пользователей в системе</li>
                                <li>Обратите внимание на соответствие стандартам безопасности</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;