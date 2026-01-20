// src/components/assets/AssetCard.jsx
import React from 'react';

// Временный StatusBadge внутри файла
const StatusBadge = ({ status }) => {
    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            background: status === 'active' ? '#e8f5e9' : '#fff3e0',
            color: status === 'active' ? '#2e7d32' : '#ef6c00'
        }}>
            {status === 'active' ? 'Активен' : 'Требует проверки'}
        </span>
    );
};

// Основной компонент AssetCard
const AssetCard = ({ asset, onRequestUpdate, viewOnly }) => {
    return (
        <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #ddd',
            marginBottom: '15px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h4 style={{ margin: 0 }}>{asset.name}</h4>
                <StatusBadge status={asset.status} />
            </div>

            <p style={{ color: '#666', marginBottom: '15px' }}>{asset.description}</p>

            <div style={{ marginBottom: '15px' }}>
                <div><strong>Категория:</strong> {asset.category}</div>
                <div><strong>Владелец:</strong> {asset.owner}</div>
                <div><strong>Последняя проверка:</strong> {asset.lastReview}</div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#777' }}>Конф.</div>
                    <div style={{ fontWeight: 'bold', color: '#f44336' }}>{asset.confidentiality}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#777' }}>Целост.</div>
                    <div style={{ fontWeight: 'bold', color: '#ff9800' }}>{asset.integrity}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#777' }}>Доступ.</div>
                    <div style={{ fontWeight: 'bold', color: '#4caf50' }}>{asset.availability}</div>
                </div>
            </div>

            {!viewOnly && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => onRequestUpdate(asset.id, { status: 'needs_review' })}
                        style={{
                            padding: '8px 16px',
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Запросить проверку
                    </button>
                    <button style={{
                        padding: '8px 16px',
                        background: '#f5f5f5',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Подробнее
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssetCard;