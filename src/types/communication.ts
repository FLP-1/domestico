/**
 * Tipos: Comunicação Contextual
 * Sistema DOM - Centralização de Tipos
 */

import type { ContextoTipo } from '../services/communicationService';

export interface MensagemContextual {
  id: string;
  conteudo: string;
  remetenteId: string;
  remetente: {
    id: string;
    nomeCompleto: string;
    apelido?: string;
  };
  origem?: string;
  alertaId?: string;
  alerta?: {
    id: string;
    titulo: string;
    prioridade: string;
  };
  lida: boolean;
  criadoEm: string;
  contextoTipo: ContextoTipo;
  contextoId: string;
  respostaParaId?: string;
}

export interface ContextoComunicacao {
  contextoTipo: ContextoTipo;
  contextoId: string;
  titulo: string;
  descricao?: string;
  ultimaMensagem?: MensagemContextual;
  totalMensagens: number;
  mensagensNaoLidas: number;
  icon: string;
}

