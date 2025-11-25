import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from 'react';
// ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
// A geolocalização será solicitada apenas quando necessário (checkbox de termos, ações do usuário)
// import { useGeolocation } from '../hooks/useGeolocation';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  addressComponents?: {
    street?: string;
    road?: string;
    number?: string;
    house_number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  wifiName?: string;
  networkInfo?: {
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  timestamp: Date;
}

export interface CaptureStatusMeta {
  approved?: boolean;
  pending?: boolean;
  overrideUsed?: boolean;
  imprecise?: boolean;
  reason?: string;
  serverRecordId?: string;
}

interface GeolocationContextType {
  /** Melhor leitura recente (maior precisão) para UI */
  lastLocation: GeolocationData | null;
  setLastLocation: (location: GeolocationData) => void;
  updateLastLocationIfBetter: (location: GeolocationData) => void;

  /** Última leitura usada com sucesso em um registro persistido */
  lastCaptureLocation: GeolocationData | null;
  setLastCaptureLocation: (location: GeolocationData) => void;
  lastCaptureStatus?: CaptureStatusMeta | null;
  setLastCaptureStatus?: (status: CaptureStatusMeta | null) => void;
}

const GeolocationContext = createContext<GeolocationContextType>({
  lastLocation: null,
  setLastLocation: () => {},
  updateLastLocationIfBetter: () => {},
  lastCaptureLocation: null,
  setLastCaptureLocation: () => {},
  lastCaptureStatus: null,
  setLastCaptureStatus: () => {},
});

export const useGeolocationContext = () => useContext(GeolocationContext);

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [lastLocation, setLastLocation] = useState<GeolocationData | null>(
    null
  );
  const [lastCaptureLocation, setLastCaptureLocation] =
    useState<GeolocationData | null>(null);
  const [lastCaptureStatus, setLastCaptureStatus] =
    useState<CaptureStatusMeta | null>(null);

  // ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
  // A geolocalização será solicitada apenas quando necessário (checkbox de termos, ações do usuário)
  // const { getCurrentPosition, location: currentLocation } = useGeolocation();

  const updateLastLocationIfBetter = useCallback(
    (location: GeolocationData) => {
      // ✅ SEMPRE atualizar se não há localização anterior OU se a nova é mais recente
      // Não manter cache de coordenadas antigas que podem estar em local diferente
      if (!lastLocation) {
        console.log('📍 Primeira localização, salvando:', {
          lat: location.latitude,
          lon: location.longitude,
          accuracy: location.accuracy,
        });
        setLastLocation(location);
        return;
      }
      
      // ✅ Se a nova localização é muito mais recente (> 5 minutos), sempre atualizar
      // Isso garante que após login, a localização capturada seja usada
      const timeDiff = location.timestamp.getTime() - lastLocation.timestamp.getTime();
      if (timeDiff > 5 * 60 * 1000) { // 5 minutos
        console.log('📍 Localização muito mais recente (>5min), atualizando:', {
          lat: location.latitude,
          lon: location.longitude,
          accuracy: location.accuracy,
          timeDiff: Math.round(timeDiff / 1000) + 's',
        });
        setLastLocation(location);
        return;
      }

      const isNewer =
        location.timestamp.getTime() >= lastLocation.timestamp.getTime();
      const isMoreAccurate = location.accuracy <= lastLocation.accuracy;
      
      // ✅ Calcular distância entre coordenadas antigas e novas
      // Se a distância for > 100m, sempre atualizar (mudou de local)
      const R = 6371e3; // Raio da Terra em metros
      const φ1 = (lastLocation.latitude * Math.PI) / 180;
      const φ2 = (location.latitude * Math.PI) / 180;
      const Δφ = ((location.latitude - lastLocation.latitude) * Math.PI) / 180;
      const Δλ = ((location.longitude - lastLocation.longitude) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = R * c; // Distância em metros

      // ✅ Se mudou de local (> 100m), atualizar APENAS se nova localização for melhor
      // Não aceitar coordenadas ruins (accuracy > 1000m) se já temos uma boa
      if (distancia > 100) {
        // ✅ Se a última localização era muito precisa (< 200m) e a nova é ruim (> 1000m), não atualizar
        if (lastLocation.accuracy < 200 && location.accuracy > 1000) {
          console.log('📍 Ignorando coordenada ruim após ter recebido coordenada precisa:', {
            distancia: Math.round(distancia),
            antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
            nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
          });
          return;
        }
        
        // ✅ Se a nova localização é MELHOR (mais precisa), atualizar
        // ✅ Não aceitar coordenadas menos precisas mesmo que mudou de local
        if (location.accuracy < lastLocation.accuracy) {
          console.log('📍 Localização mudou significativamente (>100m) e nova é MELHOR, atualizando:', {
            distancia: Math.round(distancia),
            antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
            nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
          });
          setLastLocation(location);
          return;
        } else {
          console.log('📍 Ignorando coordenada menos precisa após mudança de local:', {
            distancia: Math.round(distancia),
            antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
            nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
          });
          return;
        }
      }

      // Se não mudou de local, usar lógica de precisão
      // ✅ Se a nova localização é mais recente E mais precisa, sempre atualizar
      if (isNewer && isMoreAccurate) {
        console.log('📍 Localização mais recente e mais precisa, atualizando:', {
          antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
          nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
        });
        setLastLocation(location);
        return;
      }
      
      // ✅ Se a nova localização é mais recente mas menos precisa, atualizar se não for muito pior (< 2x pior)
      // Isso permite que a localização seja atualizada quando o usuário muda de página ou clica no card
      if (isNewer && !isMoreAccurate) {
        // Se a nova não é muito pior (< 2x pior), atualizar (pode ser GPS melhorando)
        if (location.accuracy <= lastLocation.accuracy * 2) {
          console.log('📍 Localização mais recente (não muito pior), atualizando:', {
            antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
            nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
          });
          setLastLocation(location);
          return;
        } else {
          console.log('📍 Ignorando localização muito menos precisa:', {
            antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
            nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
          });
          return;
        }
      }
      
      // ✅ Se a nova localização é mais precisa mas mais antiga, atualizar (GPS melhorou)
      if (!isNewer && isMoreAccurate) {
        console.log('📍 Localização mais precisa (mesmo que mais antiga), atualizando:', {
          antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
          nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
        });
        setLastLocation(location);
        return;
      }
      
      // Se não atende nenhum critério, não atualizar
      console.log('📍 Ignorando localização (não atende critérios):', {
        antiga: { lat: lastLocation.latitude, lon: lastLocation.longitude, accuracy: Math.round(lastLocation.accuracy) },
        nova: { lat: location.latitude, lon: location.longitude, accuracy: Math.round(location.accuracy) },
        isNewer,
        isMoreAccurate,
      });
    },
    [lastLocation]
  );

  // ✅ Geolocalização automática desabilitada - será solicitada apenas quando necessário
  // useEffect(() => {
  //   const captureLocation = async () => {
  //     try {
  //       await getCurrentPosition({
  //         enableHighAccuracy: true,
  //         timeout: 15000,
  //         maximumAge: 300000
  //       });
  //     } catch (error) {
  //       console.warn('Erro ao capturar localização inicial:', error);
  //     }
  //   };

  //   captureLocation();
  // }, [getCurrentPosition]);

  // ❌ REMOVIDO: Atualização automática quando currentLocation muda
  // Isso pode estar causando solicitação automática de permissão
  // A geolocalização será atualizada apenas quando explicitamente solicitada
  // useEffect(() => {
  //   if (currentLocation) {
  //     updateLastLocationIfBetter(currentLocation);
  //   }
  // }, [currentLocation, updateLastLocationIfBetter]);

  // ✅ Rastrear primeira interação do usuário (para evitar violação de política)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    // ❌ Não detectar primeira interação na página de login - permissão será solicitada no checkbox
    // ❌ Não detectar primeira interação na página principal (/) - permissão será solicitada no checkbox de login
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
      return;
    }

    // ✅ Detectar primeira interação do usuário (click, touch, keypress)
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
    };

    // Adicionar listeners para detectar primeira interação
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // ✅ Ref para evitar múltiplas capturas simultâneas
  const isCapturingRef = useRef(false);

  // ✅ Função para capturar localização de forma segura usando watchPosition (força GPS real)
  const captureLocationSafely = useCallback(async () => {
    // ❌ Não capturar se usuário ainda não interagiu - viola política do navegador
    if (!hasUserInteracted) {
      return;
    }

    // ❌ Não capturar na página de login - permissão será solicitada no checkbox
    // ❌ Não capturar na página principal (/) - permissão será solicitada no checkbox de login
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
      return;
    }

    // ❌ Evitar múltiplas capturas simultâneas
    if (isCapturingRef.current) {
      return;
    }

    isCapturingRef.current = true;

    try {
      // ✅ Usar watchPosition para forçar GPS real (não IP/WiFi aproximado)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        let watchId: number | null = null;
        let bestPos: GeolocationPosition | null = null;
        let bestAccuracy = Infinity;
        let positionsReceived = 0;
        
        const watchTimeout = setTimeout(() => {
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }
          if (bestPos) {
            resolve(bestPos);
          } else {
            reject(new Error('Timeout na captura de geolocalização'));
          }
        }, 30000); // 30 segundos para GPS estabilizar

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            positionsReceived++;
            
            // ✅ Aceitar apenas se accuracy for boa (< 200m) - ignorar coordenadas ruins (IP)
            // Não atualizar bestPos se accuracy > 1000m (localização por IP)
            if (pos.coords.accuracy < 1000 && pos.coords.accuracy < bestAccuracy) {
              bestPos = pos;
              bestAccuracy = pos.coords.accuracy;
              
              // Se accuracy muito boa (< 50m), aceitar imediatamente
              if (pos.coords.accuracy < 50) {
                clearTimeout(watchTimeout);
                if (watchId !== null) {
                  navigator.geolocation.clearWatch(watchId);
                  watchId = null;
                }
                resolve(pos);
                return;
              }
            }
            
            // Após 3 posições recebidas, usar a melhor se accuracy < 200m
            // ✅ Não aceitar se accuracy > 1000m (localização por IP)
            if (positionsReceived >= 3 && bestPos && bestAccuracy < 200) {
              clearTimeout(watchTimeout);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
              }
              resolve(bestPos);
            }
          },
          (error) => {
            clearTimeout(watchTimeout);
            if (watchId !== null) {
              navigator.geolocation.clearWatch(watchId);
              watchId = null;
            }
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0, // Forçar nova captura sempre
          }
        );
      });
      
      // Obter endereço via geocoding
      let address = 'Endereço indisponível';
      let addressComponents = null;
      
      try {
        const geocodingResponse = await fetch(
          `/api/geocoding/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18`
        );
        if (geocodingResponse.ok) {
          const geocodingData = await geocodingResponse.json();
          if (geocodingData.success) {
            address = geocodingData.formattedAddress || geocodingData.address || address;
            addressComponents = geocodingData.components || null;
          }
        }
      } catch (geocodingError) {
        // Ignorar erros de geocoding
      }
      
      if (position) {
        updateLastLocationIfBetter({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address,
          addressComponents,
          wifiName: undefined, // Será preenchido pelo contexto se necessário
          networkInfo: undefined,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      // Silenciosamente falhar - não bloquear aplicação
      // Não logar timeouts ou violações de política (são esperados)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        !errorMessage.includes('user gesture') &&
        !errorMessage.includes('Timeout')
      ) {
        console.warn('⚠️ Erro ao capturar localização periódica:', error);
      }
    } finally {
      isCapturingRef.current = false;
    }
  }, [updateLastLocationIfBetter, hasUserInteracted]);

  // ✅ 2. Atualização periódica de 10 em 10 minutos (apenas após primeira interação)
  useEffect(() => {
    // ❌ Não capturar na primeira carga - viola política do navegador
    // Só iniciar após primeira interação do usuário
    // ❌ Não capturar na página de login - permissão será solicitada no checkbox
    
    if (!hasUserInteracted) {
      return; // Aguardar primeira interação
    }

    // ❌ Não capturar se estiver na página de login ou página principal
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
      return;
    }

    // Capturar imediatamente após primeira interação (exceto login)
    captureLocationSafely();

    // Configurar intervalo de 10 minutos (600000ms)
    const interval = setInterval(() => {
      // ❌ Não capturar se estiver na página de login ou página principal
      if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/')) {
        return;
      }
      captureLocationSafely();
    }, 10 * 60 * 1000); // 10 minutos

    return () => {
      clearInterval(interval);
    };
  }, [captureLocationSafely, hasUserInteracted]);

  return (
    <GeolocationContext.Provider
      value={{
        lastLocation,
        setLastLocation,
        updateLastLocationIfBetter,
        lastCaptureLocation,
        setLastCaptureLocation,
        lastCaptureStatus,
        setLastCaptureStatus,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
};
