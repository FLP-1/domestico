import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const WidgetContainer = styled.div<{
  $type: 'primary' | 'secondary' | 'success' | 'warning';
  $theme?: any;
  $clickable?: boolean;
}>`
  background: ${props => {
    const surfaceColor = props.$theme?.colors?.surface ||
                        props.$theme?.colors?.background?.primary ||
                        props.$theme?.background?.primary ||
                        'transparent';
    // Adiciona opacidade à cor
    if (surfaceColor && surfaceColor.startsWith('#')) {
      const r = parseInt(surfaceColor.slice(1, 3), 16);
      const g = parseInt(surfaceColor.slice(3, 5), 16);
      const b = parseInt(surfaceColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    if (surfaceColor && surfaceColor.startsWith('rgb')) {
      return surfaceColor.replace(')', ', 0.95)').replace('rgb', 'rgba');
    }
    return 'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => 
    props.$theme?.colors?.shadow || 
    props.$theme?.shadow ||
    'transparent'};
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (!primaryColor) return 'transparent';
    // Adiciona opacidade ao hex color (20 em hex = 0.125 em decimal)
    if (primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.125)`;
    }
    if (primaryColor.startsWith('rgb')) {
      return primaryColor.replace(')', ', 0.125)').replace('rgb', 'rgba');
    }
    return 'transparent';
  }};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.6s ease-out;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};

  &:hover {
    transform: ${props => (props.$clickable ? 'translateY(-4px)' : 'none')};
    box-shadow: ${props => {
      if (props.$clickable) {
        const shadowColor = props.$theme?.colors?.shadow ||
                            props.$theme?.shadow?.color;
        if (shadowColor && shadowColor.startsWith('#')) {
          const r = parseInt(shadowColor.slice(1, 3), 16);
          const g = parseInt(shadowColor.slice(3, 5), 16);
          const b = parseInt(shadowColor.slice(5, 7), 16);
          return `0 8px 24px rgba(${r}, ${g}, ${b}, 0.15)`;
        }
        return props.$theme?.shadows?.xl || 'none';
      }
      const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow || 'transparent';
      return `0 4px 16px ${shadowColor}`;
    }};
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => 
      props.$theme?.colors?.text?.dark || 
      props.$theme?.text?.dark ||
      props.$theme?.colors?.text?.primary ||
      props.$theme?.colors?.text ||
      'inherit'};
    margin: 0;
  }

  .icon {
    font-size: 1.5rem;
    color: ${props => {
      switch (props.$type) {
        case 'primary':
          return props.$theme.colors.primary;
        case 'secondary':
          return props.$theme.colors.textSecondary;
        case 'success':
          return props.$theme.colors.secondary;
        case 'warning':
          return props.$theme.colors.accent;
        default:
          return props.$theme.colors.primary;
      }
    }};
  }

  .content {
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.text ||
      'inherit'};
    line-height: 1.6;
  }

  .metric {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => {
      switch (props.$type) {
        case 'primary':
          return props.$theme.colors.primary;
        case 'secondary':
          return props.$theme.colors.textSecondary;
        case 'success':
          return props.$theme.colors.secondary;
        case 'warning':
          return props.$theme.colors.accent;
        default:
          return props.$theme.colors.primary;
      }
    }};
    margin: 0.5rem 0;
  }

  .description {
    font-size: 0.9rem;
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.text ||
      'inherit'};
    margin: 0;
  }
`;

export interface WidgetProps {
  id: string;
  title: string;
  icon: string;
  type: 'primary' | 'secondary' | 'success' | 'warning';
  theme: any;
  metric?: string | number;
  description?: string;
  content?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}

export const Widget: React.FC<WidgetProps> = ({
  title,
  icon,
  type,
  theme,
  metric,
  description,
  content,
  clickable = true,
  onClick,
}) => {
  return (
    <WidgetContainer
      $type={type}
      $theme={theme}
      $clickable={clickable}
      onClick={onClick}
    >
      <div className='header'>
        <h3 className='title'>{title}</h3>
        <span className='icon'>{icon}</span>
      </div>

      {metric && <div className='metric'>{metric}</div>}

      {description && <p className='description'>{description}</p>}

      {content && <div className='content'>{content}</div>}
    </WidgetContainer>
  );
};

export default Widget;
