/**
 * 📋 Prioridades de Tarefas Centralizadas
 *
 * Centraliza todas as prioridades possíveis para tarefas.
 */

export const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type TaskPriority =
  (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];

/**
 * Obter label em português para uma prioridade
 */
export function getTaskPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case TASK_PRIORITIES.HIGH:
      return 'Alta';
    case TASK_PRIORITIES.MEDIUM:
      return 'Média';
    case TASK_PRIORITIES.LOW:
      return 'Baixa';
    default:
      return priority;
  }
}

/**
 * Verificar se uma prioridade é válida
 */
export function isValidTaskPriority(
  priority: string
): priority is TaskPriority {
  return Object.values(TASK_PRIORITIES).includes(priority as TaskPriority);
}

/**
 * Converter prioridade da API para formato da interface
 */
export function toTaskPriority(priority: string): TaskPriority {
  const lowerPriority = priority.toLowerCase();
  if (isValidTaskPriority(lowerPriority)) {
    return lowerPriority;
  }
  return TASK_PRIORITIES.MEDIUM;
}
