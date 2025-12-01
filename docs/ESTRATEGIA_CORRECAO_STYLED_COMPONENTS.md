# 🎯 Estratégia de Correção de Styled Components

## 📋 Problema Identificado

Styled components que usam props com prefixo `$` (transient props) precisam ter `shouldForwardProp` configurado para evitar que essas props sejam passadas para o DOM durante o SSR (Server-Side Rendering), causando erros de prerendering.

**Erro típico:**

```
Error: An error occurred. See https://git.io/JUIaE#12
Error occurred prerendering page "/..."
```

## 🔍 Causa Raiz

Quando um styled component recebe uma prop com `$` (ex: `$theme`, `$selected`), o styled-components tenta passar essa prop para o elemento DOM subjacente. Durante o SSR, isso causa erros porque:

1. Props com `$` são **transient props** - devem ser usadas apenas para estilização
2. Sem `shouldForwardProp`, essas props são passadas para o DOM
3. O DOM não reconhece essas props, causando erros durante o prerendering

## ✅ Solução

Adicionar `shouldForwardProp` a todos os styled components que usam props com `$`:

```typescript
// ❌ ANTES (causa erro de prerendering)
const Component = styled.div<{ $theme?: Theme }>`
  color: ${props => props.$theme?.colors?.text?.primary};
`;

// ✅ DEPOIS (correto)
const Component = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  color: ${props => props.$theme?.colors?.text?.primary};
`;
```

## 🚀 Estratégia para Evitar Retrabalho

### 1. **Script de Verificação Automática**

Criamos o script `scripts/check-styled-components.ps1` que identifica todos os styled components que precisam de correção:

```powershell
# Executar antes de cada build
.\scripts\check-styled-components.ps1
```

**O que o script faz:**

- Busca todos os arquivos `.tsx` e `.ts` em `src/`
- Identifica styled components com props `$` mas sem `shouldForwardProp`
- Lista todos os componentes que precisam de correção
- Retorna código de saída 1 se houver problemas

### 2. **Padrão de Correção Sistêmica**

Quando um erro é identificado em um arquivo:

1. **Análise Completa do Arquivo**
   - Buscar TODOS os styled components no arquivo
   - Verificar quais usam props com `$`
   - Verificar quais já têm `shouldForwardProp`
   - Corrigir TODOS de uma vez

2. **Não Corrigir Iterativamente**
   - ❌ Corrigir um componente, testar, corrigir outro
   - ✅ Identificar todos, corrigir todos, testar uma vez

3. **Verificação Pós-Correção**
   - Executar o script de verificação
   - Executar `npm run build`
   - Verificar se não há novos erros

### 3. **Template para Novos Styled Components**

Ao criar novos styled components, sempre usar o padrão:

```typescript
// Template padrão
const ComponentName = styled.elementType.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $prop1?: Type1; $prop2?: Type2 }>`
  /* estilos */
`;
```

### 4. **Checklist de Validação**

Antes de considerar um arquivo "corrigido":

- [ ] Todos os styled components com props `$` têm `shouldForwardProp`
- [ ] Script de verificação não reporta problemas
- [ ] Build compila sem erros de prerendering
- [ ] Linter não reporta erros de tipo
- [ ] Não há cores hardcoded
- [ ] Não há acessos diretos a `props.$theme?.colors?.*` sem type guards

## 📊 Estatísticas de Correção

### Arquivos Corrigidos (até agora):

1. ✅ `src/components/PageContainer/index.tsx` - 3 componentes
2. ✅ `src/components/PageHeader/index.tsx` - 4 componentes
3. ✅ `src/pages/api-docs.tsx` - 2 componentes
4. ✅ `src/pages/diagnostico-geolocalizacao.tsx` - 11 componentes
5. ✅ `src/pages/communication.tsx` - 6 componentes
6. ✅ `src/pages/shopping-management.tsx` - 16 componentes

**Total: 42 styled components corrigidos**

## 🔧 Como Usar o Script

```powershell
# Executar verificação
cd E:\DOM
.\scripts\check-styled-components.ps1

# Se houver problemas, o script lista todos os componentes que precisam de correção
# Corrigir todos de uma vez no arquivo
# Executar novamente para verificar
```

## ⚠️ Pontos de Atenção

1. **Styled Components Baseados em Outros Componentes**

   ```typescript
   // Também precisa de shouldForwardProp
   const MyCard = styled(UnifiedCard).withConfig({
     shouldForwardProp: (prop) => {
       const propName = prop as string;
       return !propName.startsWith('$');
     },
   })<{ $theme?: Theme }>`
   ```

2. **Styled Components com Múltiplas Props `$`**

   ```typescript
   // Funciona para todas as props com $
   const Component = styled.div.withConfig({
     shouldForwardProp: (prop) => {
       const propName = prop as string;
       return !propName.startsWith('$'); // Bloqueia TODAS as props com $
     },
   })<{ $theme?: Theme; $selected?: boolean; $active?: boolean }>`
   ```

3. **Props que DEVEM ser passadas para o DOM**
   ```typescript
   // Se uma prop com $ DEVE ser passada (raro), use verificação específica
   const Component = styled.div.withConfig({
     shouldForwardProp: (prop) => {
       const propName = prop as string;
       // Bloqueia $theme mas permite $data-testid
       return propName !== '$theme' && propName !== '$selected';
     },
   })<{ $theme?: Theme; $selected?: boolean; 'data-testid'?: string }>`
   ```

## 📝 Próximos Passos

1. Executar o script em todo o projeto para identificar componentes restantes
2. Corrigir todos os componentes identificados de uma vez
3. Adicionar o script ao CI/CD para prevenir regressões
4. Documentar o padrão no guia de estilo do projeto

---

**Última atualização:** 2025-01-XX  
**Autor:** Manus AI
