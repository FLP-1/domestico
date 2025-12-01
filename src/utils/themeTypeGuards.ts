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
    const primary = surface.primary;
    if (typeof primary === 'string') {
      return primary;
    }
  }
  // Fallback: usar defaultColors.surface.primary se for objeto, ou defaultColors.surface se for string
  if (
    typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'primary' in defaultColors.surface
  ) {
    const fallbackPrimary = defaultColors.surface.primary;
    if (typeof fallbackPrimary === 'string') {
      return fallbackPrimary;
    }
  }
  if (typeof defaultColors.surface === 'string') {
    return defaultColors.surface;
  }
  // Último fallback: usar surface.primary de defaultColors (sempre objeto com primary)
  return typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'primary' in defaultColors.surface
    ? String(defaultColors.surface.primary)
    : 'transparent';
};

/**
 * Extrai a cor secundária de surface de forma segura
 */
export const getSurfaceSecondary = (theme?: Theme): string => {
  const surface = theme?.colors?.surface;
  if (
    typeof surface === 'object' &&
    surface !== null &&
    'secondary' in surface
  ) {
    const secondary = surface.secondary;
    if (typeof secondary === 'string') {
      return secondary;
    }
  }
  // Fallback para background.secondary se surface não tiver secondary
  const background = theme?.colors?.background;
  if (
    typeof background === 'object' &&
    background !== null &&
    'secondary' in background
  ) {
    const bgSecondary = background.secondary;
    if (typeof bgSecondary === 'string') {
      return bgSecondary;
    }
  }
  if (typeof background === 'string') {
    return background;
  }
  // Fallback: usar defaultColors.surface.secondary se for objeto, ou defaultColors.surface se for string
  if (
    typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'secondary' in defaultColors.surface
  ) {
    const fallbackSecondary = defaultColors.surface.secondary;
    if (typeof fallbackSecondary === 'string') {
      return fallbackSecondary;
    }
  }
  if (typeof defaultColors.surface === 'string') {
    return defaultColors.surface;
  }
  // Último fallback: usar surface.secondary de defaultColors (sempre objeto com secondary)
  return typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'secondary' in defaultColors.surface
    ? String(defaultColors.surface.secondary)
    : 'transparent';
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
    const primary = border.primary;
    if (typeof primary === 'string') {
      return primary;
    }
  }
  // Fallback: usar defaultColors.border.primary se for objeto, ou defaultColors.border se for string
  if (
    typeof defaultColors.border === 'object' &&
    defaultColors.border !== null &&
    'primary' in defaultColors.border
  ) {
    const fallbackPrimary = defaultColors.border.primary;
    if (typeof fallbackPrimary === 'string') {
      return fallbackPrimary;
    }
  }
  if (typeof defaultColors.border === 'string') {
    return defaultColors.border;
  }
  // Último fallback: usar border.primary de defaultColors (sempre objeto com primary)
  return typeof defaultColors.border === 'object' &&
    defaultColors.border !== null &&
    'primary' in defaultColors.border
    ? String(defaultColors.border.primary)
    : 'transparent';
};

/**
 * Extrai a cor de focus de border de forma segura
 */
export const getBorderFocus = (theme?: Theme): string => {
  const border = theme?.colors?.border;
  if (typeof border === 'object' && border !== null && 'focus' in border) {
    const focus = border.focus;
    if (typeof focus === 'string') {
      return focus;
    }
  }
  // Fallback: usar defaultColors.border.focus se for objeto, ou defaultColors.border se for string
  if (
    typeof defaultColors.border === 'object' &&
    defaultColors.border !== null &&
    'focus' in defaultColors.border
  ) {
    const fallbackFocus = defaultColors.border.focus;
    if (typeof fallbackFocus === 'string') {
      return fallbackFocus;
    }
  }
  if (typeof defaultColors.border === 'string') {
    return defaultColors.border;
  }
  // Último fallback: usar border.focus de defaultColors (sempre objeto com focus)
  return typeof defaultColors.border === 'object' &&
    defaultColors.border !== null &&
    'focus' in defaultColors.border
    ? String(defaultColors.border.focus)
    : 'transparent';
};

/**
 * Extrai a cor primária de background de forma segura
 */
export const getBackgroundPrimary = (theme?: Theme): string => {
  const background = theme?.colors?.background;
  if (typeof background === 'string') {
    return background;
  }
  if (
    typeof background === 'object' &&
    background !== null &&
    'primary' in background
  ) {
    const primary = background.primary;
    if (typeof primary === 'string') {
      return primary;
    }
  }
  // Fallback: usar defaultColors.surface.secondary como fallback para background.primary
  if (
    typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'secondary' in defaultColors.surface
  ) {
    const fallbackSecondary = defaultColors.surface.secondary;
    if (typeof fallbackSecondary === 'string') {
      return fallbackSecondary;
    }
  }
  // Último fallback: usar surface.secondary de defaultColors
  return typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'secondary' in defaultColors.surface
    ? String(defaultColors.surface.secondary)
    : 'transparent';
};

/**
 * Extrai a cor secundária de background de forma segura
 */
export const getBackgroundSecondary = (theme?: Theme): string => {
  const background = theme?.colors?.background;
  if (typeof background === 'string') {
    return background;
  }
  if (
    typeof background === 'object' &&
    background !== null &&
    'secondary' in background
  ) {
    const secondary = background.secondary;
    if (typeof secondary === 'string') {
      return secondary;
    }
  }
  // Fallback: usar defaultColors.surface.tertiary como fallback para background.secondary
  if (
    typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'tertiary' in defaultColors.surface
  ) {
    const fallbackTertiary = defaultColors.surface.tertiary;
    if (typeof fallbackTertiary === 'string') {
      return fallbackTertiary;
    }
  }
  // Último fallback: usar surface.tertiary de defaultColors
  return typeof defaultColors.surface === 'object' &&
    defaultColors.surface !== null &&
    'tertiary' in defaultColors.surface
    ? String(defaultColors.surface.tertiary)
    : 'transparent';
};

/**
 * Extrai a cor dark de text de forma segura (fallback para primary)
 */
export const getTextDark = (theme?: Theme): string => {
  const text = theme?.colors?.text;
  if (
    typeof text === 'object' &&
    text !== null &&
    'dark' in text &&
    text.dark
  ) {
    return text.dark;
  }
  return getTextPrimary(theme);
};

/**
 * Extrai a cor light de text de forma segura (fallback para secondary)
 */
export const getTextLight = (theme?: Theme): string => {
  const text = theme?.colors?.text;
  if (
    typeof text === 'object' &&
    text !== null &&
    'light' in text &&
    text.light
  ) {
    return text.light;
  }
  return getTextSecondary(theme);
};
