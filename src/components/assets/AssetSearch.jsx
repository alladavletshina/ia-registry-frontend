import React, { useState, useCallback, useRef, useEffect } from 'react';
import assetApi from '../../services/assetApi';

const AssetSearch = ({ value, onChange, placeholder = "Поиск актива..." }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // Простой debounce без lodash
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const loadAssets = useCallback(
        debounce(async (query) => {
            if (!query || query.length < 2) {
                setOptions([]);
                return;
            }
            setLoading(true);
            try {
                const response = await assetApi.searchAssets(query.toLowerCase(), { page: 0, size: 10 });
                setOptions(response.content || []);
            } catch (error) {
                console.error('Ошибка загрузки активов:', error);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        loadAssets(val);
        setShowDropdown(true);
    };

    const handleSelect = (asset) => {
        setInputValue(asset.name);
        onChange(asset.id);
        setShowDropdown(false);
    };

    // Закрытие выпадающего списка при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Если value передан извне (при редактировании), подгружаем название актива
    useEffect(() => {
        if (value && !inputValue) {
            assetApi.getById(value).then(asset => setInputValue(asset.name)).catch(() => {});
        }
    }, [value, inputValue]);

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <input
                type="text"
                className="input"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    if (inputValue && inputValue.length >= 2) {
                        loadAssets(inputValue);
                        setShowDropdown(true);
                    }
                }}
                placeholder={placeholder}
                autoComplete="off"
            />
            {showDropdown && (options.length > 0 || loading) && (
                <ul className="asset-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 1000,
                    listStyle: 'none',
                    margin: 0,
                    padding: 0
                }}>
                    {loading && <li style={{ padding: '8px 12px' }}>Загрузка...</li>}
                    {options.map(asset => (
                        <li
                            key={asset.id}
                            onClick={() => handleSelect(asset)}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-100)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {asset.name} {asset.ownerId && `(владелец: ${asset.ownerId})`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AssetSearch;