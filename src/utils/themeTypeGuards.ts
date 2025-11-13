// src/utils/themeTypeGuards.ts
// Funções helper reutilizáveis para type guards de propriedades de tema
// Evita repetição de código e garante consistência

import type { Theme } from '../types/theme';
import { defaultColors } from './themeHelpers';

/**
 * Extrai a cor primária de text de forma segura
 */
export const getTextPrimary = (theme?: Theme): string => {
  const text = theme?.colors?.text;
  if (typeof text === 'object' && text !== null && 'primary' in text) {
    return text.primary || defaultColors.text.primary;
  }
  return defaultColors.text.primary;
};

/**
 * Extrai a cor secundária de text de forma segura
 */
export const getTextSecondary = (theme?: Theme): string => {
  const text = theme?.colors?.text;
  if (typeof text === 'object' && text !== null && 'secondary' in text) {
    return text.secondary || defaultColors.text.secondary;
  }
  return defaultColors.text.secondary;
};

/**
 * Extrai a cor primária de surface de forma segura
 */
export const getSurfacePrimary = (theme?: Theme): string => {
  const surface = theme?.colors?.surface;
  if (typeof surface === 'string') {
    return surface;
  }
  if (typeof surface === 'object' && surface !== null && 'primary' in surface) {
    return surface.primary || defaultColors.surface;
  }
  return defaultColors.surface;
};

/**
 * Extrai a cor secundária de surface de forma segura
 */
export const getSurfaceSecondary = (theme?: Theme): string => {
  const surface = theme?.colors?.surface;
  if (typeof surface === 'object' && surface !== null && 'secondary' in surface) {
    return surface.secondary || defaultColors.surface;
  }
  // Fallback para background.secondary se surface não tiver secondary
  const background = theme?.colors?.background;
  if (typeof background === 'object' && background !== null && 'secondary' in background) {
    return background.secondary || defaultColors.surface;
  }
  if (typeof background === 'string') {
    return background;
  }
  return defaultColors.surface;
};

/**
 * Extrai a cor primária de border de forma segura
 */
export const getBorderPrimary = (theme?: Theme): string => {
  const border = theme?.colors?.border;
  if (typeof border === 'string') {
    return border;
  }
  if (typeof border === 'object' && border !== null && 'primary' in border) {
    return border.primary || defaultColors.border;
  }
  return defaultColors.border;
};

/**
 * Extrai a cor de focus de border de forma segura
 */
export const getBorderFocus = (theme?: Theme): string => {
  const border = theme?.colors?.border;
  if (typeof border === 'object' && border !== null && 'focus' in border) {
    return border.focus || defaultColors.border;
  }
  return defaultColors.border;
};

/**
 * Extrai a cor primária de background de forma segura
 */
export const getBackgroundPrimary = (theme?: Theme): string => {
  const background = theme?.colors?.background;
  if (typeof background === 'string') {
    return background;
  }
  if (typeof background === 'object' && background !== null && 'primary' in background) {
    return background.primary || defaultColors.background;
  }
  return defaultColors.background;
};

/**
 * Extrai a cor secundária de background de forma segura
 */
export const getBackgroundSecondary = (theme?: Theme): string => {
  const background = theme?.colors?.background;
  if (typeof background === 'string') {
    return background;
  }
  if (typeof background === 'object' && background !== null && 'secondary' in background) {
    return background.secondary || defaultColors.background;
  }
  return defaultColors.background;
};

/**
 * Extrai a cor dark de text de forma segura (fallback para primary)
 */
export const getTextDark = (theme?: Theme): string => {
  const text = theme?.colors?.text;
  if (typeof text === 'object' && text !== null && 'dark' in text && text.dark) {
    return text.dark;
  }
  return getTextPrimary(theme);
};

/**
 * Extrai a cor light de text de forma segura (fallback para secondary)
 */
export const getTextLight = (theme?: Theme): string => {
  const text = theme?.colors?.text;
  if (typeof text === 'object' && text !== null && 'light' in text && text.light) {
    return text.light;
  }
  return getTextSecondary(theme);
};


