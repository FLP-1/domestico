// Página de auditoria de geofencing
import React, { useState, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useGeofencingTheme } from '../../hooks/useGeofencingTheme';
import { geofencingColors } from '../../design-system/tokens/geofencing-colors';
import { UnifiedCard, UnifiedBadge, UnifiedMetaInfo } from '../../components/unified';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import type { Theme } from '../../types/theme';
import { getTextSecondary } from '../../utils/themeTypeGuards';

interface LogEntry {
  id: string;
  acao: string;
  dadosAnteriores: any;
  dadosNovos: any;
  ip: string;
  userAgent: string;
  usuario: {
    nomeCompleto: string;
  };
  timestamp: string;
  localTrabalho: {
    nome: string;
  };
}

interface ValidacaoEntry {
  id: string;
  latitude: number;
  longitude: number;
  distancia: number;
  dentroGeofence: boolean;
  precisao: number;
  endereco: string;
  wifiName: string;
  timestamp: string;
  usuario: {
    nomeCompleto: string;
  };
  localTrabalho: {
    nome: string;
  };
}

// Container, Header, Title e Subtitle removidos - usando PageContainer e PageHeader melhorados

const Tabs = styled.div<{ $theme?: Theme }>`
  display: flex;
  border-bottom: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border && (border as any).primary) || geofencingColors.border.primary;
    }};
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean; $theme?: Theme }>`
  background: none;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 2px solid
    ${props =>
      props.$active
        ? props.$theme?.colors?.navigation?.active ||
          geofencingColors.navigation.active
        : 'transparent'};
  color: ${props => {
    if (props.$active) {
      return props.$theme?.colors?.navigation?.active || geofencingColors.navigation.active;
    }
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
  font-weight: ${props => (props.$active ? 'bold' : 'normal')};

  &:hover {
    color: ${props =>
      props.$theme?.colors?.navigation?.hover ||
      geofencingColors.navigation.hover};
  }
`;

// Card, CardHeader, CardTitle removidos - usar UnifiedCard com title prop

const Timestamp = styled.span<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
  font-size: 14px;
`;

// CardContent removido - usar UnifiedMetaInfo com variant="grid"

// InfoItem, Label, Value removidos - usar UnifiedMetaInfo
// StatusBadge removido - usar UnifiedBadge

const Coordinates = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const background = props.$theme?.colors?.background;
    return (typeof background === 'object' && background && (background as any).secondary) || (typeof background === 'string' ? background : geofencingColors.background.secondary);
  }};
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 14px;
`;

const JsonData = styled.pre<{ $theme?: Theme }>`
  background: ${props => {
    const background = props.$theme?.colors?.background;
    return (typeof background === 'object' && background && (background as any).secondary) || (typeof background === 'string' ? background : geofencingColors.background.secondary);
  }};
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
`;

const Loading = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: 40px;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
`;

const Error = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const statusError = props.$theme?.colors?.status?.error;
    return (typeof statusError === 'object' && statusError && (statusError as any).background) || (typeof statusError === 'string' ? statusError : geofencingColors.status.error.background);
  }};
  color: ${props => {
    const statusError = props.$theme?.colors?.status?.error;
    return (typeof statusError === 'object' && statusError && (statusError as any).text) || (typeof statusError === 'string' ? statusError : geofencingColors.status.error.text);
  }};
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const FilterBar = styled.div<{ $theme?: Theme }>`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
`;

const Select = styled.select<{ $theme?: Theme }>`
  padding: 8px 12px;
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border && (border as any).primary) || geofencingColors.border.primary;
    }};
  border-radius: 5px;
  font-size: 14px;
`;

const Input = styled.input<{ $theme?: Theme }>`
  padding: 8px 12px;
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border && (border as any).primary) || geofencingColors.border.primary;
    }};
  border-radius: 5px;
  font-size: 14px;
`;

const Button = styled.button<{ $theme?: Theme }>`
  background: ${props =>
    props.$theme?.colors?.button?.primary?.background ||
    geofencingColors.button.primary.background};
  color: ${props =>
    props.$theme?.colors?.button?.primary?.text ||
    geofencingColors.button.primary.text};
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.button?.primary?.hover ||
      geofencingColors.button.primary.hover};
  }
`;

const EmptyState = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: 40px;
`;

const EmptyStateTitle = styled.h3<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || geofencingColors.text.primary;
  }};
  margin: 0 0 10px 0;
`;

const EmptyStateText = styled.p<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || geofencingColors.text.secondary;
  }};
  margin: 0;
`;

// UserAgentValue e JsonSectionLabel removidos - não necessários com UnifiedMetaInfo
const JsonSection = styled.div<{ $theme?: Theme }>`
  margin-bottom: 15px;
`;

export default function AuditoriaGeofencing() {
  // TODO: Implementar autenticação adequada
  // const { data: session } = useSession();
  const router = useRouter();
  const themeObject = useGeofencingTheme();
  const theme = { colors: themeObject.colors };
  const themeLoading = themeObject.loading;
  const themeError = themeObject.error;
  const [activeTab, setActiveTab] = useState<'logs' | 'validacoes'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [validacoes, setValidacoes] = useState<ValidacaoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    acao: '',
    dataInicio: '',
    dataFim: '',
    usuario: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'logs') {
        const response = await fetch('/api/geofencing/auditoria/logs');
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs || []);
        } else {
          setError('Erro ao carregar logs');
        }
      } else {
        const response = await fetch('/api/geofencing/auditoria/validacoes');
        if (response.ok) {
          const data = await response.json();
          setValidacoes(data.validacoes || []);
        } else {
          setError('Erro ao carregar validações');
        }
      }
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // TODO: Implementar autenticação adequada
    // if (!session) {
    //   router.push('/login');
    //   return;
    // }

    loadData();
  }, [loadData]); // loadData já inclui activeTab nas dependências

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatAction = (acao: string) => {
    const actions = {
      CREATE: 'Criado',
      UPDATE: 'Atualizado',
      DELETE: 'Excluído',
      VALIDATE: 'Validado',
    };
    return actions[acao as keyof typeof actions] || acao;
  };

  // Loading state para tema
  if (themeLoading || !theme) {
    return (
      <PageContainer
        $theme={theme}
        variant="minimal"
        background="transparent"
        padding="lg"
        maxWidth="1200px"
      >
        <Loading $theme={theme}>
          Carregando tema...
        </Loading>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer
        $theme={theme}
        variant="minimal"
        background="transparent"
        padding="lg"
        maxWidth="1200px"
      >
        <Loading $theme={theme}>Carregando dados de auditoria...</Loading>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      $theme={theme}
      variant="minimal"
      background="transparent"
      padding="lg"
      maxWidth="1200px"
      animation={true}
    >
      <PageHeader
        $theme={theme}
        title={
          <>
            <span role='img' aria-label='audit'>
              🔍
            </span>{' '}
            Auditoria de Geofencing
          </>
        }
        subtitle="Logs e validações do sistema de geofencing"
        variant="default"
        animation={true}
      />

      {error && <Error $theme={theme}>{error}</Error>}

      <Tabs $theme={theme}>
        <Tab
          $active={activeTab === 'logs'}
          $theme={theme}
          onClick={() => setActiveTab('logs')}
        >
          <span role='img' aria-label='logs'>
            📝
          </span>{' '}
          Logs de Ações
        </Tab>
        <Tab
          $active={activeTab === 'validacoes'}
          $theme={theme}
          onClick={() => setActiveTab('validacoes')}
        >
          <span role='img' aria-label='validations'>
            ✅
          </span>{' '}
          Validações
        </Tab>
      </Tabs>

      <FilterBar>
        <Select
          $theme={theme}
          value={filters.acao}
          onChange={(e: any) =>
            setFilters({ ...filters, acao: e.target.value })
          }
          aria-label='Filtrar por ação'
        >
          <option value=''>Todas as ações</option>
          <option value='CREATE'>Criado</option>
          <option value='UPDATE'>Atualizado</option>
          <option value='DELETE'>Excluído</option>
          <option value='VALIDATE'>Validado</option>
        </Select>

        <Input
          $theme={theme}
          type='date'
          value={filters.dataInicio}
          onChange={(e: any) =>
            setFilters({ ...filters, dataInicio: e.target.value })
          }
          placeholder='Data início'
        />

        <Input
          $theme={theme}
          type='date'
          value={filters.dataFim}
          onChange={(e: any) =>
            setFilters({ ...filters, dataFim: e.target.value })
          }
          placeholder='Data fim'
        />

        <Button $theme={theme} onClick={loadData}>
          <span role='img' aria-label='search'>
            🔍
          </span>{' '}
          Filtrar
        </Button>
      </FilterBar>

      {activeTab === 'logs' ? (
        logs.length === 0 ? (
          <UnifiedCard theme={theme} variant='default' size='md'>
            <EmptyState $theme={theme}>
              <EmptyStateTitle $theme={theme}>
                Nenhum log encontrado
              </EmptyStateTitle>
              <EmptyStateText $theme={theme}>
                Os logs de auditoria aparecerão aqui quando houver ações no
                sistema.
              </EmptyStateText>
            </EmptyState>
          </UnifiedCard>
        ) : (
          logs.map((log: any) => (
            <UnifiedCard
              key={log.id}
              theme={theme}
              variant='default'
              size='md'
              title={`${formatAction(log.acao)} - ${log.localTrabalho.nome}`}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <Timestamp $theme={theme}>
                  {formatDate(log.timestamp)}
                </Timestamp>
              </div>

              <UnifiedMetaInfo
                items={[
                  { label: 'Usuário', value: log.usuario.nomeCompleto },
                  { label: 'IP', value: log.ip },
                  { label: 'User Agent', value: log.userAgent },
                  { label: 'Local de Trabalho', value: log.localTrabalho.nome },
                ]}
                variant="grid"
                size="sm"
                theme={theme}
              />

              {log.dadosAnteriores && (
                <JsonSection>
                  <h4 style={{ 
                    color: getTextSecondary(theme),
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    marginTop: 0,
                    fontSize: '14px'
                  }}>
                    Dados Anteriores:
                  </h4>
                  <JsonData $theme={theme}>
                    {JSON.stringify(log.dadosAnteriores, null, 2)}
                  </JsonData>
                </JsonSection>
              )}

              {log.dadosNovos && (
                <JsonSection>
                  <h4 style={{ 
                    color: getTextSecondary(theme),
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    marginTop: 0,
                    fontSize: '14px'
                  }}>
                    Dados Novos:
                  </h4>
                  <JsonData $theme={theme}>
                    {JSON.stringify(log.dadosNovos, null, 2)}
                  </JsonData>
                </JsonSection>
              )}
            </UnifiedCard>
          ))
        )
      ) : validacoes.length === 0 ? (
        <UnifiedCard theme={theme} variant='default' size='md'>
          <EmptyState $theme={theme}>
            <EmptyStateTitle $theme={theme}>
              Nenhuma validação encontrada
            </EmptyStateTitle>
            <EmptyStateText $theme={theme}>
              As validações de geofencing aparecerão aqui quando houver
              registros de ponto.
            </EmptyStateText>
          </EmptyState>
        </UnifiedCard>
      ) : (
        validacoes.map((validacao: any) => (
          <UnifiedCard
            key={validacao.id}
            theme={theme}
            variant='default'
            size='md'
            title={`Validação - ${validacao.localTrabalho.nome}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <Timestamp $theme={theme}>
                {formatDate(validacao.timestamp)}
              </Timestamp>
            </div>

            <UnifiedMetaInfo
              items={[
                { label: 'Usuário', value: validacao.usuario.nomeCompleto },
                { 
                  label: 'Status', 
                  value: (
                    <UnifiedBadge 
                      variant={validacao.dentroGeofence ? 'success' : 'error'} 
                      size="sm" 
                      theme={theme}
                    >
                      {validacao.dentroGeofence
                        ? 'Dentro do Geofence'
                        : 'Fora do Geofence'}
                    </UnifiedBadge>
                  )
                },
                { label: 'Distância', value: `${Math.round(validacao.distancia)}m` },
                { label: 'Precisão', value: `${Math.round(validacao.precisao)}m` },
                { 
                  label: 'Coordenadas', 
                  value: (
                    <Coordinates>
                      Lat: {validacao.latitude.toFixed(8)}
                      <br />
                      Lon: {validacao.longitude.toFixed(8)}
                    </Coordinates>
                  )
                },
                { label: 'Endereço', value: validacao.endereco || 'Não disponível' },
                { label: 'WiFi', value: validacao.wifiName || 'Não disponível' },
              ]}
              variant="grid"
              size="sm"
              theme={theme}
            />
          </UnifiedCard>
        ))
      )}
    </PageContainer>
  );
}
