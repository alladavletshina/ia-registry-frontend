// src/components/assets/CIAInput.jsx
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
        <div className="cia-input-container">
            <h4>Оценка CIA</h4>
            <div className="cia-inputs">
                <div className="cia-input-group">
                    <label>Конфиденциальность</label>
                    <select
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