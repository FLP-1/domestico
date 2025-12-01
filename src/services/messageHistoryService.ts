// Importação condicional do Prisma (apenas no servidor)
let prisma: any = null;
if (typeof window === 'undefined') {
  // Apenas importar Prisma no servidor
  prisma = require('@/lib/prisma').default;
}

export interface MessageHistoryData {
  usuarioId?: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo?: string;
  mensagem: string;
  origem: 'toast' | 'alerta' | 'sistema';
  alertaId?: string;
  duracao?: number;
}

/**
 * Serviço para registrar histórico de mensagens exibidas
 */
export class MessageHistoryService {
  /**
   * Registra uma mensagem no histórico
   * Detecta automaticamente se está no cliente ou servidor
   */
  static async recordMessage(data: MessageHistoryData): Promise<void> {
    try {
      // Se estiver no cliente (browser), usar API route
      if (typeof window !== 'undefined') {
        await fetch('/api/messages/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).catch(error => {
          // Não interromper o fluxo se falhar
          console.error('Erro ao registrar mensagem via API:', error);
        });
        return;
      }

      // Se estiver no servidor, usar Prisma diretamente
      if (prisma) {
        await prisma.mensagemHistorico.create({
          data: {
            usuarioId: data.usuarioId,
            tipo: data.tipo,
            titulo: data.titulo,
            mensagem: data.mensagem,
            origem: data.origem,
            alertaId: data.alertaId,
            duracao: data.duracao,
            lido: false,
          },
        });
      }
    } catch (error) {
      // Não interromper o fluxo se falhar ao registrar histórico
      console.error('Erro ao registrar histórico de mensagem:', error);
    }
  }

  /**
   * Busca histórico de mensagens de um usuário
   * Sempre usa API route (não deve ser chamado do servidor diretamente)
   */
  static async getHistory(
    usuarioId: string,
    options?: {
      tipo?: 'success' | 'error' | 'warning' | 'info';
      origem?: 'toast' | 'alerta' | 'sistema';
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const params = new URLSearchParams({
        usuarioId,
      });

      if (options?.tipo) {
        params.append('tipo', options.tipo);
      }
      if (options?.origem) {
        params.append('origem', options.origem);
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }
      if (options?.offset) {
        params.append('offset', options.offset.toString());
      }

      const response = await fetch(
        `/api/messages/history?${params.toString()}`
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar histórico');
      }

      return result.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de mensagens:', error);
      throw error;
    }
  }

  /**
   * Marca mensagens como lidas
   * Usa API route quando chamado do cliente
   */
  static async markAsRead(messageIds: string[]): Promise<void> {
    try {
      // Se estiver no cliente, usar API route
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/messages/history', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messageIds }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(
            result.error || 'Erro ao marcar mensagens como lidas'
          );
        }
        return;
      }

      // Se estiver no servidor, usar Prisma diretamente
      if (prisma) {
        await prisma.mensagemHistorico.updateMany({
          where: {
            id: {
              in: messageIds,
            },
          },
          data: {
            lido: true,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }

  /**
   * Remove mensagens antigas (mais de 30 dias)
   * Apenas no servidor
   */
  static async cleanupOldMessages(daysToKeep: number = 30): Promise<number> {
    try {
      if (!prisma) {
        throw new Error('cleanupOldMessages só pode ser executado no servidor');
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.mensagemHistorico.deleteMany({
        where: {
          exibidoEm: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Erro ao limpar mensagens antigas:', error);
      throw error;
    }
  }
}
