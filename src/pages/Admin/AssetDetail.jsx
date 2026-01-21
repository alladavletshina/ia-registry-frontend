import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockAssetsAPI } from '../../services/mockApi';
import StatusBadge from '../../components/common/StatusBadge';

const AssetDetail = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAsset();
    }, [id]);

    const loadAsset = async () => {
        try {
            const response = await mockAssetsAPI.getById(id);
            setAsset(response.data);
        } catch (error) {
            console.error('Ошибка загрузки актива:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (!asset) return <div>Актив не найден</div>;

    return (
        <div className="asset-view">
            <div className="asset-header">
                <h1>{asset.name}</h1>
                <StatusBadge status={asset.status} />
            </div>

            <div className="detail-section">
                <h3>Основная информация</h3>
                <div className="detail-grid">
                    <div className="detail-item">
                        <strong>ID:</strong>
                        <span>{asset.id}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Категория:</strong>
                        <span>{asset.category}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Владелец:</strong>
                        <span>{asset.owner}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Статус:</strong>
                        <StatusBadge status={asset.status} />
                    </div>
                    <div className="detail-item">
                        <strong>Последняя проверка:</strong>
                        <span>{asset.lastReview}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Создан:</strong>
                        <span>{asset.createdAt || 'Не указано'}</span>
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h3>Оценка CIA</h3>
                <div className="cia-display">
                    <div className="cia-item">
                        <span className="label">Конфиденциальность</span>
                        <span className={`value level-${asset.confidentiality}`}>
                            {asset.confidentiality}
                        </span>
                    </div>
                    <div className="cia-item">
                        <span className="label">Целостность</span>
                        <span className={`value level-${asset.integrity}`}>
                            {asset.integrity}
                        </span>
                    </div>
                    <div className="cia-item">
                        <span className="label">Доступность</span>
                        <span className={`value level-${asset.availability}`}>
                            {asset.availability}
                        </span>
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <h3>Описание</h3>
                <p>{asset.description}</p>
            </div>

            <div className="asset-actions">
                <button className="btn btn-primary">Редактировать</button>
                <button className="btn btn-secondary">Скачать отчет</button>
                <button className="btn btn-danger">Архивировать</button>
            </div>
        </div>
    );
};

export default AssetDetail;