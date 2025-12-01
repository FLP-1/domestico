/**
 * CONSTANTES CENTRALIZADAS - Tipos de Documentos Trabalhistas
 * Sistema DOM - Documentação Trabalhista Especializada
 *
 * Centraliza todas as definições de tipos de documentos trabalhistas
 * para evitar duplicação e hardcoding
 */

import {
  TipoDocumentoTrabalhista,
  CategoriaDocumento,
} from '../services/documentTrabalhistaService';

export interface TipoDocumentoInfo {
  tipo: TipoDocumentoTrabalhista;
  nome: string;
  categoria: CategoriaDocumento;
  icon: string;
  esocialRequerido: boolean;
  obrigatorio: boolean;
}

/**
 * Tipos de documentos trabalhistas com informações completas
 * Usado em toda a aplicação para manter consistência
 */
export const TIPOS_DOCUMENTOS_TRABALHISTAS: TipoDocumentoInfo[] = [
  // Obrigatórios
  {
    tipo: 'CTPS',
    nome: 'CTPS (Carteira de Trabalho)',
    categoria: 'OBRIGATORIO',
    icon: '📘',
    esocialRequerido: true,
    obrigatorio: true,
  },
  {
    tipo: 'RG',
    nome: 'RG (Registro Geral)',
    categoria: 'OBRIGATORIO',
    icon: '🆔',
    esocialRequerido: true,
    obrigatorio: true,
  },
  {
    tipo: 'CPF',
    nome: 'CPF (Cadastro de Pessoa Física)',
    categoria: 'OBRIGATORIO',
    icon: '💳',
    esocialRequerido: true,
    obrigatorio: true,
  },
  {
    tipo: 'COMP_RESIDENCIA',
    nome: 'Comprovante de Residência',
    categoria: 'OBRIGATORIO',
    icon: '🏠',
    esocialRequerido: true,
    obrigatorio: true,
  },
  {
    tipo: 'CERTIDAO',
    nome: 'Certidão (Nascimento/Casamento)',
    categoria: 'OBRIGATORIO',
    icon: '📜',
    esocialRequerido: true,
    obrigatorio: true,
  },
  {
    tipo: 'TITULO_ELEITOR',
    nome: 'Título de Eleitor',
    categoria: 'OBRIGATORIO',
    icon: '🗳️',
    esocialRequerido: false,
    obrigatorio: true,
  },

  // Médicos
  {
    tipo: 'ASO',
    nome: 'ASO (Atestado de Saúde Ocupacional)',
    categoria: 'MEDICO',
    icon: '🏥',
    esocialRequerido: true,
    obrigatorio: true,
  },

  // Bancários
  {
    tipo: 'BANCO',
    nome: 'Comprovante Bancário',
    categoria: 'BANCARIO',
    icon: '🏦',
    esocialRequerido: true,
    obrigatorio: true,
  },

  // Trabalhistas
  {
    tipo: 'CONTRATO',
    nome: 'Contrato de Trabalho',
    categoria: 'TRABALHISTA',
    icon: '📝',
    esocialRequerido: false,
    obrigatorio: false,
  },

  // Outros
  {
    tipo: 'OUTRO',
    nome: 'Outro Documento',
    categoria: 'PESSOAL',
    icon: '📄',
    esocialRequerido: false,
    obrigatorio: false,
  },
];

/**
 * Função auxiliar para obter informações de um tipo de documento
 */
export function getTipoDocumentoInfo(
  tipo: TipoDocumentoTrabalhista
): TipoDocumentoInfo {
  return (
    TIPOS_DOCUMENTOS_TRABALHISTAS.find(t => t.tipo === tipo) ||
    TIPOS_DOCUMENTOS_TRABALHISTAS[TIPOS_DOCUMENTOS_TRABALHISTAS.length - 1]!
  );
}

/**
 * Obter tipos de documentos por categoria
 */
export function getTiposPorCategoria(
  categoria: CategoriaDocumento
): TipoDocumentoInfo[] {
  return TIPOS_DOCUMENTOS_TRABALHISTAS.filter(t => t.categoria === categoria);
}

/**
 * Obter tipos de documentos obrigatórios
 */
export function getTiposObrigatorios(): TipoDocumentoInfo[] {
  return TIPOS_DOCUMENTOS_TRABALHISTAS.filter(t => t.obrigatorio);
}

/**
 * Obter tipos de documentos requeridos para eSocial
 */
export function getTiposESocialRequeridos(): TipoDocumentoInfo[] {
  return TIPOS_DOCUMENTOS_TRABALHISTAS.filter(t => t.esocialRequerido);
}
