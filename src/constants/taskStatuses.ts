/**
 * 📋 Status de Tarefas Centralizados
 *
 * Centraliza todos os status possíveis para tarefas.
 */

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

/**
 * Obter label em português para um status
 */
export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case TASK_STATUSES.TODO:
      return 'A Fazer';
    case TASK_STATUSES.IN_PROGRESS:
      return 'Em Andamento';
    case TASK_STATUSES.COMPLETED:
      return 'Concluído';
    default:
      return status;
  }
}

/**
 * Verificar se um status é válido
 */
export function isValidTaskStatus(status: string): status is TaskStatus {
  return Object.values(TASK_STATUSES).includes(status as TaskStatus);
}

/**
 * Converter status da API para formato da interface
 */
export function toTaskStatus(status: string): TaskStatus {
  const normalizedStatus = status.toLowerCase().replace('_', '-');
  if (isValidTaskStatus(normalizedStatus)) {
    return normalizedStatus;
  }
  return TASK_STATUSES.TODO;
}
