// 🎯 CONFIGURAÇÕES CENTRALIZADAS - SISTEMA DOM
// Este arquivo centraliza TODAS as configurações do sistema
// Eliminando hardcoded e permitindo configuração dinâmica

import prisma from '../lib/prisma';

// ========================================
// CONFIGURAÇÕES DE SISTEMA
// ========================================

export interface SystemConfig {
  // Cores do sistema
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Tipografia
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };

  // Espaçamento
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };

  // URLs e endpoints
  urls: {
    api: string;
    esocial: {
      homologacao: string;
      producao: string;
    };
    geocoding: {
      nominatim: string;
      opencage: string;
      bigdatacloud: string;
      positionstack: string;
    };
  };

  // Configurações de geolocalização
  geolocation: {
    maxDistance: number;
    accuracyThreshold: number;
    timeout: number;
  };

  // Configurações de antifraude
  antifraud: {
    maxAttempts: number;
    lockoutDuration: number;
    riskThreshold: number;
  };
}

// ========================================
// CONFIGURAÇÕES PADRÃO (FALLBACK)
// ========================================

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

  urls: {
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    esocial: {
      homologacao:
        process.env.ESOCIAL_HOMOLOGACAO_URL ||
        'https://webservices.producaorestrita.esocial.gov.br',
      producao:
        process.env.ESOCIAL_PRODUCAO_URL ||
        'https://webservices.envio.esocial.gov.br',
    },
    geocoding: {
      nominatim: 'https://nominatim.openstreetmap.org/reverse',
      opencage: 'https://api.opencagedata.com/geocode/v1/json',
      bigdatacloud: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
      positionstack: 'https://api.positionstack.com/v1/reverse',
    },
  },

  geolocation: {
    maxDistance: parseInt(process.env.GEOLOCATION_MAX_DISTANCE || '200'),
    accuracyThreshold: parseInt(
      process.env.GEOLOCATION_ACCURACY_THRESHOLD || '100'
    ),
    timeout: parseInt(process.env.GEOLOCATION_TIMEOUT || '10000'),
  },

  antifraud: {
    maxAttempts: parseInt(process.env.ANTIFRAUD_MAX_ATTEMPTS || '3'),
    lockoutDuration: parseInt(
      process.env.ANTIFRAUD_LOCKOUT_DURATION || '300000'
    ),
    riskThreshold: parseFloat(process.env.ANTIFRAUD_RISK_THRESHOLD || '0.7'),
  },
};

// ========================================
// FUNÇÕES DE CONFIGURAÇÃO DINÂMICA
// ========================================

/**
 * Carrega configurações do banco de dados
 * Se não existir, retorna configurações padrão
 */
export async function loadSystemConfig(): Promise<SystemConfig> {
  try {
    // Buscar configurações do banco
    const configs = await prisma.configuracaoSistema.findMany({
      where: { editavel: true },
      orderBy: { criadoEm: 'asc' },
    });

    if (configs.length === 0) {
      // Se não há configurações, criar as padrão
      await createDefaultConfigs();
      return DEFAULT_CONFIG;
    }

    // Converter configurações do banco para objeto
    const config: SystemConfig = { ...DEFAULT_CONFIG };

    for (const cfg of configs) {
      const value = JSON.parse(cfg.valor);

      switch (cfg.categoria) {
        case 'colors':
          Object.assign(config.colors, value);
          break;
        case 'typography':
          Object.assign(config.typography, value);
          break;
        case 'spacing':
          Object.assign(config.spacing, value);
          break;
        case 'urls':
          Object.assign(config.urls, value);
          break;
        case 'geolocation':
          Object.assign(config.geolocation, value);
          break;
        case 'antifraud':
          Object.assign(config.antifraud, value);
          break;
      }
    }

    return config;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Cria configurações padrão no banco de dados
 */
async function createDefaultConfigs() {
  try {
    const defaultConfigs = [
      {
        chave: 'colors_primary',
        categoria: 'colors',
        valor: JSON.stringify({ primary: '#29ABE2' }),
        descricao: 'Cor primária do sistema',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'colors_secondary',
        categoria: 'colors',
        valor: JSON.stringify({ secondary: '#90EE90' }),
        descricao: 'Cor secundária do sistema',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'geolocation_max_distance',
        categoria: 'geolocation',
        valor: JSON.stringify({ maxDistance: 200 }),
        descricao: 'Distância máxima para validação de geolocalização (metros)',
        tipo: 'number',
        editavel: true,
      },
      {
        chave: 'antifraud_max_attempts',
        categoria: 'antifraud',
        valor: JSON.stringify({ maxAttempts: 3 }),
        descricao: 'Número máximo de tentativas de antifraude',
        tipo: 'number',
        editavel: true,
      },
    ];

    for (const config of defaultConfigs) {
      await prisma.configuracaoSistema.upsert({
        where: { chave: config.chave },
        update: config,
        create: config,
      });
    }

    // console.log('✅ Configurações padrão criadas no banco de dados');
  } catch (error) {
    console.error('Erro ao criar configurações padrão:', error);
  }
}

/**
 * Atualiza uma configuração específica
 */
export async function updateSystemConfig(
  chave: string,
  valor: any,
  categoria: string,
  descricao?: string
) {
  try {
    await prisma.configuracaoSistema.upsert({
      where: { chave },
      update: {
        valor: JSON.stringify(valor),
        categoria,
        descricao,
        atualizadoEm: new Date(),
      },
      create: {
        chave,
        categoria,
        tipo: 'json',
        valor: JSON.stringify(valor),
        descricao,
      },
    });

    // console.log(`✅ Configuração ${chave} atualizada`);
  } catch (error) {
    console.error(`Erro ao atualizar configuração ${chave}:`, error);
    throw error;
  }
}

/**
 * Obtém configuração específica
 */
export async function getSystemConfig(chave: string): Promise<any> {
  try {
    const config = await prisma.configuracaoSistema.findUnique({
      where: { chave },
    });

    if (!config) {
      return null;
    }

    return JSON.parse(config.valor);
  } catch (error) {
    console.error(`Erro ao obter configuração ${chave}:`, error);
    return null;
  }
}

// ========================================
// CONFIGURAÇÕES POR PERFIL
// ========================================

export interface ProfileConfig {
  empregado: SystemConfig;
  empregador: SystemConfig;
  familia: SystemConfig;
  admin: SystemConfig;
}

/**
 * Carrega configurações específicas por perfil
 */
export async function loadProfileConfigs(): Promise<ProfileConfig> {
  try {
    const configs = await prisma.configuracaoPerfil.findMany({
      where: { ativo: true },
      include: { perfil: true },
    });

    const profileConfigs: ProfileConfig = {
      empregado: { ...DEFAULT_CONFIG },
      empregador: { ...DEFAULT_CONFIG },
      familia: { ...DEFAULT_CONFIG },
      admin: { ...DEFAULT_CONFIG },
    };

    for (const config of configs) {
      const perfilCodigo = config.perfil.codigo.toLowerCase();
      const valor = JSON.parse(config.valor);

      if (profileConfigs[perfilCodigo as keyof ProfileConfig]) {
        Object.assign(
          profileConfigs[perfilCodigo as keyof ProfileConfig],
          valor
        );
      }
    }

    return profileConfigs;
  } catch (error) {
    console.error('Erro ao carregar configurações de perfil:', error);
    return {
      empregado: DEFAULT_CONFIG,
      empregador: DEFAULT_CONFIG,
      familia: DEFAULT_CONFIG,
      admin: DEFAULT_CONFIG,
    };
  }
}

// ========================================
// EXPORTAR CONFIGURAÇÕES
// ========================================

export { DEFAULT_CONFIG };
export default loadSystemConfig;
