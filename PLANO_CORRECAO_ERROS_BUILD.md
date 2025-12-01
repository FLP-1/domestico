# 📋 Plano de Correção de Erros de Build

## ⚠️ Situação Atual

O build está falhando na fase de linting/compilação, **ANTES** de chegar ao prerendering.

## 🎯 Objetivo

Corrigir todos os erros de compilação para que o build chegue à fase de prerendering e possamos capturar o erro `f.div.withConfig.withConfig.b`.

## 📝 Erros Identificados

### 1. Erros de Parsing (Críticos)

- ✅ `src/constants/alertTypes.tsx:25` - JSX em array (pode estar ok)
- ✅ `src/constants/shoppingCategories.tsx:24` - JSX em array (pode estar ok)
- ⏳ `src/design-system/components/Button.tsx:44` - Verificar sintaxe
- ⏳ `src/hooks/useDataFetch.ts:11` - Verificar sintaxe
- ⏳ `src/pages/esocial-integration.tsx:68` - Verificar sintaxe
- ⏳ `src/pages/geofencing/locais.tsx:605` - JSX tag não fechada
- ⏳ `src/pages/time-clock.tsx:826` - Verificar try/catch

### 2. Componentes Não Definidos

- ⏳ `src/pages/document-management.tsx` - Componentes definidos mas podem ter escopo errado

### 3. Erros de JSX

- ⏳ `src/pages/monitoring-dashboard.tsx:659` - Tag não fechada
- ⏳ `src/pages/welcome-tutorial.tsx:1061` - Props duplicadas

### 4. Erros de React Hooks

- ⏳ `src/hooks/useAsyncOperation.ts:103` - Hook em callback

## 🔧 Próximos Passos

1. Verificar e corrigir cada erro de parsing
2. Corrigir componentes não definidos
3. Corrigir erros de JSX
4. Corrigir erros de React Hooks
5. Executar build novamente
6. Capturar erro de prerendering
