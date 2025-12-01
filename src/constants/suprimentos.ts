/**
 * Constantes: Gestão de Suprimentos
 * Sistema DOM - Centralização de Constantes
 */

import type { TipoServico, CategoriaItem, UnidadeMedida } from '../services/suprimentosService';

export const TIPOS_SERVICO: Array<{ value: TipoServico; label: string; icon: string }> = [
  { value: 'LIMPEZA', label: 'Limpeza', icon: '🧹' },
  { value: 'COZINHA', label: 'Cozinha', icon: '🍳' },
  { value: 'ORGANIZACAO', label: 'Organização', icon: '📦' },
  { value: 'MANUTENCAO', label: 'Manutenção', icon: '🔧' },
  { value: 'GERAL', label: 'Geral', icon: '🛒' },
];

export const CATEGORIAS_ITEM: Array<{ value: CategoriaItem; label: string }> = [
  { value: 'LIMPEZA', label: 'Limpeza' },
  { value: 'ALIMENTO', label: 'Alimento' },
  { value: 'UTENSILIO', label: 'Utensílio' },
  { value: 'ORGANIZACAO', label: 'Organização' },
  { value: 'OUTRO', label: 'Outro' },
];

export const UNIDADES: Array<{ value: UnidadeMedida; label: string }> = [
  { value: 'UN', label: 'Unidade' },
  { value: 'KG', label: 'Quilograma' },
  { value: 'L', label: 'Litro' },
  { value: 'CX', label: 'Caixa' },
  { value: 'PCT', label: 'Pacote' },
];

/**
 * Helper: Obter informações de tipo de serviço
 */
export const getTipoServicoInfo = (tipo: TipoServico) => {
  return TIPOS_SERVICO.find(t => t.value === tipo) || TIPOS_SERVICO[TIPOS_SERVICO.length - 1];
};

/**
 * Helper: Obter informações de categoria
 */
export const getCategoriaInfo = (categoria: CategoriaItem) => {
  return CATEGORIAS_ITEM.find(c => c.value === categoria) || CATEGORIAS_ITEM[CATEGORIAS_ITEM.length - 1];
};

/**
 * Helper: Obter informações de unidade
 */
export const getUnidadeInfo = (unidade: UnidadeMedida) => {
  return UNIDADES.find(u => u.value === unidade) || UNIDADES[0];
};

