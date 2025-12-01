import React from 'react';
import styled, { keyframes } from 'styled-components';

// Função para gerar keyframes dinamicamente baseado no tema
const createSuccessPulse = (theme?: any) => {
  const primaryColor = theme?.colors?.primary || theme?.accent;
  
  // Se não houver tema, usar shadow do tema ou transparent
  if (!primaryColor) {
    return keyframes`
      0% {
        transform: scale(1);
        box-shadow: none;
      }
      70% {
        transform: scale(1.1);
        box-shadow: none;
      }
      100% {
        transform: scale(1);
        box-shadow: none;
      }
    `;
  }
  
  let r = 0, g = 0, b = 0;
  
  if (primaryColor.startsWith('#')) {
    r = parseInt(primaryColor.slice(1, 3), 16);
    g = parseInt(primaryColor.slice(3, 5), 16);
    b = parseInt(primaryColor.slice(5, 7), 16);
  } else if (primaryColor.startsWith('rgb')) {
    const match = primaryColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1], 10);
      g = parseInt(match[2], 10);
      b = parseInt(match[3], 10);
    }
  }
  
  return keyframes`
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(${r}, ${g}, ${b}, 0.7);
    }
    70% {
      transform: scale(1.1);
      box-shadow: 0 0 0 20px rgba(${r}, ${g}, ${b}, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(${r}, ${g}, ${b}, 0);
    }
  `;
};

const ButtonContainer = styled.button<{
  $isClockedIn: boolean;
  $justRegistered: boolean;
  $theme?: any;
  $size?: 'small' | 'medium' | 'large';
}>`
  width: ${props => {
    switch (props.$size) {
      case 'small':
        return '120px';
      case 'large':
        return '250px';
      default:
        return '200px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small':
        return '120px';
      case 'large':
        return '250px';
      default:
        return '200px';
    }
  }};
  border-radius: 50%;
  border: none;
  background: ${props => {
    if (props.$isClockedIn) {
      const errorColor = props.$theme?.colors?.status?.error?.background ||
                        props.$theme?.status?.error?.background ||
                        props.$theme?.colors?.error ||
                        props.$theme?.colors?.accent ||
                        'transparent';
      const errorDark = props.$theme?.colors?.status?.error?.dark ||
                       props.$theme?.status?.error?.dark ||
                       props.$theme?.colors?.error ||
                       errorColor;
      return `linear-gradient(135deg, ${errorColor}, ${errorDark})`;
    }
    
    const primaryColor = props.$theme?.colors?.primary || 'transparent';
    const secondaryColor = props.$theme?.colors?.secondary || primaryColor;
    return `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
  }};
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  font-family: 'Montserrat', sans-serif;
  font-size: ${props => {
    switch (props.$size) {
      case 'small':
        return '1rem';
      case 'large':
        return '1.5rem';
      default:
        return '1.25rem';
    }
  }};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => {
    const primaryColor = props.$theme?.colors?.primary;
    if (!primaryColor) return 'none';
    // Adiciona opacidade ao hex color
    if (primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `0 8px 32px rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    if (primaryColor.startsWith('rgb')) {
      return `0 8px 32px ${primaryColor.replace(')', ', 0.3)').replace('rgb', 'rgba')}`;
    }
    return 'none';
  }};
  position: relative;
  overflow: hidden;
  animation: ${props => {
    if (!props.$justRegistered) return 'none';
    const pulseAnimation = createSuccessPulse(props.$theme);
    return `${pulseAnimation} 1s ease-out`;
  }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => {
      const primaryColor = props.$theme?.colors?.primary;
      if (!primaryColor) return 'none';
      // Adiciona opacidade ao hex color
      if (primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 12px 40px rgba(${r}, ${g}, ${b}, 0.4)`;
      }
      if (primaryColor.startsWith('rgb')) {
        return `0 12px 40px ${primaryColor.replace(')', ', 0.4)').replace('rgb', 'rgba')}`;
      }
      return 'none';
    }};
  }

  &:active {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .icon {
    font-size: ${props => {
      switch (props.$size) {
        case 'small':
          return '2rem';
        case 'large':
          return '4rem';
        default:
          return '3rem';
      }
    }};
    margin-bottom: 0.5rem;
    display: block;
  }

  .text {
    font-size: ${props => {
      switch (props.$size) {
        case 'small':
          return '0.8rem';
        case 'large':
          return '1.2rem';
        default:
          return '1rem';
      }
    }};
    font-weight: 600;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${props => {
        const textColor = props.$theme?.colors?.text?.primary || 
                         props.$theme?.text?.primary ||
                         props.$theme?.colors?.text ||
                         props.$theme?.colors?.surface ||
                         'currentColor';
        // Adiciona opacidade à cor
        if (textColor && textColor.startsWith('#')) {
          const r = parseInt(textColor.slice(1, 3), 16);
          const g = parseInt(textColor.slice(3, 5), 16);
          const b = parseInt(textColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.2)`;
        }
        if (textColor && textColor.startsWith('rgb')) {
          return textColor.replace(')', ', 0.2)').replace('rgb', 'rgba');
        }
        return 'transparent';
      }},
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

export interface ClockInButtonProps {
  isClockedIn: boolean;
  justRegistered?: boolean;
  theme?: any;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  icon?: string;
  text?: string;
}

export const ClockInButton: React.FC<ClockInButtonProps> = ({
  isClockedIn,
  justRegistered = false,
  theme,
  size = 'medium',
  onClick,
  disabled = false,
  icon,
  text,
}) => {
  const defaultIcon = isClockedIn ? '⏰' : '🕐';
  const defaultText = isClockedIn ? 'Sair' : 'Entrar';

  return (
    <ButtonContainer
      $isClockedIn={isClockedIn}
      $justRegistered={justRegistered}
      $theme={theme}
      $size={size}
      onClick={onClick}
      disabled={disabled}
    >
      <span className='icon'>{icon || defaultIcon}</span>
      <span className='text'>{text || defaultText}</span>
    </ButtonContainer>
  );
};

export default ClockInButton;
