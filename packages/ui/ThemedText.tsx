import { Text, type TextProps } from 'react-native';
import { useUITheme } from './theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useUITheme();
  const color = lightColor ?? darkColor ?? theme.text;


  let typeClasses = '';
  switch (type) {
    case 'default':
      typeClasses = 'text-base leading-6';
      break;
    case 'defaultSemiBold':
      typeClasses = 'text-base leading-6 font-semibold';
      break;
    case 'title':
      typeClasses = 'text-3xl font-bold leading-8';
      break;
    case 'subtitle':
      typeClasses = 'text-xl font-bold';
      break;
    case 'link':
      typeClasses = 'text-base leading-[30px] text-[#0a7ea4]';
      break;
  }

  return (
    <Text
      style={[{ color }, style]}
      className={typeClasses}
      {...rest}
    />
  );
}
