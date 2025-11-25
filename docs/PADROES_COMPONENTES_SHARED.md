# 📚 PADRÕES DE COMPONENTES COMPARTILHADOS

## 🎯 **OBJETIVO**

Documentar os padrões estabelecidos para uso de componentes compartilhados, animações e tokens centralizados.

---

## 🎬 **ANIMAÇÕES CENTRALIZADAS**

### **Localização:**
`src/components/shared/animations.ts`

### **Uso:**

```typescript
import { fadeIn, pulse, slideInLeft, bounce } from '../components/shared/animations';

// Em styled-components
const MyComponent = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;

// Com helper para animação completa
import { createAnimation, animationDurations, animationTimings } from '../components/shared/animations';

const MyComponent = styled.div`
  animation: ${createAnimation(fadeIn, 'normal', 'easeOut')};
`;
```

### **Animações Disponíveis:**

#### **Entrada:**
- `fadeIn` - Aparece suavemente de baixo para cima
- `fadeInUp` - Versão com mais movimento vertical
- `fadeOut` - Desaparece suavemente
- `slideInRight` - Desliza da direita
- `slideInLeft` - Desliza da esquerda
- `slideOutRight` - Desliza para direita (sai)
- `slideOutLeft` - Desliza para esquerda (sai)

#### **Escala:**
- `pulse` - Pulso suave
- `pulseStrong` - Pulso mais forte
- `scaleIn` - Aparece com escala
- `scaleOut` - Desaparece com escala

#### **Movimento:**
- `bounce` - Salto suave
- `float` - Flutuação vertical
- `floatSlow` - Flutuação lenta
- `shake` - Tremor horizontal

#### **Rotação:**
- `spin` - Rotação contínua
- `rotate` - Rotação com escala

#### **Compostas:**
- `fadeInScale` - Combina fade e scale
- `slideFadeIn` - Combina slide e fade

### **Helpers:**

```typescript
// Durações padrão
animationDurations.fast   // '0.2s'
animationDurations.normal // '0.3s'
animationDurations.slow   // '0.6s'
animationDurations.slower // '1s'

// Timing functions
animationTimings.ease      // 'ease'
animationTimings.easeOut   // 'ease-out'
animationTimings.bounce    // 'cubic-bezier(0.4, 0, 0.2, 1)'

// Criar animação completa
createAnimation(fadeIn, 'normal', 'easeOut')
```

---

## 🎨 **TOKENS EXPANDIDOS**

### **Localização:**
`src/components/shared/tokens.ts`

### **Novos Tokens Adicionados:**

#### **Durações de Animação:**
```typescript
tokens.animationDurations = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.6s',
  slower: '1s',
}
```

#### **Timing Functions:**
```typescript
tokens.animationTimings = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  bounce: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
}
```

### **Helpers:**

```typescript
import { getAnimationDuration, getAnimationTiming } from '../components/shared/tokens';

const duration = getAnimationDuration('normal'); // '0.3s'
const timing = getAnimationTiming('easeOut');   // 'ease-out'
```

---

## 🧩 **COMPONENTES AUXILIARES OPCIONAIS**

### **Localização:**
`src/components/shared/page-components.ts`

### **⚠️ IMPORTANTE:**
Estes componentes são **OPCIONAIS** e **NÃO substituem** componentes existentes. Podem ser usados por:
- Novas páginas
- Migração gradual de páginas existentes
- Casos específicos onde UnifiedCard/UnifiedButton não se adequam

### **Componentes Disponíveis:**

#### **Containers e Layouts:**

```typescript
import { PageSection, ContentGrid, FlexRow, FlexColumn } from '../components/shared/page-components';

// PageSection - Seção de conteúdo padronizada
<PageSection $theme={theme}>
  {/* Conteúdo */}
</PageSection>

// ContentGrid - Grid responsivo
<ContentGrid $columns={3} $gap="lg" $theme={theme}>
  {/* Itens do grid */}
</ContentGrid>

// FlexRow - Linha flexível
<FlexRow $gap="md" $align="center" $justify="space-between">
  {/* Elementos */}
</FlexRow>

// FlexColumn - Coluna flexível
<FlexColumn $gap="md" $align="stretch">
  {/* Elementos */}
</FlexColumn>
```

#### **Tipografia:**

```typescript
import { PageTitle, PageSubtitle, SectionTitle, BodyText } from '../components/shared/page-components';

// PageTitle - Título principal
<PageTitle $theme={theme} $size="lg">
  Título da Página
</PageTitle>

// PageSubtitle - Subtítulo
<PageSubtitle $theme={theme}>
  Descrição da página
</PageSubtitle>

// SectionTitle - Título de seção
<SectionTitle $theme={theme} $size="md">
  Seção
</SectionTitle>

// BodyText - Texto de corpo
<BodyText $theme={theme} $variant="primary">
  Texto do parágrafo
</BodyText>
```

#### **Cards e Containers:**

```typescript
import { CardContainer, InfoBox } from '../components/shared/page-components';

// CardContainer - Card simples
<CardContainer $theme={theme} $variant="elevated" $padding="lg">
  {/* Conteúdo */}
</CardContainer>

// InfoBox - Caixa de informação
<InfoBox $theme={theme} $variant="info">
  Informação importante
</InfoBox>
```

#### **Separadores:**

```typescript
import { Divider, Spacer } from '../components/shared/page-components';

// Divider - Linha divisória
<Divider $theme={theme} $variant="solid" />

// Spacer - Espaçador
<Spacer $size="xl" />
```

#### **Estados:**

```typescript
import { LoadingContainer, EmptyState } from '../components/shared/page-components';

// LoadingContainer - Estado de carregamento
<LoadingContainer $theme={theme}>
  Carregando...
</LoadingContainer>

// EmptyState - Estado vazio
<EmptyState $theme={theme}>
  Nenhum dado disponível
</EmptyState>
```

---

## 📋 **REGRAS DE USO**

### **✅ QUANDO USAR:**

1. **Animações centralizadas:**
   - ✅ Sempre que precisar de animação
   - ✅ Importar de `shared/animations.ts`
   - ✅ Não criar animações customizadas sem necessidade

2. **Tokens:**
   - ✅ Sempre usar helpers (`getSpacing`, `getFontSize`, etc.)
   - ✅ Não usar valores hardcoded
   - ✅ Usar tokens para espaçamento, cores, sombras

3. **Componentes auxiliares:**
   - ✅ Novas páginas podem usar livremente
   - ✅ Migração gradual de páginas existentes
   - ✅ Quando UnifiedCard/UnifiedButton não se adequam

### **❌ QUANDO NÃO USAR:**

1. **Componentes auxiliares:**
   - ❌ Não substituir UnifiedCard se ele atende
   - ❌ Não substituir UnifiedButton se ele atende
   - ❌ Não criar variações desnecessárias

2. **Animações:**
   - ❌ Não criar animações duplicadas
   - ❌ Não definir animações inline em páginas

---

## 🔄 **MIGRAÇÃO GRADUAL**

### **Passo 1: Substituir Animações**

```typescript
// ❌ ANTES
const fadeIn = keyframes`...`;

// ✅ DEPOIS
import { fadeIn } from '../components/shared/animations';
```

### **Passo 2: Usar Tokens**

```typescript
// ❌ ANTES
padding: 1rem;
font-size: 1.25rem;

// ✅ DEPOIS
import { getSpacing, getFontSize } from '../components/shared/tokens';
padding: ${getSpacing('md')};
font-size: ${getFontSize('lg')};
```

### **Passo 3: Usar Componentes Auxiliares (Opcional)**

```typescript
// ❌ ANTES
const Container = styled.div`...`;
const Title = styled.h1`...`;

// ✅ DEPOIS (opcional)
import { PageSection, PageTitle } from '../components/shared/page-components';
```

---

## 📊 **BENEFÍCIOS**

### **Animações Centralizadas:**
- ✅ Elimina ~60 duplicações
- ✅ Consistência visual garantida
- ✅ Fácil manutenção

### **Tokens Expandidos:**
- ✅ Base sólida para padronização
- ✅ Valores consistentes
- ✅ Fácil ajuste global

### **Componentes Auxiliares:**
- ✅ Opção disponível sem quebrar código existente
- ✅ Facilita criação de novas páginas
- ✅ Migração gradual possível

---

## ⚠️ **ALERTAS**

1. **Não substituir componentes existentes:**
   - PageContainer, PageHeader, UnifiedCard continuam funcionando
   - Componentes auxiliares são complementares

2. **Migração gradual:**
   - Não precisa migrar tudo de uma vez
   - Páginas antigas continuam funcionando
   - Migrar quando fizer sentido

3. **Prioridade:**
   - Usar UnifiedCard/UnifiedButton quando possível
   - Componentes auxiliares são para casos específicos

---

## 📝 **PRÓXIMOS PASSOS**

1. ✅ Fase 1 concluída - Fundação estabelecida
2. ⏭️ Fase 2 - Melhorar componentes existentes
3. ⏭️ Fase 3 - Migração gradual de páginas

