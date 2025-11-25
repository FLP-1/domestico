import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { UnifiedButton } from '../unified';

interface PlanComparisonProps {
  theme?: any;
  onSelectPlan?: (planId: string) => void;
}

const Container = styled.div<{ $theme?: any }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Table = styled.table<{ $theme?: any }>`
  width: 100%;
  border-collapse: collapse;
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    '#ffffff'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HeaderRow = styled.tr<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    '#29abe2'};
  color: white;
`;

const HeaderCell = styled.th<{ $highlighted?: boolean; $theme?: any }>`
  padding: 1.5rem 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;

  ${props =>
    props.$highlighted &&
    `
    background: ${props.$theme?.colors?.status?.success?.background || '#28a745'};
    position: relative;
    
    &::before {
      content: '⭐ RECOMENDADO';
      position: absolute;
      top: 0.5rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
  `}
`;

const FeatureRow = styled.tr<{ $theme?: any }>`
  border-bottom: 1px solid
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.colors?.border ||
      '#e5e7eb'};

  &:last-child {
    border-bottom: none;
  }
`;

const FeatureCell = styled.td<{ $theme?: any }>`
  padding: 1rem;
  text-align: center;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    '#2c3e50'};
`;

const FeatureName = styled.td<{ $theme?: any }>`
  padding: 1rem;
  font-weight: 500;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    '#2c3e50'};
`;

const CheckIcon = styled.span`
  color: #28a745;
  font-size: 1.5rem;
  font-weight: bold;
`;

const LimitedIcon = styled.span`
  color: #ffc107;
  font-size: 1.5rem;
`;

const CrossIcon = styled.span`
  color: #dc3545;
  font-size: 1.5rem;
`;

const PriceCell = styled.td<{ $theme?: any }>`
  padding: 1rem;
  text-align: center;
`;

const Price = styled.div<{ $theme?: any }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    '#29abe2'};
  margin-bottom: 0.5rem;
`;

const PricePeriod = styled.div<{ $theme?: any }>`
  font-size: 0.875rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.colors?.text?.secondary ||
    '#7f8c8d'};
`;

const features = [
  {
    name: 'Sistema Anti-Fraude Completo',
    free: 'limited',
    larDoceLar: 'limited',
    superDomestica: 'limited',
    ultraPro: true,
  },
  {
    name: 'Ferramentas Auxiliares eSocial',
    free: false,
    larDoceLar: false,
    superDomestica: false,
    ultraPro: true,
  },
  {
    name: 'Gestão Financeira',
    free: false,
    larDoceLar: false,
    superDomestica: true,
    ultraPro: true,
  },
  {
    name: 'Tarefas Ilimitadas',
    free: false,
    larDoceLar: true,
    superDomestica: true,
    ultraPro: true,
  },
  {
    name: 'Documentos',
    free: '50MB',
    larDoceLar: '100MB',
    superDomestica: '500MB',
    ultraPro: 'Ilimitado',
  },
  {
    name: 'Suporte',
    free: 'Comunidade',
    larDoceLar: 'Email',
    superDomestica: 'Email + Chat',
    ultraPro: 'Prioritário',
  },
];

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    highlighted: false,
  },
  {
    id: 'lar-doce-lar',
    name: 'Lar Doce Lar',
    price: 29.9,
    highlighted: false,
  },
  {
    id: 'super-domestica',
    name: 'Super Doméstica',
    price: 49.9,
    highlighted: false,
  },
  {
    id: 'ultra-pro',
    name: 'Ultra Pro',
    price: 69.9, // Ajustado: sem eSocial automático, preço reduzido
    highlighted: true,
  },
];

export const PlanComparison: React.FC<PlanComparisonProps> = ({
  theme: externalTheme,
  onSelectPlan,
}) => {
  const theme = externalTheme || {};

  const renderFeatureValue = (value: boolean | string | 'limited') => {
    if (value === true) {
      return (
        <CheckIcon $theme={theme}>
          ✓
        </CheckIcon>
      );
    }
    if (value === false) {
      return (
        <CrossIcon $theme={theme}>
          ✗
        </CrossIcon>
      );
    }
    if (value === 'limited') {
      return (
        <LimitedIcon $theme={theme}>
          ⚠
        </LimitedIcon>
      );
    }
    return <span>{value}</span>;
  };

  return (
    <Container $theme={theme}>
      <Table $theme={theme}>
        <thead>
          <HeaderRow $theme={theme}>
            <HeaderCell $theme={theme}>Funcionalidade</HeaderCell>
            {plans.map(plan => (
              <HeaderCell
                key={plan.id}
                $highlighted={plan.highlighted}
                $theme={theme}
              >
                {plan.name}
                <PriceCell $theme={theme}>
                  <Price $theme={theme}>
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </Price>
                  <PricePeriod $theme={theme}>/mês</PricePeriod>
                </PriceCell>
              </HeaderCell>
            ))}
          </HeaderRow>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <FeatureRow key={index} $theme={theme}>
              <FeatureName $theme={theme}>{feature.name}</FeatureName>
              <FeatureCell $theme={theme}>
                {renderFeatureValue(feature.free)}
              </FeatureCell>
              <FeatureCell $theme={theme}>
                {renderFeatureValue(feature.larDoceLar)}
              </FeatureCell>
              <FeatureCell $theme={theme}>
                {renderFeatureValue(feature.superDomestica)}
              </FeatureCell>
              <FeatureCell $theme={theme}>
                {renderFeatureValue(feature.ultraPro)}
              </FeatureCell>
            </FeatureRow>
          ))}
        </tbody>
      </Table>

      {onSelectPlan && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <UnifiedButton
            $variant="primary"
            $size="lg"
            onClick={() => onSelectPlan('ultra-pro')}
            $theme={theme}
          >
            Assinar Ultra Pro Agora
          </UnifiedButton>
        </div>
      )}
    </Container>
  );
};

export default PlanComparison;

