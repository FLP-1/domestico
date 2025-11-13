import React from 'react';
import styled from 'styled-components';
import type { Theme } from '../../../types/theme';
import { defaultColors, addOpacity } from '../../../utils/themeHelpers';

export interface UnifiedBadgeProps {
  /**
   * Conteúdo do badge
   */
  children: React.ReactNode;
  /**
   * Variante do badge (cor e estilo)
   */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'neutral';
  /**
   * Tamanho do badge
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Tema para cores dinâmicas
   */
  theme?: Theme;
  /**
   * Se deve mostrar como outline (borda)
   */
  outline?: boolean;
  /**
   * Cor customizada (sobrescreve variant)
   */
  customColor?: string;
  /**
   * Ícone opcional (emoji ou ReactNode)
   */
  icon?: React.ReactNode;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Estilo inline adicional
   */
  style?: React.CSSProperties;
  /**
   * Callback de clique
   */
  onClick?: () => void;
}

const BadgeContainer = styled.span<{
  $variant: UnifiedBadgeProps['variant'];
  $size: UnifiedBadgeProps['size'];
  $theme?: Theme;
  $outline?: boolean;
  $customColor?: string;
  $clickable?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.25rem 0.5rem';
      case 'lg':
        return '0.5rem 1rem';
      default:
        return '0.375rem 0.75rem';
    }
  }};
  border-radius: ${props => {
    switch (props.$size) {
      case 'sm':
        return '12px';
      case 'lg':
        return '20px';
      default:
        return '16px';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.7rem';
      case 'lg':
        return '0.9rem';
      default:
        return '0.75rem';
    }
  }};
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  ${props => {
    // Cor customizada tem prioridade
    if (props.$customColor) {
      if (props.$outline) {
        return `
          background: transparent;
          border: 1px solid ${props.$customColor};
          color: ${props.$customColor};
        `;
      }
      return `
        background: ${addOpacity(props.$customColor, 0.15)};
        color: ${props.$customColor};
        border: 1px solid ${addOpacity(props.$customColor, 0.3)};
      `;
    }

    // Variantes baseadas em status
    const variantColors = {
      success: {
        bg: props.$theme?.colors?.success || defaultColors.success,
        text: props.$theme?.colors?.surface || defaultColors.surface,
        border: props.$theme?.colors?.success || defaultColors.success,
      },
      warning: {
        bg: props.$theme?.colors?.warning || defaultColors.warning,
        text: props.$theme?.colors?.surface || defaultColors.surface,
        border: props.$theme?.colors?.warning || defaultColors.warning,
      },
      error: {
        bg: props.$theme?.colors?.error || defaultColors.error,
        text: props.$theme?.colors?.surface || defaultColors.surface,
        border: props.$theme?.colors?.error || defaultColors.error,
      },
      info: {
        bg: props.$theme?.colors?.info || defaultColors.info,
        text: props.$theme?.colors?.surface || defaultColors.surface,
        border: props.$theme?.colors?.info || defaultColors.info,
      },
      primary: {
        bg: props.$theme?.colors?.primary || defaultColors.primary,
        text: props.$theme?.colors?.surface || defaultColors.surface,
        border: props.$theme?.colors?.primary || defaultColors.primary,
      },
      secondary: {
        bg: props.$theme?.colors?.secondary || defaultColors.secondary,
        text: props.$theme?.colors?.surface || defaultColors.surface,
        border: props.$theme?.colors?.secondary || defaultColors.secondary,
      },
      neutral: {
        bg: (props.$theme?.colors?.text && typeof props.$theme.colors.text === 'object' && props.$theme.colors.text.secondary) || defaultColors.text.secondary,
        text: (typeof props.$theme?.colors?.surface === 'string' ? props.$theme.colors.surface : defaultColors.surface) || defaultColors.surface,
        border: (typeof props.$theme?.colors?.border === 'string' ? props.$theme.colors.border : defaultColors.border) || defaultColors.border,
      },
    };

    const colors = variantColors[props.$variant || 'neutral'];

    if (props.$outline) {
      return `
        background: transparent;
        border: 1px solid ${colors.border};
        color: ${colors.border};
      `;
    }

    return `
      background: ${addOpacity(colors.bg, 0.15)};
      color: ${colors.bg};
      border: 1px solid ${addOpacity(colors.border, 0.3)};
    `;
  }}

  ${props => props.$clickable && `
    cursor: pointer;
    user-select: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

/**
 * Componente genérico de Badge reutilizável
 * 
 * Substitui: StatusBadge, VersionBadge, PermissionBadge, DueDateBadge, CategoryBadge
 * 
 * @example
 * ```tsx
 * // Badge básico
 * <UnifiedBadge variant="success">Ativo</UnifiedBadge>
 * 
 * // Badge com ícone
 * <UnifiedBadge variant="warning" icon="⚠️" size="lg">
 *   Atenção
 * </UnifiedBadge>
 * 
 * // Badge outline
 * <UnifiedBadge variant="error" outline>
 *   Erro
 * </UnifiedBadge>
 * 
 * // Badge customizado
 * <UnifiedBadge customColor="#9b59b6" size="sm">
 *   Custom
 * </UnifiedBadge>
 * ```
 */
export const UnifiedBadge: React.FC<UnifiedBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  theme,
  outline = false,
  customColor,
  icon,
  className,
  style,
  onClick,
}) => {
  return (
    <BadgeContainer
      $variant={variant}
      $size={size}
      $theme={theme}
      $outline={outline}
      $customColor={customColor}
      $clickable={!!onClick}
      className={className}
      style={style}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      {children}
    </BadgeContainer>
  );
};

