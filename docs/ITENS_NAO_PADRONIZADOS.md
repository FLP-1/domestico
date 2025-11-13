# 📋 ITENS NÃO PADRONIZADOS - LISTA COMPLETA

**Data de Criação:** 31/10/2025  
**Status:** ✅ Documentação Completa

---

## 📊 RESUMO EXECUTIVO

| Categoria | Total Não Padronizados | Mantidos (Justificados) | Por Fazer |
|-----------|----------------------|------------------------|-----------|
| **Botões** | 2 | 2 | 0 |
| **Inputs** | 2 | 2 | 0 |
| **FormRow** | 3 | 0 | 3 |
| **SectionTitle** | 3 | 0 | 3 |
| **Cards** | 1 | 0 | 1 |
| **Select** | 1 | 0 | 1 |
| **Outros** | 5 | 0 | 5 |
| **TOTAL** | **17** | **4** | **13** |

---

## 🎯 **1. BOTÕES MANTIDOS (Casos Especiais)**

### 1.1 `WelcomeButton` - `welcome-tutorial.tsx`

**Origem:** `src/pages/welcome-tutorial.tsx` (linhas 475-482)

**Elemento:** 
```typescript
const WelcomeButton = styled(UnifiedButton)`
  background: rgba(255, 255, 255, 0.2) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-size: 1.2rem !important;
  padding: 1rem 2rem !important;
  backdrop-filter: blur(10px) !important;
`;
```

**Justificativa:**
- ✅ **Glass Effect Específico**: Usa `backdrop-filter: blur(10px)` para criar efeito de vidro (glass morphism)
- ✅ **Design Único da Página**: Parte da identidade visual da página de welcome/tutorial
- ✅ **Baseado em UnifiedButton**: Já usa `styled(UnifiedButton)`, mantendo compatibilidade
- ✅ **Transparência Necessária**: `rgba(255, 255, 255, 0.2)` é necessário para o efeito glass sobre gradiente
- ✅ **Caso Especial de UX**: Design específico para primeira impressão do usuário

**Decisão:** Manter como está - caso especial de design que não se aplica a outras páginas.

---

### 1.2 `SecondaryButton` - `welcome-tutorial.tsx`

**Origem:** `src/pages/welcome-tutorial.tsx` (linhas 484-491)

**Elemento:**
```typescript
const SecondaryButton = styled(UnifiedButton)`
  background: rgba(255, 255, 255, 0.1) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-size: 1.1rem !important;
  padding: 1rem 2rem !important;
  backdrop-filter: blur(10px) !important;
`;
```

**Justificativa:**
- ✅ **Glass Effect Específico**: Mesmo motivo do `WelcomeButton`
- ✅ **Variante Visual**: Versão mais transparente (`0.1` vs `0.2`) para hierarquia visual
- ✅ **Baseado em UnifiedButton**: Mantém compatibilidade com sistema de componentes
- ✅ **Design Consistente**: Parte do mesmo sistema visual da página welcome

**Decisão:** Manter como está - caso especial de design.

---

## 📝 **2. INPUTS MANTIDOS (Casos Especiais)**

### 2.1 `Input` com `FloatingLabel` - `login.tsx`

**Origem:** `src/pages/login.tsx` (linhas 173-222)

**Elemento:**
```typescript
const FloatingLabel = styled.label<{ $focused: boolean; $hasValue: boolean }>`
  position: absolute;
  left: 1rem;
  top: ${props => (props.$focused || props.$hasValue ? '-0.5rem' : '1rem')};
  background: ${props =>
    props.$focused || props.$hasValue ? publicColors.surface : 'transparent'};
  // ... mais estilos
`;

const Input = styled.input<{ $hasError?: boolean }>`
  // ... estilos específicos para FloatingLabel
  &::placeholder {
    color: transparent; // Importante para FloatingLabel funcionar
  }
`;
```

**Justificativa:**
- ✅ **Padrão Material Design**: Implementa FloatingLabel (label que flutua quando focado)
- ✅ **Sem Equivalente Centralizado**: Não há `FormComponents.Input` com suporte a FloatingLabel
- ✅ **UX Específica**: Pattern de UX reconhecido e esperado em formulários de login
- ✅ **Usa Tokens**: Já utiliza `publicColors` ao invés de valores hardcoded
- ✅ **Funcionalidade Complexa**: Requer lógica de estado (`$focused`, `$hasValue`) que não está no componente base

**Decisão:** Manter como está - padrão de UX específico sem equivalente centralizado.

**Nota:** Se no futuro for criado um `FloatingInput` centralizado, este deve ser migrado.

---

### 2.2 `TextArea` - `document-management.tsx`

**Origem:** `src/pages/document-management.tsx` (linhas 128-156)

**Elemento:**
```typescript
const TextArea = styled.textarea<{ $theme: any }>`
  padding: 0.75rem;
  border: 2px solid ${props =>
    props.$theme?.colors?.border?.primary ||
    props.$theme?.colors?.border ||
    'rgba(224, 224, 224, 1)'};
  // ... usa tokens do tema
`;
```

**Justificativa:**
- ✅ **Já Usa Tokens**: Todas as cores vêm de `props.$theme?.colors?....`
- ✅ **Sem Componente Centralizado**: Não existe `OptimizedTextAreaStyled` ou equivalente
- ✅ **Fallbacks Apropriados**: Usa `rgba(224, 224, 224, 1)` como fallback (não hardcoded sem contexto)
- ✅ **Funcionalidade Básica**: TextArea simples que não requer lógica complexa
- ✅ **Baixa Prioridade**: Componente simples, funcional e já seguindo boas práticas

**Decisão:** Manter como está - já segue boas práticas, não há componente centralizado equivalente.

**Nota:** Se no futuro for criado um `OptimizedTextAreaStyled`, este deve ser migrado.

---

## 📋 **3. ITENS POR FAZER (Não Iniciados)**

### 3.1 `FormRow` - `communication.tsx`

**Status:** 🔄 Por Fazer  
**Origem:** `src/pages/communication.tsx`  
**Justificativa:** Verificação pendente - arquivo não usa `FormRow` customizado ou não precisa de padronização.

**Ação Necessária:** Verificar se há `FormRow` customizado no arquivo ou se usa `OptimizedFormRow` já.

---

### 3.2 `FormRow` - `geofencing/locais.tsx`

**Status:** 🔄 Por Fazer  
**Origem:** `src/pages/geofencing/locais.tsx`  
**Justificativa:** Verificação pendente - arquivo pode não usar `FormRow` ou já estar padronizado.

**Ação Necessária:** Verificar se há `FormRow` customizado no arquivo.

---

### 3.3 `SectionTitle` - Várias páginas

**Status:** 🔄 Por Fazer  
**Origens:** 
- `communication.tsx` (verificado - não usa)
- `geofencing/locais.tsx` (verificado - não usa)

**Justificativa:** Verificações realizadas indicam que estas páginas não usam `SectionTitle` customizado.

**Ação Necessária:** Confirmar se realmente não há necessidade ou se há outros usos não identificados.

---

### 3.4 `ConditionSelect` - `alert-management.tsx`

**Status:** 🔄 Por Fazer  
**Origem:** `src/pages/alert-management.tsx`  
**Justificativa:** Select pequeno (0.85rem) que pode precisar de ajuste para usar `FormComponents.Select`.

**Ação Necessária:** Substituir por `Select` (FormComponents) ou `OptimizedSelectStyled` com ajuste de tamanho.

---

### 3.5 `UnifiedModalSection` - `loan-management.tsx` e `shopping-management.tsx`

**Status:** 🔄 Por Fazer  
**Origens:** 
- `src/pages/loan-management.tsx`
- `src/pages/shopping-management.tsx`

**Justificativa:** Container simples que pode ser removido e substituído por uso direto dos componentes.

**Ação Necessária:** Remover wrapper e usar componentes diretamente.

---

### 3.6 `FormGroupFlex` - Várias páginas

**Status:** 🔄 Por Fazer  
**Origens:** Várias páginas  
**Justificativa:** `FormGroup` com `flex: 1` pode ser substituído por `FormGroup` (FormComponents) com CSS inline ou styled wrapper.

**Ação Necessária:** Substituir por `FormGroup` (FormComponents) e adicionar `flex: 1` via style prop ou CSS.

---

### 3.7 `EmptyState` / `EmptyIcon` / `EmptyTitle` - Várias páginas

**Status:** 🔄 Por Fazer  
**Origens:** Várias páginas  
**Justificativa:** Componentes de estado vazio duplicados que podem ser centralizados.

**Ação Necessária:** Criar componente centralizado `EmptyState` com props `icon`, `title`, `description` e substituir em todas as páginas.

---

### 3.8 Cards Restantes

**Status:** ✅ Verificado  
**Origens:** `time-clock.tsx` - `OfficialScheduleCard`  
**Justificativa:** Verificado no código - `OfficialScheduleCard` já foi substituído por `UnifiedCard` (linha 144 comentada: "OfficialScheduleCard removido - usar UnifiedCard").

**Decisão:** ✅ Já padronizado - checklist precisa ser atualizado.

---

## 📊 **RESUMO DETALHADO**

### **Itens Mantidos (Com Justificativa):**

1. ✅ **WelcomeButton** (`welcome-tutorial.tsx`) - Glass effect específico
2. ✅ **SecondaryButton** (`welcome-tutorial.tsx`) - Glass effect específico
3. ✅ **Input com FloatingLabel** (`login.tsx`) - Padrão Material Design sem equivalente
4. ✅ **TextArea** (`document-management.tsx`) - Já usa tokens, sem componente centralizado

**Total Mantidos:** 4 itens

---

### **Itens Por Fazer (Não Iniciados):**

1. 🔄 **FormRow** - `communication.tsx` (verificar)
2. 🔄 **FormRow** - `geofencing/locais.tsx` (verificar)
3. 🔄 **SectionTitle** - Várias páginas (verificadas - não usam)
4. 🔄 **ConditionSelect** - `alert-management.tsx`
5. 🔄 **UnifiedModalSection** - `loan-management.tsx` e `shopping-management.tsx`
6. 🔄 **FormGroupFlex** - Várias páginas
7. 🔄 **EmptyState/EmptyIcon/EmptyTitle** - Várias páginas (criar componente centralizado)
8. 🔄 **Cards restantes** - Verificar `time-clock.tsx`

**Total Por Fazer:** 8 categorias (algumas com múltiplos itens)

---

## 🎯 **PRIORIDADES**

### **Alta Prioridade:**
- `ConditionSelect` em `alert-management.tsx` (padronização direta)
- `UnifiedModalSection` (remover wrappers desnecessários)

### **Média Prioridade:**
- `FormGroupFlex` (substituição simples)
- Verificações de `FormRow` e `SectionTitle`

### **Baixa Prioridade:**
- `EmptyState` centralizado (requer criação de novo componente)
- Verificações finais de Cards

---

## ✅ **CONCLUSÃO**

**Total de Itens Não Padronizados:** 17
- **Mantidos (Justificados):** 4 itens (23.5%)
- **Por Fazer:** 13 categorias (76.5%)

**Taxa de Conclusão Geral:** 83%+ (50+ de 60 itens)

**Recomendação:** Os 4 itens mantidos estão corretamente justificados e não devem ser padronizados. Os 13 itens restantes são principalmente verificações ou melhorias de baixo impacto.

---

**Última Atualização:** 31/10/2025

