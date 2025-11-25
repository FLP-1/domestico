/**
 * Dashboard de Monitoramento Antifraude
 * Página administrativa para visualizar estatísticas e riscos
 */

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../types/theme';
import { getTextSecondary, getTextDark } from '../../utils/themeTypeGuards';
import { getBackgroundSecondary } from '../../utils/themeTypeGuards';
import { useUserProfile } from '../../contexts/UserProfileContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => getBackgroundSecondary(props.theme)};
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => getTextDark(props.theme)};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => getTextSecondary(props.theme)};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{
  variant?: 'success' | 'warning' | 'danger' | 'info';
  $theme?: any;
}>`
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.05)`;
      }
    }
    return 'none';
  }};
  border-left: 4px solid
    ${props => {
      switch (props.variant) {
        case 'success':
          return props.$theme?.colors?.status?.success?.border ||
                 props.$theme?.status?.success?.border ||
                 'transparent';
        case 'warning':
          return props.$theme?.colors?.status?.warning?.border ||
                 props.$theme?.status?.warning?.border ||
                 'transparent';
        case 'danger':
          return props.$theme?.colors?.status?.error?.border ||
                 props.$theme?.status?.error?.border ||
                 'transparent';
        case 'info':
          return props.$theme?.colors?.status?.info?.border ||
                 props.$theme?.status?.info?.border ||
                 'transparent';
        default:
          return props.$theme?.colors?.border?.light || 
                 props.$theme?.border?.light ||
                 'transparent';
      }
    }};
`;

const StatLabel = styled.div<{ $theme?: any }>`
  font-size: 0.875rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div<{ $theme?: any }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
`;

const StatSubtext = styled.div<{ $theme?: any }>`
  font-size: 0.75rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
  margin-top: 0.25rem;
`;

const Section = styled.div<{ $theme?: any }>`
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.05)`;
      }
    }
    return 'none';
  }};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => getTextDark(props.theme)};
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th<{ $theme?: any }>`
  text-align: left;
  padding: 0.75rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary ||
    'transparent'};
  border-bottom: 2px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    'transparent'};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
`;

const Td = styled.td<{ $theme?: any }>`
  padding: 0.75rem;
  border-bottom: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    'transparent'};
  font-size: 0.875rem;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
`;

const Badge = styled.span<{
  variant?: 'success' | 'warning' | 'danger' | 'info';
  $theme?: any;
}>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.variant) {
      case 'success':
        return props.$theme?.colors?.status?.success?.background ||
               props.$theme?.status?.success?.background ||
               'transparent';
      case 'warning':
        return props.$theme?.colors?.status?.warning?.background ||
               props.$theme?.status?.warning?.background ||
               'transparent';
      case 'danger':
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               'transparent';
      case 'info':
        return props.$theme?.colors?.status?.info?.background ||
               props.$theme?.status?.info?.background ||
               'transparent';
      default:
        return props.$theme?.colors?.background?.secondary || 
               props.$theme?.background?.secondary ||
               'transparent';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'success':
        return props.$theme?.colors?.status?.success?.text ||
               props.$theme?.status?.success?.text ||
               'inherit';
      case 'warning':
        return props.$theme?.colors?.status?.warning?.text ||
               props.$theme?.status?.warning?.text ||
               'inherit';
      case 'danger':
        return props.$theme?.colors?.status?.error?.text ||
               props.$theme?.status?.error?.text ||
               'inherit';
      case 'info':
        return props.$theme?.colors?.status?.info?.text ||
               props.$theme?.status?.info?.text ||
               'inherit';
      default:
        return props.$theme?.colors?.text?.dark || 
               props.$theme?.text?.dark ||
               'inherit';
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ErrorContainer = styled.div<{ $theme?: any }>`
  background: ${props => 
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    'transparent'};
  color: ${props => 
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    'inherit'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

interface Estatisticas {
  totais: {
    analises: number;
    analisesHoje: number;
    analisesSemana: number;
    dispositivosUnicos: number;
    ipsUnicos: number;
  };
  deteccoes: {
    altoRisco: number;
    bloqueadas: number;
    dispositivosNovos: number;
    ipsNovos: number;
    vpns: number;
    bots: number;
    velocidadesImpossiveis: number;
  };
  taxas: {
    bloqueio: number;
    altoRisco: number;
  };
  distribuicao: {
    porNivelRisco: Array<{ nivel: string; quantidade: number }>;
  };
  topIPs: Array<{
    ipAddress: string;
    vezesVisto: number;
    pais: string | null;
    cidade: string | null;
    isVPN: boolean;
    isProxy: boolean;
    isDatacenter: boolean;
    bloqueado: boolean;
  }>;
}

export default function AntifaudeDashboard() {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function carregarEstatisticas() {
      try {
        const response = await fetch('/api/antifraude/estatisticas');

        if (!response.ok) {
          throw new Error('Falha ao carregar estatísticas');
        }

        const data = await response.json();
        setEstatisticas(data.estatisticas);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setErro(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setCarregando(false);
      }
    }

    carregarEstatisticas();
  }, []);

  if (carregando) {
    return (
      <PageContainer $theme={theme}>
        <LoadingContainer>
          <div>Carregando estatísticas...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (erro || !estatisticas) {
    return (
      <PageContainer $theme={theme}>
        <ErrorContainer $theme={theme}>
          <strong>Erro:</strong>{' '}
          {erro || 'Não foi possível carregar as estatísticas'}
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Antifraude - DOM</title>
      </Head>

      <PageContainer $theme={theme}>
        <Header $theme={theme}>
          <Title $theme={theme}>
            <span role='img' aria-label='Escudo'>
              🛡️
            </span>{' '}
            Dashboard Antifraude
          </Title>
          <Subtitle $theme={theme}>
            Monitoramento em tempo real de segurança e detecção de fraudes
          </Subtitle>
        </Header>

        <StatsGrid>
          <StatCard variant='info' $theme={theme}>
            <StatLabel $theme={theme}>Total de Análises</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.totais.analises.toLocaleString()}
            </StatValue>
            <StatSubtext $theme={theme}>
              {estatisticas.totais.analisesHoje} hoje •{' '}
              {estatisticas.totais.analisesSemana} esta semana
            </StatSubtext>
          </StatCard>

          <StatCard variant='danger' $theme={theme}>
            <StatLabel $theme={theme}>Alto Risco</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.deteccoes.altoRisco.toLocaleString()}
            </StatValue>
            <StatSubtext $theme={theme}>
              {estatisticas.taxas.altoRisco.toFixed(2)}% do total
            </StatSubtext>
          </StatCard>

          <StatCard variant='warning' $theme={theme}>
            <StatLabel $theme={theme}>Bloqueadas</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.deteccoes.bloqueadas.toLocaleString()}
            </StatValue>
            <StatSubtext $theme={theme}>
              {estatisticas.taxas.bloqueio.toFixed(2)}% taxa de bloqueio
            </StatSubtext>
          </StatCard>

          <StatCard variant='success' $theme={theme}>
            <StatLabel $theme={theme}>Dispositivos Únicos</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.totais.dispositivosUnicos.toLocaleString()}
            </StatValue>
            <StatSubtext $theme={theme}>
              {estatisticas.deteccoes.dispositivosNovos} novos recentemente
            </StatSubtext>
          </StatCard>
        </StatsGrid>

        <StatsGrid>
          <StatCard $theme={theme}>
            <StatLabel $theme={theme}>VPNs Detectadas</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.deteccoes.vpns.toLocaleString()}
            </StatValue>
          </StatCard>

          <StatCard $theme={theme}>
            <StatLabel $theme={theme}>Bots Detectados</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.deteccoes.bots.toLocaleString()}
            </StatValue>
          </StatCard>

          <StatCard $theme={theme}>
            <StatLabel $theme={theme}>IPs Únicos</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.totais.ipsUnicos.toLocaleString()}
            </StatValue>
          </StatCard>

          <StatCard $theme={theme}>
            <StatLabel $theme={theme}>Velocidades Impossíveis</StatLabel>
            <StatValue $theme={theme}>
              {estatisticas.deteccoes.velocidadesImpossiveis.toLocaleString()}
            </StatValue>
          </StatCard>
        </StatsGrid>

        <Section $theme={theme}>
          <SectionTitle $theme={theme}>Distribuição por Nível de Risco</SectionTitle>
          <Table $theme={theme}>
            <thead>
              <tr>
                <Th $theme={theme}>Nível</Th>
                <Th $theme={theme}>Quantidade</Th>
                <Th $theme={theme}>Porcentagem</Th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.distribuicao.porNivelRisco.map(item => {
                const porcentagem = (
                  (item.quantidade / estatisticas.totais.analises) *
                  100
                ).toFixed(2);
                let variant: 'success' | 'info' | 'warning' | 'danger' = 'info';

                if (item.nivel === 'BAIXO') variant = 'success';
                else if (item.nivel === 'MEDIO') variant = 'warning';
                else if (item.nivel === 'ALTO' || item.nivel === 'CRITICO')
                  variant = 'danger';

                return (
                  <tr key={item.nivel}>
                    <Td $theme={theme}>
                      <Badge variant={variant} $theme={theme}>{item.nivel}</Badge>
                    </Td>
                    <Td $theme={theme}>{item.quantidade.toLocaleString()}</Td>
                    <Td $theme={theme}>{porcentagem}%</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Section>

        <Section $theme={theme}>
          <SectionTitle $theme={theme}>Top 10 IPs Mais Vistos</SectionTitle>
          <Table $theme={theme}>
            <thead>
              <tr>
                <Th $theme={theme}>IP</Th>
                <Th $theme={theme}>Localização</Th>
                <Th $theme={theme}>Visitas</Th>
                <Th $theme={theme}>Tipo</Th>
                <Th $theme={theme}>Status</Th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.topIPs.map(ip => (
                <tr key={ip.ipAddress}>
                  <Td $theme={theme}>{ip.ipAddress}</Td>
                  <Td $theme={theme}>
                    {ip.cidade && ip.pais ? `${ip.cidade}, ${ip.pais}` : 'N/D'}
                  </Td>
                  <Td $theme={theme}>{ip.vezesVisto.toLocaleString()}</Td>
                  <Td $theme={theme}>
                    {ip.isVPN && <Badge variant='warning' $theme={theme}>VPN</Badge>}
                    {ip.isProxy && <Badge variant='warning' $theme={theme}>Proxy</Badge>}
                    {ip.isDatacenter && (
                      <Badge variant='info' $theme={theme}>Datacenter</Badge>
                    )}
                    {!ip.isVPN && !ip.isProxy && !ip.isDatacenter && (
                      <Badge variant='success' $theme={theme}>Normal</Badge>
                    )}
                  </Td>
                  <Td $theme={theme}>
                    {ip.bloqueado ? (
                      <Badge variant='danger' $theme={theme}>Bloqueado</Badge>
                    ) : (
                      <Badge variant='success' $theme={theme}>Permitido</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </PageContainer>
    </>
  );
}
