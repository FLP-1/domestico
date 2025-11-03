/**
 * Helper para obter valores padrão do tema quando $theme não está disponível
 * Elimina a necessidade de valores hardcoded no código
 */

import { profileThemes } from '../hooks/useTheme';

// Tema padrão do sistema (empregado)
const defaultTheme = profileThemes['empregado'];

/**
 * Retorna as cores padrão do tema do sistema
 * Usado como fallback quando $theme não está disponível
 */
export const getDefaultThemeColors = () => {
  return {
    primary: defaultTheme.colors.primary,
    secondary: defaultTheme.colors.secondary,
    background: defaultTheme.colors.background,
    surface: defaultTheme.colors.surface,
    text: {
      primary: defaultTheme.colors.text,
      secondary: defaultTheme.colors.textSecondary,
      dark: defaultTheme.colors.text,
      light: defaultTheme.colors.textSecondary,
      medium: defaultTheme.colors.textSecondary,
    },
    border: defaultTheme.colors.border,
    shadow: defaultTheme.colors.shadow,
    error: '#EF4444', // Valor padrão do sistema de cores
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  };
};

/**
 * Helper para criar variações de cor com transparência
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Se já for rgba, extrair os valores RGB
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
  }
  
  // Se for hex, converter para rgb
  const hexMatch = color.match(/^#([A-Fa-f\d]{6})$/);
  if (hexMatch) {
    const r = parseInt(hexMatch[1].substring(0, 2), 16);
    const g = parseInt(hexMatch[1].substring(2, 4), 16);
    const b = parseInt(hexMatch[1].substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color; // Fallback se não conseguir parsear
};

