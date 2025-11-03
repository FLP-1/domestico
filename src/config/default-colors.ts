// 🎨 CONFIGURAÇÕES CENTRALIZADAS DE CORES
// Este arquivo contém todas as cores padrão do sistema

export const DEFAULT_COLORS = {
  // Cores primárias
  primary: '#29ABE2',
  primaryLight: 'rgba(41, 171, 226, 0.1)',
  primaryDark: '#1E8BC3',
  primaryHover: 'props.theme?.colors?.primary',

  // Cores secundárias
  secondary: '#90EE90',
  secondaryLight: 'rgba(144, 238, 144, 0.1)',
  secondaryDark: '#7ED321',

  // Cores de status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Cores neutras
  text: {
    primary: '#2C3E50',
    secondary: '#6C757D',
    disabled: '#9CA3AF',
  },

  surface: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F3F4F6',
  },

  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    focus: '#29ABE2',
  },

  // Estados de interação
  states: {
    hover: 'rgba(41, 171, 226, 0.1)',
    focus: 'rgba(41, 171, 226, 0.2)',
    active: 'rgba(41, 171, 226, 0.3)',
    disabled: 'rgba(41, 171, 226, 0.05)',
  },

  // Sistema de elevação
  elevation: {
    none: '0px',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },

  // Sistema de espaçamento
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },

  // Cores específicas por perfil com variações
  profiles: {
    empregado: {
      primary: '#29ABE2',
      primaryLight: '#60A5FA',
      primaryDark: '#1E40AF',
      secondary: '#90EE90',
      secondaryLight: '#A7F3D0',
      secondaryDark: '#059669',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(41, 171, 226, 0.1)',
      shadowLight: 'rgba(41, 171, 226, 0.05)',
      shadowDark: 'rgba(41, 171, 226, 0.2)',
    },
    empregador: {
      primary: '#1E3A8A',
      primaryLight: '#3B82F6',
      primaryDark: '#1D4ED8',
      secondary: '#1D4ED8',
      secondaryLight: '#60A5FA',
      secondaryDark: '#1E40AF',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(30, 58, 138, 0.1)',
      shadowLight: 'rgba(30, 58, 138, 0.05)',
      shadowDark: 'rgba(30, 58, 138, 0.2)',
    },
    familia: {
      primary: '#F59E0B',
      primaryLight: '#FBBF24',
      primaryDark: '#D97706',
      secondary: '#D97706',
      secondaryLight: '#FCD34D',
      secondaryDark: '#B45309',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(245, 158, 11, 0.1)',
      shadowLight: 'rgba(245, 158, 11, 0.05)',
      shadowDark: 'rgba(245, 158, 11, 0.2)',
    },
    admin: {
      primary: '#6B7280',
      primaryLight: '#9CA3AF',
      primaryDark: '#4B5563',
      secondary: '#4B5563',
      secondaryLight: '#6B7280',
      secondaryDark: '#374151',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(107, 114, 128, 0.1)',
      shadowLight: 'rgba(107, 114, 128, 0.05)',
      shadowDark: 'rgba(107, 114, 128, 0.2)',
    },
    funcionario: {
      primary: '#4682B4',
      primaryLight: '#87CEEB',
      primaryDark: '#2E8B57',
      secondary: '#2E8B57',
      secondaryLight: '#A7F3D0',
      secondaryDark: '#059669',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(70, 130, 180, 0.1)',
      shadowLight: 'rgba(70, 130, 180, 0.05)',
      shadowDark: 'rgba(70, 130, 180, 0.2)',
    },
    financeiro: {
      primary: '#FF6347',
      primaryLight: '#FFA07A',
      primaryDark: '#FF4500',
      secondary: '#FF4500',
      secondaryLight: '#FFB366',
      secondaryDark: '#CC3700',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(255, 99, 71, 0.1)',
      shadowLight: 'rgba(255, 99, 71, 0.05)',
      shadowDark: 'rgba(255, 99, 71, 0.2)',
    },
    administrador: {
      primary: '#8B008B',
      primaryLight: '#DDA0DD',
      primaryDark: '#6A0DAD',
      secondary: '#6A0DAD',
      secondaryLight: '#BA55D3',
      secondaryDark: '#4B0082',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textDisabled: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      shadow: 'rgba(139, 0, 139, 0.1)',
      shadowLight: 'rgba(139, 0, 139, 0.05)',
      shadowDark: 'rgba(139, 0, 139, 0.2)',
    },
  },

  // Cores de geofencing
  geofencing: {
    dark: 'props.theme?.colors?.text',
    medium: '#5a6c7d',
    light: 'props.theme?.colors?.textSecondary',
    primary: 'props.theme?.colors?.surfacefff',
    secondary: 'props.theme?.colors?.surface',
    gradient: 'linear-gradient(45deg, props.theme?.colors?.surfacefff, #f0f8ff)',
  },

  // Cores de email
  email: {
    primary: '#29ABE2',
    background: 'props.theme?.colors?.surface',
    text: 'props.theme?.colors?.text',
    border: '#29ABE2',
  },

  // Cores de dados
  data: {
    error: 'props.theme?.colors?.error',
    warning: 'props.theme?.colors?.warning',
    success: 'props.theme?.colors?.success',
    info: 'props.theme?.colors?.info',
  },
} as const;

export type DefaultColors = typeof DEFAULT_COLORS;
