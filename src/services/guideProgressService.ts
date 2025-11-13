/**
 * Serviço de Persistência de Progresso de Guias
 * Componente reutilizável e centralizado
 */

import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export interface GuideProgress {
  id: string;
  usuarioId: string;
  guideId: string;
  currentStep: string;
  progressData: any;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  action: string;
  target?: string;
  expectedResult?: string;
  helpText?: string;
  screenshot?: string;
  validation?: () => Promise<boolean>;
  skipAllowed?: boolean;
}

/**
 * Serviço de progresso de guias reutilizável e centralizado
 */
export class GuideProgressService {
  /**
   * Salva progresso do guia
   */
  async saveProgress(
    usuarioId: string,
    guideId: string,
    stepId: string,
    data: any
  ): Promise<GuideProgress> {
    try {
      // Buscar progresso existente
      const existing = await prisma.guideProgress.findUnique({
        where: {
          usuarioId_guideId: {
            usuarioId,
            guideId
          }
        }
      });
      
      if (existing) {
        // Atualizar progresso existente
        return await prisma.guideProgress.update({
          where: { id: existing.id },
          data: {
            currentStep: stepId,
            progressData: data,
            updatedAt: new Date()
          }
        });
      } else {
        // Criar novo progresso
        return await prisma.guideProgress.create({
          data: {
            usuarioId,
            guideId,
            currentStep: stepId,
            progressData: data,
            completed: false,
            startedAt: new Date()
          }
        });
      }
    } catch (error: any) {
      logger.error({ error, usuarioId, guideId }, 'Erro ao salvar progresso do guia');
      throw new Error(`Erro ao salvar progresso: ${error.message || 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Obtém progresso do guia
   */
  async getProgress(
    usuarioId: string,
    guideId: string
  ): Promise<GuideProgress | null> {
    try {
      return await prisma.guideProgress.findUnique({
        where: {
          usuarioId_guideId: {
            usuarioId,
            guideId
          }
        }
      });
    } catch (error: any) {
      logger.error({ error, usuarioId, guideId }, 'Erro ao buscar progresso do guia');
      return null;
    }
  }
  
  /**
   * Retoma guia do último passo
   */
  async resumeGuide(
    usuarioId: string,
    guideId: string,
    getAllSteps: () => GuideStep[]
  ): Promise<{ steps: GuideStep[]; currentStepIndex: number }> {
    try {
      const progress = await this.getProgress(usuarioId, guideId);
      const allSteps = getAllSteps();
      
      if (!progress) {
        // Iniciar novo guia
        return {
          steps: allSteps,
          currentStepIndex: 0
        };
      }
      
      // Retomar do último passo
      const currentStepIndex = allSteps.findIndex(s => s.id === progress.currentStep);
      
      if (currentStepIndex === -1) {
        // Passo não encontrado, começar do início
        return {
          steps: allSteps,
          currentStepIndex: 0
        };
      }
      
      return {
        steps: allSteps.slice(currentStepIndex),
        currentStepIndex
      };
    } catch (error: any) {
      logger.error({ error, usuarioId, guideId }, 'Erro ao retomar guia');
      // Em caso de erro, retornar todos os passos do início
      return {
        steps: getAllSteps(),
        currentStepIndex: 0
      };
    }
  }
  
  /**
   * Marca guia como completo
   */
  async completeGuide(
    usuarioId: string,
    guideId: string
  ): Promise<void> {
    try {
      await prisma.guideProgress.updateMany({
        where: {
          usuarioId,
          guideId
        },
        data: {
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error: any) {
      logger.error({ error, usuarioId, guideId }, 'Erro ao completar guia');
      throw new Error(`Erro ao completar guia: ${error.message || 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Obtém histórico de guias completados
   */
  async getCompletedGuides(usuarioId: string): Promise<GuideProgress[]> {
    try {
      return await prisma.guideProgress.findMany({
        where: {
          usuarioId,
          completed: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      });
    } catch (error: any) {
      logger.error({ error, usuarioId }, 'Erro ao buscar guias completados');
      return [];
    }
  }
  
  /**
   * Obtém guias em progresso
   */
  async getInProgressGuides(usuarioId: string): Promise<GuideProgress[]> {
    try {
      return await prisma.guideProgress.findMany({
        where: {
          usuarioId,
          completed: false
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } catch (error: any) {
      logger.error({ error, usuarioId }, 'Erro ao buscar guias em progresso');
      return [];
    }
  }
  
  /**
   * Reseta progresso do guia
   */
  async resetProgress(
    usuarioId: string,
    guideId: string
  ): Promise<void> {
    try {
      await prisma.guideProgress.deleteMany({
        where: {
          usuarioId,
          guideId
        }
      });
    } catch (error: any) {
      logger.error({ error, usuarioId, guideId }, 'Erro ao resetar progresso');
      throw new Error(`Erro ao resetar progresso: ${error.message || 'Erro desconhecido'}`);
    }
  }
}

/**
 * Instância singleton centralizada
 */
let guideProgressInstance: GuideProgressService | null = null;

/**
 * Obtém instância do serviço (singleton)
 */
export function getGuideProgressService(): GuideProgressService {
  if (!guideProgressInstance) {
    guideProgressInstance = new GuideProgressService();
  }
  return guideProgressInstance;
}

/**
 * Reseta instância do serviço
 */
export function resetGuideProgressService(): void {
  if (guideProgressInstance) {
    guideProgressInstance = null;
  }
}

