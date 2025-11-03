/**
 * Componente Button Reutilizável
 * Substitui botões duplicados e hardcoded no projeto
 */

import React from 'react';
import styled from 'styled-components';
import { theme } from '../../config/theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $loading: boolean;
}>`
  /* Reset */
  border: none;
  outline: none;
  cursor: pointer;
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.duration.normal}
    ${theme.transitions.timing.easeInOut};

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};

  /* Tamanhos */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          border-radius: ${theme.borders.radius.md};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.lg};
          border-radius: ${theme.borders.radius.lg};
        `;
      case 'md':
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.base};
          border-radius: ${theme.borders.radius.md};
        `;
    }
  }}

  /* Variantes */
  ${props => {
    const colors = theme.colors;

    switch (props.$variant) {
      case 'primary':
        return `
          background: ${colors.primary.main};
          color: ${colors.primary.contrast};
          box-shadow: ${theme.shadows.sm};
          
          &:hover:not(:disabled) {
            background: ${colors.primary.dark};
            box-shadow: ${theme.shadows.md};
          }
          
          &:active:not(:disabled) {
            background: ${colors.primary.dark};
            box-shadow: ${theme.shadows.xs};
          }
        `;

      case 'secondary':
        return `
          background: ${colors.secondary.main};
          color: ${colors.secondary.contrast};
          
          &:hover:not(:disabled) {
            background: ${colors.secondary.dark};
          }
        `;

      case 'success':
        return `
          background: ${colors.success.main};
          color: ${colors.success.contrast};
          
          &:hover:not(:disabled) {
            background: ${colors.success.dark};
          }
        `;

      case 'error':
        return `
          background: ${colors.error.main};
          color: ${colors.error.contrast};
          
          &:hover:not(:disabled) {
            background: ${colors.error.dark};
          }
        `;

      case 'warning':
        return `
          background: ${colors.warning.main};
          color: ${colors.warning.contrast};
          
          &:hover:not(:disabled) {
            background: ${colors.warning.dark};
          }
        `;

      case 'info':
        return `
          background: ${colors.info.main};
          color: ${colors.info.contrast};
          
          &:hover:not(:disabled) {
            background: ${colors.info.dark};
          }
        `;

      case 'ghost':
        return `
          background: transparent;
          color: ${colors.primary.main};
          border: ${theme.borders.width.thin} solid ${colors.border.main};
          
          &:hover:not(:disabled) {
            background: ${colors.action.hover};
            border-color: ${colors.primary.main};
          }
        `;

      default:
        return '';
    }
  }}
  
  /* Estados */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: ${theme.colors.action.disabled};
    color: ${theme.colors.text.disabled};
  }

  &:focus-visible {
    outline: ${theme.borders.width.medium} solid ${theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* Loading */
  ${props =>
    props.$loading &&
    `
    pointer-events: none;
    opacity: 0.7;
  `}
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: ${theme.borders.radius.full};
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </StyledButton>
  );
};

export default Button;
