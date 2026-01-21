import React, { useState } from 'react';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([
        { id: 1, name: 'Базы данных', description: 'Базы данных и хранилища', assetCount: 15 },
        { id: 2, name: 'Документация', description: 'Техническая и пользовательская документация', assetCount: 42 },
        { id: 3, name: 'ПО', description: 'Программное обеспечение', assetCount: 28 },
        { id: 4, name: 'Оборудование', description: 'Физическое оборудование', assetCount: 12 },
    ]);

    return (
        <div className="category-management">
            <div className="content-header">
                <h1>Управление категориями</h1>
                <div className="header-actions">
                    <button className="btn btn-primary">+ Добавить категорию</button>
                </div>
            </div>

            <div className="main-content">
                <div className="card">
                    <div className="card-header">
                        <h3>Категории активов</h3>
                    </div>
                    <div className="card-body">
                        <div className="categories-grid">
                            {categories.map(category => (
                                <div key={category.id} className="category-card">
                                    <div className="category-header">
                                        <h4>{category.name}</h4>
                                        <span className="badge badge-primary">{category.assetCount} активов</span>
                                    </div>
                                    <p className="description">{category.description}</p>
                                    <div className="category-actions">
                                        <button className="btn btn-sm btn-secondary">✏️ Редактировать</button>
                                        <button className="btn btn-sm btn-danger">🗑️ Удалить</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;