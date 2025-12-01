/**
 * Serviço de Gestão Inteligente de Suprimentos
 * Sistema DOM - Reformulação de Compras
 * 
 * Gestão inteligente de suprimentos domésticos vinculada a:
 * - Rotinas de trabalho
 * - Tarefas específicas
 * - Controle de estoque
 * - Templates por tipo de serviço
 */

import prisma from '../lib/prisma';
import logger from '../lib/logger';

export type TipoServico = 'LIMPEZA' | 'COZINHA' | 'ORGANIZACAO' | 'MANUTENCAO' | 'GERAL';
export type CategoriaItem = 'LIMPEZA' | 'ALIMENTO' | 'UTENSILIO' | 'ORGANIZACAO' | 'OUTRO';
export type UnidadeMedida = 'UN' | 'KG' | 'L' | 'CX' | 'PCT';

export interface CriarListaSuprimentosInput {
  usuarioId: string;
  nome: string;
  tipoServico: TipoServico;
  templateId?: string;
  vinculadaTarefa?: string;
  orcamento?: number;
  descricao?: string;
}

export interface CriarItemSuprimentoInput {
  listaId: string;
  nome: string;
  categoria: CategoriaItem;
  quantidade: number;
  unidade: UnidadeMedida;
  precoEstimado?: number;
  fornecedor?: string;
  estoqueMinimo?: number;
  observacao?: string;
}

export interface CriarTemplateListaInput {
  nome: string;
  tipoServico: TipoServico;
  descricao?: string;
  itensPadrao: Array<{
    nome: string;
    categoria: CategoriaItem;
    quantidade: number;
    unidade: UnidadeMedida;
    precoEstimado?: number;
  }>;
}

export interface CriarEstoqueDomesticoInput {
  usuarioId: string;
  itemNome: string;
  categoria: CategoriaItem;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidade: UnidadeMedida;
  fornecedorPreferido?: string;
  precoMedio?: number;
  localArmazenamento?: string;
  validade?: Date;
}

class SuprimentosService {
  /**
   * Criar lista de suprimentos
   */
  async criarListaSuprimentos(input: CriarListaSuprimentosInput) {
    try {
      const lista = await prisma.listaSuprimentos.create({
        data: {
          usuarioId: input.usuarioId,
          nome: input.nome,
          tipoServico: input.tipoServico,
          templateId: input.templateId,
          vinculadaTarefa: input.vinculadaTarefa,
          orcamento: input.orcamento,
          descricao: input.descricao,
        },
        include: {
          itens: true,
          template: true,
        },
      });

      logger.info(`✅ Lista de suprimentos criada: ${lista.id}`);
      return { success: true, lista };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao criar lista de suprimentos'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Buscar listas de suprimentos por usuário
   */
  async buscarListasPorUsuario(
    usuarioId: string,
    tipoServico?: TipoServico,
    ativa?: boolean
  ) {
    try {
      const where: any = { usuarioId };
      if (tipoServico) where.tipoServico = tipoServico;
      if (ativa !== undefined) where.ativa = ativa;

      const listas = await prisma.listaSuprimentos.findMany({
        where,
        include: {
          itens: {
            orderBy: { ordem: 'asc' },
          },
          template: true,
        },
        orderBy: { criadoEm: 'desc' },
      });

      return { success: true, listas };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar listas de suprimentos'
      );
      return { success: false, listas: [], error: errorMessage };
    }
  }

  /**
   * Adicionar item à lista de suprimentos
   */
  async adicionarItem(input: CriarItemSuprimentoInput) {
    try {
      // Buscar último item para definir ordem
      const ultimoItem = await prisma.itemSuprimento.findFirst({
        where: { listaId: input.listaId },
        orderBy: { ordem: 'desc' },
      });

      const item = await prisma.itemSuprimento.create({
        data: {
          listaId: input.listaId,
          nome: input.nome,
          categoria: input.categoria,
          quantidade: input.quantidade,
          unidade: input.unidade,
          precoEstimado: input.precoEstimado,
          fornecedor: input.fornecedor,
          estoqueMinimo: input.estoqueMinimo,
          observacao: input.observacao,
          ordem: ultimoItem ? ultimoItem.ordem + 1 : 0,
        },
      });

      logger.info(`✅ Item adicionado à lista: ${item.id}`);
      return { success: true, item };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao adicionar item'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Marcar item como comprado
   */
  async marcarItemComprado(
    itemId: string,
    compradoPor: string,
    precoReal?: number
  ) {
    try {
      // Buscar item com lista e usuário
      const itemCompleto = await prisma.itemSuprimento.findUnique({
        where: { id: itemId },
        include: {
          lista: {
            select: {
              usuarioId: true,
            },
          },
        },
      });

      if (!itemCompleto) {
        return { success: false, error: 'Item não encontrado' };
      }

      const item = await prisma.itemSuprimento.update({
        where: { id: itemId },
        data: {
          comprado: true,
          compradoEm: new Date(),
          compradoPor,
          precoReal,
        },
      });

      // Atualizar estoque se houver estoque atual definido
      if (item.estoqueAtual !== null) {
        await this.atualizarEstoque(
          itemCompleto.lista.usuarioId,
          item.nome,
          Number(item.estoqueAtual) + Number(item.quantidade),
          item.categoria as CategoriaItem,
          item.unidade as UnidadeMedida
        );
      }

      logger.info(`✅ Item marcado como comprado: ${itemId}`);
      return { success: true, item };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao marcar item como comprado'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Criar template de lista
   */
  async criarTemplate(input: CriarTemplateListaInput) {
    try {
      const template = await prisma.templateLista.create({
        data: {
          nome: input.nome,
          tipoServico: input.tipoServico,
          descricao: input.descricao,
          itensPadrao: input.itensPadrao as any,
        },
      });

      logger.info(`✅ Template de lista criado: ${template.id}`);
      return { success: true, template };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao criar template'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Buscar templates por tipo de serviço
   */
  async buscarTemplates(tipoServico?: TipoServico, ativo?: boolean) {
    try {
      const where: any = {};
      if (tipoServico) where.tipoServico = tipoServico;
      if (ativo !== undefined) where.ativo = ativo;

      const templates = await prisma.templateLista.findMany({
        where,
        orderBy: { nome: 'asc' },
      });

      return { success: true, templates };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar templates'
      );
      return { success: false, templates: [], error: errorMessage };
    }
  }

  /**
   * Criar lista a partir de template
   */
  async criarListaDeTemplate(
    usuarioId: string,
    templateId: string,
    nome?: string,
    vinculadaTarefa?: string
  ) {
    try {
      const template = await prisma.templateLista.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return { success: false, error: 'Template não encontrado' };
      }

      // Criar lista
      const lista = await prisma.listaSuprimentos.create({
        data: {
          usuarioId,
          nome: nome || template.nome,
          tipoServico: template.tipoServico,
          templateId: template.id,
          vinculadaTarefa,
        },
      });

      // Adicionar itens do template
      const itensPadrao = template.itensPadrao as any[];
      if (Array.isArray(itensPadrao)) {
        for (let i = 0; i < itensPadrao.length; i++) {
          const itemPadrao = itensPadrao[i];
          await prisma.itemSuprimento.create({
            data: {
              listaId: lista.id,
              nome: itemPadrao.nome,
              categoria: itemPadrao.categoria,
              quantidade: itemPadrao.quantidade,
              unidade: itemPadrao.unidade,
              precoEstimado: itemPadrao.precoEstimado,
              ordem: i,
            },
          });
        }
      }

      logger.info(`✅ Lista criada a partir de template: ${lista.id}`);
      return { success: true, lista };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao criar lista de template'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Criar ou atualizar estoque doméstico
   */
  async criarOuAtualizarEstoque(input: CriarEstoqueDomesticoInput) {
    try {
      const estoque = await prisma.estoqueDomestico.upsert({
        where: {
          usuarioId_itemNome: {
            usuarioId: input.usuarioId,
            itemNome: input.itemNome,
          },
        },
        create: {
          usuarioId: input.usuarioId,
          itemNome: input.itemNome,
          categoria: input.categoria,
          quantidadeAtual: input.quantidadeAtual,
          quantidadeMinima: input.quantidadeMinima,
          unidade: input.unidade,
          fornecedorPreferido: input.fornecedorPreferido,
          precoMedio: input.precoMedio,
          localArmazenamento: input.localArmazenamento,
          validade: input.validade,
        },
        update: {
          quantidadeAtual: input.quantidadeAtual,
          quantidadeMinima: input.quantidadeMinima,
          fornecedorPreferido: input.fornecedorPreferido,
          precoMedio: input.precoMedio,
          localArmazenamento: input.localArmazenamento,
          validade: input.validade,
          ultimaCompra: new Date(),
        },
      });

      logger.info(`✅ Estoque atualizado: ${estoque.id}`);
      return { success: true, estoque };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao atualizar estoque'
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Atualizar estoque (método auxiliar)
   */
  private async atualizarEstoque(
    usuarioId: string,
    itemNome: string,
    quantidadeAtual: number,
    categoria: CategoriaItem,
    unidade: UnidadeMedida
  ) {
    try {
      await prisma.estoqueDomestico.upsert({
        where: {
          usuarioId_itemNome: {
            usuarioId,
            itemNome,
          },
        },
        create: {
          usuarioId,
          itemNome,
          categoria,
          quantidadeAtual,
          quantidadeMinima: quantidadeAtual * 0.2, // 20% como mínimo padrão
          unidade,
          ultimoUso: new Date(),
        },
        update: {
          quantidadeAtual,
          ultimoUso: new Date(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao atualizar estoque auxiliar'
      );
    }
  }

  /**
   * Buscar estoque por usuário
   */
  async buscarEstoquePorUsuario(
    usuarioId: string,
    categoria?: CategoriaItem,
    abaixoMinimo?: boolean
  ) {
    try {
      const estoque = await prisma.estoqueDomestico.findMany({
        where: { usuarioId },
        orderBy: [
          { quantidadeAtual: 'asc' }, // Itens com menor estoque primeiro
          { itemNome: 'asc' },
        ],
      });

      // Filtrar por categoria e abaixo do mínimo se necessário
      let estoqueFiltrado = estoque;
      if (categoria) {
        estoqueFiltrado = estoqueFiltrado.filter(e => e.categoria === categoria);
      }
      if (abaixoMinimo) {
        estoqueFiltrado = estoqueFiltrado.filter(
          e => Number(e.quantidadeAtual) <= Number(e.quantidadeMinima)
        );
      }

      return { success: true, estoque: estoqueFiltrado };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar estoque'
      );
      return { success: false, estoque: [], error: errorMessage };
    }
  }

  /**
   * Buscar itens com estoque abaixo do mínimo
   */
  async buscarItensAbaixoMinimo(usuarioId: string) {
    try {
      const todosItens = await prisma.estoqueDomestico.findMany({
        where: { usuarioId },
      });

      const estoque = todosItens.filter(
        item => Number(item.quantidadeAtual) <= Number(item.quantidadeMinima)
      );

      return { success: true, estoque };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error(
        {
          error: errorMessage,
          originalError: error instanceof Error ? error.stack : String(error),
        },
        '❌ Erro ao buscar itens abaixo do mínimo'
      );
      return { success: false, estoque: [], error: errorMessage };
    }
  }
}

// Instância singleton
let suprimentosServiceInstance: SuprimentosService | null = null;

export const getSuprimentosService = (): SuprimentosService => {
  if (!suprimentosServiceInstance) {
    suprimentosServiceInstance = new SuprimentosService();
  }
  return suprimentosServiceInstance;
};

export default SuprimentosService;

