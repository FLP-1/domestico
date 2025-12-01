import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';
import {
  UnifiedButton,
  UnifiedCard,
  UnifiedBadge,
} from '../components/unified';
import { ContentGrid } from '../components/shared/page-components';
import { formatDate } from '../utils/formatters';

import { publicColors, addOpacity } from '../utils/themeHelpers';

// ============================================
// ANIMAÇÕES
// ============================================

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

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
`;

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${publicColors.primary} 0%,
    ${publicColors.secondary} 50%,
    ${publicColors.tertiary} 100%
  );
  background-size: 200% 200%;
  animation: ${gradientShift} 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 20% 50%,
      ${addOpacity(publicColors.surface, 0.1)} 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 80% 80%,
      ${addOpacity(publicColors.tertiary, 0.2)} 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LogoImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: ${addOpacity(publicColors.surface, 0.95)};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px ${addOpacity(publicColors.shadow, 0.3)};
  backdrop-filter: blur(10px);
  border: 2px solid ${addOpacity(publicColors.surface, 0.3)};
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 700;
  color: ${publicColors.surface};
  margin: 0 0 1.5rem 0;
  text-shadow: 0 4px 20px ${addOpacity(publicColors.shadow, 0.5)};
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: ${addOpacity(publicColors.surface, 0.95)};
  margin: 0 0 2.5rem 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  text-shadow: 0 2px 10px ${addOpacity(publicColors.shadow, 0.3)};
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const FeatureSection = styled.section`
  padding: 5rem 2rem;
  background: ${publicColors.background};
  position: relative;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: ${publicColors.text.primary};
  text-align: center;
  margin: 0 0 1rem 0;
`;

const SectionSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: ${publicColors.text.secondary};
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
`;

const FeaturesGrid = styled(ContentGrid)`
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled(UnifiedCard)`
  height: 100%;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  animation-fill-mode: both;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
  &:nth-child(5) {
    animation-delay: 0.5s;
  }
  &:nth-child(6) {
    animation-delay: 0.6s;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px ${addOpacity(publicColors.shadow, 0.2)};
  }
`;

const FeatureIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${publicColors.text.primary};
  margin: 0 0 1rem 0;
  text-align: center;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: ${publicColors.text.secondary};
  line-height: 1.6;
  margin: 0;
  text-align: center;
`;

const BenefitsSection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(
    135deg,
    ${addOpacity(publicColors.primary, 0.05)} 0%,
    ${addOpacity(publicColors.secondary, 0.05)} 100%
  );
  position: relative;
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: ${publicColors.surface};
  border-radius: 16px;
  box-shadow: 0 4px 20px ${addOpacity(publicColors.shadow, 0.1)};
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  animation: ${slideInLeft} 0.6s ease-out;
  animation-fill-mode: both;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 30px ${addOpacity(publicColors.shadow, 0.15)};
  }
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  flex-shrink: 0;
`;

const BenefitContent = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${publicColors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const BenefitDescription = styled.p`
  font-size: 1rem;
  color: ${publicColors.text.secondary};
  line-height: 1.6;
  margin: 0;
`;

const CTASection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(
    135deg,
    ${publicColors.primary} 0%,
    ${publicColors.secondary} 100%
  );
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  animation: ${fadeIn} 0.8s ease-out;
`;

const CTATitle = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: ${publicColors.surface};
  margin: 0 0 1.5rem 0;
  text-shadow: 0 2px 10px ${addOpacity(publicColors.shadow, 0.3)};
`;

const CTAText = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: ${addOpacity(publicColors.surface, 0.95)};
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
`;

const Footer = styled.footer`
  padding: 3rem 2rem;
  background: ${publicColors.text.primary};
  color: ${publicColors.surface};
  text-align: center;
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.8;
`;

const FooterTextWithMargin = styled(FooterText)`
  margin-top: 0.5rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${addOpacity(publicColors.surface, 0.1)};
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid ${addOpacity(publicColors.surface, 0.2)};
  animation: ${fadeIn} 0.6s ease-out;
  animation-fill-mode: both;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${publicColors.surface};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${addOpacity(publicColors.surface, 0.9)};
`;

// ============================================
// INTERFACES
// ============================================

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Home() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => formatDate(currentDate), [currentDate]);

  const features: Feature[] = [
    {
      id: 'dashboard',
      icon: '🏠',
      title: 'Dashboard Inteligente',
      description:
        'Visão geral em tempo real com widgets personalizáveis, alertas e notificações para controle total da sua rotina doméstica.',
    },
    {
      id: 'time-clock',
      icon: '⏰',
      title: 'Controle de Ponto Seguro',
      description:
        'Geolocalização com geofencing, verificação de dispositivo e auditoria completa para garantir transparência e segurança.',
    },
    {
      id: 'tasks',
      icon: '📋',
      title: 'Gestão de Tarefas Colaborativa',
      description:
        'Criação e atribuição de tarefas com chat estilo WhatsApp, comentários, checklists e histórico completo.',
    },
    {
      id: 'documents',
      icon: '📄',
      title: 'Gestão de Documentos',
      description:
        'Upload e categorização inteligente com alertas de vencimento, controle de permissões e busca avançada.',
    },
    {
      id: 'communication',
      icon: '💬',
      title: 'Comunicação Unificada',
      description:
        'Chat em tempo real com grupos colaborativos, status online/offline e notificações push instantâneas.',
    },
    {
      id: 'shopping',
      icon: '🛍️',
      title: 'Gestão de Compras',
      description:
        'Listas de compras organizadas por categoria, controle de gastos e compartilhamento familiar para economia inteligente.',
    },
    {
      id: 'payroll',
      icon: '💰',
      title: 'Cálculos Salariais',
      description:
        'Gestão completa de folha de pagamento com cálculos automáticos, documentos trabalhistas e controle de períodos.',
    },
    {
      id: 'loans',
      icon: '🏦',
      title: 'Gestão de Empréstimos',
      description:
        'Controle de empréstimos e adiantamentos com parcelas, aprovações e histórico completo de transações.',
    },
    {
      id: 'alerts',
      icon: '🔔',
      title: 'Sistema de Alertas',
      description:
        'Alertas personalizados com notificações por email e SMS, condições configuráveis e histórico de disparos.',
    },
    {
      id: 'esocial',
      icon: '🌐',
      title: 'Integração eSocial',
      description:
        'Ferramentas auxiliares, cálculos trabalhistas, templates e validações para facilitar o processo eSocial.',
    },
  ];

  const benefits: Benefit[] = [
    {
      icon: '⚡',
      title: 'Economia de Tempo',
      description:
        'Automatize tarefas repetitivas e foque no que realmente importa. Organize sua casa em minutos, não horas.',
    },
    {
      icon: '🔒',
      title: 'Segurança e Privacidade',
      description:
        'Seus dados protegidos com criptografia de ponta e conformidade total com LGPD. Controle total sobre suas informações.',
    },
    {
      icon: '📊',
      title: 'Decisões Inteligentes',
      description:
        'Dashboards e relatórios detalhados para tomar decisões baseadas em dados reais sobre sua rotina doméstica.',
    },
    {
      icon: '🤝',
      title: 'Colaboração Eficiente',
      description:
        'Comunicação unificada e gestão colaborativa para toda a família trabalhar junta de forma organizada.',
    },
  ];

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleLearnMore = () => {
    router.push('/welcome-tutorial');
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <LogoContainer>
            <LogoImage>
              <Image
                src='/Logo.png'
                alt='Logo Sistema DOM'
                width={80}
                height={80}
                priority
              />
            </LogoImage>
          </LogoContainer>

          <HeroTitle>
            Transforme sua casa em um ambiente organizado, seguro e eficiente
          </HeroTitle>

          <HeroSubtitle>
            O Sistema DOM revoluciona a gestão doméstica com tecnologia
            avançada, interface intuitiva e controle total sobre tarefas,
            documentos, comunicação e muito mais.
          </HeroSubtitle>

          <CTAButtons>
            <UnifiedButton
              $variant='primary'
              $size='xl'
              onClick={handleGetStarted}
            >
              Começar Agora
            </UnifiedButton>
            <UnifiedButton
              $variant='ghost'
              $size='xl'
              onClick={handleLearnMore}
            >
              Saiba Mais
            </UnifiedButton>
          </CTAButtons>

          <StatsContainer>
            <StatCard>
              <StatValue>10</StatValue>
              <StatLabel>Módulos Principais</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>30+</StatValue>
              <StatLabel>Páginas Funcionais</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>70+</StatValue>
              <StatLabel>Componentes Reutilizáveis</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>100%</StatValue>
              <StatLabel>Conformidade LGPD</StatLabel>
            </StatCard>
          </StatsContainer>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <FeatureSection>
        <SectionContainer>
          <SectionTitle>Funcionalidades Principais</SectionTitle>
          <SectionSubtitle>
            Tudo que você precisa para gerenciar sua casa de forma inteligente e
            eficiente em um só lugar.
          </SectionSubtitle>

          <FeaturesGrid>
            {features.map(feature => (
              <FeatureCard
                key={feature.id}
                variant='elevated'
                size='lg'
                onClick={() => {
                  if (feature.id === 'time-clock') {
                    router.push('/time-clock');
                  } else if (feature.id === 'tasks') {
                    router.push('/task-management');
                  } else if (feature.id === 'documents') {
                    router.push('/document-management');
                  } else if (feature.id === 'communication') {
                    router.push('/communication');
                  } else if (feature.id === 'shopping') {
                    router.push('/shopping-management');
                  } else if (feature.id === 'payroll') {
                    router.push('/payroll-management');
                  } else if (feature.id === 'loans') {
                    router.push('/loan-management');
                  } else if (feature.id === 'alerts') {
                    router.push('/alert-management');
                  } else if (feature.id === 'esocial') {
                    router.push('/esocial-domestico-completo');
                  } else {
                    router.push('/dashboard');
                  }
                }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </SectionContainer>
      </FeatureSection>

      {/* Benefits Section */}
      <BenefitsSection>
        <SectionContainer>
          <SectionTitle>Por que escolher o Sistema DOM?</SectionTitle>
          <SectionSubtitle>
            Benefícios reais para transformar sua rotina doméstica
          </SectionSubtitle>

          <BenefitsList>
            {benefits.map((benefit, index) => (
              <BenefitItem key={index}>
                <BenefitIcon>{benefit.icon}</BenefitIcon>
                <BenefitContent>
                  <BenefitTitle>{benefit.title}</BenefitTitle>
                  <BenefitDescription>{benefit.description}</BenefitDescription>
                </BenefitContent>
              </BenefitItem>
            ))}
          </BenefitsList>
        </SectionContainer>
      </BenefitsSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTATitle>Pronto para transformar sua casa?</CTATitle>
          <CTAText>
            Junte-se a milhares de famílias que já estão organizando sua rotina
            doméstica com o Sistema DOM. Comece hoje mesmo!
          </CTAText>
          <CTAButtons>
            <UnifiedButton
              $variant='primary'
              $size='xl'
              onClick={handleGetStarted}
            >
              Criar Conta Gratuita
            </UnifiedButton>
          </CTAButtons>
        </CTAContent>
      </CTASection>

      {/* Footer */}
      <Footer>
        <FooterText>
          Sistema DOM © {new Date().getFullYear()} - Gestão Doméstica Completa
        </FooterText>
        <FooterTextWithMargin>Hoje é {formattedDate}</FooterTextWithMargin>
      </Footer>
    </PageContainer>
  );
}

// Evitar SSR para prevenir FOUC
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
