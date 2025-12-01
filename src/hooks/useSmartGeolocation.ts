import { useEffect, useCallback, useRef, useState } from 'react';
import { useGeolocationContext } from '../contexts/GeolocationContext';
import { useNetworkDetection } from './useNetworkDetection';
import { logger } from '../utils/logger';
import { getGeocodingConfig } from '../config/geolocation-config';

// Função para calcular distância entre duas coordenadas (em metros)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
}

// 🚫 COORDENADAS HARDCODED REMOVIDAS - SISTEMA DINÂMICO

interface SmartGeolocationOptions {
  updateIntervalMinutes?: number; // Intervalo para atualização periódica
  enablePageLoadUpdate?: boolean; // Atualizar ao carregar página
  enablePeriodicUpdate?: boolean; // Atualização periódica
  enableLogging?: boolean;
  minAccuracy?: number; // Precisão mínima aceitável (metros)
  maxAge?: number; // Idade máxima dos dados (milissegundos)
}

export const useSmartGeolocation = (options: SmartGeolocationOptions = {}) => {
  const {
    updateIntervalMinutes = 5,
    enablePageLoadUpdate = true,
    enablePeriodicUpdate = true,
    enableLogging = false,
    minAccuracy = 100, // 100 metros de precisão mínima
    maxAge = 5 * 60 * 1000, // 5 minutos
  } = options;

  const { updateLastLocationIfBetter, lastLocation } = useGeolocationContext();
  const { wifiName, realSSID } = useNetworkDetection({
    enableLogging: false,
    enableRealSSID: true,
    updateInterval: 30000, // 30 segundos
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCaptureRef = useRef<Date | null>(null);
  const isInitialLoadRef = useRef(true);

  // Função para capturar geolocalização com validação e tentativas múltiplas
  const captureLocation = useCallback(
    async (source: string = 'manual') => {
      if (isCapturing) {
        if (enableLogging) {
          logger.log(`⏳ Captura já em andamento, pulando ${source}`);
        }
        return;
      }

      // Verificar se os dados atuais ainda são válidos
      if (lastLocation && lastCaptureRef.current) {
        const dataAge = Date.now() - lastCaptureRef.current.getTime();
        const isRecent = dataAge < maxAge;
        const isAccurate = lastLocation.accuracy <= minAccuracy;

        if (isRecent && isAccurate) {
          if (enableLogging) {
            logger.log(
              `✅ Dados atuais ainda válidos (${Math.round(dataAge / 1000)}s, ${Math.round(lastLocation.accuracy)}m)`
            );
          }
          return;
        }
      }

      setIsCapturing(true);

      try {
        if (enableLogging) {
          logger.log(`🔄 Capturando geolocalização (${source})`);
        }

        // Verificar se a geolocalização está disponível
        if (!navigator.geolocation) {
          if (enableLogging) {
            logger.log('❌ Geolocalização não suportada pelo navegador');
          }
          return;
        }

        // 🎯 TENTATIVAS MÚLTIPLAS para melhorar precisão
        let bestPosition: GeolocationPosition | null = null;
        let bestAccuracy = Infinity;
        const maxAttempts = 5; // Mais tentativas para melhor precisão

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          if (enableLogging) {
            logger.log(`🔄 Tentativa ${attempt}/${maxAttempts} de captura`);
          }

          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve: any, reject: any) => {
                // ✅ FORÇAR GPS REAL: Usar watchPosition temporariamente
                // watchPosition força uso de GPS em vez de cache/IP
                let watchId: number | null = null;
                let bestPos: GeolocationPosition | null = null;
                let bestAccuracy = Infinity;
                let positionsReceived = 0;

                const watchTimeout = setTimeout(() => {
                  if (watchId !== null) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null; // ✅ Marcar como limpo
                  }
                  // Se recebeu pelo menos uma posição, usar a melhor
                  if (bestPos) {
                    resolve(bestPos);
                  } else {
                    reject(new Error('Timeout na captura de geolocalização'));
                  }
                }, 30000); // 30 segundos para GPS estabilizar

                watchId = navigator.geolocation.watchPosition(
                  (pos: any) => {
                    positionsReceived++;

                    // ✅ Verificar se é GPS real (tem altitude ou movimento)
                    // ✅ GPS real: altitude/heading/speed OU alta precisão (< 50m)
                    // Alta precisão indica GPS real mesmo sem altitude/heading/speed
                    const isRealGPS = !!(
                      pos.coords.altitude ||
                      pos.coords.heading !== null ||
                      pos.coords.speed !== null ||
                      pos.coords.accuracy < 50 // ✅ Alta precisão também indica GPS real
                    );

                    if (enableLogging && positionsReceived <= 3) {
                      logger.log(
                        `🔄 Captura GPS (tentativa ${attempt}, posição ${positionsReceived}):`,
                        {
                          accuracy: Math.round(pos.coords.accuracy),
                          isRealGPS,
                          altitude: pos.coords.altitude,
                          heading: pos.coords.heading,
                          speed: pos.coords.speed,
                          lat: pos.coords.latitude,
                          lon: pos.coords.longitude,
                        }
                      );
                    }

                    // ✅ Aceitar GPS real OU se accuracy for boa (< 100m para permitir WiFi triangulation)
                    // ✅ Rejeitar apenas localizações muito ruins (IP) que têm accuracy > 1000m
                    if (isRealGPS || pos.coords.accuracy < 100) {
                      // Atualizar melhor posição apenas se for melhor
                      if (pos.coords.accuracy < bestAccuracy) {
                        bestPos = pos;
                        bestAccuracy = pos.coords.accuracy;

                        // ✅ Se accuracy muito boa (< 30m), aceitar imediatamente
                        if (pos.coords.accuracy < 30) {
                          clearTimeout(watchTimeout);
                          if (watchId !== null) {
                            navigator.geolocation.clearWatch(watchId);
                            watchId = null; // ✅ Marcar como limpo
                          }
                          resolve(pos);
                          return;
                        }
                      }
                    } else {
                      if (enableLogging && positionsReceived <= 3) {
                        logger.log(
                          `⚠️ Localização muito ruim detectada (accuracy: ${Math.round(pos.coords.accuracy)}m), rejeitando...`
                        );
                      }
                    }

                    // ✅ Após 3 posições recebidas (reduzido de 5), usar a melhor se accuracy < 100m
                    // Isso permite atualização mais rápida ao clicar no card ou mudar de página
                    if (
                      positionsReceived >= 3 &&
                      bestPos &&
                      bestAccuracy < 100
                    ) {
                      clearTimeout(watchTimeout);
                      if (watchId !== null) {
                        navigator.geolocation.clearWatch(watchId);
                        watchId = null; // ✅ Marcar como limpo
                      }
                      resolve(bestPos);
                    }
                  },
                  (error: any) => {
                    clearTimeout(watchTimeout);
                    if (watchId !== null) {
                      navigator.geolocation.clearWatch(watchId);
                      watchId = null; // ✅ Marcar como limpo
                    }
                    reject(error);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 0, // Forçar nova captura sempre
                  }
                );
              }
            );

            // Verificar se esta é a melhor posição até agora
            if (position.coords.accuracy < bestAccuracy) {
              bestPosition = position;
              bestAccuracy = position.coords.accuracy;

              if (enableLogging) {
                logger.log(
                  `✅ Nova melhor posição: ${Math.round(position.coords.accuracy)}m`
                );
              }
            }

            // Se já temos precisão suficiente, parar
            if (position.coords.accuracy <= minAccuracy) {
              if (enableLogging) {
                logger.log(
                  `🎯 Precisão ideal alcançada: ${Math.round(position.coords.accuracy)}m`
                );
              }
              break;
            }

            // Aguardar um pouco antes da próxima tentativa
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            if (enableLogging) {
              logger.log(`⚠️ Erro na tentativa ${attempt}:`, error);
            }
          }
        }

        if (!bestPosition) {
          if (enableLogging) {
            logger.log('❌ Falha em todas as tentativas de captura');
          }
          return;
        }

        const position = bestPosition;

        // Verificar se a precisão é aceitável
        if (position.coords.accuracy > minAccuracy) {
          if (enableLogging) {
            logger.log(
              `⚠️ Precisão insuficiente: ${Math.round(position.coords.accuracy)}m (mínimo: ${minAccuracy}m)`
            );
          }

          // 🎯 FALLBACK INTELIGENTE: Tentar com precisão menor se for registro crítico
          if (source === 'manual' || source === 'critical') {
            const fallbackAccuracy = minAccuracy * 2; // Dobrar a tolerância
            if (position.coords.accuracy <= fallbackAccuracy) {
              if (enableLogging) {
                logger.log(
                  `🔄 Usando fallback: precisão ${Math.round(position.coords.accuracy)}m (tolerância: ${fallbackAccuracy}m)`
                );
              }
              // Continuar com precisão menor
            } else {
              if (enableLogging) {
                logger.log(
                  `❌ Precisão muito baixa mesmo com fallback: ${Math.round(position.coords.accuracy)}m`
                );
              }
              // 🎯 INTEGRAÇÃO COM SISTEMA EXISTENTE: O modal de override será ativado pelo backend
              if (enableLogging) {
                logger.log(
                  `🎯 Precisão insuficiente - sistema de override será ativado pelo backend`
                );
              }
              return;
            }
          } else {
            return;
          }
        }

        // 🎯 VALIDAÇÃO DINÂMICA DE 50M COM MODAL
        // Validar se está dentro do raio de 50m dos locais cadastrados
        let dentroDoRaio = false;
        let localMaisProximo = null;
        let distanciaMinima = Infinity;

        try {
          const geofencingResponse = await fetch('/api/geofencing/validar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              precisao: position.coords.accuracy,
              endereco: 'Endereço indisponível na captura',
              wifiName: realSSID || wifiName,
            }),
          });

          if (geofencingResponse.ok) {
            const geofencingData = await geofencingResponse.json();
            dentroDoRaio = geofencingData.dentroGeofence;
            localMaisProximo = geofencingData.localMaisProximo;
            distanciaMinima = geofencingData.distanciaMinima || Infinity;

            if (enableLogging) {
              logger.log(
                `🎯 Validação geofencing: ${dentroDoRaio ? 'DENTRO' : 'FORA'} do raio`
              );
              if (localMaisProximo) {
                logger.log(
                  `📏 Local mais próximo: ${localMaisProximo.nome} (${localMaisProximo.distancia}m)`
                );
              }
            }
          } else {
            if (enableLogging) {
              logger.log(
                `⚠️ Validação geofencing indisponível - aceitando coordenadas`
              );
            }
            dentroDoRaio = true; // Aceitar se API falhar
          }
        } catch (error: unknown) {
          if (enableLogging) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logger.log(
              `⚠️ Erro na validação geofencing: ${errorMessage} - aceitando coordenadas`
            );
          }
          dentroDoRaio = true; // Aceitar se houver erro
        }

        // 🚫 SE FORA DO RAIO DE 50M, REJEITAR E ABRIR MODAL
        if (!dentroDoRaio) {
          if (enableLogging) {
            logger.log(
              `🚫 Coordenadas fora do raio autorizado - modal de aprovação será aberto`
            );
          }

          // Disparar evento para abrir modal de aprovação
          const eventoAprovacao = new CustomEvent(
            'geofencing-requer-aprovacao',
            {
              detail: {
                coordenadas: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  precisao: position.coords.accuracy,
                },
                localMaisProximo: localMaisProximo,
                distanciaMinima: distanciaMinima,
                endereco: 'Endereço indisponível na captura',
              },
            }
          );

          window.dispatchEvent(eventoAprovacao);
          return; // Rejeitar coordenadas fora do raio
        }

        if (enableLogging) {
          logger.log(
            `✅ Coordenadas aprovadas: ${position.coords.latitude}, ${position.coords.longitude}`
          );
          logger.log(`📏 Precisão: ${Math.round(position.coords.accuracy)}m`);
        }

        // Obter endereço via geocoding com máxima precisão
        let address = 'Endereço indisponível na captura';
        let addressComponents = null;
        let hasNumber = false;

        try {
          const geocodingConfig = getGeocodingConfig();
          const response = await fetch(
            `/api/geocoding/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=${geocodingConfig.zoom}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              if (data.formattedAddress) {
                address = data.formattedAddress;
              } else if (data.address) {
                address = data.address;
              }

              if (data.components) {
                addressComponents = data.components;
                hasNumber = !!(
                  data.components.number || data.components.house_number
                );
              }
            }
          }
        } catch (error) {
          if (enableLogging) {
            logger.log('⚠️ Erro ao obter endereço via geocoding:', error);
          }
        }

        // Atualizar contexto com dados completos
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address,
          addressComponents,
          hasNumber,
          wifiName: realSSID || wifiName,
          timestamp: new Date(),
        };

        // ✅ Log para debug: verificar coordenadas capturadas e fonte GPS
        if (enableLogging) {
          const gpsInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            latPrecision:
              position.coords.latitude.toString().split('.')[1]?.length || 0,
            lonPrecision:
              position.coords.longitude.toString().split('.')[1]?.length || 0,
            // ✅ Indicadores de GPS real vs localização aproximada
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString(),
            // ✅ Diagnóstico: GPS real tem altitude/heading/speed OU alta precisão (< 50m)
            isRealGPS: !!(
              position.coords.altitude ||
              position.coords.heading !== null ||
              position.coords.speed !== null ||
              position.coords.accuracy < 50 // ✅ Alta precisão também indica GPS real
            ),
            address: address.substring(0, 50),
          };

          logger.log('📍 Coordenadas capturadas:', gpsInfo);

          // ⚠️ Alerta se precisão muito baixa
          if (position.coords.accuracy > 100) {
            logger.log(
              '⚠️ ATENÇÃO: Precisão muito baixa (>100m). Possíveis causas:'
            );
            logger.log('  - GPS não está conseguindo precisão suficiente');
            logger.log('  - Navegador usando localização aproximada (IP/WiFi)');
            logger.log('  - Ambiente fechado ou com interferência');
            logger.log(
              '  - Permissões do navegador não permitem precisão alta'
            );
          }
        }

        updateLastLocationIfBetter(locationData);
        lastCaptureRef.current = new Date();

        if (enableLogging) {
          logger.log(`✅ Captura ${source} concluída:`, {
            address: address.substring(0, 50) + '...',
            hasNumber,
            accuracy: `${Math.round(position.coords.accuracy)}m`,
            wifiName: realSSID || wifiName,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        if (enableLogging) {
          logger.log(`❌ Erro na captura ${source}:`, error);
        }
      } finally {
        setIsCapturing(false);
      }
    },
    [
      updateLastLocationIfBetter,
      enableLogging,
      minAccuracy,
      maxAge,
      wifiName,
      realSSID,
      isCapturing,
      lastLocation,
    ]
  );

  // Atualização ao carregar página - REMOVIDO para evitar violação de política de geolocalização
  // Geolocalização deve ser solicitada apenas em resposta a interação do usuário
  // useEffect(() => {
  //   if (enablePageLoadUpdate && isInitialLoadRef.current) {
  //     isInitialLoadRef.current = false;
  //     // ❌ REMOVIDO: Causa violação "[Violation] Only request geolocation information in response to a user gesture."
  //     // setTimeout(() => {
  //     //   captureLocation('page_load');
  //     // }, 1000);
  //   }
  // }, [enablePageLoadUpdate, captureLocation]);

  // Atualização periódica - REMOVIDO para evitar violação de política de geolocalização
  // Geolocalização deve ser solicitada apenas em resposta a interação do usuário
  // useEffect(() => {
  //   if (enablePeriodicUpdate && updateIntervalMinutes > 0) {
  //     intervalRef.current = setInterval(() => {
  //       // ❌ REMOVIDO: Causa violação "[Violation] Only request geolocation information in response to a user gesture."
  //       // captureLocation('periodic');
  //     }, updateIntervalMinutes * 60 * 1000);

  //     return () => {
  //       if (intervalRef.current) {
  //         clearInterval(intervalRef.current);
  //       }
  //     };
  //   }
  // }, [enablePeriodicUpdate, updateIntervalMinutes, captureLocation]);

  // Função para forçar captura (usada antes de registrar ponto)
  const forceCapture = useCallback(async () => {
    await captureLocation('forced');
  }, [captureLocation]);

  // Função para verificar se os dados são recentes
  const isDataRecent = useCallback(() => {
    if (!lastCaptureRef.current) return false;
    const dataAge = Date.now() - lastCaptureRef.current.getTime();
    return dataAge < maxAge;
  }, [maxAge]);

  // Função para verificar se os dados são precisos
  const isDataAccurate = useCallback(() => {
    if (!lastLocation) return false;
    return lastLocation.accuracy <= minAccuracy;
  }, [lastLocation, minAccuracy]);

  return {
    captureLocation: forceCapture,
    isCapturing,
    isDataRecent: isDataRecent(),
    isDataAccurate: isDataAccurate(),
    lastCapture: lastCaptureRef.current,
    canCapture: !isCapturing,
  };
};

export default useSmartGeolocation;
