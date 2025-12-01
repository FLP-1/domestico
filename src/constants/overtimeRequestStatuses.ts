/**
 * 📋 Status de Solicitações de Hora Extra Centralizados
 *
 * Centraliza todos os status possíveis para solicitações de hora extra.
 */

export const OVERTIME_REQUEST_STATUSES = {
  PENDING: 'PENDENTE',
  APPROVED: 'APROVADA',
  REJECTED: 'REJEITADA',
} as const;

export type OvertimeRequestStatus =
  (typeof OVERTIME_REQUEST_STATUSES)[keyof typeof OVERTIME_REQUEST_STATUSES];

/**
 * Obter label em português para um status
 */
export function getOvertimeRequestStatusLabel(
  status: OvertimeRequestStatus
): string {
  switch (status) {
    case OVERTIME_REQUEST_STATUSES.PENDING:
      return 'Pendente';
    case OVERTIME_REQUEST_STATUSES.APPROVED:
      return 'Aprovada';
    case OVERTIME_REQUEST_STATUSES.REJECTED:
      return 'Rejeitada';
    default:
      return status;
  }
}

/**
 * Verificar se um status é válido
 */
export function isValidOvertimeRequestStatus(
  status: string
): status is OvertimeRequestStatus {
  return Object.values(OVERTIME_REQUEST_STATUSES).includes(
    status as OvertimeRequestStatus
  );
}

/**
 * Converter status da API (maiúsculas) para formato da interface (minúsculas)
 */
export function toOvertimeRequestStatus(status: string): OvertimeRequestStatus {
  const upperStatus = status.toUpperCase();
  if (isValidOvertimeRequestStatus(upperStatus)) {
    return upperStatus;
  }
  return OVERTIME_REQUEST_STATUSES.PENDING;
}

/**
 * Converter status para formato minúsculo (para uso em interfaces)
 */
export function toLowerCaseStatus(status: OvertimeRequestStatus): string {
  return status.toLowerCase();
}
