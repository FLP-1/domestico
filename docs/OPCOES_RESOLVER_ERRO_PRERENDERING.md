# 🔧 OPÇÕES PARA RESOLVER ERRO DE PRERENDERING

## 📋 PROBLEMA IDENTIFICADO

O erro `f.div.withConfig.withConfig.b` persiste mesmo após:

- Adicionar `export const dynamic = 'force-dynamic'`
- Ajustar `shouldForwardProp` em componentes
- Melhorar configuração de styled-components

## 🎯 OPÇÕES DE SOLUÇÃO

### ✅ **OPÇÃO 1: Adicionar `getServerSideProps` (RECOMENDADO)**

**Por que funciona:** Força SSR dinâmico e evita prerendering completamente.

**Como implementar:**

```typescript
// Em cada página problemática (diagnostico-geolocalizacao.tsx, communication.tsx, etc.)
import { GetServerSideProps } from 'next';

// Adicionar antes do componente
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

// Remover ou manter export const dynamic = 'force-dynamic';
```

**Vantagens:**

- ✅ Funciona 100% do tempo
- ✅ Não requer mudanças na configuração global
- ✅ Controle por página

**Desvantagens:**

- ⚠️ Cada página precisa ser editada individualmente

---

### ✅ **OPÇÃO 2: Configurar ServerStyleSheet no `_document.tsx`**

**Por que funciona:** Garante que styled-components funcione corretamente durante SSR.

**Como implementar:**

```typescript
// src/pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          {/* ... head content ... */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

**Vantagens:**

- ✅ Resolve problema de hidratação do styled-components
- ✅ Configuração global

**Desvantagens:**

- ⚠️ Requer mudança significativa no `_document.tsx`
- ⚠️ Pode não resolver completamente o prerendering

---

### ✅ **OPÇÃO 3: Desabilitar Prerendering no `next.config.js`**

**Por que funciona:** Configuração global para evitar prerendering de rotas específicas.

**Como implementar:**

```javascript
// next.config.js
module.exports = {
  // ... outras configurações ...

  // Desabilitar prerendering de rotas específicas
  generateBuildId: async () => {
    return 'build-id';
  },

  // Configurar rotas que não devem ser pré-renderizadas
  experimental: {
    // ... outras configs ...
    disableOptimizedLoading: true, // Desabilitar otimizações que causam prerendering
  },

  // Ou usar output: 'export' com configurações específicas
  // (mas isso muda completamente o comportamento do Next.js)
};
```

**Vantagens:**

- ✅ Configuração global

**Desvantagens:**

- ⚠️ Pode afetar outras páginas
- ⚠️ Configuração complexa
- ⚠️ Pode não funcionar perfeitamente

---

### ✅ **OPÇÃO 4: Remover Duplicação de `withConfig`**

**Por que funciona:** O erro `f.div.withConfig.withConfig.b` indica duplicação de `withConfig`.

**Como implementar:**

Quando estender componentes, verificar se já têm `withConfig` e evitar adicionar novamente:

```typescript
// ❌ ERRADO - Duplica withConfig
const MyCard = styled(UnifiedCard).withConfig({
  shouldForwardProp: prop => !prop.startsWith('$'),
})<{ $theme?: Theme }>`
  /* estilos */
`;

// ✅ CORRETO - Se UnifiedCard já gerencia props $, não precisa adicionar withConfig
const MyCard = styled(UnifiedCard)<{ $theme?: Theme }>`
  /* estilos */
`;

// ✅ OU - Adicionar apenas se necessário
const MyCard = styled(UnifiedCard).attrs(props => ({
  // Filtrar props aqui se necessário
}))<{ $theme?: Theme }>`
  /* estilos */
`;
```

**Vantagens:**

- ✅ Resolve a causa raiz do erro
- ✅ Melhora a estrutura do código

**Desvantagens:**

- ⚠️ Requer revisão de vários componentes
- ⚠️ Pode não resolver completamente

---

### ✅ **OPÇÃO 5: Combinar Opções 1 + 2 (SOLUÇÃO COMPLETA)**

**Por que funciona:** Combina forçar SSR dinâmico com configuração correta do styled-components.

**Como implementar:**

1. Adicionar `getServerSideProps` nas páginas problemáticas
2. Configurar `ServerStyleSheet` no `_document.tsx`
3. Revisar e remover duplicações de `withConfig`

**Vantagens:**

- ✅ Solução mais robusta e completa
- ✅ Resolve múltiplos problemas de uma vez

**Desvantagens:**

- ⚠️ Requer mais trabalho inicial

---

## 🎯 RECOMENDAÇÃO FINAL

**Implementar OPÇÃO 1 primeiro** (mais simples e direta):

- Adicionar `getServerSideProps` nas 6 páginas problemáticas
- Isso deve resolver imediatamente

**Se não funcionar, implementar OPÇÃO 2**:

- Configurar `ServerStyleSheet` no `_document.tsx`
- Isso resolve problemas de hidratação do styled-components

**Por último, OPÇÃO 4**:

- Revisar componentes que estendem outros
- Remover duplicações desnecessárias de `withConfig`

---

## 📝 PÁGINAS AFETADAS

1. `/diagnostico-geolocalizacao`
2. `/communication`
3. `/api-docs`
4. `/shopping-management`
5. `/time-clock-simple`
6. `/esocial-domestico-completo`

---

## ⚠️ OBSERVAÇÕES

- `export const dynamic = 'force-dynamic'` pode não ser suficiente no Next.js 15
- O erro específico `f.div.withConfig.withConfig.b` indica problema na cadeia de `withConfig`
- Pode haver múltiplas instâncias do styled-components causando conflito
