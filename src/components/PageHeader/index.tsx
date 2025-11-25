// src/components/PageHeader/index.tsx
import styled from 'styled-components';
import { defaultColors } from '../../utils/themeHelpers';
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

const HeaderContainer = styled.div<{
  $variant?: PageHeaderProps['variant'];
  $showDivider?: boolean;
  $theme?: Theme;
}>`
  margin-bottom: ${props => {
    if (props.$variant === 'compact') return getSpacing('md');
    if (props.$variant === 'inline') return getSpacing('sm');
    return getSpacing('xl');
  }};
  ${props => (props.$showDivider ? `border-bottom: 1px solid ${props.$theme?.colors?.border?.light || props.$theme?.border?.light || 'transparent'}; padding-bottom: ${getSpacing('md')};` : '')}
`;

const HeaderContent = styled.div<{ $variant?: PageHeaderProps['variant'] }>`
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
  gap: ${props => (props.$variant === 'inline' ? getSpacing('md') : getSpacing('sm'))};
  text-align: ${props => (props.$variant === 'centered' ? 'center' : 'left')};
`;

const PageTitle = styled.h1<{
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
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.primary ||
    defaultColors.text.primary};
  margin: 0;
  ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `text-shadow: 0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1);`;
      }
    }
    return props.$theme?.colors?.shadow || defaultColors.shadow
      ? `text-shadow: 0 2px 4px ${props.$theme?.colors?.shadow || defaultColors.shadow};`
      : '';
  }}
  ${props => (props.$animation ? `animation: ${fadeIn} 0.3s ease-out;` : '')}
`;

const PageSubtitle = styled.p<{
  $theme?: Theme;
  $variant?: PageHeaderProps['variant'];
  $animation?: boolean;
}>`
  font-size: ${props => {
    if (props.$variant === 'compact') return getFontSize('sm');
    return getFontSize('lg');
  }};
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    defaultColors.text.secondary};
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
    <HeaderContainer $variant={variant} $showDivider={showDivider} $theme={$theme}>
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
            <PageSubtitle $theme={$theme} $variant={variant} $animation={animation}>
              {subtitle}
            </PageSubtitle>
          )}
        </div>
        {actions && <ActionsContainer>{actions}</ActionsContainer>}
      </HeaderContent>
    </HeaderContainer>
  );
}
