/**
 * Sistema de Tema Centralizado
 * Define todas as cores, tipografia, espaçamentos e outros tokens de design
 * Elimina valores hardcoded no código
 */

// ============================================
// PALETA DE CORES
// ============================================

export const colors = {
  // Cores Primárias
  primary: {
    main: '#29ABE2',
    light: '#5BC0EB',
    dark: '#1A8BBF',
    contrast: '#FFFFFF',
  },

  // Cores Secundárias
  secondary: {
    main: '#6C757D',
    light: '#ADB5BD',
    dark: '#495057',
    contrast: '#FFFFFF',
  },

  // Cores de Status
  success: {
    main: '#28A745',
    light: '#D4EDDA',
    dark: '#155724',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#DC3545',
    light: '#F8D7DA',
    dark: '#721C24',
    contrast: '#FFFFFF',
  },

  warning: {
    main: '#FFC107',
    light: '#FFEAA7',
    dark: '#856404',
    contrast: '#000000',
  },

  info: {
    main: '#17A2B8',
    light: '#D1ECF1',
    dark: '#0C5460',
    contrast: '#FFFFFF',
  },

  // Cores de Superfície
  surface: {
    main: '#FFFFFF',
    light: '#F8F9FA',
    dark: '#E9ECEF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Cores de Texto
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    disabled: '#ADB5BD',
    hint: '#CED4DA',
  },

  // Cores de Borda
  border: {
    main: '#DEE2E6',
    light: '#E9ECEF',
    dark: '#CED4DA',
    focus: '#29ABE2',
  },

  // Cores de Fundo
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
    dark: '#212529',
  },

  // Cores de Ação
  action: {
    active: '#29ABE2',
    hover: 'rgba(41, 171, 226, 0.1)',
    selected: 'rgba(41, 171, 226, 0.2)',
    disabled: '#E9ECEF',
    disabledBackground: '#F8F9FA',
  },
} as const;

// ============================================
// TIPOGRAFIA
// ============================================

export const typography = {
  fontFamily: {
    primary:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    secondary: 'Georgia, "Times New Roman", serif',
    monospace: '"Courier New", Courier, monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.05em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
  },
} as const;

// ============================================
// ESPAÇAMENTOS
// ============================================

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
  '5xl': '8rem', // 128px
} as const;

// ============================================
// SOMBRAS
// ============================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================
// BORDAS
// ============================================

export const borders = {
  radius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },

  width: {
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
} as const;

// ============================================
// BREAKPOINTS (Responsividade)
// ============================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================
// TRANSIÇÕES
// ============================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================
// TEMA COMPLETO
// ============================================

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  breakpoints,
  zIndex,
  transitions,
} as const;

// Tipo TypeScript para o tema
export type Theme = typeof theme;

// Helper para acessar cores com opacidade
export const withOpacity = (color: string, opacity: number): string => {
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

// Helper para media queries
export const mediaQuery = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

export default theme;
