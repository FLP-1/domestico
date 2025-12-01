/**
 * 📋 Status de Pagamentos Centralizados
 *
 * Centraliza todos os status possíveis para pagamentos e guias fiscais.
 */

export const PAYMENT_STATUSES = {
  PENDING: 'PENDENTE',
  PAID: 'PAGO',
  OVERDUE: 'VENCIDO',
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

/**
 * Obter label em português para um status
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case PAYMENT_STATUSES.PENDING:
      return 'Pendente';
    case PAYMENT_STATUSES.PAID:
      return 'Pago';
    case PAYMENT_STATUSES.OVERDUE:
      return 'Vencido';
    default:
      return status;
  }
}

/**
 * Verificar se um status é válido
 */
export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return Object.values(PAYMENT_STATUSES).includes(status as PaymentStatus);
}

/**
 * Converter status da API para formato da interface
 */
export function toPaymentStatus(status: string): PaymentStatus {
  const upperStatus = status.toUpperCase();
  if (isValidPaymentStatus(upperStatus)) {
    return upperStatus;
  }
  return PAYMENT_STATUSES.PENDING;
}
