import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Alert,
    Snackbar,
    TablePagination
} from '@mui/material';
import {
    Sync,
    Search,
    Visibility,
    Refresh,
    CheckCircle,
    Cancel,
    UploadFile        // <-- добавляем иконку загрузки
} from '@mui/icons-material';
import threatApi from '../../services/threatApi';
import '../../styles/prototype.css';

const ThreatManagement = () => {
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(100);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedThreat, setSelectedThreat] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Реф для скрытого input file
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadThreats();
    }, [page, pageSize, search]);

    const loadThreats = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: pageSize,
                search: search || undefined,
            };
            const data = await threatApi.getAll(params);
            setThreats(data.content || []);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            showSnackbar('Ошибка загрузки угроз', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(0);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSync = async () => {
        if (!window.confirm('Запустить синхронизацию с БДУ ФСТЭК? Это может занять несколько секунд.')) {
            return;
        }
        setSyncLoading(true);
        try {
            const message = await threatApi.sync();
            showSnackbar(message || 'Синхронизация успешно запущена', 'success');
            setTimeout(() => loadThreats(), 2000);
        } catch (error) {
            showSnackbar('Ошибка синхронизации: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setSyncLoading(false);
        }
    };

    // Обработчик выбора файла XLSX
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Проверяем расширение – только .xlsx
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            showSnackbar('Поддерживаются только файлы .xlsx', 'error');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setSyncLoading(true);
        try {
            const message = await threatApi.uploadThreatsFile(file);
            showSnackbar(message || 'Файл успешно загружен и обработан', 'success');
            // Обновляем таблицу угроз через секунду
            setTimeout(() => loadThreats(), 1000);
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Ошибка загрузки файла';
            showSnackbar(errMsg, 'error');
        } finally {
            setSyncLoading(false);
            // Очищаем input, чтобы можно было загрузить тот же файл повторно
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleViewDetails = (threat) => {
        setSelectedThreat(threat);
        setDetailOpen(true);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        {
            field: 'name',
            headerName: 'Наименование',
            width: 300,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <span style={{ fontWeight: 500 }}>{params.value}</span>
                </Tooltip>
            )
        },
        { field: 'objectAffected', headerName: 'Объект воздействия', width: 150 },
        {
            field: 'confidentiality',
            headerName: 'К',
            width: 50,
            align: 'center',
            renderCell: (params) => params.value ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="disabled" fontSize="small" />
        },
        {
            field: 'integrity',
            headerName: 'Ц',
            width: 50,
            align: 'center',
            renderCell: (params) => params.value ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="disabled" fontSize="small" />
        },
        {
            field: 'availability',
            headerName: 'Д',
            width: 50,
            align: 'center',
            renderCell: (params) => params.value ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="disabled" fontSize="small" />
        },
        {
            field: 'status',
            headerName: 'Статус',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value || '—'}
                    size="small"
                    color={params.value === 'Опубликована' ? 'success' : 'default'}
                />
            )
        },
        {
            field: 'lastModified',
            headerName: 'Изменено',
            width: 120,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('ru-RU') : '—'
        },
        {
            field: 'actions',
            headerName: 'Действия',
            width: 80,
            sortable: false,
            renderCell: (params) => (
                <IconButton size="small" color="primary" onClick={() => handleViewDetails(params.row)}>
                    <Visibility fontSize="small" />
                </IconButton>
            )
        }
    ];

    return (
        <div className="threat-management">
            <div className="content-header">
                <h1>Угрозы из БДУ ФСТЭК</h1>
                <div className="header-actions">
                    <Button
                        variant="contained"
                        startIcon={<Sync />}
                        onClick={handleSync}
                        disabled={syncLoading}
                    >
                        {syncLoading ? 'Синхронизация...' : 'Синхронизировать'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<UploadFile />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={syncLoading}
                    >
                        Загрузить XLSX
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".xlsx"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
                            <TextField
                                size="small"
                                placeholder="Поиск по наименованию..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                style={{ flex: 1, maxWidth: 400 }}
                            />
                            <Button variant="contained" onClick={handleSearch} disabled={loading}>
                                Найти
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                    setPage(0);
                                }}
                            >
                                Сбросить
                            </Button>
                        </div>
                    </div>

                    <div className="card-body" style={{ height: 500, width: '100%', marginBottom: '16px' }}>
                        <DataGrid
                            rows={threats}
                            columns={columns}
                            loading={loading}
                            hideFooterPagination
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            components={{
                                NoRowsOverlay: () => (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Typography color="textSecondary">Угрозы не найдены</Typography>
                                    </Box>
                                ),
                            }}
                        />
                    </div>

                    <TablePagination
                        component="div"
                        count={totalElements}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={(event) => {
                            setPageSize(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        labelRowsPerPage="Строк на странице:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                    />

                    <div className="card-footer">
                        <Typography variant="body2" color="textSecondary">
                            Всего записей: {totalElements}. Данные из Банка данных угроз безопасности информации ФСТЭК России.
                        </Typography>
                    </div>
                </div>
            </div>

            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Детали угрозы</DialogTitle>
                <DialogContent dividers>
                    {selectedThreat && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6">{selectedThreat.name}</Typography>
                            <Typography><strong>ID:</strong> {selectedThreat.id}</Typography>
                            <Typography><strong>Описание:</strong> {selectedThreat.description || '—'}</Typography>
                            <Typography><strong>Источник угрозы:</strong> {selectedThreat.source || '—'}</Typography>
                            <Typography><strong>Объект воздействия:</strong> {selectedThreat.objectAffected || '—'}</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Typography><strong>Конфиденциальность:</strong> {selectedThreat.confidentiality ? 'Да' : 'Нет'}</Typography>
                                <Typography><strong>Целостность:</strong> {selectedThreat.integrity ? 'Да' : 'Нет'}</Typography>
                                <Typography><strong>Доступность:</strong> {selectedThreat.availability ? 'Да' : 'Нет'}</Typography>
                            </Box>
                            <Typography><strong>Дата включения в БнД:</strong> {selectedThreat.inclusionDate ? new Date(selectedThreat.inclusionDate).toLocaleDateString('ru-RU') : '—'}</Typography>
                            <Typography><strong>Последнее изменение:</strong> {selectedThreat.lastModified ? new Date(selectedThreat.lastModified).toLocaleDateString('ru-RU') : '—'}</Typography>
                            <Typography><strong>Статус:</strong> {selectedThreat.status || '—'}</Typography>
                            <Typography><strong>Замечания:</strong> {selectedThreat.notes || '—'}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailOpen(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ThreatManagement;