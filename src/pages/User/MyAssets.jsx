import React, { useState, useEffect } from 'react';
import assetApi from '../../services/assetApi';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import {
    Computer,
    Storage,
    Description,
    Security,
    AttachMoney,
    LocationOn,
    Person,
    Update,
    Visibility
} from '@mui/icons-material';
import '../../styles/prototype.css';

const MyAssets = () => {
    const [myAssets, setMyAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchMyAssets();
    }, []);

    const fetchMyAssets = async () => {
        setLoading(true);
        try {
            const data = await assetApi.getMyAssets();
            setMyAssets(data);
        } catch (error) {
            console.error('Ошибка загрузки активов пользователя:', error);
        } finally {
            setLoading(false);
        }
    };

    // Функция для определения иконки категории
    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'database': return <Storage />;
            case 'software': return <Computer />;
            case 'documentation': return <Description />;
            default: return <Computer />;
        }
    };

    // Определение цвета риска
    const getRiskColor = (risk) => {
        if (!risk) return 'var(--text-light)';
        if (risk > 1000000) return '#ef4444';
        if (risk > 100000) return '#f59e0b';
        return '#10b981';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка ваших активов...</p>
            </div>
        );
    }

    return (
        <div className="user-assets">
            <div className="content-header">
                <h1>Мои информационные активы</h1>
                <p className="text-light">Активы, за которые вы отвечаете как владелец</p>
            </div>

            <div className="main-content">
                {myAssets.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon">📭</div>
                        <h3>У вас пока нет активов</h3>
                        <p>Обратитесь к администратору, чтобы вам назначили активы.</p>
                    </div>
                ) : (
                    <div className="assets-grid-modern">
                        {myAssets.map(asset => (
                            <div key={asset.id} className="asset-card-modern">
                                {/* Шапка карточки */}
                                <div className="asset-card-header">
                                    <div className="asset-icon">
                                        {getCategoryIcon(asset.category)}
                                    </div>
                                    <div className="asset-title">
                                        <h3>{asset.name}</h3>
                                        <StatusBadge status={asset.status?.toLowerCase()} size="small" />
                                    </div>
                                </div>

                                {/* Основная информация */}
                                <div className="asset-card-body">
                                    <p className="asset-description">
                                        {asset.description || 'Описание отсутствует'}
                                    </p>

                                    <div className="asset-details-grid">
                                        <div className="detail-item">
                                            <Person className="detail-icon" />
                                            <span>Владелец: <strong>{asset.ownerId || 'Не указан'}</strong></span>
                                        </div>
                                        <div className="detail-item">
                                            <LocationOn className="detail-icon" />
                                            <span>Расположение: {asset.location || 'Не указано'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <AttachMoney className="detail-icon" />
                                            <span>Стоимость: {asset.value ? asset.value.toLocaleString() + ' руб.' : 'Не указана'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <Update className="detail-icon" />
                                            <span>Последняя проверка: {asset.lastReview || 'Не указана'}</span>
                                        </div>
                                    </div>

                                    {/* CIA-рейтинг в компактном виде */}
                                    <div className="cia-compact">
                                        <div className="cia-item-compact">
                                            <span className="cia-label">Конф.</span>
                                            <span className={`cia-value level-${asset.confidentiality?.toLowerCase()}`}>
                                                {asset.confidentiality}
                                            </span>
                                        </div>
                                        <div className="cia-item-compact">
                                            <span className="cia-label">Целост.</span>
                                            <span className={`cia-value level-${asset.integrity?.toLowerCase()}`}>
                                                {asset.integrity}
                                            </span>
                                        </div>
                                        <div className="cia-item-compact">
                                            <span className="cia-label">Дост.</span>
                                            <span className={`cia-value level-${asset.availability?.toLowerCase()}`}>
                                                {asset.availability}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Блок риска (если есть) */}
                                    {asset.latestRisk && (
                                        <div className="risk-indicator" style={{ color: getRiskColor(asset.latestRisk) }}>
                                            <Security className="risk-icon" />
                                            <span>Риск: <strong>{asset.latestRisk.toLocaleString()} руб.</strong></span>
                                        </div>
                                    )}
                                </div>

                                {/* Кнопки действий */}
                                <div className="asset-card-footer">
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => window.location.href = `/user/assets/${asset.id}`}
                                    >
                                        <Visibility /> Подробнее
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Дополнительные стили */}
            <style jsx>{`
                .assets-grid-modern {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 24px;
                }
                .asset-card-modern {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    transition: transform 0.2s, box-shadow 0.2s;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .asset-card-modern:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
                }
                .asset-card-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px 20px 12px 20px;
                    border-bottom: 1px solid #f0f2f5;
                }
                .asset-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .asset-icon svg {
                    font-size: 28px;
                }
                .asset-title {
                    flex: 1;
                }
                .asset-title h3 {
                    margin: 0 0 6px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .asset-card-body {
                    padding: 16px 20px;
                }
                .asset-description {
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 16px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .asset-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #475569;
                }
                .detail-icon {
                    font-size: 16px;
                    color: #94a3b8;
                }
                .cia-compact {
                    display: flex;
                    gap: 16px;
                    margin: 16px 0;
                    padding: 12px 0;
                    border-top: 1px solid #e2e8f0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .cia-item-compact {
                    flex: 1;
                    text-align: center;
                }
                .cia-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                .cia-value {
                    font-size: 14px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 20px;
                    display: inline-block;
                }
                .risk-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    margin-top: 12px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .risk-icon {
                    font-size: 18px;
                }
                .asset-card-footer {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }
                .asset-card-footer .btn {
                    flex: 1;
                    justify-content: center;
                }
                .empty-state-card {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }
                .empty-state-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }
            `}</style>
        </div>
    );
};

export default MyAssets;