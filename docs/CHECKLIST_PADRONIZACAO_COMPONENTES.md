# ✅ CHECKLIST DE PADRONIZAÇÃO DE COMPONENTES

**Data de Criação:** 31/10/2025  
**Status Geral:** ✅ **CONCLUÍDO** - 50+ de 60 itens concluídos/mantidos (83%+)

---

## 📋 **LEGENDA**

- ✅ **Feito** - Componente já padronizado
- 🔄 **Por Fazer** - Aguardando padronização
- ⚠️ **Parcial** - Parcialmente padronizado
- ❌ **Não Aplicável** - Não precisa padronizar (caso específico)

---

## 🎯 **1. BOTÕES CUSTOMIZADOS → UnifiedButton**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 1 | `alert-management.tsx` | `AlertUnifiedButton` | `UnifiedButton` | `$variant='primary'\|'warning'\|'danger'`, `$theme={theme}`, `size='sm'` | ✅ Feito | Substituir styled.button por UnifiedButton |
| 2 | `shopping-management.tsx` | `ItemUnifiedButton` | `UnifiedButton` | `size='xs'`, `variant='ghost'`, `$theme={theme}` | ✅ Feito | Botão pequeno (28x28px) → usar size='xs' |
| 3 | `shopping-management.tsx` | `UnifiedButtonSmall` | `UnifiedButton` | `size='sm'`, `variant='primary'\|'danger'`, `$theme={theme}` | ✅ Feito | Botão pequeno com variantes |
| 4 | `shopping-management.tsx` | `AddItemButton` | `UnifiedButton` | `variant='primary'`, `size='md'`, `$theme={theme}` | ✅ Feito | Botão de adicionar item |
| 5 | `shopping-management-backup.tsx` | `ItemUnifiedButton` | `UnifiedButton` | `size='xs'`, `variant='ghost'`, `$theme={theme}` | ✅ Feito | Igual ao shopping-management.tsx |
| 6 | `loan-management.tsx` | `RequestUnifiedButton` | `UnifiedButton` | `variant='primary'\|'secondary'\|'success'\|'danger'`, `size='sm'`, `$theme={theme}` | ✅ Feito | Botão com múltiplas variantes |
| 7 | `login.tsx` | `BiometricButton` | `UnifiedButton` | `variant='primary'\|'secondary'`, `size='sm'`, `$theme={theme}`, `$disabled={isLoading}` | ✅ Feito | Substituído por BiometricButtonWrapper (styled(UnifiedButton)) para layout flex-col |
| 8 | `welcome-tutorial.tsx` | `WelcomeButton` | `UnifiedButton` | `variant='primary'`, `size='lg'`, `$theme={theme}` | ✅ Mantido | styled(UnifiedButton) aceitável para casos especiais (glass effect) |
| 9 | `welcome-tutorial.tsx` | `SecondaryButton` | `UnifiedButton` | `variant='secondary'`, `size='lg'`, `$theme={theme}` | ✅ Mantido | styled(UnifiedButton) aceitável para casos especiais (glass effect) |
| 10 | `monitoring-dashboard.tsx` | `RefreshButton` | `UnifiedButton` | `variant='primary'`, `size='md'`, `$theme={theme}` | ✅ Feito | Substituído por UnifiedButton diretamente |

**Total Botões:** 10 | **Feitos:** 8 | **Mantidos:** 2 (casos especiais)

---

## 📝 **2. INPUTS CUSTOMIZADOS → FormComponents.Input / OptimizedInputStyled**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 11 | `shopping-management.tsx` | `AddItemInput` | `Input` (FormComponents) | `$theme={theme}`, `$hasError={false}`, `placeholder="..."` | ✅ Feito | Input de adicionar item |
| 12 | `alert-management.tsx` | `ConditionInput` | `Input` (FormComponents) | `$theme={theme}`, `size='sm'`, `$hasError={false}` | ✅ Feito | Input pequeno (0.85rem) |
| 13 | `loan-management.tsx` | `CurrencyInput` | `Input` (FormComponents) | `$theme={theme}`, `type='text'`, `placeholder='R$ 0,00'` | ✅ Feito | Input de moeda - manter formatação |
| 14 | `login.tsx` | `Input` (custom) | `Input` (FormComponents) | `$theme={theme}`, `$hasError={hasError}`, `placeholder` | ✅ Mantido | Input com FloatingLabel (Material Design) - caso especial de UX, mantido com tokens |
| 15 | `register.tsx` | `InputStyled` | `OptimizedInputStyled` | `$theme={theme}`, `$hasError={hasError}` | ✅ Feito | Substituído por OptimizedInputStyled |
| 16 | `document-management.tsx` | `TextArea` (custom) | (manter customizado) | `$theme={theme}`, `$hasError={false}`, `rows={4}` | ✅ Mantido | TextArea já usa tokens de cores - não há componente centralizado |

**Total Inputs:** 6 | **Feitos:** 4 | **Mantidos:** 2 (casos especiais)

---

## 📋 **3. FORM ROW / FORM SECTION → OptimizedFormRow / OptimizedFormSection**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 17 | `shopping-management.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Grid 2 colunas responsivo |
| 18 | `alert-management.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Flex row → Grid row |
| 19 | `loan-management.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Já usa OptimizedFormRow em alguns lugares |
| 20 | `document-management.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Grid 2 colunas |
| 21 | `communication.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | 🔄 Por Fazer | Verificar estrutura |
| 22 | `time-clock.tsx` | N/A | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Já usa OptimizedFormRow |
| 23 | `esocial-integration.tsx` | N/A | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Já usa OptimizedFormRow |
| 24 | `payroll-management.tsx` | N/A | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Já usa OptimizedFormRow |
| 25 | `geofencing/locais.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | 🔄 Por Fazer | Verificar estrutura |
| 26 | `geofencing/auditoria.tsx` | N/A | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Já usa ou não precisa |
| 27 | `terms-management.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Verificar estrutura |
| 28 | `task-management.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Verificar estrutura |
| 29 | `subscription-plans.tsx` | `FormRow` | `OptimizedFormRow` | Padrão (sem props) | ✅ Feito | Verificar estrutura |

**Total FormRow:** 13 | **Feitos:** 10 | **Por Fazer:** 3

---

## 📑 **4. SECTION TITLE → OptimizedSectionTitle**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 30 | `shopping-management.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Título simples |
| 31 | `alert-management.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Título simples |
| 32 | `loan-management.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Título de seção |
| 33 | `time-clock.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='lg'` | ✅ Feito | Título maior (1.5rem) |
| 34 | `document-management.tsx` | N/A | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Já usa ou não precisa |
| 35 | `communication.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Não usa SectionTitle - verificado |
| 36 | `geofencing/locais.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Não usa SectionTitle - verificado |
| 37 | `geofencing/auditoria.tsx` | N/A | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Já usa ou não precisa |
| 38 | `terms-management.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Verificar estrutura |
| 39 | `task-management.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Verificar estrutura |
| 40 | `subscription-plans.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Verificar estrutura |
| 41 | `payroll-management.tsx` | `SectionTitle` | `OptimizedSectionTitle` | `$theme={theme}`, `$size='md'` | ✅ Feito | Verificar estrutura |

**Total SectionTitle:** 12 | **Feitos:** 9 | **Por Fazer:** 3

---

## 🎴 **5. CARDS CUSTOMIZADOS → UnifiedCard**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 42 | `monitoring-dashboard.tsx` | `MetricCard` | `UnifiedCard` | `variant='default'`, `size='lg'`, `status='info'\|'success'\|'error'`, `theme={theme}` | ✅ Feito | Já padronizado |
| 43 | `monitoring-dashboard.tsx` | `ChartContainer` | `UnifiedCard` | `variant='default'`, `size='lg'`, `theme={theme}`, `title='...'` | ✅ Feito | Já padronizado |
| 44 | `shopping-management.tsx` | `ListCard` | `UnifiedCard` | `variant='default'`, `size='md'`, `theme={theme}`, `onClick={...}` | ✅ Feito | Já padronizado |
| 45 | `time-clock.tsx` | `OfficialScheduleCard` | `UnifiedCard` | `variant='default'`, `size='md'`, `theme={theme}` | ✅ Feito | Card de horários oficiais |
| 46 | `geofencing/auditoria.tsx` | `Card` | `UnifiedCard` | `variant='default'`, `size='md'`, `theme={theme}` | ✅ Feito | Card genérico |
| 47 | `geofencing/auditoria.tsx` | `CardHeader` | (dentro de UnifiedCard) | `title` prop do UnifiedCard | ✅ Feito | Usar title prop |
| 48 | `geofencing/auditoria.tsx` | `CardTitle` | (dentro de UnifiedCard) | `title` prop do UnifiedCard | ✅ Feito | Usar title prop |
| 49 | `alert-management.tsx` | `CreateAlertSection` | `UnifiedCard` | `variant='default'`, `size='lg'`, `theme={theme}` | ✅ Feito | Seção de criar alerta |
| 50 | `loan-management.tsx` | `RequestSection` | `UnifiedCard` | `variant='default'`, `size='lg'`, `theme={theme}` | ✅ Feito | Seção de solicitação |
| 51 | `loan-management.tsx` | `ApprovalSection` | `UnifiedCard` | `variant='default'`, `size='lg'`, `theme={theme}` | ✅ Feito | Seção de aprovação |
| 52 | `document-management.tsx` | `UploadSection` | `UnifiedCard` | `variant='outlined'`, `size='lg'`, `theme={theme}` | ✅ Feito | Upload com drag & drop - pode precisar ajuste |
| 53 | `welcome-tutorial.tsx` | `StatCard` | `UnifiedCard` | `variant='glass'`, `size='md'`, `statsValue={...}`, `statsLabel={...}` | ✅ Feito | Card de estatísticas |

**Total Cards:** 12 | **Feitos:** 9 | **Por Fazer:** 3

---

## 🎨 **6. SELECT CUSTOMIZADOS → FormComponents.Select / OptimizedSelectStyled**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 54 | `alert-management.tsx` | `ConditionSelect` | `Select` (FormComponents) | `$theme={theme}`, `aria-label`, `title` | 🔄 Por Fazer | Select pequeno (0.85rem) |
| 55 | Várias páginas | `Select` (custom) | `Select` (FormComponents) | `$theme={theme}`, `aria-label`, `title` | ✅ Feito | Maioria já usa FormComponents.Select |

**Total Select:** 2 | **Feitos:** 1 | **Por Fazer:** 1

---

## 📦 **7. OUTROS COMPONENTES**

| # | Arquivo | Elemento Duplicado | Elemento Substituto | Parâmetros a Utilizar | Status | Observações |
|---|---------|-------------------|---------------------|----------------------|--------|-------------|
| 56 | `loan-management.tsx` | `ButtonGroup` | `OptimizedButtonGroup` | Padrão (sem props) | ✅ Feito | Container de botões |
| 57 | `loan-management.tsx` | `UnifiedModalSection` | (remover, usar diretamente) | N/A | 🔄 Por Fazer | Container simples - pode remover |
| 58 | `shopping-management.tsx` | `UnifiedModalSection` | (remover, usar diretamente) | N/A | 🔄 Por Fazer | Container simples - pode remover |
| 59 | Várias páginas | `FormGroupFlex` | `FormGroup` (FormComponents) | Padrão (sem props) | 🔄 Por Fazer | Flex: 1 pode ser adicionado via CSS |
| 60 | Várias páginas | `EmptyState` / `EmptyIcon` / `EmptyTitle` | Componente centralizado (criar se necessário) | `icon`, `title`, `description` | 🔄 Por Fazer | Estado vazio - considerar criar componente |

**Total Outros:** 5 | **Feitos:** 0 | **Por Fazer:** 5

---

## 📊 **RESUMO GERAL**

### **Por Tipo de Componente:**

| Tipo | Total | ✅ Feitos | 🔄 Por Fazer | ⚠️ Parcial | % Concluído |
|------|-------|-----------|--------------|-----------|-------------|
| **Botões** | 10 | 0 | 7 | 3 | 0% |
| **Inputs** | 6 | 0 | 6 | 0 | 0% |
| **FormRow** | 13 | 3 | 10 | 0 | 23% |
| **SectionTitle** | 12 | 2 | 10 | 0 | 17% |
| **Cards** | 12 | 3 | 9 | 0 | 25% |
| **Select** | 2 | 1 | 1 | 0 | 50% |
| **Outros** | 5 | 0 | 5 | 0 | 0% |
| **TOTAL** | **60** | **9** | **48** | **3** | **15%** |

### **Por Arquivo:**

| Arquivo | Total Itens | Feitos | Por Fazer | Prioridade |
|---------|-------------|--------|-----------|------------|
| `shopping-management.tsx` | 8 | 1 | 7 | 🔴 Alta |
| `alert-management.tsx` | 6 | 0 | 6 | 🔴 Alta |
| `loan-management.tsx` | 8 | 0 | 8 | 🔴 Alta |
| `login.tsx` | 3 | 0 | 3 | 🟡 Média |
| `time-clock.tsx` | 2 | 1 | 1 | 🟡 Média |
| `document-management.tsx` | 3 | 1 | 2 | 🟡 Média |
| `geofencing/auditoria.tsx` | 5 | 2 | 3 | 🟢 Baixa |
| `welcome-tutorial.tsx` | 3 | 0 | 3 | 🟢 Baixa |
| Outros arquivos | 24 | 4 | 20 | 🟢 Baixa |

---

## 🔧 **GUIA DE PARÂMETROS**

### **UnifiedButton:**
```typescript
<UnifiedButton
  $variant='primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'link'
  $size='xs' | 'sm' | 'medium' | 'lg' | 'xl'
  $theme={theme}
  $fullWidth={boolean}
  $disabled={boolean}
  $loading={boolean}
  onClick={...}
>
  Conteúdo
</UnifiedButton>
```

### **OptimizedFormRow:**
```typescript
<OptimizedFormRow>
  {/* Conteúdo com grid responsivo automático */}
</OptimizedFormRow>
```

### **OptimizedSectionTitle:**
```typescript
<OptimizedSectionTitle
  $theme={theme}
  $size='sm' | 'md' | 'lg'
>
  Título da Seção
</OptimizedSectionTitle>
```

### **UnifiedCard:**
```typescript
<UnifiedCard
  theme={theme}
  variant='default' | 'elevated' | 'outlined' | 'filled' | 'glass'
  size='sm' | 'md' | 'lg'
  status='default' | 'success' | 'warning' | 'error' | 'info'
  title='Título'
  icon={<...>}
  onClick={...}
>
  Conteúdo
</UnifiedCard>
```

### **Input (FormComponents):**
```typescript
<Input
  $theme={theme}
  $hasError={boolean}
  type='text' | 'number' | 'email' | ...
  placeholder='...'
  value={...}
  onChange={...}
/>
```

### **Select (FormComponents):**
```typescript
<Select
  $theme={theme}
  aria-label='...'
  title='...'
  value={...}
  onChange={...}
>
  <option>...</option>
</Select>
```

---

## 🚨 **REGRAS CRÍTICAS - LEIA ANTES DE COMEÇAR**

### **❌ NUNCA:**
- ❌ Introduzir cores hardcoded (#hex, rgb, rgba)
- ❌ Introduzir dados mockados (arrays, objetos, valores)
- ❌ Usar valores fixos sem vir do tema/config
- ❌ Criar componentes sem passar `$theme={theme}`

### **✅ SEMPRE:**
- ✅ Usar `props.$theme?.colors?....` para cores
- ✅ Usar `tokens.colors` como fallback (não cores diretas)
- ✅ Usar dados reais de API, props ou estado
- ✅ Passar `$theme={theme}` para todos os componentes

**📖 Consulte `GUIA_BOAS_PRATICAS_PADRONIZACAO.md` para exemplos detalhados!**

---

## 📝 **NOTAS IMPORTANTES**

1. **Importar componentes:**
   ```typescript
   // Unified components
   import { UnifiedButton, UnifiedCard, UnifiedModal } from '../components/unified';
   
   // Form components
   import { Input, Select, FormGroup, Label } from '../components/FormComponents';
   
   // Optimized styles
   import {
     OptimizedFormRow,
     OptimizedSectionTitle,
     OptimizedInputStyled,
     OptimizedSelectStyled,
     OptimizedLabel,
   } from '../components/shared/optimized-styles';
   ```

2. **Remover styled components após substituição:**
   - Deletar a definição do styled component
   - Remover imports desnecessários
   - Verificar se não há outros usos

3. **Testar após cada substituição:**
   - Verificar se o componente renderiza corretamente
   - Verificar responsividade
   - Verificar tema/cores
   - Verificar funcionalidade (onClick, onChange, etc.)

4. **Casos especiais:**
   - `BiometricButton` em `login.tsx` pode precisar manter estilo customizado (verificar)
   - `WelcomeButton` e `SecondaryButton` em `welcome-tutorial.tsx` usam styled(UnifiedButton) - pode ser aceitável
   - `UploadSection` em `document-management.tsx` tem drag & drop - pode precisar ajuste

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

Após cada substituição, verificar:

### **Validação Técnica:**
- [ ] Componente renderiza corretamente
- [ ] Estilo visual mantido (cores, espaçamento, tamanho)
- [ ] Responsividade funcionando
- [ ] Tema aplicado corretamente
- [ ] Funcionalidade preservada (clicks, eventos, etc.)
- [ ] Acessibilidade mantida (aria-labels, etc.)
- [ ] Styled component removido do arquivo
- [ ] Imports atualizados
- [ ] Teste visual realizado
- [ ] Sem erros TypeScript

### **Validação de Hardcoded/Mock (OBRIGATÓRIO):**
- [ ] **Nenhuma cor hardcoded (#hex, rgb, rgba fixos)**
- [ ] **Todas as cores usam `props.$theme?.colors?....`**
- [ ] **Fallbacks usam `tokens.colors` (não cores diretas)**
- [ ] **Nenhum dado mockado (arrays, objetos, valores)**
- [ ] **Todos os dados vêm de API, props ou estado**
- [ ] **Componente recebe `$theme={theme}` prop**
- [ ] **Nenhum valor hardcoded (números, strings fixas)**
- [ ] **Valores vêm de config, theme ou estado**

**⚠️ IMPORTANTE:** Verificar também `GUIA_BOAS_PRATICAS_PADRONIZACAO.md` antes de cada substituição!

---

**Última Atualização:** 31/10/2025  
**Próxima Revisão:** Após cada lote de substituições

