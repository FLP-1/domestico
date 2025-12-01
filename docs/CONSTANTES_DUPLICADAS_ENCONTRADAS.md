# 🔍 Constantes Duplicadas Encontradas - Análise Completa

## 📊 **RESUMO EXECUTIVO**

Encontrei **6 categorias** de constantes que estão duplicadas ou hardcoded no código e que devem ser centralizadas.

---

## ✅ **CONSTANTES QUE DEVEM SER CRIADAS**

### **1. 📋 Status de Solicitações de Hora Extra** 🔴 **ALTA PRIORIDADE**

**Problema:**

- Status hardcoded em múltiplos lugares
- Strings mágicas: `'PENDENTE'`, `'APROVADA'`, `'REJEITADA'`

**Locais encontrados:**

- `src/pages/time-clock.tsx` (linhas 677, 996, 1012, 1022)

**Solução proposta:**

```typescript
// src/constants/overtimeRequestStatuses.ts
export const OVERTIME_REQUEST_STATUSES = {
  PENDING: 'PENDENTE',
  APPROVED: 'APROVADA',
  REJECTED: 'REJEITADA',
} as const;

export type OvertimeRequestStatus =
  (typeof OVERTIME_REQUEST_STATUSES)[keyof typeof OVERTIME_REQUEST_STATUSES];
```

**Benefícios:**

- ✅ Type safety
- ✅ Evita erros de digitação
- ✅ Fácil refatoração

---

### **2. 📋 Status de eSocial** 🟡 **MÉDIA PRIORIDADE**

**Problema:**

- Status hardcoded em `esocial-domestico-completo.tsx`
- Strings mágicas: `'PENDENTE'`, `'PROCESSADO'`, `'ENVIADO'`

**Locais encontrados:**

- `src/pages/esocial-domestico-completo.tsx` (linhas 251, 476, 499, 526, 625, 632)

**Solução proposta:**

```typescript
// src/constants/esocialStatuses.ts
export const ESOCIAL_STATUSES = {
  PENDING: 'PENDENTE',
  PROCESSED: 'PROCESSADO',
  SENT: 'ENVIADO',
} as const;

export type ESocialStatus =
  (typeof ESOCIAL_STATUSES)[keyof typeof ESOCIAL_STATUSES];
```

**Benefícios:**

- ✅ Consistência entre componentes
- ✅ Type safety
- ✅ Fácil manutenção

---

### **3. 📋 Status de Pagamentos** 🟡 **MÉDIA PRIORIDADE**

**Problema:**

- Status hardcoded em `esocial-domestico-completo.tsx`
- Strings mágicas: `'PENDENTE'`, `'PAGO'`, `'VENCIDO'`

**Locais encontrados:**

- `src/pages/esocial-domestico-completo.tsx` (linhas 261, 625, 632, 638, 668)

**Solução proposta:**

```typescript
// src/constants/paymentStatuses.ts
export const PAYMENT_STATUSES = {
  PENDING: 'PENDENTE',
  PAID: 'PAGO',
  OVERDUE: 'VENCIDO',
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
```

**Benefícios:**

- ✅ Consistência
- ✅ Type safety
- ✅ Fácil adicionar novos status

---

### **4. 📋 Status de Tarefas** 🟡 **MÉDIA PRIORIDADE**

**Problema:**

- Status hardcoded em `task-management.tsx`
- Strings mágicas: `'todo'`, `'in-progress'`, `'completed'`
- Usado em múltiplos switch cases

**Locais encontrados:**

- `src/pages/task-management.tsx` (linhas 88, 197, 201, 205, 230, 234, 238, 250, 254, 258)

**Solução proposta:**

```typescript
// src/constants/taskStatuses.ts
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];
```

**Benefícios:**

- ✅ Reduz erros de digitação
- ✅ Type safety
- ✅ Facilita refatoração

---

### **5. 📋 Prioridades de Tarefas** 🟡 **MÉDIA PRIORIDADE**

**Problema:**

- Prioridades hardcoded em `task-management.tsx`
- Strings mágicas: `'high'`, `'medium'`, `'low'`

**Locais encontrados:**

- `src/pages/task-management.tsx` (linhas 87, 282)

**Solução proposta:**

```typescript
// src/constants/taskPriorities.ts
export const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type TaskPriority =
  (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];
```

**Benefícios:**

- ✅ Type safety
- ✅ Consistência
- ✅ Fácil adicionar novas prioridades

---

### **6. 📋 Tipos de Arquivos Permitidos** 🟢 **BAIXA PRIORIDADE**

**Problema:**

- Arrays de extensões duplicados em vários componentes
- Validação de tipos de arquivo espalhada

**Locais encontrados:**

- `src/components/CertificateUploadModal.tsx` (linha 360): `['.pfx', '.p12', '.cer', '.crt', '.pem']`
- `src/components/EmployerModal.tsx` (linha 717): `['.pfx', '.p12']`
- `src/components/ProxyUploadModal.tsx` (linha 418): `['.pdf', '.xml', '.json']`
- `src/pages/api/time-clock/records.ts` (linha 59): `['entrada', 'saida_almoco', 'retorno_almoco', 'saida', 'inicio_extra']`

**Solução proposta:**

```typescript
// src/constants/allowedFileTypes.ts
export const ALLOWED_FILE_TYPES = {
  CERTIFICATES: ['.pfx', '.p12', '.cer', '.crt', '.pem'],
  CERTIFICATES_MINIMAL: ['.pfx', '.p12'],
  DOCUMENTS: ['.pdf', '.xml', '.json'],
  TIME_CLOCK_RECORDS: [
    'entrada',
    'saida_almoco',
    'retorno_almoco',
    'saida',
    'inicio_extra',
  ],
} as const;
```

**Benefícios:**

- ✅ Centralização de validações
- ✅ Fácil atualizar tipos permitidos
- ✅ Consistência entre componentes

---

## 📊 **PRIORIZAÇÃO**

### **🔴 ALTA PRIORIDADE**

1. ✅ **Status de Solicitações de Hora Extra** - Usado em página crítica (time-clock)

### **🟡 MÉDIA PRIORIDADE**

2. ✅ **Status de eSocial** - Usado em página importante
3. ✅ **Status de Pagamentos** - Usado em página importante
4. ✅ **Status de Tarefas** - Usado em múltiplos lugares
5. ✅ **Prioridades de Tarefas** - Usado em task-management

### **🟢 BAIXA PRIORIDADE**

6. ✅ **Tipos de Arquivos Permitidos** - Útil mas não crítico

---

## 🎯 **RECOMENDAÇÃO**

**Começar pelas constantes de ALTA e MÉDIA prioridade:**

1. Criar `src/constants/overtimeRequestStatuses.ts`
2. Criar `src/constants/esocialStatuses.ts`
3. Criar `src/constants/paymentStatuses.ts`
4. Criar `src/constants/taskStatuses.ts`
5. Criar `src/constants/taskPriorities.ts`
6. Criar `src/constants/allowedFileTypes.ts` (opcional)

**Depois migrar os arquivos para usar essas constantes.**

---

## 📈 **ESTATÍSTICAS**

- **Total de constantes identificadas:** 6 categorias
- **Total de locais com duplicação:** ~20 ocorrências
- **Impacto:** 🟡 **MÉDIO** - Melhora type safety e manutenibilidade
- **Esforço:** 🟢 **BAIXO** - Criação simples de constantes

---

## ✅ **PRÓXIMOS PASSOS**

1. Criar arquivos de constantes
2. Migrar código para usar as constantes
3. Validar que não há erros de tipo
4. Documentar uso das constantes
