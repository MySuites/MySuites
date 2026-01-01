import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProfileScreen from '../../app/profile/index';
import { supabase } from '@mysuite/auth';
import { View, Text, Button } from 'react-native';

// Mock Dependencies
jest.mock('../../components/profile/BodyWeightCard', () => {
    const { View, Text, Button } = require('react-native');
    return {
        BodyWeightCard: ({ weight, onLogWeight }: any) => (
            <View testID="body-weight-card">
                <Text testID="current-weight">{weight ? `${weight} kg` : 'No Data'}</Text>
                <Button title="Log Weight" onPress={onLogWeight} />
            </View>
        )
    };
});

jest.mock('../../components/profile/WeightLogModal', () => {
    const { View, Button } = require('react-native');
    return {
        WeightLogModal: ({ visible, onSave }: any) => visible ? (
            <View testID="weight-log-modal">
                <Button title="Save 75kg" onPress={() => onSave(75, new Date())} />
            </View>
        ) : null
    };
});

jest.mock('@mysuite/ui', () => {
    const { View, Text } = require('react-native');
    return {
        useUITheme: () => ({ primary: 'blue', textMuted: 'gray' }),
        RaisedButton: ({ children, onPress }: any) => (
            <View accessibilityRole="button">
                <Text onPress={onPress}>RaisedButton</Text>
                {children}
            </View>
        ),
        useToast: () => ({ showToast: jest.fn() }),
        IconSymbol: () => <View />,
    };
});

jest.mock('../../components/ui/BackButton', () => {
    const { View } = require('react-native');
    return {
        BackButton: () => <View testID="back-button" />
    };
});

// Tests
describe('Profile Update Flow', () => {
    // In-Memory DB State
    let bodyMeasurements: any[] = [];

    beforeEach(() => {
        bodyMeasurements = [];
        
        // Mock User
        (require('@mysuite/auth').useAuth as jest.Mock).mockReturnValue({
            user: { id: 'test-user-id' }
        });
        
        // Robust Supabase Mock
        (supabase as any).from = jest.fn((table) => {
            const chain = {
                select: jest.fn((columns) => {
                    chain.columns = columns;
                    return chain;
                }),
                eq: jest.fn((col, val) => {
                    // Store filters if needed, or Apply immediately?
                    // For this test, we only primarily care about user_id (ignore) or finding specific entries.
                    // But wait, the code checks for existence by date.
                    if (col === 'date') chain.dateFilter = val;
                    return chain;
                }),
                gte: jest.fn(() => chain),
                order: jest.fn(() => chain),
                limit: jest.fn(() => chain),
                maybeSingle: jest.fn(async () => {
                    if (table === 'profiles') return { data: { username: 'TestUser' }, error: null };
                    
                    if (table === 'body_measurements') {
                        console.log('Mock: maybeSingle for columns:', chain.columns, 'Table size:', bodyMeasurements.length);
                        // Check logic based on what was selected
                        if (chain.columns === 'id') {
                            // Existence check by date
                            const exists = bodyMeasurements.find(m => m.date === chain.dateFilter);
                            console.log('Mock: Existence check for date:', chain.dateFilter, 'Found:', exists);
                            return { data: exists, error: null };
                        }
                         if (chain.columns === 'weight') {
                            // Fetch Latest
                            // Sort by date (simple mock assumption: last pushed is latest or we sort)
                            const latest = bodyMeasurements[bodyMeasurements.length - 1];
                            console.log('Mock: Fetching latest weight. Result:', latest);
                            return { data: latest || null, error: null };
                        }
                    }
                     return { data: null, error: null };
                }),
                insert: jest.fn(async (row) => {
                    console.log('Mock: Insert row:', row);
                    bodyMeasurements.push(row);
                    return { error: null };
                }),
                update: jest.fn(async (updates) => {
                     // In a real DB we'd find by ID and update.
                     // Here we just assume it works or update the last one.
                     if (bodyMeasurements.length > 0) {
                        Object.assign(bodyMeasurements[bodyMeasurements.length - 1], updates);
                     }
                     return { error: null };
                }),
                then: (resolve: any) => Promise.resolve({ data: bodyMeasurements, error: null }).then(resolve) // fallback for array returns
            } as any;
            return chain;
        });
    });

    it('updates body weight successfully', async () => {
        const { getByTestId, getByText } = render(<ProfileScreen />);

        // 1. Initial State
        await waitFor(() => {
            expect(getByTestId('current-weight').children[0]).toBe('No Data');
        });

        // 2. Open Modal
        fireEvent.press(getByText('Log Weight'));
        
        // 3. Save Weight (75kg)
        fireEvent.press(getByText('Save 75kg'));

        // 4. Verify Update
        await waitFor(() => {
             // Expect 75kg
             expect(getByTestId('current-weight').children[0]).toBe('75 kg');
        });
    });
});
