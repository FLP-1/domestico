# 🔧 PLANO DE CORREÇÃO: CORES HARDCODED E DADOS MOCKADOS

**Data:** 2025-01-27  
**Status:** 📋 PLANO DE AÇÃO  
**Prioridade:** 🔴 CRÍTICA

---

## 📊 RESUMO EXECUTIVO

### **PROBLEMAS IDENTIFICADOS**

| Tipo | Quantidade | Arquivos Afetados | Prioridade |
|------|-----------|-------------------|------------|
| **Cores Hexadecimais** | ~982 ocorrências | 78 arquivos | 🔴 CRÍTICA |
| **Cores RGBA/RGB** | ~71 ocorrências | 71 arquivos | 🔴 CRÍTICA |
| **Cores Textuais** | ~212 ocorrências | 56 arquivos | 🟡 MÉDIA |
| **Dados Mockados** | ~30 arquivos | 30 arquivos | 🔴 CRÍTICA |
| **Fallbacks Hardcoded** | ~100+ ocorrências | Múltiplos | 🟡 MÉDIA |

**TOTAL ESTIMADO:** ~1.400+ problemas identificados

---

## 🎯 OBJETIVOS DO PLANO

1. ✅ **Eliminar TODAS as cores hardcoded** do código de produção
2. ✅ **Substituir dados mockados** por chamadas reais às APIs
3. ✅ **Padronizar uso do sistema de tema** em todos os componentes
4. ✅ **Criar sistema de fallback hierárquico** sem cores hardcoded
5. ✅ **Garantir consistência visual** em todo o sistema

---

## 📋 FASE 1: ANÁLISE E CATEGORIZAÇÃO

### **1.1 CORES HARDCODED - CATEGORIZAÇÃO**

#### **🔴 PRIORIDADE CRÍTICA - Componentes Principais**

| Arquivo | Tipo | Quantidade | Problema Específico |
|---------|------|------------|---------------------|
| `GeofencingModal.tsx` | Hex + Fallbacks | 42 | Fallbacks hardcoded em `defaultColors` |
| `UnifiedCard/index.tsx` | Hex + RGBA | 32 | Cores de status hardcoded |
| `shared/styles.ts` | Hex + Fallbacks | 68 | Fallbacks em todos os componentes |
| `UnifiedButton/index.tsx` | Hex | 15 | Cores de variantes hardcoded |
| `TimeRecordCard/index.tsx` | Hex | 14 | Cores de status hardcoded |
| `Sidebar/index.tsx` | Hex | 14 | Cores de navegação hardcoded |
| `ProfileSelectionModal.tsx` | Hex | 14 | Cores de seleção hardcoded |
| `TermsAcceptanceModal.tsx` | Hex | 29 | Cores de texto e fundo hardcoded |
| `EmployerModal.tsx` | Hex | 21 | Cores de formulário hardcoded |
| `PayrollModalNew.tsx` | Hex | 15 | Cores de tabela hardcoded |

**TOTAL CRÍTICO:** ~264 ocorrências em componentes principais

#### **🟡 PRIORIDADE MÉDIA - Páginas**

| Arquivo | Tipo | Quantidade | Problema Específico |
|---------|------|------------|---------------------|
| `esocial-integration.tsx` | Hex | 50 | Cores de status e cards |
| `diagnostico-geolocalizacao.tsx` | Hex | 29 | Cores de mapas e indicadores |
| `monitoring-dashboard.tsx` | Hex | 27 | Cores de métricas e gráficos |
| `task-management.tsx` | Hex | 26 | Cores de tarefas e status |
| `terms-management.tsx` | Hex | 25 | Cores de documentos |
| `admin/antifraude.tsx` | Hex | 22 | Cores de alertas e indicadores |
| `time-clock.tsx` | Hex | 16 | Cores de botões e cards |
| `welcome-tutorial.tsx` | Hex | 17 | Cores de tutorial |

**TOTAL MÉDIO:** ~212 ocorrências em páginas

#### **🟢 PRIORIDADE BAIXA - Utilitários e Configurações**

| Arquivo | Tipo | Quantidade | Observação |
|---------|------|------------|------------|
| `config/default-colors.ts` | Hex | Múltiplos | ✅ **LEGÍTIMO** - Arquivo de configuração |
| `design-system/tokens/colors.ts` | Hex | Múltiplos | ✅ **LEGÍTIMO** - Tokens do design system |
| `design-system/tokens/geofencing-colors.ts` | Hex | Múltiplos | ✅ **LEGÍTIMO** - Tokens específicos |
| `hooks/useTheme.ts` | Hex | Múltiplos | ✅ **LEGÍTIMO** - Temas predefinidos |

**OBSERVAÇÃO:** Arquivos de tokens e configuração são **legítimos** e devem manter cores hardcoded como valores padrão.

---

### **1.2 DADOS MOCKADOS - CATEGORIZAÇÃO**

#### **🔴 PRIORIDADE CRÍTICA - Dados de Produção**

| Arquivo | Tipo | Problema | Solução |
|---------|------|----------|---------|
| `data/centralized.ts` | Constantes MOCK_* | Dados mockados marcados como DEPRECATED | ✅ Já tem funções async, remover constantes |
| `esocial-domestico-completo.tsx` | Arrays hardcoded | Folha de pagamento e guias simulados | Buscar da API `/api/payroll` e `/api/tax-guides` |
| `monitoring-dashboard.tsx` | Math.random() | Métricas simuladas | ✅ Já usa API `/api/monitoring/metrics` |
| `esocial-integration.tsx` | Objetos hardcoded | Dados de empregador simulados | Buscar da API `/api/employers` |
| `payroll-management.tsx` | Arrays hardcoded | Funcionários e documentos mockados | Buscar da API `/api/employees` e `/api/documents` |
| `communication.tsx` | Arrays hardcoded | Contatos e mensagens mockados | Buscar da API `/api/communications` |

#### **🟡 PRIORIDADE MÉDIA - Dados de Teste**

| Arquivo | Tipo | Problema | Solução |
|---------|------|----------|---------|
| Arquivos `__tests__/` | Dados mock | ✅ **LEGÍTIMO** - Dados de teste | Manter para testes |
| `test-*.tsx` | Dados simulados | ✅ **LEGÍTIMO** - Páginas de teste | Manter para desenvolvimento |

---

## 🔧 FASE 2: ESTRATÉGIA DE CORREÇÃO

### **2.1 CORREÇÃO DE CORES HARDCODED**

#### **ESTRATÉGIA 1: Substituição Direta por Tema**

**Quando usar:** Componentes que já recebem `$theme` como prop

**Padrão ANTES:**
```tsx
border-bottom: 1px solid #e5e7eb;
color: #111827;
background: #ffffff;
```

**Padrão DEPOIS:**
```tsx
border-bottom: 1px solid ${props => 
  props.$theme?.colors?.border?.light || 
  props.$theme?.border?.light || 
  'transparent' // Apenas transparent como fallback absoluto
};
color: ${props => 
  props.$theme?.colors?.text?.dark || 
  props.$theme?.text?.dark || 
  'inherit' // Apenas inherit como fallback absoluto
};
background: ${props => 
  props.$theme?.colors?.background?.primary || 
  props.$theme?.background?.primary || 
  'transparent'
};
```

**⚠️ REGRA CRÍTICA:** 
- **NUNCA** usar cores hexadecimais como fallback
- **NUNCA** usar cores textuais (`white`, `black`) como fallback
- **APENAS** usar `transparent`, `inherit`, `currentColor` como fallbacks absolutos
- **SEMPRE** usar optional chaining (`?.`) para acesso seguro

#### **ESTRATÉGIA 2: Sistema de Fallback Hierárquico**

**Quando usar:** Componentes que precisam de múltiplos níveis de fallback

**Padrão:**
```tsx
const getColor = (props: any, path: string[], fallback: 'transparent' | 'inherit' | 'currentColor' = 'transparent') => {
  // Tentar caminho completo primeiro
  let value = props.$theme;
  for (const key of path) {
    value = value?.[key];
    if (!value) break;
  }
  
  if (value) return value;
  
  // Tentar caminho alternativo (sem colors)
  value = props.$theme;
  const altPath = path.filter(k => k !== 'colors');
  for (const key of altPath) {
    value = value?.[key];
    if (!value) break;
  }
  
  return value || fallback;
};

// Uso:
border-bottom: 1px solid ${props => getColor(props, ['colors', 'border', 'light'], 'transparent')};
```

#### **ESTRATÉGIA 3: Hook de Tema Seguro**

**Criar hook:** `src/hooks/useSafeTheme.ts`

```tsx
import { useTheme } from './useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

export const useSafeTheme = () => {
  const { currentProfile } = useUserProfile();
  const { colors } = useTheme(currentProfile?.role?.toLowerCase() || 'empregado');
  
  // Garantir estrutura completa
  const safeTheme = {
    colors: {
      ...colors,
      border: {
        light: colors?.border?.light || colors?.border || 'transparent',
        primary: colors?.border?.primary || colors?.border || 'transparent',
      },
      text: {
        dark: colors?.text?.dark || colors?.text || 'inherit',
        secondary: colors?.text?.secondary || colors?.textSecondary || 'inherit',
        primary: colors?.text?.primary || colors?.text || 'inherit',
      },
      background: {
        primary: colors?.background?.primary || colors?.background || 'transparent',
        secondary: colors?.background?.secondary || colors?.surface || 'transparent',
      },
      status: {
        warning: {
          background: colors?.status?.warning?.background || 'transparent',
          border: colors?.status?.warning?.border || 'transparent',
          text: colors?.status?.warning?.text || 'inherit',
        },
        success: {
          background: colors?.status?.success?.background || 'transparent',
          border: colors?.status?.success?.border || 'transparent',
          text: colors?.status?.success?.text || 'inherit',
        },
        error: {
          background: colors?.status?.error?.background || 'transparent',
          border: colors?.status?.error?.border || 'transparent',
          text: colors?.status?.error?.text || 'inherit',
        },
      },
    },
  };
  
  return { theme: safeTheme, colors: safeTheme.colors };
};
```

---

### **2.2 CORREÇÃO DE DADOS MOCKADOS**

#### **ESTRATÉGIA 1: Remover Constantes MOCK_***

**Arquivo:** `src/data/centralized.ts`

**Ação:**
1. ✅ Verificar se todas as funções async (`loadTermos`, `loadPoliticas`, etc.) estão funcionando
2. ✅ Buscar por imports de `MOCK_*` em todo o código
3. ✅ Substituir imports por chamadas às funções async
4. ✅ Remover constantes `MOCK_*` após confirmação de que não há mais dependências

**Comando de verificação:**
```bash
grep -r "MOCK_" src/ --exclude-dir=node_modules --exclude-dir=.next
```

#### **ESTRATÉGIA 2: Substituir Arrays Hardcoded por APIs**

**Padrão ANTES:**
```tsx
const [employees, setEmployees] = useState([
  { id: '1', name: 'Maria Santos', ... },
  { id: '2', name: 'Ana Costa', ... },
]);
```

**Padrão DEPOIS:**
```tsx
const [employees, setEmployees] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const result = await response.json();
      if (result.success && result.data) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setIsLoading(false);
    }
  };
  loadEmployees();
}, []);
```

#### **ESTRATÉGIA 3: Remover Math.random() e setTimeout Simulados**

**Padrão ANTES:**
```tsx
setMetrics({
  eventosEnviados: Math.floor(Math.random() * 1000) + 500,
  eventosProcessados: Math.floor(Math.random() * 800) + 400,
});
```

**Padrão DEPOIS:**
```tsx
const loadMetrics = async () => {
  try {
    const response = await fetch('/api/monitoring/metrics');
    const result = await response.json();
    if (result.success && result.data) {
      setMetrics(result.data);
    }
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
  }
};
```

---

## 📅 FASE 3: PLANO DE EXECUÇÃO

### **ETAPA 1: Preparação (1-2 dias)**

- [ ] Criar hook `useSafeTheme` com fallbacks seguros
- [ ] Criar função utilitária `getThemeColor` para acesso seguro
- [ ] Documentar padrões de correção
- [ ] Criar checklist de validação

### **ETAPA 2: Componentes Críticos (3-5 dias)**

**Prioridade:** Componentes mais usados e visíveis

- [ ] `GeofencingModal.tsx` - Remover fallbacks hardcoded
- [ ] `UnifiedCard/index.tsx` - Substituir cores de status
- [ ] `shared/styles.ts` - Corrigir todos os fallbacks
- [ ] `UnifiedButton/index.tsx` - Substituir cores de variantes
- [ ] `TimeRecordCard/index.tsx` - Substituir cores de status
- [ ] `Sidebar/index.tsx` - Substituir cores de navegação
- [ ] `ProfileSelectionModal.tsx` - Substituir cores de seleção
- [ ] `TermsAcceptanceModal.tsx` - Substituir cores de texto
- [ ] `EmployerModal.tsx` - Substituir cores de formulário
- [ ] `PayrollModalNew.tsx` - Substituir cores de tabela

**Validação:** Testar cada componente após correção

### **ETAPA 3: Páginas Principais (5-7 dias)**

**Prioridade:** Páginas mais acessadas

- [ ] `esocial-integration.tsx` - Substituir cores e remover dados simulados
- [ ] `diagnostico-geolocalizacao.tsx` - Substituir cores de mapas
- [ ] `monitoring-dashboard.tsx` - Verificar se já usa APIs (parece que sim)
- [ ] `task-management.tsx` - Substituir cores de tarefas
- [ ] `terms-management.tsx` - Substituir cores de documentos
- [ ] `admin/antifraude.tsx` - Substituir cores de alertas
- [ ] `time-clock.tsx` - Substituir cores de botões
- [ ] `welcome-tutorial.tsx` - Substituir cores de tutorial

**Validação:** Testar fluxos principais de cada página

### **ETAPA 4: Dados Mockados (2-3 dias)**

- [ ] Verificar dependências de `MOCK_*` em `centralized.ts`
- [ ] Remover constantes `MOCK_*` após confirmação
- [ ] Substituir arrays hardcoded em `esocial-domestico-completo.tsx`
- [ ] Substituir arrays hardcoded em `payroll-management.tsx`
- [ ] Substituir arrays hardcoded em `communication.tsx`
- [ ] Verificar e corrigir `esocial-integration.tsx` (dados simulados)

**Validação:** Testar carregamento de dados reais

### **ETAPA 5: Componentes Secundários (3-4 dias)**

**Prioridade:** Componentes menos críticos

- [ ] Todos os modais restantes
- [ ] Componentes de formulário
- [ ] Componentes de lista
- [ ] Componentes de card

**Validação:** Teste visual geral

### **ETAPA 6: Validação Final (1-2 dias)**

- [ ] Executar busca por cores hexadecimais (deve retornar apenas arquivos legítimos)
- [ ] Executar busca por dados mockados (deve retornar apenas testes)
- [ ] Teste visual completo da aplicação
- [ ] Verificar console por erros relacionados a tema
- [ ] Documentar mudanças realizadas

---

## 🎯 CRITÉRIOS DE SUCESSO

### **Cores Hardcoded**

- [ ] ✅ Nenhuma cor hexadecimal em componentes de produção
- [ ] ✅ Nenhuma cor textual (`white`, `black`) em componentes de produção
- [ ] ✅ Todos os fallbacks usam apenas `transparent`, `inherit`, `currentColor`
- [ ] ✅ Todos os componentes usam `useSafeTheme` ou acesso seguro ao tema
- [ ] ✅ Busca por `#[0-9A-Fa-f]{3,6}` retorna apenas arquivos legítimos (tokens, configs)

### **Dados Mockados**

- [ ] ✅ Nenhuma constante `MOCK_*` em uso
- [ ] ✅ Nenhum array hardcoded com dados de produção
- [ ] ✅ Nenhum `Math.random()` para simular dados reais
- [ ] ✅ Todas as páginas carregam dados de APIs reais
- [ ] ✅ Estados de loading implementados corretamente

---

## 📝 CHECKLIST DE VALIDAÇÃO POR ARQUIVO

### **Para Cores Hardcoded:**

```markdown
- [ ] Verificar se componente recebe `$theme` como prop
- [ ] Substituir todas as cores hexadecimais por acesso ao tema
- [ ] Substituir todas as cores textuais por acesso ao tema
- [ ] Remover fallbacks hardcoded (exceto transparent/inherit)
- [ ] Adicionar optional chaining (`?.`) em todos os acessos
- [ ] Testar componente com tema undefined
- [ ] Testar componente com tema completo
- [ ] Verificar visualmente se cores estão corretas
```

### **Para Dados Mockados:**

```markdown
- [ ] Identificar arrays/objetos hardcoded
- [ ] Verificar se API correspondente existe
- [ ] Criar função async para carregar dados
- [ ] Implementar estado de loading
- [ ] Implementar tratamento de erro
- [ ] Substituir dados hardcoded por chamada à API
- [ ] Testar carregamento de dados reais
- [ ] Verificar se dados são exibidos corretamente
```

---

## 🚨 ALERTAS E RESSALVAS

### **⚠️ ARQUIVOS LEGÍTIMOS COM CORES HARDCODED**

**NÃO CORRIGIR** os seguintes arquivos (são legítimos):

- `src/config/default-colors.ts` - Valores padrão do sistema
- `src/design-system/tokens/colors.ts` - Tokens do design system
- `src/design-system/tokens/geofencing-colors.ts` - Tokens específicos
- `src/hooks/useTheme.ts` - Temas predefinidos
- Arquivos em `__tests__/` - Dados de teste
- Arquivos `test-*.tsx` - Páginas de teste

### **⚠️ FALLBACKS ABSOLUTOS PERMITIDOS**

**APENAS** estes valores são permitidos como fallback absoluto:

- `transparent` - Para backgrounds e bordas
- `inherit` - Para cores de texto
- `currentColor` - Para ícones e elementos que herdam cor

**NUNCA** usar cores hexadecimais ou textuais como fallback.

### **⚠️ DADOS DE TESTE**

**MANTER** dados mockados em:
- Arquivos de teste (`__tests__/`)
- Páginas de teste (`test-*.tsx`)
- Serviços de mock para desenvolvimento

---

## 📚 RECURSOS E REFERÊNCIAS

### **Arquivos de Referência:**

- `src/hooks/useTheme.ts` - Hook de tema principal
- `src/design-system/index.ts` - Sistema de design
- `src/config/default-colors.ts` - Cores padrão
- `src/components/shared/styles.ts` - Estilos compartilhados

### **Padrões a Seguir:**

- Usar `useSafeTheme` para acesso seguro ao tema
- Usar optional chaining (`?.`) sempre
- Implementar estados de loading para dados assíncronos
- Tratar erros de carregamento de dados

---

## 🎉 CONCLUSÃO

Este plano fornece uma estratégia sistemática para eliminar **TODAS** as cores hardcoded e dados mockados do sistema DOM. A execução deve ser feita de forma incremental, validando cada etapa antes de prosseguir.

**Estimativa Total:** 15-20 dias de trabalho focado

**Prioridade:** 🔴 CRÍTICA - Afeta consistência visual e confiabilidade dos dados

