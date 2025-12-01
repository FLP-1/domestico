# 📋 Plano de Criação de Constantes - Sistema DOM

## 🎯 **OBJETIVO**

Centralizar todas as constantes duplicadas encontradas no código para melhorar type safety, manutenibilidade e consistência.

---

## ✅ **CONSTANTES A CRIAR**

### **1. Status de Solicitações de Hora Extra** 🔴 **ALTA PRIORIDADE**

**Arquivo:** `src/constants/overtimeRequestStatuses.ts`

```typescript
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
```

**Arquivos a migrar:**

- `src/pages/time-clock.tsx`

---

### **2. Status de eSocial** 🟡 **MÉDIA PRIORIDADE**

**Arquivo:** `src/constants/esocialStatuses.ts`

```typescript
/**
 * 📋 Status de eSocial Centralizados
 *
 * Centraliza todos os status possíveis para eventos do eSocial.
 */

export const ESOCIAL_STATUSES = {
  PENDING: 'PENDENTE',
  PROCESSED: 'PROCESSADO',
  SENT: 'ENVIADO',
} as const;

export type ESocialStatus =
  (typeof ESOCIAL_STATUSES)[keyof typeof ESOCIAL_STATUSES];

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
```

**Arquivos a migrar:**

- `src/pages/esocial-domestico-completo.tsx`

---

### **3. Status de Pagamentos** 🟡 **MÉDIA PRIORIDADE**

**Arquivo:** `src/constants/paymentStatuses.ts`

```typescript
/**
 * 📋 Status de Pagamentos Centralizados
 *
 * Centraliza todos os status possíveis para pagamentos.
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
```

**Arquivos a migrar:**

- `src/pages/esocial-domestico-completo.tsx`

---

### **4. Status de Tarefas** 🟡 **MÉDIA PRIORIDADE**

**Arquivo:** `src/constants/taskStatuses.ts`

```typescript
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
      return 'Em Progresso';
    case TASK_STATUSES.COMPLETED:
      return 'Concluída';
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
```

**Arquivos a migrar:**

- `src/pages/task-management.tsx`

---

### **5. Prioridades de Tarefas** 🟡 **MÉDIA PRIORIDADE**

**Arquivo:** `src/constants/taskPriorities.ts`

```typescript
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
export function isValidTaskPriority(priority: string): type is TaskPriority {
  return Object.values(TASK_PRIORITIES).includes(priority as TaskPriority);
}
```

**Arquivos a migrar:**

- `src/pages/task-management.tsx`

---

### **6. Tipos de Arquivos Permitidos** 🟢 **BAIXA PRIORIDADE**

**Arquivo:** `src/constants/allowedFileTypes.ts`

```typescript
/**
 * 📋 Tipos de Arquivos Permitidos Centralizados
 *
 * Centraliza todos os tipos de arquivos permitidos no sistema.
 */

export const ALLOWED_FILE_TYPES = {
  /**
   * Extensões de certificados digitais completas
   */
  CERTIFICATES: ['.pfx', '.p12', '.cer', '.crt', '.pem'] as const,

  /**
   * Extensões de certificados digitais mínimas (apenas PFX/P12)
   */
  CERTIFICATES_MINIMAL: ['.pfx', '.p12'] as const,

  /**
   * Extensões de documentos gerais
   */
  DOCUMENTS: ['.pdf', '.xml', '.json'] as const,

  /**
   * Tipos de registros de ponto permitidos
   */
  TIME_CLOCK_RECORDS: [
    'entrada',
    'saida_almoco',
    'retorno_almoco',
    'saida',
    'inicio_extra',
  ] as const,
} as const;

/**
 * Verificar se uma extensão de arquivo é permitida para certificados
 */
export function isAllowedCertificateExtension(extension: string): boolean {
  return ALLOWED_FILE_TYPES.CERTIFICATES.includes(
    extension.toLowerCase() as any
  );
}

/**
 * Verificar se uma extensão de arquivo é permitida para certificados mínimos
 */
export function isAllowedCertificateMinimalExtension(
  extension: string
): boolean {
  return ALLOWED_FILE_TYPES.CERTIFICATES_MINIMAL.includes(
    extension.toLowerCase() as any
  );
}

/**
 * Verificar se uma extensão de arquivo é permitida para documentos
 */
export function isAllowedDocumentExtension(extension: string): boolean {
  return ALLOWED_FILE_TYPES.DOCUMENTS.includes(extension.toLowerCase() as any);
}

/**
 * Verificar se um tipo de registro de ponto é permitido
 */
export function isAllowedTimeClockRecordType(type: string): boolean {
  return ALLOWED_FILE_TYPES.TIME_CLOCK_RECORDS.includes(type as any);
}
```

**Arquivos a migrar:**

- `src/components/CertificateUploadModal.tsx`
- `src/components/EmployerModal.tsx`
- `src/components/ProxyUploadModal.tsx`
- `src/pages/api/time-clock/records.ts`

---

## 📊 **ORDEM DE IMPLEMENTAÇÃO RECOMENDADA**

### **Fase 1: Alta Prioridade** 🔴

1. ✅ Criar `overtimeRequestStatuses.ts`
2. ✅ Migrar `time-clock.tsx`

### **Fase 2: Média Prioridade** 🟡

3. ✅ Criar `esocialStatuses.ts`
4. ✅ Criar `paymentStatuses.ts`
5. ✅ Migrar `esocial-domestico-completo.tsx`
6. ✅ Criar `taskStatuses.ts`
7. ✅ Criar `taskPriorities.ts`
8. ✅ Migrar `task-management.tsx`

### **Fase 3: Baixa Prioridade** 🟢

9. ✅ Criar `allowedFileTypes.ts`
10. ✅ Migrar componentes de upload

---

## ✅ **BENEFÍCIOS ESPERADOS**

1. ✅ **Type Safety** - TypeScript garante tipos corretos
2. ✅ **Consistência** - Valores centralizados evitam inconsistências
3. ✅ **Manutenibilidade** - Fácil atualizar em um lugar só
4. ✅ **Refatoração** - Fácil renomear valores
5. ✅ **Documentação** - Constantes servem como documentação

---

## 📈 **ESTIMATIVA**

- **Tempo total:** ~2-3 horas
- **Arquivos a criar:** 6 arquivos
- **Arquivos a migrar:** ~6 arquivos
- **Impacto:** 🟡 **MÉDIO** - Melhora qualidade do código
