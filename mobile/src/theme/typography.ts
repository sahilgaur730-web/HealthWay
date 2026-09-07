/**
 * HealthWay Mobile Typography Tokens
 * Supports Latin and Devanagari (Marathi/Hindi) scripts with safe vertical metrics.
 */
import { TextStyle, Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
} as const;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

// Line heights designed specifically so Devanagari upper/lower vowel signs don't clip
export const lineHeight = {
  xs: 16,
  sm: 19,
  base: 22,
  md: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 42,
} as const;

export const textStyles = {
  h1: {
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    fontWeight: fontWeight.bold,
    color: '#1C2B3A',
  },
  h2: {
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    fontWeight: fontWeight.bold,
    color: '#1C2B3A',
  },
  h3: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.semibold,
    color: '#1C2B3A',
  },
  h4: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.semibold,
    color: '#1C2B3A',
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: fontWeight.regular,
    color: '#1C2B3A',
  },
  bodySmall: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
    color: '#546E7A',
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.medium,
    color: '#90A4AE',
  },
  button: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.semibold,
  },
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
};
