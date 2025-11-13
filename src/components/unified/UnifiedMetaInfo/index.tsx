import React from 'react';
import styled from 'styled-components';
import type { Theme } from '../../../types/theme';
import { defaultColors } from '../../../utils/themeHelpers';

export interface MetaInfoItem {
  /**
   * Label da informação
   */
  label: string;
  /**
   * Valor da informação
   */
  value: React.ReactNode;
  /**
   * Ícone opcional (emoji ou ReactNode)
   */
  icon?: React.ReactNode;
}

export interface UnifiedMetaInfoProps {
  /**
   * Lista de informações a serem exibidas
   */
  items: MetaInfoItem[];
  /**
   * Tamanho do texto
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Variante de layout
   */
  variant?: 'horizontal' | 'vertical' | 'grid';
  /**
   * Tema para cores dinâmicas
   */
  theme?: Theme;
  /**
   * Se deve mostrar separadores
   */
  showSeparators?: boolean;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Estilo inline adicional
   */
  style?: React.CSSProperties;
}

const MetaInfoContainer = styled.div<{
  $variant: UnifiedMetaInfoProps['variant'];
  $theme?: Theme;
  $showSeparators?: boolean;
}>`
  display: ${props => {
    switch (props.$variant) {
      case 'horizontal':
        return 'flex';
      case 'grid':
        return 'grid';
      default:
        return 'flex';
    }
  }};
  flex-direction: ${props => (props.$variant === 'vertical' ? 'column' : 'row')};
  grid-template-columns: ${props =>
    props.$variant === 'grid' ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'none'};
  gap: ${props => (props.$variant === 'horizontal' ? '1rem' : '0.5rem')};
  flex-wrap: wrap;
  padding: ${props => (props.$showSeparators ? '0.5rem 0' : '0')};
  border-bottom: ${props => {
    if (!props.$showSeparators) return 'none';
    const border = props.$theme?.colors?.border;
    const borderColor = (typeof border === 'string' ? border : (border && typeof border === 'object' && (border as any).primary)) || defaultColors.border;
    return `1px solid ${borderColor}`;
  }};
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetaInfoItem = styled.div<{
  $size: UnifiedMetaInfoProps['size'];
  $theme?: Theme;
  $variant: UnifiedMetaInfoProps['variant'];
}>`
  display: flex;
  align-items: ${props => (props.$variant === 'horizontal' ? 'center' : 'flex-start')};
  gap: 0.5rem;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '0.95rem';
      default:
        return '0.875rem';
    }
  }};
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  line-height: 1.5;
`;

const MetaInfoLabel = styled.span<{
  $theme?: Theme;
}>`
  font-weight: 500;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  
  &::after {
    content: ':';
    margin-right: 0.25rem;
  }
`;

const MetaInfoValue = styled.span<{
  $theme?: Theme;
}>`
  font-weight: 600;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || defaultColors.text.primary;
  }};
`;

const MetaInfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
`;

/**
 * Componente genérico de Meta Info reutilizável
 * 
 * Substitui: MetaInfo, DocumentInfo, ListMeta, InfoItem duplicados
 * 
 * @example
 * ```tsx
 * // Meta info vertical
 * <UnifiedMetaInfo
 *   items={[
 *     { label: 'Criado em', value: '01/01/2024', icon: '📅' },
 *     { label: 'Modificado em', value: '02/01/2024', icon: '✏️' },
 *   ]}
 *   variant="vertical"
 * />
 * 
 * // Meta info horizontal
 * <UnifiedMetaInfo
 *   items={[
 *     { label: 'Total', value: 'R$ 1.234,56' },
 *     { label: 'Itens', value: '42' },
 *   ]}
 *   variant="horizontal"
 *   size="sm"
 * />
 * 
 * // Meta info em grid
 * <UnifiedMetaInfo
 *   items={items}
 *   variant="grid"
 *   showSeparators
 * />
 * ```
 */
export const UnifiedMetaInfo: React.FC<UnifiedMetaInfoProps> = ({
  items,
  size = 'md',
  variant = 'vertical',
  theme,
  showSeparators = false,
  className,
  style,
}) => {
  return (
    <MetaInfoContainer
      $variant={variant}
      $theme={theme}
      $showSeparators={showSeparators}
      className={className}
      style={style}
    >
      {items.map((item, index) => (
        <MetaInfoItem
          key={index}
          $size={size}
          $theme={theme}
          $variant={variant}
        >
          {item.icon && <MetaInfoIcon>{item.icon}</MetaInfoIcon>}
          <MetaInfoLabel $theme={theme}>{item.label}</MetaInfoLabel>
          <MetaInfoValue $theme={theme}>{item.value}</MetaInfoValue>
        </MetaInfoItem>
      ))}
    </MetaInfoContainer>
  );
};

