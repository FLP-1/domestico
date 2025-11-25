/**
 * 🎯 Configurações Centralizadas de Geolocalização
 *
 * Centraliza todas as configurações de geolocalização para evitar dados hardcoded
 * e facilitar manutenção e personalização
 */

export interface GeolocationConfig {
  // Configurações gerais
  defaultUpdateIntervalMinutes: number;
  defaultMinAccuracy: number;
  defaultMaxAge: number;
  defaultTimeout: number;

  // Configurações específicas por contexto
  welcomeSection: {
    updateIntervalMinutes: number;
    minAccuracy: number;
    maxAge: number;
    enablePageLoadUpdate: boolean;
    enablePeriodicUpdate: boolean;
  };

  timeRecordCard: {
    updateIntervalMinutes: number;
    minAccuracy: number;
    maxAge: number;
    enablePageLoadUpdate: boolean;
    enablePeriodicUpdate: boolean;
  };

  // Configurações de API
  geocoding: {
    zoom: number;
    timeout: number;
    retryAttempts: number;
  };

  // Configurações de rede
  networkDetection: {
    updateInterval: number;
    enableRealSSID: boolean;
    enableLogging: boolean;
  };
}

export const GEOLOCATION_CONFIG: GeolocationConfig = {
  // Configurações gerais
  defaultUpdateIntervalMinutes: 5,
  defaultMinAccuracy: 50, // Reduzido de 100m para 50m para melhor precisão
  defaultMaxAge: 0, // Sem cache - sempre capturar nova posição para melhor precisão
  defaultTimeout: 30000, // 30 segundos para dar mais tempo ao GPS de alta precisão

  // WelcomeSection - Atualização frequente para UX
  welcomeSection: {
    updateIntervalMinutes: 2, // Atualização mais frequente
    minAccuracy: 20, // Precisão muito mais alta (20 metros)
    maxAge: 0, // Sem cache - sempre capturar nova posição para melhor precisão
    enablePageLoadUpdate: true,
    enablePeriodicUpdate: true,
  },

  // TimeRecordCard - Precisão alta para auditoria
  timeRecordCard: {
    updateIntervalMinutes: 0, // Não atualizar automaticamente
    minAccuracy: 30, // Precisão muito alta (30 metros) para registro de ponto
    maxAge: 0, // Sem cache - sempre capturar nova posição para melhor precisão
    enablePageLoadUpdate: false,
    enablePeriodicUpdate: false,
  },

  // Configurações de geocoding
  geocoding: {
    zoom: 19, // Máxima precisão
    timeout: 10000, // 10 segundos
    retryAttempts: 3,
  },

  // Configurações de rede
  networkDetection: {
    updateInterval: 10000, // 10 segundos (reduzido para evitar rate limiting)
    enableRealSSID: true, // ✅ Reativado com proteções robustas
    enableLogging: false, // ✅ Desabilitado para reduzir chamadas
  },
};

/**
 * Obter configuração para um contexto específico
 */
export function getGeolocationConfig(
  context: 'welcomeSection' | 'timeRecordCard' | 'default'
) {
  switch (context) {
    case 'welcomeSection':
      return {
        updateIntervalMinutes:
          GEOLOCATION_CONFIG.welcomeSection.updateIntervalMinutes,
        minAccuracy: GEOLOCATION_CONFIG.welcomeSection.minAccuracy,
        maxAge: GEOLOCATION_CONFIG.welcomeSection.maxAge,
        enablePageLoadUpdate:
          GEOLOCATION_CONFIG.welcomeSection.enablePageLoadUpdate,
        enablePeriodicUpdate:
          GEOLOCATION_CONFIG.welcomeSection.enablePeriodicUpdate,
        enableLogging: false, // ✅ Desabilitado para produção
      };

    case 'timeRecordCard':
      return {
        updateIntervalMinutes:
          GEOLOCATION_CONFIG.timeRecordCard.updateIntervalMinutes,
        minAccuracy: GEOLOCATION_CONFIG.timeRecordCard.minAccuracy,
        maxAge: GEOLOCATION_CONFIG.timeRecordCard.maxAge,
        enablePageLoadUpdate:
          GEOLOCATION_CONFIG.timeRecordCard.enablePageLoadUpdate,
        enablePeriodicUpdate:
          GEOLOCATION_CONFIG.timeRecordCard.enablePeriodicUpdate,
        enableLogging: false,
      };

    default:
      return {
        updateIntervalMinutes: GEOLOCATION_CONFIG.defaultUpdateIntervalMinutes,
        minAccuracy: GEOLOCATION_CONFIG.defaultMinAccuracy,
        maxAge: GEOLOCATION_CONFIG.defaultMaxAge,
        enablePageLoadUpdate: true,
        enablePeriodicUpdate: true,
        enableLogging: false,
      };
  }
}

/**
 * Obter configurações de geocoding
 */
export function getGeocodingConfig() {
  return GEOLOCATION_CONFIG.geocoding;
}

/**
 * Obter configurações de rede
 */
export function getNetworkDetectionConfig() {
  return GEOLOCATION_CONFIG.networkDetection;
}
