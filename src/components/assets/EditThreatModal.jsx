import React, { useState } from 'react';
import assetApi from '../../services/assetApi';

const EditThreatModal = ({ assetId, threat, onClose, onThreatUpdated }) => {
    const [probability, setProbability] = useState(threat?.probability ?? 0.5);
    const [mitigationEffect, setMitigationEffect] = useState(threat?.mitigationEffect ?? 0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!threat?.threatId) {
            alert('Ошибка: угроза не определена');
            return;
        }

        const updatedThreat = {
            ...threat,
            probability: parseFloat(probability),
            mitigationEffect: parseFloat(mitigationEffect),
        };

        // Если нет assetId — работаем локально (новый актив)
        if (!assetId) {
            onThreatUpdated(updatedThreat);
            onClose();
            return;
        }

        setLoading(true);
        try {
            await assetApi.updateAssetThreat(assetId, threat.threatId, {
                probability: updatedThreat.probability,
                mitigationEffect: updatedThreat.mitigationEffect,
            });
            onThreatUpdated(updatedThreat);
            onClose();
        } catch (error) {
            console.error('Ошибка обновления угрозы:', error);
            alert('Не удалось обновить угрозу');
        } finally {
            setLoading(false);
        }
    };

    // Жёсткие стили для гарантированного отображения
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}>
                <h3 style={{ marginBottom: '20px' }}>Редактирование угрозы</h3>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Угроза</label>
                    <input
                        type="text"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        value={threat?.threatName || ''}
                        disabled
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Вероятность (0-1)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        value={probability}
                        onChange={(e) => setProbability(parseFloat(e.target.value))}
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Эффективность мер (0-1)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        value={mitigationEffect}
                        onChange={(e) => setMitigationEffect(parseFloat(e.target.value))}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        disabled={loading}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        disabled={loading}
                    >
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditThreatModal;