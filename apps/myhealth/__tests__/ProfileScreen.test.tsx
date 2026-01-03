
import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileScreen from '../app/profile/index';

// Mocks
jest.mock('@mysuite/auth', () => ({
  useAuth: jest.fn(),
  supabase: {
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                maybeSingle: jest.fn().mockResolvedValue({ data: null })
            }))
        }))
    }))
  }
}));

jest.mock('@mysuite/ui', () => ({
  useUITheme: jest.fn(() => ({ primary: 'blue', danger: 'red', placeholder: 'gray' })),
  RaisedButton: 'RaisedButton',
  IconSymbol: 'IconSymbol'
}));

jest.mock('../components/ui/ScreenHeader', () => ({
  ScreenHeader: 'ScreenHeader'
}));

jest.mock('../components/ui/BackButton', () => ({
  BackButton: 'BackButton'
}));

jest.mock('../components/ui/BackButton', () => ({
  BackButton: 'BackButton'
}));

// Import useAuth to mock implementation per test
import { useAuth } from '@mysuite/auth';

describe('ProfileScreen', () => {
  it('renders auth inputs when user is null (guest)', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    
    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);
    
    expect(getByText('Sign in to view your profile')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders Profile content when user is logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: '123', email: 'test@example.com' } });
    
    const { queryByText, getByText } = render(<ProfileScreen />);
    
    expect(queryByText('Sign in to view your profile')).toBeNull();
    expect(getByText('Account')).toBeTruthy(); // Part of profile view
    expect(getByText('test@example.com')).toBeTruthy();
  });
});
