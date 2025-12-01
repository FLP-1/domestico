/**
 * Sistema de Feature Flags
 * Permite habilitar/desabilitar funcionalidades sem deploy
 * Suporta flags por usuário, perfil, grupo e global
 */

export type FeatureFlagScope = 'global' | 'user' | 'profile' | 'group';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  scope: FeatureFlagScope;
  targetId?: string; // ID do usuário, perfil ou grupo
  metadata?: Record<string, any>;
}

export interface FeatureFlagConfig {
  key: string;
  defaultValue?: boolean;
  description?: string;
  scope?: FeatureFlagScope;
}

// Feature flags padrão do sistema
const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig[] = [
  {
    key: 'NEW_DASHBOARD',
    defaultValue: false,
    description: 'Novo dashboard redesenhado',
    scope: 'global',
  },
  {
    key: 'ADVANCED_GEOLOCATION',
    defaultValue: true,
    description: 'Geolocalização avançada com múltiplas APIs',
    scope: 'global',
  },
  {
    key: 'PWA_PUSH_NOTIFICATIONS',
    defaultValue: false,
    description: 'Notificações push no PWA',
    scope: 'global',
  },
  {
    key: 'REAL_TIME_UPDATES',
    defaultValue: false,
    description: 'Atualizações em tempo real via WebSocket',
    scope: 'global',
  },
  {
    key: 'BETA_FEATURES',
    defaultValue: false,
    description: 'Funcionalidades em beta',
    scope: 'profile',
  },
  {
    key: 'EXPERIMENTAL_UI',
    defaultValue: false,
    description: 'Interface experimental',
    scope: 'user',
  },
];

// Cache em memória para performance
const featureFlagsCache: Map<string, FeatureFlag> = new Map();
let cacheExpiry: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém feature flag do banco de dados
 */
async function getFeatureFlagFromDB(
  key: string,
  userId?: string,
  profileId?: string,
  groupId?: string
): Promise<FeatureFlag | null> {
  try {
    const prisma = (await import('./prisma')).default;

    // Buscar flag pela chave (simplificado - sem filtros por usuário/perfil/grupo)
    const flag = await prisma.configuracaoSistema.findFirst({
      where: {
        chave: `feature_flag_${key}`,
      },
    });

    if (!flag) {
      return null;
    }

    return {
      key,
      enabled: flag.valor === 'true' || flag.valor === '1',
      description: flag.descricao || undefined,
      scope: 'global' as FeatureFlagScope,
      targetId: undefined,
      metadata: undefined,
    };
  } catch (error) {
    // console.error('Erro ao buscar feature flag do banco:', error);
    return null;
  }
}

/**
 * Verifica se uma feature flag está habilitada
 */
export async function isFeatureEnabled(
  key: string,
  options?: {
    userId?: string;
    profileId?: string;
    groupId?: string;
    defaultValue?: boolean;
  }
): Promise<boolean> {
  const { userId, profileId, groupId, defaultValue } = options || {};

  // Verificar cache primeiro
  const cacheKey = `${key}_${userId || ''}_${profileId || ''}_${groupId || ''}`;
  const now = Date.now();

  if (featureFlagsCache.has(cacheKey) && now < cacheExpiry) {
    return featureFlagsCache.get(cacheKey)!.enabled;
  }

  // Buscar flag específica
  const flag = await getFeatureFlagFromDB(key, userId, profileId, groupId);

  if (flag) {
    // Atualizar cache
    featureFlagsCache.set(cacheKey, flag);
    cacheExpiry = now + CACHE_TTL;
    return flag.enabled;
  }

  // Buscar valor padrão da configuração
  const defaultConfig = DEFAULT_FEATURE_FLAGS.find(f => f.key === key);
  if (defaultConfig?.defaultValue !== undefined) {
    return defaultConfig.defaultValue;
  }

  // Usar defaultValue fornecido ou false
  return defaultValue ?? false;
}

/**
 * Define uma feature flag
 */
export async function setFeatureFlag(
  key: string,
  enabled: boolean,
  options?: {
    userId?: string;
    profileId?: string;
    groupId?: string;
    description?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const prisma = (await import('./prisma')).default;
    const { userId, profileId, groupId, description, metadata } = options || {};

    const chave = `feature_flag_${key}`;
    const valor = enabled ? 'true' : 'false';

    // Verificar se já existe
    const existing = await prisma.configuracaoSistema.findFirst({
      where: {
        chave,
      },
    });

    if (existing) {
      // Atualizar
      await prisma.configuracaoSistema.update({
        where: { id: existing.id },
        data: {
          valor,
          descricao: description,
          tipo: 'feature_flag',
          categoria: 'feature_flags',
          atualizadoEm: new Date(),
        },
      });
    } else {
      // Criar
      await prisma.configuracaoSistema.create({
        data: {
          chave,
          valor,
          descricao: description,
          tipo: 'feature_flag',
          categoria: 'feature_flags',
        },
      });
    }

    // Limpar cache
    featureFlagsCache.clear();
  } catch (error) {
    // console.error('Erro ao definir feature flag:', error);
    throw error;
  }
}

/**
 * Obtém todas as feature flags para um contexto
 */
export async function getAllFeatureFlags(options?: {
  userId?: string;
  profileId?: string;
  groupId?: string;
}): Promise<Record<string, boolean>> {
  const { userId, profileId, groupId } = options || {};
  const flags: Record<string, boolean> = {};

  // Buscar todas as flags padrão
  for (const config of DEFAULT_FEATURE_FLAGS) {
    flags[config.key] = await isFeatureEnabled(config.key, {
      userId,
      profileId,
      groupId,
      defaultValue: config.defaultValue ?? false,
    });
  }

  return flags;
}

/**
 * Limpa o cache de feature flags
 */
export function clearFeatureFlagsCache(): void {
  featureFlagsCache.clear();
  cacheExpiry = 0;
}

/**
 * Inicializa feature flags padrão no banco (se não existirem)
 */
export async function initializeDefaultFeatureFlags(): Promise<void> {
  try {
    const prisma = (await import('./prisma')).default;

    for (const config of DEFAULT_FEATURE_FLAGS) {
      const chave = `feature_flag_${config.key}`;
      const existing = await prisma.configuracaoSistema.findFirst({
        where: {
          chave,
        },
      });

      if (!existing) {
        await prisma.configuracaoSistema.create({
          data: {
            chave,
            valor: (config.defaultValue ?? false) ? 'true' : 'false',
            descricao: config.description,
            tipo: 'feature_flag',
            categoria: 'feature_flags',
          },
        });
      }
    }
  } catch (error) {
    // console.error('Erro ao inicializar feature flags padrão:', error);
  }
}
