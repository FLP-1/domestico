/**
 * Testes Unitários: ConfigService
 * Testa serviço de configuração centralizada
 */

import configService, {
  getConfigValue,
  getGeolocationConfigForUser,
  getAntifraudConfigForUser,
  getColorsForProfile,
  getCurrentUserId,
  getGeocodingUrls,
} from '@/lib/configService';
import { loadSystemConfig } from '@/config/centralized-config';
import prisma from '@/lib/prisma';

// Mock do Prisma - deve ser default export
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    configuracaoGeolocalizacao: {
      findFirst: jest.fn(),
    },
    configuracaoAntifraude: {
      findFirst: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    perfil: {
      findUnique: jest.fn(),
    },
    configuracaoPerfil: {
      findFirst: jest.fn(),
    },
  },
  prisma: {
    configuracaoGeolocalizacao: {
      findFirst: jest.fn(),
    },
    configuracaoAntifraude: {
      findFirst: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    perfil: {
      findUnique: jest.fn(),
    },
    configuracaoPerfil: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock do centralized-config
jest.mock('@/config/centralized-config', () => ({
  loadSystemConfig: jest.fn(),
  getSystemConfig: jest.fn(),
}));

describe('ConfigService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getColors', () => {
    it('deve retornar cores do sistema', async () => {
      const mockConfig = {
        colors: {
          primary: '#29ABE2',
          secondary: '#90EE90',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const colors = await configService.getColors();

      expect(colors).toEqual(mockConfig.colors);
      expect(loadSystemConfig).toHaveBeenCalled();
    });
  });

  describe('getTypography', () => {
    it('deve retornar tipografia do sistema', async () => {
      const mockConfig = {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
          },
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const typography = await configService.getTypography();

      expect(typography).toEqual(mockConfig.typography);
    });
  });

  describe('getUrls', () => {
    it('deve retornar URLs do sistema', async () => {
      const mockConfig = {
        urls: {
          api: 'https://api.example.com',
          esocial: {
            homologacao: 'https://homologacao.esocial.gov.br',
            producao: 'https://esocial.gov.br',
          },
          geocoding: {
            nominatim: 'https://nominatim.openstreetmap.org',
            opencage: 'https://api.opencagedata.com',
            bigdatacloud: 'https://api.bigdatacloud.net',
            positionstack: 'https://api.positionstack.com',
          },
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const urls = await configService.getUrls();

      expect(urls).toEqual(mockConfig.urls);
    });
  });

  describe('getGeolocationConfig', () => {
    it('deve retornar configuração de geolocalização', async () => {
      const mockConfig = {
        geolocation: {
          maxDistance: 200,
          accuracyThreshold: 100,
          timeout: 10000,
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const geolocationConfig = await configService.getGeolocationConfig();

      expect(geolocationConfig).toEqual(mockConfig.geolocation);
    });
  });

  describe('getAntifraudConfig', () => {
    it('deve retornar configuração de antifraude', async () => {
      const mockConfig = {
        antifraud: {
          maxAttempts: 3,
          lockoutDuration: 300000,
          riskThreshold: 0.7,
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const antifraudConfig = await configService.getAntifraudConfig();

      expect(antifraudConfig).toEqual(mockConfig.antifraud);
    });
  });

  describe('getBaseUrl', () => {
    it('deve retornar URL base da API', async () => {
      const mockConfig = {
        urls: {
          api: 'https://api.example.com',
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const baseUrl = await configService.getBaseUrl();

      expect(baseUrl).toBe('https://api.example.com');
    });

    it('deve retornar string vazia se URL não estiver configurada', async () => {
      (loadSystemConfig as jest.Mock).mockResolvedValue({ urls: {} });

      const baseUrl = await configService.getBaseUrl();

      expect(baseUrl).toBe('');
    });
  });

  describe('getGeolocationMaxAccuracy', () => {
    it('deve retornar threshold de precisão', async () => {
      const mockConfig = {
        geolocation: {
          accuracyThreshold: 100,
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const accuracy = await configService.getGeolocationMaxAccuracy();

      expect(accuracy).toBe(100);
    });

    it('deve retornar valor padrão se não configurado', async () => {
      (loadSystemConfig as jest.Mock).mockResolvedValue({ geolocation: {} });

      const accuracy = await configService.getGeolocationMaxAccuracy();

      expect(accuracy).toBe(100);
    });
  });
});

describe('Funções Utilitárias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGeolocationConfigForUser', () => {
    it('deve retornar configuração específica do usuário', async () => {
      const userConfig = {
        id: 'config-id',
        usuarioId: 'user-id',
        valor: JSON.stringify({
          maxDistance: 150,
          accuracyThreshold: 50,
          timeout: 5000,
        }),
        ativo: true,
      };

      (prisma.configuracaoGeolocalizacao.findFirst as jest.Mock).mockResolvedValue(
        userConfig
      );

      const config = await getGeolocationConfigForUser('user-id');

      expect(config.maxDistance).toBe(150);
      expect(config.accuracyThreshold).toBe(50);
      expect(config.timeout).toBe(5000);
    });

    it('deve retornar configuração padrão se usuário não tiver configuração', async () => {
      (prisma.configuracaoGeolocalizacao.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // Primeira chamada (usuário)
        .mockResolvedValueOnce(null); // Segunda chamada (grupo)
      
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        gruposUsuario: [
          {
            grupo: {
              id: 'grupo-id',
            },
          },
        ],
      });
      
      (prisma.configuracaoGeolocalizacao.findFirst as jest.Mock).mockResolvedValueOnce(
        null
      );

      const mockConfig = {
        geolocation: {
          maxDistance: 200,
          accuracyThreshold: 100,
          timeout: 10000,
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const config = await getGeolocationConfigForUser('user-id');

      expect(config).toEqual(mockConfig.geolocation);
    });
  });

  describe('getAntifraudConfigForUser', () => {
    it('deve retornar configuração específica do usuário', async () => {
      const userConfig = {
        id: 'config-id',
        usuarioId: 'user-id',
        valor: JSON.stringify({
          maxAttempts: 5,
          lockoutDuration: 600000,
          riskThreshold: 0.8,
        }),
        ativo: true,
      };

      (prisma.configuracaoAntifraude.findFirst as jest.Mock).mockResolvedValue(
        userConfig
      );

      const config = await getAntifraudConfigForUser('user-id');

      expect(config.maxAttempts).toBe(5);
      expect(config.lockoutDuration).toBe(600000);
      expect(config.riskThreshold).toBe(0.8);
    });
  });

  describe('getColorsForProfile', () => {
    it('deve retornar cores específicas do perfil', async () => {
      (prisma.perfil.findUnique as jest.Mock).mockResolvedValue({
        id: 'perfil-id',
        codigo: 'EMPREGADO',
      });

      (prisma.configuracaoPerfil.findFirst as jest.Mock).mockResolvedValue({
        id: 'config-id',
        valor: JSON.stringify({
          primary: '#FF0000',
          secondary: '#00FF00',
          success: '#0000FF',
          warning: '#FFFF00',
          error: '#FF00FF',
          info: '#00FFFF',
        }),
        ativo: true,
      });

      const colors = await getColorsForProfile('EMPREGADO');

      expect(colors.primary).toBe('#FF0000');
    });

    it('deve retornar cores padrão se perfil não tiver configuração', async () => {
      (prisma.perfil.findUnique as jest.Mock).mockResolvedValue({
        id: 'perfil-id',
        codigo: 'EMPREGADO',
      });

      (prisma.configuracaoPerfil.findFirst as jest.Mock).mockResolvedValue(
        null
      );

      const mockConfig = {
        colors: {
          primary: '#29ABE2',
          secondary: '#90EE90',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const colors = await getColorsForProfile('EMPREGADO');

      expect(colors).toEqual(mockConfig.colors);
    });
  });

  describe('getCurrentUserId', () => {
    it('deve retornar ID do usuário encontrado', async () => {
      (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-id',
        cpf: '59876913700',
      });

      const userId = await getCurrentUserId();

      expect(userId).toBe('user-id');
    });

    it('deve retornar null se usuário não encontrado', async () => {
      (prisma.usuario.findFirst as jest.Mock).mockResolvedValue(null);

      const userId = await getCurrentUserId();

      expect(userId).toBeNull();
    });
  });

  describe('getGeocodingUrls', () => {
    it('deve retornar URLs de geocoding', async () => {
      const mockConfig = {
        urls: {
          geocoding: {
            nominatim: 'https://nominatim.openstreetmap.org/reverse',
            opencage: 'https://api.opencagedata.com/geocode/v1/json',
            bigdatacloud: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
            positionstack: 'https://api.positionstack.com/v1/reverse',
          },
        },
      };

      (loadSystemConfig as jest.Mock).mockResolvedValue(mockConfig);

      const urls = await getGeocodingUrls();

      expect(urls).toEqual(mockConfig.urls.geocoding);
    });
  });
});

