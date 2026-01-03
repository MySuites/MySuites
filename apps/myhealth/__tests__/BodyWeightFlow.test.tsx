
import { DataRepository, TABLES } from '../providers/DataRepository';
import { storage } from '../utils/storage';

// Mock Storage
jest.mock('../utils/storage', () => ({
    storage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
    },
}));

describe('Local-First Body Weight Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save body weight to local storage', async () => {
        const input = { userId: 'user-1', weight: 150, date: '2025-01-01' };
        
        await DataRepository.saveBodyWeight(input);
        
        const setItemCalls = (storage.setItem as jest.Mock).mock.calls;
        const call = setItemCalls.find(c => c[0] === TABLES.BODY_MEASUREMENTS);
        
        expect(call).toBeDefined();
        const savedData = call[1];
        expect(savedData).toHaveLength(1);
        expect(savedData[0].weight).toBe(150);
        expect(savedData[0].userId).toBe('user-1');
        expect(savedData[0].syncStatus).toBe('pending');
    });

    it('should retrieve latest body weight', async () => {
        const mockData = [
            { id: '1', userId: 'user-1', weight: 140, date: '2024-12-31', createdAt: '2024-12-31T00:00:00Z' },
            { id: '2', userId: 'user-1', weight: 145, date: '2025-01-01', createdAt: '2025-01-01T00:00:00Z' },
        ];
        
        (storage.getItem as jest.Mock).mockResolvedValue(mockData);
        
        const latest = await DataRepository.getLatestBodyWeight('user-1');
        expect(latest).toBe(145);
    });

    it('should retrieve history sorted by date', async () => {
        const mockData = [
            { id: '2', userId: 'user-1', weight: 145, date: '2025-01-01', createdAt: '2025-01-01T00:00:00Z' },
            { id: '1', userId: 'user-1', weight: 140, date: '2024-12-31', createdAt: '2024-12-31T00:00:00Z' },
        ];
        
        (storage.getItem as jest.Mock).mockResolvedValue(mockData);
        
        const history = await DataRepository.getBodyWeightHistory('user-1');
        expect(history[0].weight).toBe(140); // 2024-12-31
        expect(history[1].weight).toBe(145); // 2025-01-01
    });
});
