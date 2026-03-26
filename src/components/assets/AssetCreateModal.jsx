// src/components/assets/AssetCreateModal.jsx

import React, { useState, useEffect } from 'react';
import CIAInput from './CIAInput';
import { getAssetGroups } from '../../services/assetApi';
import userApi from '../../services/userApi';
import '../../styles/prototype.css';

const AssetCreateModal = ({ onClose, onSave, initialData }) => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        category: '',
        owner: '',          // keycloakId
        location: '',
        status: 'active',
        confidentiality: 'medium',
        integrity: 'medium',
        availability: 'medium',
        tags: '',
        value: 0,
        weightC: 1,
        weightI: 1,
        weightA: 1,
        legalStatus: '',
        groupId: ''
    });

    // Загрузка справочников
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
    }, []);

    // Маппинг статусов и CIA для отправки на сервер
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        // Валидация обязательных полей
        if (!formData.name.trim()) {
            alert('Наименование актива обязательно');
            return;
        }
        if (!formData.status || !statusMap[formData.status]) {
            alert('Статус актива обязателен');
            return;
        }
        if (!formData.confidentiality || !ciaMap[formData.confidentiality]) {
            alert('Уровень конфиденциальности обязателен');
            return;
        }
        if (!formData.integrity || !ciaMap[formData.integrity]) {
            alert('Уровень целостности обязателен');
            return;
        }
        if (!formData.availability || !ciaMap[formData.availability]) {
            alert('Уровень доступности обязателен');
            return;
        }

        const requestData = {
            name: formData.name.trim(),
            category: formData.category || null,
            ownerId: formData.owner || null,               // keycloakId или null
            status: statusMap[formData.status],
            confidentiality: ciaMap[formData.confidentiality],
            integrity: ciaMap[formData.integrity],
            availability: ciaMap[formData.availability],
            lastReview: new Date().toISOString().split('T')[0],
            description: formData.description || null,
            location: formData.location || null,
            tags: formData.tags || null,
            value: Number(formData.value) || 0,
            weightC: Number(formData.weightC) || 1,
            weightI: Number(formData.weightI) || 1,
            weightA: Number(formData.weightA) || 1,
            legalStatus: formData.legalStatus || null,
            groupId: formData.groupId || null
        };

        console.log('📤 Sending asset data:', requestData); // для отладки
        onSave(requestData);
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
                    {/* Наименование (обязательное) */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold' }}>
                            Наименование <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            className="input"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Введите наименование актива"
                        />
                    </div>

                    {/* Категория (опционально) */}
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

                    {/* Статус (обязательный) */}
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>
                            Статус <span style={{ color: 'red' }}>*</span>
                        </label>
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

                    {/* Владелец (опционально) */}
                    <div className="form-group">
                        <label>Владелец</label>
                        <select
                            className="input select"
                            value={formData.owner}
                            onChange={(e) => handleChange('owner', e.target.value)}
                            disabled={loadingUsers}
                        >
                            <option value="">Не выбран</option>
                            {users.map(user => (
                                <option key={user.keycloakId} value={user.keycloakId}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Группа активов (опционально) */}
                    <div className="form-group">
                        <label>Группа</label>
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

                    {/* Стоимость (опционально) */}
                    <div className="form-group">
                        <label>Стоимость (руб.)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.value}
                            onChange={(e) => handleChange('value', e.target.value)}
                            step="0.01"
                        />
                    </div>

                    {/* Правовой статус (опционально) */}
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

                    {/* Веса CIA (опционально) */}
                    <div className="form-group">
                        <label>Вес конфиденциальности (0-2)</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.weightC}
                            onChange={(e) => handleChange('weightC', e.target.value)}
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
                            onChange={(e) => handleChange('weightI', e.target.value)}
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
                            onChange={(e) => handleChange('weightA', e.target.value)}
                            min="0"
                            max="2"
                            step="1"
                        />
                    </div>

                    {/* Местоположение (опционально) */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Местоположение</label>
                        <input
                            className="input"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="Физическое или логическое расположение"
                        />
                    </div>

                    {/* Описание (опционально) */}
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

                    {/* Оценка CIA (обязательная) */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <CIAInput
                            values={formData}
                            onChange={(cia) => setFormData(prev => ({ ...prev, ...cia }))}
                        />
                        <small style={{ color: 'var(--text-light)' }}>
                            <span style={{ color: 'red' }}>*</span> Конфиденциальность, целостность, доступность обязательны
                        </small>
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