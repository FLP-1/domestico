// src/components/FilterSection/index.tsx
import styled from 'styled-components';

interface FilterSectionProps {
  $theme?: any;
  title: string;
  children: React.ReactNode;
}

const FilterContainer = styled.div<{ $theme?: any }>`
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
  margin-bottom: 2rem;
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
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'transparent';
    }};
`;

const FilterTitle = styled.h3<{ $theme?: any }>`
  margin: 0 0 1rem 0;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 1.3rem;
  font-weight: 600;
`;

const FilterRow = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export default function FilterSection({
  $theme,
  title,
  children,
}: FilterSectionProps) {
  return (
    <FilterContainer $theme={$theme}>
      <FilterTitle $theme={$theme}>{title}</FilterTitle>
      <FilterRow>{children}</FilterRow>
    </FilterContainer>
  );
}
