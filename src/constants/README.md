# 📋 Constantes Centralizadas do Sistema DOM

Este diretório contém todas as constantes centralizadas do sistema, eliminando valores hardcoded e melhorando type safety, consistência e manutenibilidade.

---

## 📚 Índice

1. [Status de Solicitações de Hora Extra](#status-de-solicitações-de-hora-extra)
2. [Status de eSocial](#status-de-esocial)
3. [Status de Pagamentos](#status-de-pagamentos)
4. [Status de Tarefas](#status-de-tarefas)
5. [Prioridades de Tarefas](#prioridades-de-tarefas)
6. [Tipos de Arquivos Permitidos](#tipos-de-arquivos-permitidos)

---

## 🔄 Status de Solicitações de Hora Extra

**Arquivo:** `overtimeRequestStatuses.ts`

### Uso

```typescript
import { 
  OVERTIME_REQUEST_STATUSES, 
  type OvertimeRequestStatus,
  getOvertimeRequestStatusLabel,
  isValidOvertimeRequestStatus,
  toOvertimeRequestStatus
} from '@/src/constants/overtimeRequestStatuses';

// Valores disponíveis
OVERTIME_REQUEST_STATUSES.PENDING   // 'PENDENTE'
OVERTIME_REQUEST_STATUSES.APPROVED  // 'APROVADA'
OVERTIME_REQUEST_STATUSES.REJECTED  // 'REJEITADA'

// Tipo TypeScript
const status: OvertimeRequestStatus = OVERTIME_REQUEST_STATUSES.PENDING;

// Obter label em português
const label = getOvertimeRequestStatusLabel(status); // 'Pendente'

// Validar status
if (isValidOvertimeRequestStatus(input)) {
  // status válido
}

// Converter da API
const status = toOvertimeRequestStatus(apiResponse.status);
```

### Onde usar

- APIs de hora extra (`/api/time-clock/overtime-requests.ts`)
- Componentes de solicitação de hora extra
- Validações de status

---

## 📊 Status de eSocial

**Arquivo:** `esocialStatuses.ts`

### Uso

```typescript
import { 
  ESOCIAL_STATUSES, 
  type ESocialStatus,
  getESocialStatusLabel,
  isValidESocialStatus,
  toESocialStatus
} from '@/src/constants/esocialStatuses';

// Valores disponíveis
ESOCIAL_STATUSES.PENDING   // 'PENDENTE'
ESOCIAL_STATUSES.PROCESSED // 'PROCESSADO'
ESOCIAL_STATUSES.SENT      // 'ENVIADO'

// Tipo TypeScript
const status: ESocialStatus = ESOCIAL_STATUSES.PROCESSED;

// Obter label
const label = getESocialStatusLabel(status); // 'Processado'
```

### Onde usar

- Páginas de eSocial (`esocial-domestico-completo.tsx`)
- APIs de folha de pagamento (`/api/payroll/index.ts`)
- Componentes de payroll (`PayrollModalNew.tsx`)

---

## 💰 Status de Pagamentos

**Arquivo:** `paymentStatuses.ts`

### Uso

```typescript
import { 
  PAYMENT_STATUSES, 
  type PaymentStatus,
  getPaymentStatusLabel,
  isValidPaymentStatus,
  toPaymentStatus
} from '@/src/constants/paymentStatuses';

// Valores disponíveis
PAYMENT_STATUSES.PENDING // 'PENDENTE'
PAYMENT_STATUSES.PAID    // 'PAGO'
PAYMENT_STATUSES.OVERDUE // 'VENCIDO'

// Tipo TypeScript
const status: PaymentStatus = PAYMENT_STATUSES.PENDING;

// Obter label
const label = getPaymentStatusLabel(status); // 'Pendente'
```

### Onde usar

- Guias de impostos (`TaxGuideModalNew.tsx`)
- APIs de guias (`/api/tax-guides/index.ts`)
- Componentes de pagamento

---

## ✅ Status de Tarefas

**Arquivo:** `taskStatuses.ts`

### Uso

```typescript
import { 
  TASK_STATUSES, 
  type TaskStatus,
  getTaskStatusLabel,
  isValidTaskStatus,
  toTaskStatus
} from '@/src/constants/taskStatuses';

// Valores disponíveis
TASK_STATUSES.TODO         // 'todo'
TASK_STATUSES.IN_PROGRESS  // 'in-progress'
TASK_STATUSES.COMPLETED    // 'completed'

// Tipo TypeScript
const status: TaskStatus = TASK_STATUSES.TODO;

// Obter label
const label = getTaskStatusLabel(status); // 'A Fazer'

// Converter da API (pending -> todo)
const uiStatus = toTaskStatus(apiStatus); // Converte 'pending' para 'todo'
```

### Onde usar

- Página de gestão de tarefas (`task-management.tsx`)
- APIs de tarefas (`/api/tasks/index.ts`)
- Componentes de tarefas

### ⚠️ Nota Importante

A API usa formato diferente (`'pending'`, `'in_progress'`, `'completed'`) enquanto a UI usa (`'todo'`, `'in-progress'`, `'completed'`). Use `toTaskStatus()` para converter quando necessário.

---

## 🎯 Prioridades de Tarefas

**Arquivo:** `taskPriorities.ts`

### Uso

```typescript
import { 
  TASK_PRIORITIES, 
  type TaskPriority,
  getTaskPriorityLabel,
  isValidTaskPriority,
  toTaskPriority
} from '@/src/constants/taskPriorities';

// Valores disponíveis
TASK_PRIORITIES.HIGH   // 'high'
TASK_PRIORITIES.MEDIUM // 'medium'
TASK_PRIORITIES.LOW    // 'low'

// Tipo TypeScript
const priority: TaskPriority = TASK_PRIORITIES.HIGH;

// Obter label
const label = getTaskPriorityLabel(priority); // 'Alta'
```

### Onde usar

- Página de gestão de tarefas (`task-management.tsx`)
- Componentes de tarefas
- Filtros e ordenação

---

## 📁 Tipos de Arquivos Permitidos

**Arquivo:** `allowedFileTypes.ts`

### Uso

```typescript
import { 
  ALLOWED_FILE_TYPES,
  isAllowedCertificateType,
  isAllowedCertificateMinimalType,
  isAllowedDocumentType,
  isValidTimeClockRecordType,
  getFileExtension
} from '@/src/constants/allowedFileTypes';

// Tipos disponíveis
ALLOWED_FILE_TYPES.CERTIFICATES        // ['.pfx', '.p12', '.cer', '.crt', '.pem']
ALLOWED_FILE_TYPES.CERTIFICATES_MINIMAL // ['.pfx', '.p12']
ALLOWED_FILE_TYPES.DOCUMENTS            // ['.pdf', '.xml', '.json']
ALLOWED_FILE_TYPES.TIME_CLOCK_RECORDS  // ['entrada', 'saida_almoco', ...]

// Validar certificado completo
if (isAllowedCertificateType(fileName)) {
  // arquivo válido
}

// Validar certificado mínimo (apenas PFX/P12)
if (isAllowedCertificateMinimalType(fileName)) {
  // arquivo válido
}

// Validar documento
if (isAllowedDocumentType(fileName)) {
  // arquivo válido
}

// Validar tipo de registro de ponto
if (isValidTimeClockRecordType(recordType)) {
  // tipo válido
}

// Obter extensão de forma segura
const ext = getFileExtension(fileName); // '.pdf'
```

### Onde usar

- Componentes de upload (`CertificateUploadModal.tsx`, `EmployerModal.tsx`, `ProxyUploadModal.tsx`)
- APIs de validação (`/api/time-clock/records.ts`)
- Validações de formulários

---

## 🎨 Padrões de Uso

### ✅ Correto

```typescript
// ✅ Usar constantes
import { ESOCIAL_STATUSES } from '@/src/constants/esocialStatuses';
const status = ESOCIAL_STATUSES.PENDING;

// ✅ Usar tipos exportados
import { type PaymentStatus } from '@/src/constants/paymentStatuses';
const status: PaymentStatus = PAYMENT_STATUSES.PAID;

// ✅ Usar funções helper
import { getTaskStatusLabel } from '@/src/constants/taskStatuses';
const label = getTaskStatusLabel(status);
```

### ❌ Incorreto

```typescript
// ❌ NÃO usar strings hardcoded
const status = 'PENDENTE'; // ❌ ERRADO

// ❌ NÃO usar tipos inline
const status: 'PENDENTE' | 'PAGO' | 'VENCIDO' = 'PENDENTE'; // ❌ ERRADO

// ❌ NÃO criar arrays próprios
const allowedTypes = ['.pfx', '.p12']; // ❌ ERRADO
```

---

## 🔍 Buscar Valores Hardcoded

Para encontrar valores que ainda precisam ser migrados:

```bash
# Status de eSocial
grep -r "'PENDENTE'\|'PROCESSADO'\|'ENVIADO'" src/

# Status de pagamentos
grep -r "'PAGO'\|'VENCIDO'" src/

# Status de tarefas
grep -r "'todo'\|'in-progress'\|'completed'" src/

# Prioridades
grep -r "'high'\|'medium'\|'low'" src/
```

---

## 📝 Adicionando Novas Constant

Ao criar uma nova constante, siga este padrão:

```typescript
/**
 * 📋 Descrição da constante
 * 
 * Explicação do propósito e uso.
 */

export const MINHA_CONSTANTE = {
  VALOR1: 'valor1',
  VALOR2: 'valor2',
} as const;

export type MinhaConstanteTipo = typeof MINHA_CONSTANTE[keyof typeof MINHA_CONSTANTE];

/**
 * Obter label em português
 */
export function getMinhaConstanteLabel(valor: MinhaConstanteTipo): string {
  switch (valor) {
    case MINHA_CONSTANTE.VALOR1:
      return 'Valor 1';
    case MINHA_CONSTANTE.VALOR2:
      return 'Valor 2';
    default:
      return valor;
  }
}

/**
 * Verificar se é válido
 */
export function isValidMinhaConstante(valor: string): valor is MinhaConstanteTipo {
  return Object.values(MINHA_CONSTANTE).includes(valor as MinhaConstanteTipo);
}
```

---

## ✅ Checklist de Migração

Ao migrar código para usar constantes:

- [ ] Importar a constante e tipos necessários
- [ ] Substituir strings hardcoded pela constante
- [ ] Atualizar tipos de interfaces para usar o tipo exportado
- [ ] Atualizar validações para usar funções helper
- [ ] Testar que o código funciona corretamente
- [ ] Verificar que não há erros de lint/TypeScript
- [ ] Atualizar testes se necessário

---

## 📚 Referências

- Documento original: `docs/CONSTANTES_DUPLICADAS_ENCONTRADAS.md`
- Resumo da centralização: `docs/RESUMO_CENTRALIZACAO.md`

---

**Última atualização:** Janeiro 2025

