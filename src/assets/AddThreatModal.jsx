import React, { useState, useEffect } from 'react';
import threatApi from '../../services/threatApi';
import '../../styles/prototype.css';

const AddThreatModal = ({ assetId, onClose, onThreatAdded }) => {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedThreatId, setSelectedThreatId] = useState('');
    const [probability, setProbability] = useState(0.5);
    const [customC, setCustomC] = useState(null);
    const [customI, setCustomI] = useState(null);
    const [customA, setCustomA] = useState(null);
    const [mitigationEffect, setMitigationEffect] = useState(0);

    useEffect(() => {
        loadThreats();
    }, [search]);

    const loadThreats = async () => {
        setLoading(true);
        try {
            const params = { page: 0, size: 100 };
            if (search) params.search = search;
            const response = await threatApi.getThreats(params);
            setThreats(response.content || []);
        } catch (error) {
            console.error('Ошибка загрузки угроз:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedThreatId) {
            alert('Выберите угрозу');
            return;
        }
        try {
            await assetApi.addAssetThreat(assetId, {
                threatId: selectedThreatId,
                probability: parseFloat(probability),
                customC: customC !== null ? customC : undefined,
                customI: customI !== null ? customI : undefined,
                customA: customA !== null ? customA : undefined,
                mitigationEffect: parseFloat(mitigationEffect)
            });
            onThreatAdded();
            onClose();
        } catch (error) {
            alert('Ошибка при добавлении угрозы');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '500px' }}>
                <h3>Добавить угрозу</h3>

                <div className="form-group">
                    <label>Поиск угрозы</label>
                    <input
                        type="text"
                        className="input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Введите название угрозы"
                    />
                </div>

                <div className="form-group">
                    <label>Угроза</label>
                    <select
                        className="input select"
                        value={selectedThreatId}
                        onChange={(e) => setSelectedThreatId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Выберите угрозу</option>
                        {threats.map(threat => (
                            <option key={threat.id} value={threat.id}>
                                {threat.name} (ID: {threat.id})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Вероятность реализации (0-1)</label>
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
                    <label>Эффективность мер защиты (0-1)</label>
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
                    <label>Переопределить влияние на CIA (оставьте пустым для использования из угрозы)</label>
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
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>Добавить</button>
                </div>
            </div>
        </div>
    );
};

export default AddThreatModal;