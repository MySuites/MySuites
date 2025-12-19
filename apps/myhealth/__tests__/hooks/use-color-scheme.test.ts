import { renderHook } from "@testing-library/react-native";
import { useColorScheme } from "../../hooks/use-color-scheme";

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native");
    return Object.defineProperty(RN, "useColorScheme", {
        get: jest.fn(() => () => "dark"),
        configurable: true,
    });
});

describe("useColorScheme (web)", () => {
    it('returns "light" initially before hydration', () => {
        const { result } = renderHook(() => useColorScheme());

        expect(result.current).toBe("dark");
    });
});
