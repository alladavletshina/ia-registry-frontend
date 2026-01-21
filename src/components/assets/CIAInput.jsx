// src/components/assets/CIAInput.jsx
import React from 'react';
import '../../styles/prototype.css';

const CIAInput = ({ values, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ [field]: value });
    };

    const levels = [
        { value: 'low', label: 'Низкий' },
        { value: 'medium', label: 'Средний' },
        { value: 'high', label: 'Высокий' },
        { value: 'critical', label: 'Критический' }
    ];

    return (
        <div className="cia-input-container" style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '16px' }}>Оценка CIA</h4>
            <div className="cia-inputs" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
            }}>
                <div className="cia-input-group">
                    <label>Конфиденциальность</label>
                    <select
                        className="input select"
                        value={values.confidentiality}
                        onChange={(e) => handleChange('confidentiality', e.target.value)}
                    >
                        {levels.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="cia-input-group">
                    <label>Целостность</label>
                    <select
                        className="input select"
                        value={values.integrity}
                        onChange={(e) => handleChange('integrity', e.target.value)}
                    >
                        {levels.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="cia-input-group">
                    <label>Доступность</label>
                    <select
                        className="input select"
                        value={values.availability}
                        onChange={(e) => handleChange('availability', e.target.value)}
                    >
                        {levels.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CIAInput;