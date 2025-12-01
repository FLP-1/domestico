import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

const StyledComponent1 = styled.div<{ $theme?: any }>`
  cursor: onClick ? pointer : default
`;

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

const StatusContainer = styled.div<{
  $status: 'in' | 'out' | 'break' | 'success' | 'warning' | 'info';
  $theme?: any;
}>`
  background: ${props => {
    const bg =
      props.$theme?.colors?.background?.primary ||
      props.$theme?.background?.primary ||
      props.$theme?.colors?.surface ||
      props.$theme?.colors?.background;
    if (bg && bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return 'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 16px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.md || 'none';
  }};
  border: 1px solid
    ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  min-width: 300px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor =
        props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 8px 24px rgba(${r}, ${g}, ${b}, 0.15)`;
      }
      return props.$theme?.shadows?.lg || 'none';
    }};
  }
`;

const StatusIcon = styled.div<{
  $status: 'in' | 'out' | 'break' | 'success' | 'warning' | 'info';
  $theme?: any;
}>`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => {
    if (props.$theme?.colors) {
      switch (props.$status) {
        case 'in':
        case 'success':
          return (
            props.$theme?.colors?.primary || props.$theme?.accent || 'inherit'
          );
        case 'out':
          return (
            props.$theme?.colors?.status?.error?.background ||
            props.$theme?.status?.error?.background ||
            props.$theme?.colors?.error ||
            'inherit'
          );
        case 'break':
        case 'warning':
          return (
            props.$theme?.colors?.status?.warning?.background ||
            props.$theme?.status?.warning?.background ||
            props.$theme?.colors?.warning ||
            'inherit'
          );
        case 'info':
          return (
            props.$theme?.colors?.text?.secondary ||
            props.$theme?.text?.secondary ||
            props.$theme?.colors?.text ||
            'inherit'
          );
        default:
          return (
            props.$theme?.colors?.primary || props.$theme?.accent || 'inherit'
          );
      }
    }

    // Fallback seguro
    return 'inherit';
  }};
`;

const StatusText = styled.h3<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0 0 0.5rem 0;
`;

const StatusTime = styled.p<{ $theme?: any }>`
  font-size: 1rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0;
`;

const StatusDescription = styled.p<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
`;

export interface StatusCardProps {
  status: 'in' | 'out' | 'break' | 'success' | 'warning' | 'info';
  icon: string;
  title: string;
  time?: string;
  description?: string;
  theme?: any;
  onClick?: () => void;
  children?: ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  icon,
  title,
  time,
  description,
  theme,
  onClick,
  children,
}) => {
  return (
    <StatusContainer
      $status={status}
      $theme={theme}
      onClick={onClick}
      as={StyledComponent1}
    >
      <StatusIcon $status={status} $theme={theme}>
        {icon}
      </StatusIcon>

      <StatusText $theme={theme}>{title}</StatusText>

      {time && <StatusTime $theme={theme}>{time}</StatusTime>}

      {description && (
        <StatusDescription $theme={theme}>{description}</StatusDescription>
      )}

      {children}
    </StatusContainer>
  );
};

export default StatusCard;
