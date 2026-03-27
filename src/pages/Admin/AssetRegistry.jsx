import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import assetApi from '../../services/assetApi';
import StatusBadge from '../../components/common/StatusBadge';
import AssetCreateModal from '../../components/assets/AssetCreateModal';
import '../../styles/prototype.css';

const AssetRegistry = () => {
    const [assets, setAssets] = useState([]);
    const [filters, setFilters] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [selectedAssetThreats, setSelectedAssetThreats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssets();
    }, [filters]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const data = await assetApi.getAll(filters);
            setAssets(data);
        } catch (error) {
            console.error('Ошибка загрузки активов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (asset) => {
        setSelectedAsset(asset);
        setSelectedAssetId(asset.id);
        try {
            const threats = await assetApi.getAssetThreats(asset.id);
            setSelectedAssetThreats(threats);
        } catch (error) {
            console.error('Ошибка загрузки угроз актива:', error);
            setSelectedAssetThreats([]);
        }
        setShowCreateModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот актив?')) {
            try {
                await assetApi.delete(id);
                fetchAssets();
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    };

    const mapStatusToClient = (status) => {
        switch (status) {
            case 'ACTIVE': return 'active';
            case 'NEEDS_REVIEW': return 'needs_review';
            case 'ARCHIVED': return 'archived';
            case 'DRAFT': return 'draft';
            default: return 'active';
        }
    };

    const mapCiaToClient = (cia) => {
        if (!cia) return 'medium';
        return cia.toLowerCase();
    };

    const mapAssetToForm = (asset) => ({
        name: asset.name,
        owner: asset.ownerId,
        status: mapStatusToClient(asset.status),
        confidentiality: mapCiaToClient(asset.confidentiality),
        integrity: mapCiaToClient(asset.integrity),
        availability: mapCiaToClient(asset.availability),
        lastReview: asset.lastReview,
        description: asset.description,
        location: asset.location,
        tags: asset.tags,
        value: asset.value,
        weightC: asset.weightC,
        weightI: asset.weightI,
        weightA: asset.weightA,
        legalStatus: asset.legalStatus,
        groupId: asset.group ? asset.group.id : null
    });

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'name',
            headerName: 'Наименование',
            width: 200,
            renderCell: (params) => <strong>{params.value}</strong>
        },
        { field: 'ownerId', headerName: 'Владелец (ID)', width: 150 },
        {
            field: 'status',
            headerName: 'Статус',
            width: 120,
            renderCell: (params) => <StatusBadge status={mapStatusToClient(params.value)} size="small" />
        },
        {
            field: 'value',
            headerName: 'Стоимость (руб.)',
            width: 120,
            renderCell: (params) => params.value ? params.value.toLocaleString() : '-'
        },
        {
            field: 'latestRisk',
            headerName: 'Риск (руб.)',
            width: 130,
            renderCell: (params) => {
                const risk = params.value;
                if (!risk) return '—';
                const color = risk > 1000000 ? '#ef4444' : risk > 100000 ? '#f59e0b' : '#10b981';
                return <span style={{ color, fontWeight: 500 }}>{risk.toLocaleString()}</span>;
            }
        },
        {
            field: 'legalStatus',
            headerName: 'Правовой статус',
            width: 150,
            renderCell: (params) => {
                const map = { pers_data: 'Персональные данные', commercial_secret: 'Коммерческая тайна', other: 'Иное' };
                return map[params.value] || params.value || '-';
            }
        },
        {
            field: 'groupName',
            headerName: 'Группа',
            width: 150,
            renderCell: (params) => params.value || '-'
        },
        {
            field: 'confidentiality',
            headerName: 'Конф-ть',
            width: 100,
            renderCell: (params) => (
                <span className={`badge level-${params.value.toLowerCase()}`}>{params.value}</span>
            )
        },
        { field: 'lastReview', headerName: 'Последняя проверка', width: 150 },
        {
            field: 'actions',
            headerName: 'Действия',
            width: 200,
            renderCell: (params) => (
                <div className="action-buttons">
                    <button className="btn btn-sm btn-secondary" onClick={() => window.location.href = `/admin/assets/${params.row.id}`}>👁️</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(params.row)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(params.row.id)}>🗑️</button>
                </div>
            )
        }
    ];

    return (
        <div className="asset-registry">
            <div className="content-header">
                <h1>Реестр информационных активов</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => {
                        setSelectedAsset(null);
                        setSelectedAssetId(null);
                        setSelectedAssetThreats([]);
                        setShowCreateModal(true);
                    }}>+ Добавить актив</button>
                </div>
            </div>
            <div className="main-content">
                <div className="card">
                    <div className="card-header">
                        <div className="filters">
                            <input className="input" type="text" placeholder="Поиск по названию..." onChange={(e) => setFilters({...filters, search: e.target.value})} />
                            <select className="input" onChange={(e) => setFilters({...filters, status: e.target.value})}>
                                <option value="">Все статусы</option>
                                <option value="active">Активен</option>
                                <option value="needs_review">На проверке</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body" style={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={assets}
                            columns={columns}
                            loading={loading}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            checkboxSelection
                            disableSelectionOnClick
                        />
                    </div>
                </div>
            </div>
            {showCreateModal && (
                <AssetCreateModal
                    assetId={selectedAssetId}
                    initialData={selectedAsset ? mapAssetToForm(selectedAsset) : null}
                    existingThreats={selectedAssetThreats}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedAsset(null);
                        setSelectedAssetId(null);
                        setSelectedAssetThreats([]);
                    }}
                    onSave={async (savedAsset) => {
                        await fetchAssets();
                        setShowCreateModal(false);
                        setSelectedAsset(null);
                        setSelectedAssetId(null);
                        setSelectedAssetThreats([]);
                    }}
                />
            )}
        </div>
    );
};

export default AssetRegistry;