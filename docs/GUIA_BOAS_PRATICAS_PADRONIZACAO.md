# ⚠️ GUIA DE BOAS PRÁTICAS - PADRONIZAÇÃO DE COMPONENTES

**Data:** 31/10/2025  
**Regra Fundamental:** ❌ **NUNCA introduzir hardcoded ou dados mockados**

---

## 🚨 **REGRAS OBRIGATÓRIAS**

### **1. CORES - SEMPRE USAR TEMA**

#### ❌ **NUNCA FAZER:**
```typescript
// ❌ CORES HARDCODED
color: '#2c3e50';
background: '#f8f9fa';
border: '1px solid #e0e0e0';
```

#### ✅ **SEMPRE FAZER:**
```typescript
// ✅ USAR TEMA
color: ${props => props.$theme?.colors?.text?.primary || tokens.colors.text.primary};
background: ${props => props.$theme?.colors?.surface?.primary || tokens.colors.surface.primary};
border: 1px solid ${props => props.$theme?.colors?.border?.primary || tokens.colors.border.primary};
```

### **2. DADOS - SEMPRE REAIS (NUNCA MOCK)**

#### ❌ **NUNCA FAZER:**
```typescript
// ❌ DADOS MOCKADOS
const mockData = [
  { id: '1', name: 'Teste' },
  { id: '2', name: 'Exemplo' }
];

// ❌ VALORES HARDCODED
const defaultValue = '123456';
const testUser = 'usuario@teste.com';
```

#### ✅ **SEMPRE FAZER:**
```typescript
// ✅ DADOS REAIS (via API ou props)
const [data, setData] = useState([]);
useEffect(() => {
  fetch('/api/data').then(res => res.json()).then(setData);
}, []);

// ✅ VALORES DO TEMA/CONFIG
const defaultValue = theme?.defaultValue || config?.defaultValue;
```

### **3. COMPONENTES - SEMPRE USAR TEMA PROP**

#### ❌ **NUNCA FAZER:**
```typescript
// ❌ SEM TEMA
<UnifiedButton onClick={handleClick}>
  Salvar
</UnifiedButton>

// ❌ CORES HARDCODED NO COMPONENTE
const CustomButton = styled.button`
  background: #29ABE2;
  color: white;
`;
```

#### ✅ **SEMPRE FAZER:**
```typescript
// ✅ COM TEMA
<UnifiedButton 
  $theme={theme}
  $variant='primary'
  onClick={handleClick}
>
  Salvar
</UnifiedButton>

// ✅ CORES DO TEMA
const CustomButton = styled.button<{ $theme: any }>`
  background: ${props => props.$theme?.colors?.primary || tokens.colors.primary};
  color: ${props => props.$theme?.colors?.text?.onPrimary || 'white'};
`;
```

---

## 📋 **CHECKLIST ANTES DE SUBSTITUIR**

Antes de cada substituição, verificar:

- [ ] **Tema está sendo passado?**
  - Verificar se `theme` está disponível na página
  - Verificar se está sendo passado para o componente

- [ ] **Cores vêm do tema?**
  - Nenhuma cor hardcoded (#hex, rgb, rgba)
  - Todas as cores usam `props.$theme?.colors?....`
  - Fallbacks usam `tokens.colors` (não cores hardcoded)

- [ ] **Sem dados mockados?**
  - Nenhum array/objeto mockado
  - Nenhum valor de teste hardcoded
  - Dados vêm de API, props ou estado

- [ ] **Imports corretos?**
  - `import { UnifiedButton } from '../components/unified';`
  - `import { tokens } from '../components/shared/tokens';`
  - `import { getColor } from '../components/shared/tokens';`

---

## 🔍 **EXEMPLOS DE SUBSTITUIÇÃO CORRETA**

### **Exemplo 1: Substituir Botão Customizado**

#### ❌ **ANTES (Com hardcoded):**
```typescript
const AlertUnifiedButton = styled.button<{
  $theme: any;
  $variant?: 'primary' | 'warning' | 'danger';
}>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props => {
    switch (props.$variant) {
      case 'warning':
        return '#f39c12';  // ❌ HARDCODED
      case 'danger':
        return '#e74c3c';  // ❌ HARDCODED
      default:
        return props.$theme?.colors?.primary || '#29ABE2';  // ❌ HARDCODED FALLBACK
    }
  }};
  color: white;  // ❌ HARDCODED
`;
```

#### ✅ **DEPOIS (Com tema):**
```typescript
// Remover styled component completamente
// Usar UnifiedButton diretamente

<UnifiedButton
  $theme={theme}
  $variant={variant === 'warning' ? 'warning' : variant === 'danger' ? 'danger' : 'primary'}
  $size='sm'
  onClick={onClick}
>
  {children}
</UnifiedButton>
```

### **Exemplo 2: Substituir FormRow**

#### ❌ **ANTES (Com cores hardcoded):**
```typescript
const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
  background: #f8f9fa;  // ❌ HARDCODED
  padding: 1rem;
  border: 1px solid #e0e0e0;  // ❌ HARDCODED
`;
```

#### ✅ **DEPOIS (Com tema):**
```typescript
// Remover styled component
// Usar OptimizedFormRow

<OptimizedFormRow>
  {/* Conteúdo */}
</OptimizedFormRow>

// OptimizedFormRow já usa tokens e tema internamente
```

### **Exemplo 3: Substituir Input Customizado**

#### ❌ **ANTES (Com cores hardcoded):**
```typescript
const AddItemInput = styled.input<{ $theme: any }>`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid ${props => props.$theme?.colors?.border || '#e0e0e0'};  // ⚠️ FALLBACK HARDCODED
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);  // ❌ HARDCODED
  color: #2c3e50;  // ❌ HARDCODED

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};  // ❌ HARDCODED FALLBACK
    box-shadow: 0 0 0 3px ${props => (props.$theme?.colors?.primary || '#29ABE2') + '20'};  // ❌ HARDCODED
  }
`;
```

#### ✅ **DEPOIS (Com tema e tokens):**
```typescript
// Remover styled component
// Usar Input de FormComponents ou OptimizedInputStyled

<Input
  $theme={theme}
  $hasError={false}
  type='text'
  placeholder='Adicionar item...'
  value={value}
  onChange={onChange}
/>

// Ou se precisar de mais controle:
import { OptimizedInputStyled } from '../components/shared/optimized-styles';

<OptimizedInputStyled
  $theme={theme}
  $hasError={false}
  $size='md'
  type='text'
  placeholder='Adicionar item...'
  value={value}
  onChange={onChange}
/>
```

### **Exemplo 4: Substituir SectionTitle**

#### ❌ **ANTES (Com cores hardcoded):**
```typescript
const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;  // ❌ HARDCODED
  font-size: 1.1rem;
  font-weight: 600;
`;
```

#### ✅ **DEPOIS (Com tema):**
```typescript
// Remover styled component
// Usar OptimizedSectionTitle

<OptimizedSectionTitle
  $theme={theme}
  $size='md'
>
  Título da Seção
</OptimizedSectionTitle>
```

---

## 🎨 **CORES PERMITIDAS (APENAS COMO FALLBACK)**

### **Tokens (Aceitável como fallback):**
```typescript
import { tokens } from '../components/shared/tokens';

// ✅ ACEITÁVEL - tokens como fallback
color: ${props => props.$theme?.colors?.text?.primary || tokens.colors.text.primary};
```

### **Cores Hardcoded (NUNCA):**
```typescript
// ❌ NUNCA - cores hardcoded
color: '#2c3e50';
color: '#29ABE2';
background: 'rgba(255, 255, 255, 0.9)';
```

---

## 📊 **VALIDAÇÃO DE CORES**

### **Verificar antes de commitar:**

```typescript
// ✅ CORRETO - usa tema
${props => props.$theme?.colors?.primary || tokens.colors.primary}

// ✅ CORRETO - usa getColor helper
${props => getColor('text.primary', props.$theme?.colors?.text)}

// ❌ ERRADO - cor hardcoded
color: '#2c3e50';

// ❌ ERRADO - fallback hardcoded
color: ${props => props.$theme?.colors?.text || '#2c3e50'};
```

---

## 🔧 **FUNÇÕES HELPER PARA USAR**

### **1. getColor (tokens.ts):**
```typescript
import { getColor } from '../components/shared/tokens';

// ✅ Usar getColor para cores
color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
background: ${props => getColor('surface.primary', props.$theme?.colors?.surface)};
```

### **2. getSpacing (tokens.ts):**
```typescript
import { getSpacing } from '../components/shared/tokens';

// ✅ Usar getSpacing para espaçamento
padding: ${getSpacing('md')};
margin: ${getSpacing('lg')};
gap: ${getSpacing('sm')};
```

### **3. createThemedStyles (design-system):**
```typescript
import { createThemedStyles } from '../../design-system';

// ✅ Usar createThemedStyles para estilos completos
${props => {
  const themedStyles = createThemedStyles(props.$theme);
  return themedStyles;
}}
```

---

## ⚠️ **CASOS ESPECIAIS**

### **1. Cores de Status (Success, Warning, Error, Info)**

**✅ CORRETO:**
```typescript
// UnifiedCard já gerencia status colors via theme
<UnifiedCard
  theme={theme}
  status='success'  // ✅ Usa theme.colors.success
>
  Conteúdo
</UnifiedCard>

// UnifiedButton já gerencia variant colors via theme
<UnifiedButton
  $theme={theme}
  $variant='danger'  // ✅ Usa theme.colors.error
>
  Excluir
</UnifiedButton>
```

### **2. Cores de Background Transparente**

**✅ ACEITÁVEL (apenas para transparência):**
```typescript
// ✅ Aceitável - transparência não é cor hardcoded
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);

// ✅ Melhor ainda - usar do tema
background: ${props => props.$theme?.colors?.surface?.primary || 'rgba(255, 255, 255, 0.95)'};
```

### **3. Cores de Texto em Botões**

**✅ CORRETO:**
```typescript
// ✅ UnifiedButton gerencia automaticamente
<UnifiedButton $theme={theme} $variant='primary'>
  Texto branco automático
</UnifiedButton>
```

---

## 📝 **CHECKLIST DE VALIDAÇÃO FINAL**

Após cada substituição, verificar:

- [ ] **Nenhuma cor hardcoded (#hex, rgb, rgba com valores fixos)**
- [ ] **Todas as cores usam `props.$theme?.colors?....`**
- [ ] **Fallbacks usam `tokens.colors` (não cores diretas)**
- [ ] **Nenhum dado mockado (arrays, objetos, valores)**
- [ ] **Todos os dados vêm de API, props ou estado**
- [ ] **Componente recebe `$theme={theme}` prop**
- [ ] **Imports corretos dos componentes centralizados**
- [ ] **Styled components removidos após substituição**
- [ ] **Teste visual - cores do tema aplicadas corretamente**
- [ ] **Teste funcional - funcionalidade preservada**

---

## 🚫 **PADRÕES PROIBIDOS**

### **❌ NUNCA FAZER:**

```typescript
// ❌ Cores hardcoded
color: '#2c3e50';
background: '#f8f9fa';
border: '1px solid #e0e0e0';

// ❌ Fallbacks hardcoded
color: ${props => props.$theme?.colors?.text || '#2c3e50'};

// ❌ Dados mockados
const tasks = [{ id: '1', name: 'Teste' }];
const defaultUser = { name: 'João', email: 'joao@teste.com' };

// ❌ Valores hardcoded
const maxItems = 10;
const defaultPrice = 100.00;

// ❌ Componente sem tema
<UnifiedButton onClick={...}>Salvar</UnifiedButton>
```

---

## ✅ **PADRÕES OBRIGATÓRIOS**

### **✅ SEMPRE FAZER:**

```typescript
// ✅ Cores do tema
color: ${props => props.$theme?.colors?.text?.primary || tokens.colors.text.primary};
background: ${props => props.$theme?.colors?.surface?.primary || tokens.colors.surface.primary};

// ✅ Fallbacks com tokens
color: ${props => props.$theme?.colors?.text || tokens.colors.text.primary};

// ✅ Dados reais
const [tasks, setTasks] = useState([]);
useEffect(() => {
  fetch('/api/tasks').then(res => res.json()).then(setTasks);
}, []);

// ✅ Valores do config/tema
const maxItems = config?.maxItems || theme?.settings?.maxItems || 10;

// ✅ Componente com tema
<UnifiedButton $theme={theme} $variant='primary' onClick={...}>
  Salvar
</UnifiedButton>
```

---

## 📚 **REFERÊNCIAS**

### **Componentes Centralizados:**
- `UnifiedButton` - `src/components/unified/`
- `UnifiedCard` - `src/components/unified/`
- `UnifiedModal` - `src/components/unified/`
- `FormComponents` - `src/components/FormComponents/`
- `OptimizedStyles` - `src/components/shared/optimized-styles.ts`

### **Helpers e Tokens:**
- `tokens` - `src/components/shared/tokens.ts`
- `getColor` - `src/components/shared/tokens.ts`
- `getSpacing` - `src/components/shared/tokens.ts`
- `createThemedStyles` - `src/design-system/`

### **Documentação:**
- `CHECKLIST_PADRONIZACAO_COMPONENTES.md` - Checklist completo
- `RELATORIO_CENTRALIZACAO_COMPONENTES.md` - Análise de duplicação

---

**⚠️ LEMBRE-SE: Se não tiver certeza, use os componentes centralizados. Eles já estão configurados para usar tema corretamente!**

