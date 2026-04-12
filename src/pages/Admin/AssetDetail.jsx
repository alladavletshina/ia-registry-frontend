import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import assetApi from '../../services/assetApi';
import userApi from '../../services/userApi';
import StatusBadge from '../../components/common/StatusBadge';
import AssetCreateModal from '../../components/assets/AssetCreateModal';

const getLegalStatusLabel = (status) => {
    switch(status) {
        case 'pers_data': return 'Персональные данные';
        case 'commercial_secret': return 'Коммерческая тайна';
        case 'other': return 'Иное';
        default: return status || '—';
    }
};

const AssetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [usersMap, setUsersMap] = useState({});

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await userApi.getAll();
                const map = {};
                users.forEach(user => {
                    map[user.keycloakId] = `${user.firstName} ${user.lastName} (${user.email})`;
                });
                setUsersMap(map);
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error);
            }
        };
        loadUsers();
    }, []);

    const loadAsset = useCallback(async () => {
        try {
            const data = await assetApi.getById(id);
            setAsset(data);
        } catch (error) {
            console.error('Ошибка загрузки актива:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadAsset();
    }, [loadAsset]);

    const handleArchive = async () => {
        if (!window.confirm('Вы уверены, что хотите архивировать этот актив?')) return;
        try {
            await assetApi.patchAsset(id, { status: 'ARCHIVED' });
            await loadAsset();
            alert('Актив архивирован');
        } catch (error) {
            console.error('Ошибка архивации:', error);
            alert('Не удалось архивировать актив');
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleEditSave = (updatedAsset) => {
        setAsset(updatedAsset);
        setShowEditModal(false);
    };

    if (loading) return <div className="loading-container">Загрузка...</div>;
    if (!asset) return <div className="empty-state">Актив не найден</div>;

    const isArchived = asset.status === 'ARCHIVED';
    const ownerName = usersMap[asset.ownerId] || asset.ownerId || '—';

    return (
        <div className="asset-view">
            <div className="asset-header">
                <div className="asset-header-left">
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/assets')}>
                        ← Назад
                    </button>
                    <h1>{asset.name}</h1>
                </div>
                <div className="asset-meta">
                    <StatusBadge status={asset.status?.toLowerCase()} />
                </div>
            </div>

            <div className="detail-section">
                <h3>Основная информация</h3>
                <div className="detail-grid">
                    <div className="detail-item"><strong>ID:</strong> <span>{asset.id}</span></div>
                    <div className="detail-item"><strong>Владелец:</strong> <span>{ownerName}</span></div>
                    <div className="detail-item"><strong>Статус:</strong> <StatusBadge status={asset.status?.toLowerCase()} /></div>
                    <div className="detail-item"><strong>Последняя проверка:</strong> <span>{asset.lastReview || '—'}</span></div>
                    <div className="detail-item"><strong>Создан:</strong> <span>{new Date(asset.createdAt).toLocaleDateString()}</span></div>
                    <div className="detail-item"><strong>Обновлён:</strong> <span>{new Date(asset.updatedAt).toLocaleDateString()}</span></div>
                    <div className="detail-item"><strong>Стоимость:</strong> <span>{asset.value ? asset.value.toLocaleString() + ' руб.' : '—'}</span></div>
                    <div className="detail-item"><strong>Правовой статус:</strong> <span>{getLegalStatusLabel(asset.legalStatus)}</span></div>
                    <div className="detail-item"><strong>Группа:</strong> <span>{asset.groupName || 'Без группы'}</span></div>
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

            <div className="detail-section">
                <h3>Описание</h3>
                <p>{asset.description || 'Нет описания'}</p>
            </div>

            {asset.location && (
                <div className="detail-section">
                    <h3>Местоположение</h3>
                    <p>{asset.location}</p>
                </div>
            )}

            <div className="asset-actions">
                <button className="btn btn-primary" onClick={handleEdit}>Редактировать</button>
                {!isArchived && (
                    <button className="btn btn-danger" onClick={handleArchive}>Архивировать</button>
                )}
            </div>

            {showEditModal && (
                <AssetCreateModal
                    assetId={asset.id}
                    initialData={{
                        name: asset.name,
                        owner: asset.ownerId,
                        status: mapStatusToForm(asset.status),
                        confidentiality: asset.confidentiality?.toLowerCase(),
                        integrity: asset.integrity?.toLowerCase(),
                        availability: asset.availability?.toLowerCase(),
                        lastReview: asset.lastReview,
                        description: asset.description,
                        location: asset.location,
                        tags: asset.tags,
                        value: asset.value,
                        legalStatus: asset.legalStatus,
                        groupId: asset.groupId
                    }}
                    existingThreats={[]}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
};

const mapStatusToForm = (status) => {
    switch(status) {
        case 'ACTIVE': return 'active';
        case 'NEEDS_REVIEW': return 'needs_review';
        case 'ARCHIVED': return 'archived';
        default: return 'active';
    }
};

export default AssetDetail;