import React from 'react';
import styled, { keyframes } from 'styled-components';
import type { Theme } from '../../../types/theme';
import { defaultColors, addOpacity } from '../../../utils/themeHelpers';

export interface UnifiedProgressBarProps {
  /**
   * Valor do progresso (0-100)
   */
  value: number;
  /**
   * Tamanho da barra
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Variante de cor
   */
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /**
   * Tema para cores dinâmicas
   */
  theme?: Theme;
  /**
   * Cor customizada (sobrescreve variant)
   */
  customColor?: string;
  /**
   * Se deve mostrar animação
   */
  animated?: boolean;
  /**
   * Se deve mostrar label com porcentagem
   */
  showLabel?: boolean;
  /**
   * Label customizado
   */
  label?: string;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Estilo inline adicional
   */
  style?: React.CSSProperties;
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const ProgressBarContainer = styled.div<{
  $size: UnifiedProgressBarProps['size'];
  $theme?: Theme;
}>`
  width: 100%;
  height: ${props => {
    switch (props.$size) {
      case 'sm':
        return '4px';
      case 'lg':
        return '12px';
      default:
        return '8px';
    }
  }};
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    if (surface && typeof surface === 'object' && 'secondary' in surface) {
      return (surface as any).secondary;
    }
    return props.$theme?.colors?.border || addOpacity(defaultColors.border, 0.2);
  }};
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{
  $value: number;
  $variant: UnifiedProgressBarProps['variant'];
  $theme?: Theme;
  $customColor?: string;
  $animated?: boolean;
}>`
  height: 100%;
  width: ${props => Math.min(Math.max(props.$value, 0), 100)}%;
  border-radius: 9999px;
  transition: width 0.3s ease;
  ${props => props.$animated && `animation: ${pulse} 2s infinite;`}
  
  ${props => {
    // Cor customizada tem prioridade
    if (props.$customColor) {
      return `
        background: linear-gradient(
          90deg,
          ${props.$customColor} 0%,
          ${props.$customColor} 100%
        );
      `;
    }

    // Variantes baseadas em status
    const variantColors = {
      primary: props.$theme?.colors?.primary || defaultColors.primary,
      success: props.$theme?.colors?.success || defaultColors.success,
      warning: props.$theme?.colors?.warning || defaultColors.warning,
      error: props.$theme?.colors?.error || defaultColors.error,
      info: props.$theme?.colors?.info || defaultColors.info,
    };

    const color = variantColors[props.$variant || 'primary'];

    return `
      background: linear-gradient(
        90deg,
        ${color} 0%,
        ${color} 100%
      );
    `;
  }}
`;

const ProgressLabel = styled.div<{
  $theme?: Theme;
  $size: UnifiedProgressBarProps['size'];
}>`
  margin-top: ${props => (props.$size === 'sm' ? '0.25rem' : '0.5rem')};
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
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  text-align: right;
  font-weight: 500;
`;

/**
 * Componente genérico de Progress Bar reutilizável
 * 
 * Substitui: ProgressBar, ProgressFill duplicados em vários arquivos
 * 
 * @example
 * ```tsx
 * // Progress bar básico
 * <UnifiedProgressBar value={75} />
 * 
 * // Com variante e label
 * <UnifiedProgressBar 
 *   value={60} 
 *   variant="success" 
 *   showLabel 
 *   size="lg"
 * />
 * 
 * // Com animação e cor customizada
 * <UnifiedProgressBar 
 *   value={45} 
 *   customColor="#9b59b6" 
 *   animated
 *   label="Carregando..."
 * />
 * ```
 */
export const UnifiedProgressBar: React.FC<UnifiedProgressBarProps> = ({
  value,
  size = 'md',
  variant = 'primary',
  theme,
  customColor,
  animated = false,
  showLabel = false,
  label,
  className,
  style,
}) => {
  const displayValue = Math.min(Math.max(value, 0), 100);
  const displayLabel = label || (showLabel ? `${displayValue}%` : undefined);

  return (
    <div className={className} style={style}>
      <ProgressBarContainer $size={size} $theme={theme}>
        <ProgressFill
          $value={displayValue}
          $variant={variant}
          $theme={theme}
          $customColor={customColor}
          $animated={animated}
        />
      </ProgressBarContainer>
      {displayLabel && (
        <ProgressLabel $theme={theme} $size={size}>
          {displayLabel}
        </ProgressLabel>
      )}
    </div>
  );
};

