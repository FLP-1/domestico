/**
 * Serviço de Documentos Trabalhistas Especializados
 * Sistema DOM - Documentação Específica para Trabalho Doméstico
 * 
 * Funcionalidades:
 * - Gestão de documentos trabalhistas específicos
 * - Templates e guias para eSocial
 * - Checklist de documentos obrigatórios
 * - Validação automática para eSocial
 * - Integração com processos trabalhistas
 */

import prisma from '../lib/prisma';
import logger from '../lib/logger';

export type TipoDocumentoTrabalhista =
  | 'CTPS'
  | 'RG'
  | 'CPF'
  | 'COMP_RESIDENCIA'
  | 'CERTIDAO'
  | 'ASO'
  | 'BANCO'
  | 'TITULO_ELEITOR'
  | 'CONTRATO'
  | 'OUTRO';

export type CategoriaDocumento =
  | 'OBRIGATORIO'
  | 'MEDICO'
  | 'BANCARIO'
  | 'TRABALHISTA'
  | 'PESSOAL';

export interface CriarDocumentoTrabalhistaInput {
  usuarioId: string;
  tipo: TipoDocumentoTrabalhista;
  nome: string;
  numero?: string;
  orgaoEmissor?: string;
  emissao?: Date;
  validade?: Date;
  caminhoArquivo: string;
  observacoes?: string;
}

export interface AtualizarDocumentoTrabalhistaInput {
  nome?: string;
  numero?: string;
  orgaoEmissor?: string;
  emissao?: Date;
  validade?: Date;
  observacoes?: string;
  esocialPronto?: boolean;
  validado?: boolean;
}

export interface ChecklistDocumentoItem {
  tipo: TipoDocumentoTrabalhista;
  nome: string;
  obrigatorio: boolean;
  completo: boolean;
  documentoId?: string;
  observacoes?: string;
}

export interface ChecklistDocumentosInput {
  usuarioId: string;
  perfilId?: string;
  perfilTipo?: 'EMPREGADOR' | 'EMPREGADO';
  documentos: ChecklistDocumentoItem[];
}

class DocumentTrabalhistaService {
  /**
   * Criar documento trabalhista
   */
  async criarDocumento(
    input: CriarDocumentoTrabalhistaInput
  ): Promise<{ success: boolean; documentoId?: string; error?: string }> {
    try {
      const documento = await prisma.documentoTrabalhista.create({
        data: {
          usuarioId: input.usuarioId,
          tipo: input.tipo,
          nome: input.nome,
          numero: input.numero,
          orgaoEmissor: input.orgaoEmissor,
          emissao: input.emissao,
          validade: input.validade,
          caminhoArquivo: input.caminhoArquivo,
          observacoes: input.observacoes,
        },
      });

      logger.info(`✅ Documento trabalhista criado: ${documento.id}`);
      return { success: true, documentoId: documento.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao criar documento trabalhista'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Buscar documentos trabalhistas por usuário
   */
  async buscarDocumentosPorUsuario(
    usuarioId: string,
    tipo?: TipoDocumentoTrabalhista,
    esocialPronto?: boolean
  ) {
    try {
      const where: any = { usuarioId };
      if (tipo) where.tipo = tipo;
      if (esocialPronto !== undefined) where.esocialPronto = esocialPronto;

      const documentos = await prisma.documentoTrabalhista.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        include: {
          vinculacoes: true,
        },
      });

      return { success: true, documentos };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar documentos trabalhistas'
      );
      return { success: false, documentos: [], error: errorMessage };
    }
  }

  /**
   * Atualizar documento trabalhista
   */
  async atualizarDocumento(
    documentoId: string,
    input: AtualizarDocumentoTrabalhistaInput
  ) {
    try {
      const documento = await prisma.documentoTrabalhista.update({
        where: { id: documentoId },
        data: {
          ...input,
          validadoEm: input.validado ? new Date() : undefined,
        },
      });

      logger.info(`✅ Documento trabalhista atualizado: ${documentoId}`);
      return { success: true, documento };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao atualizar documento trabalhista'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Marcar documento como pronto para eSocial
   */
  async marcarProntoParaESocial(documentoId: string) {
    try {
      const documento = await prisma.documentoTrabalhista.update({
        where: { id: documentoId },
        data: { esocialPronto: true },
      });

      logger.info(`✅ Documento marcado como pronto para eSocial: ${documentoId}`);
      return { success: true, documento };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao marcar documento para eSocial'
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Validar documento automaticamente
   */
  async validarDocumento(
    documentoId: string,
    validadoPor: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.documentoTrabalhista.update({
        where: { id: documentoId },
        data: {
          validado: true,
          validadoEm: new Date(),
          validadoPor,
        },
      });

      logger.info(`✅ Documento validado: ${documentoId}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao validar documento'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Vincular documento a processo (eSocial, Folha, etc.)
   */
  async vincularDocumento(
    documentoId: string,
    vinculacaoTipo: 'ESOCIAL' | 'FOLHA' | 'TAREFA' | 'PONTO',
    vinculacaoId: string
  ) {
    try {
      const vinculacao = await prisma.documentoVinculacao.create({
        data: {
          documentoId,
          vinculacaoTipo,
          vinculacaoId,
        },
      });

      logger.info(
        `✅ Documento vinculado: ${documentoId} -> ${vinculacaoTipo}:${vinculacaoId}`
      );
      return { success: true, vinculacao };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao vincular documento'
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Criar ou atualizar checklist de documentos
   */
  async criarOuAtualizarChecklist(
    input: ChecklistDocumentosInput
  ): Promise<{ success: boolean; checklistId?: string; error?: string }> {
    try {
      const checklist = await prisma.checklistDocumentos.upsert({
        where: {
          usuarioId_perfilId: {
            usuarioId: input.usuarioId,
            perfilId: input.perfilId || '',
          },
        },
        create: {
          usuarioId: input.usuarioId,
          perfilId: input.perfilId,
          perfilTipo: input.perfilTipo,
          documentos: input.documentos as any,
          documentosCompletos: [],
          completo: false,
        },
        update: {
          documentos: input.documentos as any,
          perfilTipo: input.perfilTipo,
          atualizadoEm: new Date(),
        },
      });

      // Verificar se está completo
      const todosCompletos = input.documentos.every(
        doc => doc.obrigatorio === false || doc.completo === true
      );

      if (todosCompletos && !checklist.completo) {
        await prisma.checklistDocumentos.update({
          where: { id: checklist.id },
          data: {
            completo: true,
            completoEm: new Date(),
          },
        });
      }

      logger.info(`✅ Checklist criado/atualizado: ${checklist.id}`);
      return { success: true, checklistId: checklist.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao criar/atualizar checklist'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Buscar templates de documentos trabalhistas
   */
  async buscarTemplatesDocumentos(filtros?: {
    categoria?: string;
    esocialEvento?: string;
    esocialRequerido?: boolean;
    ativo?: boolean;
  }): Promise<{ success: boolean; templates?: any[]; error?: string }> {
    try {
      const where: any = {};
      
      if (filtros?.categoria) {
        where.categoria = filtros.categoria;
      }
      
      if (filtros?.esocialEvento) {
        where.esocialEvento = filtros.esocialEvento;
      }
      
      if (filtros?.esocialRequerido !== undefined) {
        where.esocialRequerido = filtros.esocialRequerido;
      }
      
      if (filtros?.ativo !== undefined) {
        where.ativo = filtros.ativo;
      } else {
        where.ativo = true; // Por padrão, apenas ativos
      }

      const templates = await prisma.templateDocumento.findMany({
        where,
        orderBy: [
          { esocialRequerido: 'desc' },
          { nome: 'asc' },
        ],
      });

      return { success: true, templates };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar templates de documentos'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Buscar checklist de documentos
   */
  async buscarChecklist(
    usuarioId: string,
    perfilId?: string
  ): Promise<{ success: boolean; checklist?: any; error?: string }> {
    try {
      const checklist = await prisma.checklistDocumentos.findUnique({
        where: {
          usuarioId_perfilId: {
            usuarioId,
            perfilId: perfilId || '',
          },
        },
      });

      return { success: true, checklist };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar checklist'
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Buscar documentos próximos ao vencimento
   */
  async buscarDocumentosProximosVencimento(
    usuarioId: string,
    diasAntecedencia: number = 30
  ) {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);

      const documentos = await prisma.documentoTrabalhista.findMany({
        where: {
          usuarioId,
          validade: {
            lte: dataLimite,
            gte: new Date(),
          },
        },
        orderBy: { validade: 'asc' },
      });

      return { success: true, documentos };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar documentos próximos ao vencimento'
      );
      return { success: false, documentos: [], error: errorMessage };
    }
  }

  /**
   * Buscar documentos necessários para eSocial
   */
  async buscarDocumentosNecessariosESocial(usuarioId: string) {
    try {
      const documentos = await prisma.documentoTrabalhista.findMany({
        where: {
          usuarioId,
          esocialPronto: false,
          tipo: {
            in: ['CTPS', 'RG', 'CPF', 'COMP_RESIDENCIA', 'CERTIDAO', 'ASO'],
          },
        },
        orderBy: { tipo: 'asc' },
      });

      return { success: true, documentos };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar documentos necessários para eSocial'
      );
      return { success: false, documentos: [], error: errorMessage };
    }
  }
}

// Instância singleton
let documentTrabalhistaServiceInstance: DocumentTrabalhistaService | null = null;

export const getDocumentTrabalhistaService = (): DocumentTrabalhistaService => {
  if (!documentTrabalhistaServiceInstance) {
    documentTrabalhistaServiceInstance = new DocumentTrabalhistaService();
  }
  return documentTrabalhistaServiceInstance;
};

export default DocumentTrabalhistaService;

