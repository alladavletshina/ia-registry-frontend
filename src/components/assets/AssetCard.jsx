import StatusBadge from "../common/StatusBadge";

const AssetCard = ({ asset, onRequestUpdate, viewOnly }) => {
    return (
        <div className={`asset-card status-${asset.status}`}>
            <div className="card-header">
                <h4>{asset.name}</h4>
                <StatusBadge status={asset.status} />
            </div>

            <div className="card-body">
                <p className="description">{asset.description}</p>

                <div className="metadata">
                    <div><strong>Категория:</strong> {asset.category}</div>
                    <div><strong>Владелец:</strong> {asset.owner}</div>
                    <div><strong>Обновлено:</strong> {asset.updatedAt}</div>
                </div>

                <div className="cia-rating">
                    <div className="cia-item">
                        <span className="label">Конф.</span>
                        <span className={`value level-${asset.confidentiality}`}>
              {asset.confidentiality}
            </span>
                    </div>
                    <div className="cia-item">
                        <span className="label">Целост.</span>
                        <span className={`value level-${asset.integrity}`}>
              {asset.integrity}
            </span>
                    </div>
                    <div className="cia-item">
                        <span className="label">Доступ.</span>
                        <span className={`value level-${asset.availability}`}>
              {asset.availability}
            </span>
                    </div>
                </div>
            </div>

            {!viewOnly && (
                <div className="card-actions">
                    <button onClick={() => onRequestUpdate(asset.id, { status: 'needs_review' })}>
                        Запросить проверку
                    </button>
                    <button onClick={() => {/* Открыть детали */}}>
                        Подробнее
                    </button>
                </div>
            )}
        </div>
    );
};

