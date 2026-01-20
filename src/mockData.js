export const mockAssets = [
    {
        id: 1,
        name: 'База данных клиентов',
        category: 'database',
        owner: 'Иванов И.И.',
        status: 'active',
        confidentiality: 'high',
        integrity: 'high',
        availability: 'medium',
        lastReview: '2024-01-15',
        description: 'Основная база данных клиентов компании'
    },
    {
        id: 2,
        name: 'Внутренняя документация',
        category: 'documentation',
        owner: 'Петрова А.С.',
        status: 'needs_review',
        confidentiality: 'medium',
        integrity: 'high',
        availability: 'high',
        lastReview: '2023-12-01',
        description: 'Техническая документация и регламенты'
    },
    {
        id: 3,
        name: 'CRM система',
        category: 'software',
        owner: 'Сидоров В.П.',
        status: 'active',
        confidentiality: 'high',
        integrity: 'medium',
        availability: 'high',
        lastReview: '2024-01-20',
        description: 'Система управления взаимоотношениями с клиентами'
    }
];

export const mockUsers = [
    {
        id: 1,
        username: 'admin',
        fullName: 'Администратор Системы',
        email: 'admin@company.com',
        role: 'admin',
        department: 'ИТ'
    },
    {
        id: 2,
        username: 'user1',
        fullName: 'Иванов Иван Иванович',
        email: 'i.ivanov@company.com',
        role: 'user',
        department: 'Отдел продаж'
    }
];