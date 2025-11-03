/**
 * Tipos TypeScript para Modelos do Prisma
 * Complementa os tipos gerados automaticamente pelo Prisma Client
 */

import { Prisma } from '@prisma/client';

// Tipos de usuário com relações comuns
export type UsuarioComPerfis = Prisma.UsuarioGetPayload<{
  include: {
    perfis: {
      include: {
        perfil: true;
      };
    };
  };
}>;

export type UsuarioComGrupos = Prisma.UsuarioGetPayload<{
  include: {
    gruposUsuario: {
      include: {
        grupo: true;
      };
    };
  };
}>;

export type UsuarioCompleto = Prisma.UsuarioGetPayload<{
  include: {
    perfis: {
      include: {
        perfil: true;
      };
    };
    gruposUsuario: {
      include: {
        grupo: true;
      };
    };
  };
}>;

// Tipos de registro de ponto
export type RegistroPontoComLocal = Prisma.RegistroPontoGetPayload<{
  include: {
    localTrabalho: true;
    usuario: {
      select: {
        id: true;
        nomeCompleto: true;
        cpf: true;
      };
    };
  };
}>;

// Tipos de documento
export type DocumentoComUsuario = Prisma.DocumentoGetPayload<{
  include: {
    usuario: {
      select: {
        id: true;
        nomeCompleto: true;
        cpf: true;
      };
    };
  };
}>;

// Tipos de empregador
export type EmpregadorComCertificado = Prisma.EmpregadorGetPayload<{
  include: {
    certificadoDigital: true;
  };
}>;

// Tipos de eventos eSocial
export type EventoESocialCompleto = Prisma.EventoESocialGetPayload<{
  include: {
    empregador: true;
  };
}>;

// Tipos de tarefa
export type TarefaComRelacoes = Prisma.TarefaGetPayload<{
  include: {
    atribuidoPara: {
      select: {
        id: true;
        nomeCompleto: true;
      };
    };
    criadoPor: {
      select: {
        id: true;
        nomeCompleto: true;
      };
    };
    comentarios: {
      include: {
        usuario: {
          select: {
            id: true;
            nomeCompleto: true;
          };
        };
      };
    };
  };
}>;

// Tipos de mensagem
export type MensagemComUsuario = Prisma.MensagemGetPayload<{
  include: {
    usuario: {
      select: {
        id: true;
        nomeCompleto: true;
        apelido: true;
      };
    };
    leituras: true;
    reacoes: true;
  };
}>;

// Tipos de log de auditoria
export type LogAuditoriaCompleto = Prisma.LogAuditoriaGetPayload<{
  include: {
    usuario: {
      select: {
        id: true;
        nomeCompleto: true;
        cpf: true;
      };
    };
  };
}>;

// Enums úteis
export enum TipoRegistroPonto {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  PAUSA = 'PAUSA',
  RETORNO_PAUSA = 'RETORNO_PAUSA',
}

export enum TipoDocumento {
  RG = 'RG',
  CPF = 'CPF',
  CTPS = 'CTPS',
  CONTRATO = 'CONTRATO',
  COMPROVANTE_RESIDENCIA = 'COMPROVANTE_RESIDENCIA',
  CERTIFICADO_DIGITAL = 'CERTIFICADO_DIGITAL',
  OUTRO = 'OUTRO',
}

export enum StatusTarefa {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export enum PrioridadeTarefa {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

// Tipos para respostas de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipos para autenticação
export interface LoginRequest {
  cpf: string;
  senha: string;
  locationData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    cpf: string;
    nomeCompleto: string;
    email: string;
    perfis: Array<{
      id: string;
      nome: string;
    }>;
    grupos: Array<{
      id: string;
      nome: string;
    }>;
  };
}

// Tipos para registro de ponto
export interface RegistroPontoRequest {
  usuarioId: string;
  localId: string;
  tipo: TipoRegistroPonto;
  latitude: number;
  longitude: number;
  observacao?: string;
}

export interface RegistroPontoResponse {
  registro: {
    id: string;
    tipo: TipoRegistroPonto;
    dataHora: Date;
    latitude: number;
    longitude: number;
  };
  geofencingValidado: boolean;
  distancia?: number;
}

// Tipos para upload de documentos
export interface DocumentoUploadRequest {
  usuarioId: string;
  nome: string;
  tipo: TipoDocumento;
  tamanho: number;
  mimeType: string;
}

export interface DocumentoUploadResponse {
  documento: {
    id: string;
    nome: string;
    tipo: TipoDocumento;
    tamanho: number;
    caminhoArquivo: string;
    criadoEm: Date;
  };
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
