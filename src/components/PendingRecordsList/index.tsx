// src/components/PendingRecordsList/index.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import ActionIcon from '../ActionIcon';

interface PendingRecord {
  id: string;
  tipo: string;
  dataHora: string;
  endereco?: string;
  precisao?: number;
  observacao?: string;
  usuario: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}

interface PendingRecordsListProps {
  theme: any;
}

const ListContainer = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bg = props.$theme?.colors?.background?.primary ||
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
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 16px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.md || 'none';
  }};
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
`;

const ListHeader = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.muted) ||
           props.$theme?.border?.muted ||
           (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
`;

const ListTitle = styled.h3<{ $theme?: any }>`
  margin: 0;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled.button<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.navigation?.primary ||
    props.$theme?.navigation?.primary ||
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    transform: translateY(-1px);
  }
`;

const RecordItem = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid
    ${props =>
      props.$theme?.colors?.status?.warning?.background ||
      props.$theme?.status?.warning?.background ||
      props.$theme?.colors?.warning ||
      'transparent'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                          props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return props.$theme?.shadows?.sm || 'none';
    }};
  }
`;

const RecordHeader = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RecordType = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecordTime = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
`;

const RecordDetails = styled.div<{ $theme?: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RecordActions = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const RecordDescription = styled.p<{ $theme?: any }>`
  margin-bottom: 1rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const EmptyState = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 2rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const LoadingState = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 2rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorState = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 2rem;
  color: ${props =>
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    props.$theme?.colors?.error ||
    'inherit'};
  background: ${props => {
    const errorColor = props.$theme?.colors?.status?.error?.background ||
                        props.$theme?.status?.error?.background ||
                        props.$theme?.colors?.error;
    if (errorColor && errorColor.startsWith('#')) {
      const r = parseInt(errorColor.slice(1, 3), 16);
      const g = parseInt(errorColor.slice(3, 5), 16);
      const b = parseInt(errorColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  border-radius: 8px;
  border: 1px solid ${props => {
    const errorColor = props.$theme?.colors?.status?.error?.background ||
                        props.$theme?.status?.error?.background ||
                        props.$theme?.colors?.error;
    if (errorColor && errorColor.startsWith('#')) {
      const r = parseInt(errorColor.slice(1, 3), 16);
      const g = parseInt(errorColor.slice(3, 5), 16);
      const b = parseInt(errorColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    return 'transparent';
  }};
`;

const PendingRecordsList: React.FC<PendingRecordsListProps> = ({ theme }) => {
  const { currentProfile } = useUserProfile();
  const { colors: themeColors } = useTheme(currentProfile?.role.toLowerCase());
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/time-clock/pending-approval');
      if (!response.ok) {
        throw new Error('Erro ao carregar registros pendentes');
      }

      const data = await response.json();
      setPendingRecords(data.data || []); // ✅ Corrigido: usar data.data em vez de data.records
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRecords();
  }, []);

  const handleApproval = async (
    recordId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      const response = await fetch('/api/time-clock/pending-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} registro`
        );
      }

      // Recarregar lista após ação
      await loadPendingRecords();

      // Disparar evento para atualizar contadores
      window.dispatchEvent(new CustomEvent('timeClockNotificationsUpdated'));
    } catch (err) {
      console.error(
        `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} registro:`,
        err
      );
      // Usar toast em vez de alert para melhor UX
      // toast.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} registro`);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      saida_almoco: 'Saída Almoço',
      retorno_almoco: 'Retorno Almoço',
      saida: 'Saída',
      entrada_extra: 'Entrada Extra',
      saida_extra: 'Saída Extra',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <ListContainer $theme={theme}>
        <LoadingState $theme={theme}>
          <AccessibleEmoji emoji='⏳' label='Carregando' />
          Carregando registros pendentes...
        </LoadingState>
      </ListContainer>
    );
  }

  if (error) {
    return (
      <ListContainer $theme={theme}>
        <ErrorState $theme={theme}>
          <AccessibleEmoji emoji='❌' label='Erro' />
          {error}
          <br />
          <RefreshButton $theme={theme} onClick={loadPendingRecords}>
            Tentar Novamente
          </RefreshButton>
        </ErrorState>
      </ListContainer>
    );
  }

  return (
    <ListContainer $theme={theme}>
      <ListHeader $theme={theme}>
        <ListTitle $theme={theme}>
          <AccessibleEmoji emoji='🕒' label='Pendências' />
          Registros Pendentes ({pendingRecords.length})
        </ListTitle>
        <RefreshButton $theme={theme} onClick={loadPendingRecords}>
          <AccessibleEmoji emoji='🔄' label='Atualizar' />
          Atualizar
        </RefreshButton>
      </ListHeader>

      {pendingRecords.length === 0 ? (
        <EmptyState $theme={theme}>
          <AccessibleEmoji emoji='✅' label='Concluído' />
          <p>Não há registros pendentes para aprovação.</p>
        </EmptyState>
      ) : (
        <>
          <RecordDescription $theme={theme}>
            Registros que precisam de aprovação ou rejeição:
          </RecordDescription>

          {pendingRecords.map((record: any) => (
            <RecordItem key={record.id} $theme={theme}>
              <RecordHeader>
                <RecordType $theme={theme}>
                  <AccessibleEmoji emoji='📍' label='Registro' />
                  {getTypeLabel(record.tipo)}
                </RecordType>
                <RecordTime $theme={theme}>{formatTime(record.dataHora)}</RecordTime>
              </RecordHeader>

              <RecordDetails>
                <div>
                  <strong>Usuário:</strong> {record.usuario.nomeCompleto}
                </div>
                <div>
                  <strong>Email:</strong> {record.usuario.email}
                </div>
                <div>
                  <strong>Localização:</strong>{' '}
                  {record.endereco || 'Não informado'}
                </div>
                <div>
                  <strong>Precisão:</strong>{' '}
                  {record.precisao?.toFixed(0) || 'N/A'}m
                </div>
                {record.observacao && (
                  <div>
                    <strong>Observação:</strong> {record.observacao}
                  </div>
                )}
              </RecordDetails>

              <RecordActions>
                <ActionIcon
                  variant='approve'
                  size='medium'
                  onClick={() => handleApproval(record.id, 'approve')}
                  title='Aprovar'
                >
                  <span role='img' aria-label='Aprovar'>
                    ✅
                  </span>
                </ActionIcon>
                <ActionIcon
                  variant='reject'
                  size='medium'
                  onClick={() => handleApproval(record.id, 'reject')}
                  title='Rejeitar'
                >
                  <span role='img' aria-label='Rejeitar'>
                    ❌
                  </span>
                </ActionIcon>
              </RecordActions>
            </RecordItem>
          ))}
        </>
      )}
    </ListContainer>
  );
};

export default PendingRecordsList;
