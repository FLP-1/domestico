# DOM v2.4.0 - Instruções de Instalação

## 📦 Conteúdo do ZIP

Este arquivo ZIP contém o projeto completo DOM (Doméstico) versão 2.4.0, incluindo:

- ✅ Código fonte completo
- ✅ Estrutura de pastas
- ✅ Arquivos de configuração
- ✅ Documentação
- ✅ Scripts e utilitários

**NÃO inclui:**

- ❌ `node_modules` (instalar com `npm install`)
- ❌ `.next` (gerado no build)
- ❌ `.git` (histórico git)
- ❌ Arquivos temporários e de build

## 🚀 Instalação Rápida

### 1. Extrair o ZIP

```bash
# Extrair o arquivo DOM-v2.4.0.zip para uma pasta
# Exemplo: E:\DOM ou C:\projetos\dom
```

### 2. Instalar Dependências

```bash
cd E:\DOM  # ou o caminho onde extraiu
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dom_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Outras variáveis conforme necessário
```

### 4. Configurar Banco de Dados

```bash
# Gerar Prisma Client
npm run db:generate

# Executar migrations
npm run db:migrate

# (Opcional) Popular banco com dados iniciais
npm run db:seed
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:3000`

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm start                 # Inicia servidor de produção

# Qualidade de Código
npm run lint             # Verifica erros de lint
npm run lint:fix         # Corrige erros de lint automaticamente
npm run type-check       # Verifica tipos TypeScript
npm run format           # Formata código com Prettier

# Testes
npm run test             # Executa todos os testes
npm run test:unit        # Testes unitários
npm run test:integration # Testes de integração
npm run test:e2e         # Testes end-to-end

# Banco de Dados
npm run db:migrate       # Executa migrations
npm run db:generate      # Gera Prisma Client
npm run db:studio        # Abre Prisma Studio
npm run db:seed          # Popula banco com dados iniciais
```

## 🔧 Requisitos do Sistema

- **Node.js**: 18.x ou superior
- **npm**: 9.x ou superior
- **PostgreSQL**: 15.x ou superior
- **Git**: Para controle de versão (opcional)

## 📚 Documentação Adicional

Consulte a pasta `docs/` para documentação detalhada sobre:

- Estratégias e planos
- Guias de padronização
- Documentação técnica
- Guias de deploy

## 🌐 Repositório GitHub

Repositório oficial: https://github.com/FLP-1/domestico

Versão atual: **v2.4.0**

## ⚠️ Importante

1. **Não commite** o arquivo `.env` no git
2. **Instale as dependências** antes de executar (`npm install`)
3. **Configure o banco de dados** antes de executar migrations
4. **Verifique as variáveis de ambiente** antes de iniciar

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs do console
2. Consulte a documentação em `docs/`
3. Verifique se todas as dependências estão instaladas
4. Confirme que o banco de dados está configurado corretamente

---

**DOM v2.4.0** - Sistema de Gestão Doméstica  
Desenvolvido por FLP Business Strategy
