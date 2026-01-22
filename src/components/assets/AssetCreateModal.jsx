// src/components/assets/AssetCreateModal.jsx
import React, { useState } from 'react';
import CIAInput from './CIAInput';
import '../../styles/prototype.css';

const AssetCreateModal = ({ onClose, onSave, initialData }) => {
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
        tags: []
    });

    const handleSubmit = () => {
        // Валидация
        if (!formData.name.trim()) {
            alert('Пожалуйста, укажите наименование актива');
            return;
        }

        onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                        <label>Владелец</label>
                        <input
                            className="input"
                            value={formData.owner}
                            onChange={(e) => handleChange('owner', e.target.value)}
                            placeholder="ФИО владельца"
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

                    {/* Оценка CIA (Confidentiality, Integrity, Availability) */}
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
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetCreateModal;