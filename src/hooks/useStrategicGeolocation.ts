/**
 * Hook Estratégico de Geolocalização
 * 
 * Respeita políticas do navegador mas mantém antifraude robusto:
 * - Captura geolocalização em resposta a gestos do usuário (ações críticas)
 * - Solicita permissão persistente no primeiro login
 * - Usa cache inteligente e fallbacks alternativos
 * - Integra com sistema adaptativo de análise de risco
 */

import { useCallback, useRef, useEffect } from 'react';
import { useGeolocationContext } from '../contexts/GeolocationContext';

interface UseStrategicGeolocationOptions {
  /**
   * Se true, solicita permissão persistente no primeiro uso
   * (requer gesto do usuário)
   */
  requestPersistentPermission?: boolean;
  
  /**
   * Se true, captura geolocalização imediatamente ao invocar capture()
   * Se false, apenas valida permissão (útil para pré-requisições)
   */
  immediateCapture?: boolean;
  
  /**
   * Timeout em ms para captura
   */
  timeout?: number;
  
  /**
   * Idade máxima de cache aceitável (ms)
   */
  maximumAge?: number;
}

export const useStrategicGeolocation = (
  options: UseStrategicGeolocationOptions = {}
) => {
  const {
    requestPersistentPermission = false,
    immediateCapture = true,
    timeout = 10000,
    maximumAge = 60000 // 1 minuto - cache recente aceitável
  } = options;

  const { setLastCaptureLocation, lastLocation } = useGeolocationContext();
  const permissionGrantedRef = useRef<boolean | null>(null);
  const lastPermissionCheckRef = useRef<Date | null>(null);

  /**
   * Verifica se geolocalização está disponível e permissão foi concedida
   */
  const checkPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.geolocation) {
      return 'denied';
    }

    if (!navigator.permissions) {
      // Fallback: tentar captura leve para detectar permissão
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      permissionGrantedRef.current = result.state === 'granted';
      lastPermissionCheckRef.current = new Date();
      
      return result.state === 'granted' ? 'granted' :
             result.state === 'denied' ? 'denied' : 'prompt';
    } catch (error) {
      // Fallback se Permissions API não suportada
      return 'prompt';
    }
  }, []);

  /**
   * Captura geolocalização em resposta a gesto do usuário
   * Esta função DEVE ser chamada apenas dentro de handlers de eventos do usuário
   */
  const capture = useCallback(async (
    source: string = 'user_action'
  ): Promise<{
    success: boolean;
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: Date;
    };
    error?: string;
    permissionStatus?: 'granted' | 'denied' | 'prompt';
  }> => {
    // ✅ Verificar se temos cache válido (mais rápido e não solicita permissão)
    if (lastLocation && maximumAge > 0) {
      const cacheAge = Date.now() - lastLocation.timestamp.getTime();
      if (cacheAge < maximumAge) {
        return {
          success: true,
          location: {
            latitude: lastLocation.latitude,
            longitude: lastLocation.longitude,
            accuracy: lastLocation.accuracy,
            timestamp: lastLocation.timestamp
          },
          permissionStatus: 'granted'
        };
      }
    }

    if (!navigator.geolocation) {
      return {
        success: false,
        error: 'Geolocalização não suportada pelo navegador',
        permissionStatus: 'denied'
      };
    }

    // Verificar permissão
    const permissionStatus = await checkPermission();
    
    if (permissionStatus === 'denied') {
      return {
        success: false,
        error: 'Permissão de geolocalização negada pelo usuário',
        permissionStatus: 'denied'
      };
    }

    // Se não capturar imediatamente, apenas retornar status
    if (!immediateCapture) {
      return {
        success: false,
        error: 'Captura não configurada para execução imediata',
        permissionStatus
      };
    }

    // ✅ Capturar geolocalização (sempre em resposta a gesto do usuário)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout ao capturar geolocalização'));
        }, timeout);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (error) => {
            clearTimeout(timeoutId);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout,
            maximumAge: maximumAge || 0
          }
        );
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };

      // Salvar no contexto
      setLastCaptureLocation({
        ...locationData,
        address: '', // Será preenchido via geocoding se necessário
        wifiName: '', // Será preenchido via network detection
        networkInfo: {},
        addressComponents: null,
        hasNumber: false
      });

      return {
        success: true,
        location: locationData,
        permissionStatus: 'granted'
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro desconhecido ao capturar geolocalização';
      
      return {
        success: false,
        error: errorMessage,
        permissionStatus: permissionStatus === 'granted' ? 'granted' : 'prompt'
      };
    }
  }, [
    lastLocation,
    maximumAge,
    immediateCapture,
    timeout,
    checkPermission,
    setLastCaptureLocation
  ]);

  /**
   * Pré-requisita permissão de geolocalização (chamar no login)
   * Dispara popup de permissão apenas na primeira vez
   * Deve ser chamado dentro de handler de evento do usuário (ex: onSubmit do login)
   */
  const requestPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.geolocation) {
      return 'denied';
    }

    if (requestPersistentPermission) {
      // Tentar solicitar permissão persistente (só funciona em HTTPS)
      try {
        if ('permissions' in navigator) {
          const permissionResult = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permissionResult.state === 'granted') {
            permissionGrantedRef.current = true;
            return 'granted';
          }
          
          if (permissionResult.state === 'denied') {
            permissionGrantedRef.current = false;
            return 'denied';
          }
        }
      } catch (error) {
        // Permissions API pode não estar disponível
      }
    }

    // Solicitar permissão através de captura leve (dispara popup)
    // Timeout muito curto - só queremos a permissão, não dados precisos
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5000, // Timeout curto
            maximumAge: Infinity // Aceitar qualquer cache (só queremos popup)
          }
        );
      });
      
      permissionGrantedRef.current = true;
      return 'granted';
    } catch (error: any) {
      if (error?.code === error.PERMISSION_DENIED) {
        permissionGrantedRef.current = false;
        return 'denied';
      }
      return 'prompt';
    }
  }, [requestPersistentPermission]);

  /**
   * Wrapper para capturar geolocalização antes de ações críticas
   * Garante que captura ocorra apenas em resposta a gestos do usuário
   */
  const captureForCriticalAction = useCallback(async (
    actionName: string,
    userGestureHandler: () => void | Promise<void>
  ): Promise<void> => {
    // Capturar geolocalização (em resposta ao gesto do usuário)
    const locationResult = await capture(actionName);

    // Executar ação do usuário (mesmo se geolocalização falhar)
    await userGestureHandler();

    // Se geolocalização foi capturada com sucesso, já está no contexto
    // Se falhou, ainda podemos usar outras métricas de antifraude
    if (!locationResult.success && locationResult.error) {
      console.warn(`⚠️ Geolocalização não disponível para ${actionName}:`, locationResult.error);
      // Sistema adaptativo usará outras métricas (WiFi, IP, comportamento, etc.)
    }
  }, [capture]);

  return {
    capture,
    requestPermission,
    checkPermission,
    captureForCriticalAction,
    lastLocation,
    hasPermission: permissionGrantedRef.current
  };
};

export default useStrategicGeolocation;

