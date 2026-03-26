import React, { useState, useEffect } from 'react';
import CIAInput from './CIAInput';
import { getAssetGroups } from '../../services/assetApi';
import '../../styles/prototype.css';

const AssetCreateModal = ({ onClose, onSave, initialData }) => {
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        category: '',
        owner: '',
        location: '',
        status: 'active',
        confidentiality: 'medium',
        integrity: 'medium',
        availability: 'medium',
        tags: [],
        value: 0,
        weightC: 1,
        weightI: 1,
        weightA: 1,
        legalStatus: '',
        groupId: ''
    });

    useEffect(() => {
        const loadGroups = async () => {
            const groupsData = await getAssetGroups();
            setGroups(groupsData);
        };
        loadGroups();
    }, []);

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert('Пожалуйста, укажите наименование актива');
            return;
        }

        const requestData = {
            name: formData.name,
            category: formData.category || null,
            status: statusMap[formData.status] || 'ACTIVE',
            confidentiality: ciaMap[formData.confidentiality] || 'MEDIUM',
            integrity: ciaMap[formData.integrity] || 'MEDIUM',
            availability: ciaMap[formData.availability] || 'MEDIUM',
            lastReview: new Date().toISOString().split('T')[0],
            description: formData.description || '',
            location: formData.location || '',
            tags: formData.tags,
            value: formData.value,
            weightC: formData.weightC,
            weightI: formData.weightI,
            weightA: formData.weightA,
            legalStatus: formData.legalStatus,
            groupId: formData.groupId || null
        };

        onSave(requestData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        high: 'HIGH',
        critical: 'CRITICAL'
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h3 style={{ marginBottom: '24px' }}>
                    {initialData ? 'Редактирование' : 'Создание'} актива
                </h3>

                <div className="form-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '24px'
                }}>
                    <div className="form-group">
                        <label>Наименование *</label>
                        <input
                            className="input"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Введите наименование актива"
                        />
                    </div>

                    <div className="form-group">
                        <label>Категория</label>
                        <select
                            className="input select"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                        >
                            <option value="">Выберите категорию</option>
                            <option value="database">Базы данных</option>
                            <option value="documentation">Документация</option>
                            <option value="software">ПО</option>
                            <option value="hardware">Оборудование</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Владелец (ID)</label>
                        <input
                            className="input"
                            value={formData.owner}
                            onChange={(e) => handleChange('owner', e.target.value)}
                            placeholder="ID пользователя-владельца"
                        />
                    </div>

                    <div className="form-group">
                        <label>Статус</label>
                        <select
                            className="input select"
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                        >
                            <option value="active">Активен</option>
                            <option value="needs_review">Требует проверки</option>
                            <option value="archived">Архивирован</option>
                            <option value="draft">Черновик</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Местоположение</label>
                        <input
                            className="input"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="Физическое или логическое расположение"
                        />
                    </div>

                    <div className="form-group">
                        <label>Стоимость (руб.)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.value}
                            onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Правовой статус</label>
                        <select
                            className="input select"
                            value={formData.legalStatus}
                            onChange={(e) => handleChange('legalStatus', e.target.value)}
                        >
                            <option value="">Не выбран</option>
                            <option value="pers_data">Персональные данные</option>
                            <option value="commercial_secret">Коммерческая тайна</option>
                            <option value="other">Иное</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Группа активов</label>
                        <select
                            className="input select"
                            value={formData.groupId}
                            onChange={(e) => handleChange('groupId', e.target.value)}
                        >
                            <option value="">Без группы</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Вес конфиденциальности (0-2)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.weightC}
                            onChange={(e) => handleChange('weightC', parseInt(e.target.value) || 0)}
                            min="0"
                            max="2"
                            step="1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Вес целостности (0-2)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.weightI}
                            onChange={(e) => handleChange('weightI', parseInt(e.target.value) || 0)}
                            min="0"
                            max="2"
                            step="1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Вес доступности (0-2)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.weightA}
                            onChange={(e) => handleChange('weightA', parseInt(e.target.value) || 0)}
                            min="0"
                            max="2"
                            step="1"
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Описание</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Подробное описание актива"
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <CIAInput
                            values={formData}
                            onChange={(cia) => setFormData(prev => ({ ...prev, ...cia }))}
                        />
                    </div>
                </div>

                <div className="modal-actions" style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '32px',
                    paddingTop: '24px',
                    borderTop: '1px solid var(--border)'
                }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Отмена
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetCreateModal;