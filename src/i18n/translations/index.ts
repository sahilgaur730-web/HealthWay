/**
 * HealthWay Multilingual System - Translations Registry
 * Government of Maharashtra - Integrated Rural Health Platform
 */

import en from './en';
import mr from './mr';
import hi from './hi';

export { en, mr, hi };

export const TRANSLATIONS = {
  en,
  mr,
  hi
} as const;

export type SupportedLanguage = keyof typeof TRANSLATIONS;
export default TRANSLATIONS;
