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
          background: (typeof colors?.status?.success === 'object' && colors?.status?.success && 'background' in colors.status.success)
            ? String((colors.status.success as any).background)
            : (typeof colors?.status?.success === 'string' ? colors.status.success : 'transparent'),
          border: (typeof colors?.status?.success === 'object' && colors?.status?.success && 'border' in colors.status.success)
            ? String((colors.status.success as any).border)
            : (typeof colors?.status?.success === 'string' ? colors.status.success : 'transparent'),
          text: (typeof colors?.status?.success === 'object' && colors?.status?.success && 'text' in colors.status.success)
            ? String((colors.status.success as any).text)
            : 'inherit',
        },
        warning: {
          background: (typeof colors?.status?.warning === 'object' && colors?.status?.warning && 'background' in colors.status.warning)
            ? String((colors.status.warning as any).background)
            : (typeof colors?.status?.warning === 'string' ? colors.status.warning : 'transparent'),
          border: (typeof colors?.status?.warning === 'object' && colors?.status?.warning && 'border' in colors.status.warning)
            ? String((colors.status.warning as any).border)
            : (typeof colors?.status?.warning === 'string' ? colors.status.warning : 'transparent'),
          text: (typeof colors?.status?.warning === 'object' && colors?.status?.warning && 'text' in colors.status.warning)
            ? String((colors.status.warning as any).text)
            : 'inherit',
        },
        error: {
          background: (typeof colors?.status?.error === 'object' && colors?.status?.error && 'background' in colors.status.error)
            ? String((colors.status.error as any).background)
            : (typeof colors?.status?.error === 'string' ? colors.status.error : 'transparent'),
          border: (typeof colors?.status?.error === 'object' && colors?.status?.error && 'border' in colors.status.error)
            ? String((colors.status.error as any).border)
            : (typeof colors?.status?.error === 'string' ? colors.status.error : 'transparent'),
          text: (typeof colors?.status?.error === 'object' && colors?.status?.error && 'text' in colors.status.error)
            ? String((colors.status.error as any).text)
            : 'inherit',
        },
        info: {
          background: (typeof colors?.status?.info === 'object' && colors?.status?.info && 'background' in colors.status.info)
            ? String((colors.status.info as any).background)
            : (typeof colors?.status?.info === 'string' ? colors.status.info : 'transparent'),
          border: (typeof colors?.status?.info === 'object' && colors?.status?.info && 'border' in colors.status.info)
            ? String((colors.status.info as any).border)
            : (typeof colors?.status?.info === 'string' ? colors.status.info : 'transparent'),
          text: (typeof colors?.status?.info === 'object' && colors?.status?.info && 'text' in colors.status.info)
            ? String((colors.status.info as any).text)
            : 'inherit',
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

