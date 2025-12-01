/**
 * Serviço de Comunicação Contextual Simplificado
 * Sistema DOM - Arquitetura sem Redundância
 *
 * Princípio: Uma mensagem contextual serve para tudo:
 * - Histórico de comunicação
 * - Notificações (Toast é apenas visualização)
 * - Alertas (criam mensagens contextuais)
 * - Interação bidirecional
 */

import prisma from '../lib/prisma';
import { toast } from 'react-toastify';

export type ContextoTipo = 'PONTO' | 'TAREFA' | 'DOCUMENTO' | 'FOLHA';
export type OrigemMensagem = 'ALERTA' | 'ACAO' | 'SISTEMA' | 'USUARIO';
export type TipoMensagem = 'TEXTO' | 'ALERTA' | 'NOTIFICACAO' | 'SISTEMA';

export interface CriarMensagemContextualInput {
  usuarioId: string;
  contextoTipo: ContextoTipo;
  contextoId: string;
  remetenteId: string; // 'SISTEMA' ou ID do usuário
  destinatarioId?: string;
  conteudo: string;
  origem?: OrigemMensagem;
  alertaId?: string;
  tipo?: TipoMensagem;
  exibirToast?: boolean; // Se deve exibir Toast automaticamente
  tipoToast?: 'success' | 'error' | 'warning' | 'info';
}

export interface BuscarMensagensContextuaisInput {
  usuarioId: string;
  contextoTipo?: ContextoTipo;
  contextoId?: string;
  origem?: OrigemMensagem;
  alertaId?: string;
  lida?: boolean;
  limit?: number;
  offset?: number;
}

class CommunicationService {
  /**
   * Criar mensagem contextual (único armazenamento)
   */
  async criarMensagemContextual(input: CriarMensagemContextualInput) {
    try {
      // Criar mensagem contextual
      const mensagem = await prisma.mensagem.create({
        data: {
          conversaId: null, // Mensagens contextuais não têm conversa
          remetenteId: input.remetenteId,
          conteudo: input.conteudo,
          tipo: input.tipo || 'TEXTO',
          contextoTipo: input.contextoTipo,
          contextoId: input.contextoId,
          origem: input.origem || 'SISTEMA',
          alertaId: input.alertaId,
          exibidaToast: false,
          lida: false,
        },
        include: {
          remetente: {
            select: {
              id: true,
              nomeCompleto: true,
              apelido: true,
            },
          },
          alerta: {
            select: {
              id: true,
              titulo: true,
              prioridade: true,
            },
          },
        },
      });

      // Exibir Toast se solicitado (apenas visualização - não armazena)
      if (input.exibirToast) {
        const tipoToast = input.tipoToast || 'info';
        const titulo =
          input.alertaId && mensagem.alerta
            ? mensagem.alerta.titulo
            : undefined;

        // Concatenar título com conteúdo (react-toastify não suporta title separado)
        const mensagemToast = titulo
          ? `${titulo}: ${input.conteudo}`
          : input.conteudo;

        toast[tipoToast](mensagemToast, {
          autoClose: 5000,
        });

        // Marcar como exibida
        await prisma.mensagem.update({
          where: { id: mensagem.id },
          data: { exibidaToast: true },
        });
      }

      return mensagem;
    } catch (error) {
      console.error('Erro ao criar mensagem contextual:', error);
      throw error;
    }
  }

  /**
   * Processar evento e criar mensagem contextual a partir de alerta
   */
  async processarEventoAlerta(event: {
    usuarioId: string;
    contextoTipo: ContextoTipo;
    contextoId: string;
    alertaId: string;
    conteudo?: string;
  }) {
    try {
      // Buscar alerta
      const alerta = await prisma.alerta.findUnique({
        where: { id: event.alertaId },
      });

      if (!alerta) {
        throw new Error(`Alerta ${event.alertaId} não encontrado`);
      }

      // Criar mensagem contextual a partir do alerta
      const mensagem = await this.criarMensagemContextual({
        usuarioId: event.usuarioId,
        contextoTipo: event.contextoTipo,
        contextoId: event.contextoId,
        remetenteId: 'SISTEMA',
        conteudo: event.conteudo || alerta.textoNotificacao || alerta.descricao,
        origem: 'ALERTA',
        alertaId: event.alertaId,
        tipo: 'ALERTA',
        exibirToast: true,
        tipoToast: this.prioridadeParaTipoToast(alerta.prioridade),
      });

      return mensagem;
    } catch (error) {
      console.error('Erro ao processar evento de alerta:', error);
      throw error;
    }
  }

  /**
   * Buscar mensagens contextuais
   */
  async buscarMensagensContextuais(input: BuscarMensagensContextuaisInput) {
    try {
      const where: any = {
        conversaId: null, // Apenas mensagens contextuais (sem conversa)
        OR: [
          { remetenteId: input.usuarioId },
          { destinatarioId: input.usuarioId },
        ],
      };

      if (input.contextoTipo) {
        where.contextoTipo = input.contextoTipo;
      }

      if (input.contextoId) {
        where.contextoId = input.contextoId;
      }

      if (input.origem) {
        where.origem = input.origem;
      }

      if (input.alertaId) {
        where.alertaId = input.alertaId;
      }

      if (input.lida !== undefined) {
        where.lida = input.lida;
      }

      const mensagens = await prisma.mensagem.findMany({
        where,
        include: {
          remetente: {
            select: {
              id: true,
              nomeCompleto: true,
              apelido: true,
            },
          },
          alerta: {
            select: {
              id: true,
              titulo: true,
              prioridade: true,
            },
          },
        },
        orderBy: {
          criadoEm: 'desc',
        },
        take: input.limit || 50,
        skip: input.offset || 0,
      });

      return mensagens;
    } catch (error) {
      console.error('Erro ao buscar mensagens contextuais:', error);
      throw error;
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async marcarComoLida(mensagemId: string) {
    try {
      const mensagem = await prisma.mensagem.update({
        where: { id: mensagemId },
        data: { lida: true },
      });

      return mensagem;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      throw error;
    }
  }

  /**
   * Responder mensagem contextual
   */
  async responderMensagem(
    mensagemOriginalId: string,
    resposta: {
      remetenteId: string;
      conteudo: string;
    }
  ) {
    try {
      // Buscar mensagem original
      const mensagemOriginal = await prisma.mensagem.findUnique({
        where: { id: mensagemOriginalId },
      });

      if (!mensagemOriginal) {
        throw new Error(`Mensagem ${mensagemOriginalId} não encontrada`);
      }

      // Criar resposta (mantém contexto)
      const respostaMensagem = await prisma.mensagem.create({
        data: {
          conversaId: null,
          remetenteId: resposta.remetenteId,
          conteudo: resposta.conteudo,
          tipo: 'TEXTO',
          contextoTipo: mensagemOriginal.contextoTipo,
          contextoId: mensagemOriginal.contextoId,
          origem: 'USUARIO',
          respostaParaId: mensagemOriginalId,
          lida: false,
        },
        include: {
          remetente: {
            select: {
              id: true,
              nomeCompleto: true,
              apelido: true,
            },
          },
        },
      });

      return respostaMensagem;
    } catch (error) {
      console.error('Erro ao responder mensagem:', error);
      throw error;
    }
  }

  /**
   * Converter prioridade de alerta para tipo de Toast
   */
  private prioridadeParaTipoToast(
    prioridade: string
  ): 'success' | 'error' | 'warning' | 'info' {
    const prioridadeLower = prioridade.toLowerCase();

    if (prioridadeLower === 'urgente' || prioridadeLower === 'alta') {
      return 'error';
    }

    if (prioridadeLower === 'media' || prioridadeLower === 'média') {
      return 'warning';
    }

    if (prioridadeLower === 'baixa') {
      return 'info';
    }

    return 'info';
  }

  /**
   * Contar mensagens não lidas por contexto
   */
  async contarNaoLidas(
    usuarioId: string,
    contextoTipo?: ContextoTipo,
    contextoId?: string
  ) {
    try {
      const where: any = {
        conversaId: null,
        lida: false,
        OR: [{ remetenteId: usuarioId }, { destinatarioId: usuarioId }],
      };

      if (contextoTipo) {
        where.contextoTipo = contextoTipo;
      }

      if (contextoId) {
        where.contextoId = contextoId;
      }

      const count = await prisma.mensagem.count({ where });

      return count;
    } catch (error) {
      console.error('Erro ao contar mensagens não lidas:', error);
      throw error;
    }
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
