// src/components/NetworkDebugInfo/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { networkFingerprintingService } from '../../services/antifraude/network-fingerprinting';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useNetworkDetection } from '../../hooks/useNetworkDetection';

interface DebugInfo {
  timestamp: string;
  networkDetection: any;
  fingerprint: any;
  analysis: any;
}

const DebugContainer = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.secondary) ||
        props.$theme?.border?.secondary ||
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.8rem;
`;

const DebugSection = styled.div<{ $theme?: any }>`
  margin-bottom: 1rem;

  h4 {
    color: ${props =>
      props.$theme?.colors?.text?.secondary ||
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.text ||
      'inherit'};
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }

  pre {
    background: ${props =>
      props.$theme?.colors?.background?.primary ||
      props.$theme?.background?.primary ||
      props.$theme?.colors?.surface ||
      'transparent'};
    border: 1px solid
      ${props => {
        const border = props.$theme?.colors?.border;
        return (
          (typeof border === 'object' && border?.primary) ||
          props.$theme?.border?.primary ||
          (typeof border === 'object' && border?.light) ||
          props.$theme?.border?.light ||
          'transparent'
        );
      }};
    border-radius: 4px;
    padding: 0.5rem;
    margin: 0;
    overflow-x: auto;
    white-space: pre-wrap;
  }
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
  }
`;

const NetworkDebugInfo: React.FC = () => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Hook unificado de detecção de rede (inclui SSID real)
  const { detectNetworkInfo, refreshRealSSID } = useNetworkDetection({
    enableLogging: false,
    enableRealSSID: true,
    updateInterval: 0,
  });

  const collectDebugInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const baseNetworkInfo = detectNetworkInfo();
      let ssidInfo: any = {};

      if (refreshRealSSID) {
        const ssidData = await refreshRealSSID();
        ssidInfo = {
          realSSID: ssidData.ssid,
          ssidPlatform: ssidData.platform,
          ssidError: ssidData.error || null,
        };
      }

      // Gerar fingerprint
      const fingerprint =
        await networkFingerprintingService.generateNetworkFingerprint();

      // Análise de rede
      const analysis =
        await networkFingerprintingService.analyzeNetwork(fingerprint);

      const info: DebugInfo = {
        timestamp: new Date().toISOString(),
        networkDetection: {
          ...baseNetworkInfo,
          ...ssidInfo,
        },
        fingerprint: fingerprint,
        analysis: analysis,
      };

      setDebugInfo(info);
    } catch (err: any) {
      setError(err.message || 'Erro ao coletar informações');
    } finally {
      setLoading(false);
    }
  }, [detectNetworkInfo, refreshRealSSID]);

  useEffect(() => {
    // ✅ Debounce para evitar múltiplas chamadas simultâneas
    const timeoutId = setTimeout(() => {
      collectDebugInfo();
    }, 1000); // Aguardar 1 segundo antes de coletar

    return () => clearTimeout(timeoutId);
  }, [collectDebugInfo]);

  if (error) {
    return (
      <DebugContainer $theme={theme}>
        <h3>
          <span role='img' aria-label='Erro'>
            ❌
          </span>{' '}
          Erro ao Coletar Dados de Rede
        </h3>
        <p>{error}</p>
        <RefreshButton $theme={theme} onClick={collectDebugInfo}>
          Tentar Novamente
        </RefreshButton>
      </DebugContainer>
    );
  }

  return (
    <DebugContainer $theme={theme}>
      <h3>
        <span role='img' aria-label='Lupa'>
          🔍
        </span>{' '}
        Dados de Rede Capturados Automaticamente
      </h3>

      <RefreshButton
        $theme={theme}
        onClick={collectDebugInfo}
        disabled={loading}
      >
        {loading ? (
          'Coletando...'
        ) : (
          <>
            <span role='img' aria-label='Atualizar'>
              🔄
            </span>{' '}
            Atualizar Dados
          </>
        )}
      </RefreshButton>

      {debugInfo && (
        <>
          <DebugSection $theme={theme}>
            <h4>
              <span role='img' aria-label='Sinal'>
                📶
              </span>{' '}
              Detecção de Rede (useNetworkDetection)
            </h4>
            <pre>{JSON.stringify(debugInfo.networkDetection, null, 2)}</pre>
          </DebugSection>

          <DebugSection $theme={theme}>
            <h4>
              <span role='img' aria-label='Lupa'>
                🔍
              </span>{' '}
              Fingerprint de Rede (networkFingerprintingService)
            </h4>
            <pre>{JSON.stringify(debugInfo.fingerprint, null, 2)}</pre>
          </DebugSection>

          <DebugSection $theme={theme}>
            <h4>
              <span role='img' aria-label='Escudo'>
                🛡️
              </span>{' '}
              Análise de Risco e Antifraude
            </h4>
            <pre>{JSON.stringify(debugInfo.analysis, null, 2)}</pre>
          </DebugSection>

          <DebugSection $theme={theme}>
            <h4>
              <span role='img' aria-label='Localização'>
                📍
              </span>{' '}
              Dados de Endereço
            </h4>
            <pre>
              {JSON.stringify(
                {
                  endereco: debugInfo.fingerprint?.address || 'Não disponível',
                  coordenadas: {
                    latitude:
                      debugInfo.fingerprint?.latitude || 'Não disponível',
                    longitude:
                      debugInfo.fingerprint?.longitude || 'Não disponível',
                  },
                  precisao: debugInfo.fingerprint?.accuracy || 'Não disponível',
                },
                null,
                2
              )}
            </pre>
          </DebugSection>

          <DebugSection $theme={theme}>
            <h4>
              <span role='img' aria-label='Sinal'>
                📶
              </span>{' '}
              SSID Real do Sistema Operacional (Integrado)
            </h4>
            <pre>
              {JSON.stringify(
                {
                  realSSID:
                    debugInfo.networkDetection?.realSSID || 'Não detectado',
                  ssidPlatform:
                    debugInfo.networkDetection?.ssidPlatform || 'desconhecido',
                  ssidLoading: debugInfo.networkDetection?.ssidLoading || false,
                  ssidError: debugInfo.networkDetection?.ssidError || null,
                  wifiName:
                    debugInfo.networkDetection?.wifiName || 'Não detectado',
                  connectionType:
                    debugInfo.networkDetection?.connectionType ||
                    'desconhecido',
                },
                null,
                2
              )}
            </pre>
          </DebugSection>
        </>
      )}
    </DebugContainer>
  );
};

export default NetworkDebugInfo;
