# 🚀 Guia de Componentes Genéricos Reutilizáveis

## 📋 Visão Geral

Este documento descreve os componentes genéricos criados para substituir elementos duplicados e otimizar a manutenção do código.

## 🎯 Componentes Disponíveis

### 1. UnifiedBadge

**Substitui:** `StatusBadge`, `VersionBadge`, `PermissionBadge`, `DueDateBadge`, `CategoryBadge`

**Uso:**
```tsx
import { UnifiedBadge } from '@/components/unified';

// Badge básico
<UnifiedBadge variant="success">Ativo</UnifiedBadge>

// Badge com ícone
<UnifiedBadge variant="warning" icon="⚠️" size="lg">
  Atenção
</UnifiedBadge>

// Badge outline
<UnifiedBadge variant="error" outline>
  Erro
</UnifiedBadge>

// Badge customizado
<UnifiedBadge customColor="#9b59b6" size="sm">
  Custom
</UnifiedBadge>

// Badge clicável
<UnifiedBadge 
  variant="info" 
  onClick={() => console.log('clicado')}
>
  Clique aqui
</UnifiedBadge>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'neutral'
- `size`: 'sm' | 'md' | 'lg'
- `outline`: boolean
- `customColor`: string
- `icon`: ReactNode
- `onClick`: () => void

---

### 2. UnifiedProgressBar

**Substitui:** `ProgressBar`, `ProgressFill` duplicados

**Uso:**
```tsx
import { UnifiedProgressBar } from '@/components/unified';

// Progress bar básico
<UnifiedProgressBar value={75} />

// Com variante e label
<UnifiedProgressBar 
  value={60} 
  variant="success" 
  showLabel 
  size="lg"
/>

// Com animação e cor customizada
<UnifiedProgressBar 
  value={45} 
  customColor="#9b59b6" 
  animated
  label="Carregando..."
/>
```

**Props:**
- `value`: number (0-100)
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'primary' | 'success' | 'warning' | 'error' | 'info'
- `customColor`: string
- `animated`: boolean
- `showLabel`: boolean
- `label`: string

---

### 3. UnifiedTabs

**Substitui:** `Tab`, `TabButton`, `ColumnHeader` duplicados

**Uso:**
```tsx
import { UnifiedTabs } from '@/components/unified';

// Tabs básico
<UnifiedTabs
  tabs={[
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Tabs com ícones e badges
<UnifiedTabs
  tabs={[
    { id: 'tab1', label: 'Tab 1', icon: '📊', badge: '5' },
    { id: 'tab2', label: 'Tab 2', icon: '⚙️' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
  size="lg"
/>

// Tabs underline
<UnifiedTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline"
/>
```

**Props:**
- `tabs`: TabItem[]
- `activeTab`: string
- `onTabChange`: (tabId: string) => void
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'pills' | 'underline'

**TabItem:**
- `id`: string
- `label`: string
- `icon`: ReactNode (opcional)
- `disabled`: boolean (opcional)
- `badge`: ReactNode (opcional)

---

### 4. UnifiedMetaInfo

**Substitui:** `MetaInfo`, `DocumentInfo`, `ListMeta`, `InfoItem` duplicados

**Uso:**
```tsx
import { UnifiedMetaInfo } from '@/components/unified';

// Meta info vertical
<UnifiedMetaInfo
  items={[
    { label: 'Criado em', value: '01/01/2024', icon: '📅' },
    { label: 'Modificado em', value: '02/01/2024', icon: '✏️' },
  ]}
  variant="vertical"
/>

// Meta info horizontal
<UnifiedMetaInfo
  items={[
    { label: 'Total', value: 'R$ 1.234,56' },
    { label: 'Itens', value: '42' },
  ]}
  variant="horizontal"
  size="sm"
/>

// Meta info em grid
<UnifiedMetaInfo
  items={items}
  variant="grid"
  showSeparators
/>
```

**Props:**
- `items`: MetaInfoItem[]
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'horizontal' | 'vertical' | 'grid'
- `showSeparators`: boolean

**MetaInfoItem:**
- `label`: string
- `value`: ReactNode
- `icon`: ReactNode (opcional)

---

## 📊 Migração de Componentes Duplicados

### Exemplo 1: StatusBadge → UnifiedBadge

**Antes:**
```tsx
const StatusBadge = styled.span<{ $status: string; $theme?: Theme }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'active':
        return props.$theme?.colors?.success || '#28a745';
      case 'inactive':
        return props.$theme?.colors?.error || '#dc3545';
      default:
        return '#6c757d';
    }
  }};
  color: white;
`;

// Uso
<StatusBadge $status="active" $theme={theme}>
  Ativo
</StatusBadge>
```

**Depois:**
```tsx
import { UnifiedBadge } from '@/components/unified';

// Uso
<UnifiedBadge variant="success" theme={theme}>
  Ativo
</UnifiedBadge>
```

### Exemplo 2: ProgressBar → UnifiedProgressBar

**Antes:**
```tsx
const ProgressBar = styled.div<{ $theme?: Theme }>`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $theme?: Theme }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

// Uso
<ProgressBar $theme={theme}>
  <ProgressFill $progress={75} $theme={theme} />
</ProgressBar>
```

**Depois:**
```tsx
import { UnifiedProgressBar } from '@/components/unified';

// Uso
<UnifiedProgressBar value={75} theme={theme} />
```

### Exemplo 3: Tabs → UnifiedTabs

**Antes:**
```tsx
const TabButton = styled.button<{ $active?: boolean; $theme?: Theme }>`
  padding: 1rem 2rem;
  border: none;
  background: ${props =>
    props.$active ? props.$theme?.colors?.primary || '#29ABE2' : 'transparent'};
  color: ${props =>
    props.$active ? 'white' : props.$theme?.colors?.text?.secondary || '#666'};
  // ... mais estilos
`;

// Uso
<TabButton $active={activeTab === 'tab1'} $theme={theme} onClick={() => setActiveTab('tab1')}>
  Tab 1
</TabButton>
```

**Depois:**
```tsx
import { UnifiedTabs } from '@/components/unified';

// Uso
<UnifiedTabs
  tabs={[
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  theme={theme}
/>
```

---

## ✅ Benefícios

1. **Redução de Código**: Elimina duplicação de styled-components
2. **Manutenção Fácil**: Mudanças em um único lugar
3. **Consistência**: Visual e comportamento uniforme
4. **Type Safety**: TypeScript completo com tipos exportados
5. **Flexibilidade**: Suporta customização via props
6. **Performance**: Componentes otimizados e reutilizáveis

---

## 🔄 Checklist de Migração

Para cada arquivo com componentes duplicados:

- [ ] Identificar componentes duplicados (Badge, ProgressBar, Tabs, MetaInfo)
- [ ] Importar componente genérico correspondente
- [ ] Substituir styled-component local pelo componente genérico
- [ ] Ajustar props conforme necessário
- [ ] Remover styled-component local não utilizado
- [ ] Testar visualmente e funcionalmente
- [ ] Verificar se há outros usos do mesmo padrão no arquivo

---

## 📝 Notas Importantes

1. **Tema**: Todos os componentes genéricos aceitam `theme` como prop opcional
2. **Customização**: Use `customColor` quando necessário, mas prefira variantes padrão
3. **Acessibilidade**: Componentes já incluem suporte a acessibilidade
4. **Responsividade**: Componentes são responsivos por padrão
5. **Performance**: Componentes são otimizados com memo quando necessário

---

## 🚀 Próximos Passos

1. Migrar componentes duplicados em `src/pages/`
2. Migrar componentes duplicados em `src/components/`
3. Atualizar documentação de componentes
4. Adicionar testes unitários para componentes genéricos

