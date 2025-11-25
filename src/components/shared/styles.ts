import styled from 'styled-components';
import { createThemedStyles } from '../../design-system';

// Common form styles
export const FormRow = styled.div<{ $theme?: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: 768px) and (max-width: 992px) {
    gap: 1.25rem;
  }

  @media (min-width: 992px) {
    gap: 1.5rem;
  }
`;

export const FormSection = styled.div<{ $theme?: any }>`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary || 
    props.$theme?.colors?.surface || 
    'transparent'
  };
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    props.$theme?.colors?.border || 
    'transparent'
  };

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const SectionTitle = styled.h3<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.9rem';
      case 'lg':
        return '1.25rem';
      default:
        return '1.1rem';
    }
  }};
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    props.$theme?.colors?.text || 
    'inherit'
  };
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    props.$theme?.colors?.border || 
    'transparent'
  };

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const Label = styled.label<{ $theme?: any; $size?: 'sm' | 'md' | 'lg' }>`
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    props.$theme?.colors?.text || 
    'inherit'
  };
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.85rem';
    }
  }};
  margin-bottom: 0.5rem;
  display: block;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const InputStyled = styled.input<{
  $hasError?: boolean;
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.5rem 0.75rem';
      case 'lg':
        return '0.875rem 1.25rem';
      default:
        return '0.75rem 1rem';
    }
  }};
  border: 1px solid
    ${props =>
      props.$hasError
        ? props.$theme?.colors?.status?.error?.border ||
          props.$theme?.status?.error?.border ||
          props.$theme?.colors?.error ||
          'transparent'
        : props.$theme?.colors?.border?.light ||
          props.$theme?.border?.light ||
          props.$theme?.colors?.border ||
          'transparent'};
  border-radius: 6px;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.85rem';
    }
  }};
  transition: all 0.2s ease;
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary || 
    props.$theme?.colors?.background || 
    'transparent'
  };
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    props.$theme?.colors?.text || 
    'inherit'
  };

  &:focus {
    outline: none;
    border-color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent || 
      'transparent'
    };
    box-shadow: 0 0 0 3px ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }

  &:disabled {
    background: ${props => 
      props.$theme?.colors?.background?.secondary || 
      props.$theme?.background?.secondary || 
      'transparent'
    };
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary || 
      'inherit'
    };
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary || 
      'inherit'
    };
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const SelectStyled = styled.select<{
  $hasError?: boolean;
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  title?: string;
}>`
  width: 100%;
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.5rem 0.75rem';
      case 'lg':
        return '0.875rem 1.25rem';
      default:
        return '0.75rem 1rem';
    }
  }};
  border: 1px solid
    ${props =>
      props.$hasError
        ? props.$theme?.colors?.status?.error?.border ||
          props.$theme?.status?.error?.border ||
          props.$theme?.colors?.error ||
          'transparent'
        : props.$theme?.colors?.border?.light ||
          props.$theme?.border?.light ||
          props.$theme?.colors?.border ||
          'transparent'};
  border-radius: 6px;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.85rem';
    }
  }};
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary || 
    props.$theme?.colors?.background || 
    'transparent'
  };
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    props.$theme?.colors?.text || 
    'inherit'
  };
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent || 
      'transparent'
    };
    box-shadow: 0 0 0 3px ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }

  &:disabled {
    background: ${props => 
      props.$theme?.colors?.background?.secondary || 
      props.$theme?.background?.secondary || 
      'transparent'
    };
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary || 
      'inherit'
    };
    cursor: not-allowed;
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const ErrorMessage = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  color: ${props => 
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    props.$theme?.colors?.error ||
    'inherit'
  };
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.7rem';
      case 'lg':
        return '0.9rem';
      default:
        return '0.8rem';
    }
  }};
  font-weight: 500;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const HelpText = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary || 
    props.$theme?.colors?.textSecondary || 
    'inherit'
  };
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.7rem';
      case 'lg':
        return '0.9rem';
      default:
        return '0.8rem';
    }
  }};
  margin-top: 0.25rem;
  line-height: 1.4;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Common layout components
export const FlexContainer = styled.div<{
  $gap?: string;
  $align?: string;
  $justify?: string;
  $direction?: 'row' | 'column';
  $wrap?: boolean;
}>`
  display: flex;
  gap: ${props => props.$gap || '0.5rem'};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  flex-direction: ${props => props.$direction || 'row'};
  flex-wrap: ${props => (props.$wrap ? 'wrap' : 'nowrap')};

  @media (max-width: 768px) {
    flex-direction: ${props =>
      props.$direction === 'column' ? 'column' : 'column'};
    gap: 0.75rem;
  }
`;

// Common interactive elements
export const CheckboxContainer = styled.div<{
  $columns?: string;
  $maxHeight?: string;
}>`
  display: grid;
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(160px, 1fr))'};
  gap: 0.5rem;
  margin: 0.75rem 0;
  max-height: ${props => props.$maxHeight || 'none'};
  overflow-y: ${props => (props.$maxHeight ? 'auto' : 'visible')};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const CheckboxItem = styled.label<{ $variant?: 'default' | 'card' }>`
  display: flex;
  align-items: ${props =>
    props.$variant === 'card' ? 'flex-start' : 'center'};
  gap: 0.4rem;
  padding: ${props => (props.$variant === 'card' ? '0.75rem' : '0.4rem')};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  ${props => {
    if (props.$variant === 'card') {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      let rgbaPrimary = 'transparent';
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        rgbaPrimary = `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return `
        border: 1px solid ${rgbaPrimary};
        background: ${props.$theme?.colors?.background?.primary || 
                     props.$theme?.background?.primary || 
                     'transparent'};
        &:hover {
          border-color: ${primaryColor || 'transparent'};
        }
      `;
    }
    return '';
  }}

  &:hover {
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }

  input[type='checkbox'] {
    margin: 0;
    ${props => (props.$variant === 'card' ? 'margin-top: 0.1rem;' : '')}
  }
`;

export const CheckboxLabel = styled.span<{ $theme?: any }>`
  font-weight: 500;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    props.$theme?.colors?.text || 
    'inherit'
  };
  line-height: 1.4;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const CheckboxContent = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Radio and period groups
export const RadioGroup = styled.div<{ $columns?: string }>`
  display: grid;
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(120px, 1fr))'};
  gap: 0.5rem;
  margin: 0.75rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const PeriodGroup = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.75rem 0;
  padding: 1rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary || 
    props.$theme?.colors?.surface || 
    'transparent'
  };
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    props.$theme?.colors?.border || 
    'transparent'
  };

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Validation and status components
export const ValidationContainer = styled.div<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary || 
    props.$theme?.colors?.surface || 
    'transparent'
  };
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    props.$theme?.colors?.border || 
    'transparent'
  };

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const SuccessMessage = styled.div<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.success?.text ||
    props.$theme?.status?.success?.text ||
    props.$theme?.colors?.success ||
    'inherit'
  };
  background: ${props => 
    props.$theme?.colors?.status?.success?.background ||
    props.$theme?.status?.success?.background ||
    'transparent'
  };
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid ${props => 
    props.$theme?.colors?.status?.success?.border ||
    props.$theme?.status?.success?.border ||
    props.$theme?.colors?.success ||
    'transparent'
  };
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const StatusIndicator = styled.div<{
  $status?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.$status) {
      return props.$theme?.colors?.status?.[props.$status]?.background ||
             props.$theme?.status?.[props.$status]?.background ||
             'transparent';
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.$status) {
      return props.$theme?.colors?.status?.[props.$status]?.text ||
             props.$theme?.status?.[props.$status]?.text ||
             'inherit';
    }
    return 'inherit';
  }};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const CertificateStatus = styled.div<{
  $status?: 'valid' | 'invalid' | 'expired' | 'pending';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    if (props.$status === 'valid') {
      return props.$theme?.colors?.status?.success?.background ||
             props.$theme?.status?.success?.background ||
             'transparent';
    }
    if (props.$status === 'invalid' || props.$status === 'expired') {
      return props.$theme?.colors?.status?.error?.background ||
             props.$theme?.status?.error?.background ||
             'transparent';
    }
    if (props.$status === 'pending') {
      return props.$theme?.colors?.status?.info?.background ||
             props.$theme?.status?.info?.background ||
             'transparent';
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.$status === 'valid') {
      return props.$theme?.colors?.status?.success?.text ||
             props.$theme?.status?.success?.text ||
             'inherit';
    }
    if (props.$status === 'invalid' || props.$status === 'expired') {
      return props.$theme?.colors?.status?.error?.text ||
             props.$theme?.status?.error?.text ||
             'inherit';
    }
    if (props.$status === 'pending') {
      return props.$theme?.colors?.status?.info?.text ||
             props.$theme?.status?.info?.text ||
             'inherit';
    }
    return 'inherit';
  }};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Button groups and actions
export const ButtonGroup = styled.div<{
  $direction?: 'row' | 'column';
  $gap?: string;
  $align?: string;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  gap: ${props => props.$gap || '0.75rem'};
  align-items: ${props => props.$align || 'center'};
  justify-content: flex-end;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }
`;

export const LoadingOverlay = styled.div<{ $isLoading: boolean }>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: ${props => (props.$isLoading ? 'flex' : 'none')};
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
`;

// Validation and form utilities
export const ValidationButton = styled.button<{ $disabled?: boolean; $theme?: any }>`
  padding: 0.5rem;
  background: ${props => {
    if (props.$disabled) {
      return props.$theme?.colors?.background?.secondary ||
             props.$theme?.background?.secondary ||
             'transparent';
    }
    return props.$theme?.colors?.primary ||
           props.$theme?.accent ||
           'transparent';
  }};
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary || 
    'inherit'
  };
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.8rem;
  white-space: nowrap;
  transition: background 0.3s ease;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  &:hover {
    opacity: ${props => (props.$disabled ? 0.5 : 0.9)};
  }
`;

export const InfoMessage = styled.div<{
  $variant?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    if (props.$variant) {
      return props.$theme?.colors?.status?.[props.$variant]?.background ||
             props.$theme?.status?.[props.$variant]?.background ||
             'transparent';
    }
    return props.$theme?.colors?.background?.secondary ||
           props.$theme?.background?.secondary ||
           props.$theme?.colors?.surface ||
           'transparent';
  }};
  color: ${props => {
    if (props.$variant) {
      return props.$theme?.colors?.status?.[props.$variant]?.text ||
             props.$theme?.status?.[props.$variant]?.text ||
             'inherit';
    }
    return props.$theme?.colors?.text?.dark ||
           props.$theme?.text?.dark ||
           props.$theme?.colors?.text ||
           'inherit';
  }};
  border: 1px solid
    ${props => {
      if (props.$variant) {
        return props.$theme?.colors?.status?.[props.$variant]?.border ||
               props.$theme?.status?.[props.$variant]?.border ||
               'transparent';
      }
      return props.$theme?.colors?.border?.light ||
             props.$theme?.border?.light ||
             props.$theme?.colors?.border ||
             'transparent';
    }};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Responsive utilities
export const ResponsiveContainer = styled.div<{
  $direction?: 'row' | 'column';
  $gap?: string;
  $align?: string;
  $justify?: string;
}>`
  display: flex;
  gap: ${props => props.$gap || '0.75rem'};
  flex-direction: ${props => props.$direction || 'row'};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }
`;
