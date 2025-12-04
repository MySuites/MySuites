// Define globals required by React Native
global.__DEV__ = true;

// import "@testing-library/jest-native/extend-expect";

// Mock the auth package to avoid Supabase initialization errors
jest.mock("@mycsuite/auth", () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe: jest.fn() } },
            })),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                    maybeSingle: jest.fn(),
                })),
            })),
        })),
    },
    useAuth: jest.fn(() => ({ session: null, user: null })),
}));
