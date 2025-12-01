# 📋 Script para Identificar Erro f.div.withConfig.withConfig.b

## 🎯 Objetivo

Criar uma rotina/código para identificar especificamente onde está ocorrendo o erro `f.div.withConfig.withConfig.b`.

## 🔍 Padrões de Busca

O erro `f.div.withConfig.withConfig.b` indica duplicação de `withConfig`. O script busca por:

### Padrão 1: Duplicação Direta
```typescript
// ❌ ERRADO
const Component = styled.div.withConfig({...}).withConfig({...})`
```

### Padrão 2: Extensão de Componente que Já Tem withConfig
```typescript
// ❌ ERRADO
const NewComponent = styled(UnifiedCard).withConfig({...})`
// UnifiedCard já tem withConfig, então isso causa duplicação
```

### Padrão 3: Extensão de Componente Local que Já Tem withConfig
```typescript
// No mesmo arquivo:
const BaseComponent = styled.div.withConfig({...})`
// ...
const ExtendedComponent = styled(BaseComponent).withConfig({...})` // ❌ ERRADO
```

## 📝 Scripts Criados

### 1. `scripts/find-duplicate-withconfig.ps1`
Script PowerShell completo com múltiplos padrões de busca.

### 2. `scripts/find-duplicate-withconfig-simple.ps1`
Versão simplificada focada nos padrões mais comuns.

### 3. `scripts/analyze-withconfig-chains.ts`
Script TypeScript para análise mais profunda (requer ts-node).

## 🚀 Como Usar

### PowerShell (Windows):
```powershell
cd E:\DOM
.\scripts\find-duplicate-withconfig-simple.ps1
```

### Verificar Resultados:
```powershell
Get-Content withconfig-issues.json | ConvertFrom-Json
```

## ✅ Componentes Conhecidos que JÁ TÊM withConfig

Esses componentes NÃO devem ser estendidos com `.withConfig()`:

- `UnifiedCard`
- `UnifiedButton`
- `FlexColumn`
- `FlexRow`
- `Container` (de PageContainer)
- `MainContent` (de PageContainer)
- `ContentWrapper` (de PageContainer)
- `HeaderContainer` (de PageHeader)
- `HeaderContent` (de PageHeader)

## 🔧 Correção

Quando encontrar um componente que estende um dos acima e adiciona `withConfig`:

**ANTES (❌ ERRADO):**
```typescript
const MyCard = styled(UnifiedCard).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$')
})`
```

**DEPOIS (✅ CORRETO):**
```typescript
const MyCard = styled(UnifiedCard)`
// withConfig já está no UnifiedCard, não precisa adicionar novamente
```

## 📊 Status da Verificação

- ✅ Script criado
- ⏳ Aguardando execução e resultados

