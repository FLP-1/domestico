// src/components/PageContainer/index.tsx
import styled from 'styled-components';
import { fadeIn } from '../shared/animations';
import { getSpacing } from '../shared/tokens';
import type { Theme } from '../../types/theme';

interface PageContainerProps {
  $theme?: Theme;
  children: React.ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
  // NOVAS props opcionais (Fase 2.1)
  variant?: 'default' | 'dashboard' | 'full-width' | 'minimal';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'gradient' | 'solid' | 'transparent';
  maxWidth?: string;
  animation?: boolean;
}

const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{
  $theme?: Theme;
  $variant?: PageContainerProps['variant'];
  $background?: PageContainerProps['background'];
  $animation?: boolean;
}>`
  min-height: 100vh;
  display: flex;
  font-family: 'Roboto', sans-serif;
  ${props => (props.$animation ? `animation: ${fadeIn} 0.6s ease-out;` : '')}
  
  /* Variantes de background */
  background: ${props => {
    const theme = props.$theme;
    
    switch (props.$background) {
      case 'transparent':
        return 'transparent';
      case 'solid':
        return (() => {
          const bg = theme?.colors?.background;
          if (typeof bg === 'object' && bg && 'secondary' in bg) {
            return String((bg as any).secondary);
          }
          if (typeof bg === 'string') {
            return bg;
          }
          const bgObj = theme?.colors?.background;
          if (typeof bgObj === 'object' && bgObj && 'primary' in bgObj) {
            return String((bgObj as any).primary);
          }
          if (typeof bgObj === 'string') {
            return bgObj;
          }
          return 'transparent';
        })();
      case 'gradient':
        return `linear-gradient(
          135deg,
          ${(() => {
            const surface = theme?.colors?.surface;
            if (typeof surface === 'string') return surface;
            const bg = theme?.colors?.background;
            if (typeof bg === 'object' && bg && 'primary' in bg) return String((bg as any).primary);
            if (typeof bg === 'string') return bg;
            return 'transparent';
          })()} 0%,
          ${(() => {
            const border = theme?.colors?.border;
            return (typeof border === 'object' && border && 'light' in border ? String((border as any).light) : null) ||
                   (typeof (theme as any)?.border === 'object' && (theme as any)?.border && 'light' in (theme as any).border ? String((theme as any).border.light) : null) ||
                   (typeof theme?.colors?.background === 'object' && theme?.colors?.background && 'secondary' in theme.colors.background ? String((theme.colors.background as any).secondary) : null) ||
                   'transparent';
          })()} 100%
        )`;
      default:
        // default mantém comportamento original
        return `linear-gradient(
          135deg,
          ${(() => {
            const surface = theme?.colors?.surface;
            if (typeof surface === 'string') return surface;
            const bg = theme?.colors?.background;
            if (typeof bg === 'object' && bg && 'primary' in bg) return String((bg as any).primary);
            if (typeof bg === 'string') return bg;
            return 'transparent';
          })()} 0%,
          ${(() => {
            const border = theme?.colors?.border;
            return (typeof border === 'object' && border && 'light' in border ? String((border as any).light) : null) ||
                   (typeof (theme as any)?.border === 'object' && (theme as any)?.border && 'light' in (theme as any).border ? String((theme as any).border.light) : null) ||
                   (typeof theme?.colors?.background === 'object' && theme?.colors?.background && 'secondary' in theme.colors.background ? String((theme.colors.background as any).secondary) : null) ||
                   'transparent';
          })()} 100%
        )`;
    }
  }};
`;

const MainContent = styled.main.withConfig({
  shouldForwardProp: (prop) => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{
  $sidebarCollapsed: boolean;
  $variant?: PageContainerProps['variant'];
  $maxWidth?: string;
}>`
  flex: 1;
  margin-left: ${props => (props.$sidebarCollapsed ? '100px' : '280px')};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  
  /* Variantes de largura */
  ${props => {
    if (props.$variant === 'full-width') {
      return `
        margin-left: 0;
        max-width: 100%;
      `;
    }
    if (props.$variant === 'minimal') {
      return `
        margin-left: 0;
        max-width: ${props.$maxWidth || '1200px'};
        margin: 0 auto;
      `;
    }
    return '';
  }}
`;

const ContentWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    if (prop === 'className' || prop === 'children') return true;
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{
  $theme?: Theme;
  $padding?: PageContainerProps['padding'];
  $variant?: PageContainerProps['variant'];
  $maxWidth?: string;
}>`
  padding: ${props => {
    if (props.$padding === 'none') return '0';
    if (props.$padding === 'sm') return getSpacing('sm');
    if (props.$padding === 'md') return getSpacing('md');
    if (props.$padding === 'lg') return getSpacing('lg');
    if (props.$padding === 'xl') return getSpacing('xl');
    // default mantém comportamento original
    return '2rem';
  }};
  max-width: ${props => {
    if (props.$maxWidth) return props.$maxWidth;
    if (props.$variant === 'minimal') return '1200px';
    return '100%';
  }};
  box-sizing: border-box;
  margin: ${props => (props.$variant === 'minimal' ? '0 auto' : '0')};
`;

export default function PageContainer({
  $theme,
  children,
  className,
  sidebarCollapsed = false,
  variant = 'default',
  padding,
  background = 'default',
  maxWidth,
  animation = false,
}: PageContainerProps) {
  return (
    <Container
      $theme={$theme}
      className={className}
      $variant={variant}
      $background={background}
      $animation={animation}
    >
      <MainContent
        $sidebarCollapsed={sidebarCollapsed}
        $variant={variant}
        $maxWidth={maxWidth}
      >
        <ContentWrapper
          $theme={$theme}
          $padding={padding}
          $variant={variant}
          $maxWidth={maxWidth}
        >
          {children}
        </ContentWrapper>
      </MainContent>
    </Container>
  );
}
