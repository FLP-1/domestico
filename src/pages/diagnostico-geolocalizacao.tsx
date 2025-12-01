/* eslint-disable no-console, no-alert, jsx-a11y/accessible-emoji, react/no-unescaped-entities */
// src/pages/diagnostico-geolocalizacao.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useSmartGeolocation } from '@/hooks/useSmartGeolocation';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import type { Theme } from '../types/theme';
import { getThemeColor } from '../utils/themeHelpers';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { UnifiedButton } from '../components/unified';

const Section = styled.section.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    'transparent'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
`;

const SectionTitle = styled.h2.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.dark || props.$theme?.text?.dark || 'inherit'};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

// Button removido - usando UnifiedButton

const InfoBox = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    'transparent'};
  border-left: 4px solid
    ${props => getThemeColor(props.$theme, 'colors.primary', 'transparent')};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
`;

const ErrorBox = styled(InfoBox)<{ $theme?: any }>`
  border-left-color: ${props =>
    props.$theme?.colors?.status?.error?.border ||
    props.$theme?.status?.error?.border ||
    'transparent'};
  background: ${props =>
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    'transparent'};
`;

const SuccessBox = styled(InfoBox)<{ $theme?: any }>`
  border-left-color: ${props =>
    props.$theme?.colors?.status?.success?.border ||
    props.$theme?.status?.success?.border ||
    'transparent'};
  background: ${props =>
    props.$theme?.colors?.status?.success?.background ||
    props.$theme?.status?.success?.background ||
    'transparent'};
`;

const WarningBox = styled(InfoBox)<{ $theme?: any }>`
  border-left-color: ${props =>
    props.$theme?.colors?.status?.warning?.border ||
    props.$theme?.status?.warning?.border ||
    'transparent'};
  background: ${props =>
    props.$theme?.colors?.status?.warning?.background ||
    props.$theme?.status?.warning?.background ||
    'transparent'};
`;

const CodeBlock = styled.pre.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    'transparent'};
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  margin: 0.5rem 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const Card = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    'transparent'};
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.border?.light ||
      'transparent'};
`;

const Label = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  font-weight: bold;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const Value = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.dark || props.$theme?.text?.dark || 'inherit'};
  font-size: 1.1rem;
  word-break: break-all;
`;

const Link = styled.a.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  color: ${props => getThemeColor(props.$theme, 'colors.primary', 'inherit')};
  text-decoration: underline;
  word-break: break-all;

  &:hover {
    opacity: 0.9;
  }
`;

// Styled components para substituir estilos inline
const FlexContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatusSpan = styled.span.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $statusType: 'success' | 'error' | 'warning' | 'info'; $theme?: any }>`
  color: ${props => {
    const status = props.$theme?.colors?.status?.[props.$statusType];
    if (typeof status === 'object' && status && 'text' in status) {
      return String((status as any).text);
    }
    const altStatus = (props.$theme as any)?.status?.[props.$statusType];
    if (typeof altStatus === 'object' && altStatus && 'text' in altStatus) {
      return String((altStatus as any).text);
    }
    return 'inherit';
  }};
`;

const LinkWithMargin = styled(Link)`
  display: block;
  margin-top: 1rem;
`;

const BoxWithMargin = styled.div`
  margin-top: 1rem;
`;

const WarningBoxWithMargin = styled(WarningBox)`
  margin-top: 1rem;
`;

const ErrorBoxWithMargin = styled(ErrorBox)`
  margin-top: 1rem;
`;

const List = styled.ul`
  margin-top: 0.5rem;
  padding-left: 1.5rem;
`;

const SubList = styled.ul`
  margin-top: 0.25rem;
  padding-left: 1.5rem;
  font-size: 0.9rem;
`;

const OrderedList = styled.ol`
  margin-top: 0.5rem;
  padding-left: 1.5rem;
`;

const Paragraph = styled.p`
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

interface GPSInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  isRealGPS: boolean;
}

// Desabilitar prerendering - página requer navegador APIs
export const dynamic = 'force-dynamic';

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function DiagnosticoGeolocalizacao() {
  const { currentProfile } = useUserProfile();
  const profileRole = currentProfile?.role?.toLowerCase() || 'empregado';
  const themeObject = useTheme(profileRole);
  const theme: Theme =
    themeObject && themeObject.colors
      ? ({ colors: themeObject.colors } as Theme)
      : ({ colors: {} } as Theme);

  // Helper para acessar status.text de forma segura
  const getStatusText = (
    statusType: 'success' | 'error' | 'warning' | 'info'
  ): string => {
    const status = theme?.colors?.status?.[statusType];
    if (typeof status === 'object' && status && 'text' in status) {
      return String((status as any).text);
    }
    const altStatus = (theme as any)?.status?.[statusType];
    if (typeof altStatus === 'object' && altStatus && 'text' in altStatus) {
      return String((altStatus as any).text);
    }
    return 'inherit';
  };
  const [gpsInfo, setGpsInfo] = useState<GPSInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<{
    captured: { lat: number; lon: number };
    real: { lat: number; lon: number };
    distance: number;
  } | null>(null);
  const [userAgent, setUserAgent] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  const { captureLocation } = useSmartGeolocation({
    enableLogging: true,
    minAccuracy: 30,
  });

  const { lastLocation } = useGeolocationContext();

  // ✅ Prevenir erro de hidratação: só acessar navigator no cliente
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  // Coordenadas reais fornecidas pelo usuário
  const REAL_COORDINATES = useMemo(
    () => ({
      lat: -23.61426,
      lon: -46.633498,
    }),
    []
  );

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // Raio da Terra em metros
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distância em metros
    },
    []
  );

  const testGPS = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGpsInfo(null);
    setComparison(null);

    try {
      console.log('🔄 Iniciando teste de GPS...');

      // Capturar localização usando watchPosition diretamente para diagnóstico
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          let watchId: number | null = null;
          let bestPos: GeolocationPosition | null = null;
          let bestAccuracy = Infinity;
          let positionsReceived = 0;

          if (typeof window === 'undefined' || !navigator.geolocation) {
            reject(new Error('Geolocalização não disponível no servidor'));
            return;
          }

          const timeout = setTimeout(() => {
            if (watchId !== null) {
              navigator.geolocation.clearWatch(watchId);
            }
            if (bestPos) {
              resolve(bestPos);
            } else {
              reject(new Error('Timeout na captura de geolocalização'));
            }
          }, 30000);

          watchId = navigator.geolocation.watchPosition(
            pos => {
              positionsReceived++;
              console.log(`📍 Posição ${positionsReceived} recebida:`, {
                accuracy: Math.round(pos.coords.accuracy),
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                altitude: pos.coords.altitude,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              });

              if (pos.coords.accuracy < bestAccuracy) {
                bestPos = pos;
                bestAccuracy = pos.coords.accuracy;
              }

              // ✅ Aceitar se accuracy < 30m OU após 5 posições OU após 3 posições com accuracy < 200m
              if (
                pos.coords.accuracy < 30 ||
                positionsReceived >= 5 ||
                (positionsReceived >= 3 && bestPos && bestAccuracy < 200)
              ) {
                clearTimeout(timeout);
                if (watchId !== null) {
                  navigator.geolocation.clearWatch(watchId);
                }
                // ✅ Sempre usar a melhor posição recebida, mesmo que não seja perfeita
                resolve(bestPos!);
              }
            },
            err => {
              clearTimeout(timeout);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
              }
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 30000,
              maximumAge: 0,
            }
          );
        }
      );

      // ✅ GPS real: altitude/heading/speed OU alta precisão (< 50m)
      // Alta precisão indica GPS real mesmo sem altitude/heading/speed
      // Em desktop, mesmo com Windows Location Service, pode não ter altitude/heading/speed
      // Mas se accuracy melhorar ao longo do tempo (watchPosition), é GPS real
      const hasGPSIndicators = !!(
        position.coords.altitude ||
        position.coords.heading !== null ||
        position.coords.speed !== null
      );

      // ✅ Em desktop, precisão < 100m com enableHighAccuracy geralmente indica GPS/WiFi triangulation
      // Precisão > 1000m geralmente indica localização por IP (não GPS)
      const isHighAccuracy = position.coords.accuracy < 100;
      const isVeryLowAccuracy = position.coords.accuracy > 1000;

      // GPS real se tem indicadores OU se tem boa precisão (não é IP)
      const isRealGPS =
        hasGPSIndicators || (isHighAccuracy && !isVeryLowAccuracy);

      const info: GPSInfo = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        isRealGPS,
      };

      setGpsInfo(info);

      // Calcular distância das coordenadas reais
      const distance = calculateDistance(
        info.latitude,
        info.longitude,
        REAL_COORDINATES.lat,
        REAL_COORDINATES.lon
      );

      setComparison({
        captured: { lat: info.latitude, lon: info.longitude },
        real: REAL_COORDINATES,
        distance: Math.round(distance),
      });

      console.log('✅ Teste concluído:', info);
    } catch (err: any) {
      const errorMsg = err.message || 'Erro desconhecido';
      setError(errorMsg);
      console.error('❌ Erro no teste:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateDistance, REAL_COORDINATES]);

  const checkPermissions = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.permissions) {
      alert('API de Permissões não suportada neste navegador');
      return;
    }

    try {
      const result = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });
      console.log('Permissão de geolocalização:', result.state);
      alert(
        `Status da permissão: ${result.state}\n\nVerifique o console para mais detalhes.`
      );
    } catch (err) {
      console.error('Erro ao verificar permissões:', err);
      alert('Erro ao verificar permissões. Verifique o console.');
    }
  }, []);

  return (
    <PageContainer
      $theme={theme}
      variant='minimal'
      background='transparent'
      padding='lg'
      maxWidth='1200px'
      animation={true}
    >
      <PageHeader
        $theme={theme}
        title='🔍 Diagnóstico de Geolocalização'
        variant='default'
        size='lg'
        animation={true}
      />

      <Section $theme={theme}>
        <SectionTitle $theme={theme}>
          📍 Coordenadas Reais (Fornecidas)
        </SectionTitle>
        <CodeBlock $theme={theme}>
          Latitude: {REAL_COORDINATES.lat}
          Longitude: {REAL_COORDINATES.lon}
        </CodeBlock>
        <Link
          $theme={theme}
          href={`https://www.google.com/maps?q=${REAL_COORDINATES.lat},${REAL_COORDINATES.lon}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          Abrir no Google Maps
        </Link>
      </Section>

      <Section $theme={theme}>
        <SectionTitle $theme={theme}>🧪 Testes</SectionTitle>
        <FlexContainer>
          <UnifiedButton
            $theme={theme}
            onClick={testGPS}
            $disabled={loading}
            $variant='primary'
            $size='medium'
          >
            {loading ? '🔄 Testando GPS...' : '📍 Testar Captura GPS'}
          </UnifiedButton>
          <UnifiedButton
            $theme={theme}
            onClick={checkPermissions}
            $variant='secondary'
            $size='medium'
          >
            🔐 Verificar Permissões
          </UnifiedButton>
        </FlexContainer>
      </Section>

      {error && (
        <ErrorBox $theme={theme}>
          <strong>❌ Erro:</strong> {error}
        </ErrorBox>
      )}

      {gpsInfo && (
        <>
          <Section $theme={theme}>
            <SectionTitle $theme={theme}>📊 Resultado da Captura</SectionTitle>
            <Grid>
              <Card $theme={theme}>
                <Label $theme={theme}>Latitude</Label>
                <Value $theme={theme}>{gpsInfo.latitude}</Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Longitude</Label>
                <Value $theme={theme}>{gpsInfo.longitude}</Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Precisão</Label>
                <Value $theme={theme}>{Math.round(gpsInfo.accuracy)}m</Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Tipo de GPS</Label>
                <Value $theme={theme}>
                  {gpsInfo.isRealGPS ? (
                    <StatusSpan $statusType='success' $theme={theme}>
                      ✅ GPS Real
                    </StatusSpan>
                  ) : (
                    <StatusSpan $statusType='error' $theme={theme}>
                      ❌ Localização Aproximada
                    </StatusSpan>
                  )}
                </Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Altitude</Label>
                <Value $theme={theme}>
                  {gpsInfo.altitude !== null
                    ? `${Math.round(gpsInfo.altitude)}m`
                    : 'N/A'}
                </Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Heading</Label>
                <Value $theme={theme}>
                  {gpsInfo.heading !== null
                    ? `${Math.round(gpsInfo.heading)}°`
                    : 'N/A'}
                </Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Speed</Label>
                <Value $theme={theme}>
                  {gpsInfo.speed !== null
                    ? `${Math.round(gpsInfo.speed * 3.6)} km/h`
                    : 'N/A'}
                </Value>
              </Card>
              <Card $theme={theme}>
                <Label $theme={theme}>Timestamp</Label>
                <Value $theme={theme}>
                  {new Date(gpsInfo.timestamp).toLocaleString('pt-BR')}
                </Value>
              </Card>
            </Grid>
            <LinkWithMargin
              $theme={theme}
              href={`https://www.google.com/maps?q=${gpsInfo.latitude},${gpsInfo.longitude}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              Abrir coordenadas capturadas no Google Maps
            </LinkWithMargin>
          </Section>

          {comparison && (
            <Section $theme={theme}>
              <SectionTitle $theme={theme}>
                📏 Comparação com Coordenadas Reais
              </SectionTitle>
              <Grid>
                <Card $theme={theme}>
                  <Label $theme={theme}>Distância</Label>
                  <Value $theme={theme}>
                    {comparison.distance < 50 ? (
                      <StatusSpan $statusType='success' $theme={theme}>
                        ✅ {comparison.distance}m (Excelente)
                      </StatusSpan>
                    ) : comparison.distance < 200 ? (
                      <StatusSpan $statusType='warning' $theme={theme}>
                        ⚠️ {comparison.distance}m (Aceitável)
                      </StatusSpan>
                    ) : (
                      <StatusSpan $statusType='error' $theme={theme}>
                        ❌ {comparison.distance}m (Ruim)
                      </StatusSpan>
                    )}
                  </Value>
                </Card>
                <Card $theme={theme}>
                  <Label $theme={theme}>Coordenadas Capturadas</Label>
                  <Value $theme={theme}>
                    {comparison.captured.lat}, {comparison.captured.lon}
                  </Value>
                </Card>
                <Card $theme={theme}>
                  <Label $theme={theme}>Coordenadas Reais</Label>
                  <Value $theme={theme}>
                    {comparison.real.lat}, {comparison.real.lon}
                  </Value>
                </Card>
              </Grid>

              {comparison.distance > 200 && (
                <WarningBoxWithMargin $theme={theme}>
                  <strong>⚠️ Atenção:</strong> A distância entre as coordenadas
                  capturadas e reais é maior que 200m.
                  <br />
                  <strong>Possíveis causas:</strong>
                  <List>
                    <li>
                      GPS não está sendo usado (localização aproximada por
                      IP/WiFi)
                    </li>
                    <li>Permissões do navegador não permitem precisão alta</li>
                    <li>Windows Location Service desativado</li>
                    <li>Ambiente fechado sem sinal GPS</li>
                  </List>
                </WarningBoxWithMargin>
              )}

              {!gpsInfo.isRealGPS && (
                <ErrorBoxWithMargin $theme={theme}>
                  <strong>❌ Problema Identificado:</strong> O navegador não
                  está usando GPS real.
                  <br />
                  <br />
                  <strong>📊 Análise do Problema:</strong>
                  <List>
                    <li>
                      <strong>Precisão:</strong> {Math.round(gpsInfo.accuracy)}m
                    </li>
                    <li>
                      <strong>Altitude:</strong>{' '}
                      {gpsInfo.altitude !== null
                        ? `${Math.round(gpsInfo.altitude)}m`
                        : 'N/A'}
                    </li>
                    <li>
                      <strong>Heading:</strong>{' '}
                      {gpsInfo.heading !== null
                        ? `${Math.round(gpsInfo.heading)}°`
                        : 'N/A'}
                    </li>
                    <li>
                      <strong>Speed:</strong>{' '}
                      {gpsInfo.speed !== null
                        ? `${Math.round(gpsInfo.speed * 3.6)} km/h`
                        : 'N/A'}
                    </li>
                  </List>
                  <br />
                  <strong>🔧 Soluções Detalhadas:</strong>
                  <OrderedList>
                    <li>
                      <strong>1. Ativar Windows Location Service:</strong>
                      <SubList>
                        <li>
                          Pressione <code>Win + I</code> para abrir
                          Configurações
                        </li>
                        <li>
                          Vá em{' '}
                          <strong>Privacidade e segurança → Localização</strong>
                        </li>
                        <li>
                          Ative <strong>"Serviços de localização"</strong>
                        </li>
                        <li>
                          Ative{' '}
                          <strong>
                            "Permitir que aplicativos acessem sua localização"
                          </strong>
                        </li>
                        <li>
                          Na lista de aplicativos, encontre{' '}
                          <strong>Google Chrome</strong> ou{' '}
                          <strong>Microsoft Edge</strong>
                        </li>
                        <li>Ative o toggle para o navegador</li>
                        <li>
                          <strong>Reinicie o navegador</strong> após alterar
                          configurações
                        </li>
                      </SubList>
                    </li>
                    <li>
                      <strong>2. Verificar Permissões do Navegador:</strong>
                      <SubList>
                        <li>
                          Chrome:{' '}
                          <Link
                            $theme={theme}
                            href='chrome://settings/content/location'
                            target='_blank'
                          >
                            chrome://settings/content/location
                          </Link>
                        </li>
                        <li>
                          Edge:{' '}
                          <Link
                            $theme={theme}
                            href='edge://settings/content/location'
                            target='_blank'
                          >
                            edge://settings/content/location
                          </Link>
                        </li>
                        <li>
                          Verifique se <strong>"Precisão alta"</strong> está
                          ativada
                        </li>
                        <li>
                          Verifique se <strong>localhost:3000</strong> está em{' '}
                          <strong>"Permitir"</strong>
                        </li>
                        <li>
                          Se estiver em "Bloquear", remova e permita novamente
                        </li>
                      </SubList>
                    </li>
                    <li>
                      <strong>3. Verificar Hardware:</strong>
                      <SubList>
                        <li>
                          <strong>Desktop sem GPS:</strong> Precisão será sempre
                          limitada (50-200m com WiFi, 500m-5km com IP)
                        </li>
                        <li>
                          <strong>Laptop com WiFi:</strong> Pode ter precisão
                          melhor (50-200m) se Windows Location Service estiver
                          ativo
                        </li>
                        <li>
                          <strong>Dispositivo móvel:</strong> Tem GPS real e
                          pode ter precisão de 5-50m
                        </li>
                        <li>
                          Se precisão &gt; 1000m, provavelmente está usando
                          localização por IP (não GPS)
                        </li>
                      </SubList>
                    </li>
                    <li>
                      <strong>4. Testar em Ambiente Aberto:</strong>
                      <SubList>
                        <li>
                          Teste próximo a uma janela ou em ambiente aberto
                        </li>
                        <li>
                          Evite edifícios altos ou estruturas metálicas que
                          bloqueiam sinal
                        </li>
                        <li>Aguarde até 30 segundos para GPS estabilizar</li>
                      </SubList>
                    </li>
                    <li>
                      <strong>5. Comparar com Google Maps:</strong>
                      <SubList>
                        <li>
                          Abra{' '}
                          <Link
                            $theme={theme}
                            href='https://www.google.com/maps'
                            target='_blank'
                          >
                            Google Maps
                          </Link>
                        </li>
                        <li>Clique no botão de localização (🎯)</li>
                        <li>Compare a precisão com a capturada aqui</li>
                        <li>
                          Se Google Maps tiver melhor precisão, o problema pode
                          ser nas configurações do navegador
                        </li>
                      </SubList>
                    </li>
                  </OrderedList>
                  <br />
                  <strong>⚠️ Limitação Técnica:</strong>
                  <Paragraph>
                    Em <strong>desktop sem GPS físico</strong>, a precisão
                    máxima é limitada por WiFi triangulation (50-200m) ou
                    localização por IP (500m-5km). Para precisão melhor que 50m,
                    é necessário um dispositivo móvel com GPS real.
                  </Paragraph>
                </ErrorBoxWithMargin>
              )}
            </Section>
          )}
        </>
      )}

      <Section $theme={theme}>
        <SectionTitle $theme={theme}>ℹ️ Informações do Sistema</SectionTitle>
        <Grid>
          <Card $theme={theme}>
            <Label $theme={theme}>Navegador</Label>
            <Value $theme={theme}>
              {isMounted ? userAgent : 'Carregando...'}
            </Value>
          </Card>
          <Card $theme={theme}>
            <Label $theme={theme}>Geolocalização Suportada</Label>
            <Value $theme={theme}>
              {isMounted
                ? typeof window !== 'undefined' && navigator.geolocation
                  ? '✅ Sim'
                  : '❌ Não'
                : 'Carregando...'}
            </Value>
          </Card>
          <Card $theme={theme}>
            <Label $theme={theme}>Última Localização (Contexto)</Label>
            <Value $theme={theme}>
              {lastLocation ? (
                <>
                  {lastLocation.latitude}, {lastLocation.longitude}
                  <br />
                  <small>Precisão: {Math.round(lastLocation.accuracy)}m</small>
                </>
              ) : (
                'N/A'
              )}
            </Value>
          </Card>
        </Grid>
      </Section>

      <Section $theme={theme}>
        <SectionTitle $theme={theme}>📋 Checklist de Verificação</SectionTitle>
        <InfoBox $theme={theme}>
          <strong>1. Permissões do Navegador:</strong>
          <List>
            <li>Chrome: chrome://settings/content/location</li>
            <li>Verificar se "Precisão alta" está ativada</li>
            <li>Verificar se localhost:3000 está em "Permitir"</li>
          </List>
        </InfoBox>
        <InfoBox $theme={theme}>
          <strong>2. Windows Location Service (CRÍTICO para Desktop):</strong>
          <List>
            <li>
              <strong>Pressione Win + I</strong> para abrir Configurações
            </li>
            <li>
              Vá em <strong>Privacidade e segurança → Localização</strong>
            </li>
            <li>
              <strong>"Serviços de localização"</strong> deve estar{' '}
              <StatusSpan $statusType='success' $theme={theme}>
                ATIVADO
              </StatusSpan>
            </li>
            <li>
              <strong>
                "Permitir que aplicativos acessem sua localização"
              </strong>{' '}
              deve estar{' '}
              <StatusSpan $statusType='success' $theme={theme}>
                ATIVADO
              </StatusSpan>
            </li>
            <li>
              Na lista de aplicativos, encontre <strong>Google Chrome</strong>{' '}
              ou <strong>Microsoft Edge</strong>
            </li>
            <li>
              O toggle do navegador deve estar{' '}
              <StatusSpan $statusType='success' $theme={theme}>
                ATIVADO
              </StatusSpan>
            </li>
            <li>
              <strong>⚠️ IMPORTANTE:</strong> Reinicie o navegador após alterar
              essas configurações
            </li>
            <li>
              <strong>💡 DICA:</strong> Se não aparecer na lista, feche e abra o
              navegador novamente
            </li>
          </List>
        </InfoBox>
        <InfoBox $theme={theme}>
          <strong>3. Ambiente:</strong>
          <List>
            <li>Testar em ambiente aberto (melhor recepção GPS)</li>
            <li>Aguardar até 30 segundos para GPS estabilizar</li>
            <li>Evitar edifícios altos ou estruturas metálicas</li>
          </List>
        </InfoBox>
        <InfoBox $theme={theme}>
          <strong>4. Comparação com Google Maps:</strong>
          <List>
            <li>Abrir https://www.google.com/maps</li>
            <li>Clicar em "Minha localização" (🎯)</li>
            <li>Comparar coordenadas com as capturadas</li>
          </List>
        </InfoBox>
      </Section>
    </PageContainer>
  );
}
