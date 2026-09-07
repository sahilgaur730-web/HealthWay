export * from './colors';
export * from './typography';
export * from './spacing';
export * from './icons';

import { colors } from './colors';
import { typography, textStyles, fontSize, fontWeight, lineHeight } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { APP_ICONS, AppIcon } from './icons';

export const theme = {
  colors,
  typography,
  textStyles,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  borderRadius,
  shadows,
  icons: APP_ICONS,
};

export default theme;
