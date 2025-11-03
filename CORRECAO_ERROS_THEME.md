# Guia de Correção de Erros de Tema

**Data:** Dezembro 2024  
**Versão:** 1.0

Este documento serve como guia e checklist para correção sistemática de erros relacionados ao uso de tema (`$theme`) em componentes styled-components.

---

## 📋 Tabela de Erros e Soluções

| Arquivo | Tipo de Erro | Solução | Status |
|---------|--------------|---------|--------|
| **monitoring-dashboard.tsx** | Declaração duplicada de `currentProfile` e `theme` | Remover declaração duplicada, padronizar estrutura | ✅ Corrigido |
| **esocial-integration.tsx** | Declaração duplicada de `currentProfile` e `theme` | Remover declaração duplicada, padronizar estrutura | ✅ Corrigido |
| **payroll-management.tsx** | Declaração duplicada + Acessos inseguros | Remover duplicata, adicionar optional chaining | ✅ Corrigido |
| **loan-management.tsx** | Declaração duplicada + Acessos inseguros | Remover duplicata, adicionar optional chaining | ✅ Corrigido |
| **task-management.tsx** | Estrutura inconsistente de `theme` + 25 acessos inseguros | Padronizar estrutura, adicionar optional chaining | ✅ Corrigido |
| **shopping-management.tsx** | Estrutura inconsistente + 15 acessos inseguros | Padronizar estrutura, adicionar optional chaining | ✅ Corrigido |
| **alert-management.tsx** | Estrutura inconsistente + 16 acessos inseguros | Padronizar estrutura, adicionar optional chaining | ✅ Corrigido |
| **dashboard.tsx** | Estrutura inconsistente de `theme` | Padronizar estrutura | ✅ Corrigido |
| **time-clock.tsx** | 12 acessos inseguros restantes | Adicionar optional chaining e fallbacks | ✅ Corrigido |
| **terms-management.tsx** | Estrutura inconsistente de `theme` | Padronizar estrutura | ✅ Corrigido |
| **esocial-domestico-completo.tsx** | Estrutura inconsistente de `theme` | Padronizar estrutura | ✅ Corrigido |
| **document-management.tsx** | Estrutura inconsistente + 4 acessos inseguros | Padronizar estrutura, adicionar optional chaining | ✅ Corrigido |
| **geofencing/locais.tsx** | ~30 acessos inseguros | Adicionar optional chaining e fallbacks | ✅ Corrigido |
| **geofencing/auditoria.tsx** | ~20 acessos inseguros | Adicionar optional chaining e fallbacks | ✅ Corrigido |
| **welcome-tutorial.tsx** | ~10 acessos inseguros | Adicionar optional chaining (já usa `publicColors`) | ✅ Corrigido |
| **communication.tsx** | Estrutura inconsistente + acessos parcialmente corrigidos | Padronizar estrutura, completar correções | ✅ Corrigido |
| **shopping-management-backup.tsx** | Estrutura inconsistente + ~15 acessos inseguros | Padronizar estrutura, adicionar optional chaining | ✅ Corrigido |

---

## 🔧 Tipos de Erros e Soluções Padrão

### 1. **Declaração Duplicada de `currentProfile` ou `theme`**

**Erro:**
```typescript
const { currentProfile } = useUserProfile();
const { theme } = useTheme(...);

// ... mais código ...

// Hook do contexto de perfil (DUPLICADO)
const { currentProfile } = useUserProfile();
const { theme } = useTheme(...);
```

**Solução:**
- Remover a declaração duplicada
- Manter apenas a primeira declaração no topo do componente
- Padronizar para:
```typescript
const { currentProfile } = useUserProfile();
const themeObject = useTheme(currentProfile?.role.toLowerCase());
const theme = { colors: themeObject.colors };
```

---

### 2. **Estrutura Inconsistente de `theme`**

**Erro:**
```typescript
// Opção A (incorreta)
const { theme } = useTheme(...);
// theme tem estrutura { theme: {...}, colors: {...}, ... }

// Opção B (incorreta)
const { colors: theme } = useTheme(...);
// theme já é colors, mas componentes esperam { colors: {...} }
```

**Solução:**
```typescript
const themeObject = useTheme(currentProfile?.role.toLowerCase());
const theme = { colors: themeObject.colors };
```

**Justificativa:** Os componentes styled esperam `props.$theme.colors.X`, então `theme` deve ter a estrutura `{ colors: {...} }`.

---

### 3. **Acesso Inseguro a Propriedades do Tema**

**Erro:**
```typescript
const StyledComponent = styled.div<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  background: ${props => props.$theme.colors.background};
  border: 1px solid ${props => props.$theme.colors.border};
`;
```

**Problema:** Se `$theme` for `undefined` ou `colors` não existir, causa `TypeError: Cannot read properties of undefined`.

**Solução:**
```typescript
import { defaultColors, addOpacity } from '../utils/themeHelpers';

const StyledComponent = styled.div<{ $theme: any }>`
  color: ${props => props.$theme?.colors?.text?.primary || props.$theme?.colors?.text || defaultColors.text.primary};
  background: ${props => props.$theme?.colors?.background || defaultColors.background};
  border: 1px solid ${props => props.$theme?.colors?.border || defaultColors.border};
`;
```

**Padrão de Fallback:**
- Use optional chaining (`?.`) em todas as propriedades aninhadas
- Forneça fallback com `defaultColors` para cada propriedade
- Para `text`, aceite tanto `text.primary` quanto `text` direto (compatibilidade)

---

### 4. **Concatenação de Cores com Opacidade**

**Erro:**
```typescript
border: 1px solid ${props => props.$theme.colors.primary}20;
background: ${props => props.$theme.colors.primary}10;
```

**Solução:**
```typescript
border: 1px solid ${props => (props.$theme?.colors?.primary || defaultColors.primary) + '20'};
background: ${props => (props.$theme?.colors?.primary || defaultColors.primary) + '10'};
```

**Alternativa (Recomendada):**
```typescript
import { addOpacity } from '../utils/themeHelpers';

border: 1px solid ${props => addOpacity(props.$theme?.colors?.primary || defaultColors.primary, 0.2)};
background: ${props => addOpacity(props.$theme?.colors?.primary || defaultColors.primary, 0.1)};
```

---

## ✅ Checklist de Correção

Para cada arquivo, verifique:

- [ ] **Importações:** Adicionar `import { defaultColors, addOpacity } from '../utils/themeHelpers';`
- [ ] **Estrutura do theme:** Padronizar para `const theme = { colors: themeObject.colors };`
- [ ] **Remover duplicatas:** Verificar se há declarações duplicadas de `currentProfile` ou `theme`
- [ ] **Optional chaining:** Substituir `props.$theme.colors.X` por `props.$theme?.colors?.X`
- [ ] **Fallbacks:** Adicionar `|| defaultColors.X` em todos os acessos
- [ ] **Text compatibilidade:** Aceitar tanto `text.primary` quanto `text` direto
- [ ] **Concatenação:** Corrigir concatenação de cores (usar parênteses ou `addOpacity`)
- [ ] **Linter:** Verificar se não há erros após correções

---

## 📝 Padrão de Correção Completo

### Antes:
```typescript
import { useTheme } from '../hooks/useTheme';

export default function MyPage() {
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  
  // ... componente usa props.$theme.colors.X
}

const StyledDiv = styled.div<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  background: ${props => props.$theme.colors.background};
  border: 1px solid ${props => props.$theme.colors.primary}20;
`;
```

### Depois:
```typescript
import { useTheme } from '../hooks/useTheme';
import { defaultColors, addOpacity } from '../utils/themeHelpers';

export default function MyPage() {
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  
  // ... componente usa props.$theme com estrutura correta
}

const StyledDiv = styled.div<{ $theme: any }>`
  color: ${props => props.$theme?.colors?.text?.primary || props.$theme?.colors?.text || defaultColors.text.primary};
  background: ${props => props.$theme?.colors?.background || defaultColors.background};
  border: 1px solid ${props => addOpacity(props.$theme?.colors?.primary || defaultColors.primary, 0.2)};
`;
```

---

## 🎯 Arquivos Priorizados para Correção

### Alta Prioridade (Causam erros de compilação):
1. ✅ `payroll-management.tsx` - Corrigido
2. ✅ `loan-management.tsx` - Corrigido
3. ✅ `monitoring-dashboard.tsx` - Corrigido
4. ✅ `esocial-integration.tsx` - Corrigido

### Média Prioridade (Causam erros de runtime):
5. ✅ `task-management.tsx` - Corrigido
6. ✅ `shopping-management.tsx` - Corrigido
7. ✅ `alert-management.tsx` - Corrigido
8. ✅ `time-clock.tsx` - Corrigido
9. ✅ `dashboard.tsx` - Corrigido

### Baixa Prioridade (Preventivo):
10. ⏳ `terms-management.tsx`
11. ⏳ `esocial-domestico-completo.tsx`
12. ⏳ `document-management.tsx`
13. ⏳ `geofencing/*.tsx`
14. ⏳ `welcome-tutorial.tsx`
15. ⏳ `communication.tsx` (verificar se já está completo)
16. ⏳ `shopping-management-backup.tsx`

---

## 🔍 Como Identificar Erros

Use os seguintes comandos para identificar problemas:

```bash
# Encontrar declarações duplicadas
grep -r "const.*currentProfile.*useUserProfile" src/pages/
grep -r "const.*theme.*useTheme" src/pages/

# Encontrar acessos inseguros (sem optional chaining)
grep -r "props\.\$theme\.colors\.[a-zA-Z]" src/pages/

# Contar ocorrências por arquivo
grep -r "props\.\$theme\.colors\.[a-zA-Z]" src/pages/ | cut -d: -f1 | sort | uniq -c
```

---

## 📚 Referências

- Arquivo de helpers: `src/utils/themeHelpers.ts`
- Hook de tema: `src/hooks/useTheme.ts`
- Cores padrão: Definidas em `defaultColors` e `publicColors` em `themeHelpers.ts`

---

**Última atualização:** Dezembro 2024  
**Próximos passos:** Corrigir arquivos pendentes seguindo este guia sistematicamente.

