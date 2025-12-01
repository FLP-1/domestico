// src/components/EmptyState/index.tsx
import AccessibleEmoji from '../AccessibleEmoji';
import styled from 'styled-components';
import { DEFAULT_COLORS } from '../../config/default-colors';

const EmptyStateContainer = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 3rem 2rem;
`;

const EmptyIcon = styled.div<{ $theme?: any }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  color: ${props =>
    props.$theme?.colors?.text?.secondary || DEFAULT_COLORS.text.secondary};
`;

const EmptyTitle = styled.h3<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.primary || DEFAULT_COLORS.text.primary};
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary || DEFAULT_COLORS.text.secondary};
  font-size: 0.9rem;
  margin: 0;
`;

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  theme?: any;
}

export default function EmptyState({
  icon,
  title,
  description,
  theme,
}: EmptyStateProps) {
  return (
    <EmptyStateContainer $theme={theme}>
      {icon && (
        <EmptyIcon $theme={theme}>
          {typeof icon === 'string' ? (
            <AccessibleEmoji emoji={icon} label='Estado vazio' />
          ) : (
            icon
          )}
        </EmptyIcon>
      )}
      <EmptyTitle $theme={theme}>{title}</EmptyTitle>
      <EmptyDescription $theme={theme}>{description}</EmptyDescription>
    </EmptyStateContainer>
  );
}

