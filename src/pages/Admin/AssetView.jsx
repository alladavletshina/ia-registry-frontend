import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import assetApi from '../../services/assetApi';
import AddThreatModal from '../../components/assets/AddThreatModal';
import EditThreatModal from '../../components/assets/EditThreatModal';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/prototype.css';

const AssetView = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [threats, setThreats] = useState([]);
    const [risk, setRisk] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddThreatModal, setShowAddThreatModal] = useState(false);
    const [editThreat, setEditThreat] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        loadAsset();
        loadThreats();
        loadRisk();
    }, [id]);

    const loadAsset = async () => {
        try {
            const data = await assetApi.getById(id);
            setAsset(data);
        } catch (error) {
            console.error('Ошибка загрузки актива:', error);
        }
    };

    const loadThreats = async () => {
        try {
            const data = await assetApi.getAssetThreats(id);
            setThreats(data);
        } catch (error) {
            console.error('Ошибка загрузки угроз актива:', error);
        }
    };

    const loadRisk = async () => {
        const data = await assetApi.getLatestRisk(id);
        setRisk(data);
    };

    const handleRemoveThreat = async (threatId) => {
        if (window.confirm('Удалить угрозу?')) {
            try {
                await assetApi.removeAssetThreat(id, threatId);
                await loadThreats();
                await loadRisk();
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    };

    if (!asset) return <div className="loading-container">Загрузка...</div>;

    return (
        <div className="asset-view">
            <div className="asset-header">
                <h1>{asset.name}</h1>
                <div className="asset-meta">
                    <span className="badge">{asset.status}</span>
                    {risk && (
                        <span className="risk-badge" style={{ marginLeft: '16px', fontSize: '14px' }}>
                            Риск: {risk.calculatedRisk?.toLocaleString()} руб.
                        </span>
                    )}
                </div>
            </div>

            <div className="asset-tabs">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    Обзор
                </button>
                <button className={`tab-btn ${activeTab === 'threats' ? 'active' : ''}`} onClick={() => setActiveTab('threats')}>
                    Угрозы
                </button>
            </div>

            <div className="asset-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="detail-section">
                            <h3>Описание</h3>
                            <p>{asset.description || 'Нет описания'}</p>
                        </div>
                        <div className="detail-section">
                            <h3>Атрибуты</h3>
                            <div className="detail-grid">
                                <div><strong>Владелец:</strong> {asset.ownerId}</div>
                                <div><strong>Местоположение:</strong> {asset.location || '-'}</div>
                                <div><strong>Последняя проверка:</strong> {asset.lastReview}</div>
                                <div><strong>Стоимость:</strong> {asset.value ? asset.value.toLocaleString() + ' руб.' : '-'}</div>
                                <div><strong>Правовой статус:</strong> {asset.legalStatus || '-'}</div>
                                <div><strong>Группа:</strong> {asset.group?.name || '-'}</div>
                            </div>
                        </div>
                        <div className="detail-section">
                            <h3>Оценка CIA</h3>
                            <div className="cia-display">
                                <div className="cia-item">
                                    <span className="label">Конфиденциальность</span>
                                    <span className={`value level-${asset.confidentiality?.toLowerCase()}`}>{asset.confidentiality}</span>
                                </div>
                                <div className="cia-item">
                                    <span className="label">Целостность</span>
                                    <span className={`value level-${asset.integrity?.toLowerCase()}`}>{asset.integrity}</span>
                                </div>
                                <div className="cia-item">
                                    <span className="label">Доступность</span>
                                    <span className={`value level-${asset.availability?.toLowerCase()}`}>{asset.availability}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'threats' && (
                    <div className="threats-tab">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Привязанные угрозы</h3>
                            <button className="btn btn-primary" onClick={() => setShowAddThreatModal(true)}>
                                + Добавить угрозу
                            </button>
                        </div>

                        {threats.length === 0 ? (
                            <p>Нет привязанных угроз</p>
                        ) : (
                            <div className="threats-list">
                                {threats.map(threat => (
                                    <div key={threat.id} className="threat-item" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <strong>{threat.threatName}</strong>
                                                <div><strong>Вероятность:</strong> {threat.probability * 100}%</div>
                                                <div><strong>Эффективность мер:</strong> {threat.mitigationEffect * 100}%</div>
                                                <div><strong>Дата оценки:</strong> {threat.assessmentDate}</div>
                                            </div>
                                            <div>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => setEditThreat(threat)}
                                                    style={{ marginRight: '8px' }}
                                                >
                                                    Изменить
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRemoveThreat(threat.threatId)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {risk && (
                            <div className="risk-summary" style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                <h4>Текущий интегральный риск</h4>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: risk.calculatedRisk > 1000000 ? '#ef4444' : '#10b981' }}>
                                    {risk.calculatedRisk?.toLocaleString()} руб.
                                </div>
                                <small>Рассчитано: {new Date(risk.calculationDate).toLocaleString()}</small>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showAddThreatModal && (
                <AddThreatModal
                    assetId={id}
                    onClose={() => setShowAddThreatModal(false)}
                    onThreatAdded={() => {
                        loadThreats();
                        loadRisk();
                    }}
                />
            )}

            {editThreat && (
                <EditThreatModal
                    assetId={id}
                    threat={editThreat}
                    onClose={() => setEditThreat(null)}
                    onThreatUpdated={() => {
                        loadThreats();
                        loadRisk();
                        setEditThreat(null);
                    }}
                />
            )}
        </div>
    );
};

export default AssetView;