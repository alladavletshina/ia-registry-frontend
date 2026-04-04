import React, { useState, useEffect, useCallback } from 'react';
import {
    Print,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Timeline,
    Assessment
} from '@mui/icons-material';
import reportApi from '../../services/reportApi';
import '../../styles/prototype.css';

// ========== УЛУЧШЕННЫЕ КОМПОНЕНТЫ ГРАФИКОВ ==========

const SimpleBarChart = ({ data, width = 700, height = 400 }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>Нет данных</div>
            </div>
        );
    }
    const maxValue = Math.max(...data.map(item => item.value || 0), 1);
    const chartHeight = height - 100; // увеличили отступ снизу
    const bottomMargin = 80;
    const leftMargin = 50;

    // Увеличиваем ширину столбцов
    const barWidth = Math.min(100, (width - leftMargin - 20) / data.length * 0.8);
    const barSpacing = Math.min(20, (width - leftMargin - 20) / data.length * 0.2);
    const startX = leftMargin;

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ width: Math.max(width, leftMargin + data.length * (barWidth + barSpacing) + 20), height: height, position: 'relative' }}>
                {/* Ось Y */}
                {[...Array(5)].map((_, i) => {
                    const val = (maxValue / 4) * i;
                    const y = chartHeight - (val / maxValue) * chartHeight + 10;
                    return (
                        <div key={i} style={{ position: 'absolute', left: 5, top: y, fontSize: 11, color: '#64748b' }}>
                            {Math.round(val)}
                        </div>
                    );
                })}
                {/* Столбцы */}
                {data.map((item, idx) => {
                    const barHeight = (item.value / maxValue) * chartHeight;
                    const x = startX + idx * (barWidth + barSpacing);
                    return (
                        <div key={idx} style={{ position: 'absolute', bottom: bottomMargin, left: x, width: barWidth, textAlign: 'center' }}>
                            <div style={{ height: barHeight, backgroundColor: item.color || '#3b82f6', width: '100%', borderRadius: '4px 4px 0 0' }} />
                            {/* Контейнер подписи с фиксированной высотой */}
                            <div style={{
                                marginTop: 8,
                                fontSize: 11,
                                color: '#333',
                                wordBreak: 'break-word',
                                maxWidth: barWidth,
                                minHeight: 40,    // фиксированная минимальная высота для всех подписей
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.name}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>{item.value}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SimplePieChart = ({ data, width = 400, height = 400 }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>Нет данных</div>
            </div>
        );
    }
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    if (total === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>Нет данных для отображения</div>
            </div>
        );
    }

    const pieSize = 200;
    let currentAngle = 0;

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: pieSize, height: pieSize }}>
                <svg width={pieSize} height={pieSize}>
                    {data.map((item, index) => {
                        const value = item.value || 0;
                        const angle = (value / total) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;
                        const x1 = pieSize/2 + (pieSize/2 - 10) * Math.cos((startAngle - 90) * Math.PI / 180);
                        const y1 = pieSize/2 + (pieSize/2 - 10) * Math.sin((startAngle - 90) * Math.PI / 180);
                        const x2 = pieSize/2 + (pieSize/2 - 10) * Math.cos((startAngle + angle - 90) * Math.PI / 180);
                        const y2 = pieSize/2 + (pieSize/2 - 10) * Math.sin((startAngle + angle - 90) * Math.PI / 180);
                        const largeArc = angle > 180 ? 1 : 0;
                        return (
                            <path
                                key={index}
                                d={`M ${pieSize/2} ${pieSize/2} L ${x1} ${y1} A ${pieSize/2 - 10} ${pieSize/2 - 10} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={item.color || `hsl(${(index * 60) % 360}, 70%, 60%)`}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    })}
                    <circle cx={pieSize/2} cy={pieSize/2} r={pieSize/2 - 30} fill="white" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{total}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Всего</div>
                </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
                {data.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ width: 16, height: 16, backgroundColor: item.color || `hsl(${(index * 60) % 360}, 70%, 60%)`, marginRight: 8, borderRadius: 2 }} />
                        <span style={{ fontSize: 13 }}>{item.name}: </span>
                        <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>{item.value}</span>
                        <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12 }}>({((item.value / total) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimpleLineChart = ({ data, width = 550, height = 350 }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>Нет данных</div>
            </div>
        );
    }
    const values = data.map(item => item.value || 0);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    const leftMargin = 40;
    const rightMargin = 20;
    const topMargin = 20;
    const bottomMargin = 60;
    const graphWidth = width - leftMargin - rightMargin;
    const graphHeight = height - topMargin - bottomMargin;
    const points = data.map((item, index) => {
        const x = leftMargin + (index / (data.length - 1)) * graphWidth;
        const y = topMargin + graphHeight - ((item.value - minValue) / range) * graphHeight;
        return `${x},${y}`;
    }).join(' ');
    return (
        <div style={{ width, overflowX: 'auto' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = topMargin + graphHeight * (1 - ratio);
                    const val = minValue + range * ratio;
                    return (
                        <g key={i}>
                            <line x1={leftMargin} y1={y} x2={width - rightMargin} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                            <text x={leftMargin - 5} y={y + 4} fill="#64748b" fontSize="11" textAnchor="end">{Math.round(val)}</text>
                        </g>
                    );
                })}
                <line x1={leftMargin} y1={topMargin + graphHeight} x2={width - rightMargin} y2={topMargin + graphHeight} stroke="#94a3b8" strokeWidth="2" />
                <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="3" />
                {data.map((item, index) => {
                    const x = leftMargin + (index / (data.length - 1)) * graphWidth;
                    const y = topMargin + graphHeight - ((item.value - minValue) / range) * graphHeight;
                    const label = item.label || item.month || `Точка ${index + 1}`;
                    return (
                        <g key={index}>
                            <circle cx={x} cy={y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                            <text x={x} y={topMargin + graphHeight + 20} transform={`rotate(-45, ${x}, ${topMargin + graphHeight + 20})`} fill="#64748b" fontSize="11" textAnchor="start">
                                {label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// ========== ОСНОВНОЙ КОМПОНЕНТ ==========

const ReportsPage = () => {
    const [activeReport, setActiveReport] = useState('overview');
    const [dateRange, setDateRange] = useState('month');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const loadReportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            switch (activeReport) {
                case 'overview':
                    data = await reportApi.getOverviewReport(dateRange);
                    break;
                case 'assets':
                    data = await reportApi.getAssetsReport(dateRange);
                    break;
                case 'users':
                    data = await reportApi.getUsersReport(dateRange);
                    break;
                case 'security':
                    data = await reportApi.getSecurityReport(dateRange);
                    break;
                default:
                    data = null;
            }
            setReportData(data);
        } catch (err) {
            console.error('Failed to load report:', err);
            setError('Не удалось загрузить отчёт. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    }, [activeReport, dateRange]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    const printReport = () => {
        window.print();
    };

    const renderOverviewReport = () => {
        if (!reportData) return null;
        const { totalAssets, totalUsers, pendingReviews, highRiskAssets, categoryDistribution, ciaDistribution } = reportData;
        return (
            <div className="overview-report">
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="stat-card"><h4>Всего активов</h4><p className="number">{totalAssets || 0}</p></div>
                    <div className="stat-card"><h4>Пользователей</h4><p className="number">{totalUsers || 0}</p></div>
                    <div className="stat-card"><h4>На проверке</h4><p className="number">{pendingReviews || 0}</p></div>
                    <div className="stat-card"><h4>Высокий риск</h4><p className="number">{highRiskAssets || 0}</p></div>
                </div>
                <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
                    <div className="chart-card"><h4>Распределение по группам</h4><SimplePieChart data={categoryDistribution || []} /></div>
                    <div className="chart-card"><h4>Средние значения CIA</h4><SimpleBarChart data={ciaDistribution || []} /></div>
                </div>
            </div>
        );
    };

    const renderAssetsReport = () => {
        if (!reportData) return null;
        const { byCategory, byStatus, byConfidentiality, growthTrend } = reportData;
        return (
            <div className="assets-report" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Первая строка: Рост активов + Уровень конфиденциальности (рядом) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                    <div className="chart-card" style={{ flex: '1 1 400px' }}>
                        <h4>Рост количества активов</h4>
                        <SimpleLineChart data={growthTrend || []} width={500} height={350} />
                    </div>
                    <div className="chart-card" style={{ flex: '1 1 400px' }}>
                        <h4>Уровень конфиденциальности</h4>
                        <SimpleBarChart data={byConfidentiality || []} width={500} height={350} />
                    </div>
                </div>

                {/* Вторая строка: Активы по группам + Статус активов (рядом) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                    <div className="chart-card" style={{ flex: '1 1 400px' }}>
                        <h4>Активы по группам</h4>
                        <SimpleBarChart data={byCategory || []} width={500} height={350} />
                    </div>
                    <div className="chart-card" style={{ flex: '1 1 400px' }}>
                        <h4>Статус активов</h4>
                        <SimplePieChart data={byStatus || []} width={350} height={350} />
                    </div>
                </div>
            </div>
        );
    };

    const renderUsersReport = () => {
        if (!reportData) return null;
        const { activityByRole, dailyActivity, topUsers } = reportData;
        return (
            <div className="users-report">
                <div className="top-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                    <div className="chart-card">
                        <h4>Активность по дням недели</h4>
                        <SimpleBarChart data={(dailyActivity || []).map(item => ({ name: item.day, value: item.actions, color: '#8884d8' }))} />
                    </div>
                    <div className="top-users">
                        <h4>Самые активные пользователи</h4>
                        <div className="users-list">
                            {(topUsers || []).map((user, index) => (
                                <div key={user.name || index} className="user-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 12px',
                                    background: 'var(--bg-light)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ fontWeight: 'bold' }}>{index + 1}. {user.name || 'Неизвестный'}</div>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#3b82f6',
                                        background: '#dbeafe',
                                        padding: '2px 8px',
                                        borderRadius: '20px'
                                    }}>
                                        {user.actions || 0} действий
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="role-activity">
                    <h4>Активность по ролям</h4>
                    <div className="chart-card">
                        <SimpleBarChart data={(activityByRole || []).map(item => ({ name: item.name, value: item.actions, color: '#82ca9d' }))} />
                    </div>
                </div>
            </div>
        );
    };

    const renderSecurityReport = () => {
        if (!reportData) return null;
        const { riskDistribution, auditEvents, complianceStatus } = reportData;

        const totalEvents = riskDistribution ? riskDistribution.reduce((sum, item) => sum + (item.value || 0), 0) : 0;

        return (
            <div className="security-report">
                {complianceStatus && Object.keys(complianceStatus).length > 0 && (
                    <div className="compliance-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        {Object.entries(complianceStatus).map(([standard, score]) => (
                            <div key={standard} className="compliance-card" style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <h5>{standard.toUpperCase()}</h5>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>{score}%</div>
                                <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${score}%`, height: '100%', background: score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="chart-card">
                    <h4>Распределение рисков по аудиту действий</h4>
                    <SimplePieChart data={riskDistribution || []} />
                    {totalEvents > 0 && (
                        <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#334155' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 Как читать график:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px', marginRight: '6px' }}></span> Высокий риск (DANGER)</div>
                                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px', marginRight: '6px' }}></span> Средний риск (WARNING)</div>
                                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px', marginRight: '6px' }}></span> Низкий риск (INFO)</div>
                                <div><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px', marginRight: '6px' }}></span> Информационный (SUCCESS)</div>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                                Всего событий аудита за период: <strong>{totalEvents}</strong>
                            </div>
                        </div>
                    )}
                </div>
                {auditEvents && auditEvents.length > 0 && (
                    <div className="chart-card" style={{ marginTop: '30px' }}>
                        <h4>Динамика событий аудита</h4>
                        <SimpleLineChart data={auditEvents.map(e => ({ month: e.date, value: e.value }))} />
                    </div>
                )}
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
        if (error) {
            return (
                <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={loadReportData}>Повторить</button>
                </div>
            );
        }
        if (!reportData) return null;
        switch (activeReport) {
            case 'overview': return renderOverviewReport();
            case 'assets': return renderAssetsReport();
            case 'users': return renderUsersReport();
            case 'security': return renderSecurityReport();
            default: return <div>Неизвестный отчёт</div>;
        }
    };

    const reportTypes = [
        { id: 'overview', label: 'Обзор', icon: <Assessment /> },
        { id: 'assets', label: 'Активы', icon: <BarChartIcon /> },
        { id: 'users', label: 'Пользователи', icon: <PieChartIcon /> },
        { id: 'security', label: 'Безопасность', icon: <Timeline /> }
    ];

    return (
        <div className="reports-page">
            <div className="content-header">
                <h1>Отчеты и аналитика</h1>
                <div className="header-actions">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select className="input select" value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ width: '150px' }}>
                            <option value="week">За неделю</option>
                            <option value="month">За месяц</option>
                            <option value="quarter">За квартал</option>
                            <option value="year">За год</option>
                        </select>
                        <button className="btn btn-secondary" onClick={printReport}><Print /> Печать</button>
                    </div>
                </div>
            </div>
            <div className="main-content">
                <div className="card">
                    <div className="card-body">
                        <div className="report-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            {reportTypes.map(report => (
                                <button key={report.id} className={`tab-btn ${activeReport === report.id ? 'active' : ''}`} onClick={() => setActiveReport(report.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: activeReport === report.id ? 'white' : 'var(--text-light)', background: activeReport === report.id ? 'var(--primary)' : 'none', transition: 'all var(--transition-fast)' }}>
                                    {report.icon}
                                    {report.label}
                                </button>
                            ))}
                        </div>
                        <div className="report-content">{renderReportContent()}</div>
                    </div>
                </div>
                <div className="report-alerts mt-6">
                    <div className="card">
                        <div className="card-body">
                            <h3>Рекомендации по отчету</h3>
                            <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
                                <li>Обратите внимание на активы с высоким уровнем риска</li>
                                <li>Проверьте своевременность обновления активов</li>
                                <li>Проанализируйте активность пользователей в системе</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;