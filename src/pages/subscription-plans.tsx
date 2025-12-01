import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/subscription-plans.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton, UnifiedModal } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAlertManager } from '../hooks/useAlertManager';
import { publicColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import { OptimizedSectionTitle } from '../components/shared/optimized-styles';
import { formatCurrency } from '../utils/formatters';

// Interfaces
interface Plan {
  id: string;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscount: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  isFree?: boolean;
  isPartnership?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'success';
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

// SectionTitle removido - usar OptimizedSectionTitle

const SectionText = styled.p`
  color: ${publicColors.text.secondary};
  font-size: 0.9rem;
  margin: 0.25rem 0;
`;

const SectionSubtitle = styled.h4`
  color: ${publicColors.text.primary};
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

// Styled Components para substituir estilos inline
// UnifiedModalSection removido - usar div diretamente

const PriceText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
`;

const PriceUnit = styled.span`
  font-size: 1rem;
  color: ${publicColors.text.secondary};
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const FlexColumn = styled.div`
  flex: 1;
`;

// Styled Components para substituir estilos inline
const SectionWithMargin = styled.div`
  margin-bottom: 1.5rem;
`;

// Styled Components

const PlansSection = styled.section`
  margin-bottom: 4rem;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const PlanCard = styled.div<{
  $theme?: Theme;
  $isPopular?: boolean | undefined;
  $isRecommended?: boolean | undefined;
}>`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px ${publicColors.shadow};
  border: 2px solid
    ${props => {
      if (props.$isPopular) return publicColors.success;
      if (props.$isRecommended) return publicColors.warning;
      return 'transparent';
    }};
  position: relative;
  transition: all 0.3s ease;
  transform: ${props => (props.$isPopular ? 'scale(1.05)' : 'scale(1)')};

  &:hover {
    transform: ${props => (props.$isPopular ? 'scale(1.08)' : 'scale(1.02)')};
    box-shadow: 0 12px 40px ${publicColors.shadow};
  }
`;

const PopularBadge = styled.div<{ $theme?: Theme }>`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    135deg,
    ${publicColors.success},
    ${publicColors.success}
  );
  color: ${publicColors.surface};
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 12px ${addOpacity(publicColors.success, 0.3)};
  z-index: 10;
`;

const RecommendedBadge = styled.div<{ $theme?: Theme }>`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    135deg,
    ${publicColors.warning},
    ${publicColors.warning}
  );
  color: ${publicColors.surface};
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 12px ${addOpacity(publicColors.warning, 0.4)};
  z-index: 10;
  border: 2px solid ${addOpacity(publicColors.surface, 0.3)};
  text-shadow: 0 1px 2px ${addOpacity(publicColors.text.primary, 0.2)};
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 0.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const PlanTagline = styled.p`
  font-size: 0.9rem;
  color: ${publicColors.text.secondary};
  margin: 0 0 1rem 0;
  font-style: italic;
  line-height: 1.4;
`;

const PlanDescription = styled.p`
  font-size: 0.85rem;
  color: ${publicColors.text.secondary};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const PriceSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const MonthlyPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 0.5rem;
`;

const AnnualPrice = styled.div`
  font-size: 1.1rem;
  color: ${publicColors.success};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const AnnualDiscount = styled.div`
  font-size: 0.8rem;
  color: ${publicColors.text.secondary};
  font-style: italic;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: ${publicColors.text.primary};
  line-height: 1.4;
`;

const FeatureIcon = styled.span`
  color: ${publicColors.success};
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const PlanButton = styled.div`
  width: 100%;
`;

const ComparisonSection = styled.section<{ $theme?: Theme }>`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 8px 32px ${publicColors.shadow};
`;

const ComparisonTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 2rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const ComparisonTable = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid ${typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  background: ${publicColors.background};
  border-bottom: 2px solid ${typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border};
`;

const TableHeaderCell = styled.div`
  padding: 1rem;
  font-weight: 600;
  color: ${publicColors.text.primary};
  text-align: center;
  border-right: 1px solid ${typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border};
  font-size: 0.9rem;

  &:last-child {
    border-right: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  border-bottom: 1px solid ${typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  padding: 1rem;
  text-align: center;
  border-right: 1px solid ${typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border};
  font-size: 0.9rem;
  color: ${publicColors.text.primary};

  &:first-child {
    text-align: left;
    font-weight: 500;
  }

  &:last-child {
    border-right: none;
  }
`;

const CheckIcon = styled.span`
  color: ${publicColors.success};
  font-size: 1.2rem;
  font-weight: bold;
`;

const XIcon = styled.span`
  color: ${publicColors.error};
  font-size: 1.2rem;
  font-weight: bold;
`;

const FAQSection = styled.section<{ $theme?: Theme }>`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 8px 32px ${publicColors.shadow};
`;

const FAQTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 2rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const FAQItem = styled.div<{ $theme?: Theme }>`
  background: ${publicColors.background};
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${publicColors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: ${addOpacity(publicColors.primary, 0.05)};
    transform: translateY(-2px);
  }
`;

const FAQQuestion = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${publicColors.text.primary};
  margin: 0 0 0.75rem 0;
`;

const FAQAnswer = styled.p`
  font-size: 0.9rem;
  color: ${publicColors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const TestimonialsSection = styled.section<{ $theme?: Theme }>`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 4rem;
  box-shadow: 0 8px 32px ${publicColors.shadow};
`;

const TestimonialsTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 2rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TestimonialCard = styled.div<{ $theme?: Theme }>`
  background: ${publicColors.background};
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${publicColors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: ${addOpacity(publicColors.primary, 0.05)};
    transform: translateY(-2px);
  }
`;

const TestimonialText = styled.p`
  font-size: 0.9rem;
  color: ${publicColors.text.primary};
  margin: 0 0 1rem 0;
  line-height: 1.5;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${publicColors.text.primary};
`;

const AuthorRole = styled.div`
  font-size: 0.8rem;
  color: ${publicColors.text.secondary};
`;

const Rating = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props =>
    props.$filled ? publicColors.warning : (typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border)};
  font-size: 1rem;
`;

const GuaranteeSection = styled.section<{ $theme?: Theme }>`
  background: linear-gradient(
    135deg,
    ${addOpacity(publicColors.primary, 0.1)},
    ${addOpacity(publicColors.primary, 0.05)}
  );
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  border: 2px solid ${addOpacity(publicColors.primary, 0.2)};
`;

const GuaranteeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 1rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const GuaranteeText = styled.p`
  font-size: 1rem;
  color: ${publicColors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const ContactSection = styled.section<{ $theme?: Theme }>`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px ${publicColors.shadow};
`;

const ContactTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 1rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const ContactText = styled.p`
  font-size: 1rem;
  color: ${publicColors.text.secondary};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

export default function SubscriptionPlans() {
  const router = useRouter();
  const alertManager = useAlertManager();
  const { currentProfile } = useUserProfile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Tema público para página pública
  const theme = {
    colors: {
      primary: publicColors.primary,
      secondary: publicColors.secondary,
      success: publicColors.success,
      warning: publicColors.warning,
      error: publicColors.error,
      text: publicColors.text,
      background: publicColors.background,
      surface: publicColors.surface,
      border: publicColors.border,
      shadow: publicColors.shadow,
    },
  };

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Plano Free',
      tagline: 'Deguste o DOM sem compromisso',
      description:
        '15 dias gratuitos para experimentar a gestão que organiza até seus sonhos mais bagunçados!',
      monthlyPrice: 0,
      annualPrice: 0,
      annualDiscount: 'N/A',
      features: [
        'Dashboard básico',
        'Registro de ponto limitado',
        'Upload de documentos (até 50MB)',
        'Suporte via comunidade',
        'Acesso às funcionalidades básicas',
      ],
      isFree: true,
      buttonText: 'Experimente Grátis',
      buttonVariant: 'success',
    },
    {
      id: 'lar-doce-lar',
      name: 'Lar Doce Lar',
      tagline: 'Cansado de ser o CEO da sua casa?',
      description:
        'Com este plano, você terceiriza a bagunça e foca no que realmente importa: maratonar séries!',
      monthlyPrice: 29.9,
      annualPrice: 299,
      annualDiscount: '2 meses grátis',
      features: [
        'Dashboard personalizado',
        'Gestão de tarefas colaborativa',
        'Registro de ponto inteligente',
        'Gestão de documentos (até 100MB)',
        'Suporte prioritário',
        'Relatórios básicos',
      ],
      buttonText: 'Assinar Agora',
      buttonVariant: 'primary',
    },
    {
      id: 'super-domestica',
      name: 'Super Doméstica',
      tagline: 'Transforme sua casa em um paraíso da organização!',
      description: 'Com este plano, até Marie Kondo sentiria inveja.',
      monthlyPrice: 49.9,
      annualPrice: 499,
      annualDiscount: '2 meses grátis',
      features: [
        'Tudo do Lar Doce Lar',
        'Gestão financeira simplificada',
        'Comunicação unificada (chat e videochamadas)',
        'Assistente virtual (comandos de voz)',
        'Gestão de compras',
        'Alertas personalizados',
        'Integração com calendários',
      ],
      isRecommended: true,
      buttonText: 'Assinar Agora',
      buttonVariant: 'primary',
    },
    {
      id: 'ultra-pro',
      name: 'Ultra Pro',
      tagline: 'O plano que vai te dar superpoderes domésticos!',
      description: 'Organize, planeje e execute com a eficiência de um ninja.',
      monthlyPrice: 69.9, // Ajustado: sem eSocial automático, preço reduzido
      annualPrice: 699, // Ajustado proporcionalmente
      annualDiscount: '2 meses grátis',
      features: [
        'Tudo do Super Doméstica',
        'Sistema Anti-Fraude Completo',
        'Ferramentas Auxiliares eSocial',
        'Relatórios personalizados',
        'Gamificação (sistema de recompensas)',
        'Gestão de planos de assinatura',
        'Gestão de empréstimos e adiantamentos',
        'API personalizada',
      ],
      isPopular: true,
      buttonText: 'Assinar Agora',
      buttonVariant: 'primary',
    },
    {
      id: 'parceria-master',
      name: 'Parceria Master',
      tagline: 'Seja nosso parceiro e conquiste o mundo!',
      description: 'Juntos, somos imbatíveis!',
      monthlyPrice: 0,
      annualPrice: 0,
      annualDiscount: 'Fale conosco',
      features: [
        'Customização da interface (white label)',
        'Acesso a dados estratégicos do mercado',
        'Suporte técnico especializado',
        'Participação em eventos exclusivos',
        'Gestão de múltiplos núcleos',
        'Integração com sistemas corporativos',
        'Consultoria personalizada',
      ],
      isPartnership: true,
      buttonText: 'Falar com Vendas',
      buttonVariant: 'secondary',
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer:
        'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. Seu acesso permanecerá ativo até o final do período pago.',
    },
    {
      id: '2',
      question: 'Há desconto para pagamento anual?',
      answer:
        'Sim! Oferecemos 2 meses grátis quando você paga anualmente, o que representa uma economia significativa comparado ao pagamento mensal.',
    },
    {
      id: '3',
      question: 'Posso mudar de plano a qualquer momento?',
      answer:
        'Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferença será calculada proporcionalmente.',
    },
    {
      id: '4',
      question: 'O que acontece com meus dados se eu cancelar?',
      answer:
        'Seus dados ficam seguros por 30 dias após o cancelamento. Você pode reativar sua conta nesse período sem perder informações.',
    },
    {
      id: '5',
      question: 'Há suporte técnico disponível?',
      answer:
        'Sim! Oferecemos suporte via chat, e-mail e telefone, com tempos de resposta diferenciados conforme o plano escolhido.',
    },
    {
      id: '6',
      question: 'Posso testar antes de assinar?',
      answer:
        'Claro! Oferecemos 15 dias grátis para você experimentar todas as funcionalidades do plano escolhido.',
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Ana Costa',
      role: 'Empregadora',
      text: 'O DOM revolucionou a gestão da minha casa! Agora consigo organizar tudo de forma muito mais eficiente.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Carlos Mendes',
      role: 'Administrador',
      text: 'A interface é intuitiva e as funcionalidades são exatamente o que precisávamos para nosso negócio.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Mariana Silva',
      role: 'Familiar',
      text: 'Finalmente encontrei uma solução que realmente funciona para organizar a vida doméstica da família.',
      rating: 5,
    },
  ];

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setUnifiedModalOpen(true);
  };

  const handleSubscribe = () => {
    if (selectedPlan) {
      alertManager.showSuccess(
        `Redirecionando para pagamento do plano ${selectedPlan.name}...`
      );
      // Aqui seria implementada a integração com o sistema de pagamento
      setUnifiedModalOpen(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Grátis';
    return formatCurrency(price);
  };

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={0}
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Planos de Assinatura'
        subtitle='Escolha o plano ideal para transformar sua gestão doméstica'
      />

      {/* Seção de Planos */}
      <PlansSection>
        <PlansGrid>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              $theme={theme}
              $isPopular={plan.isPopular}
              $isRecommended={plan.isRecommended}
            >
              {plan.isPopular && (
                <PopularBadge $theme={theme}>
                  <AccessibleEmoji emoji='🔥' label='Fogo' /> MAIS POPULAR
                </PopularBadge>
              )}
              {plan.isRecommended && (
                <RecommendedBadge $theme={theme}>
                  <AccessibleEmoji emoji='★' label='Estrela' /> RECOMENDADO
                </RecommendedBadge>
              )}

              <PlanHeader>
                <PlanName>{plan.name}</PlanName>
                <PlanTagline>{plan.tagline}</PlanTagline>
                <PlanDescription>{plan.description}</PlanDescription>
              </PlanHeader>

              <PriceSection>
                <MonthlyPrice>{formatPrice(plan.monthlyPrice)}</MonthlyPrice>
                {plan.monthlyPrice > 0 && (
                  <>
                    <AnnualPrice>
                      {formatPrice(plan.annualPrice)}/ano
                    </AnnualPrice>
                    <AnnualDiscount>({plan.annualDiscount})</AnnualDiscount>
                  </>
                )}
              </PriceSection>

              <FeaturesList>
                {plan.features.map((feature: any, index: any) => (
                  <FeatureItem key={index}>
                    <FeatureIcon>
                      <AccessibleEmoji emoji='✓' label='Check' />
                    </FeatureIcon>
                    <span>{feature}</span>
                  </FeatureItem>
                ))}
              </FeaturesList>

              <PlanButton>
                <UnifiedButton
                  $variant={plan.buttonVariant}
                  $theme={theme}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.buttonText}
                </UnifiedButton>
              </PlanButton>
            </PlanCard>
          ))}
        </PlansGrid>
      </PlansSection>

      {/* Tabela Comparativa */}
      <ComparisonSection $theme={theme}>
        <ComparisonTitle>Comparativo de Recursos</ComparisonTitle>
        <ComparisonTable>
          <TableHeader>
            <TableHeaderCell>Recursos</TableHeaderCell>
            <TableHeaderCell>Free</TableHeaderCell>
            <TableHeaderCell>Lar Doce Lar</TableHeaderCell>
            <TableHeaderCell>Super Doméstica</TableHeaderCell>
            <TableHeaderCell>Ultra Pro</TableHeaderCell>
            <TableHeaderCell>Parceria Master</TableHeaderCell>
          </TableHeader>
          <TableRow>
            <TableCell>Dashboard Básico</TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Dashboard Personalizado</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Gestão de Tarefas</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Gestão Financeira</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Comunicação Unificada</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Assistente Virtual</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Integração com Wearables</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Gamificação</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>White Label</TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <XIcon>
                <AccessibleEmoji emoji='✗' label='X' />
              </XIcon>
            </TableCell>
            <TableCell>
              <CheckIcon>
                <AccessibleEmoji emoji='✓' label='Check' />
              </CheckIcon>
            </TableCell>
          </TableRow>
        </ComparisonTable>
      </ComparisonSection>

      {/* FAQ */}
      <FAQSection $theme={theme}>
        <FAQTitle>Perguntas Frequentes</FAQTitle>
        <FAQGrid>
          {faqs.map(faq => (
            <FAQItem key={faq.id} $theme={theme}>
              <FAQQuestion>{faq.question}</FAQQuestion>
              <FAQAnswer>{faq.answer}</FAQAnswer>
            </FAQItem>
          ))}
        </FAQGrid>
      </FAQSection>

      {/* Depoimentos */}
      <TestimonialsSection $theme={theme}>
        <TestimonialsTitle>O que nossos clientes dizem</TestimonialsTitle>
        <TestimonialsGrid>
          {testimonials.map(testimonial => (
            <TestimonialCard key={testimonial.id} $theme={theme}>
              <TestimonialText>
                &ldquo;{testimonial.text}&rdquo;
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorInfo>
                  <AuthorName>{testimonial.name}</AuthorName>
                  <AuthorRole>{testimonial.role}</AuthorRole>
                </AuthorInfo>
                <Rating>
                  {[...Array(5)].map((_: any, i: any) => (
                    <Star key={i} $filled={i < testimonial.rating}>
                      <AccessibleEmoji emoji='★' label='Estrela' />
                    </Star>
                  ))}
                </Rating>
              </TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </TestimonialsSection>

      {/* Garantia */}
      <GuaranteeSection $theme={theme}>
        <GuaranteeTitle>
          <AccessibleEmoji emoji='🛡' label='Escudo' /> Garantia de Satisfação
        </GuaranteeTitle>
        <GuaranteeText>
          Oferecemos 30 dias de garantia total. Se não ficar satisfeito,
          devolvemos seu dinheiro sem perguntas.
        </GuaranteeText>
      </GuaranteeSection>

      {/* Contato */}
      <ContactSection $theme={theme}>
        <ContactTitle>Precisa de ajuda para escolher?</ContactTitle>
        <ContactText>
          Nossa equipe está pronta para ajudar você a encontrar o plano ideal
          para suas necessidades.
        </ContactText>
        <UnifiedButton $variant='secondary' $theme={theme}>
          <AccessibleEmoji emoji='📞' label='Contato' /> Falar com Especialista
        </UnifiedButton>
      </ContactSection>

      {/* UnifiedModal de Confirmação */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setSelectedPlan(null);
        }}
        title={
          selectedPlan
            ? `Confirmar Assinatura - ${selectedPlan.name}`
            : 'Confirmar Assinatura'
        }
        maxWidth='500px'
        $theme={theme}
        footer={
          <>
            <UnifiedButton
              $variant='secondary'
              $theme={theme}
              onClick={() => {
                setUnifiedModalOpen(false);
                setSelectedPlan(null);
              }}
            >
              Cancelar
            </UnifiedButton>
            <UnifiedButton
              $variant='primary'
              $theme={theme}
              onClick={handleSubscribe}
            >
              {selectedPlan?.buttonText || 'Confirmar'}
            </UnifiedButton>
          </>
        }
      >
        {selectedPlan && (
          <div>
            <SectionWithMargin>
              <OptimizedSectionTitle $theme={theme}>
                {selectedPlan.name}
              </OptimizedSectionTitle>
              <SectionText>{selectedPlan.description}</SectionText>
              <PriceText>
                {formatPrice(selectedPlan.monthlyPrice)}
                {selectedPlan.monthlyPrice > 0 && <PriceUnit>/mês</PriceUnit>}
              </PriceText>
            </SectionWithMargin>

            <SectionWithMargin>
              <SectionSubtitle>Recursos inclusos:</SectionSubtitle>
              <FeaturesList>
                {selectedPlan.features.map((feature: any, index: any) => (
                  <FeatureItem key={index}>{feature}</FeatureItem>
                ))}
              </FeaturesList>
            </SectionWithMargin>
          </div>
        )}
      </UnifiedModal>
    </PageContainer>
  );
}
