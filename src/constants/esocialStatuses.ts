/**
 * 📋 Status de eSocial Centralizados
 * 
 * Centraliza todos os status possíveis para eventos eSocial.
 */

export const ESOCIAL_STATUSES = {
  PENDING: 'PENDENTE',
  PROCESSED: 'PROCESSADO',
  SENT: 'ENVIADO',
} as const;

export type ESocialStatus = typeof ESOCIAL_STATUSES[keyof typeof ESOCIAL_STATUSES];

/**
 * Obter label em português para um status
 */
export function getESocialStatusLabel(status: ESocialStatus): string {
  switch (status) {
    case ESOCIAL_STATUSES.PENDING:
      return 'Pendente';
    case ESOCIAL_STATUSES.PROCESSED:
      return 'Processado';
    case ESOCIAL_STATUSES.SENT:
      return 'Enviado';
    default:
      return status;
  }
}

/**
 * Verificar se um status é válido
 */
export function isValidESocialStatus(status: string): status is ESocialStatus {
  return Object.values(ESOCIAL_STATUSES).includes(status as ESocialStatus);
}

/**
 * Converter status da API para formato da interface
 */
export function toESocialStatus(status: string): ESocialStatus {
  const upperStatus = status.toUpperCase();
  if (isValidESocialStatus(upperStatus)) {
    return upperStatus;
  }
  return ESOCIAL_STATUSES.PENDING;
}

