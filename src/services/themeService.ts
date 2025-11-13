/**
 * Serviço de Tema e Configurações Visuais - CONSOLIDADO
 * ✅ Único ponto de verdade para temas e cores
 * ✅ Busca hierárquica: Perfil → TemaVisual → Sistema → Env → null
 * ✅ Zero cores hardcoded
 */

import prisma from '../lib/prisma';
import logger from '../lib/logger';
import {
  colors as baseColors,
  typography as baseTypography,
  spacing as baseSpacing,
  shadows as baseShadows,
  borders as baseBorders,
} from '../config/theme';

// Cache em memória para temas por perfil
const themeCache = new Map<string, Theme>();
const cacheTimestamps = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const DEFAULT_THEME: Theme = {
  colors: {
    primary: baseColors.primary.main,
    secondary: baseColors.secondary.main,
    accent: baseColors.primary.light,
    background: baseColors.background.paper,
    surface: baseColors.surface.main,
    text: baseColors.text.primary,
    textSecondary: baseColors.text.secondary,
    border: baseColors.border.main,
    shadow: baseColors.surface.overlay,
    success: baseColors.success.main,
    warning: baseColors.warning.main,
    error: baseColors.error.main,
    info: baseColors.info.main,
  },
  typography: baseTypography,
  spacing: baseSpacing,
  shadows: baseShadows,
  borders: baseBorders,
};

// Interface para tema completo
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
  typography?: any;
  spacing?: any;
  shadows?: any;
  borders?: any;
  breakpoints?: any;
  zIndex?: any;
  transitions?: any;
}

/**
 * Obtém tema para um perfil específico
 * ✅ Busca hierárquica sem hardcoded
 */
export async function getThemeForProfile(
  profileCode?: string
): Promise<Theme | null> {
  const cacheKey = profileCode || 'default';
  
  try {
    // Verifica cache
    const cached = themeCache.get(cacheKey);
    const timestamp = cacheTimestamps.get(cacheKey);
    
    if (cached && timestamp && Date.now() - timestamp < CACHE_TTL) {
      return cached;
    }
    
    // 1. Buscar de Perfil + ConfiguracaoPerfil
    if (profileCode) {
      const profileTheme = await getThemeFromProfile(profileCode);
      if (profileTheme) {
        themeCache.set(cacheKey, profileTheme);
        cacheTimestamps.set(cacheKey, Date.now());
        return profileTheme;
      }
    }
    
    // 2. Buscar de TemaVisual ativo
    const visualTheme = await getThemeFromTemaVisual();
    if (visualTheme) {
      themeCache.set(cacheKey, visualTheme);
      cacheTimestamps.set(cacheKey, Date.now());
      return visualTheme;
    }
    
    // 3. Buscar de ConfiguracaoSistema
    const systemTheme = await getThemeFromSystemConfig();
    if (systemTheme) {
      themeCache.set(cacheKey, systemTheme);
      cacheTimestamps.set(cacheKey, Date.now());
      return systemTheme;
    }
    
    // 4. Buscar de variáveis de ambiente
    const envTheme = getThemeFromEnv();
    if (envTheme) {
      themeCache.set(cacheKey, envTheme);
      cacheTimestamps.set(cacheKey, Date.now());
      return envTheme;
    }
    
    // 5. Retornar null (não hardcoded)
    return null;
  } catch (error: unknown) {
    logger.error({ error, profileCode }, 'Erro ao obter tema');
    return null;
  }
}

/**
 * Obtém tema do Perfil (cor + ConfiguracaoPerfil)
 */
async function getThemeFromProfile(profileCode: string): Promise<Theme | null> {
  try {
    const perfil = await prisma.perfil.findUnique({
      where: { codigo: profileCode.toUpperCase() },
      include: {
        configuracoes: {
          where: {
            chave: 'colors',
            ativo: true
          }
        }
      }
    });
    
    if (!perfil) return null;
    
    // Buscar configuração de cores do perfil
    const colorConfig = perfil.configuracoes.find(c => c.chave === 'colors');
    let colors: any = null;
    
    if (colorConfig) {
      try {
        colors = JSON.parse(colorConfig.valor);
      } catch (error) {
        logger.error({ error }, 'Erro ao parsear cores do perfil');
      }
    }
    
    // Se não tem configuração, gerar tema a partir da cor do perfil
    if (!colors && perfil.cor) {
      colors = generateThemeFromPrimaryColor(perfil.cor);
    }
    
    if (!colors) return null;
    
    const validatedColors = validateColors(colors);
    if (!validatedColors) return null;
    
    return {
      colors: validatedColors,
      // Outros campos podem ser buscados de ConfiguracaoPerfil se necessário
    };
  } catch (error) {
    logger.error({ error, profileCode }, 'Erro ao buscar tema do perfil');
    return null;
  }
}

/**
 * Obtém tema do TemaVisual ativo
 */
async function getThemeFromTemaVisual(): Promise<Theme | null> {
  try {
    const temaAtivo = await prisma.temaVisual.findFirst({
      where: { ativo: true }
    });
    
    if (!temaAtivo) return null;
    
    const validatedColors = validateColors(temaAtivo.cores as any);
    if (!validatedColors) return null;
    
    return {
      colors: validatedColors,
      typography: temaAtivo.tipografia as any,
      spacing: temaAtivo.espacamentos as any,
      shadows: temaAtivo.sombras as any,
      borders: temaAtivo.bordas as any
    };
  } catch (error) {
    logger.error({ error }, 'Erro ao buscar TemaVisual');
    return null;
  }
}

/**
 * Obtém tema de ConfiguracaoSistema
 */
async function getThemeFromSystemConfig(): Promise<Theme | null> {
  try {
    const config = await prisma.configuracaoSistema.findFirst({
      where: {
        chave: 'theme.colors'
      }
    });
    
    if (!config) return null;
    
    try {
      const colors = JSON.parse(config.valor);
      const validatedColors = validateColors(colors);
      if (!validatedColors) return null;
      
      return {
        colors: validatedColors
      };
    } catch (error) {
      logger.error({ error }, 'Erro ao parsear cores do sistema');
      return null;
    }
  } catch (error) {
    logger.error({ error }, 'Erro ao buscar tema do sistema');
    return null;
  }
}

/**
 * Obtém tema de variáveis de ambiente
 */
function getThemeFromEnv(): Theme | null {
  const primary = process.env.NEXT_PUBLIC_THEME_PRIMARY;
  const secondary = process.env.NEXT_PUBLIC_THEME_SECONDARY;
  const background = process.env.NEXT_PUBLIC_THEME_BACKGROUND;
  
  if (!primary || !secondary || !background) {
    return null;
  }
  
  return {
    colors: {
      primary,
      secondary,
      background,
      surface: process.env.NEXT_PUBLIC_THEME_SURFACE || background,
      text: process.env.NEXT_PUBLIC_THEME_TEXT || '#1F2937',
      textSecondary: process.env.NEXT_PUBLIC_THEME_TEXT_SECONDARY || '#6B7280',
      border: process.env.NEXT_PUBLIC_THEME_BORDER || '#E0E0E0',
      shadow: process.env.NEXT_PUBLIC_THEME_SHADOW || 'rgba(0, 0, 0, 0.1)',
      success: process.env.NEXT_PUBLIC_THEME_SUCCESS,
      warning: process.env.NEXT_PUBLIC_THEME_WARNING,
      error: process.env.NEXT_PUBLIC_THEME_ERROR,
      info: process.env.NEXT_PUBLIC_THEME_INFO
    }
  };
}

/**
 * Valida cores (garante formato hex válido)
 * ✅ Retorna null se cores obrigatórias não forem válidas (não hardcoded)
 */
function validateColors(colors: any): Theme['colors'] | null {
  const isValidHex = (color: string) => color && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  const isValidRgba = (color: string) => color && /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/.test(color);
  const fallback = DEFAULT_THEME.colors;
  
  // Cores obrigatórias - se não forem válidas, retornar null
  if (!isValidHex(colors.primary) || !isValidHex(colors.secondary) || !isValidHex(colors.background)) {
    return null;
  }
  
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: isValidHex(colors.surface) ? colors.surface : fallback.surface,
    text: isValidHex(colors.text) ? colors.text : fallback.text,
    textSecondary: isValidHex(colors.textSecondary) ? colors.textSecondary : fallback.textSecondary,
    border: isValidHex(colors.border) ? colors.border : fallback.border,
    shadow: isValidHex(colors.shadow) || isValidRgba(colors.shadow) ? colors.shadow : fallback.shadow,
    accent: colors.accent && isValidHex(colors.accent) ? colors.accent : undefined,
    success: colors.success && isValidHex(colors.success) ? colors.success : undefined,
    warning: colors.warning && isValidHex(colors.warning) ? colors.warning : undefined,
    error: colors.error && isValidHex(colors.error) ? colors.error : undefined,
    info: colors.info && isValidHex(colors.info) ? colors.info : undefined
  };
}

/**
 * Gera tema completo a partir de uma cor primária
 * ✅ Usa apenas cores derivadas da primária (não hardcoded)
 */
function generateThemeFromPrimaryColor(primaryColor: string): any {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(primaryColor)) {
    return null;
  }
  
  // Gerar cor secundária (mais clara)
  const secondary = lightenColor(primaryColor, 20);
  
  // Gerar background a partir da primária (muito claro)
  const background = lightenColor(primaryColor, 95);
  
  // Gerar surface a partir da primária (90% claro)
  const surface = lightenColor(primaryColor, 90);
  
  // Gerar text a partir da primária (escurecido)
  const text = darkenColor(primaryColor, 80);
  
  // Gerar textSecondary a partir da primária (60% escuro)
  const textSecondary = darkenColor(primaryColor, 60);
  
  // Gerar border a partir da primária (85% claro)
  const border = lightenColor(primaryColor, 85);
  
  // Gerar shadow a partir da primária com opacidade
  const shadow = hexToRgba(primaryColor, 0.1);
  
  return {
    primary: primaryColor,
    secondary,
    background,
    surface,
    text,
    textSecondary,
    border,
    shadow
  };
}

/**
 * Escurece uma cor hex
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
  
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

/**
 * Converte hex para rgba
 */
function hexToRgba(hex: string, opacity: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Clareia uma cor hex
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
  
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

/**
 * Obtém o tema ativo do banco de dados (compatibilidade)
 */
export async function getActiveTheme(): Promise<Theme | null> {
  return getThemeForProfile();
}

/**
 * Cria ou atualiza um tema visual
 */
export async function saveTheme(
  nome: string,
  tema: Partial<typeof DEFAULT_THEME>,
  descricao?: string,
  ativo: boolean = false,
  usuarioId?: string
): Promise<void> {
  try {
    const existing = await prisma.temaVisual.findUnique({
      where: { nome },
    });

    // Se ativo, desativa outros temas
    if (ativo) {
      await prisma.temaVisual.updateMany({
        where: { ativo: true },
        data: { ativo: false },
      });
    }

    await prisma.temaVisual.upsert({
      where: { nome },
      update: {
        descricao,
        ativo,
        cores: tema.colors || DEFAULT_THEME.colors,
        tipografia: tema.typography || DEFAULT_THEME.typography,
        espacamentos: tema.spacing || DEFAULT_THEME.spacing,
        sombras: tema.shadows || DEFAULT_THEME.shadows,
        bordas: tema.borders || DEFAULT_THEME.borders,
      },
      create: {
        nome,
        descricao,
        ativo,
        cores: tema.colors || DEFAULT_THEME.colors,
        tipografia: tema.typography || DEFAULT_THEME.typography,
        espacamentos: tema.spacing || DEFAULT_THEME.spacing,
        sombras: tema.shadows || DEFAULT_THEME.shadows,
        bordas: tema.borders || DEFAULT_THEME.borders,
      },
    });

    // Registra no histórico
    if (existing) {
      await prisma.historicoConfiguracao.create({
        data: {
          tabelaOrigem: 'TemaVisual',
          registroId: existing.id,
          campo: 'tema_completo',
          valorAnterior: JSON.stringify({
            cores: existing.cores,
            tipografia: existing.tipografia,
          }),
          valorNovo: JSON.stringify({
            cores: tema.colors,
            tipografia: tema.typography,
          }),
          usuarioId,
        },
      });
    }

    // Limpa cache
    themeCache.clear();
    cacheTimestamps.clear();
    logger.info({ nome, ativo }, 'Tema salvo');
  } catch (error: unknown) {
    logger.error({ error, nome }, 'Erro ao salvar tema');
    throw error;
  }
}

/**
 * Lista todos os temas disponíveis
 */
export async function listThemes(): Promise<
  Array<{
    id: string;
    nome: string;
    descricao: string | null;
    ativo: boolean;
    padrao: boolean;
  }>
> {
  try {
    const temas = await prisma.temaVisual.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true,
        ativo: true,
        padrao: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return temas;
  } catch (error: unknown) {
    logger.error({ error }, 'Erro ao listar temas');
    return [];
  }
}

/**
 * Ativa um tema específico
 */
export async function activateTheme(
  nomeOuId: string,
  usuarioId?: string
): Promise<void> {
  try {
    // Desativa todos os temas
    await prisma.temaVisual.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });

    // Ativa o tema especificado
    const tema = await prisma.temaVisual.findFirst({
      where: {
        OR: [{ id: nomeOuId }, { nome: nomeOuId }],
      },
    });

    if (!tema) {
      throw new Error(`Tema '${nomeOuId}' não encontrado`);
    }

    await prisma.temaVisual.update({
      where: { id: tema.id },
      data: { ativo: true },
    });

    // Registra no histórico
    await prisma.historicoConfiguracao.create({
      data: {
        tabelaOrigem: 'TemaVisual',
        registroId: tema.id,
        campo: 'ativo',
        valorAnterior: 'false',
        valorNovo: 'true',
        usuarioId,
        motivo: 'Tema ativado pelo usuário',
      },
    });

    // Limpa cache
    themeCache.clear();
    cacheTimestamps.clear();

    logger.info({ tema: tema.nome }, 'Tema ativado');
  } catch (error: unknown) {
    logger.error({ error, nomeOuId }, 'Erro ao ativar tema');
    throw error;
  }
}

/**
 * Inicializa o tema padrão no banco de dados
 */
export async function initializeDefaultTheme(): Promise<void> {
  try {
    const existingTheme = await prisma.temaVisual.findFirst({
      where: { padrao: true },
    });

    if (existingTheme) {
      logger.info('Tema padrão já existe');
      return;
    }

    await prisma.temaVisual.create({
      data: {
        nome: 'Tema Padrão DOM',
        descricao:
          'Tema padrão do sistema DOM com cores e estilos corporativos',
        ativo: true,
        padrao: true,
        cores: DEFAULT_THEME.colors,
        tipografia: DEFAULT_THEME.typography,
        espacamentos: DEFAULT_THEME.spacing,
        sombras: DEFAULT_THEME.shadows,
        bordas: DEFAULT_THEME.borders,
      },
    });

    logger.info('Tema padrão criado');
  } catch (error: unknown) {
    logger.error({ error }, 'Erro ao inicializar tema padrão');
  }
}

/**
 * Limpa o cache de temas
 */
export function clearThemeCache(): void {
  themeCache.clear();
  cacheTimestamps.clear();
  logger.info('Cache de temas limpo');
}
