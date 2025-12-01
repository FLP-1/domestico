import React from 'react';
import styled from 'styled-components';
import type { Theme } from '../../../types/theme';
import { defaultColors, addOpacity } from '../../../utils/themeHelpers';

export interface TabItem {
  /**
   * ID único da tab
   */
  id: string;
  /**
   * Label da tab
   */
  label: string;
  /**
   * Ícone opcional (emoji ou ReactNode)
   */
  icon?: React.ReactNode;
  /**
   * Se a tab está desabilitada
   */
  disabled?: boolean;
  /**
   * Badge opcional (contador, notificação, etc.)
   */
  badge?: React.ReactNode;
}

export interface UnifiedTabsProps {
  /**
   * Lista de tabs
   */
  tabs: TabItem[];
  /**
   * ID da tab ativa
   */
  activeTab: string;
  /**
   * Callback quando uma tab é clicada
   */
  onTabChange: (tabId: string) => void;
  /**
   * Tamanho das tabs
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Variante de estilo
   */
  variant?: 'default' | 'pills' | 'underline';
  /**
   * Tema para cores dinâmicas
   */
  theme?: Theme;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Estilo inline adicional
   */
  style?: React.CSSProperties;
}

const TabsContainer = styled.div<{
  $variant: UnifiedTabsProps['variant'];
  $theme?: Theme;
}>`
  display: flex;
  gap: 0.5rem;
  margin-bottom: ${props => {
    switch (props.$variant) {
      case 'underline':
        return '0';
      default:
        return '1rem';
    }
  }};
  border-bottom: ${props => {
    if (props.$variant === 'underline') {
      return `2px solid ${props.$theme?.colors?.border || defaultColors.border}`;
    }
    return 'none';
  }};
  overflow-x: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props =>
      props.$theme?.colors?.border || defaultColors.border};
    border-radius: 2px;
  }
`;

const TabButton = styled.button<{
  $active: boolean;
  $size: UnifiedTabsProps['size'];
  $variant: UnifiedTabsProps['variant'];
  $theme?: Theme;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.5rem 1rem';
      case 'lg':
        return '1rem 2rem';
      default:
        return '0.75rem 1.5rem';
    }
  }};
  border: none;
  background: ${props => {
    if (props.$variant === 'pills') {
      if (props.$active) {
        return props.$theme?.colors?.primary || defaultColors.primary;
      }
      return 'transparent';
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.$disabled) {
      const text = props.$theme?.colors?.text;
      return (
        (text && typeof text === 'object' && text.secondary) ||
        defaultColors.text.secondary
      );
    }
    if (props.$variant === 'pills' && props.$active) {
      return props.$theme?.colors?.surface || defaultColors.surface;
    }
    if (props.$active) {
      return props.$theme?.colors?.primary || defaultColors.primary;
    }
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.secondary) ||
      defaultColors.text.secondary
    );
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.875rem';
      case 'lg':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  font-weight: ${props => (props.$active ? 600 : 500)};
  border-radius: ${props => {
    if (props.$variant === 'pills') {
      return '9999px';
    }
    return '0';
  }};
  border-bottom: ${props => {
    if (props.$variant === 'underline' && props.$active) {
      return `2px solid ${props.$theme?.colors?.primary || defaultColors.primary}`;
    }
    return '2px solid transparent';
  }};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;

  &:hover {
    ${props => {
      if (props.$disabled) return '';
      if (props.$variant === 'pills') {
        if (!props.$active) {
          return `
            background: ${addOpacity(
              props.$theme?.colors?.primary || defaultColors.primary,
              0.1
            )};
          `;
        }
        return '';
      }
      return `
        color: ${props.$theme?.colors?.primary || defaultColors.primary};
      `;
    }}
  }

  &:active {
    transform: ${props => (props.$disabled ? 'none' : 'scale(0.98)')};
  }
`;

const TabBadge = styled.span<{
  $theme?: Theme;
  $active?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${props =>
    props.$active
      ? props.$theme?.colors?.surface || defaultColors.surface
      : addOpacity(
          props.$theme?.colors?.primary || defaultColors.primary,
          0.15
        )};
  color: ${props =>
    props.$active
      ? props.$theme?.colors?.primary || defaultColors.primary
      : (() => {
          const text = props.$theme?.colors?.text;
          return (
            (text && typeof text === 'object' && text.secondary) ||
            defaultColors.text.secondary
          );
        })()};
`;

/**
 * Componente genérico de Tabs reutilizável
 *
 * Substitui: Tab, TabButton, ColumnHeader duplicados em vários arquivos
 *
 * @example
 * ```tsx
 * // Tabs básico
 * <UnifiedTabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1' },
 *     { id: 'tab2', label: 'Tab 2' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 *
 * // Tabs com ícones e badges
 * <UnifiedTabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1', icon: '📊', badge: '5' },
 *     { id: 'tab2', label: 'Tab 2', icon: '⚙️' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="pills"
 *   size="lg"
 * />
 *
 * // Tabs underline
 * <UnifiedTabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="underline"
 * />
 * ```
 */
export const UnifiedTabs: React.FC<UnifiedTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  size = 'md',
  variant = 'default',
  theme,
  className,
  style,
}) => {
  return (
    <TabsContainer
      $variant={variant}
      $theme={theme}
      className={className}
      style={style}
    >
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          $active={activeTab === tab.id}
          $size={size}
          $variant={variant}
          $theme={theme}
          $disabled={tab.disabled}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge && (
            <TabBadge $theme={theme} $active={activeTab === tab.id}>
              {tab.badge}
            </TabBadge>
          )}
        </TabButton>
      ))}
    </TabsContainer>
  );
};
