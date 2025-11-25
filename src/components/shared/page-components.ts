// 🎨 COMPONENTES AUXILIARES DE PÁGINA
//
// Componentes styled auxiliares para uso opcional em páginas.
// NÃO substituem componentes existentes - são complementares.
//
// USO OPCIONAL:
// import { PageSection, PageTitle, PageSubtitle, ContentGrid } from '../components/shared/page-components';
//
// Estes componentes podem ser usados por novas páginas ou durante migração gradual.

import styled from 'styled-components';
import { fadeIn, slideInLeft } from './animations';
import { getSpacing, getShadow, getBorderRadius, getFontSize } from './tokens';
import type { Theme } from '../../types/theme';

// ============================================
// CONTAINERS E LAYOUTS
// ============================================

/**
 * PageSection - Seção de conteúdo padronizada
 * Uso: Agrupar conteúdo relacionado em uma página
 */
export const PageSection = styled.section<{ $theme?: Theme }>`
  margin-bottom: ${getSpacing('xl')};
  padding: ${getSpacing('lg')};
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    'transparent'};
  border-radius: ${getBorderRadius('lg')};
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return getShadow('md');
  }};
  border: 1px solid ${props =>
    props.$theme?.colors?.border?.light ||
    props.$theme?.border?.light ||
    props.$theme?.colors?.border ||
    'transparent'};
  animation: ${fadeIn} 0.3s ease-out;
`;

/**
 * ContentGrid - Grid responsivo para conteúdo
 * Uso: Layouts em grid que se adaptam ao tamanho da tela
 */
export const ContentGrid = styled.div<{
  $columns?: number;
  $gap?: 'sm' | 'md' | 'lg' | 'xl';
  $theme?: Theme;
}>`
  display: grid;
  grid-template-columns: repeat(
    ${props => props.$columns || 'auto-fit'},
    minmax(300px, 1fr)
  );
  gap: ${props => getSpacing(props.$gap || 'lg')};
  margin-bottom: ${getSpacing('xl')};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${getSpacing('md')};
  }
`;

/**
 * FlexRow - Linha flexível horizontal
 * Uso: Agrupar elementos horizontalmente com espaçamento consistente
 */
export const FlexRow = styled.div<{
  $gap?: 'sm' | 'md' | 'lg' | 'xl';
  $align?: 'start' | 'center' | 'end' | 'stretch';
  $justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  $wrap?: boolean;
}>`
  display: flex;
  gap: ${props => getSpacing(props.$gap || 'md')};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  flex-wrap: ${props => (props.$wrap ? 'wrap' : 'nowrap')};
`;

/**
 * FlexColumn - Coluna flexível vertical
 * Uso: Agrupar elementos verticalmente com espaçamento consistente
 */
export const FlexColumn = styled.div<{
  $gap?: 'sm' | 'md' | 'lg' | 'xl';
  $align?: 'start' | 'center' | 'end' | 'stretch';
}>`
  display: flex;
  flex-direction: column;
  gap: ${props => getSpacing(props.$gap || 'md')};
  align-items: ${props => props.$align || 'stretch'};
`;

// ============================================
// TIPOGRAFIA
// ============================================

/**
 * PageTitle - Título principal de página
 * Uso: Títulos principais (H1) padronizados
 */
export const PageTitle = styled.h1<{ $theme?: Theme; $size?: 'md' | 'lg' | 'xl' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: ${props => {
    switch (props.$size) {
      case 'md':
        return getFontSize('xl');
      case 'lg':
        return '2rem';
      case 'xl':
        return '2.5rem';
      default:
        return '2rem';
    }
  }};
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.primary ||
    'inherit'};
  margin: 0 0 ${getSpacing('sm')} 0;
  text-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
`;

/**
 * PageSubtitle - Subtítulo de página
 * Uso: Subtítulos padronizados abaixo do título principal
 */
export const PageSubtitle = styled.p<{ $theme?: Theme }>`
  font-size: ${getFontSize('lg')};
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    'inherit'};
  margin: 0 0 ${getSpacing('xl')} 0;
  font-weight: 500;
  line-height: 1.5;
`;

/**
 * SectionTitle - Título de seção
 * Uso: Títulos de seções dentro de páginas (H2/H3)
 */
export const SectionTitle = styled.h2<{ $theme?: Theme; $size?: 'sm' | 'md' | 'lg' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return getFontSize('lg');
      case 'md':
        return '1.25rem';
      case 'lg':
        return '1.5rem';
      default:
        return '1.25rem';
    }
  }};
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    'inherit'};
  margin: 0 0 ${getSpacing('md')} 0;
  display: flex;
  align-items: center;
  gap: ${getSpacing('sm')};
  padding-bottom: ${getSpacing('sm')};
  border-bottom: 1px solid ${props =>
    props.$theme?.colors?.border?.light ||
    props.$theme?.border?.light ||
    'transparent'};
`;

/**
 * BodyText - Texto de corpo padronizado
 * Uso: Parágrafos e textos de corpo
 */
export const BodyText = styled.p<{ $theme?: Theme; $variant?: 'primary' | 'secondary' }>`
  font-size: ${getFontSize('md')};
  color: ${props => {
    if (props.$variant === 'secondary') {
      return (
        props.$theme?.colors?.text?.secondary ||
        props.$theme?.text?.secondary ||
        'inherit'
      );
    }
    return (
      props.$theme?.colors?.text?.dark ||
      props.$theme?.text?.dark ||
      'inherit'
    );
  }};
  margin: 0 0 ${getSpacing('md')} 0;
  line-height: 1.6;
`;

// ============================================
// CARDS E CONTAINERS
// ============================================

/**
 * CardContainer - Container de card padronizado
 * Uso: Cards simples quando UnifiedCard não é necessário
 */
export const CardContainer = styled.div<{
  $theme?: Theme;
  $variant?: 'default' | 'elevated' | 'outlined';
  $padding?: 'sm' | 'md' | 'lg';
}>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    'transparent'};
  border-radius: ${getBorderRadius('lg')};
  padding: ${props => {
    switch (props.$padding) {
      case 'sm':
        return getSpacing('sm');
      case 'md':
        return getSpacing('md');
      case 'lg':
        return getSpacing('lg');
      default:
        return getSpacing('md');
    }
  }};
  box-shadow: ${props => {
    if (props.$variant === 'elevated') {
      return getShadow('lg');
    }
    if (props.$variant === 'outlined') {
      return 'none';
    }
    return getShadow('md');
  }};
  border: ${props => {
    if (props.$variant === 'outlined') {
      return `1px solid ${
        props.$theme?.colors?.border?.light ||
        props.$theme?.border?.light ||
        'transparent'
      }`;
    }
    return 'none';
  }};
  transition: all 0.3s ease;
`;

/**
 * InfoBox - Caixa de informação
 * Uso: Alertas informativos, dicas, avisos
 */
export const InfoBox = styled.div<{
  $theme?: Theme;
  $variant?: 'info' | 'success' | 'warning' | 'error';
}>`
  padding: ${getSpacing('md')};
  border-radius: ${getBorderRadius('md')};
  border-left: 4px solid ${props => {
    switch (props.$variant) {
      case 'success':
        return (
          props.$theme?.colors?.status?.success?.border ||
          props.$theme?.status?.success?.border ||
          'transparent'
        );
      case 'warning':
        return (
          props.$theme?.colors?.status?.warning?.border ||
          props.$theme?.status?.warning?.border ||
          'transparent'
        );
      case 'error':
        return (
          props.$theme?.colors?.status?.error?.border ||
          props.$theme?.status?.error?.border ||
          'transparent'
        );
      default:
        return (
          props.$theme?.colors?.status?.info?.border ||
          props.$theme?.status?.info?.border ||
          'transparent'
        );
    }
  }};
  background: ${props => {
    switch (props.$variant) {
      case 'success':
        return (
          props.$theme?.colors?.status?.success?.background ||
          props.$theme?.status?.success?.background ||
          'transparent'
        );
      case 'warning':
        return (
          props.$theme?.colors?.status?.warning?.background ||
          props.$theme?.status?.warning?.background ||
          'transparent'
        );
      case 'error':
        return (
          props.$theme?.colors?.status?.error?.background ||
          props.$theme?.status?.error?.background ||
          'transparent'
        );
      default:
        return (
          props.$theme?.colors?.status?.info?.background ||
          props.$theme?.status?.info?.background ||
          'transparent'
        );
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'success':
        return (
          props.$theme?.colors?.status?.success?.text ||
          props.$theme?.status?.success?.text ||
          'inherit'
        );
      case 'warning':
        return (
          props.$theme?.colors?.status?.warning?.text ||
          props.$theme?.status?.warning?.text ||
          'inherit'
        );
      case 'error':
        return (
          props.$theme?.colors?.status?.error?.text ||
          props.$theme?.status?.error?.text ||
          'inherit'
        );
      default:
        return (
          props.$theme?.colors?.status?.info?.text ||
          props.$theme?.status?.info?.text ||
          'inherit'
        );
    }
  }};
  margin-bottom: ${getSpacing('md')};
`;

// ============================================
// SEPARADORES E DIVISORES
// ============================================

/**
 * Divider - Linha divisória
 * Uso: Separar seções visualmente
 */
export const Divider = styled.hr<{ $theme?: Theme; $variant?: 'solid' | 'dashed' }>`
  border: none;
  border-top: 1px ${props => props.$variant || 'solid'}
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.border?.light ||
      'transparent'};
  margin: ${getSpacing('xl')} 0;
`;

/**
 * Spacer - Espaçador flexível
 * Uso: Adicionar espaçamento entre elementos
 */
export const Spacer = styled.div<{ $size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>`
  height: ${props => getSpacing(props.$size || 'md')};
  width: 100%;
`;

// ============================================
// ESTADOS E FEEDBACK
// ============================================

/**
 * LoadingContainer - Container para estados de carregamento
 * Uso: Exibir loading de forma padronizada
 */
export const LoadingContainer = styled.div<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    'inherit'};
`;

/**
 * EmptyState - Estado vazio padronizado
 * Uso: Quando não há dados para exibir
 */
export const EmptyState = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: ${getSpacing('2xl')};
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    'inherit'};
`;

