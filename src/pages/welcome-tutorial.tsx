import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/welcome-tutorial.tsx
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAlertManager } from '../hooks/useAlertManager';
import styled, { keyframes } from 'styled-components';
import { publicColors, addOpacity, getThemeColor } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
  UnifiedProgressBar,
} from '../components/unified';

// Types
interface TutorialSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  benefits: string[];
  color: string;
  illustration: React.ReactNode;
  actionSteps?: string[]; // Passos práticos para o usuário
  tip?: string; // Dica útil
}

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const IllustrationIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

// Styled Components
const WelcomeContainer = styled.div<{ $theme?: Theme }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${publicColors.primary} 0%,
    ${publicColors.secondary} 50%,
    ${publicColors.tertiary} 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div<{ $theme?: any }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(
      circle at 20% 80%,
      ${props => {
          const bgColor = getThemeColor(
            props.$theme,
            'background.primary',
            'transparent'
          );
          if (bgColor && bgColor.startsWith('#')) {
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.1)`;
          }
          return 'transparent';
        }}
        0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      ${props => {
          const bgColor = getThemeColor(
            props.$theme,
            'background.primary',
            'transparent'
          );
          if (bgColor && bgColor.startsWith('#')) {
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.1)`;
          }
          return 'transparent';
        }}
        0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      ${props => {
          const bgColor = getThemeColor(
            props.$theme,
            'background.primary',
            'transparent'
          );
          if (bgColor && bgColor.startsWith('#')) {
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.05)`;
          }
          return 'transparent';
        }}
        0%,
      transparent 50%
    );
  animation: ${float} 6s ease-in-out infinite;
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const Logo = styled.div<{ $theme?: Theme }>`
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: ${props => {
    const bgColor = getThemeColor(
      props.$theme,
      'background.primary',
      'transparent'
    );
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.9), rgba(${r}, ${g}, ${b}, 0.7))`;
    }
    return getThemeColor(props.$theme, 'background.primary', 'transparent');
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 20px 40px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(20px);
  border: 2px solid
    ${props => {
      const bgColor = getThemeColor(
        props.$theme,
        'background.primary',
        'transparent'
      );
      if (bgColor && bgColor.startsWith('#')) {
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.3)`;
      }
      return 'transparent';
    }};

  img {
    width: 80px;
    height: 80px;
    border-radius: 15px;
  }
`;

const WelcomeTitle = styled.h1<{ $theme?: Theme }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
  margin: 0 0 1rem 0;
  text-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 8px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.3)`;
      }
    }
    return 'none';
  }};
  background: ${props => {
    const textColor = getThemeColor(props.$theme, 'text.primary', 'inherit');
    const secondaryColor = getThemeColor(
      props.$theme,
      'text.secondary',
      'inherit'
    );
    if (
      textColor &&
      secondaryColor &&
      textColor.startsWith('#') &&
      secondaryColor.startsWith('#')
    ) {
      return `linear-gradient(45deg, ${textColor}, ${secondaryColor})`;
    }
    return 'inherit';
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeSubtitle = styled.p<{ $theme?: any }>`
  font-size: 1.3rem;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
  margin: 0 0 2rem 0;
  font-weight: 500;
  text-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.2)`;
      }
    }
    return 'none';
  }};
`;

const WelcomeDescription = styled.p<{ $theme?: any }>`
  font-size: 1.1rem;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  margin: 0 0 3rem 0;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const SkipButton = styled.button<{ $theme?: any }>`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: ${props => {
    const bgColor = getThemeColor(
      props.$theme,
      'background.primary',
      'transparent'
    );
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'transparent';
  }};
  border: 1px solid
    ${props => {
      const bgColor = getThemeColor(
        props.$theme,
        'background.primary',
        'transparent'
      );
      if (bgColor && bgColor.startsWith('#')) {
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.3)`;
      }
      return 'transparent';
    }};
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: ${props => {
      const bgColor = getThemeColor(
        props.$theme,
        'background.primary',
        'transparent'
      );
      if (bgColor && bgColor.startsWith('#')) {
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.3)`;
      }
      return 'transparent';
    }};
    transform: translateY(-2px);
  }
`;

const TutorialContainer = styled.div<{ $theme?: Theme }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${props => props.$theme?.colors?.surface || publicColors.surface} 0%,
    ${props => {
        const border = props.$theme?.colors?.border;
        return (
          (typeof border === 'object' && border && 'light' in border
            ? String((border as any).light)
            : null) ||
          (typeof border === 'string' ? border : null) ||
          (typeof publicColors.border === 'object'
            ? publicColors.border.light
            : publicColors.border) ||
          'transparent'
        );
      }}
      100%
  );
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
`;

const TutorialHeader = styled.header<{ $theme?: Theme }>`
  background: ${props => {
    const bgColor = getThemeColor(
      props.$theme,
      'background.primary',
      'transparent'
    );
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return getThemeColor(props.$theme, 'background.primary', 'transparent');
  }};
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  border-bottom: 1px solid
    ${props => {
      const primaryColor = getThemeColor(
        props.$theme,
        'colors.primary',
        'transparent'
      );
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return getThemeColor(props.$theme, 'border.light', 'transparent');
    }};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// ProgressBar e ProgressFill removidos - usar UnifiedProgressBar

const ProgressText = styled.span<{ $theme?: any }>`
  font-weight: 600;
  color: ${props => getThemeColor(props.$theme, 'text.dark', 'inherit')};
  font-size: 0.9rem;
`;

const TutorialContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
`;

const SlideContainer = styled.div`
  max-width: 1000px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const SlideContent = styled.div`
  animation: ${slideIn} 0.8s ease-out;
`;

const SlideTitle = styled.h2<{ $color: string; $theme?: Theme }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$color};
  margin: 0 0 1rem 0;
  text-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 2px 4px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'none';
  }};
`;

const SlideDescription = styled.p<{ $theme?: any }>`
  font-size: 1.2rem;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const FeatureItem = styled.li<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: ${props => getThemeColor(props.$theme, 'text.dark', 'inherit')};

  &::before {
    content: '✨';
    font-size: 1.2rem;
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};

  &::before {
    content: '🎯';
    font-size: 1.1rem;
  }
`;

const ActionStepsList = styled.ul<{ $theme?: any }>`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 2rem 0;
  background: ${props => {
    const bgColor = getThemeColor(
      props.$theme,
      'background.secondary',
      'transparent'
    );
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid
    ${props => {
      const primaryColor = getThemeColor(
        props.$theme,
        'colors.primary',
        'transparent'
      );
      return primaryColor || 'transparent';
    }};
`;

const ActionStepItem = styled.li<{ $theme?: any }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: ${props => getThemeColor(props.$theme, 'text.dark', 'inherit')};
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '✓';
    font-size: 1rem;
    font-weight: bold;
    color: ${props => {
      const primaryColor = getThemeColor(
        props.$theme,
        'colors.primary',
        'transparent'
      );
      return primaryColor || 'inherit';
    }};
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

const TipBox = styled.div<{ $theme?: any }>`
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  background: ${props => {
    const primaryColor = getThemeColor(
      props.$theme,
      'colors.primary',
      'transparent'
    );
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  border-radius: 12px;
  border-left: 4px solid
    ${props => {
      const primaryColor = getThemeColor(
        props.$theme,
        'colors.primary',
        'transparent'
      );
      return primaryColor || 'transparent';
    }};
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const TipIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
  display: inline-block;
`;

const TipText = styled.p<{ $theme?: any }>`
  margin: 0;
  font-size: 0.9rem;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  line-height: 1.5;
  font-style: italic;
`;

const SlideIllustration = styled.div<{ $color: string; $theme?: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 3s ease-in-out infinite;

  .illustration-icon {
    font-size: 8rem;
    color: ${props => props.$color};
    filter: ${props => {
      const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `drop-shadow(0 10px 20px rgba(${r}, ${g}, ${b}, 0.1))`;
      }
      return 'none';
    }};
  }
`;

const NavigationContainer = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: ${props => {
    const bgColor = getThemeColor(
      props.$theme,
      'background.primary',
      'transparent'
    );
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return getThemeColor(props.$theme, 'background.primary', 'transparent');
  }};
  backdrop-filter: blur(20px);
  border-top: 1px solid
    ${props => getThemeColor(props.$theme, 'border.light', 'transparent')};
`;

const NavigationButton = styled.button<{ $theme?: Theme; $disabled?: boolean }>`
  background: ${props =>
    props.$disabled
      ? getThemeColor(props.$theme, 'background.secondary', 'transparent')
      : getThemeColor(props.$theme, 'colors.primary', 'transparent')};
  color: ${props =>
    props.$disabled
      ? getThemeColor(props.$theme, 'text.secondary', 'inherit')
      : getThemeColor(props.$theme, 'text.primary', 'inherit') || 'inherit'};
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const primaryColor = getThemeColor(
        props.$theme,
        'colors.primary',
        'transparent'
      );
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 8px 20px rgba(${r}, ${g}, ${b}, 0.4)`;
      }
      return 'none';
    }};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const CompletionContainer = styled.div<{ $theme?: Theme }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${props => props.$theme?.colors?.primary || publicColors.primary} 0%,
    ${props => props.$theme?.colors?.secondary || publicColors.secondary} 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  text-align: center;
  padding: 2rem;
`;

const CompletionContent = styled.div`
  max-width: 600px;
  animation: ${fadeIn} 1s ease-out;
`;

const CompletionIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const CompletionTitle = styled.h1<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
  margin: 0 0 1rem 0;
  text-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 8px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.3)`;
      }
    }
    return 'none';
  }};
`;

const CompletionDescription = styled.p<{ $theme?: any }>`
  font-size: 1.2rem;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  margin: 0 0 3rem 0;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

// Styled Components para substituir estilos inline
const ProgressBarWithWidth = styled(UnifiedProgressBar)`
  width: 200px;
`;

const StatCardContent = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: white;
`;

// StatCard removido - usar UnifiedCard com statsValue/statsLabel
// StatNumber removido - usar statsValue prop do UnifiedCard
// StatLabel removido - usar statsLabel prop do UnifiedCard

// WelcomeButton e SecondaryButton mantidos - glass effect específico
// Usando addOpacity para gerar rgba dinamicamente (não hardcoded)
const WelcomeButton = styled(UnifiedButton)<{ $theme?: Theme }>`
  background: ${addOpacity(publicColors.surface, 0.2)} !important;
  border: 2px solid ${addOpacity(publicColors.surface, 0.3)} !important;
  color: ${publicColors.surface} !important;
  font-size: 1.2rem !important;
  padding: 1rem 2rem !important;
  backdrop-filter: blur(10px) !important;
`;

const SecondaryButton = styled(UnifiedButton)<{ $theme?: Theme }>`
  background: ${addOpacity(publicColors.surface, 0.1)} !important;
  border: 2px solid ${addOpacity(publicColors.surface, 0.3)} !important;
  color: ${publicColors.surface} !important;
  font-size: 1.1rem !important;
  padding: 1rem 2rem !important;
  backdrop-filter: blur(10px) !important;
`;

const TutorialHeaderTitle = styled.h3<{ $theme?: any }>`
  margin: 0;
  color: ${props => getThemeColor(props.$theme, 'text.dark', 'inherit')};
  font-size: 1.2rem;
`;

const TutorialHeaderSubtitle = styled.p<{ $theme?: any }>`
  margin: 0.25rem 0 0 0;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  font-size: 0.9rem;
`;

const DotIndicator = styled.div<{ $active: boolean; $theme?: Theme }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props =>
    props.$active
      ? getThemeColor(props.$theme, 'colors.primary', 'transparent')
      : getThemeColor(props.$theme, 'background.secondary', 'transparent') ||
        getThemeColor(props.$theme, 'background.secondary', 'transparent')};
  cursor: pointer;
  transition: all 0.3s ease;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

export default function WelcomeTutorial() {
  const router = useRouter();
  const alertManager = useAlertManager();
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'tutorial' | 'completion'
  >('welcome');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tema público para página pública
  const theme = {
    colors: {
      primary: publicColors.primary,
      secondary: publicColors.secondary,
      text: publicColors.text,
      background: publicColors.background,
      surface: publicColors.surface,
      border:
        typeof publicColors.border === 'object'
          ? publicColors.border.light
          : publicColors.border,
    },
  };

  const tutorialSlides: TutorialSlide[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Sistema DOM!',
      description:
        'Vamos começar sua jornada de organização doméstica. Este tutorial rápido vai te mostrar como usar as principais funcionalidades.',
      icon: <AccessibleEmoji emoji='👋' label='Olá' />,
      color: '#29ABE2',
      illustration: <AccessibleEmoji emoji='🚀' label='Início' />,
      features: [
        'Tutorial interativo de 5 minutos',
        'Aprenda as funcionalidades principais',
        'Guia passo a passo prático',
        'Dicas e truques úteis',
      ],
      benefits: [
        'Comece a usar rapidamente',
        'Aproveite todas as funcionalidades',
        'Economize tempo',
        'Organize sua casa de forma eficiente',
      ],
      actionSteps: [
        'Complete este tutorial (5 minutos)',
        'Explore o Dashboard após o tutorial',
        'Crie sua primeira tarefa',
        'Configure seu perfil',
      ],
      tip: 'Você pode pular este tutorial e acessá-lo novamente pelo menu lateral a qualquer momento.',
    },
    {
      id: 'first-steps',
      title: 'Primeiros Passos',
      description:
        'Antes de começar, vamos configurar seu perfil e entender a estrutura do sistema.',
      icon: <AccessibleEmoji emoji='⚙️' label='Configuração' />,
      color: '#9B59B6',
      illustration: <AccessibleEmoji emoji='👤' label='Perfil' />,
      features: [
        'Selecione seu perfil (Empregado/Empregador/Família)',
        'Configure suas preferências',
        'Explore o menu lateral',
        'Personalize seu dashboard',
      ],
      benefits: [
        'Experiência personalizada',
        'Acesso às funcionalidades corretas',
        'Interface adaptada ao seu perfil',
        'Navegação intuitiva',
      ],
      actionSteps: [
        '1. Clique no seu nome no canto superior direito',
        '2. Selecione o perfil adequado',
        '3. Explore o menu lateral para ver todas as opções',
        '4. Personalize os widgets do dashboard',
      ],
      tip: 'Você pode ter múltiplos perfis e alternar entre eles facilmente.',
    },
    {
      id: 'dashboard',
      title: 'Como Usar o Dashboard',
      description:
        'O Dashboard é seu centro de comando. Aprenda a navegar e personalizar para ter controle total.',
      icon: <AccessibleEmoji emoji='🏠' label='Home' />,
      color: '#29ABE2',
      illustration: <AccessibleEmoji emoji='📊' label='Dashboard' />,
      features: [
        'Widgets personalizáveis',
        'Visão geral em tempo real',
        'Acesso rápido às funcionalidades',
        'Alertas e notificações',
      ],
      benefits: [
        'Controle total da sua casa',
        'Economia de tempo',
        'Organização automática',
        'Decisões baseadas em dados',
      ],
      actionSteps: [
        '1. Explore os widgets disponíveis',
        '2. Clique em qualquer widget para ver detalhes',
        '3. Use o menu lateral para navegar',
        '4. Configure alertas importantes',
      ],
      tip: 'Clique nos cards do dashboard para expandir e ver mais informações.',
    },
    {
      id: 'time-clock',
      title: 'Como Registrar Ponto',
      description:
        'Aprenda a usar o sistema de controle de ponto com segurança e precisão.',
      icon: '⏰',
      color: '#2ECC71',
      illustration: '🔒',
      features: [
        'Geolocalização com geofencing',
        'Verificação de dispositivo',
        'Captura de rede Wi-Fi',
        'Horário do servidor confiável',
      ],
      benefits: [
        'Zero possibilidade de fraude',
        'Conformidade com LGPD',
        'Relatórios precisos',
        'Tranquilidade total',
      ],
      actionSteps: [
        '1. Acesse "Controle de Ponto" no menu',
        '2. Permita acesso à localização quando solicitado',
        '3. Clique em "Registrar Entrada" ou "Registrar Saída"',
        '4. Confirme o registro (com foto opcional)',
      ],
      tip: 'O sistema valida automaticamente sua localização. Certifique-se de estar no local correto antes de registrar.',
    },
    {
      id: 'task-management',
      title: 'Como Criar sua Primeira Tarefa',
      description:
        'Aprenda a criar e gerenciar tarefas de forma colaborativa com sua equipe.',
      icon: <AccessibleEmoji emoji='📋' label='Checklist' />,
      color: '#F39C12',
      illustration: <AccessibleEmoji emoji='👥' label='Equipe' />,
      features: [
        'Criação e atribuição de tarefas',
        'Comentários e checklists',
        'Notificações push e email',
        'Chat estilo WhatsApp',
      ],
      benefits: [
        'Colaboração eficiente',
        'Comunicação clara',
        'Acompanhamento em tempo real',
        'Produtividade maximizada',
      ],
      actionSteps: [
        '1. Vá em "Gestão de Tarefas" no menu',
        '2. Clique em "Nova Tarefa"',
        '3. Preencha título, descrição e prazo',
        '4. Atribua para um membro da equipe (opcional)',
        '5. Adicione checklist se necessário',
        '6. Salve e acompanhe o progresso',
      ],
      tip: 'Use comentários nas tarefas para comunicação rápida. Todos os envolvidos recebem notificações.',
    },
    {
      id: 'document-management',
      title: 'Como Gerenciar Documentos',
      description:
        'Organize seus documentos importantes e nunca mais perca um prazo de vencimento.',
      icon: <AccessibleEmoji emoji='📄' label='Documento' />,
      color: '#9B59B6',
      illustration: <AccessibleEmoji emoji='🗂' label='Organizador' />,
      features: [
        'Upload e categorização',
        'Alertas de vencimento',
        'Controle de permissões',
        'Busca inteligente',
      ],
      benefits: [
        'Organização perfeita',
        'Nunca perca um prazo',
        'Acesso controlado',
        'Busca instantânea',
      ],
      actionSteps: [
        '1. Acesse "Gestão de Documentos"',
        '2. Clique em "Upload de Documento"',
        '3. Selecione o arquivo e categoria',
        '4. Defina data de vencimento (se aplicável)',
        '5. Configure permissões (público/privado/compartilhado)',
        '6. Receba alertas automáticos antes do vencimento',
      ],
      tip: 'Configure alertas de vencimento para receber notificações 30, 15 e 7 dias antes do prazo.',
    },
    {
      id: 'communication',
      title: 'Como Usar o Chat',
      description:
        'Comunique-se com sua equipe em tempo real através do sistema de mensagens integrado.',
      icon: <AccessibleEmoji emoji='💬' label='Comunicação' />,
      color: '#E67E22',
      illustration: <AccessibleEmoji emoji='📱' label='Aplicativo' />,
      features: [
        'Chat em tempo real',
        'Grupos colaborativos',
        'Status online/offline',
        'Notificações push',
      ],
      benefits: [
        'Comunicação instantânea',
        'Colaboração eficiente',
        'Informações sempre atualizadas',
        'Equipe sempre conectada',
      ],
      actionSteps: [
        '1. Acesse "Comunicação" no menu',
        '2. Selecione um contato ou grupo',
        '3. Digite sua mensagem e envie',
        '4. Use @ para mencionar pessoas',
        '5. Veja status online/offline dos contatos',
      ],
      tip: 'Crie grupos para comunicação em equipe. Todos os membros recebem notificações das mensagens.',
    },
    {
      id: 'shopping-management',
      title: 'Como Criar Lista de Compras',
      description:
        'Organize suas compras de forma inteligente e compartilhe com a família.',
      icon: <AccessibleEmoji emoji='🛍' label='Compras' />,
      color: '#9B59B6',
      illustration: <AccessibleEmoji emoji='📋' label='Checklist' />,
      features: [
        'Listas por categoria',
        'Controle de preços',
        'Compartilhamento familiar',
        'Sugestões inteligentes',
      ],
      benefits: [
        'Organização perfeita',
        'Economia garantida',
        'Colaboração familiar',
        'Nunca esqueça nada',
      ],
      actionSteps: [
        '1. Vá em "Gestão de Compras"',
        '2. Clique em "Nova Lista"',
        '3. Escolha uma categoria',
        '4. Adicione itens à lista',
        '5. Compartilhe com membros da família',
        '6. Marque itens conforme compra',
      ],
      tip: 'Crie listas por categoria (supermercado, farmácia, etc.) para melhor organização.',
    },
    {
      id: 'next-steps',
      title: 'Próximos Passos',
      description:
        'Agora que você conhece o básico, explore outras funcionalidades e personalize seu sistema.',
      icon: <AccessibleEmoji emoji='🎯' label='Objetivo' />,
      color: '#E74C3C',
      illustration: <AccessibleEmoji emoji='🚀' label='Próximo' />,
      features: [
        'Explore Cálculos Salariais',
        'Gerencie Empréstimos',
        'Configure Alertas Personalizados',
        'Integre com eSocial',
      ],
      benefits: [
        'Aproveite todas as funcionalidades',
        'Personalize sua experiência',
        'Automatize processos',
        'Tenha controle total',
      ],
      actionSteps: [
        '1. Explore o Dashboard completamente',
        '2. Configure seus alertas preferidos',
        '3. Crie sua primeira tarefa',
        '4. Faça upload de documentos importantes',
        '5. Explore outras funcionalidades no menu',
      ],
      tip: 'Use o menu lateral para acessar todas as funcionalidades. Você pode voltar a este tutorial a qualquer momento.',
    },
  ];

  const handleStartTutorial = () => {
    setCurrentStep('tutorial');
    alertManager.showSuccess('Bem-vindo ao tutorial do Sistema DOM! 🎉');
  };

  const handleSkipTutorial = () => {
    router.push('/dashboard');
    alertManager.showInfo(
      'Tutorial pulado. Você pode acessá-lo novamente a qualquer momento!'
    );
  };

  const handleNextSlide = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentStep('completion');
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
    alertManager.showSuccess('Bem-vindo ao Sistema DOM! 🚀');
  };

  const handleRevisitTutorial = () => {
    setCurrentStep('tutorial');
    setCurrentSlide(0);
  };

  const progress = ((currentSlide + 1) / tutorialSlides.length) * 100;

  if (currentStep === 'welcome') {
    return (
      <WelcomeContainer $theme={theme}>
        <BackgroundPattern $theme={theme} />
        <SkipButton $theme={theme} onClick={handleSkipTutorial}>
          Pular Tour
        </SkipButton>

        <WelcomeContent>
          <LogoContainer>
            <Logo $theme={theme}>
              <Image
                src='/Logo.png'
                alt='Logo DOM'
                width={80}
                height={80}
                // Removido priority para evitar warning de preload não usado
              />
            </Logo>
          </LogoContainer>

          <WelcomeTitle $theme={theme}>Bem-vindo ao Sistema DOM!</WelcomeTitle>

          <WelcomeSubtitle>
            A solução completa para a gestão do seu lar
          </WelcomeSubtitle>

          <WelcomeDescription>
            Transforme sua casa em um ambiente organizado, seguro e eficiente.
            Com tecnologia avançada e interface intuitiva, o DOM revoluciona a
            forma como você gerencia sua rotina doméstica.
          </WelcomeDescription>

          <ButtonContainer>
            <WelcomeButton
              $variant='primary'
              $theme={theme}
              onClick={handleStartTutorial}
            >
              <AccessibleEmoji emoji='🚀' label='Iniciar' /> Começar Tour
            </WelcomeButton>
          </ButtonContainer>
        </WelcomeContent>
      </WelcomeContainer>
    );
  }

  if (currentStep === 'tutorial') {
    const slide = tutorialSlides[currentSlide];

    if (!slide) {
      return null;
    }

    return (
      <TutorialContainer $theme={theme}>
        <TutorialHeader $theme={theme}>
          <div>
            <TutorialHeaderTitle $theme={theme}>
              Tutorial do Sistema DOM
            </TutorialHeaderTitle>
            <TutorialHeaderSubtitle $theme={theme}>
              Conhecendo as funcionalidades
            </TutorialHeaderSubtitle>
          </div>

          <ProgressContainer>
            <ProgressText $theme={theme}>
              {currentSlide + 1} de {tutorialSlides.length}
            </ProgressText>
            <ProgressBarWithWidth
              value={progress}
              variant='primary'
              theme={theme}
              size='sm'
            />
          </ProgressContainer>
        </TutorialHeader>

        <TutorialContent>
          <SlideContainer>
            <SlideContent>
              <SlideTitle $color={slide.color}>{slide.title}</SlideTitle>

              <SlideDescription>{slide.description}</SlideDescription>

              <FeaturesList>
                {slide.features.map((feature: any, index: any) => (
                  <FeatureItem key={index}>{feature}</FeatureItem>
                ))}
              </FeaturesList>

              <BenefitsList>
                {slide.benefits.map((benefit: any, index: any) => (
                  <BenefitItem key={index}>{benefit}</BenefitItem>
                ))}
              </BenefitsList>

              {slide.actionSteps && slide.actionSteps.length > 0 && (
                <ActionStepsList $theme={theme}>
                  {slide.actionSteps.map((step: string, index: number) => (
                    <ActionStepItem key={index} $theme={theme}>
                      {step}
                    </ActionStepItem>
                  ))}
                </ActionStepsList>
              )}

              {slide.tip && (
                <TipBox $theme={theme}>
                  <TipIcon>
                    <AccessibleEmoji emoji='💡' label='Dica' />
                  </TipIcon>
                  <TipText $theme={theme}>
                    <strong>Dica:</strong> {slide.tip}
                  </TipText>
                </TipBox>
              )}
            </SlideContent>

            <SlideIllustration $color={slide.color}>
              <IllustrationIcon>{slide.illustration}</IllustrationIcon>
            </SlideIllustration>
          </SlideContainer>
        </TutorialContent>

        <NavigationContainer $theme={theme}>
          <NavigationButton
            $theme={theme}
            disabled={currentSlide === 0}
            onClick={handlePreviousSlide}
          >
            ← Anterior
          </NavigationButton>

          <DotsContainer>
            {tutorialSlides.map((_: any, index: any) => (
              <DotIndicator
                key={index}
                $active={index === currentSlide}
                $theme={theme}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </DotsContainer>

          <NavigationButton $theme={theme} onClick={handleNextSlide}>
            {currentSlide === tutorialSlides.length - 1
              ? 'Finalizar'
              : 'Próximo'}{' '}
            →
          </NavigationButton>
        </NavigationContainer>
      </TutorialContainer>
    );
  }

  if (currentStep === 'completion') {
    return (
      <CompletionContainer $theme={theme}>
        <CompletionContent>
          <CompletionIcon>
            <AccessibleEmoji emoji='🎉' label='Parabéns' />
          </CompletionIcon>

          <CompletionTitle $theme={theme}>Pronto para começar?</CompletionTitle>

          <CompletionDescription $theme={theme}>
            Você agora conhece todas as funcionalidades do Sistema DOM! Sua
            jornada rumo a uma casa mais organizada, segura e eficiente começa
            agora.
          </CompletionDescription>

          <StatsContainer>
            <UnifiedCard theme={theme} variant='glass' size='md'>
              <StatCardContent>
                <StatNumber>7</StatNumber>
                <StatLabel>Módulos Principais</StatLabel>
              </StatCardContent>
            </UnifiedCard>
            <UnifiedCard theme={theme} variant='glass' size='md'>
              <StatCardContent>
                <StatNumber>100%</StatNumber>
                <StatLabel>Seguro e Conforme</StatLabel>
              </StatCardContent>
            </UnifiedCard>
            <UnifiedCard theme={theme} variant='glass' size='md'>
              <StatCardContent>
                <StatNumber>24/7</StatNumber>
                <StatLabel>Disponível</StatLabel>
              </StatCardContent>
            </UnifiedCard>
            <UnifiedCard theme={theme} variant='glass' size='md'>
              <StatCardContent>
                <StatNumber>∞</StatNumber>
                <StatLabel>Possibilidades</StatLabel>
              </StatCardContent>
            </UnifiedCard>
          </StatsContainer>

          <ButtonContainer>
            <WelcomeButton
              $variant='primary'
              $theme={theme}
              onClick={handleGoToDashboard}
            >
              <AccessibleEmoji emoji='🏠' label='Home' /> Ir para o Dashboard
            </WelcomeButton>

            <SecondaryButton
              $variant='secondary'
              $theme={theme}
              onClick={handleRevisitTutorial}
            >
              <AccessibleEmoji emoji='🔄' label='Sincronizar' /> Revisitar
              Tutorial
            </SecondaryButton>
          </ButtonContainer>
        </CompletionContent>
      </CompletionContainer>
    );
  }

  return null;
}
