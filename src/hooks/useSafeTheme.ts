import { useTheme } from './useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

/**
 * Hook seguro para acessar tema com fallbacks hierárquicos
 * Garante que sempre retorna uma estrutura completa, mesmo quando o tema está undefined
 * 
 * @returns Objeto com tema seguro e cores acessíveis
 */
export const useSafeTheme = () => {
  const { currentProfile } = useUserProfile();
  const { colors } = useTheme(currentProfile?.role?.toLowerCase() || 'empregado');
  
  // Garantir estrutura completa com fallbacks hierárquicos
  // NUNCA usar cores hardcoded como fallback - apenas transparent/inherit
  const safeTheme = {
    colors: {
      // Cores primárias
      primary: colors?.primary || 'transparent',
      secondary: colors?.secondary || 'transparent',
      accent: colors?.accent || 'transparent',
      
      // Backgrounds
      background: {
        primary: colors?.background?.primary || colors?.background || 'transparent',
        secondary: colors?.background?.secondary || colors?.surface || 'transparent',
      },
      
      // Textos
      text: {
        dark: colors?.text?.dark || colors?.text || 'inherit',
        secondary: colors?.text?.secondary || colors?.textSecondary || 'inherit',
        primary: colors?.text?.primary || colors?.text || 'inherit',
        medium: colors?.text?.medium || colors?.textSecondary || 'inherit',
        light: colors?.text?.light || colors?.textSecondary || 'inherit',
      },
      
      // Bordas
      border: {
        light: colors?.border?.light || colors?.border || 'transparent',
        primary: colors?.border?.primary || colors?.border || 'transparent',
      },
      
      // Status
      status: {
        success: {
          background: colors?.status?.success?.background || colors?.status?.success || 'transparent',
          border: colors?.status?.success?.border || colors?.status?.success || 'transparent',
          text: colors?.status?.success?.text || 'inherit',
        },
        warning: {
          background: colors?.status?.warning?.background || colors?.status?.warning || 'transparent',
          border: colors?.status?.warning?.border || colors?.status?.warning || 'transparent',
          text: colors?.status?.warning?.text || 'inherit',
        },
        error: {
          background: colors?.status?.error?.background || colors?.status?.error || 'transparent',
          border: colors?.status?.error?.border || colors?.status?.error || 'transparent',
          text: colors?.status?.error?.text || 'inherit',
        },
        info: {
          background: colors?.status?.info?.background || colors?.status?.info || 'transparent',
          border: colors?.status?.info?.border || colors?.status?.info || 'transparent',
          text: colors?.status?.info?.text || 'inherit',
        },
      },
      
      // Navegação
      navigation: colors?.navigation || {
        primary: colors?.primary || 'transparent',
        hover: colors?.primary || 'transparent',
        active: colors?.primary || 'transparent',
      },
      
      // Superfície
      surface: colors?.surface || colors?.background?.secondary || 'transparent',
      
      // Sombra
      shadow: colors?.shadow || 'transparent',
    },
    
    // Compatibilidade: também expor propriedades diretas para acesso alternativo
    border: {
      light: colors?.border?.light || colors?.border || 'transparent',
      primary: colors?.border?.primary || colors?.border || 'transparent',
    },
    text: {
      dark: colors?.text?.dark || colors?.text || 'inherit',
      secondary: colors?.text?.secondary || colors?.textSecondary || 'inherit',
      primary: colors?.text?.primary || colors?.text || 'inherit',
      medium: colors?.text?.medium || colors?.textSecondary || 'inherit',
      light: colors?.text?.light || colors?.textSecondary || 'inherit',
    },
    background: {
      primary: colors?.background?.primary || colors?.background || 'transparent',
      secondary: colors?.background?.secondary || colors?.surface || 'transparent',
    },
    status: colors?.status || {
      success: {
        background: 'transparent',
        border: 'transparent',
        text: 'inherit',
      },
      warning: {
        background: 'transparent',
        border: 'transparent',
        text: 'inherit',
      },
      error: {
        background: 'transparent',
        border: 'transparent',
        text: 'inherit',
      },
      info: {
        background: 'transparent',
        border: 'transparent',
        text: 'inherit',
      },
    },
  };
  
  return { 
    theme: safeTheme, 
    colors: safeTheme.colors 
  };
};

