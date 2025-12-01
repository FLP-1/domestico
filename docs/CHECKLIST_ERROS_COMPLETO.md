# 📋 CHECKLIST COMPLETO DE ERROS - BUILD DOM

**Data:** 2025-01-08  
**Estratégia:** Listar todos os erros primeiro, depois corrigir por categoria

---

## 🎯 CATEGORIZAÇÃO DE ERROS

### ✅ CATEGORIA 1: Cores Hardcoded (defaultColors.*, tokens.colors.*)

**Padrão:** Uso de cores hardcoded como fallback em `getThemeColor()`  
**Solução:** Substituir por `'transparent'`, `'inherit'` ou `'currentColor'`

**Arquivos afetados:**
- [x] `src/pages/communication.tsx` - Corrigido
- [ ] `src/components/unified/UnifiedBadge/index.tsx`
- [ ] `src/components/PageHeader/index.tsx`
- [ ] `src/components/ESocialTemplatesGuide/index.tsx`
- [ ] `src/pages/document-management.tsx`
- [ ] `src/pages/time-clock.tsx`
- [ ] `src/pages/shopping-management.tsx`
- [ ] `src/pages/payroll-management.tsx`
- [ ] `src/pages/task-management.tsx`
- [ ] `src/pages/loan-management.tsx`
- [ ] `src/components/WelcomeSection/index.tsx`
- [ ] `src/components/unified/UnifiedTabs/index.tsx`
- [ ] `src/components/unified/UnifiedMetaInfo/index.tsx`
- [ ] `src/utils/themeTypeGuards.ts`

**Comando de busca:**
```bash
grep -r "defaultColors\." src/
grep -r "tokens\.colors\." src/
```

---

### ✅ CATEGORIA 2: Props `$theme` Faltantes

**Padrão:** `Property '$theme' does not exist on type 'ThemedStyledProps<...>'`  
**Solução:** Adicionar `$theme?: any` ao tipo do styled component

**Arquivos afetados:**
- [x] `src/pages/communication.tsx` - Corrigido
- [ ] Verificar outros arquivos conforme erros aparecem

**Padrão de correção:**
```typescript
// ANTES
const Component = styled.div`
  ...
`;

// DEPOIS
const Component = styled.div<{ $theme?: any }>`
  ...
`;
```

---

### ✅ CATEGORIA 3: Imports Incorretos

**Padrão:** `Cannot find module '@/src/constants/...'` ou `'../../constants/...'`  
**Solução:** Corrigir caminhos

**Correções aplicadas:**
- [x] `@/src/constants` → `@/constants`
- [x] `../../constants` → `../../../constants` (quando necessário)

---

### ✅ CATEGORIA 4: Warnings de Hooks (exhaustive-deps)

**Padrão:** `React Hook useCallback/useEffect has missing dependencies`  
**Status:** Apenas warnings, não bloqueiam build  
**Prioridade:** Baixa (corrigir após erros de tipo)

**Arquivos com warnings:**
- `src/components/ContextualChat/index.tsx:216`
- `src/components/TimeRecordCard/index.tsx:482`
- `src/hooks/useAsyncOperation.ts:115`
- `src/hooks/useFeatureFlag.ts:93`
- `src/hooks/useI18n.ts:17`
- `src/pages/communication.tsx:239`
- `src/pages/diagnostico-geolocalizacao.tsx:341`
- `src/pages/loan-management.tsx:622`
- `src/pages/payroll-management.tsx:816`
- `src/pages/shopping-management.tsx:407,486,530,557`
- `src/pages/task-management.tsx:645`
- `src/pages/time-clock.tsx:966`
- `src/pages/_app.tsx:239`

---

## 📊 STATUS ATUAL

**Erros de Tipo TypeScript:** 1 (em correção)  
**Warnings de Hooks:** 14 (não bloqueiam build)  
**Arquivos com cores hardcoded:** 15 identificados

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ Corrigir último erro de tipo restante
2. ⏳ Remover todas as referências a `defaultColors.*` e `tokens.colors.*` hardcoded
3. ⏳ Validar build final
4. ⏳ Corrigir warnings de hooks (opcional)

