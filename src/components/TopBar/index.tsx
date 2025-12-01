// src/components/TopBar/index.tsx
import styled from 'styled-components';

interface TopBarProps {
  $theme?: any;
  children: React.ReactNode;
}

const TopBarContainer = styled.header<{ $theme?: any }>`
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
  padding: 1rem 2rem;
  margin: 0 0 2rem 0;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid
    ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.12)`;
      }
      return 'transparent';
    }};
  width: 100%;
  box-sizing: border-box;
`;

export default function TopBar({ $theme, children }: TopBarProps) {
  return <TopBarContainer $theme={$theme}>{children}</TopBarContainer>;
}
