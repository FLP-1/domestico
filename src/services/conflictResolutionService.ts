/**
 * Serviço de Resolução de Conflitos na Sincronização
 * Componente reutilizável e centralizado
 */

import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export interface Conflict {
  field: string;
  localValue: any;
  remoteValue: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
}

export interface Resolution {
  field: string;
  resolution: 'LOCAL' | 'REMOTE' | 'MERGE' | 'MANUAL';
  value: any;
  reason: string;
}

export interface SyncResult {
  success: boolean;
  conflicts: number;
  resolved: Resolution[];
  data: any;
  errors?: string[];
}

/**
 * Serviço de resolução de conflitos reutilizável e centralizado
 */
export class ConflictResolutionService {
  /**
   * Sincroniza com resolução de conflitos
   */
  async syncWithConflictResolution(
    localData: any,
    remoteData: any,
    entityType: string,
    entityId: string
  ): Promise<SyncResult> {
    try {
      // 1. Detectar conflitos
      const conflicts = this.detectConflicts(localData, remoteData);
      
      if (conflicts.length === 0) {
        // Sem conflitos, sincronizar normalmente
        return await this.syncWithoutConflicts(localData, remoteData, entityType, entityId);
      }
      
      // 2. Resolver conflitos automaticamente
      const resolutions = await this.resolveConflicts(conflicts, entityType);
      
      // 3. Aplicar resoluções
      const mergedData = this.mergeData(localData, remoteData, resolutions);
      
      // 4. Registrar conflitos no histórico
      await this.logConflicts(entityType, entityId, conflicts, resolutions);
      
      return {
        success: true,
        conflicts: conflicts.length,
        resolved: resolutions,
        data: mergedData
      };
    } catch (error: any) {
      logger.error({ error, entityType, entityId }, 'Erro na sincronização com conflitos');
      return {
        success: false,
        conflicts: 0,
        resolved: [],
        data: null,
        errors: [error.message || 'Erro desconhecido']
      };
    }
  }
  
  /**
   * Detecta conflitos entre dados locais e remotos
   */
  private detectConflicts(local: any, remote: any): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Campos críticos que podem ter conflitos
    const criticalFields = ['cpf', 'nome', 'salario', 'dataAdmissao', 'cargo', 'endereco'];
    
    for (const field of criticalFields) {
      const localValue = this.getNestedValue(local, field);
      const remoteValue = this.getNestedValue(remote, field);
      
      if (localValue !== undefined && remoteValue !== undefined && 
          this.valuesDiffer(localValue, remoteValue)) {
        conflicts.push({
          field,
          localValue,
          remoteValue,
          localTimestamp: local.updatedAt ? new Date(local.updatedAt) : new Date(),
          remoteTimestamp: remote.updatedAt ? new Date(remote.updatedAt) : new Date()
        });
      }
    }
    
    return conflicts;
  }
  
  /**
   * Verifica se valores diferem
   */
  private valuesDiffer(local: any, remote: any): boolean {
    if (local === remote) return false;
    if (local === null || local === undefined) return remote !== null && remote !== undefined;
    if (remote === null || remote === undefined) return true;
    
    // Comparar datas
    if (local instanceof Date && remote instanceof Date) {
      return local.getTime() !== remote.getTime();
    }
    
    // Comparar objetos
    if (typeof local === 'object' && typeof remote === 'object') {
      return JSON.stringify(local) !== JSON.stringify(remote);
    }
    
    return local !== remote;
  }
  
  /**
   * Obtém valor aninhado
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
  
  /**
   * Resolve conflitos automaticamente
   */
  private async resolveConflicts(
    conflicts: Conflict[],
    entityType: string
  ): Promise<Resolution[]> {
    const resolutions: Resolution[] = [];
    
    for (const conflict of conflicts) {
      // Estratégia: usar timestamp mais recente
      const useRemote = conflict.remoteTimestamp > conflict.localTimestamp;
      
      // Campos críticos sempre preferem remoto (fonte de verdade)
      const criticalFields = ['cpf', 'nome'];
      const isCritical = criticalFields.includes(conflict.field);
      
      let resolution: Resolution;
      
      if (isCritical) {
        // Campos críticos sempre usam remoto
        resolution = {
          field: conflict.field,
          resolution: 'REMOTE',
          value: conflict.remoteValue,
          reason: 'CAMPO_CRITICO_REMOTO'
        };
      } else if (useRemote) {
        // Usar remoto se mais recente
        resolution = {
          field: conflict.field,
          resolution: 'REMOTE',
          value: conflict.remoteValue,
          reason: 'TIMESTAMP_REMOTO_MAIS_RECENTE'
        };
      } else {
        // Usar local se mais recente
        resolution = {
          field: conflict.field,
          resolution: 'LOCAL',
          value: conflict.localValue,
          reason: 'TIMESTAMP_LOCAL_MAIS_RECENTE'
        };
      }
      
      resolutions.push(resolution);
    }
    
    return resolutions;
  }
  
  /**
   * Mescla dados aplicando resoluções
   */
  private mergeData(
    local: any,
    remote: any,
    resolutions: Resolution[]
  ): any {
    const merged = { ...local, ...remote };
    
    for (const resolution of resolutions) {
      this.setNestedValue(merged, resolution.field, resolution.value);
    }
    
    // Atualizar timestamp
    merged.updatedAt = new Date();
    merged.syncedAt = new Date();
    
    return merged;
  }
  
  /**
   * Define valor aninhado
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((current, prop) => {
      if (!current[prop]) {
        current[prop] = {};
      }
      return current[prop];
    }, obj);
    
    if (last) {
      target[last] = value;
    }
  }
  
  /**
   * Sincroniza sem conflitos
   */
  private async syncWithoutConflicts(
    local: any,
    remote: any,
    entityType: string,
    entityId: string
  ): Promise<SyncResult> {
    // Aplicar dados remotos (fonte de verdade)
    const syncedData = {
      ...local,
      ...remote,
      updatedAt: new Date(),
      syncedAt: new Date()
    };
    
    return {
      success: true,
      conflicts: 0,
      resolved: [],
      data: syncedData
    };
  }
  
  /**
   * Registra conflitos no histórico
   */
  private async logConflicts(
    entityType: string,
    entityId: string,
    conflicts: Conflict[],
    resolutions: Resolution[]
  ): Promise<void> {
    try {
      const usuarioId =
        entityType.toLowerCase() === 'usuario' ? entityId : null;

      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'SINCRONIZACAO_RESOLVIDA',
          entidade: entityType,
          entidadeId: entityId,
          descricao: `Sincronização com ${conflicts.length} conflito(s) registrado(s)`,
          metodo: 'SERVICE',
          rota: null,
          enderecoIP: null,
          userAgent: null,
          dadosAnteriores: conflicts.length
            ? {
                conflicts: conflicts.map(c => ({
                  field: c.field,
                  localValue: c.localValue,
                  remoteValue: c.remoteValue
                }))
              }
            : undefined,
          dadosNovos: resolutions.length
            ? {
                resolutions: resolutions.map(r => ({
                  field: r.field,
                  resolution: r.resolution,
                  reason: r.reason,
                  value: r.value
                }))
              }
            : undefined,
          sucesso: true,
          erro: null,
          tipoLog: 'SINCRONIZACAO',
          nivelSeveridade: conflicts.length > 0 ? 'AVISO' : 'INFO'
        }
      });
    } catch (error) {
      logger.error({ error, entityType, entityId }, 'Erro ao registrar conflitos');
    }
  }
}

/**
 * Instância singleton centralizada
 */
let conflictResolutionInstance: ConflictResolutionService | null = null;

/**
 * Obtém instância do serviço (singleton)
 */
export function getConflictResolutionService(): ConflictResolutionService {
  if (!conflictResolutionInstance) {
    conflictResolutionInstance = new ConflictResolutionService();
  }
  return conflictResolutionInstance;
}

/**
 * Reseta instância do serviço
 */
export function resetConflictResolutionService(): void {
  if (conflictResolutionInstance) {
    conflictResolutionInstance = null;
  }
}

