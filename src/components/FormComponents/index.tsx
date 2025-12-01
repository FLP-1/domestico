// src/components/FormComponents/index.tsx
import styled from 'styled-components';
import { mediaQueries } from '../../design-system/utils/responsive';

// FormGroup
interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup = styled.div<FormGroupProps>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;

  /* Mobile: Full width and larger gaps */
  ${mediaQueries.mobile} {
    min-width: auto;
    width: 100%;
    gap: 0.75rem;
  }

  /* Touch devices: Larger touch targets */
  ${mediaQueries.touchDevice} {
    input,
    select,
    textarea {
      min-height: 44px;
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }
`;

// Label
interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  $theme?: any;
}

export const Label = styled.label<LabelProps>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
`;

// Input
export const Input = styled.input<{ $theme?: any; $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid
    ${props => {
      if (props.$hasError) {
        return (
          props.$theme?.colors?.error ||
          props.$theme?.colors?.status?.error?.background ||
          'transparent'
        );
      }
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
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
      return `rgba(${r}, ${g}, ${b}, 0.9)`;
    }
    return 'transparent';
  }};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props =>
      props.$theme?.colors?.primary || props.$theme?.accent || 'transparent'};
    box-shadow: ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'none';
    }};
  }

  /* Mobile: Larger touch targets and prevent zoom */
  ${mediaQueries.mobile} {
    min-height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.875rem;
  }

  /* Touch devices: Better interaction */
  ${mediaQueries.touchDevice} {
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

// Select
interface SelectProps {
  $theme?: any;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  title?: string;
  id?: string;
}

export const Select = styled.select<SelectProps>`
  padding: 0.75rem;
  border: 2px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
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
      return `rgba(${r}, ${g}, ${b}, 0.9)`;
    }
    return 'transparent';
  }};
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props =>
      props.$theme?.colors?.primary || props.$theme?.accent || 'transparent'};
    box-shadow: ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'none';
    }};
  }

  /* Mobile: Larger touch targets */
  ${mediaQueries.mobile} {
    min-height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.875rem;
  }

  /* Touch devices: Better interaction */
  ${mediaQueries.touchDevice} {
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

// Form
interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const Form = styled.form<FormProps>`
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
`;

// ErrorMessage
interface ErrorMessageProps {
  children: React.ReactNode;
}

export const ErrorMessage = styled.div<{ $theme?: any } & ErrorMessageProps>`
  color: ${props =>
    props.$theme?.colors?.error ||
    props.$theme?.colors?.status?.error?.text ||
    'inherit'};
  font-size: 0.7rem;
  margin-top: 0.25rem;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '⚠️';
    font-size: 0.6rem;
  }
`;
