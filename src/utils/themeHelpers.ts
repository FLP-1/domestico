/**
 * Helpers para valores padrão do tema
 * Evita valores hardcoded usando referências do sistema de tema centralizado
 */

import { profileThemes } from '../hooks/useTheme';

// Tema padrão do sistema (empregado) - usado em páginas autenticadas
const defaultTheme = profileThemes['empregado'];

/**
 * Cores públicas padrão - usadas em páginas públicas (login, landing, etc.)
 * NÃO dependem de perfil do usuário
 */
export const publicColors = {
  primary: '#1e3a8a', // Azul escuro profissional
  secondary: '#1e40af', // Azul médio
  tertiary: '#1d4ed8', // Azul claro
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
  },
  border: '#e0e0e0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

/**
 * Retorna valores padrão de cores do tema (baseado em perfil)
 * Usado em páginas autenticadas que dependem do perfil do usuário
 */
export const defaultColors = {
  primary: defaultTheme.colors.primary,
  secondary: defaultTheme.colors.secondary,
  background: defaultTheme.colors.background,
  surface: defaultTheme.colors.surface,
  text: {
    primary: defaultTheme.colors.text,
    secondary: defaultTheme.colors.textSecondary,
  },
  border: defaultTheme.colors.border,
  shadow: defaultTheme.colors.shadow,
  error: '#EF4444', // Valor do sistema de cores padrão
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

/**
 * Cria uma cor com transparência a partir de uma cor base
 */
export const addOpacity = (color: string, opacity: number): string => {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
  }
  const hexMatch = color.match(/^#([A-Fa-f\d]{6})$/);
  if (hexMatch) {
    const r = parseInt(hexMatch[1].substring(0, 2), 16);
    const g = parseInt(hexMatch[1].substring(2, 4), 16);
    const b = parseInt(hexMatch[1].substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

