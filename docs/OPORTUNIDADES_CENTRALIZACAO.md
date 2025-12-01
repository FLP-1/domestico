# 🎯 Oportunidades de Centralização - Sistema DOM

## 📊 **ANÁLISE REALIZADA**

Após análise do código, identifiquei várias oportunidades de centralização que podem melhorar a manutenibilidade, consistência e reutilização do código.

---

## 🔍 **OPORTUNIDADES IDENTIFICADAS**

### **1. 🔌 API ENDPOINTS E CLIENT HTTP**

**Problema:**
- URLs de API hardcoded em múltiplas páginas (`/api/alerts`, `/api/users`, `/api/time-clock/...`)
- Headers repetidos (`Content-Type: application/json`)
- Lógica de fetch duplicada
- Tratamento de erros inconsistente

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Espalhado em várias páginas
fetch('/api/alerts')
fetch('/api/users')
fetch('/api/time-clock/records')
fetch('/api/time-clock/overtime-requests', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
})
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Cliente HTTP centralizado
import { apiClient } from '@/lib/apiClient';

apiClient.alerts.getAll()
apiClient.alerts.create(data)
apiClient.alerts.update(id, data)
apiClient.alerts.delete(id)
apiClient.users.getAll()
apiClient.timeClock.getRecords()
apiClient.timeClock.createOvertimeRequest(data)
```

**Benefícios:**
- ✅ URLs centralizadas e fáceis de atualizar
- ✅ Headers automáticos (auth, content-type)
- ✅ Tratamento de erros consistente
- ✅ Type safety com TypeScript
- ✅ Interceptores para logging/erros globais

**Prioridade:** 🔴 **ALTA** - Impacto direto em manutenibilidade

---

### **2. ⏳ ESTADOS DE LOADING**

**Problema:**
- Padrão repetido de `useState` para loading em várias páginas
- Lógica de setLoading(true/false) duplicada
- Não há feedback visual consistente

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Repetido em várias páginas
const [loadingAlerts, setLoadingAlerts] = useState(true);
const [loadingEmployees, setLoadingEmployees] = useState(false);

try {
  setLoadingAlerts(true);
  const response = await fetch('/api/alerts');
  // ...
} finally {
  setLoadingAlerts(false);
}
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Hook customizado
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

const { execute, loading, error } = useAsyncOperation();

const loadAlerts = execute(async () => {
  const response = await apiClient.alerts.getAll();
  setAlerts(response.data);
});
```

**Benefícios:**
- ✅ Reduz código boilerplate
- ✅ Tratamento de erro automático
- ✅ Estados de loading consistentes
- ✅ Facilita testes

**Prioridade:** 🟡 **MÉDIA** - Melhora DX mas não crítico

---

### **3. 📋 CONSTANTES DE DADOS (TIPOS, CATEGORIAS, STATUS)**

**Problema:**
- Arrays de tipos/categorias hardcoded em várias páginas
- Dados duplicados (ex: `alertTypes`, `categories` em shopping)
- Difícil manter consistência

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Em alert-management.tsx
const alertTypes: AlertType[] = [
  { id: '1', name: 'Vencimento de Documento', color: '#e74c3c', ... },
  { id: '2', name: 'Pagamento Pendente', color: '#f39c12', ... },
  // ... 8 tipos
];

// ❌ ANTES: Em shopping-management-backup.tsx
const categories: ShoppingCategory[] = [
  { id: '1', name: 'Supermercado', color: '#3498db', ... },
  { id: '2', name: 'Farmácia', color: '#e74c3c', ... },
  // ... 5 categorias
];
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Constantes centralizadas
import { ALERT_TYPES } from '@/constants/alertTypes';
import { SHOPPING_CATEGORIES } from '@/constants/shoppingCategories';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';
import { TASK_STATUSES } from '@/constants/taskStatuses';
```

**Benefícios:**
- ✅ Fonte única de verdade
- ✅ Fácil atualizar em um lugar
- ✅ Reutilização entre componentes
- ✅ Type safety

**Prioridade:** 🟡 **MÉDIA** - Melhora organização mas não crítico

---

### **4. 🔄 PADRÕES DE DATA FETCHING**

**Problema:**
- Lógica de fetch + loading + error handling repetida
- Mapeamento de dados da API duplicado
- `useEffect` com dependências similares

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Padrão repetido em várias páginas
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/endpoint');
      const result = await response.json();
      if (result.success) {
        const mapped = result.data.map(item => ({
          // mapeamento repetido
        }));
        setData(mapped);
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('error.erro_carregar');
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, [showError]);
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Hook customizado
import { useDataFetch } from '@/hooks/useDataFetch';

const { data, loading, error, refetch } = useDataFetch(
  () => apiClient.alerts.getAll(),
  {
    mapper: (apiData) => apiData.map(/* transformação */),
    onError: (error) => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
  }
);
```

**Benefícios:**
- ✅ Reduz código repetitivo
- ✅ Tratamento de erro consistente
- ✅ Cache automático (opcional)
- ✅ Refetch fácil

**Prioridade:** 🟡 **MÉDIA** - Melhora DX significativamente

---

### **5. ✅ VALIDAÇÕES DE FORMULÁRIOS**

**Problema:**
- Validações espalhadas em componentes
- Regras de validação duplicadas
- Mensagens de erro hardcoded

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Validações em vários lugares
const validateForm = () => {
  if (!formData.name.trim()) {
    setErrors({ name: 'Nome é obrigatório' });
    return false;
  }
  if (!validateCpf(formData.cpf)) {
    setErrors({ cpf: 'CPF inválido' });
    return false;
  }
  // ...
};
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Schema de validação centralizado
import { z } from 'zod';
import { useFormValidation } from '@/hooks/useFormValidation';

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().refine(validateCpf, 'CPF inválido'),
  email: z.string().email('Email inválido'),
});

const { validate, errors } = useFormValidation(registerSchema);
```

**Benefícios:**
- ✅ Validações declarativas
- ✅ Mensagens centralizadas
- ✅ Type safety
- ✅ Reutilização

**Prioridade:** 🟢 **BAIXA** - Já existe `useValidation`, pode melhorar

---

### **6. 🎨 ESTILOS COMPARTILHADOS**

**Problema:**
- Styled Components similares em várias páginas
- Padrões de estilo repetidos
- Difícil manter consistência visual

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Estilos similares em várias páginas
const StatCard = styled.div<{ $theme?: Theme }>`
  background: ${props => props.$theme?.colors?.background?.primary || 'transparent'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${props => /* cálculo complexo */};
`;

const SectionText = styled.p<{ $theme?: Theme }>`
  color: ${props => props.$theme?.colors?.text?.secondary || 'inherit'};
  font-size: 0.9rem;
`;
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Componentes de estilo compartilhados
import { StatCard, SectionText, CardContainer } from '@/components/shared/styled';

// Ou mixins reutilizáveis
import { cardMixin, textMixin } from '@/components/shared/mixins';
```

**Benefícios:**
- ✅ Consistência visual
- ✅ Menos código duplicado
- ✅ Fácil manutenção

**Prioridade:** 🟢 **BAIXA** - Já existe `shared/styles.ts`, pode melhorar

---

### **7. 🔐 AUTENTICAÇÃO E HEADERS**

**Problema:**
- Lógica de autenticação repetida
- Headers de autenticação duplicados
- Token management espalhado

**Exemplos encontrados:**
```typescript
// ❌ ANTES: Headers repetidos
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};
```

**Solução proposta:**
```typescript
// ✅ DEPOIS: Cliente HTTP já resolve isso
// Headers automáticos no apiClient
```

**Prioridade:** 🔴 **ALTA** - Resolvido com API Client (#1)

---

### **8. 📅 FORMATAÇÃO DE DATAS E VALORES**

**Status:** ✅ **JÁ CENTRALIZADO**
- `src/utils/formatters.ts` já existe
- Funções: `formatDate`, `formatTime`, `formatCurrency`, `formatNumber`
- Mas pode ter uso inconsistente

**Recomendação:**
- Garantir uso consistente em todas as páginas
- Adicionar mais formatações se necessário

**Prioridade:** 🟢 **BAIXA** - Já existe, apenas garantir uso

---

## 📋 **PRIORIZAÇÃO RECOMENDADA**

### **Fase 1: Crítico (Alto Impacto)** 🔴

1. **API Client Centralizado**
   - Impacto: 🔴 ALTO
   - Esforço: 🟡 MÉDIO
   - Benefício: Manutenibilidade, type safety, consistência

### **Fase 2: Importante (Melhora DX)** 🟡

2. **Hook de Data Fetching**
   - Impacto: 🟡 MÉDIO
   - Esforço: 🟢 BAIXO
   - Benefício: Reduz código repetitivo

3. **Hook de Async Operations**
   - Impacto: 🟡 MÉDIO
   - Esforço: 🟢 BAIXO
   - Benefício: Estados de loading consistentes

4. **Constantes de Dados**
   - Impacto: 🟡 MÉDIO
   - Esforço: 🟢 BAIXO
   - Benefício: Fonte única de verdade

### **Fase 3: Melhorias (Opcional)** 🟢

5. **Validações de Formulários** (melhorar existente)
6. **Estilos Compartilhados** (melhorar existente)
7. **Formatações** (garantir uso consistente)

---

## 🎯 **RECOMENDAÇÃO FINAL**

**Começar pela Fase 1: API Client Centralizado**

Este é o item com maior impacto e resolve múltiplos problemas:
- ✅ Centraliza endpoints
- ✅ Headers automáticos
- ✅ Tratamento de erros
- ✅ Type safety
- ✅ Facilita testes

Depois disso, seguir com Fase 2 para melhorar DX.

---

## 💡 **PRÓXIMOS PASSOS**

1. Criar `src/lib/apiClient.ts` com cliente HTTP centralizado
2. Migrar páginas principais para usar o cliente
3. Criar hooks customizados para data fetching
4. Centralizar constantes de dados

