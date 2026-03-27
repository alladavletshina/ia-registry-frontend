import React, { useState, useEffect } from 'react';
import threatApi from '../../services/threatApi';
import assetApi from '../../services/assetApi';
import '../../styles/prototype.css';

const AddThreatModal = ({ assetId, onClose, onThreatAdded }) => {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedThreatId, setSelectedThreatId] = useState('');
    const [probability, setProbability] = useState(0.5);
    const [mitigationEffect, setMitigationEffect] = useState(0);

    useEffect(() => {
        loadThreats();
    }, [search]);

    const loadThreats = async () => {
        setLoading(true);
        try {
            const response = await threatApi.getThreats({ page: 0, size: 500, search: search || undefined });
            setThreats(response.content || []);
        } catch (error) {
            console.error('Ошибка загрузки угроз:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredThreats = threats.filter(threat =>
        threat.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!selectedThreatId) {
            alert('Выберите угрозу');
            return;
        }
        try {
            await assetApi.addAssetThreat(assetId, {
                threatId: parseInt(selectedThreatId),
                probability: parseFloat(probability),
                mitigationEffect: parseFloat(mitigationEffect)
            });
            onThreatAdded();
            onClose();
        } catch (error) {
            console.error('Ошибка добавления угрозы:', error);
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
                        placeholder="Введите название"
                    />
                </div>

                <div className="form-group">
                    <label>Угроза</label>
                    {loading ? (
                        <div>Загрузка...</div>
                    ) : filteredThreats.length === 0 ? (
                        <div style={{ color: 'var(--text-light)' }}>Угрозы не найдены</div>
                    ) : (
                        <select
                            className="input select"
                            value={selectedThreatId}
                            onChange={(e) => setSelectedThreatId(e.target.value)}
                            size={5}
                            style={{ height: 'auto', minHeight: '120px' }}
                        >
                            <option value="">Выберите угрозу</option>
                            {filteredThreats.map(threat => (
                                <option key={threat.id} value={String(threat.id)}>
                                    {threat.name}
                                </option>
                            ))}
                        </select>
                    )}
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

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>Добавить</button>
                </div>
            </div>
        </div>
    );
};

export default AddThreatModal;