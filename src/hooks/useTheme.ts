import React, { useEffect, useState, useRef } from 'react';
import { useSystemConfig } from './useSystemConfig';
import { geofencingColors } from '../design-system/tokens/geofencing-colors';

// Importar tipo do themeService
import type { Theme } from '../services/themeService';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  // Cores semânticas
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  // Cores de navegação
  navigation?: {
    primary: string;
    hover: string;
    active: string;
  };
  // Cores de status
  status?: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ProfileTheme {
  id: string;
  name: string;
  colors: ThemeColors;
}

// Temas predefinidos para diferentes perfis - SISTEMA EQUILIBRADO
export const profileThemes: Record<string, ProfileTheme> = {
  empregado: {
    id: 'empregado',
    name: 'Empregado',
    colors: {
      primary: '#29ABE2',
      secondary: '#90EE90',
      accent: '#FFDA63',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#E9ECEF',
      shadow: 'rgba(41, 171, 226, 0.1)',
    },
  },
  empregador: {
    id: 'empregador',
    name: 'Empregador',
    colors: {
      primary: '#2E8B57',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F0F8F0',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#D4E6D4',
      shadow: 'rgba(46, 139, 87, 0.1)',
    },
  },
  familia: {
    id: 'familia',
    name: 'Família',
    colors: {
      primary: '#9B59B6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F3E5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E1BEE7',
      shadow: 'rgba(155, 89, 182, 0.1)',
    },
  },
  família: {
    id: 'família',
    name: 'Família',
    colors: {
      primary: '#9B59B6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F3E5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E1BEE7',
      shadow: 'rgba(155, 89, 182, 0.1)',
    },
  },
  admin: {
    id: 'admin',
    name: 'Administrador Técnico',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#6B7280',
      shadow: 'rgba(107, 114, 128, 0.1)',
    },
  },
  'administrador técnico': {
    id: 'administrador técnico',
    name: 'Administrador Técnico',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#6B7280',
      shadow: 'rgba(107, 114, 128, 0.1)',
    },
  },
  funcionario: {
    id: 'funcionario',
    name: 'Funcionário',
    colors: {
      primary: '#4682B4',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#E6F3FF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#B3D9FF',
      shadow: 'rgba(70, 130, 180, 0.1)',
    },
  },
  funcionário: {
    id: 'funcionário',
    name: 'Funcionário',
    colors: {
      primary: '#4682B4',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#E6F3FF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#B3D9FF',
      shadow: 'rgba(70, 130, 180, 0.1)',
    },
  },
  financeiro: {
    id: 'financeiro',
    name: 'Responsável Financeiro',
    colors: {
      primary: '#FF6347',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FFF4F0',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#FFE0D6',
      shadow: 'rgba(255, 99, 71, 0.1)',
    },
  },
  'responsável financeiro': {
    id: 'responsável financeiro',
    name: 'Responsável Financeiro',
    colors: {
      primary: '#FF6347',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FFF4F0',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#FFE0D6',
      shadow: 'rgba(255, 99, 71, 0.1)',
    },
  },
  administrador: {
    id: 'administrador',
    name: 'Administrador (Dono)',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  'administrador (dono)': {
    id: 'administrador (dono)',
    name: 'Administrador (Dono)',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
};

export const useTheme = (
  profileId?: string,
  useCentralizedConfig: boolean = true
) => {
  const { config } = useSystemConfig();
  const [currentTheme, setCurrentTheme] = useState<ProfileTheme>(() => {
    return (
      profileThemes['empregado'] ||
      Object.values(profileThemes)[0] || {
        id: 'default',
        name: 'Default',
        colors: {
          primary: '#29ABE2',
          secondary: '#90EE90',
          accent: '#29ABE2',
          background: '#f8f9fa',
          surface: '#ffffff',
          text: '#2c3e50',
          textSecondary: '#7f8c8d',
          border: '#e0e0e0',
          shadow: 'rgba(0, 0, 0, 0.1)',
        },
      }
    );
  });
  const lastProfileIdRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);

  // Aplicar tema por perfil
  useEffect(() => {
    const loadTheme = async () => {
      if (!profileId) return;
      
      // Evitar chamadas duplicadas para o mesmo profileId
      if (lastProfileIdRef.current === profileId || isLoadingRef.current) {
        return;
      }
      
      lastProfileIdRef.current = profileId;
      isLoadingRef.current = true;

      // 1. Tentar buscar do banco de dados (se useCentralizedConfig)
      if (useCentralizedConfig) {
        try {
          const response = await fetch(`/api/theme/get?profileCode=${profileId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const dbTheme = result.data as Theme;
              
              // Validar se tema tem cores válidas
              if (!dbTheme.colors || !dbTheme.colors.primary) {
                throw new Error('Tema do banco inválido');
              }
              
              // Converter Theme do banco para ProfileTheme
              const profileTheme: ProfileTheme = {
                id: profileId,
                name: profileThemes[profileId]?.name || profileId,
                colors: {
                  primary: dbTheme.colors.primary || profileThemes[profileId]?.colors.primary || '#29ABE2',
                  secondary: dbTheme.colors.secondary || profileThemes[profileId]?.colors.secondary || '#90EE90',
                  accent: dbTheme.colors.accent || profileThemes[profileId]?.colors.accent || '#FFDA63',
                  background: dbTheme.colors.background || profileThemes[profileId]?.colors.background || '#FFFFFF',
                  surface: dbTheme.colors.surface || profileThemes[profileId]?.colors.surface || '#F8F9FA',
                  text: dbTheme.colors.text || profileThemes[profileId]?.colors.text || '#2C3E50',
                  textSecondary: dbTheme.colors.textSecondary || profileThemes[profileId]?.colors.textSecondary || '#7F8C8D',
                  border: dbTheme.colors.border || profileThemes[profileId]?.colors.border || '#E9ECEF',
                  shadow: dbTheme.colors.shadow || profileThemes[profileId]?.colors.shadow || 'rgba(41, 171, 226, 0.1)',
                  success: dbTheme.colors.success,
                  warning: dbTheme.colors.warning,
                  error: dbTheme.colors.error,
                  info: dbTheme.colors.info,
                }
              };
              
              setCurrentTheme(profileTheme);
              isLoadingRef.current = false;
              return; // Tema do banco carregado, não precisa continuar
            }
          }
        } catch (error) {
          console.warn('Erro ao carregar tema do banco, usando fallback:', error);
          // Continuar com fallback
        } finally {
          // Garantir que o flag seja resetado mesmo em caso de erro
        }
      }

      // 2. Fallback: usar profileThemes hardcoded (compatibilidade)
      if (profileThemes[profileId]) {
        const baseTheme = profileThemes[profileId];

        // Se usar configuração centralizada, mesclar com cores do config
        if (useCentralizedConfig && config) {
          const mergedTheme: ProfileTheme = {
            ...baseTheme,
            colors: {
              ...baseTheme.colors,
              // Sobrescrever com cores do config quando disponíveis
              primary: config.colors.primary || baseTheme.colors.primary,
              secondary: config.colors.secondary || baseTheme.colors.secondary,
              success: config.colors.success || baseTheme.colors.success,
              warning: config.colors.warning || baseTheme.colors.warning,
              error: config.colors.error || baseTheme.colors.error,
              info: config.colors.info || baseTheme.colors.info,
              // Adicionar cores de navegação e status
              navigation: {
                primary: config.colors.primary || baseTheme.colors.primary,
                hover: config.colors.primary || baseTheme.colors.primary,
                active: config.colors.primary || baseTheme.colors.primary,
              },
              status: {
                success: config.colors.success || '#10B981',
                warning: config.colors.warning || '#F59E0B',
                error: config.colors.error || '#EF4444',
                info: config.colors.info || '#3B82F6',
              },
            },
          };
          setCurrentTheme(mergedTheme);
        } else {
          setCurrentTheme(baseTheme);
        }
      }
      
      isLoadingRef.current = false;
    };

    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, useCentralizedConfig]); // Removido config, loading, error para evitar loops

  const updateTheme = (profileId: string) => {
    if (profileThemes[profileId]) {
      setCurrentTheme(profileThemes[profileId]);
    }
  };

  // Retornar estrutura compatível com useCentralizedColors para facilitar migração
  const colors = {
    ...currentTheme.colors,
    // Estrutura compatível com geofencingColors
    text: {
      primary: currentTheme.colors.text,
      secondary: currentTheme.colors.textSecondary,
      dark: currentTheme.colors.text,
      medium: currentTheme.colors.textSecondary,
      light: currentTheme.colors.textSecondary,
    },
    background: {
      primary: currentTheme.colors.background,
      secondary: currentTheme.colors.surface,
    },
    border: {
      light: currentTheme.colors.border,
      primary: currentTheme.colors.border,
    },
    navigation: currentTheme.colors.navigation || {
      primary: currentTheme.colors.primary,
      hover: currentTheme.colors.primary,
      active: currentTheme.colors.primary,
    },
    status: currentTheme.colors.status || {
      success: currentTheme.colors.success || '#10B981',
      warning: currentTheme.colors.warning || '#F59E0B',
      error: currentTheme.colors.error || '#EF4444',
      info: currentTheme.colors.info || '#3B82F6',
    },
  };

  return {
    theme: currentTheme,
    colors, // Estrutura compatível com useCentralizedColors
    updateTheme,
    availableThemes: Object.values(profileThemes),
  };
};
