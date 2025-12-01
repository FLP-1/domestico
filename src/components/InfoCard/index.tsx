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

const CardContainer = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bg = props.$theme?.colors?.background?.primary ||
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
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 16px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.md || 'none';
  }};
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  animation: ${fadeIn} 0.6s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                          props.$theme?.shadow?.color;
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

const CardHeader = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.span<{ $theme?: any }>`
  font-size: 1.5rem;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
`;

const CardTitle = styled.h3<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0;
`;

const CardContent = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  line-height: 1.6;
`;

const CardLocation = styled.p<{ $theme?: any }>`
  font-weight: 500;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
  margin: 0.5rem 0;
`;

const CardWifi = styled.p<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0;
`;

export interface InfoCardProps {
  icon: string;
  title: string;
  children: ReactNode;
  theme?: any;
  location?: string;
  wifi?: string;
  onClick?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  children,
  theme,
  location,
  wifi,
  onClick,
}) => {
  return (
    <CardContainer $theme={theme} onClick={onClick} as={StyledComponent1}>
      <CardHeader>
        <CardIcon $theme={theme}>{icon}</CardIcon>
        <CardTitle $theme={theme}>{title}</CardTitle>
      </CardHeader>

      <CardContent $theme={theme}>
        {children}
        {location && <CardLocation $theme={theme}>{location}</CardLocation>}
        {wifi && <CardWifi $theme={theme}>WiFi: {wifi}</CardWifi>}
      </CardContent>
    </CardContainer>
  );
};

export default InfoCard;
