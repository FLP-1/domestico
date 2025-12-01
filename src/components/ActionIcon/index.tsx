import React from 'react';
import styled from 'styled-components';

interface ActionIconProps {
  variant:
    | 'approve'
    | 'reject'
    | 'edit'
    | 'delete'
    | 'view'
    | 'warning'
    | 'info'
    | 'success'
    | 'primary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  $theme?: any;
}

const getVariantStyles = (variant: ActionIconProps['variant'], theme?: any) => {
  const getThemeColor = (colorPath: string[], fallback: string) => {
    let value = theme;
    for (const key of colorPath) {
      value = value?.[key];
    }
    return value || fallback;
  };

  const variants = {
    approve: {
      backgroundColor: getThemeColor(['colors', 'status', 'success', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'success'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'success', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'success'], 'transparent') ||
                  'transparent',
      icon: '✅',
    },
    reject: {
      backgroundColor: getThemeColor(['colors', 'status', 'error', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'error'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'error', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'error'], 'transparent') ||
                  'transparent',
      icon: '❌',
    },
    edit: {
      backgroundColor: getThemeColor(['colors', 'status', 'info', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'info'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'info', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'info'], 'transparent') ||
                  'transparent',
      icon: '✏️',
    },
    delete: {
      backgroundColor: getThemeColor(['colors', 'status', 'error', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'error'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'error', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'error'], 'transparent') ||
                  'transparent',
      icon: '🗑️',
    },
    view: {
      backgroundColor: getThemeColor(['colors', 'text', 'secondary'], 'transparent') ||
                      getThemeColor(['colors', 'text'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'text', 'secondary'], 'transparent') ||
                  getThemeColor(['colors', 'text'], 'transparent') ||
                  'transparent',
      icon: '👁️',
    },
    warning: {
      backgroundColor: getThemeColor(['colors', 'status', 'warning', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'warning'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'warning', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'warning'], 'transparent') ||
                  'transparent',
      icon: '⚠️',
    },
    info: {
      backgroundColor: getThemeColor(['colors', 'status', 'info', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'info'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'info', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'info'], 'transparent') ||
                  'transparent',
      icon: 'ℹ️',
    },
    success: {
      backgroundColor: getThemeColor(['colors', 'status', 'success', 'background'], 'transparent') ||
                      getThemeColor(['colors', 'success'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'status', 'success', 'background'], 'transparent') ||
                  getThemeColor(['colors', 'success'], 'transparent') ||
                  'transparent',
      icon: '✅',
    },
    primary: {
      backgroundColor: getThemeColor(['colors', 'primary'], 'transparent') ||
                      getThemeColor(['accent'], 'transparent') ||
                      'transparent',
      hoverColor: getThemeColor(['colors', 'primary'], 'transparent') ||
                  getThemeColor(['accent'], 'transparent') ||
                  'transparent',
      icon: '🔧',
    },
  };

  return variants[variant] || variants.primary;
};

const getSizeStyles = (size: ActionIconProps['size']) => {
  const sizes = {
    small: {
      width: '24px',
      height: '24px',
      fontSize: '12px',
    },
    medium: {
      width: '32px',
      height: '32px',
      fontSize: '16px',
    },
    large: {
      width: '48px',
      height: '48px',
      fontSize: '24px',
    },
  };

  return sizes[size || 'medium'];
};

const StyledActionIcon = styled.button<ActionIconProps>`
  width: ${props => getSizeStyles(props.size || 'medium').width};
  height: ${props => getSizeStyles(props.size || 'medium').height};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  font-size: ${props => getSizeStyles(props.size || 'medium').fontSize};
  position: relative;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 2px 4px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.sm || 'none';
  }};

  background-color: ${props => getVariantStyles(props.variant, props.$theme).backgroundColor};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.surface ||
    'inherit'};

  &:hover {
    background-color: ${props =>
      props.disabled
        ? getVariantStyles(props.variant, props.$theme).backgroundColor
        : getVariantStyles(props.variant, props.$theme).hoverColor};
    transform: ${props => (props.disabled ? 'none' : 'scale(1.1)')};
    box-shadow: ${props => {
      if (props.disabled) {
        const shadowColor = props.$theme?.colors?.shadow ||
                            props.$theme?.shadow?.color;
        if (shadowColor && shadowColor.startsWith('#')) {
          const r = parseInt(shadowColor.slice(1, 3), 16);
          const g = parseInt(shadowColor.slice(3, 5), 16);
          const b = parseInt(shadowColor.slice(5, 7), 16);
          return `0 2px 4px rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        return props.$theme?.shadows?.sm || 'none';
      }
      const shadowColor = props.$theme?.colors?.shadow ||
                          props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 4px 8px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return props.$theme?.shadows?.md || 'none';
    }};
  }

  &:active {
    transform: ${props => (props.disabled ? 'none' : 'scale(0.95)')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  ${props =>
    props.loading &&
    `
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid ${props.$theme?.colors?.text?.onPrimary ||
                            props.$theme?.text?.onPrimary ||
                            props.$theme?.colors?.surface ||
                            'inherit'};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
`;

const ActionIcon: React.FC<ActionIconProps> = ({
  variant,
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  title,
  children,
  className,
}) => {
  const variantInfo = getVariantStyles(variant);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <StyledActionIcon
      variant={variant}
      size={size}
      disabled={disabled || loading}
      loading={loading}
      onClick={handleClick}
      title={title}
      className={className}
    >
      {loading ? '⏳' : children || variantInfo.icon}
    </StyledActionIcon>
  );
};

export default ActionIcon;
