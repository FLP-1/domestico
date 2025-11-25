import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/welcome-tutorial.tsx
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAlertManager } from '../hooks/useAlertManager';
import styled, { keyframes } from 'styled-components';
import { publicColors, addOpacity } from '../utils/themeHelpers';
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
        const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
        if (bgColor && bgColor.startsWith('#')) {
          const r = parseInt(bgColor.slice(1, 3), 16);
          const g = parseInt(bgColor.slice(3, 5), 16);
          const b = parseInt(bgColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        return 'rgba(255, 255, 255, 0.1)';
      }} 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      ${props => {
        const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
        if (bgColor && bgColor.startsWith('#')) {
          const r = parseInt(bgColor.slice(1, 3), 16);
          const g = parseInt(bgColor.slice(3, 5), 16);
          const b = parseInt(bgColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        return 'rgba(255, 255, 255, 0.1)';
      }} 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      ${props => {
        const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
        if (bgColor && bgColor.startsWith('#')) {
          const r = parseInt(bgColor.slice(1, 3), 16);
          const g = parseInt(bgColor.slice(3, 5), 16);
          const b = parseInt(bgColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.05)`;
        }
        return 'rgba(255, 255, 255, 0.05)';
      }} 0%,
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
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.9), rgba(${r}, ${g}, ${b}, 0.7))`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 20px 40px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(20px);
  border: 2px solid ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
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
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    'inherit'};
  margin: 0 0 1rem 0;
  text-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 8px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.3)`;
      }
    }
    return 'none';
  }};
  background: ${props => {
    const textColor = props.$theme?.colors?.text?.primary || props.$theme?.text?.primary;
    const secondaryColor = props.$theme?.colors?.text?.secondary || props.$theme?.text?.secondary;
    if (textColor && secondaryColor && textColor.startsWith('#') && secondaryColor.startsWith('#')) {
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
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    'inherit'};
  margin: 0 0 2rem 0;
  font-weight: 500;
  text-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
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
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
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
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'transparent';
  }};
  border: 1px solid ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
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
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    'inherit'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: ${props => {
      const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
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
    ${props => props.$theme?.colors?.border || publicColors.border} 100%
  );
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
`;

const TutorialHeader = styled.header<{ $theme?: Theme }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  border-bottom: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return props.$theme?.colors?.border?.light || 
           props.$theme?.border?.light ||
           'transparent';
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
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
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

const SlideTitle = styled.h2<{ $color: string }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$color};
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SlideDescription = styled.p<{ $theme?: any }>`
  font-size: 1.2rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
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
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};

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
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};

  &::before {
    content: '🎯';
    font-size: 1.1rem;
  }
`;

const SlideIllustration = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 3s ease-in-out infinite;

  .illustration-icon {
    font-size: 8rem;
    color: ${props => props.$color};
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
  }
`;

const NavigationContainer = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  backdrop-filter: blur(20px);
  border-top: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    'transparent'};
`;

const NavigationButton = styled.button<{ $theme?: Theme; $disabled?: boolean }>`
  background: ${props =>
    props.$disabled
      ? props.$theme?.colors?.background?.secondary || 
        props.$theme?.background?.secondary ||
        'transparent'
      : props.$theme?.colors?.primary || 
        props.$theme?.accent ||
        'transparent'};
  color: ${props => 
    props.$disabled
      ? props.$theme?.colors?.text?.secondary || 
        props.$theme?.text?.secondary ||
        'inherit'
      : props.$theme?.colors?.text?.primary || 
        props.$theme?.text?.primary ||
        'inherit'};
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
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
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
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    'inherit'};
  margin: 0 0 1rem 0;
  text-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
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
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
  margin: 0 0 3rem 0;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
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
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  font-size: 1.2rem;
`;

const TutorialHeaderSubtitle = styled.p<{ $theme?: any }>`
  margin: 0.25rem 0 0 0;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
  font-size: 0.9rem;
`;

const DotIndicator = styled.div<{ $active: boolean; $theme?: Theme }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props =>
    props.$active
      ? props.$theme?.colors?.primary || 
        props.$theme?.accent ||
        'transparent'
      : props.$theme?.colors?.background?.secondary || 
        props.$theme?.background?.secondary ||
        'transparent'};
  cursor: pointer
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
      border: publicColors.border,
    },
  };

  const tutorialSlides: TutorialSlide[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Inteligente',
      description:
        'Seu centro de comando para gerenciar toda a rotina doméstica com visão completa e personalizada.',
      icon: <AccessibleEmoji emoji='🏠' label='Home' />,
      color: '#29ABE2',
      illustration: <AccessibleEmoji emoji='📊' label='Dashboard' />,
      features: [
        'Visão geral em tempo real',
        'Widgets personalizáveis',
        'Alertas e notificações',
        'Calendário integrado',
      ],
      benefits: [
        'Controle total da sua casa',
        'Economia de tempo',
        'Organização automática',
        'Decisões baseadas em dados',
      ],
    },
    {
      id: 'time-clock',
      title: 'Controle de Ponto Seguro',
      description:
        'Sistema anti-fraude com geolocalização, verificação de dispositivo e rede Wi-Fi para registros confiáveis.',
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
    },
    {
      id: 'task-management',
      title: 'Gestão de Tarefas Colaborativa',
      description:
        'Organize, atribua e acompanhe tarefas com comentários, checklists e notificações em tempo real.',
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
    },
    {
      id: 'document-management',
      title: 'Gestão de Documentos',
      description:
        'Organize, armazene e gerencie todos os documentos importantes com alertas de vencimento e controle de acesso.',
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
    },
    {
      id: 'communication',
      title: 'Comunicação Unificada',
      description:
        'Chat em tempo real, grupos colaborativos e notificações instantâneas para manter toda a equipe conectada.',
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
    },
    {
      id: 'shopping-management',
      title: 'Gestão de Compras',
      description:
        'Organize listas de compras por categoria, controle gastos e compartilhe com a família para uma gestão eficiente.',
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
    },
    {
      id: 'security',
      title: 'Segurança e Conformidade',
      description:
        'Sistema robusto com criptografia, logs de auditoria e conformidade total com a LGPD.',
      icon: <AccessibleEmoji emoji='🛡' label='Segurança' />,
      color: '#E74C3C',
      illustration: <AccessibleEmoji emoji='🔐' label='Criptografia' />,
      features: [
        'Criptografia de dados',
        'Logs de auditoria',
        'Conformidade LGPD',
        'Autenticação JWT',
      ],
      benefits: [
        'Dados 100% protegidos',
        'Rastreabilidade completa',
        'Conformidade legal',
        'Acesso seguro',
      ],
    },
  ];

  const handleStartTutorial = () => {
    setCurrentStep('tutorial');
    alertManager.showSuccess(
      'Bem-vindo ao tutorial do Sistema DOM! 🎉'
    );
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
    alertManager.showSuccess(
      'Bem-vindo ao Sistema DOM! 🚀'
    );
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
        <SkipButton $theme={theme} onClick={handleSkipTutorial}>Pular Tour</SkipButton>

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
            <TutorialHeaderTitle $theme={theme}>Tutorial do Sistema DOM</TutorialHeaderTitle>
            <TutorialHeaderSubtitle $theme={theme}>
              Conhecendo as funcionalidades
            </TutorialHeaderSubtitle>
          </div>

          <ProgressContainer>
            <ProgressText $theme={theme}>
              {currentSlide + 1} de {tutorialSlides.length}
            </ProgressText>
            <UnifiedProgressBar 
              value={progress} 
              variant="primary" 
              theme={theme}
              size="sm"
              style={{ width: '200px' }}
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
            </SlideContent>

            <SlideIllustration $color={slide.color}>
              <IllustrationIcon>{slide.illustration}</IllustrationIcon>
            </SlideIllustration>
          </SlideContainer>
        </TutorialContent>

        <NavigationContainer $theme={theme}>
          <NavigationButton
            $theme={theme}
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
            <UnifiedCard
              theme={theme}
              variant='glass'
              size='md'
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>7</div>
                <div style={{ fontSize: '0.9rem', color: 'white' }}>Módulos Principais</div>
              </div>
            </UnifiedCard>
            <UnifiedCard
              theme={theme}
              variant='glass'
              size='md'
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>100%</div>
                <div style={{ fontSize: '0.9rem', color: 'white' }}>Seguro e Conforme</div>
              </div>
            </UnifiedCard>
            <UnifiedCard
              theme={theme}
              variant='glass'
              size='md'
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>24/7</div>
                <div style={{ fontSize: '0.9rem', color: 'white' }}>Disponível</div>
              </div>
            </UnifiedCard>
            <UnifiedCard
              theme={theme}
              variant='glass'
              size='md'
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>∞</div>
                <div style={{ fontSize: '0.9rem', color: 'white' }}>Possibilidades</div>
              </div>
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
