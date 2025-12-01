import React, { useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedCard, UnifiedButton } from '../unified';

// Styled Components
const TransferContainer = styled.div<{ $theme?: any }>`
  position: relative;
`;

const TransferInfo = styled.div<{ $theme?: any }>`
  padding: 1rem;
  background: ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  border-radius: 8px;
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'transparent';
  }};
  margin-bottom: 1rem;
`;

const TransferInfoTitle = styled.h4<{ $theme?: any }>`
  margin: 0 0 0.5rem 0;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransferInfoText = styled.p<{ $theme?: any }>`
  margin: 0;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const TransferSummary = styled.div<{ $theme?: any }>`
  padding: 1rem;
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border-radius: 8px;
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  margin-bottom: 1rem;
`;

const TransferSummaryTitle = styled.h4<{ $theme?: any }>`
  margin: 0 0 0.75rem 0;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransferRow = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};

  &:last-child {
    border-bottom: none;
  }
`;

const TransferLabel = styled.span<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-weight: 500;
`;

const TransferValue = styled.span<{ $theme?: any; $highlight?: boolean }>`
  font-size: 1rem;
  font-weight: ${props => (props.$highlight ? '700' : '600')};
  color: ${props =>
    props.$highlight
      ? props.$theme?.colors?.primary ||
        props.$theme?.accent ||
        'inherit'
      : props.$theme?.colors?.text?.dark ||
        props.$theme?.text?.dark ||
        props.$theme?.colors?.text?.primary ||
        props.$theme?.colors?.text ||
        'inherit'};
`;

const TransferActions = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const WarningSection = styled.div<{ $theme?: any }>`
  padding: 1rem;
  background: ${props => {
    const warningColor = props.$theme?.colors?.status?.warning?.background ||
                        props.$theme?.status?.warning?.background ||
                        props.$theme?.colors?.warning;
    if (warningColor) {
      // Adiciona opacidade à cor
      if (warningColor.startsWith('#')) {
        const r = parseInt(warningColor.slice(1, 3), 16);
        const g = parseInt(warningColor.slice(3, 5), 16);
        const b = parseInt(warningColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.15)`;
      }
      if (warningColor.startsWith('rgb')) {
        return warningColor.replace(')', ', 0.15)').replace('rgb', 'rgba');
      }
    }
    return 'transparent';
  }};
  border: 1px solid ${props => {
    const warningColor = props.$theme?.colors?.status?.warning?.background ||
                        props.$theme?.status?.warning?.background ||
                        props.$theme?.colors?.warning;
    if (warningColor) {
      // Adiciona opacidade à cor
      if (warningColor.startsWith('#')) {
        const r = parseInt(warningColor.slice(1, 3), 16);
        const g = parseInt(warningColor.slice(3, 5), 16);
        const b = parseInt(warningColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.4)`;
      }
      if (warningColor.startsWith('rgb')) {
        return warningColor.replace(')', ', 0.4)').replace('rgb', 'rgba');
      }
    }
    return 'transparent';
  }};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const WarningTitle = styled.h4<{ $theme?: any }>`
  margin: 0 0 0.5rem 0;
  color: ${props =>
    props.$theme?.colors?.status?.warning?.text ||
    props.$theme?.status?.warning?.text ||
    props.$theme?.colors?.warning ||
    props.$theme?.colors?.text?.dark ||
    'inherit'};
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WarningText = styled.p<{ $theme?: any }>`
  margin: 0;
  color: ${props =>
    props.$theme?.colors?.status?.warning?.text ||
    props.$theme?.status?.warning?.text ||
    props.$theme?.colors?.warning ||
    props.$theme?.colors?.text?.secondary ||
    'inherit'};
  font-size: 0.8rem;
  line-height: 1.4;
`;

const TitleContent = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Interfaces
export interface PayrollData {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  period: string;
  lastTransfer?: Date;
  // Campos opcionais para compatibilidade com API
  upcomingTransfers?: Array<{ mesReferencia: number; anoReferencia: number }>;
  totalTransfers?: number;
  overtimeData?: { totalOvertime?: string };
}

export interface PayrollTransferCardProps {
  theme: any;
  payrollData: PayrollData;
  onTransfer: () => void;
  onViewDetails: () => void;
}

// Helper function para formatar tempo
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}min`;
};

export const PayrollTransferCard: React.FC<PayrollTransferCardProps> = ({
  theme,
  payrollData,
  onTransfer,
  onViewDetails,
}) => {
  // Extrair dados reais do payrollData
  const lastTransfer = payrollData?.lastTransfer as any;
  const upcomingTransfer = payrollData?.upcomingTransfers?.[0];
  const totalTransfers = payrollData?.totalTransfers || 0;
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    setIsTransferring(true);
    try {
      await onTransfer();
    } finally {
      setIsTransferring(false);
    }
  };

  const canTransfer = (lastTransfer || upcomingTransfer) && !isTransferring;
  const hasOvertime =
    payrollData?.overtimeData?.totalOvertime &&
    parseFloat(payrollData.overtimeData.totalOvertime) > 0;

  return (
    <TransferContainer $theme={theme}>
      <UnifiedCard
        theme={theme}
        variant='default'
        size='md'
        icon={<AccessibleEmoji emoji='💰' label='Folha de Pagamento' />}
        title='Transferir para Folha de Pagamento'
      >
        <TransferInfo $theme={theme}>
          <TransferInfoTitle $theme={theme}>
            <AccessibleEmoji emoji='ℹ️' label='Informação' />
            Informações Importantes
          </TransferInfoTitle>
          <TransferInfoText $theme={theme}>
            Os dados de horas trabalhadas serão transferidos para o sistema de
            cálculo da folha de pagamento. Esta ação não pode ser desfeita.
          </TransferInfoText>
        </TransferInfo>

        <TransferSummary $theme={theme}>
          <TransferSummaryTitle $theme={theme}>
            <AccessibleEmoji emoji='📊' label='Resumo' />
            Resumo das Transferências
          </TransferSummaryTitle>

          <TransferRow $theme={theme}>
            <TransferLabel $theme={theme}>Última Transferência:</TransferLabel>
            <TransferValue $theme={theme}>
              {lastTransfer && lastTransfer.mesReferencia != null && lastTransfer.anoReferencia != null
                ? `${lastTransfer.mesReferencia.toString().padStart(2, '0')}/${lastTransfer.anoReferencia}`
                : 'N/A'}
            </TransferValue>
          </TransferRow>

          <TransferRow $theme={theme}>
            <TransferLabel $theme={theme}>Valor da Última Transferência:</TransferLabel>
            <TransferValue $theme={theme}>
              {lastTransfer?.valorTotal
                ? `R$ ${lastTransfer.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'N/A'}
            </TransferValue>
          </TransferRow>

          <TransferRow $theme={theme}>
            <TransferLabel $theme={theme}>Próxima Transferência:</TransferLabel>
            <TransferValue $theme={theme}>
              {upcomingTransfer && upcomingTransfer.mesReferencia != null && upcomingTransfer.anoReferencia != null
                ? `${upcomingTransfer.mesReferencia.toString().padStart(2, '0')}/${upcomingTransfer.anoReferencia}`
                : 'Não agendada'}
            </TransferValue>
          </TransferRow>

          <TransferRow $theme={theme}>
            <TransferLabel $theme={theme}>Total de Transferências:</TransferLabel>
            <TransferValue $theme={theme} $highlight>
              {totalTransfers}
            </TransferValue>
          </TransferRow>
        </TransferSummary>

        {lastTransfer && lastTransfer.mesReferencia != null && lastTransfer.anoReferencia != null && (
          <TransferInfo $theme={theme}>
            <TransferInfoTitle $theme={theme}>
              <AccessibleEmoji emoji='🕒' label='Última Transferência' />
              Última Transferência
            </TransferInfoTitle>
            <TransferInfoText $theme={theme}>
              {`${lastTransfer.mesReferencia.toString().padStart(2, '0')}/${lastTransfer.anoReferencia}`}{' '}
              - Status: {lastTransfer.status || 'N/A'} - Valor: R${' '}
              {lastTransfer.valorTotal?.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              }) || '0,00'}
            </TransferInfoText>
          </TransferInfo>
        )}

        {!canTransfer && (
          <WarningSection $theme={theme}>
            <WarningTitle $theme={theme}>
              <AccessibleEmoji emoji='⚠️' label='Aviso' />
              Nenhuma Hora para Transferir
            </WarningTitle>
            <WarningText $theme={theme}>
              Não há horas trabalhadas registradas neste período para
              transferir.
            </WarningText>
          </WarningSection>
        )}

        <TransferActions>
          <UnifiedButton
            $variant='secondary'
            $theme={theme}
            onClick={onViewDetails}
          >
            <AccessibleEmoji emoji='👁️' label='Ver Detalhes' />
            Ver Detalhes
          </UnifiedButton>

          <UnifiedButton
            $variant='primary'
            $theme={theme}
            onClick={handleTransfer}
            $disabled={!canTransfer || isTransferring}
            $loading={isTransferring}
          >
            <AccessibleEmoji emoji='📤' label='Transferir' />
            {isTransferring ? 'Transferindo...' : 'Transferir'}
          </UnifiedButton>
        </TransferActions>
      </UnifiedCard>
    </TransferContainer>
  );
};

export default PayrollTransferCard;
