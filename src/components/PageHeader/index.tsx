// src/components/PageHeader/index.tsx
import styled from 'styled-components';
import { defaultColors } from '../../utils/themeHelpers';

interface PageHeaderProps {
  $theme?: any;
  title: string;
  subtitle: string;
}

const PageTitle = styled.h1<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || defaultColors.text.primary};
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
`;

const PageSubtitle = styled.p<{ $theme?: any }>`
  font-size: 1.1rem;
  color: ${props => props.$theme?.colors?.text?.secondary || defaultColors.text.secondary};
  margin: 0 0 2rem 0;
  font-weight: 500;
`;

export default function PageHeader({
  $theme,
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <>
      <PageTitle $theme={$theme}>{title}</PageTitle>
      <PageSubtitle>{subtitle}</PageSubtitle>
    </>
  );
}
