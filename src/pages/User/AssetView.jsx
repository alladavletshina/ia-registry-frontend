// src/pages/User/AssetView.jsx - ЗАВЕРШЕННАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowBack,
    Download,
    Edit,
    History,
    Security,
    Warning,
    CheckCircle,
    Person,
    CalendarToday,
    Category
} from '@mui/icons-material';
import { mockAssetsAPI } from '../../services/mockApi';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/prototype.css';

const AssetView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestData, setRequestData] = useState({
        type: 'update',
        priority: 'medium',
        description: '',
        changes: {}
    });

    useEffect(() => {
        loadAsset();
    }, [id]);

    const loadAsset = async () => {
        setLoading(true);
        try {
            const response = await mockAssetsAPI.getById(id);
            // Добавляем моковые данные для демонстрации
            const enrichedAsset = {
                ...response.data,
                createdBy: 'Администратор Системы',
                createdAt: '2024-01-15',
                lastModified: '2024-01-30',
                lastModifiedBy: 'Иванов И.И.',
                tags: ['важный', 'база_данных', 'клиенты'],
                dependencies: ['CRM система', 'Система отчетности'],
                storageLocation: 'Сервер БД-01',
                backupSchedule: 'Ежедневно в 23:00',
                retentionPeriod: '5 лет',
                compliance: ['GDPR', 'ФЗ-152'],
                accessControl: 'Ролевая модель',
                riskLevel: 'medium',
                riskAssessment: '2024-02-15',
                version: '2.1',
                costEstimate: 'Высокая'
            };
            setAsset(enrichedAsset);
        } catch (error) {
            console.error('Ошибка загрузки актива:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCIAExplanation = (type, level) => {
        const explanations = {
            confidentiality: {
                low: 'Общедоступная информация',
                medium: 'Для внутреннего использования',
                high: 'Конфиденциальная информация',
                critical: 'Строго конфиденциально'
            },
            integrity: {
                low: 'Не критично к изменениям',
                medium: 'Требует проверки изменений',
                high: 'Изменения должны быть авторизованы',
                critical: 'Изменения запрещены'
            },
            availability: {
                low: 'Доступность не критична',
                medium: 'Требуется высокая доступность',
                high: 'Критически важный ресурс',
                critical: 'Требуется 99.99% доступности'
            }
        };
        return explanations[type]?.[level] || 'Не определено';
    };

    const handleRequestChange = () => {
        if (!requestData.description.trim()) {
            alert('Пожалуйста, укажите описание запроса');
            return;
        }

        console.log('Запрос на изменение:', {
            assetId: id,
            assetName: asset.name,
            ...requestData
        });

        alert('Запрос на изменение отправлен администратору. Вы получите уведомление о статусе.');
        setShowRequestModal(false);
        setRequestData({
            type: 'update',
            priority: 'medium',
            description: '',
            changes: {}
        });
    };

    const exportAssetInfo = () => {
        const content = `
Информационный актив: ${asset.name}
ID: ${asset.id}
Категория: ${asset.category}
Владелец: ${asset.owner}
Статус: ${asset.status}
Последняя проверка: ${asset.lastReview}

Оценка CIA:
- Конфиденциальность: ${asset.confidentiality} (${getCIAExplanation('confidentiality', asset.confidentiality)})
- Целостность: ${asset.integrity} (${getCIAExplanation('integrity', asset.integrity)})
- Доступность: ${asset.availability} (${getCIAExplanation('availability', asset.availability)})

Описание:
${asset.description}

Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asset_${asset.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка информации об активе...</p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="empty-state">
                <Warning style={{ fontSize: 48, color: '#94a3b8' }} />
                <h3>Актив не найден</h3>
                <p>Запрашиваемый актив не существует или у вас нет к нему доступа.</p>
                <button className="btn btn-primary" onClick={() => navigate('/user/my-assets')}>
                    <ArrowBack /> Вернуться к списку активов
                </button>
            </div>
        );
    }

    return (
        <div className="asset-view">
            {/* Шапка */}
            <div className="asset-header">
                <div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/user/my-assets')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                    >
                        <ArrowBack /> Назад к списку
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1>{asset.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                                <StatusBadge status={asset.status} />
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)' }}>
                                    <Category fontSize="small" /> {asset.category}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)' }}>
                                    <Person fontSize="small" /> {asset.owner}
                                </span>
                            </div>
                        </div>
                        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={exportAssetInfo}>
                                <Download /> Экспорт
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowRequestModal(true)}
                            >
                                <Edit /> Запросить изменения
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Вкладки */}
            <div className="asset-tabs" style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '2px solid var(--border)',
                paddingBottom: '12px',
                marginBottom: '24px'
            }}>
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📋 Обзор
                </button>
                <button
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    📊 Детали
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    🔐 Безопасность
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📜 История
                </button>
            </div>

            {/* Контент вкладок */}
            <div className="asset-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="detail-section">
                            <h3>📝 Описание актива</h3>
                            <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-dark)' }}>
                                {asset.description}
                            </p>
                        </div>

                        <div className="detail-section">
                            <h3>🎯 Оценка CIA</h3>
                            <div className="cia-display">
                                <div className="cia-item">
                                    <span className="label">
                                        <Security style={{ marginRight: '8px' }} />
                                        Конфиденциальность
                                    </span>
                                    <span className={`value level-${asset.confidentiality}`}>
                                        {asset.confidentiality}
                                    </span>
                                    <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                                        {getCIAExplanation('confidentiality', asset.confidentiality)}
                                    </p>
                                </div>
                                <div className="cia-item">
                                    <span className="label">
                                        <CheckCircle style={{ marginRight: '8px' }} />
                                        Целостность
                                    </span>
                                    <span className={`value level-${asset.integrity}`}>
                                        {asset.integrity}
                                    </span>
                                    <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                                        {getCIAExplanation('integrity', asset.integrity)}
                                    </p>
                                </div>
                                <div className="cia-item">
                                    <span className="label">
                                        <Warning style={{ marginRight: '8px' }} />
                                        Доступность
                                    </span>
                                    <span className={`value level-${asset.availability}`}>
                                        {asset.availability}
                                    </span>
                                    <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                                        {getCIAExplanation('availability', asset.availability)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>🏷️ Теги и метаданные</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                                {asset.tags?.map((tag, index) => (
                                    <span key={index} style={{
                                        padding: '6px 12px',
                                        background: 'var(--bg-light)',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '13px',
                                        color: 'var(--text-dark)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="details-tab">
                        <div className="detail-section">
                            <h3>📊 Технические характеристики</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <strong>Версия:</strong>
                                    <span>{asset.version}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Место хранения:</strong>
                                    <span>{asset.storageLocation}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Расписание резервного копирования:</strong>
                                    <span>{asset.backupSchedule}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Срок хранения:</strong>
                                    <span>{asset.retentionPeriod}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Оценка стоимости:</strong>
                                    <span>{asset.costEstimate}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Уровень риска:</strong>
                                    <span className={`badge badge-${asset.riskLevel === 'high' ? 'danger' : asset.riskLevel === 'medium' ? 'warning' : 'success'}`}>
                                        {asset.riskLevel === 'high' ? 'Высокий' : asset.riskLevel === 'medium' ? 'Средний' : 'Низкий'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>🔗 Зависимости</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                {asset.dependencies?.map((dep, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'var(--bg-light)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            background: 'var(--primary)',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '12px'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <span>{dep}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="security-tab">
                        <div className="detail-section">
                            <h3>🛡️ Соответствие требованиям</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                                {asset.compliance?.map((standard, index) => (
                                    <div key={index} style={{
                                        padding: '12px 20px',
                                        background: 'linear-gradient(135deg, var(--primary-50), white)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        textAlign: 'center',
                                        minWidth: '120px'
                                    }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{standard}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                                            Соответствует
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>🔐 Контроль доступа</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <strong>Модель доступа:</strong>
                                    <span>{asset.accessControl}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Дата оценки рисков:</strong>
                                    <span>{asset.riskAssessment}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>📋 Рекомендации по безопасности</h3>
                            <div style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, var(--warning-50), white)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--warning-100)'
                            }}>
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    <li>Регулярно обновляйте пароли доступа</li>
                                    <li>Проводите аудит доступа каждые 3 месяца</li>
                                    <li>Обеспечьте резервное копирование согласно расписанию</li>
                                    <li>Отслеживайте попытки несанкционированного доступа</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-tab">
                        <div className="detail-section">
                            <h3>📜 История изменений</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                                <div style={{
                                    padding: '16px',
                                    background: 'var(--bg-light)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Последнее изменение</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                                Изменено: {asset.lastModifiedBy}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                                <CalendarToday fontSize="small" /> {asset.lastModified}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                                Обновление статуса
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '16px',
                                    background: 'var(--bg-light)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Создание актива</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                                Создано: {asset.createdBy}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                                <CalendarToday fontSize="small" /> {asset.createdAt}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                                Первоначальное создание
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>📅 Календарь проверок</h3>
                            <div style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, var(--primary-50), white)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Последняя проверка</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                            {asset.lastReview}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Следующая проверка</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                            2024-03-15 (через 15 дней)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Информационная панель */}
            <div className="asset-info-panel" style={{
                marginTop: '32px',
                padding: '20px',
                background: 'var(--bg-light)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <h4 style={{ marginBottom: '8px' }}>🕒 Актуальность</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                            Данные актуальны на {new Date().toLocaleDateString('ru-RU')}.
                            Следующее обновление запланировано на 2024-03-01.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '8px' }}>👤 Ответственный</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                            {asset.owner}
                            <br />
                            <span style={{ fontSize: '12px' }}>Владелец актива</span>
                        </p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '8px' }}>📞 Контакты</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                            По вопросам изменения актива обращайтесь к администратору системы или владельцу актива.
                        </p>
                    </div>
                </div>
            </div>

            {/* Модальное окно запроса изменений */}
            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Запрос на изменение актива</h3>
                        <p style={{ marginBottom: '24px', color: 'var(--text-light)' }}>
                            Отправьте запрос на изменение актива "{asset.name}". Администратор рассмотрит ваш запрос в течение 3 рабочих дней.
                        </p>

                        <div className="form-group">
                            <label>Тип запроса</label>
                            <select
                                className="input select"
                                value={requestData.type}
                                onChange={(e) => setRequestData({...requestData, type: e.target.value})}
                            >
                                <option value="update">Обновление информации</option>
                                <option value="correction">Исправление ошибки</option>
                                <option value="status_change">Изменение статуса</option>
                                <option value="other">Другое</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Приоритет</label>
                            <select
                                className="input select"
                                value={requestData.priority}
                                onChange={(e) => setRequestData({...requestData, priority: e.target.value})}
                            >
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                                <option value="urgent">Срочный</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Описание изменений *</label>
                            <textarea
                                className="input"
                                rows={4}
                                value={requestData.description}
                                onChange={(e) => setRequestData({...requestData, description: e.target.value})}
                                placeholder="Подробно опишите необходимые изменения..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowRequestModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleRequestChange}
                                disabled={!requestData.description.trim()}
                            >
                                Отправить запрос
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetView;