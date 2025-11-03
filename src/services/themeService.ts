/**
 * Serviço de Tema e Configurações Visuais
 * Gerencia temas dinâmicos do banco de dados
 */

import prisma from '../lib/prisma';
import { theme as defaultTheme } from '../config/theme';
import logger from '../lib/logger';

// Cache em memória para temas
let cachedTheme: typeof defaultTheme | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém o tema ativo do banco de dados
 */
export async function getActiveTheme(): Promise<typeof defaultTheme> {
  try {
    // Verifica cache
    if (cachedTheme && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedTheme;
    }

    const temaAtivo = await prisma.temaVisual.findFirst({
      where: { ativo: true },
    });

    if (!temaAtivo) {
      cachedTheme = defaultTheme;
      cacheTimestamp = Date.now();
      return defaultTheme;
    }

    // Merge com tema padrão para garantir que todos os campos existam
    const tema = {
      colors: { ...defaultTheme.colors, ...(temaAtivo.cores as any) },
      typography: { ...defaultTheme.typography, ...(temaAtivo.tipografia as any) },
      spacing: { ...defaultTheme.spacing, ...(temaAtivo.espacamentos as any) },
      shadows: { ...defaultTheme.shadows, ...(temaAtivo.sombras as any) },
      borders: { ...defaultTheme.borders, ...(temaAtivo.bordas as any) },
      breakpoints: defaultTheme.breakpoints,
      zIndex: defaultTheme.zIndex,
      transitions: defaultTheme.transitions,
    };

    cachedTheme = tema;
    cacheTimestamp = Date.now();

    return tema;
  } catch (error: unknown) {
    logger.error({ error }, 'Erro ao obter tema ativo');
    return defaultTheme;
  }
}

/**
 * Cria ou atualiza um tema visual
 */
export async function saveTheme(
  nome: string,
  tema: Partial<typeof defaultTheme>,
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
        cores: tema.colors || defaultTheme.colors,
        tipografia: tema.typography || defaultTheme.typography,
        espacamentos: tema.spacing || defaultTheme.spacing,
        sombras: tema.shadows || defaultTheme.shadows,
        bordas: tema.borders || defaultTheme.borders,
      },
      create: {
        nome,
        descricao,
        ativo,
        cores: tema.colors || defaultTheme.colors,
        tipografia: tema.typography || defaultTheme.typography,
        espacamentos: tema.spacing || defaultTheme.spacing,
        sombras: tema.shadows || defaultTheme.shadows,
        bordas: tema.borders || defaultTheme.borders,
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
    cachedTheme = null;

    logger.info({ nome, ativo }, 'Tema salvo');
  } catch (error: unknown) {
    logger.error({ error, nome }, 'Erro ao salvar tema');
    throw error;
  }
}

/**
 * Lista todos os temas disponíveis
 */
export async function listThemes(): Promise<Array<{
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  padrao: boolean;
}>> {
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
export async function activateTheme(nomeOuId: string, usuarioId?: string): Promise<void> {
  try {
    // Desativa todos os temas
    await prisma.temaVisual.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });

    // Ativa o tema especificado
    const tema = await prisma.temaVisual.findFirst({
      where: {
        OR: [
          { id: nomeOuId },
          { nome: nomeOuId },
        ],
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
    cachedTheme = null;

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
        descricao: 'Tema padrão do sistema DOM com cores e estilos corporativos',
        ativo: true,
        padrao: true,
        cores: defaultTheme.colors,
        tipografia: defaultTheme.typography,
        espacamentos: defaultTheme.spacing,
        sombras: defaultTheme.shadows,
        bordas: defaultTheme.borders,
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
  cachedTheme = null;
  cacheTimestamp = 0;
  logger.info('Cache de temas limpo');
}
