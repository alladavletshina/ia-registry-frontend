import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import assetApi from '../../services/assetApi';
import AddThreatModal from '../../components/assets/AddThreatModal';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/prototype.css';

const AssetView = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [threats, setThreats] = useState([]);
    const [risk, setRisk] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddThreatModal, setShowAddThreatModal] = useState(false);
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

    return (
        <div className="asset-view">
            {/* ... заголовок, детали актива ... */}

            <div className="asset-tabs">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    Обзор
                </button>
                <button className={`tab-btn ${activeTab === 'threats' ? 'active' : ''}`} onClick={() => setActiveTab('threats')}>
                    Угрозы
                </button>
                {/* другие вкладки */}
            </div>

            {activeTab === 'threats' && (
                <div className="threats-tab">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Привязанные угрозы</h3>
                        {isAdmin && (
                            <button className="btn btn-primary" onClick={() => setShowAddThreatModal(true)}>
                                + Добавить угрозу
                            </button>
                        )}
                    </div>

                    {threats.length === 0 ? (
                        <p>Нет привязанных угроз</p>
                    ) : (
                        <div className="threats-list">
                            {threats.map(threat => (
                                <div key={threat.id} className="threat-item" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong>{threat.threatName}</strong>
                                            <div><strong>Вероятность:</strong> {threat.probability * 100}%</div>
                                            <div><strong>Эффективность мер:</strong> {threat.mitigationEffect * 100}%</div>
                                            <div>
                                                <strong>Влияние на CIA:</strong>{' '}
                                                {(threat.customC !== null ? threat.customC : threat.threatConfidentiality) ? ' Конф.' : ''}
                                                {(threat.customI !== null ? threat.customI : threat.threatIntegrity) ? ' Целост.' : ''}
                                                {(threat.customA !== null ? threat.customA : threat.threatAvailability) ? ' Дост.' : ''}
                                            </div>
                                            <div><strong>Дата оценки:</strong> {threat.assessmentDate}</div>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleRemoveThreat(threat.threatId)}
                                            >
                                                Удалить
                                            </button>
                                        )}
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
        </div>
    );
};

export default AssetView;