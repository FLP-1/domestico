import React from 'react';
import styled from 'styled-components';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useTheme } from '../../hooks/useTheme';

interface ValuePropositionProps {
  variant?: 'hero' | 'compact' | 'inline';
  showDifferentials?: boolean;
}

const Container = styled.div<{ $variant: string; $theme?: any }>`
  ${props => {
    switch (props.$variant) {
      case 'hero':
        return `
          text-align: center;
          padding: 3rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        `;
      case 'compact':
        return `
          padding: 1.5rem;
          max-width: 600px;
        `;
      case 'inline':
        return `
          padding: 1rem 0;
        `;
      default:
        return '';
    }
  }}
`;

const MainTitle = styled.h1<{ $variant?: string; $theme?: any }>`
  font-size: ${props => (props.$variant === 'hero' ? '2.5rem' : '1.75rem')};
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: ${props => (props.$variant === 'hero' ? '2rem' : '1.5rem')};
  }
`;

const Subtitle = styled.p<{ $variant?: string; $theme?: any }>`
  font-size: ${props => (props.$variant === 'hero' ? '1.25rem' : '1rem')};
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin-bottom: ${props => (props.$variant === 'hero' ? '2rem' : '1rem')};
  line-height: 1.6;
`;

const DifferentialsList = styled.ul<{ $theme?: any }>`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const DifferentialItem = styled.li<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border-radius: 8px;
  border-left: 4px solid
    ${props =>
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};

  @media (min-width: 768px) {
    flex: 1;
    min-width: 250px;
  }
`;

const DifferentialIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const DifferentialText = styled.span<{ $theme?: any }>`
  font-weight: 500;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

/**
 * Componente de Proposta de Valor
 * Exibe proposta de valor personalizada por perfil
 */
export const ValueProposition: React.FC<ValuePropositionProps> = ({
  variant = 'hero',
  showDifferentials = true,
}) => {
  const { currentProfile } = useUserProfile();
  const theme = useTheme(currentProfile?.role?.toLowerCase());

  // Propostas de valor por perfil
  const valuePropositions = {
    empregador: {
      title: 'Proteja-se contra fraudes em registros de ponto',
      subtitle:
        'Sistema anti-fraude robusto de múltiplas camadas para trabalho doméstico. Controle total com gestão financeira e ferramentas auxiliares para eSocial.',
      differentials: [
        { icon: '🛡️', text: 'Sistema Anti-Fraude Robusto' },
        { icon: '💰', text: 'Gestão Financeira Completa' },
        { icon: '📋', text: 'Ferramentas Auxiliares eSocial' },
      ],
    },
    empregado: {
      title: 'Registre seu ponto com segurança e tenha histórico completo',
      subtitle:
        'Transparência e proteção para trabalhadores domésticos. Seu histórico completo em um só lugar.',
      differentials: [
        { icon: '📍', text: 'Registro de Ponto Seguro' },
        { icon: '📊', text: 'Histórico Completo' },
        { icon: '🔒', text: 'Proteção contra Fraudes' },
      ],
    },
    familia: {
      title: 'Organize sua casa com gestão completa',
      subtitle:
        'Tarefas, documentos e compras integradas com o trabalho doméstico. Tudo em uma única plataforma.',
      differentials: [
        { icon: '📋', text: 'Gestão de Tarefas' },
        { icon: '📄', text: 'Documentos Organizados' },
        { icon: '🛒', text: 'Compras Inteligentes' },
      ],
    },
    admin: {
      title: 'Plataforma completa de gestão doméstica',
      subtitle:
        'Controle total com todas as funcionalidades. Sistema anti-fraude robusto, gestão financeira e ferramentas auxiliares.',
      differentials: [
        { icon: '🛡️', text: 'Sistema Anti-Fraude' },
        { icon: '💰', text: 'Gestão Financeira' },
        { icon: '📊', text: 'Monitoramento Completo' },
      ],
    },
    default: {
      title: 'Registros de ponto seguros para trabalho doméstico',
      subtitle:
        'Sistema anti-fraude robusto de múltiplas camadas, gestão financeira completa e ferramentas auxiliares para facilitar o eSocial.',
      differentials: [
        { icon: '🛡️', text: 'Sistema Anti-Fraude Robusto' },
        { icon: '💰', text: 'Gestão Financeira Completa' },
        { icon: '📋', text: 'Ferramentas Auxiliares eSocial' },
      ],
    },
  };

  const profileKey =
    (currentProfile?.role?.toLowerCase() as keyof typeof valuePropositions) ||
    'default';
  const proposition =
    valuePropositions[profileKey] || valuePropositions.default;

  return (
    <Container $variant={variant} $theme={theme}>
      <MainTitle $variant={variant} $theme={theme}>
        {proposition.title}
      </MainTitle>
      <Subtitle $variant={variant} $theme={theme}>
        {proposition.subtitle}
      </Subtitle>

      {showDifferentials && (
        <DifferentialsList $theme={theme}>
          {proposition.differentials.map((differential, index) => (
            <DifferentialItem key={index} $theme={theme}>
              <DifferentialIcon>{differential.icon}</DifferentialIcon>
              <DifferentialText $theme={theme}>
                {differential.text}
              </DifferentialText>
            </DifferentialItem>
          ))}
        </DifferentialsList>
      )}
    </Container>
  );
};

export default ValueProposition;

