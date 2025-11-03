// Página de auditoria de geofencing
import React, { useState, useEffect, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useGeofencingTheme } from '../../hooks/useGeofencingTheme';
import { geofencingColors } from '../../design-system/tokens/geofencing-colors';

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

const Container = styled.div<{ $theme?: any }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div<{ $theme?: any }>`
  margin-bottom: 30px;
`;

const Title = styled.h1<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.primary || geofencingColors.text.primary};
  margin: 0 0 10px 0;
`;

const Subtitle = styled.p<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary};
  margin: 0;
`;

const Tabs = styled.div<{ $theme?: any }>`
  display: flex;
  border-bottom: 1px solid ${props => props.$theme?.colors?.border?.primary || geofencingColors.border.primary};
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean; $theme?: any }>`
  background: none;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active 
    ? (props.$theme?.colors?.navigation?.active || geofencingColors.navigation.active) 
    : 'transparent'};
  color: ${props => props.$active 
    ? (props.$theme?.colors?.navigation?.active || geofencingColors.navigation.active)
    : (props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary)};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  
  &:hover {
    color: ${props => props.$theme?.colors?.navigation?.hover || geofencingColors.navigation.hover};
  }
`;

const Card = styled.div<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.background?.primary || geofencingColors.background.primary};
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const CardHeader = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CardTitle = styled.h3<{ $theme?: any }>`
  margin: 0;
  color: ${props => props.$theme?.colors?.text?.primary || geofencingColors.text.primary};
`;

const Timestamp = styled.span<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary};
  font-size: 14px;
`;

const CardContent = styled.div<{ $theme?: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.span<{ $theme?: any }>`
  font-weight: bold;
  color: ${props => props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary};
  font-size: 14px;
`;

const Value = styled.span<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.primary || geofencingColors.text.primary};
  font-size: 16px;
`;

const StatusBadge = styled.span<{ $success: boolean; $theme?: any }>`
  background: ${props => props.$success 
    ? (props.$theme?.colors?.status?.success?.background || geofencingColors.status.success.background)
    : (props.$theme?.colors?.status?.error?.background || geofencingColors.status.error.background)};
  color: ${props => props.$success 
    ? (props.$theme?.colors?.status?.success?.text || geofencingColors.status.success.text)
    : (props.$theme?.colors?.status?.error?.text || geofencingColors.status.error.text)};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const Coordinates = styled.div<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.background?.secondary || geofencingColors.background.secondary};
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 14px;
`;

const JsonData = styled.pre<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.background?.secondary || geofencingColors.background.secondary};
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
`;

const Loading = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 40px;
  color: ${props => props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary};
`;

const Error = styled.div<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.status?.error?.background || geofencingColors.status.error.background};
  color: ${props => props.$theme?.colors?.status?.error?.text || geofencingColors.status.error.text};
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const FilterBar = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
`;

const Select = styled.select<{ $theme?: any }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$theme?.colors?.border?.primary || geofencingColors.border.primary};
  border-radius: 5px;
  font-size: 14px;
`;

const Input = styled.input<{ $theme?: any }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$theme?.colors?.border?.primary || geofencingColors.border.primary};
  border-radius: 5px;
  font-size: 14px;
`;

const Button = styled.button<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.button?.primary?.background || geofencingColors.button.primary.background};
  color: ${props => props.$theme?.colors?.button?.primary?.text || geofencingColors.button.primary.text};
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.$theme?.colors?.button?.primary?.hover || geofencingColors.button.primary.hover};
  }
`;

const EmptyState = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 40px;
`;

const EmptyStateTitle = styled.h3<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.primary || geofencingColors.text.primary};
  margin: 0 0 10px 0;
`;

const EmptyStateText = styled.p<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary};
  margin: 0;
`;

const UserAgentValue = styled(Value)<{ $theme?: any }>`
  font-size: 12px;
  word-break: break-all;
`;

const JsonSection = styled.div<{ $theme?: any }>`
  margin-bottom: 15px;
`;

const JsonSectionLabel = styled(Label)<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.text?.secondary || geofencingColors.text.secondary};
  font-weight: bold;
  font-size: 14px;
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
    usuario: ''
  });

  useEffect(() => {
    // TODO: Implementar autenticação adequada
    // if (!session) {
    //   router.push('/login');
    //   return;
    // }
    
    loadData();
  }, [activeTab, filters, router, loadData]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatAction = (acao: string) => {
    const actions = {
      'CREATE': 'Criado',
      'UPDATE': 'Atualizado',
      'DELETE': 'Excluído',
      'VALIDATE': 'Validado'
    };
    return actions[acao as keyof typeof actions] || acao;
  };

  // Loading state para tema
  if (themeLoading || !theme) {
    return (
      <Container>
        <Loading $theme={theme || { colors: { text: { secondary: '#666' } } }}>Carregando tema...</Loading>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Loading $theme={theme}>Carregando dados de auditoria...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title $theme={theme}><span role="img" aria-label="audit">🔍</span> Auditoria de Geofencing</Title>
        <Subtitle $theme={theme}>Logs e validações do sistema de geofencing</Subtitle>
      </Header>

      {error && <Error $theme={theme}>{error}</Error>}

      <Tabs $theme={theme}>
        <Tab 
          $active={activeTab === 'logs'} 
          $theme={theme}
          onClick={() => setActiveTab('logs')}
        >
          <span role="img" aria-label="logs">📝</span> Logs de Ações
        </Tab>
        <Tab 
          $active={activeTab === 'validacoes'} 
          $theme={theme}
          onClick={() => setActiveTab('validacoes')}
        >
          <span role="img" aria-label="validations">✅</span> Validações
        </Tab>
      </Tabs>

      <FilterBar>
        <Select
          $theme={theme}
          value={filters.acao}
          onChange={(e: any) => setFilters({ ...filters, acao: e.target.value })}
          aria-label="Filtrar por ação"
        >
          <option value="">Todas as ações</option>
          <option value="CREATE">Criado</option>
          <option value="UPDATE">Atualizado</option>
          <option value="DELETE">Excluído</option>
          <option value="VALIDATE">Validado</option>
        </Select>
        
        <Input
          $theme={theme}
          type="date"
          value={filters.dataInicio}
          onChange={(e: any) => setFilters({ ...filters, dataInicio: e.target.value })}
          placeholder="Data início"
        />
        
        <Input
          $theme={theme}
          type="date"
          value={filters.dataFim}
          onChange={(e: any) => setFilters({ ...filters, dataFim: e.target.value })}
          placeholder="Data fim"
        />
        
        <Button $theme={theme} onClick={loadData}>
          <span role="img" aria-label="search">🔍</span> Filtrar
        </Button>
      </FilterBar>

      {activeTab === 'logs' ? (
        logs.length === 0 ? (
          <Card $theme={theme}>
            <EmptyState $theme={theme}>
              <EmptyStateTitle $theme={theme}>Nenhum log encontrado</EmptyStateTitle>
              <EmptyStateText $theme={theme}>Os logs de auditoria aparecerão aqui quando houver ações no sistema.</EmptyStateText>
            </EmptyState>
          </Card>
        ) : (
          logs.map((log: any) => (
            <Card key={log.id} $theme={theme}>
              <CardHeader>
                <CardTitle $theme={theme}>
                  {formatAction(log.acao)} - {log.localTrabalho.nome}
                </CardTitle>
                <Timestamp $theme={theme}>{formatDate(log.timestamp)}</Timestamp>
              </CardHeader>
              
              <CardContent>
                <InfoItem>
                  <Label $theme={theme}>Usuário</Label>
                  <Value $theme={theme}>{log.usuario.nomeCompleto}</Value>
                </InfoItem>
                
                <InfoItem>
                  <Label $theme={theme}>IP</Label>
                  <Value $theme={theme}>{log.ip}</Value>
                </InfoItem>
                
                <InfoItem>
                  <Label $theme={theme}>User Agent</Label>
                  <UserAgentValue $theme={theme}>
                    {log.userAgent}
                  </UserAgentValue>
                </InfoItem>
                
                <InfoItem>
                  <Label>Local de Trabalho</Label>
                  <Value>{log.localTrabalho.nome}</Value>
                </InfoItem>
              </CardContent>
              
              {log.dadosAnteriores && (
                <JsonSection>
                  <JsonSectionLabel $theme={theme}>Dados Anteriores:</JsonSectionLabel>
                  <JsonData $theme={theme}>
                    {JSON.stringify(log.dadosAnteriores, null, 2)}
                  </JsonData>
                </JsonSection>
              )}
              
              {log.dadosNovos && (
                <JsonSection>
                  <JsonSectionLabel $theme={theme}>Dados Novos:</JsonSectionLabel>
                  <JsonData $theme={theme}>
                    {JSON.stringify(log.dadosNovos, null, 2)}
                  </JsonData>
                </JsonSection>
              )}
            </Card>
          ))
        )
      ) : (
        validacoes.length === 0 ? (
          <Card $theme={theme}>
            <EmptyState $theme={theme}>
              <EmptyStateTitle $theme={theme}>Nenhuma validação encontrada</EmptyStateTitle>
              <EmptyStateText $theme={theme}>As validações de geofencing aparecerão aqui quando houver registros de ponto.</EmptyStateText>
            </EmptyState>
          </Card>
        ) : (
          validacoes.map((validacao: any) => (
            <Card key={validacao.id}>
              <CardHeader>
                <CardTitle>
                  Validação - {validacao.localTrabalho.nome}
                </CardTitle>
                <Timestamp>{formatDate(validacao.timestamp)}</Timestamp>
              </CardHeader>
              
              <CardContent>
                <InfoItem>
                  <Label>Usuário</Label>
                  <Value>{validacao.usuario.nomeCompleto}</Value>
                </InfoItem>
                
                <InfoItem>
                  <Label>Status</Label>
                  <StatusBadge $success={validacao.dentroGeofence}>
                    {validacao.dentroGeofence ? 'Dentro do Geofence' : 'Fora do Geofence'}
                  </StatusBadge>
                </InfoItem>
                
                <InfoItem>
                  <Label>Distância</Label>
                  <Value>{Math.round(validacao.distancia)}m</Value>
                </InfoItem>
                
                <InfoItem>
                  <Label>Precisão</Label>
                  <Value>{Math.round(validacao.precisao)}m</Value>
                </InfoItem>
                
                <InfoItem>
                  <Label>Coordenadas</Label>
                  <Coordinates>
                    Lat: {validacao.latitude.toFixed(8)}<br/>
                    Lon: {validacao.longitude.toFixed(8)}
                  </Coordinates>
                </InfoItem>
                
                <InfoItem>
                  <Label>Endereço</Label>
                  <Value>{validacao.endereco || 'Não disponível'}</Value>
                </InfoItem>
                
                <InfoItem>
                  <Label>WiFi</Label>
                  <Value>{validacao.wifiName || 'Não disponível'}</Value>
                </InfoItem>
              </CardContent>
            </Card>
          ))
        )
      )}
    </Container>
  );
}
