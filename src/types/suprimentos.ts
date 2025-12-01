/**
 * Tipos: Gestão de Suprimentos
 * Sistema DOM - Centralização de Tipos
 */

import type { TipoServico, CategoriaItem, UnidadeMedida } from '../services/suprimentosService';

export interface ListaSuprimentos {
  id: string;
  nome: string;
  tipoServico: TipoServico;
  templateId?: string;
  vinculadaTarefa?: string;
  orcamento?: number;
  descricao?: string;
  ativa: boolean;
  concluida: boolean;
  criadoEm: string;
  itens: ItemSuprimento[];
  template?: {
    id: string;
    nome: string;
  };
}

export interface ItemSuprimento {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  quantidade: number;
  unidade: UnidadeMedida;
  precoEstimado?: number;
  precoReal?: number;
  fornecedor?: string;
  comprado: boolean;
  compradoEm?: string;
  estoqueMinimo?: number;
  observacao?: string;
}

export interface TemplateLista {
  id: string;
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
  ativo: boolean;
}

export interface EstoqueDomestico {
  id: string;
  itemNome: string;
  categoria: CategoriaItem;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidade: UnidadeMedida;
  fornecedorPreferido?: string;
  precoMedio?: number;
  localArmazenamento?: string;
}

export interface Tarefa {
  id: string;
  title: string;
  status: string;
}

