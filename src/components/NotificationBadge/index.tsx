import React from 'react';
import styled from 'styled-components';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'default' | 'warning' | 'error' | 'success' | 'info';
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showZero?: boolean;
  className?: string;
  $theme?: any;
}

const getVariantStyles = (
  variant: NotificationBadgeProps['variant'],
  theme?: any
) => {
  const getThemeColor = (colorPath: string[], fallback: string) => {
    let value = theme;
    for (const key of colorPath) {
      value = value?.[key];
    }
    return value || fallback;
  };

  const variants = {
    default: {
      backgroundColor:
        getThemeColor(
          ['colors', 'status', 'error', 'background'],
          'transparent'
        ) ||
        getThemeColor(['colors', 'error'], 'transparent') ||
        'transparent',
      color:
        getThemeColor(['colors', 'text', 'onPrimary'], 'inherit') ||
        getThemeColor(['text', 'onPrimary'], 'inherit') ||
        getThemeColor(['colors', 'surface'], 'inherit') ||
        'inherit',
      borderColor:
        getThemeColor(['colors', 'text', 'onPrimary'], 'transparent') ||
        getThemeColor(['text', 'onPrimary'], 'transparent') ||
        getThemeColor(['colors', 'surface'], 'transparent') ||
        'transparent',
    },
    warning: {
      backgroundColor:
        getThemeColor(
          ['colors', 'status', 'warning', 'background'],
          'transparent'
        ) ||
        getThemeColor(['colors', 'warning'], 'transparent') ||
        'transparent',
      color:
        getThemeColor(['colors', 'status', 'warning', 'text'], 'inherit') ||
        getThemeColor(['status', 'warning', 'text'], 'inherit') ||
        getThemeColor(['colors', 'text', 'primary'], 'inherit') ||
        'inherit',
      borderColor:
        getThemeColor(['colors', 'text', 'onPrimary'], 'transparent') ||
        getThemeColor(['text', 'onPrimary'], 'transparent') ||
        getThemeColor(['colors', 'surface'], 'transparent') ||
        'transparent',
    },
    error: {
      backgroundColor:
        getThemeColor(
          ['colors', 'status', 'error', 'background'],
          'transparent'
        ) ||
        getThemeColor(['colors', 'error'], 'transparent') ||
        'transparent',
      color:
        getThemeColor(['colors', 'text', 'onPrimary'], 'inherit') ||
        getThemeColor(['text', 'onPrimary'], 'inherit') ||
        getThemeColor(['colors', 'surface'], 'inherit') ||
        'inherit',
      borderColor:
        getThemeColor(['colors', 'text', 'onPrimary'], 'transparent') ||
        getThemeColor(['text', 'onPrimary'], 'transparent') ||
        getThemeColor(['colors', 'surface'], 'transparent') ||
        'transparent',
    },
    success: {
      backgroundColor:
        getThemeColor(
          ['colors', 'status', 'success', 'background'],
          'transparent'
        ) ||
        getThemeColor(['colors', 'success'], 'transparent') ||
        'transparent',
      color:
        getThemeColor(['colors', 'text', 'onPrimary'], 'inherit') ||
        getThemeColor(['text', 'onPrimary'], 'inherit') ||
        getThemeColor(['colors', 'surface'], 'inherit') ||
        'inherit',
      borderColor:
        getThemeColor(['colors', 'text', 'onPrimary'], 'transparent') ||
        getThemeColor(['text', 'onPrimary'], 'transparent') ||
        getThemeColor(['colors', 'surface'], 'transparent') ||
        'transparent',
    },
    info: {
      backgroundColor:
        getThemeColor(
          ['colors', 'status', 'info', 'background'],
          'transparent'
        ) ||
        getThemeColor(['colors', 'info'], 'transparent') ||
        'transparent',
      color:
        getThemeColor(['colors', 'text', 'onPrimary'], 'inherit') ||
        getThemeColor(['text', 'onPrimary'], 'inherit') ||
        getThemeColor(['colors', 'surface'], 'inherit') ||
        'inherit',
      borderColor:
        getThemeColor(['colors', 'text', 'onPrimary'], 'transparent') ||
        getThemeColor(['text', 'onPrimary'], 'transparent') ||
        getThemeColor(['colors', 'surface'], 'transparent') ||
        'transparent',
    },
  };

  return variants[variant || 'default'];
};

const getSizeStyles = (size: NotificationBadgeProps['size']) => {
  const sizes = {
    small: {
      width: '16px',
      height: '16px',
      fontSize: '10px',
      borderWidth: '1px',
    },
    medium: {
      width: '20px',
      height: '20px',
      fontSize: '12px',
      borderWidth: '2px',
    },
    large: {
      width: '24px',
      height: '24px',
      fontSize: '14px',
      borderWidth: '2px',
    },
  };

  return sizes[size || 'medium'];
};

const getPositionStyles = (position: NotificationBadgeProps['position']) => {
  const positions = {
    'top-right': {
      top: '-8px',
      right: '-8px',
    },
    'top-left': {
      top: '-8px',
      left: '-8px',
    },
    'bottom-right': {
      bottom: '-8px',
      right: '-8px',
    },
    'bottom-left': {
      bottom: '-8px',
      left: '-8px',
    },
  };

  return positions[position || 'top-right'];
};

const StyledBadge = styled.div<NotificationBadgeProps>`
  position: absolute;
  width: ${props => getSizeStyles(props.size || 'medium').width};
  height: ${props => getSizeStyles(props.size || 'medium').height};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${props => getSizeStyles(props.size || 'medium').fontSize};
  line-height: 1;
  border: ${props => getSizeStyles(props.size || 'medium').borderWidth} solid
    ${props => getVariantStyles(props.variant, props.$theme).borderColor};

  background-color: ${props =>
    getVariantStyles(props.variant, props.$theme).backgroundColor};
  color: ${props => getVariantStyles(props.variant, props.$theme).color};

  ${props => {
    const positionStyles = getPositionStyles(props.position || 'top-right');
    return Object.entries(positionStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  }}

  /* Animação de entrada */
  animation: badgeAppear 0.3s ease-out;

  @keyframes badgeAppear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Pulsar quando há notificações */
  ${props =>
    props.count > 0 &&
    `
    animation: badgeAppear 0.3s ease-out, badgePulse 2s infinite;
    
    @keyframes badgePulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
  `}
`;

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  variant = 'default',
  size = 'medium',
  position = 'top-right',
  showZero = false,
  className,
}) => {
  // Não mostrar badge se count for 0 e showZero for false
  if (count === 0 && !showZero) {
    return null;
  }

  // Limitar o número exibido
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <StyledBadge
      count={count}
      maxCount={maxCount}
      variant={variant}
      size={size}
      position={position}
      showZero={showZero}
      className={className}
    >
      {displayCount}
    </StyledBadge>
  );
};

export default NotificationBadge;
