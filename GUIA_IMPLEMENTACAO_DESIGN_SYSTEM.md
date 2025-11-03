# Guia de Implementação: Sistema de Design e Configuração Dinâmica

**Data:** 30 de outubro de 2025  
**Autor:** Manus AI

---

## 1. Visão Geral

Este guia fornece instruções passo a passo para implementar o novo Sistema de Design e Configuração Dinâmica no projeto DOM. Siga as etapas na ordem apresentada para garantir uma implementação suave e sem erros.

## 2. Pré-requisitos

Antes de começar, certifique-se de que:

- ✅ O projeto DOM está funcionando localmente
- ✅ Você tem acesso ao banco de dados PostgreSQL
- ✅ Todas as dependências do npm estão instaladas
- ✅ Você tem um backup recente do banco de dados

## 3. Passo a Passo

### Passo 1: Extrair Arquivos da Refatoração

Extraia o arquivo `dom-refatoracao-design-system.tar.gz` na raiz do projeto:

```bash
cd /caminho/para/projeto/dom
tar -xzf dom-refatoracao-design-system.tar.gz
```

Isso criará/atualizará os seguintes arquivos:

- `prisma/migrations/add_config_tables/migration.sql`
- `prisma/seed-config.sql`
- `prisma/schema.prisma`
- `src/config/theme.ts`
- `src/services/themeService.ts`
- `src/components/ui/*`
- `src/pages/api/theme/active.ts`
- `docs/DESIGN_SYSTEM.md`
- `RELATORIO_REFATORACAO_DESIGN_SYSTEM.md`

### Passo 2: Aplicar Migrations do Prisma

Execute as migrations para criar as novas tabelas no banco de dados:

```bash
npx prisma migrate dev --name add_config_tables
```

Se houver erro, aplique manualmente a migration:

```bash
psql -U <usuario> -d <database> -a -f prisma/migrations/add_config_tables/migration.sql
```

### Passo 3: Popular Configurações Iniciais

Execute o script SQL para popular o banco com configurações padrão:

```bash
psql -U <usuario> -d <database> -a -f prisma/seed-config.sql
```

Ou, se preferir usar o Prisma Client:

```bash
npx prisma db seed
```

### Passo 4: Gerar Prisma Client

Regenere o Prisma Client para incluir os novos modelos:

```bash
npx prisma generate
```

### Passo 5: Instalar Dependências (se necessário)

Se você ainda não tem o `styled-components` instalado:

```bash
npm install styled-components
npm install --save-dev @types/styled-components
```

### Passo 6: Configurar ThemeProvider

Atualize o arquivo `src/pages/_app.tsx` para incluir o `ThemeProvider`:

```tsx
import { ThemeProvider } from 'styled-components';
import { theme } from '../config/theme';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
```

### Passo 7: Testar os Componentes

Crie uma página de teste para verificar se os componentes estão funcionando:

```tsx
// src/pages/test-components.tsx
import { Button, Input, Card, Modal } from '../components/ui';
import { useState } from 'react';

export default function TestComponents() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Teste de Componentes</h1>

      <h2>Botões</h2>
      <Button variant='primary'>Primário</Button>
      <Button variant='secondary'>Secundário</Button>
      <Button variant='success'>Sucesso</Button>
      <Button variant='error'>Erro</Button>

      <h2>Input</h2>
      <Input label='Nome' placeholder='Digite seu nome' fullWidth />

      <h2>Card</h2>
      <Card title='Título do Card' subtitle='Subtítulo'>
        Conteúdo do card
      </Card>

      <h2>Modal</h2>
      <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title='Modal de Teste'
      >
        Conteúdo do modal
      </Modal>
    </div>
  );
}
```

Acesse `http://localhost:3000/test-components` para testar.

### Passo 8: Migrar Componentes Existentes (Gradual)

Comece migrando os componentes mais usados para usar o sistema de tema. Exemplo:

**Antes:**

```tsx
const Button = styled.button`
  background: #29abe2;
  padding: 8px 16px;
  font-size: 16px;
`;
```

**Depois:**

```tsx
import { theme } from '../config/theme';

const Button = styled.button`
  background: ${theme.colors.primary.main};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
`;
```

### Passo 9: Substituir Componentes Duplicados

Identifique componentes duplicados (ex: múltiplos botões customizados) e substitua-os pelo componente da biblioteca UI:

**Antes:**

```tsx
<CustomButton onClick={handleClick}>Salvar</CustomButton>
```

**Depois:**

```tsx
import { Button } from '../components/ui';

<Button variant='primary' onClick={handleClick}>
  Salvar
</Button>;
```

### Passo 10: Testar em Produção

Antes de fazer deploy:

1. Execute os testes automatizados: `npm test`
2. Faça um build de produção: `npm run build`
3. Teste localmente: `npm start`
4. Verifique se não há erros no console do navegador

### Passo 11: Deploy

Faça o deploy seguindo o processo normal da Vercel:

```bash
git add .
git commit -m "feat: implementa sistema de design e configuração dinâmica"
git push origin main
```

Não esqueça de:

- ✅ Aplicar as migrations no banco de produção
- ✅ Executar o script `seed-config.sql` no banco de produção
- ✅ Verificar se as variáveis de ambiente estão configuradas

## 4. Verificação Pós-Implementação

Após a implementação, verifique:

- ✅ As novas tabelas foram criadas no banco de dados
- ✅ O tema padrão está ativo na tabela `TemaVisual`
- ✅ As configurações iniciais estão na tabela `ConfiguracaoSistema`
- ✅ O endpoint `/api/theme/active` retorna o tema corretamente
- ✅ Os componentes UI estão renderizando corretamente
- ✅ Não há erros no console do navegador
- ✅ Não há erros de tipo no TypeScript

## 5. Solução de Problemas

### Erro: "Cannot find module 'styled-components'"

**Solução:** Instale a dependência:

```bash
npm install styled-components
```

### Erro: "Table 'TemaVisual' does not exist"

**Solução:** Execute a migration:

```bash
npx prisma migrate dev
```

### Erro: "Theme is undefined"

**Solução:** Certifique-se de que o `ThemeProvider` está configurado em `_app.tsx`.

### Componentes não estão usando as cores do tema

**Solução:** Verifique se você está importando e usando o objeto `theme` corretamente:

```tsx
import { theme } from '../config/theme';
```

## 6. Suporte

Para dúvidas ou problemas, consulte:

- **Documentação:** `docs/DESIGN_SYSTEM.md`
- **Relatório:** `RELATORIO_REFATORACAO_DESIGN_SYSTEM.md`

---

**Boa implementação! 🚀**
