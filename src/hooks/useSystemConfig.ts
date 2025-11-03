import { useState, useEffect } from 'react';
import { loadSystemConfig, SystemConfig } from '../config/centralized-config';

// Configurações padrão que sempre estarão disponíveis
const DEFAULT_CONFIG: SystemConfig = {
  colors: {
    primary: '#29ABE2',
    secondary: '#90EE90',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  geolocation: {
    maxDistance: 200,
    accuracyThreshold: 100,
    timeout: 10000,
  },
  antifraud: {
    maxAttempts: 3,
    lockoutDuration: 3600,
    riskThreshold: 0.7,
  },
  urls: {
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    esocial: {
      homologacao: 'https://webservices.producaorestrita.esocial.gov.br',
      producao: 'https://webservices.envio.esocial.gov.br',
    },
    geocoding: {
      nominatim: 'https://nominatim.openstreetmap.org/reverse',
      opencage: 'https://api.opencagedata.com/geocode/v1/json',
      bigdatacloud: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
      positionstack: 'https://api.positionstack.com/v1/reverse',
    },
  },
};

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só tenta carregar do banco se estiver no servidor
    if (typeof window === 'undefined') {
      const loadConfig = async () => {
        try {
          setLoading(true);
          const systemConfig = await loadSystemConfig();
          setConfig(systemConfig);
          setError(null);
        } catch (err: unknown) {
          console.error('Erro ao carregar configurações do sistema:', err);
          setError('Erro ao carregar configurações');
          // Mantém as configurações padrão
        } finally {
          setLoading(false);
        }
      };

      loadConfig();
    }
  }, []);

  return {
    config,
    loading,
    error,
  };
};

export default useSystemConfig;
