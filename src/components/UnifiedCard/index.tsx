import React, { ReactNode } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { componentShadows, createThemedStyles } from '../../design-system';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled Components
const CardContainer = styled.div<{
  $variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  $size?: 'sm' | 'md' | 'lg';
  $status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  $interactive?: boolean;
  $theme?: any;
}>`
  background: ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    switch (props.$variant) {
      case 'elevated':
        return props.$theme?.colors?.background?.primary || 
               props.$theme?.background?.primary || 
               themedStyles.background || 
               'transparent';
      case 'outlined':
        return 'transparent';
      case 'filled':
        return props.$theme?.colors?.background?.secondary || 
               props.$theme?.background?.secondary || 
               themedStyles.surface || 
               'transparent';
      case 'glass':
        return 'transparent'; // Glass effect será aplicado via backdrop-filter
      default:
        return props.$theme?.colors?.background?.primary || 
               props.$theme?.background?.primary || 
               themedStyles.background || 
               'transparent';
    }
  }};
  border: ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `1px solid ${props.$theme?.colors?.border?.light || 
                          props.$theme?.border?.light || 
                          props.$theme?.colors?.border || 
                          'transparent'}`;
      case 'glass':
        return '1px solid transparent'; // Glass effect será aplicado via backdrop-filter
      default:
        return 'none';
    }
  }};
  border-radius: ${props => {
    switch (props.$size) {
      case 'sm':
        return '6px';
      case 'lg':
        return '16px';
      default:
        return '12px';
    }
  }};
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '1rem';
      case 'lg':
        return '2rem';
      default:
        return '1.5rem';
    }
  }};
  box-shadow: ${props => {
    switch (props.$variant) {
      case 'elevated':
        return componentShadows.card;
      case 'glass':
        return '0 8px 32px rgba(0, 0, 0, 0.1)';
      default:
        return componentShadows.card;
    }
  }};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;

  /* Status colors */
  ${props => {
    const getStatusStyles = () => {
      if (!props.$status || props.$status === 'default') return '';

      const statusColor = props.$theme?.colors?.status?.[props.$status]?.border ||
                         props.$theme?.status?.[props.$status]?.border ||
                         props.$theme?.colors?.status?.[props.$status] ||
                         props.$theme?.status?.[props.$status] ||
                         'transparent';
      
      const statusBg = props.$theme?.colors?.status?.[props.$status]?.background ||
                       props.$theme?.status?.[props.$status]?.background ||
                       'transparent';
      
      return `
        border-left: 4px solid ${statusColor};
        background: linear-gradient(90deg, ${statusBg} 0%, transparent 100%);
      `;
    };

    return getStatusStyles();
  }}

  /* Interactive styles */
  ${props =>
    props.$interactive
      ? `
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${componentShadows.cardHover};
    }
    &:active {
      transform: translateY(0);
    }
  `
      : ''}

  /* Status animations */
  ${props =>
    props.$status === 'success'
      ? css`
          animation: ${fadeIn} 0.6s ease-out, ${pulse} 2s infinite;
        `
      : ''}

  /* Glass effect */
  ${props =>
    props.$variant === 'glass'
      ? `
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `
      : ''}
`;

const CardHeader = styled.div<{ $centered?: boolean; $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  ${props =>
    props.$centered ? 'justify-content: center; text-align: center;' : ''}
`;

const CardIcon = styled.div<{ $theme?: any; $status?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => {
    if (props.$status && props.$status !== 'default') {
      return props.$theme?.colors?.status?.[props.$status]?.background ||
             props.$theme?.status?.[props.$status]?.background ||
             'transparent';
    }
    return props.$theme?.colors?.primary ||
           props.$theme?.accent ||
           'transparent';
  }};
  color: ${props => {
    if (props.$status && props.$status !== 'default') {
      return props.$theme?.colors?.status?.[props.$status]?.text ||
             props.$theme?.status?.[props.$status]?.text ||
             'inherit';
    }
    return props.$theme?.colors?.primary ||
           props.$theme?.accent ||
           'inherit';
  }};
  font-size: 1.5rem;
  animation: ${slideIn} 0.6s ease-out;
`;

const CardTitle = styled.h3<{ $size?: 'sm' | 'md' | 'lg'; $theme?: any }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '1rem';
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
    props.$theme?.colors?.text || 
    'inherit'
  };
  margin: 0;
  line-height: 1.4;
`;

const CardContent = styled.div<{ $centered?: boolean; $theme?: any }>`
  line-height: 1.6;
  flex: 1;
  ${props => (props.$centered ? 'text-align: center;' : '')}
`;

const CardFooter = styled.div<{ $centered?: boolean; $theme?: any }>`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  ${props =>
    props.$centered ? 'justify-content: center;' : 'justify-content: flex-end;'}
`;

// Stats Card Components
const StatValue = styled.div<{ $color?: string; $size?: 'sm' | 'md' | 'lg'; $theme?: any }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '1.25rem';
      case 'lg':
        return '2.5rem';
      default:
        return '1.75rem';
    }
  }};
  font-weight: 700;
  color: ${props => 
    props.$color || 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    props.$theme?.colors?.text || 
    'inherit'
  };
  line-height: 1.2;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div<{ $size?: 'sm' | 'md' | 'lg'; $theme?: any }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.875rem';
    }
  }};
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary || 
    'inherit'
  };
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatDescription = styled.div<{ $size?: 'sm' | 'md' | 'lg'; $theme?: any }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.7rem';
      case 'lg':
        return '0.9rem';
      default:
        return '0.8rem';
    }
  }};
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary || 
    'inherit'
  };
  margin-top: 0.5rem;
  line-height: 1.4;
`;

// Status Indicator
const StatusIndicator = styled.div<{
  $status?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.$status) {
      return props.$theme?.colors?.status?.[props.$status]?.background ||
             props.$theme?.status?.[props.$status]?.background ||
             'transparent';
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.$status) {
      return props.$theme?.colors?.status?.[props.$status]?.text ||
             props.$theme?.status?.[props.$status]?.text ||
             'inherit';
    }
    return 'inherit';
  }};
  animation: ${props => (props.$status === 'success' ? pulse : 'none')} 2s
    infinite;
`;

export interface UnifiedCardProps {
  children: ReactNode;
  theme?: any;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
  statsValue?: string | number;
  statsLabel?: string;
  statsColor?: string;
  statsDescription?: string;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  children,
  theme,
  variant = 'default',
  size = 'md',
  status = 'default',
  title,
  icon,
  footer,
  onClick,
  'aria-label': ariaLabel,
  statsValue,
  statsLabel,
  statsColor,
  statsDescription,
}) => {
  const isStatsCard = statsValue !== undefined;
  const isInteractive = !!onClick;
  const centered = isStatsCard;

  if (isStatsCard) {
    // Stats Card Layout
    return (
      <CardContainer
        $variant={variant}
        $size={size}
        $status={status}
        $interactive={isInteractive}
        $theme={theme}
        onClick={onClick}
        aria-label={ariaLabel}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
      >
        <CardContent $centered={centered}>
          {icon && (
            <CardIcon $theme={theme} $status={status}>
              {icon}
            </CardIcon>
          )}
          <StatValue $color={statsColor} $size={size} $theme={theme}>
            {statsValue}
          </StatValue>
          <StatLabel $size={size} $theme={theme}>{statsLabel}</StatLabel>
          {statsDescription && (
            <StatDescription $size={size} $theme={theme}>{statsDescription}</StatDescription>
          )}
        </CardContent>
      </CardContainer>
    );
  }

  // Regular Card Layout
  return (
    <CardContainer
      $variant={variant}
      $size={size}
      $status={status}
      $interactive={isInteractive}
      $theme={theme}
      onClick={onClick}
      aria-label={ariaLabel}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <>
        {(icon || title) && (
          <CardHeader $centered={centered}>
            {icon && (
              <CardIcon $theme={theme} $status={status}>
                {icon}
              </CardIcon>
            )}
            {title && <CardTitle $size={size}>{title}</CardTitle>}
          </CardHeader>
        )}

        <CardContent $centered={centered}>{children}</CardContent>

        {footer && <CardFooter $centered={centered}>{footer}</CardFooter>}
      </>
    </CardContainer>
  );
};

export default UnifiedCard;
