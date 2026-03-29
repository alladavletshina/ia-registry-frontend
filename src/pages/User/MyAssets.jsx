import React, { useState, useEffect } from 'react';
import assetApi from '../../services/assetApi';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/prototype.css';

const MyAssets = () => {
    const [myAssets, setMyAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchMyAssets();
    }, []);

    const fetchMyAssets = async () => {
        setLoading(true);
        try {
            // Используем реальный API для получения активов текущего пользователя
            const data = await assetApi.getMyAssets();
            setMyAssets(data);
        } catch (error) {
            console.error('Ошибка загрузки активов пользователя:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestUpdate = async (assetId, changes) => {
        // Здесь можно отправить запрос на изменение (например, изменить статус на "needs_review")
        console.log('Запрос на изменение актива:', assetId, changes);
        // В реальности можно вызвать API для создания заявки на изменение
        alert('Запрос на изменение отправлен администратору');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка ваших активов...</p>
            </div>
        );
    }

    return (
        <div className="user-assets">
            <div className="content-header">
                <h1>Мои информационные активы</h1>
                <p>Список активов, за которые вы отвечаете как владелец</p>
            </div>

            <div className="main-content">
                {myAssets.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <p>У вас пока нет назначенных активов</p>
                        <p className="text-light">Обратитесь к администратору, чтобы вам назначили активы.</p>
                    </div>
                ) : (
                    <div className="assets-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '20px'
                    }}>
                        {myAssets.map(asset => (
                            <div key={asset.id} className={`asset-card status-${asset.status?.toLowerCase() || 'active'}`}>
                                <div className="card-header">
                                    <h4>{asset.name}</h4>
                                    <StatusBadge status={asset.status?.toLowerCase()} />
                                </div>
                                <div className="card-body">
                                    <p className="description">{asset.description || 'Нет описания'}</p>
                                    <div className="metadata">
                                        <div><strong>Категория:</strong> {asset.category || '—'}</div>
                                        <div><strong>Владелец:</strong> {asset.ownerId}</div>
                                        <div><strong>Последняя проверка:</strong> {asset.lastReview || '—'}</div>
                                        <div><strong>Группа:</strong> {asset.group?.name || '—'}</div>
                                    </div>
                                    <div className="cia-rating">
                                        <div className="cia-item">
                                            <span className="label">Конф.</span>
                                            <span className={`value level-${asset.confidentiality?.toLowerCase()}`}>
                                                {asset.confidentiality}
                                            </span>
                                        </div>
                                        <div className="cia-item">
                                            <span className="label">Целост.</span>
                                            <span className={`value level-${asset.integrity?.toLowerCase()}`}>
                                                {asset.integrity}
                                            </span>
                                        </div>
                                        <div className="cia-item">
                                            <span className="label">Дост.</span>
                                            <span className={`value level-${asset.availability?.toLowerCase()}`}>
                                                {asset.availability}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className="btn btn-secondary flex-1"
                                            onClick={() => handleRequestUpdate(asset.id, { status: 'needs_review' })}
                                        >
                                            Запросить проверку
                                        </button>
                                        <button
                                            className="btn btn-primary flex-1"
                                            onClick={() => window.location.href = `/user/assets/${asset.id}`}
                                        >
                                            Подробнее
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAssets;