# 📊 RELATÓRIO: Dados Mockados e Hardcoded no Projeto DOM

**Data:** 08/01/2025  
**Status:** ⚠️ **DADOS MOCKADOS/HARDCODED IDENTIFICADOS**

---

## 🎯 RESUMO EXECUTIVO

Foram identificados **dados mockados e hardcoded** em produção que devem ser substituídos por dados reais do banco de dados ou APIs.

**Total de arquivos com dados mockados/hardcoded:** 4 arquivos principais

---

## 🔴 PRIORIDADE CRÍTICA

### 1. **`src/pages/payroll-management.tsx`** ⚠️ CRÍTICO

**Problema:** Array de funcionários hardcoded

**Localização:** Linhas 746-764

**Dados Hardcoded:**
```typescript
const employees: Employee[] = [
  {
    id: '1',
    name: 'Maria Santos',
    position: 'Empregada Doméstica',
    avatar: 'MS',
    baseSalary: 1500,
    // ... mais dados fictícios
  },
  {
    id: '2',
    name: 'Ana Costa',
    position: 'Empregada Doméstica',
    avatar: 'AC',
    baseSalary: 1200,
    // ... mais dados fictícios
  },
];
```

**Solução:**
- ✅ Substituir por chamada à API `/api/users` ou `/api/employees`
- ✅ Carregar dados reais do banco de dados
- ✅ Implementar loading state durante carregamento

**Impacto:** ALTO - Página principal de gestão de folha de pagamento

---

### 2. **`src/pages/loan-management.tsx`** ⚠️ CRÍTICO

**Problema:** Dados de empréstimos e resumo hardcoded

**Localização:** Linhas 566-625

**Dados Hardcoded:**

**a) Resumo de empréstimos (linhas 566-573):**
```typescript
const [loanSummary] = useState({
  totalPending: 2500,
  totalApproved: 5000,
  totalPaid: 3000,
  totalOutstanding: 2000,
  nextPaymentDate: '2024-02-15',
  nextPaymentAmount: 500,
});
```

**b) Array de solicitações (linhas 575-625):**
```typescript
const [requests, setRequests] = useState<LoanRequest[]>([
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Maria Santos',
    type: 'advance',
    amount: 1000,
    // ... mais dados fictícios
  },
  // ... mais 2 solicitações fictícias
]);
```

**Solução:**
- ✅ Criar API `/api/loans` para gerenciar empréstimos
- ✅ Criar API `/api/loans/summary` para resumo
- ✅ Substituir dados hardcoded por chamadas à API
- ✅ Implementar CRUD completo de empréstimos

**Impacto:** ALTO - Funcionalidade completa de gestão de empréstimos

---

### 3. **`src/pages/esocial-integration.tsx`** ⚠️ MÉDIO

**Problema:** Dados simulados temporários para eventos eSocial

**Localização:** Linhas 1070-1090

**Dados Simulados:**
```typescript
const eventosEnviados = [
  {
    id: '1',
    tipo: 'S1000',
    descricao: 'Cadastramento Inicial do Vínculo',
    dataEnvio: '2024-01-01T10:00:00Z',
    status: 'PROCESSADO',
    protocolo: '12345678901234567890',
    fonte: 'SIMULADO_TEMPORARIO', // ⚠️ DADO SIMULADO
  },
  // ... mais eventos simulados
];
```

**Solução:**
- ✅ Remover fallback de dados simulados
- ✅ Implementar tratamento adequado quando API eSocial não estiver disponível
- ✅ Mostrar mensagem clara ao usuário sobre indisponibilidade

**Impacto:** MÉDIO - Funcionalidade de integração eSocial (já tem tratamento de erro)

---

## 🟡 PRIORIDADE MÉDIA

### 4. **`src/hooks/useTheme.ts`** ⚠️ ACEITÁVEL (Fallback)

**Problema:** Temas hardcoded como fallback

**Localização:** Linhas 45-226

**Dados Hardcoded:**
```typescript
export const profileThemes: Record<string, ProfileTheme> = {
  empregado: {
    id: 'empregado',
    name: 'Empregado',
    colors: {
      primary: '#29ABE2',
      // ... mais cores hardcoded
    },
  },
  // ... mais 7 perfis hardcoded
};
```

**Análise:**
- ✅ **ACEITÁVEL** - Usado apenas como fallback quando não há dados no banco
- ✅ Sistema já prioriza dados do banco de dados (`useCentralizedConfig: true`)
- ✅ Fallback necessário para garantir que o sistema funcione mesmo sem banco

**Recomendação:** Manter como está, mas documentar claramente que é apenas fallback

**Impacto:** BAIXO - Sistema já funciona corretamente com dados do banco

---

## ✅ ARQUIVOS JÁ CORRIGIDOS

### **`src/pages/esocial-domestico-completo.tsx`** ✅ CORRIGIDO

**Status:** ✅ **JÁ USA DADOS REAIS**

- ✅ Carrega funcionários via `dataService.getEmpregadosData()`
- ✅ Carrega folha de pagamento via `/api/payroll`
- ✅ Carrega guias de impostos via `/api/tax-guides`
- ✅ Não há mais dados mockados nesta página

---

## 📋 CHECKLIST DE CORREÇÃO

### **Prioridade 1 - Crítica:**

- [ ] **`payroll-management.tsx`**
  - [ ] Criar/verificar API `/api/users` ou `/api/employees`
  - [ ] Substituir array hardcoded por chamada à API
  - [ ] Implementar loading state
  - [ ] Implementar tratamento de erro

- [ ] **`loan-management.tsx`**
  - [ ] Criar API `/api/loans` (CRUD completo)
  - [ ] Criar API `/api/loans/summary` (resumo)
  - [ ] Substituir dados hardcoded por chamadas à API
  - [ ] Implementar loading states
  - [ ] Implementar tratamento de erro

### **Prioridade 2 - Média:**

- [ ] **`esocial-integration.tsx`**
  - [ ] Remover fallback de dados simulados
  - [ ] Melhorar tratamento quando API não disponível
  - [ ] Adicionar mensagens claras ao usuário

### **Prioridade 3 - Baixa:**

- [ ] **`useTheme.ts`**
  - [ ] Documentar que `profileThemes` é apenas fallback
  - [ ] Adicionar comentário explicativo

---

## 📊 ESTATÍSTICAS

### **Arquivos Analisados:** 4 arquivos principais

### **Breakdown por Prioridade:**

- 🔴 **Crítica**: 2 arquivos (`payroll-management.tsx`, `loan-management.tsx`)
- 🟡 **Média**: 1 arquivo (`esocial-integration.tsx`)
- 🟢 **Baixa**: 1 arquivo (`useTheme.ts` - aceitável como fallback)

### **Impacto Estimado:**

- **Linhas de código a refatorar**: ~150 linhas
- **APIs novas a criar**: 2-3 endpoints (`/api/loans`, `/api/loans/summary`)
- **Tempo estimado**: 4-6 horas

---

## ✅ BENEFÍCIOS DA CORREÇÃO

1. **Dados Reais**: Sistema funcionará com dados reais de produção
2. **Consistência**: Dados consistentes entre todas as páginas
3. **Manutenibilidade**: Fácil adicionar/remover/editar dados
4. **Escalabilidade**: Suporta crescimento sem mudanças no código
5. **Auditoria**: Rastreamento completo de mudanças
6. **Multi-tenant**: Suporte para múltiplos usuários/empresas

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **Criar APIs faltantes:**
   - `/api/loans` - CRUD de empréstimos
   - `/api/loans/summary` - Resumo de empréstimos
   - Verificar se `/api/users` ou `/api/employees` existe

2. **Atualizar páginas:**
   - Substituir dados hardcoded por chamadas às APIs
   - Implementar loading states
   - Adicionar tratamento de erros

3. **Testes:**
   - Testar carregamento de dados reais
   - Testar tratamento de erros
   - Testar estados de loading

---

## 📝 NOTAS IMPORTANTES

- ✅ **Testes (`__tests__`)**: Mocks em testes são **NORMAL** e **ESPERADO** - não devem ser alterados
- ✅ **Fallbacks**: Temas hardcoded em `useTheme.ts` são **ACEITÁVEIS** como fallback
- ⚠️ **Dados de produção**: Arrays hardcoded em páginas de produção devem ser **SUBSTITUÍDOS**

---

**Relatório gerado em:** 08/01/2025  
**Próxima revisão recomendada:** Após correção dos itens críticos

