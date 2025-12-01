import communicationService from './communicationService';
import prisma from '@/lib/prisma';

export interface AlertTriggerData {
  alertaId: string;
  usuarioId?: string;
  valorGatilho?: any;
}

/**
 * Serviço de integração entre alertas e mensagens toast
 * Dispara toast quando alerta é ativado e registra histórico
 */
export class AlertToastIntegrationService {
  /**
   * Dispara toast quando alerta é ativado
   * Deve ser chamado quando um alerta é disparado
   */
  static async triggerAlertToast(data: AlertTriggerData): Promise<void> {
    try {
      // Buscar dados do alerta
      const alerta = await prisma.alerta.findUnique({
        where: { id: data.alertaId },
      });

      if (!alerta || alerta.status !== 'ATIVO') {
        return;
      }

      // Determinar tipo de toast baseado na prioridade
      const tipoToast = this.mapPriorityToToastType(alerta.prioridade);

      // Criar mensagem do toast
      const mensagem = alerta.textoNotificacao || alerta.descricao;
      const titulo = alerta.titulo;

      // ✅ NOVO: Usar CommunicationService para criar mensagem contextual
      const usuarioId = data.usuarioId || alerta.usuarioId;
      if (usuarioId) {
        await communicationService.criarMensagemContextual({
          usuarioId,
          contextoTipo: 'DOCUMENTO', // Usar DOCUMENTO como padrão, já que não há tipo específico para alertas
          contextoId: data.alertaId, // ID do alerta como contexto
          remetenteId: 'SISTEMA',
          destinatarioId: usuarioId,
          conteudo: mensagem,
          origem: 'ALERTA',
          alertaId: data.alertaId,
          tipo: tipoToast === 'error' ? 'ALERTA' : 'NOTIFICACAO',
          exibirToast: true, // ✅ Exibir toast automaticamente
          tipoToast,
        });
      }

      // Registrar no histórico de alertas
      await prisma.alertaHistorico.create({
        data: {
          alertaId: data.alertaId,
          disparadoEm: new Date(),
          destinatarios: data.usuarioId ? [data.usuarioId] : [],
          canal: 'toast',
          sucesso: true,
          valorGatilho: data.valorGatilho
            ? JSON.parse(JSON.stringify(data.valorGatilho))
            : null,
        },
      });

      // Atualizar contador de gatilhos
      await prisma.alerta.update({
        where: { id: data.alertaId },
        data: {
          gatilhoContador: {
            increment: 1,
          },
          ultimoGatilho: new Date(),
        },
      });
    } catch (error) {
      console.error('Erro ao disparar toast de alerta:', error);
      // Não interromper o fluxo se falhar
    }
  }

  /**
   * Mapeia prioridade do alerta para tipo de toast
   */
  private static mapPriorityToToastType(
    prioridade: string
  ): 'success' | 'error' | 'warning' | 'info' {
    const prioridadeUpper = prioridade.toUpperCase();

    switch (prioridadeUpper) {
      case 'CRITICA':
      case 'URGENTE':
        return 'error';
      case 'ALTA':
      case 'IMPORTANTE':
        return 'warning';
      case 'MEDIA':
      case 'NORMAL':
        return 'info';
      case 'BAIXA':
      default:
        return 'info';
    }
  }

  /**
   * Verifica alertas ativos e dispara toasts se necessário
   * Deve ser chamado periodicamente ou quando condições são atendidas
   */
  static async checkAndTriggerAlerts(usuarioId?: string): Promise<void> {
    try {
      const where: any = {
        status: 'ATIVO',
      };

      if (usuarioId) {
        where.usuarioId = usuarioId;
      }

      const alertasAtivos = await prisma.alerta.findMany({
        where,
        include: {
          historico: {
            orderBy: {
              disparadoEm: 'desc',
            },
            take: 1,
          },
        },
      });

      for (const alerta of alertasAtivos) {
        // Verificar se deve disparar (lógica de condições)
        const shouldTrigger = await this.shouldTriggerAlert(alerta);

        if (shouldTrigger) {
          await this.triggerAlertToast({
            alertaId: alerta.id,
            usuarioId: usuarioId || alerta.usuarioId || undefined,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar e disparar alertas:', error);
    }
  }

  /**
   * Verifica se alerta deve ser disparado baseado em condições
   */
  private static async shouldTriggerAlert(alerta: any): Promise<boolean> {
    // Implementar lógica de verificação de condições
    // Por enquanto, retorna true se não foi disparado recentemente
    const ultimoDisparo = alerta.historico?.[0]?.disparadoEm;
    if (ultimoDisparo) {
      const horasDesdeUltimoDisparo =
        (Date.now() - new Date(ultimoDisparo).getTime()) / (1000 * 60 * 60);

      // Não disparar se foi disparado nas últimas 24 horas
      if (horasDesdeUltimoDisparo < 24) {
        return false;
      }
    }

    // Verificar se data de alerta já passou
    const dataAlerta = new Date(alerta.dataAlerta);
    if (dataAlerta > new Date()) {
      return false;
    }

    // Verificar se não expirou
    if (alerta.dataExpiracao) {
      const dataExpiracao = new Date(alerta.dataExpiracao);
      if (dataExpiracao < new Date()) {
        return false;
      }
    }

    return true;
  }
}
