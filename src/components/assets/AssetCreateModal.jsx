import React, { useState, useEffect } from 'react';
import CIAInput from './CIAInput';
import { getAssetGroups } from '../../services/assetApi';
import userApi from '../../services/userApi';
import threatApi from '../../services/threatApi';
import assetApi from '../../services/assetApi';
import EditThreatModal from '../../components/assets/EditThreatModal';
import '../../styles/prototype.css';

const AssetCreateModal = ({ onClose, onSave, initialData, existingThreats = [], assetId, currentRisk }) => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [editThreat, setEditThreat] = useState(null);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        owner: '',
        location: '',
        status: 'active',
        confidentiality: 'medium',
        integrity: 'medium',
        availability: 'medium',
        tags: '',
        value: 0,
        legalStatus: '',
        groupId: ''
    });

    const [selectedThreats, setSelectedThreats] = useState([]);
    const [existingThreatsList, setExistingThreatsList] = useState(existingThreats);
    const [threatSearch, setThreatSearch] = useState('');
    const [threatsCatalog, setThreatsCatalog] = useState([]);
    const [loadingThreats, setLoadingThreats] = useState(false);
    const [showAddThreatForm, setShowAddThreatForm] = useState(false);
    const [newThreat, setNewThreat] = useState({
        threatId: '',
        probability: 0.5,
        mitigationEffect: 0
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadGroups = async () => {
            const groupsData = await getAssetGroups();
            setGroups(groupsData);
        };
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const usersData = await userApi.getAll();
                setUsers(usersData);
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadGroups();
        loadUsers();
        loadThreatsCatalog();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                groupId: initialData.groupId || '',
                owner: initialData.owner || '',
                value: initialData.value || 0,
                description: initialData.description || '',
                name: initialData.name || '',
                status: initialData.status || 'active',
                confidentiality: initialData.confidentiality || 'medium',
                integrity: initialData.integrity || 'medium',
                availability: initialData.availability || 'medium',
                location: initialData.location || '',
                tags: initialData.tags || '',
                legalStatus: initialData.legalStatus || ''
            }));
        }
    }, [initialData]);

    const loadThreatsCatalog = async () => {
        setLoadingThreats(true);
        try {
            const response = await threatApi.getThreats({ page: 0, size: 500 });
            setThreatsCatalog(response.content || []);
        } catch (error) {
            console.error('Ошибка загрузки каталога угроз:', error);
        } finally {
            setLoadingThreats(false);
        }
    };

    const filteredThreats = threatsCatalog.filter(threat =>
        threat.name.toLowerCase().includes(threatSearch.toLowerCase())
    );

    const addThreatToSelection = () => {
        if (!newThreat.threatId) {
            alert('Выберите угрозу');
            return;
        }
        const exists = selectedThreats.some(t => t.threatId === newThreat.threatId) ||
            existingThreatsList.some(t => t.threatId === newThreat.threatId);
        if (exists) {
            alert('Эта угроза уже добавлена');
            return;
        }
        const threatToAdd = threatsCatalog.find(t => t.id === parseInt(newThreat.threatId));
        if (!threatToAdd) return;
        setSelectedThreats(prev => [...prev, {
            ...newThreat,
            threatId: newThreat.threatId,
            threatName: threatToAdd.name,
            assessmentDate: new Date().toISOString().split('T')[0]
        }]);
        setNewThreat({
            threatId: '',
            probability: 0.5,
            mitigationEffect: 0
        });
        setShowAddThreatForm(false);
        setThreatSearch('');
    };

    const removeSelectedThreat = (index) => {
        setSelectedThreats(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingThreat = async (threatId) => {
        if (window.confirm('Удалить угрозу?')) {
            try {
                await assetApi.removeAssetThreat(assetId, threatId);
                setExistingThreatsList(prev => prev.filter(t => t.threatId !== threatId));
            } catch (error) {
                console.error('Ошибка удаления угрозы:', error);
            }
        }
    };

    const updateExistingThreat = async (updatedThreat) => {
        try {
            await assetApi.updateAssetThreat(assetId, updatedThreat.threatId, {
                probability: updatedThreat.probability,
                mitigationEffect: updatedThreat.mitigationEffect
            });
            setExistingThreatsList(prev =>
                prev.map(t => t.threatId === updatedThreat.threatId ? updatedThreat : t)
            );
        } catch (error) {
            console.error('Ошибка обновления угрозы:', error);
            alert('Не удалось обновить угрозу');
        }
    };

    const updateSelectedThreat = (updatedThreat) => {
        setSelectedThreats(prev =>
            prev.map(t => t.threatId === updatedThreat.threatId ? updatedThreat : t)
        );
    };

    const handleEditThreatSave = (updatedThreat) => {
        const isExisting = existingThreatsList.some(t => t.threatId === updatedThreat.threatId);
        if (isExisting && assetId) {
            updateExistingThreat(updatedThreat);
        } else {
            updateSelectedThreat(updatedThreat);
        }
        setEditThreat(null);
    };

    const statusMap = {
        active: 'ACTIVE',
        needs_review: 'NEEDS_REVIEW',
        archived: 'ARCHIVED',
        draft: 'DRAFT'
    };
    const ciaMap = {
        low: 'LOW',
        medium: 'MEDIUM',
        high: 'HIGH'
    };

    const getWeightFromLevel = (level) => {
        switch (level) {
            case 'low': return 0;
            case 'medium': return 1;
            case 'high': return 2;
            default: return 1;
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Наименование обязательно';
        if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
        if (!formData.owner) newErrors.owner = 'Владелец обязателен';
        if (!formData.value || formData.value <= 0) newErrors.value = 'Стоимость должна быть больше 0';
        if (!formData.groupId) newErrors.groupId = 'Группа обязательна';
        if (!formData.legalStatus) newErrors.legalStatus = 'Правовой статус обязателен';
        if (!formData.status || !statusMap[formData.status]) newErrors.status = 'Статус обязателен';
        if (!formData.confidentiality || !ciaMap[formData.confidentiality]) newErrors.confidentiality = 'Конфиденциальность обязательна';
        if (!formData.integrity || !ciaMap[formData.integrity]) newErrors.integrity = 'Целостность обязательна';
        if (!formData.availability || !ciaMap[formData.availability]) newErrors.availability = 'Доступность обязательна';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const requestData = {
            name: formData.name.trim(),
            ownerId: formData.owner,
            status: statusMap[formData.status],
            confidentiality: ciaMap[formData.confidentiality],
            integrity: ciaMap[formData.integrity],
            availability: ciaMap[formData.availability],
            lastReview: new Date().toISOString().split('T')[0],
            description: formData.description || null,
            location: formData.location || null,
            tags: formData.tags || null,
            value: Number(formData.value) || 0,
            weightC: getWeightFromLevel(formData.confidentiality),
            weightI: getWeightFromLevel(formData.integrity),
            weightA: getWeightFromLevel(formData.availability),
            legalStatus: formData.legalStatus || null,
            groupId: formData.groupId || null
        };

        try {
            let savedAsset;
            if (assetId) {
                savedAsset = await assetApi.update(assetId, requestData);
            } else {
                savedAsset = await assetApi.create(requestData);
            }

            // Добавляем новые угрозы, игнорируя уже существующие (409 Conflict)
            for (const threat of selectedThreats) {
                try {
                    await assetApi.addAssetThreat(savedAsset.id, {
                        threatId: parseInt(threat.threatId),
                        probability: threat.probability,
                        mitigationEffect: threat.mitigationEffect
                    });
                } catch (error) {
                    if (error.response?.status === 409) {
                        console.warn(`Угроза ${threat.threatId} уже привязана к активу, пропускаем`);
                    } else {
                        throw error;
                    }
                }
            }

            onSave(savedAsset);
        } catch (error) {
            console.error('Ошибка сохранения актива:', error);
            alert('Ошибка при сохранении актива: ' + (error.response?.data?.message || error.message));
        }
    };

    const renderThreatSection = () => (
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>Угрозы</h4>
            {existingThreatsList.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <label>Текущие угрозы актива:</label>
                    {existingThreatsList.map(threat => (
                        <div key={threat.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <strong>{threat.threatName}</strong>
                                    <div>Вероятность: {threat.probability != null ? (threat.probability * 100).toFixed(0) + '%' : 'не задана'}</div>
                                    <div>Эффективность мер: {threat.mitigationEffect != null ? (threat.mitigationEffect * 100).toFixed(0) + '%' : '0%'}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-sm btn-danger" onClick={() => removeExistingThreat(threat.threatId)}>Удалить</button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setEditThreat(threat)}
                                    >
                                        Изменить
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {selectedThreats.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <label>Новые угрозы:</label>
                    {selectedThreats.map((threat, idx) => (
                        <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <strong>{threat.threatName}</strong>
                                    <div>Вероятность: {(threat.probability * 100).toFixed(0)}%</div>
                                    <div>Эффективность мер: {(threat.mitigationEffect * 100).toFixed(0)}%</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-sm btn-danger" onClick={() => removeSelectedThreat(idx)}>Удалить</button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setEditThreat(threat)}> Изменить</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!showAddThreatForm ? (
                <button className="btn btn-secondary" onClick={() => setShowAddThreatForm(true)}>+ Добавить угрозу</button>
            ) : (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
                    <div className="form-group">
                        <label>Поиск угрозы</label>
                        <input type="text" className="input" value={threatSearch} onChange={(e) => setThreatSearch(e.target.value)} placeholder="Введите название" />
                    </div>
                    <div className="form-group">
                        <label>Угроза</label>
                        {loadingThreats ? <div>Загрузка...</div> : filteredThreats.length === 0 ? <div style={{ color: 'var(--text-light)' }}>Угрозы не найдены</div> : (
                            <select className="input select" value={newThreat.threatId} onChange={(e) => setNewThreat({ ...newThreat, threatId: e.target.value })} size={5} style={{ height: 'auto', minHeight: '120px' }}>
                                <option value="">Выберите угрозу</option>
                                {filteredThreats.map(threat => <option key={threat.id} value={String(threat.id)}>{threat.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Вероятность (0-1)</label>
                        <input type="number" className="input" step="0.01" min="0" max="1" value={newThreat.probability} onChange={(e) => setNewThreat({ ...newThreat, probability: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label>Эффективность мер (0-1)</label>
                        <input type="number" className="input" step="0.01" min="0" max="1" value={newThreat.mitigationEffect} onChange={(e) => setNewThreat({ ...newThreat, mitigationEffect: parseFloat(e.target.value) })} />
                    </div>
                    <div className="modal-actions" style={{ marginTop: '16px' }}>
                        <button className="btn btn-secondary" onClick={() => { setShowAddThreatForm(false); setThreatSearch(''); }}>Отмена</button>
                        <button className="btn btn-primary" onClick={addThreatToSelection}>Добавить</button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Основное модальное окно */}
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '32px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '24px' }}>{assetId ? 'Редактирование' : 'Создание'} актива</h3>
                    {currentRisk && (
                        <div style={{ marginBottom: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <strong>Текущий интегральный риск:</strong> {currentRisk.calculatedRisk?.toLocaleString()} руб.
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontWeight: 'bold' }}>Наименование <span className="required-star">*</span></label>
                                <input className="input" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Введите наименование актива" />
                                {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 'bold' }}>Статус <span className="required-star">*</span></label>
                                <select className="input select" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                                    <option value="active">Активен</option>
                                    <option value="needs_review">Требует проверки</option>
                                    <option value="archived">Архивирован</option>
                                    <option value="draft">Черновик</option>
                                </select>
                                {errors.status && <small style={{ color: 'red' }}>{errors.status}</small>}
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 'bold' }}>Владелец <span className="required-star">*</span></label>
                                <select className="input select" value={formData.owner} onChange={(e) => handleChange('owner', e.target.value)} disabled={loadingUsers}>
                                    <option value="">Выберите владельца</option>
                                    {users.map(user => (
                                        <option key={user.keycloakId} value={user.keycloakId}>{user.firstName} {user.lastName} ({user.email})</option>
                                    ))}
                                </select>
                                {errors.owner && <small style={{ color: 'red' }}>{errors.owner}</small>}
                            </div>

                            <div className="form-group">
                                <label>Группа <span className="required-star">*</span></label>
                                <select className="input select" value={formData.groupId} onChange={(e) => handleChange('groupId', e.target.value)}>
                                    <option value="">Выберите группу</option>
                                    {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                                </select>
                                {errors.groupId && <small style={{ color: 'red' }}>{errors.groupId}</small>}
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 'bold' }}>Стоимость (руб.) <span className="required-star">*</span></label>
                                <input type="number" className="input" value={formData.value} onChange={(e) => handleChange('value', e.target.value)} step="0.01" min="0.01" />
                                {errors.value && <small style={{ color: 'red' }}>{errors.value}</small>}
                            </div>

                            <div className="form-group">
                                <label>Правовой статус <span className="required-star">*</span></label>
                                <select className="input select" value={formData.legalStatus} onChange={(e) => handleChange('legalStatus', e.target.value)}>
                                    <option value="">Выберите правовой статус</option>
                                    <option value="pers_data">Персональные данные</option>
                                    <option value="commercial_secret">Коммерческая тайна</option>
                                    <option value="other">Иное</option>
                                </select>
                                {errors.legalStatus && <small style={{ color: 'red' }}>{errors.legalStatus}</small>}
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Местоположение</label>
                                <input className="input" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Физическое или логическое расположение" />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontWeight: 'bold' }}>Описание <span className="required-star">*</span></label>
                                <textarea className="input" rows={4} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Подробное описание актива" style={{ width: '100%', resize: 'vertical' }} />
                                {errors.description && <small style={{ color: 'red' }}>{errors.description}</small>}
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <CIAInput values={formData} onChange={(cia) => setFormData(prev => ({ ...prev, ...cia }))} />
                                <small style={{ color: 'var(--text-light)' }}><span className="required-star">*</span> Конфиденциальность, целостность, доступность обязательны</small>
                                {(errors.confidentiality || errors.integrity || errors.availability) && <small style={{ color: 'red', display: 'block' }}>Все уровни CIA обязательны для заполнения</small>}
                            </div>
                        </div>
                        {renderThreatSection()}
                    </div>
                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                        <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>Сохранить</button>
                    </div>
                </div>
            </div>

            {/* Рендер EditThreatModal без портала, но с собственным high z-index */}
            {editThreat && (
                <EditThreatModal
                    assetId={assetId}
                    threat={editThreat}
                    onClose={() => setEditThreat(null)}
                    onThreatUpdated={handleEditThreatSave}
                />
            )}
        </>
    );
};

export default AssetCreateModal;