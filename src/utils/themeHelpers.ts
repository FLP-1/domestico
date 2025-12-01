/**
 * Funções utilitárias para acesso seguro ao tema
 * Garantem fallbacks hierárquicos sem usar cores hardcoded
 */

type ThemeObject = any;
type FallbackType = 'transparent' | 'inherit' | 'currentColor';

/**
 * Obtém uma cor do tema seguindo um caminho hierárquico
 *
 * @param theme - Objeto do tema
 * @param path - Array com o caminho da propriedade (ex: ['colors', 'border', 'light']) ou string separada por ponto (ex: 'colors.border.light')
 * @param fallback - Tipo de fallback absoluto (apenas transparent/inherit/currentColor)
 * @returns Valor da cor ou fallback absoluto
 */
export const getThemeColor = (
  theme: ThemeObject | undefined,
  path: string[] | string,
  fallback: FallbackType = 'transparent'
): string => {
  if (!theme) return fallback;

  // Converter string para array se necessário
  const pathArray = Array.isArray(path) ? path : path.split('.');

  // Tentar caminho completo primeiro (ex: theme.colors.border.light)
  let value = theme;
  for (const key of pathArray) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }

  if (value && typeof value === 'string') {
    return value;
  }

  // Tentar caminho alternativo sem 'colors' (ex: theme.border.light)
  if (pathArray[0] === 'colors' && pathArray.length > 1) {
    const altPath = pathArray.slice(1);
    value = theme;
    for (const key of altPath) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }

    if (value && typeof value === 'string') {
      return value;
    }
  }

  // Retornar fallback absoluto (nunca cores hardcoded)
  return fallback;
};

/**
 * Obtém cor de status do tema
 *
 * @param theme - Objeto do tema
 * @param status - Tipo de status (success, warning, error, info)
 * @param property - Propriedade desejada (background, border, text)
 * @returns Valor da cor ou fallback absoluto
 */
export const getStatusColor = (
  theme: ThemeObject | undefined,
  status: 'success' | 'warning' | 'error' | 'info',
  property: 'background' | 'border' | 'text' = 'background'
): string => {
  const fallback = property === 'text' ? 'inherit' : 'transparent';

  // Tentar caminho completo primeiro
  const fullPath = ['colors', 'status', status, property];
  const color = getThemeColor(theme, fullPath, fallback);

  if (color !== fallback) {
    return color;
  }

  // Tentar caminho alternativo
  const altPath = ['status', status, property];
  return getThemeColor(theme, altPath, fallback);
};

/**
 * Obtém cor de texto do tema
 *
 * @param theme - Objeto do tema
 * @param variant - Variante do texto (dark, secondary, primary, medium, light)
 * @returns Valor da cor ou 'inherit'
 */
export const getTextColor = (
  theme: ThemeObject | undefined,
  variant: 'dark' | 'secondary' | 'primary' | 'medium' | 'light' = 'dark'
): string => {
  // Tentar caminho completo primeiro
  const fullPath = ['colors', 'text', variant];
  const color = getThemeColor(theme, fullPath, 'inherit');

  if (color !== 'inherit') {
    return color;
  }

  // Tentar caminho alternativo
  const altPath = ['text', variant];
  return getThemeColor(theme, altPath, 'inherit');
};

/**
 * Obtém cor de background do tema
 *
 * @param theme - Objeto do tema
 * @param variant - Variante do background (primary, secondary)
 * @returns Valor da cor ou 'transparent'
 */
export const getBackgroundColor = (
  theme: ThemeObject | undefined,
  variant: 'primary' | 'secondary' = 'primary'
): string => {
  // Tentar caminho completo primeiro
  const fullPath = ['colors', 'background', variant];
  const color = getThemeColor(theme, fullPath, 'transparent');

  if (color !== 'transparent') {
    return color;
  }

  // Tentar caminho alternativo
  const altPath = ['background', variant];
  return getThemeColor(theme, altPath, 'transparent');
};

/**
 * Obtém cor de borda do tema
 *
 * @param theme - Objeto do tema
 * @param variant - Variante da borda (light, primary)
 * @returns Valor da cor ou 'transparent'
 */
export const getBorderColor = (
  theme: ThemeObject | undefined,
  variant: 'light' | 'primary' = 'light'
): string => {
  // Tentar caminho completo primeiro
  const fullPath = ['colors', 'border', variant];
  const color = getThemeColor(theme, fullPath, 'transparent');

  if (color !== 'transparent') {
    return color;
  }

  // Tentar caminho alternativo
  const altPath = ['border', variant];
  return getThemeColor(theme, altPath, 'transparent');
};

/**
 * Adiciona opacidade a uma cor
 *
 * @param color - Cor em formato hex (#RRGGBB) ou rgba
 * @param opacity - Opacidade entre 0 e 1
 * @returns Cor com opacidade aplicada em formato rgba
 */
export const addOpacity = (color: string, opacity: number): string => {
  // Se já é rgba, substitui a opacidade
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }

  // Se é hex, converte para rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

/**
 * Re-exporta DEFAULT_COLORS para compatibilidade
 */
export { DEFAULT_COLORS as defaultColors } from '../config/default-colors';

/**
 * Cores públicas para uso em componentes públicos (login, registro, etc)
 * Re-exporta as cores padrão para uso em páginas públicas
 */
export const publicColors = {
  primary: '#29ABE2',
  secondary: '#90EE90',
  tertiary: '#9B59B6',
  surface: '#FFFFFF',
  text: {
    primary: '#212529',
    secondary: '#6C757D',
  },
  background: '#F8F9FA',
  shadow: 'rgba(0, 0, 0, 0.1)',
  border: {
    light: '#E5E7EB',
    primary: '#D1D5DB',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};
