/**
 * Componente Card Reutilizável
 * Substitui cards duplicados e hardcoded no projeto
 */

import React from 'react';
import styled from 'styled-components';
import { theme } from '../../config/theme';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof theme.spacing;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

const StyledCard = styled.div<{
  $variant: 'default' | 'outlined' | 'elevated';
  $padding: keyof typeof theme.spacing;
  $hoverable: boolean;
  $clickable: boolean;
}>`
  background: ${theme.colors.surface.main};
  border-radius: ${theme.borders.radius.lg};
  padding: ${props => theme.spacing[props.$padding]};
  transition: all ${theme.transitions.duration.normal}
    ${theme.transitions.timing.easeInOut};

  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          border: ${theme.borders.width.thin} solid ${theme.colors.border.main};
        `;
      case 'elevated':
        return `
          box-shadow: ${theme.shadows.lg};
        `;
      case 'default':
      default:
        return `
          box-shadow: ${theme.shadows.sm};
        `;
    }
  }}

  ${props =>
    props.$clickable &&
    `
    cursor: pointer;
  `}
  
  ${props =>
    props.$hoverable &&
    `
    &:hover {
      box-shadow: ${theme.shadows.xl};
      transform: translateY(-2px);
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.tight};
`;

const CardSubtitle = styled.p`
  margin: ${theme.spacing.xs} 0 0 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.normal};
`;

const CardContent = styled.div`
  color: ${theme.colors.text.primary};
`;

const CardFooter = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: ${theme.borders.width.thin} solid ${theme.colors.border.light};
`;

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  padding = 'lg',
  onClick,
  hoverable = false,
  className,
}) => {
  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $hoverable={hoverable}
      $clickable={Boolean(onClick)}
      onClick={onClick}
      className={className}
    >
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}

      <CardContent>{children}</CardContent>

      {footer && <CardFooter>{footer}</CardFooter>}
    </StyledCard>
  );
};

export default Card;
