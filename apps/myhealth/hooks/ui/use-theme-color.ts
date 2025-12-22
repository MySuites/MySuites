/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "../../constants/theme";
import { useColorScheme } from "./use-color-scheme";
import { useUITheme } from "@mycsuite/ui";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const uiTheme = useUITheme();
  const scheme = useColorScheme() ?? "light";

  const colorFromProps = props[scheme];
  if (colorFromProps) return colorFromProps;

  if (uiTheme && uiTheme[colorName]) return uiTheme[colorName];

  return Colors[scheme][colorName];
}
