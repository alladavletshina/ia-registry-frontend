import React, { useState, useEffect } from 'react';
import assetApi from '../../services/assetApi';
import '../../styles/prototype.css';

const EditThreatModal = ({ assetId, threat, onClose, onThreatUpdated }) => {
    const [probability, setProbability] = useState(threat?.probability || 0.5);
    const [mitigationEffect, setMitigationEffect] = useState(threat?.mitigationEffect || 0);
    const [customC, setCustomC] = useState(threat?.customC !== undefined ? threat.customC : null);
    const [customI, setCustomI] = useState(threat?.customI !== undefined ? threat.customI : null);
    const [customA, setCustomA] = useState(threat?.customA !== undefined ? threat.customA : null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!threat?.threatId) {
            alert('Ошибка: угроза не определена');
            return;
        }
        setLoading(true);
        try {
            await assetApi.updateAssetThreat(assetId, threat.threatId, {
                probability: parseFloat(probability),
                mitigationEffect: parseFloat(mitigationEffect),
                customC: customC !== null ? customC : undefined,
                customI: customI !== null ? customI : undefined,
                customA: customA !== null ? customA : undefined
            });
            onThreatUpdated();
            onClose();
        } catch (error) {
            console.error('Ошибка обновления угрозы:', error);
            alert('Не удалось обновить угрозу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '500px' }}>
                <h3>Редактирование угрозы</h3>
                <div className="form-group">
                    <label>Угроза</label>
                    <input type="text" className="input" value={threat?.threatName || ''} disabled />
                </div>
                <div className="form-group">
                    <label>Вероятность (0-1)</label>
                    <input
                        type="number"
                        className="input"
                        step="0.01"
                        min="0"
                        max="1"
                        value={probability}
                        onChange={(e) => setProbability(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Эффективность мер (0-1)</label>
                    <input
                        type="number"
                        className="input"
                        step="0.01"
                        min="0"
                        max="1"
                        value={mitigationEffect}
                        onChange={(e) => setMitigationEffect(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Переопределить влияние на CIA</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={customC === true}
                                onChange={(e) => setCustomC(e.target.checked ? true : null)}
                            /> Конфиденциальность
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={customI === true}
                                onChange={(e) => setCustomI(e.target.checked ? true : null)}
                            /> Целостность
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={customA === true}
                                onChange={(e) => setCustomA(e.target.checked ? true : null)}
                            /> Доступность
                        </label>
                    </div>
                    <small>Оставьте пустым, чтобы использовать значения из угрозы.</small>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Отмена</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditThreatModal;