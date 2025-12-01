// src/components/PageHeader/index.tsx
import styled from 'styled-components';
// import { defaultColors } from '../../utils/themeHelpers';
import { getSpacing, getFontSize } from '../shared/tokens';
import { fadeIn } from '../shared/animations';
import type { Theme } from '../../types/theme';

interface PageHeaderProps {
  $theme?: Theme;
  title: string | React.ReactNode; // Aceita string ou ReactNode
  subtitle?: string | React.ReactNode; // Agora opcional e aceita ReactNode
  // NOVAS props opcionais (Fase 2.2)
  variant?: 'default' | 'compact' | 'centered' | 'inline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: React.ReactNode; // Botões/ações ao lado do título
  showDivider?: boolean;
  animation?: boolean;
}

const HeaderContainer = styled.div.withConfig({
  shouldForwardProp: prop => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{
  $variant?: PageHeaderProps['variant'];
  $showDivider?: boolean;
  $theme?: Theme;
}>`
  margin-bottom: ${props => {
    if (props.$variant === 'compact') return getSpacing('md');
    if (props.$variant === 'inline') return getSpacing('sm');
    return getSpacing('xl');
  }};
  ${props => {
    if (!props.$showDivider) return '';
    const border = props.$theme?.colors?.border;
    const borderColor =
      (typeof border === 'object' && border && 'light' in border
        ? String((border as any).light)
        : null) ||
      (typeof (props.$theme as any)?.border === 'object' &&
      (props.$theme as any)?.border &&
      'light' in (props.$theme as any).border
        ? String((props.$theme as any).border.light)
        : 'transparent');
    return `border-bottom: 1px solid ${borderColor}; padding-bottom: ${getSpacing('md')};`;
  }}
`;

const HeaderContent = styled.div.withConfig({
  shouldForwardProp: prop => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $variant?: PageHeaderProps['variant'] }>`
  display: flex;
  align-items: ${props => {
    if (props.$variant === 'centered') return 'center';
    if (props.$variant === 'inline') return 'center';
    return 'flex-start';
  }};
  justify-content: ${props => {
    if (props.$variant === 'centered') return 'center';
    if (props.$variant === 'inline') return 'space-between';
    return 'flex-start';
  }};
  flex-direction: ${props => (props.$variant === 'inline' ? 'row' : 'column')};
  gap: ${props =>
    props.$variant === 'inline' ? getSpacing('md') : getSpacing('sm')};
  text-align: ${props => (props.$variant === 'centered' ? 'center' : 'left')};
`;

const PageTitle = styled.h1.withConfig({
  shouldForwardProp: prop => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{
  $theme?: Theme;
  $size?: PageHeaderProps['size'];
  $variant?: PageHeaderProps['variant'];
  $animation?: boolean;
}>`
  font-family: 'Montserrat', sans-serif;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '1.5rem';
      case 'md':
        return '2rem';
      case 'lg':
        return '2.5rem';
      case 'xl':
        return '3rem';
      default:
        // Mantém comportamento original
        return '2.5rem';
    }
  }};
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    const textDark =
      (typeof text === 'object' && text && 'dark' in text
        ? String((text as any).dark)
        : null) ||
      (typeof (props.$theme as any)?.text === 'object' &&
      (props.$theme as any)?.text &&
      'dark' in (props.$theme as any).text
        ? String((props.$theme as any).text.dark)
        : null) ||
      props.$theme?.colors?.primary ||
      'inherit';
    return textDark;
  }};
  margin: 0;
  ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || (props.$theme as any)?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `text-shadow: 0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1);`;
      }
    }
    return shadowColor ? `text-shadow: 0 2px 4px ${shadowColor};` : '';
  }}
  ${props => (props.$animation ? `animation: ${fadeIn} 0.3s ease-out;` : '')}
`;

const PageSubtitle = styled.p.withConfig({
  shouldForwardProp: prop => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{
  $theme?: Theme;
  $variant?: PageHeaderProps['variant'];
  $animation?: boolean;
}>`
  font-size: ${props => {
    if (props.$variant === 'compact') return getFontSize('sm');
    return getFontSize('lg');
  }};
  color: ${props => {
    const text = props.$theme?.colors?.text;
    const textSecondary =
      (typeof text === 'object' && text && 'secondary' in text
        ? String((text as any).secondary)
        : null) ||
      (typeof (props.$theme as any)?.text === 'object' &&
      (props.$theme as any)?.text &&
      'secondary' in (props.$theme as any).text
        ? String((props.$theme as any).text.secondary)
        : null) ||
      'inherit';
    return textSecondary;
  }};
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
  ${props => (props.$animation ? `animation: ${fadeIn} 0.4s ease-out;` : '')}
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${getSpacing('sm')};
  flex-shrink: 0;
`;

export default function PageHeader({
  $theme,
  title,
  subtitle,
  variant = 'default',
  size,
  actions,
  showDivider = false,
  animation = false,
}: PageHeaderProps) {
  return (
    <HeaderContainer
      $variant={variant}
      $showDivider={showDivider}
      $theme={$theme}
    >
      <HeaderContent $variant={variant}>
        <div>
          <PageTitle
            $theme={$theme}
            $size={size}
            $variant={variant}
            $animation={animation}
          >
            {title}
          </PageTitle>
          {subtitle && (
            <PageSubtitle
              $theme={$theme}
              $variant={variant}
              $animation={animation}
            >
              {subtitle}
            </PageSubtitle>
          )}
        </div>
        {actions && <ActionsContainer>{actions}</ActionsContainer>}
      </HeaderContent>
    </HeaderContainer>
  );
}
