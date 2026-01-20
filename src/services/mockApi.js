import { mockAssets, mockUsers } from '../mockData';

// Имитация задержки API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthAPI = {
    login: async (credentials) => {
        await delay(500);

        // Демо-логика аутентификации
        if (credentials.login === 'admin' && credentials.password === 'admin123') {
            return {
                data: {
                    token: 'demo-jwt-token-admin',
                    user: {
                        id: 1,
                        username: 'admin',
                        fullName: 'Администратор Системы',
                        email: 'admin@company.com',
                        role: 'admin'
                    }
                }
            };
        }

        if (credentials.login === 'user' && credentials.password === 'user123') {
            return {
                data: {
                    token: 'demo-jwt-token-user',
                    user: {
                        id: 2,
                        username: 'user1',
                        fullName: 'Иванов Иван Иванович',
                        email: 'i.ivanov@company.com',
                        role: 'user'
                    }
                }
            };
        }

        throw new Error('Неверные учетные данные');
    },

    logout: async () => {
        await delay(200);
        return { success: true };
    }
};

export const mockAssetsAPI = {
    getAll: async (filters = {}) => {
        await delay(300);

        let filteredAssets = [...mockAssets];

        if (filters.category) {
            filteredAssets = filteredAssets.filter(a => a.category === filters.category);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredAssets = filteredAssets.filter(a =>
                a.name.toLowerCase().includes(searchLower) ||
                a.description.toLowerCase().includes(searchLower)
            );
        }

        return { data: filteredAssets };
    },

    getById: async (id) => {
        await delay(200);
        const asset = mockAssets.find(a => a.id === parseInt(id));
        if (!asset) throw new Error('Актив не найден');
        return { data: asset };
    },

    create: async (asset) => {
        await delay(400);
        const newAsset = {
            ...asset,
            id: mockAssets.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockAssets.push(newAsset);
        return { data: newAsset };
    },

    update: async (id, updates) => {
        await delay(400);
        const index = mockAssets.findIndex(a => a.id === parseInt(id));
        if (index === -1) throw new Error('Актив не найден');

        mockAssets[index] = { ...mockAssets[index], ...updates, updatedAt: new Date().toISOString() };
        return { data: mockAssets[index] };
    },

    delete: async (id) => {
        await delay(300);
        const index = mockAssets.findIndex(a => a.id === parseInt(id));
        if (index === -1) throw new Error('Актив не найден');

        mockAssets.splice(index, 1);
        return { success: true };
    },

    getMyAssets: async () => {
        await delay(300);
        // Для демо: user видит только активы, где он владелец
        const userAssets = mockAssets.filter(a => a.owner.includes('Иванов'));
        return { data: userAssets };
    }
};

export const mockUsersAPI = {
    getAll: async () => {
        await delay(300);
        return { data: mockUsers };
    },

    create: async (user) => {
        await delay(400);
        const newUser = {
            ...user,
            id: mockUsers.length + 1,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        mockUsers.push(newUser);
        return { data: newUser };
    },

    update: async (id, updates) => {
        await delay(400);
        const index = mockUsers.findIndex(u => u.id === parseInt(id));
        if (index === -1) throw new Error('Пользователь не найден');

        mockUsers[index] = { ...mockUsers[index], ...updates };
        return { data: mockUsers[index] };
    }
};