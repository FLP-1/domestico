# Guia do Sistema de Design e Configuração Dinâmica

**Data:** 30 de outubro de 2025  
**Autor:** Manus AI  
**Versão:** 1.0

---

## 1. Visão Geral

Este documento descreve a arquitetura e o uso do novo **Sistema de Design e Configuração Dinâmica** implementado no projeto DOM. A refatoração teve como objetivo principal eliminar dados hardcoded, centralizar todas as variáveis de design e configuração, e criar uma base de componentes reutilizáveis, resultando em maior consistência visual, manutenibilidade e agilidade no desenvolvimento.

O sistema é composto por três pilares principais:

1.  **Configuração no Banco de Dados:** Todas as configurações, de cores a constantes da aplicação, são armazenadas no banco de dados PostgreSQL, permitindo mudanças dinâmicas sem a necessidade de deploy.
2.  **Sistema de Tema Centralizado:** Um arquivo `theme.ts` define todos os *design tokens* (cores, fontes, espaçamentos, etc.), que são consumidos em toda a aplicação.
3.  **Biblioteca de Componentes Reutilizáveis:** Um conjunto de componentes UI (`Button`, `Input`, `Card`, `Modal`) foi criado para garantir consistência e acelerar o desenvolvimento de novas telas.

## 2. Arquitetura da Configuração

A configuração dinâmica é gerenciada por novas tabelas no banco de dados, definidas no `prisma/schema.prisma`.

### 2.1. Modelos do Prisma

| Tabela | Propósito |
| :--- | :--- |
| `ConfiguracaoSistema` | Armazena pares chave-valor para configurações globais (ex: `MAX_FILE_SIZE`). |
| `TemaVisual` | Armazena temas visuais completos em formato JSONB, incluindo cores, tipografia, etc. |
| `ComponenteReutilizavel` | Cataloga os componentes reutilizáveis, permitindo um futuro *Storybook* dinâmico. |
| `ConstanteAplicacao` | Armazena constantes que podem variar por ambiente (dev/prod), como URLs de API. |
| `HistoricoConfiguracao` | Registra todas as alterações feitas nas configurações para fins de auditoria. |

### 2.2. Serviços de Gerenciamento

Dois serviços principais foram criados para interagir com os dados de configuração:

-   **`src/services/configService.ts`**: Gerencia as tabelas `ConfiguracaoSistema` e `ConstanteAplicacao`. Inclui cache em memória para otimizar a performance.
-   **`src/services/themeService.ts`**: Gerencia a tabela `TemaVisual`, incluindo a lógica para obter o tema ativo, salvar novos temas e listar os disponíveis.

## 3. Sistema de Tema (Design Tokens)

O coração do sistema de design é o arquivo `src/config/theme.ts`. Ele exporta um objeto `theme` que contém todos os *design tokens* da aplicação, eliminando a necessidade de valores mágicos (ex: `#FFFFFF`, `16px`) no código dos componentes.

### 3.1. Estrutura do Tema

O objeto `theme` é estruturado da seguinte forma:

```typescript
export const theme = {
  colors,       // Paleta de cores completa
  typography,   // Fontes, tamanhos, pesos
  spacing,      // Espaçamentos (padding, margin)
  shadows,      // Sombras para elevação
  borders,      // Raios e espessuras de borda
  breakpoints,  // Pontos de quebra para responsividade
  zIndex,       // Pilha de elementos (modais, popovers)
  transitions,  // Durações e curvas de animação
} as const;
```

### 3.2. Usando o Tema nos Componentes

Para consumir o tema, utilize o provedor `ThemeProvider` do `styled-components` na raiz da sua aplicação (`_app.tsx`) e o hook `useTheme`.

**Exemplo em `_app.tsx`:**

```tsx
import { ThemeProvider } from 'styled-components';
import { useTheme } from '../hooks/useTheme';

function MyApp({ Component, pageProps }) {
  const theme = useTheme(); // Busca o tema ativo (do DB ou padrão)

  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### 3.3. API de Tema

Um endpoint foi criado em `src/pages/api/theme/active.ts` para fornecer o tema ativo ao frontend. O hook `useTheme` consome este endpoint para carregar o tema dinamicamente.

## 4. Biblioteca de Componentes UI

Uma biblioteca de componentes reutilizáveis foi criada em `src/components/ui/`. Todos os componentes são construídos sobre o sistema de tema e são totalmente customizáveis via props.

### 4.1. Componentes Disponíveis

-   **`Button`**: Botão com variantes, tamanhos, estado de loading e suporte a ícones.
-   **`Input`**: Campo de texto com label, erro, texto de ajuda e suporte a ícones.
-   **`Card`**: Contêiner para agrupar conteúdo com variantes de estilo.
-   **`Modal`**: Janela modal com título, footer e gerenciamento de estado.

### 4.2. Exemplo de Uso: `Button`

```tsx
import { Button } from 'src/components/ui';

const MyComponent = () => (
  <div>
    <Button 
      variant="primary" 
      size="lg" 
      onClick={() => alert('Clicado!')}
    >
      Botão Primário Grande
    </Button>

    <Button 
      variant="error" 
      loading={true}
    >
      Excluindo...
    </Button>

    <Button 
      variant="ghost" 
      icon={<Icon name="add" />}
    >
      Adicionar Item
    </Button>
  </div>
);
```

### 4.3. Exemplo de Uso: `Input`

```tsx
import { Input } from 'src/components/ui';
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, formState: { errors } } = useForm();

  return (
    <Input
      label="Nome Completo"
      placeholder="Digite seu nome"
      fullWidth
      error={errors.name?.message}
      {...register('name', { required: 'Campo obrigatório' })}
    />
  );
};
```

## 5. Gerenciamento e Manutenção

### 5.1. Populando as Configurações Iniciais

Um script SQL foi criado em `prisma/seed-config.sql` para popular o banco de dados com o tema padrão e as configurações iniciais do sistema. **Execute este script após aplicar as migrations do Prisma.**

```bash
# Exemplo de execução com psql
psql -U <user> -d <database> -a -f prisma/seed-config.sql
```

### 5.2. Customizando o Tema

Para alterar o tema visual da aplicação:

1.  **Via Banco de Dados:** Altere os valores JSON na tabela `TemaVisual`. As alterações serão refletidas após o TTL do cache (5 minutos) ou após uma reinicialização do servidor.
2.  **Via Código:** Modifique o arquivo `src/config/theme.ts` para alterar o tema padrão.

### 5.3. Criando Novos Componentes

Ao criar novos componentes, siga o padrão estabelecido na pasta `src/components/ui/`:

-   Utilize `styled-components`.
-   Consuma os *design tokens* do objeto `theme` (ex: `theme.colors.primary.main`).
-   Exponha uma interface de `props` clara e bem definida.
-   Exporte o componente e seus tipos no `src/components/ui/index.ts`.

## 6. Conclusão

Esta refatoração estabelece uma base sólida e escalável para o design e a configuração do projeto DOM. Ao centralizar as definições visuais e de configuração, o sistema se torna mais fácil de manter, customizar e expandir, garantindo uma experiência de usuário consistente e um processo de desenvolvimento mais eficiente.
