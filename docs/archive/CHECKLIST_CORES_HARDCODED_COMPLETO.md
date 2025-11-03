# 📋 CHECKLIST COMPLETO - CORREÇÃO DE CORES HARDCODED

## 🎯 OBJETIVO
Eliminar TODAS as cores hardcoded (#xxxxxx e rgba) e substituir por referências dinâmicas ao sistema de temas.

## 📊 STATUS GERAL
- **Total de arquivos**: 57
- **Arquivos corrigidos**: 0
- **Arquivos pendentes**: 57

---

## 🔥 PRIORIDADE CRÍTICA (Componentes principais)

### ✅ src/design-system/index.ts
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**: 
  - `#29ABE2` ✅ CORRIGIDO
  - `rgba(41, 171, 226, 0.1)` ❌ PENDENTE
- **Ação**: Substituir rgba por referência dinâmica

### ✅ src/components/TutorialComponent.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
  - `#f9fafb` ✅ CORRIGIDO
  - `#5a6c7d` ✅ CORRIGIDO
  - `#9e9e9e` ✅ CORRIGIDO
  - `#1e3a8a` ✅ CORRIGIDO
  - `#1e40af` ✅ CORRIGIDO
  - `#1d4ed8` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

---

## 🚨 PRIORIDADE ALTA (Páginas principais)

### ❌ src/pages/monitoring-dashboard.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

### ❌ src/pages/terms-management.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

### ❌ src/pages/register.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
  - `#1e88e5` ❌ PENDENTE
- **Ação**: Substituir #1e88e5 por referência dinâmica

### ❌ src/pages/communication.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
  - `#9B59B6` ❌ PENDENTE
- **Ação**: Substituir #9B59B6 por referência dinâmica

### ❌ src/pages/payroll-management.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
  - `#90EE90` ❌ PENDENTE
- **Ação**: Substituir #90EE90 por referência dinâmica

### ❌ src/pages/welcome-tutorial.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

### ❌ src/pages/esocial-integration.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

### ❌ src/pages/login.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

### ❌ src/pages/esocial-domestico-completo.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

### ❌ src/pages/time-clock.tsx
- **Status**: ⚠️ PARCIALMENTE CORRIGIDO
- **Cores hardcoded encontradas**:
  - `#29ABE2` ✅ CORRIGIDO
- **Ação**: Verificar se há mais cores hardcoded

---

## 🔧 PRIORIDADE MÉDIA (Componentes e hooks)

### ❌ src/hooks/useTheme.ts
- **Status**: ❌ NÃO CORRIGIDO
- **Cores hardcoded encontradas**: Múltiplas cores hardcoded
- **Ação**: Auditoria completa necessária

### ❌ src/hooks/useSystemConfig.ts
- **Status**: ❌ NÃO CORRIGIDO
- **Cores hardcoded encontradas**: Múltiplas cores hardcoded
- **Ação**: Auditoria completa necessária

### ❌ src/design-system/components/UnifiedModal.tsx
- **Status**: ❌ NÃO CORRIGIDO
- **Cores hardcoded encontradas**: Múltiplas cores hardcoded
- **Ação**: Auditoria completa necessária

### ❌ src/design-system/components/Modal.tsx
- **Status**: ❌ NÃO CORRIGIDO
- **Cores hardcoded encontradas**: Múltiplas cores hardcoded
- **Ação**: Auditoria completa necessária

---

## 📁 PRIORIDADE BAIXA (Arquivos de configuração e testes)

### ✅ src/config/default-colors.ts
- **Status**: ✅ CORRETO (cores hardcoded são definições base)
- **Ação**: Nenhuma - arquivo deve ter cores hardcoded

### ❌ src/config/constants.ts
- **Status**: ❌ NÃO CORRIGIDO
- **Ação**: Auditoria completa necessária

### ❌ src/config/centralized-config.ts
- **Status**: ❌ NÃO CORRIGIDO
- **Ação**: Auditoria completa necessária

---

## 🎯 METODOLOGIA DE CORREÇÃO

### Para cada arquivo:
1. **Auditoria completa**: Buscar TODAS as cores hardcoded
2. **Mapeamento**: Listar cada ocorrência encontrada
3. **Correção sistemática**: Substituir por referências dinâmicas
4. **Validação**: Verificar se não há mais cores hardcoded
5. **Marcar como concluído**: ✅ no checklist

### Padrão de correção:
```typescript
// ❌ ERRADO
color: '#29ABE2'
background: 'rgba(41, 171, 226, 0.1)'

// ✅ CORRETO
color: DEFAULT_COLORS.profiles.empregado.primary
background: DEFAULT_COLORS.profiles.empregado.primaryLight
```

---

## 📊 PROGRESSO
- **Arquivos corrigidos**: 0/57
- **Cores hardcoded eliminadas**: 0
- **Próximo arquivo**: src/design-system/index.ts (finalizar correção)

---

## 🚀 PRÓXIMOS PASSOS
1. Finalizar correção do src/design-system/index.ts
2. Continuar com src/components/TutorialComponent.tsx
3. Prosseguir sistematicamente pela lista
4. Atualizar checklist conforme progresso
