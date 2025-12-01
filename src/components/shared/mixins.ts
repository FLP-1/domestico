import { css } from 'styled-components';
import { createThemedStyles } from '../../design-system';

// 🎨 Mixins para reutilização de estilos

/**
 * Mixin para aplicar estilos temáticos
 */
export const themedMixin = (theme: any) => css`
  ${createThemedStyles(theme)}
`;

/**
 * Mixin para responsividade mobile-first
 */
export const responsiveMixin = css`
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

/**
 * Mixin para tamanhos de fonte
 */
export const sizeMixin = (size: 'sm' | 'md' | 'lg') => css`
  font-size: ${size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.85rem'};
  padding: ${size === 'sm'
    ? '0.5rem 0.75rem'
    : size === 'lg'
      ? '0.875rem 1.25rem'
      : '0.75rem 1rem'};
`;

/**
 * Mixin para estados de validação
 */
export const validationMixin = (hasError: boolean, theme: any) => css`
  border: 1px solid
    ${hasError
      ? theme?.colors?.error ||
        theme?.colors?.status?.error?.background ||
        'transparent'
      : (() => {
          const border = theme?.colors?.border;
          return (
            (typeof border === 'object' && border?.light) ||
            theme?.border?.light ||
            'transparent'
          );
        })()};

  &:focus {
    border-color: ${theme?.colors?.primary || theme?.accent || 'transparent'};
    box-shadow: ${(() => {
      const primaryColor =
        theme?.colors?.primary || theme?.accent || theme?.colors?.primaryLight;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'none';
    })()};
  }
`;

/**
 * Mixin para transições suaves
 */
export const transitionMixin = css`
  transition: all 0.2s ease;
`;

/**
 * Mixin para hover states
 */
export const hoverMixin = (theme: any) => css`
  &:hover {
    background: ${(() => {
      const hoverColor =
        theme?.colors?.hover || theme?.colors?.primary || theme?.accent;
      if (hoverColor && hoverColor.startsWith('#')) {
        const r = parseInt(hoverColor.slice(1, 3), 16);
        const g = parseInt(hoverColor.slice(3, 5), 16);
        const b = parseInt(hoverColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    })()};
    transform: translateY(-1px);
  }
`;

/**
 * Mixin para focus states
 */
export const focusMixin = (theme: any) => css`
  &:focus {
    outline: none;
    border-color: ${theme?.colors?.primary || theme?.accent || 'transparent'};
    box-shadow: ${(() => {
      const primaryColor =
        theme?.colors?.primary || theme?.accent || theme?.colors?.primaryLight;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'none';
    })()};
  }
`;

/**
 * Mixin para disabled states
 */
export const disabledMixin = (theme: any) => css`
  &:disabled {
    background: ${theme?.colors?.disabled ||
    theme?.colors?.background?.secondary ||
    theme?.background?.secondary ||
    'transparent'};
    color: ${theme?.colors?.textDisabled ||
    theme?.colors?.text?.disabled ||
    theme?.colors?.text?.secondary ||
    theme?.text?.secondary ||
    'inherit'};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

/**
 * Mixin para grid responsivo
 */
export const gridMixin = css`
  display: grid;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 768px) and (max-width: 992px) {
    gap: 1.25rem;
  }

  @media (min-width: 992px) {
    gap: 1.5rem;
  }
`;

/**
 * Mixin para flex container
 */
export const flexMixin = (
  direction: 'row' | 'column' = 'row',
  gap: string = '0.5rem'
) => css`
  display: flex;
  flex-direction: ${direction};
  gap: ${gap};
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

/**
 * Mixin para status colors
 */
export const statusColorMixin = (
  status: 'success' | 'warning' | 'error' | 'info',
  theme: any
) => css`
  background: ${(() => {
    const statusColor =
      status === 'success'
        ? theme?.colors?.status?.success?.background ||
          theme?.colors?.successLight ||
          theme?.colors?.success
        : status === 'warning'
          ? theme?.colors?.status?.warning?.background ||
            theme?.colors?.warningLight ||
            theme?.colors?.warning
          : status === 'error'
            ? theme?.colors?.status?.error?.background ||
              theme?.colors?.errorLight ||
              theme?.colors?.error
            : theme?.colors?.status?.info?.background ||
              theme?.colors?.infoLight ||
              theme?.colors?.info;

    if (statusColor && statusColor.startsWith('#')) {
      const r = parseInt(statusColor.slice(1, 3), 16);
      const g = parseInt(statusColor.slice(3, 5), 16);
      const b = parseInt(statusColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.15)`;
    }
    return 'transparent';
  })()};

  color: ${status === 'success'
    ? theme?.colors?.status?.success?.text ||
      theme?.colors?.success ||
      'inherit'
    : status === 'warning'
      ? theme?.colors?.status?.warning?.text ||
        theme?.colors?.warning ||
        'inherit'
      : status === 'error'
        ? theme?.colors?.status?.error?.text ||
          theme?.colors?.error ||
          'inherit'
        : theme?.colors?.status?.info?.text ||
          theme?.colors?.info ||
          'inherit'};

  border: 1px solid
    ${status === 'success'
      ? theme?.colors?.status?.success?.background ||
        theme?.colors?.success ||
        'transparent'
      : status === 'warning'
        ? theme?.colors?.status?.warning?.background ||
          theme?.colors?.warning ||
          'transparent'
        : status === 'error'
          ? theme?.colors?.status?.error?.background ||
            theme?.colors?.error ||
            'transparent'
          : theme?.colors?.status?.info?.background ||
            theme?.colors?.info ||
            'transparent'};
`;

/**
 * Mixin para touch targets (acessibilidade)
 */
export const touchTargetMixin = css`
  min-height: 44px;
  min-width: 44px;

  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

/**
 * Mixin para acessibilidade
 */
export const accessibilityMixin = (theme?: any) => css`
  &:focus-visible {
    outline: 2px solid
      ${theme?.colors?.primary || theme?.accent || 'currentColor'};
    outline-offset: 2px;
  }

  &[aria-disabled='true'] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Mixin para animações
 */
export const animationMixin = css`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * Mixin para sombras
 */
export const shadowMixin = (
  level: 'sm' | 'md' | 'lg' = 'md',
  theme?: any
) => css`
  box-shadow: ${(() => {
    const shadowColor = theme?.colors?.shadow || theme?.shadow?.color;
    const opacity = level === 'sm' ? 0.1 : level === 'lg' ? 0.15 : 0.1;

    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      const shadows = {
        sm: `0 1px 3px rgba(${r}, ${g}, ${b}, ${opacity})`,
        md: `0 4px 6px rgba(${r}, ${g}, ${b}, ${opacity})`,
        lg: `0 10px 25px rgba(${r}, ${g}, ${b}, ${opacity})`,
      };
      return shadows[level];
    }
    // Fallback seguro sem cores hardcoded
    return 'none';
  })()};
`;

/**
 * Mixin para border radius
 */
export const borderRadiusMixin = (size: 'sm' | 'md' | 'lg' = 'md') => css`
  border-radius: ${size === 'sm' ? '4px' : size === 'lg' ? '12px' : '8px'};
`;

/**
 * Mixin para espaçamento
 */
export const spacingMixin = (
  padding: string = '1rem',
  margin: string = '0'
) => css`
  padding: ${padding};
  margin: ${margin};
`;

/**
 * Mixin para texto truncado
 */
export const textTruncateMixin = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Mixin para scrollbar customizada
 */
export const customScrollbarMixin = (theme: any) => css`
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme?.colors?.surface ||
    theme?.colors?.background?.secondary ||
    theme?.background?.secondary ||
    'transparent'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme?.colors?.primary || theme?.accent || 'transparent'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(() => {
      const primaryColor =
        theme?.colors?.primaryDark || theme?.colors?.primary || theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        // Escurecer 10%
        return `rgb(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)})`;
      }
      return 'transparent';
    })()};
  }
`;
