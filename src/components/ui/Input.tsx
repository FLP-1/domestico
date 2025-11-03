/**
 * Componente Input Reutilizável
 * Substitui inputs duplicados e hardcoded no projeto
 */

import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { theme } from '../../config/theme';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const InputWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const InputContainer = styled.div<{
  $hasError: boolean;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
}>`
  position: relative;
  display: flex;
  align-items: center;

  ${props =>
    props.$hasIcon &&
    props.$iconPosition === 'left' &&
    `
    padding-left: ${theme.spacing.xl};
  `}

  ${props =>
    props.$hasIcon &&
    props.$iconPosition === 'right' &&
    `
    padding-right: ${theme.spacing.xl};
  `}
`;

const StyledInput = styled.input<{
  $hasError: boolean;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
}>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background: ${theme.colors.surface.main};
  border: ${theme.borders.width.thin} solid
    ${props =>
      props.$hasError ? theme.colors.error.main : theme.colors.border.main};
  border-radius: ${theme.borders.radius.md};
  transition: all ${theme.transitions.duration.normal}
    ${theme.transitions.timing.easeInOut};

  ${props =>
    props.$hasIcon &&
    props.$iconPosition === 'left' &&
    `
    padding-left: ${theme.spacing.xl};
  `}

  ${props =>
    props.$hasIcon &&
    props.$iconPosition === 'right' &&
    `
    padding-right: ${theme.spacing.xl};
  `}
  
  &::placeholder {
    color: ${theme.colors.text.hint};
  }

  &:hover:not(:disabled) {
    border-color: ${props =>
      props.$hasError ? theme.colors.error.main : theme.colors.border.dark};
  }

  &:focus {
    outline: none;
    border-color: ${props =>
      props.$hasError ? theme.colors.error.main : theme.colors.border.focus};
    box-shadow: 0 0 0 3px
      ${props =>
        props.$hasError
          ? `${theme.colors.error.main}20`
          : `${theme.colors.primary.main}20`};
  }

  &:disabled {
    background: ${theme.colors.action.disabledBackground};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  position: absolute;
  ${props => props.$position}: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  color: ${theme.colors.text.secondary};
  pointer-events: none;
`;

const HelperText = styled.span<{ $isError: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props =>
    props.$isError ? theme.colors.error.main : theme.colors.text.secondary};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const hasIcon = Boolean(icon);

    return (
      <InputWrapper $fullWidth={fullWidth}>
        {label && <Label htmlFor={inputId}>{label}</Label>}

        <InputContainer
          $hasError={hasError}
          $hasIcon={hasIcon}
          $iconPosition={iconPosition}
        >
          {icon && iconPosition === 'left' && (
            <IconWrapper $position='left'>{icon}</IconWrapper>
          )}

          <StyledInput
            ref={ref}
            id={inputId}
            $hasError={hasError}
            $hasIcon={hasIcon}
            $iconPosition={iconPosition}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <IconWrapper $position='right'>{icon}</IconWrapper>
          )}
        </InputContainer>

        {(error || helperText) && (
          <HelperText $isError={hasError}>{error || helperText}</HelperText>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
